import { storageService } from './storage';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import os from 'os';

const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);

interface HLSQuality {
  name: string;
  width: number;
  height: number;
  bitrate: string;
}

const DEFAULT_QUALITIES: HLSQuality[] = [
  { name: '240p', width: 426, height: 240, bitrate: '400k' },
  { name: '480p', width: 854, height: 480, bitrate: '1000k' },
  { name: '720p', width: 1280, height: 720, bitrate: '2500k' },
  { name: '1080p', width: 1920, height: 1080, bitrate: '5000k' },
];

export interface HLSUploadResult {
  masterPlaylistUrl: string;
  qualities: string[];
  duration: number;
  thumbnailUrl: string;
}

/**
 * Process video to HLS and upload to S3
 */
export async function processAndUploadHLS(
  videoBuffer: Buffer,
  videoId: string
): Promise<HLSUploadResult> {
  const tempDir = path.join(os.tmpdir(), `hls-${videoId}`);
  const inputPath = path.join(tempDir, 'input.mp4');
  
  try {
    // Create temp directory
    await mkdir(tempDir, { recursive: true });
    
    // Save input file
    await fs.promises.writeFile(inputPath, videoBuffer);
    console.log('✅ Temp video file created');

    // Get video info
    const videoInfo = await getVideoInfo(inputPath);
    console.log(`📹 Video info: ${videoInfo.width}x${videoInfo.height}, ${videoInfo.duration}s`);

    // Extract first frame as thumbnail
    console.log('📸 Extracting thumbnail from first frame...');
    const thumbnailPath = path.join(tempDir, 'thumbnail.jpg');
    await extractThumbnail(inputPath, thumbnailPath);
    
    // Upload thumbnail to S3
    const thumbnailBuffer = await readFile(thumbnailPath);
    const thumbnailKey = `videos/${videoId}/thumbnail.jpg`;
    await storageService.uploadHLSFile(
      thumbnailBuffer,
      thumbnailKey,
      'image/jpeg'
    );
    const thumbnailUrl = storageService.getPublicUrl(thumbnailKey);
    console.log('✅ Thumbnail uploaded');

    // Filter qualities based on source resolution
    const availableQualities = DEFAULT_QUALITIES.filter(
      q => q.height <= videoInfo.height
    );
    console.log(`🎬 Converting to ${availableQualities.length} quality levels`);

    const processedQualities: string[] = [];

    // Process each quality level
    for (const quality of availableQualities) {
      const qualityDir = path.join(tempDir, quality.name);
      await mkdir(qualityDir, { recursive: true });

      const playlistPath = path.join(qualityDir, 'playlist.m3u8');
      const segmentPattern = path.join(qualityDir, 'segment%03d.ts');

      console.log(`📹 Processing ${quality.name}...`);

      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .outputOptions([
            `-c:v libx264`,
            `-c:a aac`,
            `-b:v ${quality.bitrate}`,
            `-b:a 128k`,
            `-vf scale=${quality.width}:${quality.height}`,
            `-f hls`,
            `-hls_time 6`,
            `-hls_playlist_type vod`,
            `-hls_segment_filename ${segmentPattern}`,
          ])
          .output(playlistPath)
          .on('progress', (progress: any) => {
            if (progress.percent) {
              console.log(`${quality.name}: ${progress.percent.toFixed(1)}%`);
            }
          })
          .on('end', () => {
            console.log(`✅ ${quality.name} complete`);
            resolve();
          })
          .on('error', (err: any) => {
            console.error(`❌ ${quality.name} error:`, err);
            reject(err);
          })
          .run();
      });

      // Upload playlist and segments to S3
      const s3Dir = `videos/${videoId}/hls/${quality.name}`;
      
      // Upload playlist
      const playlistContent = await readFile(playlistPath);
      await storageService.uploadHLSFile(
        playlistContent,
        `${s3Dir}/playlist.m3u8`,
        'application/vnd.apple.mpegurl'
      );

      // Upload segments
      const segments = (await readdir(qualityDir)).filter(f => f.endsWith('.ts'));
      for (const segment of segments) {
        const segmentPath = path.join(qualityDir, segment);
        const segmentContent = await readFile(segmentPath);
        await storageService.uploadHLSFile(
          segmentContent,
          `${s3Dir}/${segment}`,
          'video/MP2T'
        );
      }

      processedQualities.push(quality.name);
      console.log(`☁️ ${quality.name} uploaded to S3`);
    }

    // Generate and upload master playlist
    const masterPlaylistContent = generateMasterPlaylist(
      videoId,
      processedQualities
    );
    const masterPlaylistKey = `videos/${videoId}/hls/master.m3u8`;
    await storageService.uploadHLSFile(
      Buffer.from(masterPlaylistContent),
      masterPlaylistKey,
      'application/vnd.apple.mpegurl'
    );

    const masterPlaylistUrl = storageService.getPublicUrl(masterPlaylistKey);
    console.log('✅ HLS processing and upload complete');

    return {
      masterPlaylistUrl,
      qualities: processedQualities,
      duration: videoInfo.duration,
      thumbnailUrl,
    };
  } finally {
    // Cleanup temp files
    try {
      await cleanupDirectory(tempDir);
      console.log('🧹 Temp files cleaned up');
    } catch (err) {
      console.error('⚠️ Cleanup error:', err);
    }
  }
}

