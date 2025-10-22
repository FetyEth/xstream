import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);

export interface HLSConversionOptions {
  outputDir: string;
  qualities?: Array<{
    name: string;
    width: number;
    height: number;
    bitrate: string;
  }>;
  segmentDuration?: number;
}

export interface HLSConversionResult {
  masterPlaylist: string;
  qualities: Array<{
    name: string;
    playlist: string;
    segments: string[];
  }>;
  outputDir: string;
}

const DEFAULT_QUALITIES = [
  { name: '240p', width: 426, height: 240, bitrate: '400k' },
  { name: '480p', width: 854, height: 480, bitrate: '1000k' },
  { name: '720p', width: 1280, height: 720, bitrate: '2500k' },
  { name: '1080p', width: 1920, height: 1080, bitrate: '5000k' },
];

/**
 * Convert a video file to HLS format with multiple quality levels
 * @param inputPath - Path to the input video file
 * @param options - HLS conversion options
 * @returns Promise resolving to HLS conversion result
 */
export async function convertToHLS(
  inputPath: string,
  options: HLSConversionOptions
): Promise<HLSConversionResult> {
  const { outputDir, qualities = DEFAULT_QUALITIES, segmentDuration = 6 } = options;

  // Create output directory
  await mkdir(outputDir, { recursive: true });

  const result: HLSConversionResult = {
    masterPlaylist: path.join(outputDir, 'master.m3u8'),
    qualities: [],
    outputDir,
  };

  // Get video info to determine which qualities to generate
  const videoInfo = await getVideoInfo(inputPath);
  const sourceHeight = videoInfo.height;

  // Filter qualities based on source video height
  const availableQualities = qualities.filter(q => q.height <= sourceHeight);

  console.log(`🎬 Converting video to HLS with ${availableQualities.length} quality levels...`);

  // Convert each quality level
  for (const quality of availableQualities) {
    console.log(`📹 Processing ${quality.name} (${quality.width}x${quality.height})...`);
    
    const qualityDir = path.join(outputDir, quality.name);
    await mkdir(qualityDir, { recursive: true });

    const playlistPath = path.join(qualityDir, 'playlist.m3u8');
    const segmentPattern = path.join(qualityDir, 'segment%03d.ts');

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          `-c:v libx264`,
          `-c:a aac`,
          `-b:v ${quality.bitrate}`,
          `-b:a 128k`,
          `-vf scale=${quality.width}:${quality.height}`,
          `-f hls`,
          `-hls_time ${segmentDuration}`,
          `-hls_playlist_type vod`,
          `-hls_segment_filename ${segmentPattern}`,
        ])
        .output(playlistPath)
        .on('start', (cmd) => {
          console.log(`FFmpeg command: ${cmd}`);
        })
        .on('progress', (progress) => {
          console.log(`${quality.name}: ${progress.percent?.toFixed(1)}% complete`);
        })
        .on('end', () => {
          console.log(`✅ ${quality.name} conversion complete`);
          resolve();
        })
        .on('error', (err) => {
          console.error(`❌ Error converting ${quality.name}:`, err);
          reject(err);
        })
        .run();
    });

    // Get list of segments
    const segments = (await readdir(qualityDir))
      .filter(file => file.endsWith('.ts'))
      .map(file => path.join(qualityDir, file));

    result.qualities.push({
      name: quality.name,
      playlist: playlistPath,
      segments,
    });
  }

  // Generate master playlist
  await generateMasterPlaylist(result);

  console.log('✅ HLS conversion complete!');
  return result;
}

/**
 * Generate master playlist that references all quality levels
 */
async function generateMasterPlaylist(result: HLSConversionResult): Promise<void> {
  let masterContent = '#EXTM3U\n#EXT-X-VERSION:3\n\n';

  for (const quality of result.qualities) {
    const qualityName = quality.name;
    const qualityDir = path.basename(path.dirname(quality.playlist));
    const bandwidth = getBandwidthForQuality(qualityName);
    const resolution = getResolutionForQuality(qualityName);

    masterContent += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n`;
    masterContent += `${qualityDir}/playlist.m3u8\n\n`;
  }

  await fs.promises.writeFile(result.masterPlaylist, masterContent);
  console.log('✅ Master playlist generated');
}

/**
 * Get video information
 */
function getVideoInfo(inputPath: string): Promise<{ width: number; height: number; duration: number }> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      if (!videoStream) {
        reject(new Error('No video stream found'));
        return;
      }

      resolve({
        width: videoStream.width || 0,
        height: videoStream.height || 0,
        duration: metadata.format.duration || 0,
      });
    });
  });
}

/**
 * Get bandwidth for quality level (bits per second)
 */
function getBandwidthForQuality(quality: string): number {
  const bandwidthMap: Record<string, number> = {
    '240p': 500000,
    '480p': 1200000,
    '720p': 3000000,
    '1080p': 6000000,
  };
  return bandwidthMap[quality] || 1000000;
}

/**
 * Get resolution string for quality level
 */
function getResolutionForQuality(quality: string): string {
  const resolutionMap: Record<string, string> = {
    '240p': '426x240',
    '480p': '854x480',
    '720p': '1280x720',
    '1080p': '1920x1080',
  };
  return resolutionMap[quality] || '854x480';
}

/**
 * Clean up HLS files (remove all segments and playlists)
 */
export async function cleanupHLS(outputDir: string): Promise<void> {
  try {
    await fs.promises.rm(outputDir, { recursive: true, force: true });
    console.log('✅ HLS files cleaned up');
  } catch (error) {
    console.error('❌ Error cleaning up HLS files:', error);
  }
}
