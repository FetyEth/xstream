export interface User {
  id: string;
  walletAddress: string;
  username?: string;
  displayName?: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  pricePerSecond: number;
  totalEarnings: number;
  category?: string;
  tags: string[];
  totalViews: number;
  totalWatchTime: number;
  creatorWallet: string;
  creator: User;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ViewSession {
  id: string;
  sessionToken: string;
  startTime: Date;
  endTime?: Date;
  watchedSeconds: number;
  amountCharged: number;
  status: string;
  viewerId: string;
  viewer: User;
  videoId: string;
  video: Video;
}

export interface CreatorEarning {
  id: string;
  amount: number;
  txHash?: string;
  status: string;
  videoId?: string;
  sessionId?: string;
  creatorId: string;
  creator: User;
  createdAt: Date;
  paidAt?: Date;
}

export interface UserStats {
  totalEarned: number;
  totalVideos: number;
  totalViews: number;
  totalWatchTime: number;
  totalSpent: number;
}

export interface VideoWithStats extends Video {
  stats?: {
    averageViewDuration: number;
    conversionRate: number;
    revenue: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// API Parameter types
export interface GetVideosParams {
  page?: number;
  limit?: number;
  category?: string;
  tags?: string[];
  search?: string;
  sortBy?: 'recent' | 'popular' | 'earnings';
}

export interface CreateVideoData {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  pricePerSecond: number;
  category?: string;
  tags?: string[];
  creatorWallet: string;
}

export interface CreateUserData {
  walletAddress: string;
  username?: string;
  displayName?: string;
  profileImage?: string;
}

export interface UpdateSessionData {
  watchedSeconds?: number;
  amountCharged?: number;
  status?: string;
  endTime?: Date;
}

// Upload related types
export interface VideoUploadData {
  title: string;
  description?: string;
  pricePerSecond: string;
  maxQuality: string;
  category: string;
  tags: string;
  creatorId: string;
  video: File;
  thumbnail?: File;
}

export interface VideoUploadResponse {
  success: boolean;
  video: {
    id: string;
    title: string;
    description?: string;
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
    width: number;
    height: number;
    pricePerSecond: number;
    maxQuality: string;
    category: string;
    tags: string[];
    creatorId: string;
    createdAt: Date;
  };
  playlistUrl: string;
  thumbnailUrl: string;
  message: string;
}