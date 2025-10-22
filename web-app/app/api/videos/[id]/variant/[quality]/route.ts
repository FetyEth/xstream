import { NextRequest, NextResponse } from 'next/server';
import { storageService } from '@/lib/storage';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; quality: string }> }
) {
  try {
    const { id, quality } = await params;
    
    const video = await prisma.video.findUnique({
      where: { id },
      select: { videoUrl: true }
    });

    if (!video || !video.videoUrl) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    let key: string;
    
    if (video.videoUrl.startsWith('s3://')) {
      key = video.videoUrl.replace('s3://xstream-base/', '');
    } else if (video.videoUrl.includes('.amazonaws.com/')) {
      const urlParts = video.videoUrl.split('.amazonaws.com/');
      if (urlParts.length !== 2) {
        return NextResponse.json(
          { error: 'Invalid video URL format' },
          { status: 400 }
        );
      }
      key = urlParts[1];
    } else {
      return NextResponse.json(
        { error: 'Invalid video URL format' },
        { status: 400 }
      );
    }

    const baseDir = key.substring(0, key.lastIndexOf('/'));
    const variantKey = `${baseDir}/${quality}/playlist.m3u8`;

    const playlistContent = await storageService.getFileContent(variantKey);

    const lines = playlistContent.split('\n');
    const modifiedLines = await Promise.all(
      lines.map(async (line) => {
        if (line.trim() && !line.startsWith('#') && line.endsWith('.ts')) {
          const segmentKey = `${baseDir}/${quality}/${line.trim()}`;
          const signedUrl = await storageService.getSignedUrl(segmentKey, 3600);
          return signedUrl;
        }
        return line;
      })
    );

    return new NextResponse(modifiedLines.join('\n'), {
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Variant playlist error:', error);
    return NextResponse.json(
      { error: 'Failed to get variant playlist' },
      { status: 500 }
    );
  }
}
