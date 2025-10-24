// Database utility functions for xStream platform - Simplified MVP

import { prisma } from './prisma'

// User Operations
export const userService = {
  // Create or get user by wallet address
  async upsertUser(walletAddress: string, data?: {
    username?: string
    displayName?: string
    profileImage?: string
  }) {
    // Normalize to lowercase
    const normalizedAddress = walletAddress.toLowerCase();
    
    return await prisma.user.upsert({
      where: { walletAddress: normalizedAddress },
      create: {
        walletAddress: normalizedAddress,
        ...data
      },
      update: data || {}
    })
  },

  // Find user by wallet
  async findByWallet(walletAddress: string) {
    // Normalize to lowercase for case-insensitive comparison
    const normalizedAddress = walletAddress.toLowerCase();
    
    return await prisma.user.findUnique({
      where: { 
        walletAddress: normalizedAddress
      }
    });
  },

  // Get user with stats
  async getUserWithStats(walletAddress: string) {
    // Normalize to lowercase
    const normalizedAddress = walletAddress.toLowerCase();
    
    const user = await prisma.user.findUnique({
      where: { walletAddress: normalizedAddress },
      include: {
        videos: {
          select: {
            id: true,
            title: true,
            totalViews: true,
            totalEarnings: true,
            totalWatchTime: true,
            publishedAt: true
          }
        },
        viewSessions: {
          select: {
            watchedSeconds: true,
            amountCharged: true
          }
        },
        earnings: {
          where: { status: 'PAID' },
          select: { amount: true, paidAt: true }
        }
      }
    })

    if (!user) return null

    // Calculate stats
    const totalEarned = user.earnings.reduce((sum: number, e: any) => sum + Number(e.amount), 0)
    const creatorEarnings = user.videos.reduce((sum: number, v: any) => sum + Number(v.totalEarnings), 0)
    const totalVideos = user.videos.length
    const totalViews = user.videos.reduce((sum: number, v: any) => sum + v.totalViews, 0)
    const totalWatchTime = user.viewSessions.reduce((sum: number, s: any) => sum + s.watchedSeconds, 0)
    const totalSpent = user.viewSessions.reduce((sum: number, s: any) => sum + Number(s.amountCharged), 0)

    return {
      ...user,
      stats: {
        totalEarned,
        creatorEarnings,
        totalVideos,
        totalViews,
        totalWatchTime,
        totalSpent
      }
    }
  }
}

// Video Operations
export const videoService = {
  // Create new video
  async createVideo(data: {
    title: string
    description?: string
    videoUrl: string
    thumbnailUrl: string
    duration: number
    pricePerSecond: number
    category?: string
    tags?: string[]
    creatorWallet: string
  }) {
    // Normalize wallet address to lowercase for consistency
    const normalizedWallet = data.creatorWallet;
    
    // First, ensure the user exists
    await prisma.user.upsert({
      where: { walletAddress: normalizedWallet },
      update: {}, // Don't update anything if exists
      create: {
        walletAddress: normalizedWallet,
        // Optional: Set default username
        username: `user_${normalizedWallet.slice(0, 8)}`,
      },
    });

    // Now create the video - connect to existing user via relation
    return await prisma.video.create({
      data: {
        title: data.title,
        description: data.description,
        videoUrl: data.videoUrl,
        thumbnailUrl: data.thumbnailUrl,
        duration: data.duration,
        pricePerSecond: data.pricePerSecond.toString(),
        category: data.category,
        tags: data.tags || [],
        creator: {
          connect: {
            walletAddress: normalizedWallet,
          },
        },
      },
      include: {
        creator: true, // Include creator info in response
      },
    });
  },

  // Get videos with filters
  async getVideos(params?: {
    page?: number
    limit?: number
    category?: string
    tags?: string[]
    search?: string
    sortBy?: 'recent' | 'popular' | 'earnings'
  }) {
    const page = params?.page || 1
    const limit = params?.limit || 20
    const skip = (page - 1) * limit

    const where: any = {}
    
    if (params?.category) {
      where.category = params.category
    }
    
    if (params?.tags && params.tags.length > 0) {
      where.tags = {
        hasSome: params.tags
      }
    }
    
    if (params?.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } }
      ]
    }

    let orderBy: any = { publishedAt: 'desc' }
    if (params?.sortBy === 'popular') orderBy = { totalViews: 'desc' }
    if (params?.sortBy === 'earnings') orderBy = { totalEarnings: 'desc' }

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
      }),
      prisma.video.count({ where })
    ])

    return {
      videos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  },

  // Get video by ID
  async getVideoById(id: string) {
    return await prisma.video.findUnique({
      where: { id },
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
    })
  },

  // Update video stats
  async updateStats(id: string, data: {
    totalViews?: number
    totalWatchTime?: number
    totalEarnings?: number
  }) {
    return await prisma.video.update({
      where: { id },
      data: {
        totalViews: data.totalViews !== undefined ? { increment: 1 } : undefined,
        totalWatchTime: data.totalWatchTime !== undefined ? { increment: data.totalWatchTime } : undefined,
        totalEarnings: data.totalEarnings !== undefined ? { increment: data.totalEarnings } : undefined
      }
    })
  }
}

