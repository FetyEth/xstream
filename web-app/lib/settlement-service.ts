// Settlement Service - Manages creator payout requests and processing
import { prisma } from './prisma';

export const settlementService = {
  /**
   * Request a settlement for a creator
   */
  async requestSettlement(creatorId: string) {
    // Get creator's total earnings
    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      include: {
        videos: {
          select: {
            totalEarnings: true
          }
        }
      }
    });

    if (!creator) {
      throw new Error('Creator not found');
    }

    // Calculate total earnings
    const totalEarnings = creator.videos.reduce(
      (sum, video) => sum + Number(video.totalEarnings),
      0
    );

    // Check if there are pending settlements
    const pendingSettlements = await prisma.settlement.findMany({
      where: {
        creatorId,
        status: { in: ['PENDING', 'PROCESSING'] }
      }
    });

    const pendingAmount = pendingSettlements.reduce(
      (sum, s) => sum + Number(s.amount),
      0
    );

    const availableAmount = totalEarnings - pendingAmount;

    // Temporarily allow any withdrawal amount (minimum check disabled)
    // TODO: Re-enable $10 minimum threshold in production
    if (availableAmount <= 0) {
      throw new Error(`No funds available for withdrawal. Available: $${availableAmount.toFixed(2)}`);
    }

    // Create settlement request
    return await prisma.settlement.create({
      data: {
        creatorId,
        amount: availableAmount,
        status: 'PENDING'
      }
    });
  },

  /**
   * Get pending settlements ready for processing
   */
  async getPendingSettlements(limit = 10) {
    return await prisma.settlement.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        creator: {
          select: {
            id: true,
            walletAddress: true,
            displayName: true,
            username: true
          }
        }
      },
      take: limit,
      orderBy: {
        requestedAt: 'asc'
      }
    });
  },

  /**
   * Mark settlement as processing
   */
  async markProcessing(settlementId: string) {
    return await prisma.settlement.update({
      where: { id: settlementId },
      data: {
        status: 'PROCESSING',
        processedAt: new Date()
      }
    });
  },

  /**
   * Mark settlement as completed
   */
  async markCompleted(settlementId: string, txHash: string) {
    return await prisma.settlement.update({
      where: { id: settlementId },
      data: {
        status: 'COMPLETED',
        txHash,
        completedAt: new Date()
      }
    });
  },

  /**
   * Mark settlement as failed
   */
  async markFailed(settlementId: string, errorMessage: string) {
    return await prisma.settlement.update({
      where: { id: settlementId },
      data: {
        status: 'FAILED',
        errorMessage,
        processedAt: new Date()
      }
    });
  },

  /**
   * Get settlement history for a creator
   */
  async getCreatorSettlements(creatorId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [settlements, total] = await Promise.all([
      prisma.settlement.findMany({
        where: { creatorId },
        orderBy: { requestedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.settlement.count({ where: { creatorId } })
    ]);

    return {
      settlements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get total available earnings for a creator
   */
  async getAvailableEarnings(creatorId: string) {
    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      include: {
        videos: {
          select: {
            totalEarnings: true
          }
        },
        settlements: {
          where: {
            status: { in: ['PENDING', 'PROCESSING', 'COMPLETED'] }
          },
          select: {
            amount: true
          }
        }
      }
    });

    if (!creator) {
      return { total: 0, settled: 0, available: 0 };
    }

    const totalEarnings = creator.videos.reduce(
      (sum, video) => sum + Number(video.totalEarnings),
      0
    );

    const settledAmount = creator.settlements.reduce(
      (sum, settlement) => sum + Number(settlement.amount),
      0
    );

    const available = totalEarnings - settledAmount;

    return {
      total: totalEarnings,
      settled: settledAmount,
      available,
      canWithdraw: available > 0 // Temporarily allow any amount (was: available >= 10)
    };
  },

  /**
   * Check if creator has auto-withdraw enabled and earnings meet threshold
   */
  async checkAutoWithdraw(creatorId: string) {
    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      select: {
        autoWithdrawEnabled: true,
        autoWithdrawThreshold: true
      }
    });

    if (!creator || !creator.autoWithdrawEnabled) {
      return false;
    }

    const { available } = await this.getAvailableEarnings(creatorId);
    return available >= Number(creator.autoWithdrawThreshold);
  },

  /**
   * Process auto-withdrawals for eligible creators
   */
  async processAutoWithdrawals() {
    const creators = await prisma.user.findMany({
      where: {
        autoWithdrawEnabled: true
      },
      select: {
        id: true
      }
    });

    const eligible = [];
    for (const creator of creators) {
      if (await this.checkAutoWithdraw(creator.id)) {
        eligible.push(creator.id);
      }
    }

    return eligible;
  }
};
