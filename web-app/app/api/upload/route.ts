import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processAndUploadHLS } from '@/lib/hls-processor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for video processing

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const tags = formData.get('tags') as string;
    const creatorWallet = formData.get('creatorWallet') as string | null;

    console.log('Upload request data:', {
      hasVideo: !!videoFile,
      title,
      description,
      category,
      tags,
      creatorWallet
    });

    if (!videoFile || !title || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!creatorWallet) {
      return NextResponse.json(
        { error: 'Creator wallet address is required' },
        { status: 400 }
      );
    }

    let user = await prisma.user.findUnique({
      where: { walletAddress: creatorWallet }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: { 
          walletAddress: creatorWallet,
          username: creatorWallet.slice(0, 10)
        }
      });
    }

    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
    const videoId = `video-${Date.now()}`;
    
    console.log('🎬 Starting HLS processing...');
    
    // Process video to HLS format
    const hlsResult = await processAndUploadHLS(videoBuffer, videoId);
    console.log('✅ HLS processing complete:', hlsResult);

    // Use the thumbnail URL from HLS processing (extracted from first frame)
    const thumbnailUrl = hlsResult.thumbnailUrl || '';

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