// View Session Operations
export const sessionService = {
  // Create new session
  async createSession(data: {
    sessionToken: string
    viewerId: string
    videoId: string
  }) {
    return await prisma.viewSession.create({
      data
    })
  },

  // Get session
  async getSession(sessionToken: string) {
    return await prisma.viewSession.findUnique({
      where: { sessionToken },
      include: {
        video: true,
        viewer: true
      }
    })
  },

  // Update session (watched time, charged amount)
  async updateSession(sessionToken: string, data: {
    watchedSeconds?: number
    amountCharged?: number
    status?: string
    endTime?: Date
  }) {
    return await prisma.viewSession.update({
      where: { sessionToken },
      data: {
        watchedSeconds: data.watchedSeconds,
        amountCharged: data.amountCharged?.toString(),
        status: data.status,
        endTime: data.endTime
      }
    })
  },

  // Complete session
  async completeSession(sessionToken: string) {
    return await prisma.viewSession.update({
      where: { sessionToken },
      data: {
        status: 'COMPLETED',
        endTime: new Date()
      }
    })
  }
}

// Creator Earnings Operations
export const earningService = {
  // Create earning record
  async createEarning(data: {
    amount: number
    creatorId: string
    videoId?: string
    sessionId?: string
    txHash?: string
  }) {
    return await prisma.creatorEarning.create({
      data: {
        ...data,
        amount: data.amount.toString()
      }
    })
  },

  // Get creator earnings
  async getCreatorEarnings(creatorId: string, params?: {
    status?: string
    page?: number
    limit?: number
  }) {
    const page = params?.page || 1
    const limit = params?.limit || 20
    const skip = (page - 1) * limit

    const where: any = { creatorId }
    if (params?.status) where.status = params.status

    const [earnings, total] = await Promise.all([
      prisma.creatorEarning.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.creatorEarning.count({ where })
    ])

    return {
      earnings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  },

  // Mark earning as paid
  async markAsPaid(id: string, txHash: string) {
    return await prisma.creatorEarning.update({
      where: { id },
      data: {
        status: 'PAID',
        txHash,
        paidAt: new Date()
      }
    })
  }
}

// Video Like Operations
export const likeService = {
  // Toggle like on a video
  async toggleLike(userId: string, videoId: string) {
    const existingLike = await prisma.videoLike.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId
        }
      }
    })

    if (existingLike) {
      // Unlike: delete like and decrement counter
      await prisma.$transaction([
        prisma.videoLike.delete({
          where: {
            userId_videoId: {
              userId,
              videoId
            }
          }
        }),
        prisma.video.update({
          where: { id: videoId },
          data: {
            totalLikes: {
              decrement: 1
            }
          }
        })
      ])
      return { liked: false }
    } else {
      // Like: create like and increment counter
      await prisma.$transaction([
        prisma.videoLike.create({
          data: {
            userId,
            videoId
          }
        }),
        prisma.video.update({
          where: { id: videoId },
          data: {
            totalLikes: {
              increment: 1
            }
          }
        })
      ])
      return { liked: true }
    }
  },

  // Check if user liked a video
  async hasUserLiked(userId: string, videoId: string) {
    const like = await prisma.videoLike.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId
        }
      }
    })
    return !!like
  },

  // Get user's liked videos
  async getUserLikedVideos(userId: string, params?: {
    page?: number
    limit?: number
  }) {
    const page = params?.page || 1
    const limit = params?.limit || 20
    const skip = (page - 1) * limit

    const [likes, total] = await Promise.all([
      prisma.videoLike.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
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
      prisma.videoLike.count({ where: { userId } })
    ])

    return {
      videos: likes.map(like => like.video),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  },

  // Get users who liked a video
  async getVideoLikes(videoId: string, params?: {
    page?: number
    limit?: number
  }) {
    const page = params?.page || 1
    const limit = params?.limit || 20
    const skip = (page - 1) * limit

    const [likes, total] = await Promise.all([
      prisma.videoLike.findMany({
        where: { videoId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              walletAddress: true,
              username: true,
              displayName: true,
              profileImage: true
            }
          }
        }
      }),
      prisma.videoLike.count({ where: { videoId } })
    ])

    return {
      users: likes.map(like => like.user),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }
}