/**
 * Generate master playlist content
 */
function generateMasterPlaylist(videoId: string, qualities: string[]): string {
  let content = '#EXTM3U\n#EXT-X-VERSION:3\n\n';

  const qualityBandwidth: Record<string, number> = {
    '240p': 500000,
    '480p': 1200000,
    '720p': 3000000,
    '1080p': 6000000,
  };

  const qualityResolution: Record<string, string> = {
    '240p': '426x240',
    '480p': '854x480',
    '720p': '1280x720',
    '1080p': '1920x1080',
  };

  for (const quality of qualities) {
    const bandwidth = qualityBandwidth[quality] || 1000000;
    const resolution = qualityResolution[quality] || '854x480';

    content += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n`;
    content += `${quality}/playlist.m3u8\n\n`;
  }

  return content;
}

/**
 * Extract first frame as thumbnail
 */
function extractThumbnail(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        count: 1,
        folder: path.dirname(outputPath),
        filename: path.basename(outputPath),
        timestamps: ['00:00:01'], // Extract at 1 second to avoid black frames
        size: '1280x720'
      })
      .on('end', () => {
        console.log('✅ Thumbnail extracted');
        resolve();
      })
      .on('error', (err: any) => {
        console.error('❌ Thumbnail extraction error:', err);
        reject(err);
      });
  });
}

/**
 * Get video info using ffprobe
 */
function getVideoInfo(inputPath: string): Promise<{
  width: number;
  height: number;
  duration: number;
}> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err: any, metadata: any) => {
      if (err) {
        reject(err);
        return;
      }

      const videoStream = metadata.streams.find((s: any) => s.codec_type === 'video');
      if (!videoStream) {
        reject(new Error('No video stream found'));
        return;
      }

      resolve({
        width: videoStream.width || 0,
        height: videoStream.height || 0,
        duration: Math.round(metadata.format.duration || 0),
      });
    });
  });
}

/**
 * Recursively clean up directory
 */
async function cleanupDirectory(dir: string): Promise<void> {
  try {
    const files = await readdir(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.promises.stat(filePath);
      
      if (stat.isDirectory()) {
        await cleanupDirectory(filePath);
        await rmdir(filePath);
      } else {
        await unlink(filePath);
      }
    }
    
    await rmdir(dir);
  } catch (error) {
    // Ignore errors during cleanup
    console.error('Cleanup error:', error);
  }
}
