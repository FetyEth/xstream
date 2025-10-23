import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    
    console.log('🔍 Looking for wallet balance for:', address);

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        walletAddress: address,
      },
      select: {
        walletAddress: true,
        walletBalance: true,
      },
    });

    if (!user) {
      console.log('❌ User not found for balance check:', address);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const response = {
      address: address,
      balance: parseFloat(user.walletBalance.toString()),
      timestamp: Date.now()
    };

    console.log('✅ Balance found:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error fetching wallet balance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}