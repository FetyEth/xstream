"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useUser } from "@/app/hooks/useUser";
import VideoCard from "@/components/VideoCard";
import { Heart } from "lucide-react";

export default function LikedVideosPage() {
  const { user, isLoading: userLoading } = useUser();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    async function fetchLikedVideos() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/users/${user.id}/liked-videos?page=${pagination.page}&limit=${pagination.limit}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch liked videos');
        }
        
        const data = await response.json();
        setVideos(data.videos || []);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load liked videos');
      } finally {
        setLoading(false);
      }
    }

    if (!userLoading) {
      fetchLikedVideos();
    }
  }, [user, userLoading, pagination.page]);

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Loading liked videos..." size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-white/30" />
            <h2 className="text-xl font-light text-white mb-2">Sign in to view liked videos</h2>
            <p className="text-white/50 font-light">Connect your wallet to access your liked videos</p>
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
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            <h1 className="text-3xl font-light text-white">Liked Videos</h1>
          </div>
          <p className="text-white/50 font-light">
            {pagination.total} video{pagination.total !== 1 ? 's' : ''} you&apos;ve liked
          </p>
        </div>

        {/* Videos Grid */}
        {videos.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-white/30" />
              <h3 className="text-xl font-light text-white mb-2">No liked videos yet</h3>
              <p className="text-white/50 font-light">
                Videos you like will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
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
