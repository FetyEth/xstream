import { NextRequest, NextResponse } from 'next/server'
import { subscriptionService, userService } from '@/lib/database'

interface Params {
  address: string
}

// POST /api/users/[address]/subscribe - Toggle subscription to a creator
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { address: creatorWallet } = await params
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // First, get the creator's user ID from their wallet address
    const creator = await userService.findByWallet(creatorWallet)
    
    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    const result = await subscriptionService.toggleSubscription(userId, creator.id)
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error in POST /api/users/[address]/subscribe:', error)
    
    if (error.message === 'Cannot subscribe to yourself') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/users/[address]/subscribe - Check if user is subscribed to a creator
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { address: creatorWallet } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // First, get the creator's user ID from their wallet address
    const creator = await userService.findByWallet(creatorWallet)
    
    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    const subscribed = await subscriptionService.isSubscribed(userId, creator.id)
    const subscriberCount = await subscriptionService.getSubscriberCount(creator.id)
    
    return NextResponse.json({ subscribed, subscriberCount })
  } catch (error) {
    console.error('Error in GET /api/users/[address]/subscribe:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
