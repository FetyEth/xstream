"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import Link from "next/link";
import {
  Search,
  Filter,
  Music,
  Gamepad2,
  GraduationCap,
  Newspaper,
  Trophy,
  Film,
  Eye
} from "lucide-react";

// Temporary mock data as fallback
const mockVideos = [
  {
    id: "1",
    title: "Introduction to x402 Micropayments",
    creator: "CryptoEdu",
    thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=640&h=360&fit=crop",
    duration: "10:30",
    views: 15250,
    uploadDate: "2 days ago",
    pricePerSecond: 0.01,
    category: "Education"
  },
  {
    id: "2",
    title: "Building on Base Developer Guide",
    creator: "BaseBuilder",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=640&h=360&fit=crop",
    duration: "15:45",
    views: 23420,
    uploadDate: "1 day ago",
    pricePerSecond: 0.008,
    category: "Technology"
  },
  {
    id: "3",
    title: "NFT Rewards Loyalty Programs",
    creator: "Web3Creator",
    thumbnail: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=640&h=360&fit=crop",
    duration: "8:20",
    views: 8890,
    uploadDate: "3 days ago",
    pricePerSecond: 0.005,
    category: "Web3"
  },
  {
    id: "4",
    title: "Real-time Video Monetization",
    creator: "StreamTech",
    thumbnail: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=640&h=360&fit=crop",
    duration: "12:15",
    views: 19100,
    uploadDate: "5 hours ago",
    pricePerSecond: 0.012,
    category: "Business"
  },
  {
    id: "5",
    title: "Future of Content Creation",
    creator: "ContentKing",
    thumbnail: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=640&h=360&fit=crop",
    duration: "6:40",
    views: 12560,
    uploadDate: "1 day ago",
    pricePerSecond: 0.003,
    category: "Entertainment"
  },
  {
    id: "6",
    title: "Blockchain Explained Simply",
    creator: "EduChain",
    thumbnail: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=640&h=360&fit=crop",
    duration: "9:30",
    views: 31800,
    uploadDate: "2 days ago",
    pricePerSecond: 0.007,
    category: "Education"
  },
  {
    id: "7",
    title: "Smart Contract Security",
    creator: "SecureWeb3",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=640&h=360&fit=crop",
    duration: "14:20",
    views: 9420,
    uploadDate: "4 days ago",
    pricePerSecond: 0.011,
    category: "Technology"
  },
  {
    id: "8",
    title: "Creating NFT Collection",
    creator: "NFTMaster",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=640&h=360&fit=crop",
    duration: "11:45",
    views: 16730,
    uploadDate: "3 days ago",
    pricePerSecond: 0.009,
    category: "Web3"
  },
  {
    id: "9",
    title: "DeFi Protocols Explained",
    creator: "DeFiGuru",
    thumbnail: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=640&h=360&fit=crop",
    duration: "13:15",
    views: 14230,
    uploadDate: "1 day ago",
    pricePerSecond: 0.009,
    category: "Finance"
  },
  {
    id: "10",
    title: "Web3 Gaming Revolution",
    creator: "GameChain",
    thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=640&h=360&fit=crop",
    duration: "16:40",
    views: 18950,
    uploadDate: "2 days ago",
    pricePerSecond: 0.010,
    category: "Gaming"
  },
  {
    id: "11",
    title: "Crypto Trading Strategies",
    creator: "TradeWizard",
    thumbnail: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=640&h=360&fit=crop",
    duration: "11:25",
    views: 22140,
    uploadDate: "3 days ago",
    pricePerSecond: 0.011,
    category: "Finance"
  },
  {
    id: "12",
    title: "Music NFTs and Royalties",
    creator: "MusicDAO",
    thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=640&h=360&fit=crop",
    duration: "9:50",
    views: 16320,
    uploadDate: "1 day ago",
    pricePerSecond: 0.008,
    category: "Music"
  }
];

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
    return video.thumbnail || video.thumbnailUrl || 
           "/logo.png";
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
        <div className="relative aspect-video overflow-hidden bg-white/[0.02]">
          <img 
            src={getThumbnail()}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgdmlld0JveD0iMCAwIDY0MCAzNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2NDAiIGhlaWdodD0iMzYwIiBmaWxsPSIjMUExQTFBIi8+CjxwYXRoIGQ9Ik0yODAgMTYwQzI4MCAxNDguOTU0IDI4OC45NTQgMTQwIDMwMCAxNDBIMzQwQzM1MS4wNDYgMTQwIDM2MCAxNDguOTU0IDM2MCAxNjBWMjAwQzM2MCAyMTEuMDQ2IDM1MS4wNDYgMjIwIDM0MCAyMjBIMzAwQzI4OC45NTQgMjIwIDI4MCAyMTEuMDQ2IDI4MCAyMDBWMTYwWiIgZmlsbD0iIzRBNEE0QSIvPgo8cGF0aCBkPSJNMzIwIDE5MFYxNzBMMzQwIDE4MEwzMjAgMTkwWiIgZmlsbD0iIzFBMUExQSIvPgo8L3N2Zz4=";
            }}
          />
          <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-light">{video.duration}</div>
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
