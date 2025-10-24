// API Route: Request Creator Settlement
import { NextRequest, NextResponse } from 'next/server';
import { settlementService } from '@/lib/settlement-service';
import { prisma } from '@/lib/prisma';

// POST /api/settlements/request - Request a settlement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { creatorId, walletAddress } = body;

    // Support both creatorId and walletAddress
    let finalCreatorId = creatorId;
    
    if (!finalCreatorId && walletAddress) {
      // Normalize wallet address to lowercase
      const normalizedAddress = walletAddress.toLowerCase();
      
      // Find user by wallet address
      const user = await prisma.user.findUnique({
        where: { walletAddress: normalizedAddress }
      });
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      finalCreatorId = user.id;
    }

    if (!finalCreatorId) {
      return NextResponse.json(
        { error: 'Creator ID or wallet address is required' },
        { status: 400 }
      );
    }

    // Check available earnings
    const earnings = await settlementService.getAvailableEarnings(finalCreatorId);
    
    // Temporarily removed minimum check - allow any amount
    if (earnings.available <= 0) {
      return NextResponse.json(
        { 
          error: `No funds available for withdrawal. You have $${earnings.available.toFixed(4)} available.`,
          available: earnings.available
        },
        { status: 400 }
      );
    }

    // Create settlement request
    const settlement = await settlementService.requestSettlement(finalCreatorId);

    return NextResponse.json({ 
      success: true,
      settlement,
      amount: Number(settlement.amount).toFixed(2),
      message: `Settlement request for $${Number(settlement.amount).toFixed(2)} created successfully`
    });
  } catch (error: any) {
    console.error('Error requesting settlement:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create settlement request' },
      { status: 500 }
    );
  }
}

// GET /api/settlements/request?creatorId=xxx OR ?walletAddress=xxx - Get available earnings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creatorId');
    const walletAddress = searchParams.get('walletAddress');

    // Support both creatorId and walletAddress
    let finalCreatorId = creatorId;
    
    if (!finalCreatorId && walletAddress) {
      // Normalize wallet address to lowercase
      const normalizedAddress = walletAddress.toLowerCase();
      
      const user = await prisma.user.findUnique({
        where: { walletAddress: normalizedAddress }
      });
      
      if (!user) {
        return NextResponse.json({
          total: 0,
          settled: 0,
          available: 0,
          canWithdraw: false
        });
      }
      
      finalCreatorId = user.id;
    }

    if (!finalCreatorId) {
      return NextResponse.json(
        { error: 'Creator ID or wallet address is required' },
        { status: 400 }
      );
    }

    const earnings = await settlementService.getAvailableEarnings(finalCreatorId);

    return NextResponse.json(earnings);
  } catch (error: any) {
    console.error('Error fetching available earnings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch earnings' },
      { status: 500 }
    );
  }
}
