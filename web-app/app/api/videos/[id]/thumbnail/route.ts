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
      select: { thumbnailUrl: true }
    });

    if (!video || !video.thumbnailUrl) {
      return NextResponse.json(
        { error: 'Thumbnail not found' },
        { status: 404 }
      );
    }

    // If it's an external URL (like Unsplash), redirect directly
    if (video.thumbnailUrl.startsWith('http://') || video.thumbnailUrl.startsWith('https://')) {
      return NextResponse.redirect(video.thumbnailUrl);
    }

    let key: string;
    
    // Extract S3 key from URL
    if (video.thumbnailUrl.startsWith('s3://')) {
      key = video.thumbnailUrl.replace('s3://xstream-base/', '');
    } else if (video.thumbnailUrl.includes('.amazonaws.com/')) {
      const urlParts = video.thumbnailUrl.split('.amazonaws.com/');
      if (urlParts.length !== 2) {
        return NextResponse.json(
          { error: 'Invalid thumbnail URL format' },
          { status: 400 }
        );
      }
      key = urlParts[1];
    } else {
      return NextResponse.json(
        { error: 'Invalid thumbnail URL format' },
        { status: 400 }
      );
    }

    // Get signed URL with longer expiration for thumbnails (1 hour)
    const signedUrl = await storageService.getSignedUrl(key, 3600);

    // Redirect to the signed URL
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error('Thumbnail error:', error);
    return NextResponse.json(
      { error: 'Failed to get thumbnail' },
      { status: 500 }
    );
  }
}
