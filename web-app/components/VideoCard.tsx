"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, Eye, DollarSign, Zap } from "lucide-react";
import Link from "next/link";
import { formatDuration, formatRelativeTime, formatCreatorName } from "@/lib/video-utils";

interface Video {
  id: string;
  title: string;
  creator?: any;
  thumbnailUrl?: string;
  thumbnail?: string;
  duration: number | string;
  totalViews?: number;
  views?: number;
  publishedAt?: string | Date;
  uploadDate?: string;
  pricePerSecond: number | string;
  maxQuality?: string;
  description?: string;
  category?: string;
}

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  const calculateTotalPrice = (pricePerSecond: number | string, duration: number | string) => {
    const price = typeof pricePerSecond === 'string' ? parseFloat(pricePerSecond) : pricePerSecond;
    
    let totalSeconds: number;
    if (typeof duration === 'number') {
      totalSeconds = duration;
    } else {
      const parts = duration.split(':');
      const minutes = parseInt(parts[0]) || 0;
      const seconds = parseInt(parts[1]) || 0;
      totalSeconds = minutes * 60 + seconds;
    }
    
    return (price * totalSeconds).toFixed(2);
  };

  const thumbnailUrl = (video.thumbnailUrl || video.thumbnail) 
    ? `/api/videos/${video.id}/thumbnail` 
    : '';
  const viewCount = video.totalViews ?? video.views ?? 0;
  const uploadDate = video.publishedAt 
    ? formatRelativeTime(video.publishedAt)
    : video.uploadDate || '';
  const durationDisplay = typeof video.duration === 'number' 
    ? formatDuration(video.duration)
    : video.duration;
  const creatorName = formatCreatorName(video.creator);
  const creatorInitials = typeof video.creator === 'string'
    ? video.creator.slice(0, 2).toUpperCase()
    : (video.creator?.displayName?.slice(0, 2).toUpperCase() || '??');

  return (
    <Card className="group">
      <div className="relative">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-white/2 overflow-hidden">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0xNDUgNzBjMCA1LjUyMyA0LjQ3NyAxMCAxMCAxMHMxMC00LjQ3NyAxMC0xMC00LjQ3Ny0xMC0xMC0xMC0xMCA0LjQ3Ny0xMCAxMHoiIGZpbGw9IiM5Y2EzYWYiLz4KPHN2ZyBjbGFzcz0idzYgaDYgdGV4dC1ncmF5LTQwMCIgZmlsbD0iY3VycmVudENvbG9yIiB2aWV3Qm94PSIwIDAgMjAgMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTQgM2ExIDEgMCAwMC0xIDF2MTJhMSAxIDAgMDAxIDFoMTJhMSAxIDAgMDAxLTFWNGExIDEgMCAwMC0xLTFINHptNSA4YTMgMyAwIDAwMy0zVjZhNSA1IDAgMTAtNSA1eiIgY2xpcC1ydWxlPSJldmVub2RkIj48L3BhdGg+Cjwvc3ZnPgo8L3N2Zz4=";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-white text-xs px-2 py-1 rounded font-light">
            {durationDisplay}
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50 backdrop-blur-sm">
            <div className="bg-white text-black rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play className="h-6 w-6" fill="currentColor" />
            </div>
          </div>
        </div>

        {video.maxQuality && (
          <Badge className="absolute top-2 left-2 bg-white/10 backdrop-blur-md border-white/20 text-white font-light">
            {video.maxQuality}
          </Badge>
        )}

        <Badge variant="secondary" className="absolute top-2 right-2 bg-white/10 backdrop-blur-md border-white/20 text-white font-light">
          <DollarSign className="h-3 w-3 mr-1" />
          ${calculateTotalPrice(video.pricePerSecond, video.duration)}
        </Badge>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={typeof video.creator === 'object' ? video.creator?.profileImage : undefined} />
              <AvatarFallback>{creatorInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-light text-white/70 truncate">
                {creatorName}
              </p>
            </div>
          </div>

          <Link href={`/watch/${video.id}`}>
            <h3 className="font-light text-white line-clamp-2 hover:text-white/70 cursor-pointer transition-colors duration-300">
              {video.title}
            </h3>
          </Link>

          {video.description && (
            <p className="text-sm text-white/50 line-clamp-2 font-light">
              {video.description}
            </p>
          )}
          <div className="flex items-center justify-between text-sm text-white/50 font-light">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{viewCount.toLocaleString()}</span>
              </div>
              <span>{uploadDate}</span>
            </div>
          </div>

          {/* Pricing info */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center space-x-2 text-sm font-light">
              <Zap className="h-4 w-4 text-white/70" />
              <span className="text-white/50">
                ${video.pricePerSecond}/sec
              </span>
            </div>
            
            <Link href={`/watch/${video.id}`}>
              <Button size="sm">
                <Play className="h-4 w-4 mr-2" />
                Watch
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
