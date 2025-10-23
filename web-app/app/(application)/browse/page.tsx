"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import Link from "next/link";
import { Eye } from "lucide-react";

export default function BrowsePage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await fetch('/api/videos?limit=12');
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        const data = await response.json();
        setVideos(data.videos || []);
      } catch (error) {
        console.error('Failed to fetch videos:', error);
        setError('Unable to load videos. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  return (
    <div className="min-h-screen p-4">

      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="mb-8">
          <div className="flex flex-col items-start gap-3 mb-4">
              <h1 className="text-4xl font-light text-white">Browse Videos</h1>
              <p className="text-white/50 text-sm font-light">Discover amazing content and pay per second</p>
          </div>
        </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loading text="Loading videos..." size="md" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-white text-lg font-light mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-white text-lg font-light mb-2">No videos found</p>
              <p className="text-white/50 font-light mb-4">Be the first to upload content!</p>
              <Button variant="outline" onClick={() => window.location.href = '/upload'}>
                Upload Video
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos.map((video: any) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

function VideoCard({ video }: { video: any }) {
  const getCreatorName = () => {
    if (!video.creator) return 'Unknown';
    if (typeof video.creator === 'string') return video.creator;
    return video.creator.displayName || video.creator.username || 
           (video.creator.walletAddress ? `${video.creator.walletAddress.slice(0, 6)}...` : 'Unknown');
  };

  const getThumbnail = () => {
    // Use proxy route for all thumbnails to handle S3 authentication
    if (video.thumbnailUrl || video.thumbnail) {
      return `/api/videos/${video.id}/thumbnail`;
    }
    return "/logo.png";
  };

  const getViews = () => {
    return video.totalViews || video.views || 0;
  };

  const getDate = () => {
    const date = video.publishedAt || video.uploadDate;
    if (!date) return 'Recently';
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return date;
    }
  };

  return (
    <Link href={`/watch/${video.id}`}>
      <Card className="group overflow-hidden cursor-pointer">
        <div className="relative aspect-video overflow-hidden bg-white/2">
          <img 
            src={getThumbnail()}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = '/logo.png';
            }}
          />
          <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-light">{video.duration}s</div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-white font-light flex-1 line-clamp-2 group-hover:text-white/70 transition-colors duration-300 text-sm">{video.title}</h3>
            {video.category && (
              <Badge className="bg-white/10 backdrop-blur-md border-white/20 text-xs font-light shrink-0">{video.category}</Badge>
            )}
          </div>
          <p className="text-white/50 font-light text-xs mb-3">
            {getCreatorName()}
          </p>
          <div className="flex items-center justify-between text-xs text-white/50 font-light">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{getViews().toLocaleString()} views</span>
            </div>
            <span>{getDate()}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50 font-light">Price per second</span>
              <span className="text-white font-light">${Number(video.pricePerSecond).toFixed(4)}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
