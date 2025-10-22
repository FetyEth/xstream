import { NextRequest, NextResponse } from 'next/server';
import { storageService } from '@/lib/storage';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    const playlistContent = await storageService.getFileContent(key);

    const lines = playlistContent.split('\n');
    const modifiedLines = lines.map((line) => {
      if (line.trim() && !line.startsWith('#')) {
        const quality = line.trim().split('/')[0];
        return `/api/videos/${id}/variant/${quality}`;
      }
      return line;
    });

    return new NextResponse(modifiedLines.join('\n'), {
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Stream error:', error);
    return NextResponse.json(
      { error: 'Failed to get video stream' },
      { status: 500 }
    );
  }
}
