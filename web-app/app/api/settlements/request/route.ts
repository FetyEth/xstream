// API Route: Request Creator Settlement
import { NextRequest, NextResponse } from 'next/server';
import { settlementService } from '@/lib/settlement-service';
import { getSettlementAgent } from '@/lib/settlement-agent';
import { prisma } from '@/lib/prisma';

// POST /api/settlements/request - Request a settlement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { creatorId, walletAddress } = body;

    // Support both creatorId and walletAddress
    let finalCreatorId = creatorId;
    let finalWalletAddress = walletAddress;
    
    if (!finalCreatorId && walletAddress) {
      // Find user by wallet address
      const user = await prisma.user.findUnique({
        where: { walletAddress }
      });
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      finalCreatorId = user.id;
      finalWalletAddress = user.walletAddress;
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

    // Immediately process the settlement (instead of waiting for cron)
    try {
      // Initialize settlement agent
      const agent = await getSettlementAgent({
        networkId: "base-sepolia",
        minThreshold: 0 // No minimum for instant processing
      });

      // Mark as processing
      await settlementService.markProcessing(settlement.id);

      // Send USDC
      const result = await agent.sendSettlement(
        finalWalletAddress,
        Number(settlement.amount)
      );

      if (result.success && result.txHash) {
        // Mark as completed
        await settlementService.markCompleted(settlement.id, result.txHash);
        
        return NextResponse.json({ 
          success: true,
          settlement: {
            ...settlement,
            status: 'COMPLETED',
            txHash: result.txHash
          },
          amount: Number(settlement.amount).toFixed(4),
          txHash: result.txHash,
          message: `Withdrawal completed! $${Number(settlement.amount).toFixed(4)} sent to your wallet.`
        });
      } else {
        // Mark as failed
        await settlementService.markFailed(
          settlement.id,
          result.error || 'Transaction failed'
        );
        
        return NextResponse.json(
          { 
            error: `Withdrawal failed: ${result.error || 'Transaction failed'}`,
            settlement
          },
          { status: 500 }
        );
      }
    } catch (processingError: any) {
      // Mark as failed
      await settlementService.markFailed(settlement.id, processingError.message);
      
      return NextResponse.json(
        { 
          error: `Withdrawal failed: ${processingError.message}`,
          settlement
        },
        { status: 500 }
      );
    }
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
      const user = await prisma.user.findUnique({
        where: { walletAddress }
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
