// API Route: Get Settlement History
import { NextRequest, NextResponse } from 'next/server';
import { settlementService } from '@/lib/settlement-service';
import { prisma } from '@/lib/prisma';

// GET /api/settlements/history?creatorId=xxx&page=1 OR ?walletAddress=xxx&page=1
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creatorId');
    const walletAddress = searchParams.get('walletAddress');
    const page = parseInt(searchParams.get('page') || '1');

    // Support both creatorId and walletAddress
    let finalCreatorId = creatorId;
    
    if (!finalCreatorId && walletAddress) {
      const user = await prisma.user.findUnique({
        where: { walletAddress }
      });
      
      if (!user) {
        return NextResponse.json({
          settlements: [],
          total: 0,
          page: 1,
          totalPages: 0
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

    const result = await settlementService.getCreatorSettlements(finalCreatorId, page);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching settlement history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
