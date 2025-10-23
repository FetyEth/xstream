"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { useUser } from "@/app/hooks/useUser";
import { Name } from "@coinbase/onchainkit/identity";
import { Video, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

interface Creator {
  id: string;
  walletAddress: string;
  username?: string;
  displayName?: string;
  profileImage?: string;
  subscribedAt: string;
  videoCount: number;
}

export default function SubscriptionsPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    async function fetchSubscriptions() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/users/${user.id}/subscriptions?page=${pagination.page}&limit=${pagination.limit}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscriptions');
        }
        
        const data = await response.json();
        setCreators(data.creators || []);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
      } finally {
        setLoading(false);
      }
    }

    if (!userLoading) {
      fetchSubscriptions();
    }
  }, [user, userLoading, pagination.page]);

  const handleCreatorClick = (walletAddress: string) => {
    router.push(`/profile/${walletAddress}`);
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Loading subscriptions..." size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-light text-white mb-2">Sign in to view subscriptions</h2>
            <p className="text-white/50 font-light">Connect your wallet to access your subscriptions</p>
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
            <h1 className="text-3xl font-light text-white">Subscriptions</h1>
          </div>
          <p className="text-white/50 font-light">
            {pagination.total} creator{pagination.total !== 1 ? 's' : ''} you&apos;re subscribed to
          </p>
        </div>

        {/* Creators Grid */}
        {creators.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-xl font-light text-white mb-2">No subscriptions yet</h3>
              <p className="text-white/50 font-light">
                Subscribe to creators to see their content here
              </p>
              <Button 
                onClick={() => router.push('/browse')}
                className="mt-4"
              >
                Browse Creators
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => (
              <Card 
                key={creator.id}
                className="cursor-pointer hover:border-white/20 transition-colors"
                onClick={() => handleCreatorClick(creator.walletAddress)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={creator.profileImage || undefined} />
                      <AvatarFallback>
                        {creator.displayName?.slice(0, 2).toUpperCase() || 
                         creator.username?.slice(0, 2).toUpperCase() || '??'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-light text-white text-lg mb-1 truncate">
                        <Name address={creator.walletAddress as `0x${string}`} />
                      </h3>
                      {creator.username && (
                        <p className="text-sm text-white/50 font-light mb-2">
                          @{creator.username}
                        </p>
                      )}
                      <div className="flex items-center space-x-3 text-xs text-white/50">
                        <div className="flex items-center space-x-1">
                          <Video className="h-3 w-3" />
                          <span>{creator.videoCount} videos</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(creator.subscribedAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/profile/${creator.walletAddress}`);
                    }}
                  >
                    View Channel
                  </Button>
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
