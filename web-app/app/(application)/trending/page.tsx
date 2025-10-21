"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import Link from "next/link";
import { Eye, Flame } from "lucide-react";
import { formatDuration, formatRelativeTime, formatCreatorName } from "@/lib/video-utils";

export default function TrendingPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrendingVideos() {
      try {
        const response = await fetch('/api/videos?sortBy=popular&limit=12');
        if (response.ok) {
          const data = await response.json();
          setVideos(data.videos || []);
        }
      } catch (error) {
        console.error('Failed to fetch trending videos:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrendingVideos();
  }, []);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex flex-col items-start gap-3 mb-4">
            <h1 className="text-4xl font-light text-white">Trending Now</h1>
            <p className="text-white/50 text-sm font-light">Most popular videos on xStream right now</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loading text="Loading trending videos..." size="md" />
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-white text-lg font-light mb-2">No trending videos yet</p>
            <p className="text-white/50 font-light mb-4">Check back soon for popular content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VideoCard({ video }: { video: any }) {
  const getThumbnail = () => {
    return video.thumbnailUrl || video.thumbnail || 
           "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgdmlld0JveD0iMCAwIDY0MCAzNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2NDAiIGhlaWdodD0iMzYwIiBmaWxsPSIjMUExQTFBIi8+CjxwYXRoIGQ9Ik0yODAgMTYwQzI4MCAxNDguOTU0IDI4OC45NTQgMTQwIDMwMCAxNDBIMzQwQzM1MS4wNDYgMTQwIDM2MCAxNDguOTU0IDM2MCAxNjBWMjAwQzM2MCAyMTEuMDQ2IDM1MS4wNDYgMjIwIDM0MCAyMjBIMzAwQzI4OC45NTQgMjIwIDI4MCAyMTEuMDQ2IDI4MCAyMDBWMTYwWiIgZmlsbD0iIzRBNEE0QSIvPgo8cGF0aCBkPSJNMzIwIDE5MFYxNzBMMzQwIDE4MEwzMjAgMTkwWiIgZmlsbD0iIzFBMUExQSIvPgo8L3N2Zz4=";
  };

  const viewCount = video.totalViews || 0;
  const durationDisplay = typeof video.duration === 'number' ? formatDuration(video.duration) : video.duration;
  const uploadDate = video.publishedAt ? formatRelativeTime(video.publishedAt) : 'Recently';
  const creatorName = formatCreatorName(video.creator);
  const priceDisplay = typeof video.pricePerSecond === 'string' 
    ? parseFloat(video.pricePerSecond).toFixed(4)
    : video.pricePerSecond.toFixed(4);
  const trendingScore = Math.round(viewCount / 50);

  return (
    <Link href={`/watch/${video.id}`}>
      <Card className="group overflow-hidden cursor-pointer">
        <div className="relative aspect-video overflow-hidden bg-white/[0.02]">
          <img
            src={getThumbnail()}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgdmlld0JveD0iMCAwIDY0MCAzNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2NDAiIGhlaWdodD0iMzYwIiBmaWxsPSIjMUExQTFBIi8+CjxwYXRoIGQ9Ik0yODAgMTYwQzI4MCAxNDguOTU0IDI4OC45NTQgMTQwIDMwMCAxNDBIMzQwQzM1MS4wNDYgMTQwIDM2MCAxNDguOTU0IDM2MCAxNjBWMjAwQzM2MCAyMTEuMDQ2IDM1MS4wNDYgMjIwIDM0MCAyMjBIMzAwQzI4OC45NTQgMjIwIDI4MCAyMTEuMDQ2IDI4MCAyMDBWMTYwWiIgZmlsbD0iIzRBNEE0QSIvPgo8cGF0aCBkPSJNMzIwIDE5MFYxNzBMMzQwIDE4MEwzMjAgMTkwWiIgZmlsbD0iIzFBMUExQSIvPgo8L3N2Zz4=";
            }}
          />
          <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-light">
            {durationDisplay}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-white font-light flex-1 line-clamp-2 group-hover:text-white/70 transition-colors duration-300 text-sm">
              {video.title}
            </h3>
            <Badge className="bg-white/10 backdrop-blur-md border-white/20 text-xs font-light shrink-0 flex items-center gap-1">
              <Flame className="w-3 h-3" />
              {trendingScore}
            </Badge>
          </div>
          <p className="text-white/50 font-light text-xs mb-3">{creatorName}</p>
          <div className="flex items-center justify-between text-xs text-white/50 font-light">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{viewCount.toLocaleString()} views</span>
            </div>
            <span>{uploadDate}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50 font-light">Price per second</span>
              <span className="text-white font-light">${priceDisplay}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
