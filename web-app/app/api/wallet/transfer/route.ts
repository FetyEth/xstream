import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const {
      fromWalletAddress,
      toWalletAddress,
      amount,
      videoId,
      timestamp,
      metadata
    } = await request.json();

    // Validate input
    if (!fromWalletAddress || !toWalletAddress || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid transfer parameters' },
        { status: 400 }
      );
    }

    // Use transaction to ensure atomicity with increased timeout
    const result = await prisma.$transaction(async (tx) => {
      // Get current balances in parallel for better performance
      const [fromUser, toUser] = await Promise.all([
        tx.user.findUnique({
          where: { walletAddress: fromWalletAddress },
        }),
        tx.user.findUnique({
          where: { walletAddress: toWalletAddress },
        }),
      ]);

      if (!fromUser || !toUser) {
        throw new Error('User not found');
      }

      const currentFromBalance = parseFloat(fromUser.walletBalance.toString());
      const currentToBalance = parseFloat(toUser.walletBalance.toString());

      // Check if sender has sufficient balance
      if (currentFromBalance < amount) {
        throw new Error('Insufficient balance');
      }

      // Update balances and video earnings in parallel for better performance
      const [updatedFromUser, updatedToUser] = await Promise.all([
        tx.user.update({
          where: { walletAddress: fromWalletAddress },
          data: {
            walletBalance: currentFromBalance - amount,
          },
        }),
        tx.user.update({
          where: { walletAddress: toWalletAddress },
          data: {
            walletBalance: currentToBalance + amount,
          },
        }),
        tx.video.update({
          where: { id: videoId },
          data: {
            totalEarnings: {
              increment: amount,
            },
          },
        }),
      ]);

      return {
        transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fromBalance: parseFloat(updatedFromUser.walletBalance.toString()),
        toBalance: parseFloat(updatedToUser.walletBalance.toString()),
        amount,
      };
    }, {
      maxWait: 10000, // Maximum time to wait for a transaction slot (10s)
      timeout: 15000, // Maximum time for the transaction to complete (15s)
    });

    console.log('✅ Wallet transfer completed:', {
      from: fromWalletAddress,
      to: toWalletAddress,
      amount,
      videoId,
      newFromBalance: result.fromBalance,
      newToBalance: result.toBalance,
    });

    return NextResponse.json({
      success: true,
      ...result,
      timestamp,
      videoId,
      metadata,
    });

  } catch (error) {
    console.error('❌ Error processing wallet transfer:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}