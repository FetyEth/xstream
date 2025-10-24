// API Route: Process Pending Settlements
import { NextRequest, NextResponse } from 'next/server';
import { settlementService } from '@/lib/settlement-service';
import { getSettlementAgent } from '@/lib/settlement-agent';

// POST /api/settlements/process - Process pending settlements
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check - only allow cron job or admin

    // Get pending settlements
    const pending = await settlementService.getPendingSettlements(10);

    if (pending.length === 0) {
      return NextResponse.json({ 
        message: 'No pending settlements',
        processed: 0
      });
    }

    // Initialize settlement agent
    const agent = await getSettlementAgent({
      networkId: "base-sepolia",
      minThreshold: 10
    });

    const results = [];

    for (const settlement of pending) {
      try {
        // Mark as processing
        await settlementService.markProcessing(settlement.id);

        // Send USDC
        const result = await agent.sendSettlement(
          settlement.creator.walletAddress,
          Number(settlement.amount)
        );

        if (result.success && result.txHash) {
          // Mark as completed
          await settlementService.markCompleted(settlement.id, result.txHash);
          results.push({
            settlementId: settlement.id,
            creator: settlement.creator.walletAddress,
            amount: Number(settlement.amount),
            status: 'completed',
            txHash: result.txHash
          });
        } else {
          // Mark as failed
          await settlementService.markFailed(
            settlement.id,
            result.error || 'Transaction failed'
          );
          results.push({
            settlementId: settlement.id,
            creator: settlement.creator.walletAddress,
            amount: Number(settlement.amount),
            status: 'failed',
            error: result.error
          });
        }
      } catch (error: any) {
        // Mark as failed
        await settlementService.markFailed(settlement.id, error.message);
        results.push({
          settlementId: settlement.id,
          creator: settlement.creator.walletAddress,
          amount: Number(settlement.amount),
          status: 'failed',
          error: error.message
        });
      }
    }

    return NextResponse.json({ 
      success: true,
      processed: results.length,
      results
    });
  } catch (error: any) {
    console.error('Error processing settlements:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process settlements' },
      { status: 500 }
    );
  }
}

// GET /api/settlements/process - Get processing status
export async function GET() {
  try {
    const pending = await settlementService.getPendingSettlements();
    
    return NextResponse.json({
      pendingCount: pending.length,
      pendingSettlements: pending.map(s => ({
        id: s.id,
        creator: s.creator.walletAddress,
        amount: Number(s.amount),
        requestedAt: s.requestedAt
      }))
    });
  } catch (error: any) {
    console.error('Error fetching pending settlements:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
