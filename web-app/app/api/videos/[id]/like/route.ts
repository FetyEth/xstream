import { NextRequest, NextResponse } from 'next/server'
import { likeService } from '@/lib/database'

interface Params {
  id: string
}

// POST /api/videos/[id]/like - Toggle like on a video
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id: videoId } = await params
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const result = await likeService.toggleLike(userId, videoId)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in POST /api/videos/[id]/like:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/videos/[id]/like - Check if user liked a video
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id: videoId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const liked = await likeService.hasUserLiked(userId, videoId)
    
    return NextResponse.json({ liked })
  } catch (error) {
    console.error('Error in GET /api/videos/[id]/like:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
