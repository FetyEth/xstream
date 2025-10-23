"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useUser } from "@/app/hooks/useUser";
import { Clock, Calendar, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Name } from "@coinbase/onchainkit/identity";

interface HistoryItem {
  id: string;
  sessionToken: string;
  startTime: string;
  endTime?: string;
  watchedSeconds: number;
  amountCharged: string;
  status: string;
  video: {
    id: string;
    title: string;
    thumbnailUrl: string;
    duration: number;
    creator: {
      walletAddress: string;
      username?: string;
      displayName?: string;
      profileImage?: string;
    };
  };
}

export default function HistoryPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    async function fetchHistory() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/users/${user.id}/history?page=${pagination.page}&limit=${pagination.limit}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch watch history');
        }
        
        const data = await response.json();
        setHistory(data.history || []);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load watch history');
      } finally {
        setLoading(false);
      }
    }

    if (!userLoading) {
      fetchHistory();
    }
  }, [user, userLoading, pagination.page]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Loading watch history..." size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-16 w-16 mx-auto mb-4 text-white/30" />
            <h2 className="text-xl font-light text-white mb-2">Sign in to view watch history</h2>
            <p className="text-white/50 font-light">Connect your wallet to access your watch history</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-white font-light mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-light text-white">Watch History</h1>
          </div>
          <p className="text-white/50 font-light">
            {pagination.total} video{pagination.total !== 1 ? 's' : ''} watched
          </p>
        </div>

        {/* History List */}
        {history.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Clock className="h-16 w-16 mx-auto mb-4 text-white/30" />
              <h3 className="text-xl font-light text-white mb-2">No watch history yet</h3>
              <p className="text-white/50 font-light">
                Videos you watch will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <Card 
                key={item.id}
                className="cursor-pointer hover:border-white/20 transition-colors"
                onClick={() => router.push(`/watch/${item.video.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    {/* Thumbnail */}
                    <div className="relative flex-shrink-0 w-48 h-27 bg-white/[0.02] rounded-lg overflow-hidden">
                      <img
                        src={item.video.thumbnailUrl}
                        alt={item.video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
                        {formatDuration(item.video.duration)}
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-light text-white text-lg mb-2 line-clamp-2">
                        {item.video.title}
                      </h3>
                      
                      {/* Creator */}
                      <div className="flex items-center space-x-2 mb-3">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={item.video.creator.profileImage || undefined} />
                          <AvatarFallback className="text-xs">
                            {item.video.creator.displayName?.slice(0, 2).toUpperCase() || '??'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-white/50 font-light">
                          <Name address={item.video.creator.walletAddress as `0x${string}`} />
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center space-x-4 text-xs text-white/50">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(item.startTime)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Watched {formatDuration(item.watchedSeconds)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3" />
                          <span>${parseFloat(item.amountCharged).toFixed(4)} spent</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {item.video.duration > 0 && (
                        <div className="mt-3">
                          <div className="w-full bg-white/10 rounded-full h-1">
                            <div 
                              className="bg-blue-500 h-1 rounded-full transition-all"
                              style={{ 
                                width: `${Math.min(100, (item.watchedSeconds / item.video.duration) * 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/[0.05] transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-white/50">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/[0.05] transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
