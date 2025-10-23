import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { userService } from '@/lib/database'

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

// GET /api/users/[address]/history - Get user's watch history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { address: identifier } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const userId = await getUserId(identifier)
    
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const [history, total] = await Promise.all([
      prisma.viewSession.findMany({
        where: { 
          viewerId: userId,
          status: { in: ['COMPLETED', 'ACTIVE'] }
        },
        orderBy: { startTime: 'desc' },
        skip,
        take: limit,
        include: {
          video: {
            include: {
              creator: {
                select: {
                  id: true,
                  walletAddress: true,
                  username: true,
                  displayName: true,
                  profileImage: true
                }
              }
            }
          }
        }
      }),
      prisma.viewSession.count({ 
        where: { 
          viewerId: userId,
          status: { in: ['COMPLETED', 'ACTIVE'] }
        }
      })
    ])

    return NextResponse.json({
      history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error in GET /api/users/[address]/history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