// Subscription Operations
export const subscriptionService = {
  // Toggle subscription to a creator
  async toggleSubscription(subscriberId: string, creatorId: string) {
    if (subscriberId === creatorId) {
      throw new Error('Cannot subscribe to yourself')
    }

    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        subscriberId_creatorId: {
          subscriberId,
          creatorId
        }
      }
    })

    if (existingSubscription) {
      // Unsubscribe
      await prisma.subscription.delete({
        where: {
          subscriberId_creatorId: {
            subscriberId,
            creatorId
          }
        }
      })
      return { subscribed: false }
    } else {
      // Subscribe
      await prisma.subscription.create({
        data: {
          subscriberId,
          creatorId
        }
      })
      return { subscribed: true }
    }
  },

  // Check if user is subscribed to creator
  async isSubscribed(subscriberId: string, creatorId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: {
        subscriberId_creatorId: {
          subscriberId,
          creatorId
        }
      }
    })
    return !!subscription
  },

  // Get user's subscriptions
  async getUserSubscriptions(subscriberId: string, params?: {
    page?: number
    limit?: number
  }) {
    const page = params?.page || 1
    const limit = params?.limit || 20
    const skip = (page - 1) * limit

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where: { subscriberId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              walletAddress: true,
              username: true,
              displayName: true,
              profileImage: true,
              videos: {
                select: {
                  id: true,
                  totalViews: true
                }
              }
            }
          }
        }
      }),
      prisma.subscription.count({ where: { subscriberId } })
    ])

    return {
      creators: subscriptions.map(sub => ({
        ...sub.creator,
        subscribedAt: sub.createdAt,
        videoCount: sub.creator.videos.length
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  },

  // Get creator's subscribers
  async getCreatorSubscribers(creatorId: string, params?: {
    page?: number
    limit?: number
  }) {
    const page = params?.page || 1
    const limit = params?.limit || 20
    const skip = (page - 1) * limit

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where: { creatorId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          subscriber: {
            select: {
              id: true,
              walletAddress: true,
              username: true,
              displayName: true,
              profileImage: true
            }
          }
        }
      }),
      prisma.subscription.count({ where: { creatorId } })
    ])

    return {
      subscribers: subscriptions.map(sub => ({
        ...sub.subscriber,
        subscribedAt: sub.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  },

  // Get subscriber count for a creator
  async getSubscriberCount(creatorId: string) {
    return await prisma.subscription.count({
      where: { creatorId }
    })
  },

  // Get subscription count for a user
  async getSubscriptionCount(subscriberId: string) {
    return await prisma.subscription.count({
      where: { subscriberId }
    })
  },

  // Get videos from subscribed creators
  async getSubscriptionFeed(subscriberId: string, params?: {
    page?: number
    limit?: number
  }) {
    const page = params?.page || 1
    const limit = params?.limit || 20
    const skip = (page - 1) * limit

    // Get all subscribed creator IDs
    const subscriptions = await prisma.subscription.findMany({
      where: { subscriberId },
      select: { creatorId: true }
    })

    const creatorIds = subscriptions.map(sub => sub.creatorId)

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where: {
          creator: {
            id: {
              in: creatorIds
            }
          }
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
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
      }),
      prisma.video.count({
        where: {
          creator: {
            id: {
              in: creatorIds
            }
          }
        }
      })
    ])

    return {
      videos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }
}
