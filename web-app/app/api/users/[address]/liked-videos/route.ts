import { NextRequest, NextResponse } from 'next/server'
import { likeService, userService } from '@/lib/database'

interface Params {
  address: string
}

// Helper to get user ID from address or ID
async function getUserId(identifier: string): Promise<string | null> {
  // Check if it's already a user ID (starts with 'c' for cuid)
  if (identifier.startsWith('c')) {
    return identifier
  }
  
  // Otherwise treat as wallet address
  const user = await userService.findByWallet(identifier)
  return user?.id || null
}

// GET /api/users/[address]/liked-videos - Get user's liked videos
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { address: identifier } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const userId = await getUserId(identifier)
    
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const result = await likeService.getUserLikedVideos(userId, { page, limit })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in GET /api/users/[address]/liked-videos:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
