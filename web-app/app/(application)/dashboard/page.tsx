"use client";

import { useState, useEffect } from "react";
import { Name } from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  Eye, 
  Clock, 
  TrendingUp, 
  Video, 
  Users, 
  Award,
  Download,
  Wallet,
  Zap,
  PlayCircle,
  Calendar,
  Star
} from "lucide-react";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [userStats, setUserStats] = useState({
    totalSpent: 0,
    totalWatchTime: 0,
    videosWatched: 0,
    nftsEarned: 0,
    favoriteCreators: 0
  });
  const [creatorStats, setCreatorStats] = useState({
    totalEarned: 0,
    totalViews: 0,
    totalVideos: 0,
    subscribers: 0,
    avgViewDuration: 0
  });

  // Fetch user stats when wallet connects
  useEffect(() => {
    if (address && isConnected) {
      fetch(`/api/users/${address}/stats`)
        .then(res => res.json())
        .then(data => {
          if (data.stats) {
            setUserStats({
              totalSpent: data.stats.totalSpent || 0,
              totalWatchTime: data.stats.totalWatchTime || 0,
              videosWatched: data.viewSessions?.length || 0,
              nftsEarned: 0,
              favoriteCreators: 0
            });
            setCreatorStats({
              totalEarned: data.stats.totalEarned || 0,
              totalViews: data.stats.totalViews || 0,
              totalVideos: data.stats.totalVideos || 0,
              subscribers: 0,
              avgViewDuration: 0
            });
          }
        })
        .catch(err => console.error('Failed to fetch stats:', err));
    }
  }, [address, isConnected]);

  // Note: These are placeholders - in a full implementation, fetch from API
  const recentVideos: any[] = [];
  const recentActivity: any[] = [];

  const nftMilestones = [
    { name: "First Video", description: "Watched your first video", earned: true, icon: "🎬" },
    { name: "10 Minutes", description: "Watched 10 minutes of content", earned: true, icon: "⏰" },
    { name: "Early Adopter", description: "Joined the platform early", earned: true, icon: "🚀" },
    { name: "Supporter", description: "Spent $10 on content", earned: false, icon: "💝" },
    { name: "Binge Watcher", description: "Watch 100 minutes", earned: false, icon: "📺" },
  ];

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col items-start gap-3 mb-4">
            <h1 className="text-4xl font-light text-white">
              {isConnected && address ? (
                <> Welcome back, <Name address={address} className="text-white/70" /> </>
              ) : (
                <>Dashboard</>
              )}
            </h1>
            <p className="text-white/50 text-sm font-light">Track your xStream activity and earnings</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList>
            <TabsTrigger value="overview">
              <TrendingUp className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="creator">
              <Video className="w-4 h-4 mr-2" />
              Creator Analytics
            </TabsTrigger>
            <TabsTrigger value="viewer">
              <Eye className="w-4 h-4 mr-2" />
              Viewer Stats
            </TabsTrigger>
            <TabsTrigger value="nfts">
              <Award className="w-4 h-4 mr-2" />
              NFT Collection
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-8">
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-light text-white/50">Total Earned</p>
                        <p className="text-2xl font-light text-white">${creatorStats.totalEarned}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-white/70" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-light text-white/50">Total Spent</p>
                        <p className="text-2xl font-light text-white">${userStats.totalSpent}</p>
                      </div>
                      <Wallet className="h-8 w-8 text-white/70" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-light text-white/50">Watch Time</p>
                        <p className="text-2xl font-light text-white">
                          {Math.floor(userStats.totalWatchTime / 60)}h {userStats.totalWatchTime % 60}m
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-white/70" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-light text-white/50">NFTs Earned</p>
                        <p className="text-2xl font-light text-white">{userStats.nftsEarned}</p>
                      </div>
                      <Award className="h-8 w-8 text-white/70" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-light">Recent Activity</CardTitle>
                  <CardDescription className="font-light">Your latest transactions and activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.length === 0 ? (
                      <p className="text-sm text-white/50 font-light text-center py-8">No recent activity</p>
                    ) : (
                      recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                activity.type === "earn"
                                  ? "bg-white/70"
                                  : activity.type === "watch"
                                  ? "bg-white/50"
                                  : "bg-white/30"
                              }`}
                            />
                            <div>
                              <p className="text-sm font-light text-white">{activity.description}</p>
                              <p className="text-xs text-white/40 font-light">{activity.time}</p>
                            </div>
                          </div>
                          <div className="text-sm font-light text-white">
                            {activity.amount !== 0 && (activity.amount > 0 ? "+" : "")}
                            {activity.amount !== 0 ? `$${Math.abs(activity.amount).toFixed(2)}` : ""}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Creator Analytics Tab */}
          <TabsContent value="creator" className="mt-8">
            <div className="space-y-6">
              {/* Creator Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-light text-white/50">Total Views</p>
                        <p className="text-2xl font-light text-white">{creatorStats.totalViews.toLocaleString()}</p>
                      </div>
                      <Eye className="h-8 w-8 text-white/70" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-light text-white/50">Subscribers</p>
                        <p className="text-2xl font-light text-white">{creatorStats.subscribers}</p>
                      </div>
                      <Users className="h-8 w-8 text-white/70" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-light text-white/50">Videos Published</p>
                        <p className="text-2xl font-light text-white">{creatorStats.totalVideos}</p>
                      </div>
                      <Video className="h-8 w-8 text-white/70" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-light text-white/50">Avg Watch Time</p>
                        <p className="text-2xl font-light text-white">{creatorStats.avgViewDuration}m</p>
                      </div>
                      <Clock className="h-8 w-8 text-white/70" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Video Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-light">Video Performance</CardTitle>
                  <CardDescription className="font-light">Your recent videos and their performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentVideos.length === 0 ? (
                      <p className="text-sm text-white/50 font-light text-center py-8">No videos yet</p>
                    ) : (
                      recentVideos.map((video) => (
                        <div key={video.id} className="flex items-center justify-between p-4 border border-white/10 rounded-md bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-12 bg-white/[0.02] rounded flex items-center justify-center">
                              <PlayCircle className="h-6 w-6 text-white/50" />
                            </div>
                            <div>
                              <h4 className="font-light text-white">{video.title}</h4>
                              <div className="flex items-center space-x-4 text-sm text-white/50 font-light">
                                <span className="flex items-center">
                                  <Eye className="h-3 w-3 mr-1" />
                                  {video.views.toLocaleString()}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {video.duration}
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {video.uploadDate}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-light text-white">${video.earned}</p>
                            <p className="text-sm text-white/50 font-light">earned</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Viewer Stats Tab */}
          <TabsContent value="viewer" className="mt-8">
            <div className="space-y-6">
              {/* Viewer Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-light text-white/50">Videos Watched</p>
                        <p className="text-2xl font-light text-white">{userStats.videosWatched}</p>
                      </div>
                      <Video className="h-8 w-8 text-white/70" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-light text-white/50">Favorite Creators</p>
                        <p className="text-2xl font-light text-white">{userStats.favoriteCreators}</p>
                      </div>
                      <Star className="h-8 w-8 text-white/70" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-light text-white/50">Avg Cost/Min</p>
                        <p className="text-2xl font-light text-white">
                          {userStats.totalWatchTime > 0
                            ? (userStats.totalSpent / userStats.totalWatchTime).toFixed(3)
                            : "0.000"}
                        </p>
                      </div>
                      <Zap className="h-8 w-8 text-white/70" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Spending Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-light">Spending Insights</CardTitle>
                  <CardDescription className="font-light">How you're using xStream</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/[0.02] rounded-md border border-white/10">
                      <h4 className="font-light text-white mb-2">Most Watched Quality</h4>
                      <p className="text-sm text-white/50 font-light">1080p (78% of watch time) - You prefer high quality content</p>
                    </div>

                    <div className="p-4 bg-white/[0.02] rounded-md border border-white/10">
                      <h4 className="font-light text-white mb-2">Savings vs Traditional</h4>
                      <p className="text-sm text-white/50 font-light">You've saved ~$15.67 compared to traditional subscriptions</p>
                    </div>

                    <div className="p-4 bg-white/[0.02] rounded-md border border-white/10">
                      <h4 className="font-light text-white mb-2">Peak Watching Time</h4>
                      <p className="text-sm text-white/50 font-light">7-9 PM weekdays - Perfect for evening learning sessions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* NFT Collection Tab */}
          <TabsContent value="nfts" className="mt-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-light">NFT Collection</CardTitle>
                  <CardDescription className="font-light">Milestone NFTs earned through your xStream activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nftMilestones.map((nft, index) => (
                      <div
                        key={index}
                        className={`p-4 border rounded-md transition-all duration-300 ${
                          nft.earned
                            ? "bg-white/[0.05] border-white/20 hover:bg-white/[0.08]"
                            : "bg-white/[0.02] border-white/10 hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-2">{nft.earned ? nft.icon : "🔒"}</div>
                          <h4 className="font-light mb-1 text-white">{nft.name}</h4>
                          <p className="text-xs text-white/50 font-light">{nft.description}</p>
                          {nft.earned && (
                            <Badge variant="secondary" className="mt-2">Earned</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* NFT Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-light">NFT Benefits</CardTitle>
                  <CardDescription className="font-light">Unlock rewards and perks with your NFT collection</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-md border border-white/10 hover:bg-white/[0.04] transition-colors duration-300">
                      <div>
                        <h4 className="font-light text-white">Early Access</h4>
                        <p className="text-sm text-white/50 font-light">Get early access to new creator content</p>
                      </div>
                      <Badge variant="secondary" className="bg-white/10 border-white/20 text-white">Active</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-md border border-white/10 hover:bg-white/[0.04] transition-colors duration-300">
                      <div>
                        <h4 className="font-light text-white">Exclusive Discounts</h4>
                        <p className="text-sm text-white/50 font-light">10% off premium content (Requires 5 NFTs)</p>
                      </div>
                      <Badge variant="outline">Locked</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-md border border-white/10 hover:bg-white/[0.04] transition-colors duration-300">
                      <div>
                        <h4 className="font-light text-white">Creator Chat Access</h4>
                        <p className="text-sm text-white/50 font-light">Direct chat with your favorite creators (Requires 10 NFTs)</p>
                      </div>
                      <Badge variant="outline">Locked</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}