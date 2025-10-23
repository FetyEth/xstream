"use server";

import { prisma } from "@/lib/prisma";
import { useFacilitator as getFacilitator } from "x402/verify";
import { PaymentRequirements } from "x402/types";
import { exact } from "x402/schemes";

const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const PLATFORM_WALLET = "0x86EA19b5647aF1beF9DCa055737417EF877ff935";
const USDC_EXTRA = {
  name: "USDC",
  version: "2",
};

/**
 * Deposit funds to user's internal wallet using x402
 */
export async function depositToWallet(
  payload: string,
  amount: string,
  walletAddress: string
): Promise<{ success: boolean; error?: string; balance?: string }> {
  try {
    // Payment requirements for deposit
    const paymentRequirements: PaymentRequirements = {
      scheme: "exact",
      network: "base-sepolia",
      maxAmountRequired: amount, // Amount in USDC (6 decimals)
      resource: "https://xstream.app/wallet/deposit",
      description: "xStream Wallet Deposit",
      mimeType: "application/json",
      payTo: PLATFORM_WALLET,
      maxTimeoutSeconds: 300,
      asset: USDC_BASE_SEPOLIA,
      outputSchema: undefined,
      extra: USDC_EXTRA,
    };

    // Get facilitator functions
    const { verify, settle } = getFacilitator();

    // Verify payment
    const payment = exact.evm.decodePayment(payload);
    const valid = await verify(payment, paymentRequirements);
    
    if (!valid.isValid) {
      throw new Error(valid.invalidReason || "Payment verification failed");
    }

    // Settle payment
    const settled = await settle(payment, paymentRequirements);
    if (!settled.success) {
      throw new Error(settled.errorReason || "Payment settlement failed");
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress,
          username: walletAddress.slice(0, 10),
          walletBalance: 0,
        },
      });
    }

    // Ensure user has walletBalance field (for existing users created before wallet feature)
    if (user.walletBalance === null || user.walletBalance === undefined) {
      user = await prisma.user.update({
        where: { walletAddress },
        data: {
          walletBalance: 0,
        },
      });
    }

    // Convert amount from string with 6 decimals to decimal
    const depositAmount = parseFloat(amount) / 1000000;
    const balanceBefore = parseFloat(user.walletBalance?.toString() || "0");
    const balanceAfter = balanceBefore + depositAmount;

    // Update user balance and create transaction record
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { walletAddress },
        data: {
          walletBalance: balanceAfter,
        },
      }),
      prisma.walletTransaction.create({
        data: {
          userId: user.id,
          type: "DEPOSIT",
          amount: depositAmount,
          balanceBefore,
          balanceAfter,
          description: `Deposited ${depositAmount} USDC via x402`,
          x402PaymentId: settled.transaction || undefined,
        },
      }),
    ]);

    return {
      success: true,
      balance: updatedUser.walletBalance.toString(),
    };
  } catch (error) {
    console.error("Deposit error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Deposit failed",
    };
  }
}

/**
 * Get user's wallet balance
 */
export async function getWalletBalance(
  walletAddress: string
): Promise<{ success: boolean; balance?: string; transactions?: any[]; error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      include: {
        walletTransactions: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!user) {
      return { success: true, balance: "0", transactions: [] };
    }

    return {
      success: true,
      balance: user.walletBalance.toString(),
      transactions: user.walletTransactions.map((tx: any) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount.toString(),
        description: tx.description,
        createdAt: tx.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Get balance error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get balance",
    };
  }
}

/**
 * Stake amount for video viewing (deduct from internal wallet)
 */
export async function stakeForVideo(
  walletAddress: string,
  videoId: string,
  stakeAmount: number
): Promise<{ success: boolean; error?: string; sessionId?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const currentBalance = parseFloat(user.walletBalance?.toString() || "0");
    
    if (currentBalance < stakeAmount) {
      return { success: false, error: "Insufficient balance" };
    }

    const balanceAfter = currentBalance - stakeAmount;

    // Create view session and deduct stake
    const [session] = await prisma.$transaction([
      prisma.viewSession.create({
        data: {
          sessionToken: `session-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          viewerId: user.id,
          videoId,
          watchedSeconds: 0,
          amountCharged: 0,
          status: "ACTIVE",
        },
      }),
      prisma.user.update({
        where: { walletAddress },
        data: { walletBalance: balanceAfter },
      }),
      prisma.walletTransaction.create({
        data: {
          userId: user.id,
          type: "STAKE",
          amount: stakeAmount,
          balanceBefore: currentBalance,
          balanceAfter,
          description: `Staked ${stakeAmount} USDC for video viewing`,
          videoId,
        },
      }),
    ]);

    return {
      success: true,
      sessionId: session.id,
    };
  } catch (error) {
    console.error("Stake error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Stake failed",
    };
  }
}

/**
 * Refund unused stake after video viewing
 */
export async function refundUnusedStake(
  sessionId: string,
  watchedSeconds: number,
  pricePerSecond: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await prisma.viewSession.findUnique({
      where: { id: sessionId },
      include: { viewer: true, video: true },
    });

    if (!session) {
      return { success: false, error: "Session not found" };
    }

    // Calculate actual charge
    const actualCharge = watchedSeconds * pricePerSecond;
    
    // Get the stake transaction
    const stakeTransaction = await prisma.walletTransaction.findFirst({
      where: {
        userId: session.viewerId,
        videoId: session.videoId,
        type: "STAKE",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!stakeTransaction) {
      return { success: false, error: "Stake transaction not found" };
    }

    const stakedAmount = parseFloat(stakeTransaction.amount.toString());
    const refundAmount = Math.max(0, stakedAmount - actualCharge);
    
    const currentBalance = parseFloat(session.viewer.walletBalance?.toString() || "0");
    const balanceAfter = currentBalance + refundAmount;

    // Update session, refund, and create transaction
    await prisma.$transaction([
      prisma.viewSession.update({
        where: { id: sessionId },
        data: {
          watchedSeconds,
          amountCharged: actualCharge,
          status: "COMPLETED",
          endTime: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: session.viewerId },
        data: { walletBalance: balanceAfter },
      }),
      prisma.walletTransaction.create({
        data: {
          userId: session.viewerId,
          type: "REFUND",
          amount: refundAmount,
          balanceBefore: currentBalance,
          balanceAfter,
          description: `Refund of ${refundAmount} USDC (staked: ${stakedAmount}, charged: ${actualCharge})`,
          videoId: session.videoId,
          sessionId,
        },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Refund error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Refund failed",
    };
  }
}
