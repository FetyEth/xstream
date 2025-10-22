import { NextRequest, NextResponse } from 'next/server';
import { storageService } from '@/lib/storage';
import { prisma } from '@/lib/prisma';
import { processAndUploadHLS } from '@/lib/hls-processor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for video processing

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const thumbnailFile = formData.get('thumbnail') as File | null;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const tags = formData.get('tags') as string;
    const walletAddress = formData.get('walletAddress') as string | null;

    if (!videoFile || !title || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let user = null;
    if (walletAddress) {
      user = await prisma.user.findUnique({
        where: { walletAddress }
      });
      
      if (!user) {
        user = await prisma.user.create({
          data: { 
            walletAddress,
            username: walletAddress.slice(0, 10)
          }
        });
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
    const videoId = `video-${Date.now()}`;
    
    console.log('🎬 Starting HLS processing...');
    
    // Process video to HLS format
    const hlsResult = await processAndUploadHLS(videoBuffer, videoId);
    console.log('✅ HLS processing complete:', hlsResult);

    // Upload thumbnail
    let thumbnailUrl = '';
    if (thumbnailFile) {
      const thumbnailBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
      const thumbnailFilename = `${Date.now()}-thumb-${thumbnailFile.name.replace(/\s+/g, '-')}`;
      const thumbnailUpload = await storageService.uploadThumbnail(
        thumbnailBuffer,
        thumbnailFilename,
        thumbnailFile.type
      );
      thumbnailUrl = thumbnailUpload.publicUrl;
    }

    const video = await prisma.video.create({
      data: {
        title,
        description,
        videoUrl: hlsResult.masterPlaylistUrl,
        thumbnailUrl,
        duration: hlsResult.duration,
        pricePerSecond: 0.0001, // Default price
        creator: {
          connect: {
            walletAddress: user.walletAddress
          }
        },
        category: category,
        tags: tags
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean)
      },
      include: {
        creator: true
      }
    });

    return NextResponse.json({
      success: true,
      video: {
        id: video.id,
        title: video.title,
        url: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
