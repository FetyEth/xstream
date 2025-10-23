"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { Name } from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";
import {
  ThumbsUp,
  ThumbsDown,
  Share,
  Download,
  Flag,
  Eye,
  Calendar,
  DollarSign,
  Users,
} from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";

export default function WatchPage() {
  const params = useParams();
  const videoId = params.id;
  const { user } = useUser();
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch video data
  useEffect(() => {
    async function fetchVideo() {
      if (!videoId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/videos/${videoId}`);

        if (!response.ok) {
          throw new Error("Video not found");
        }

        const data = await response.json();
        setVideo(data.video);
        setLikeCount(data.video.totalLikes || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load video");
      } finally {
        setLoading(false);
      }
    }

    fetchVideo();
  }, [videoId]);

  // Fetch like status and subscription status
  useEffect(() => {
    async function fetchUserStatus() {
      if (!user || !videoId || !video) return;

      try {
        // Check if user liked the video
        const likeResponse = await fetch(`/api/videos/${videoId}/like?userId=${user.id}`);
        if (likeResponse.ok) {
          const likeData = await likeResponse.json();
          setIsLiked(likeData.liked);
        }

        // Check if user is subscribed to creator
        if (video.creator?.walletAddress) {
          const subResponse = await fetch(
            `/api/users/${video.creator.walletAddress}/subscribe?userId=${user.id}`
          );
          if (subResponse.ok) {
            const subData = await subResponse.json();
            setIsSubscribed(subData.subscribed);
            setSubscriberCount(subData.subscriberCount || 0);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user status:', err);
      }
    }

    fetchUserStatus();
  }, [user, videoId, video]);

  // Handle like toggle
  const handleLike = async () => {
    if (!user || actionLoading) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/videos/${videoId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle subscribe toggle
  const handleSubscribe = async () => {
    if (!user || !video?.creator?.walletAddress || actionLoading) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/users/${video.creator.walletAddress}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      if (response.ok) {
        const data = await response.json();
        setIsSubscribed(data.subscribed);
        setSubscriberCount(prev => data.subscribed ? prev + 1 : prev - 1);
      }
    } catch (err) {
      console.error('Failed to toggle subscription:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Loading video..." size="lg" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-white font-light mb-4">
            {error || "Video not found"}
          </p>
          <Button onClick={() => (window.location.href = "/browse")}>
            Back to Browse
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Video Player */}
          <VideoPlayer
            video={video}
            connectedWallet={{
              address: address || "",
              isConnected: isConnected,
            }}
            onBalanceUpdate={(newBalance) =>
              console.log("Balance updated:", newBalance)
            }
          />

          {/* Video Info */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Title and Stats */}
                <div>
                  <h1 className="text-2xl font-light text-white mb-2">
                    {video.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-white/50 font-light">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>
                        {video.totalViews?.toLocaleString() || 0} views
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(video.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>
                        ${parseFloat(video.pricePerSecond).toFixed(3)}/sec
                      </span>
                    </div>
                  </div>
                </div>

                {/* Creator Info and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={video.creator?.profileImage || undefined}
                      />
                      <AvatarFallback>
                        {video.creator?.displayName
                          ?.slice(0, 2)
                          .toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-light text-white">
                        <Name
                          address={
                            video.creator?.walletAddress as `0x${string}`
                          }
                        />
                      </h3>
                      <p className="text-sm text-white/50 font-light">
                        {video.creator?.walletAddress?.slice(0, 6)}...
                        {video.creator?.walletAddress?.slice(-4)}
                      </p>
                    </div>
                    <Button variant="default" className="ml-4">
                      Subscribe
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center bg-white/[0.02] border border-white/10 rounded-full">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-l-full"
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />0
                      </Button>
                      <div className="w-px h-6 bg-white/10" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-r-full"
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />0
                      </Button>
                    </div>
                    <Button variant="outline" size="sm">
                      <Share className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* xStream Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/[0.02] rounded-md border border-white/10">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-white/70" />
                    <div>
                      <p className="text-sm font-light text-white">
                        Pay per Second
                      </p>
                      <p className="text-xs text-white/50 font-light">
                        Only pay for what you watch
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-white/70" />
                    <div>
                      <p className="text-sm font-light text-white">
                        Direct to Creator
                      </p>
                      <p className="text-xs text-white/50 font-light">
                        ${parseFloat(video.totalEarnings || "0").toFixed(2)}{" "}
                        earned
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-white/70" />
                    <div>
                      <p className="text-sm font-light text-white">
                        Earn NFT Rewards
                      </p>
                      <p className="text-xs text-white/50 font-light">
                        Watch to unlock rewards
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="font-light text-white">Description</h4>
                  <p className="text-white/50 font-light leading-relaxed">
                    {video.description || "No description available"}
                  </p>
                  {/* Tags */}
                  {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {video.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-light text-white mb-4">Comments</h3>
              <div className="text-center py-8 text-white/50 font-light">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Comments coming soon...</p>
                <p className="text-sm">
                  Connect your wallet to leave a comment
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
