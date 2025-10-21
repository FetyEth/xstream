"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  PlayCircle,
  Upload,
  Settings,
  BarChart3,
  Users,
  Zap
} from "lucide-react";
import Image from "next/image";

export default function AdvertisePage() {
  const [adTitle, setAdTitle] = useState("");
  const [adDescription, setAdDescription] = useState("");
  const [targetVideo, setTargetVideo] = useState("");
  const [adBudget, setAdBudget] = useState("");
  const [adDuration, setAdDuration] = useState("30");

  // Mock data for existing campaigns
  const adCampaigns = [
    {
      id: "1",
      title: "Base Blockchain Tutorial",
      targetVideo: "Introduction to x402",
      budget: 50.00,
      spent: 23.45,
      views: 1240,
      skips: 89,
      status: "active"
    },
    {
      id: "2",
      title: "DeFi Investment Guide",
      targetVideo: "Building on Base",
      budget: 100.00,
      spent: 67.80,
      views: 2850,
      skips: 234,
      status: "active"
    }
  ];

  const adStats = [
    {
      title: "Total Ad Spend",
      value: "$1,234",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-gray-400"
    },
    {
      title: "Total Views",
      value: "45.2K",
      change: "+18.3%",
      icon: Eye,
      color: "text-gray-400"
    },
    {
      title: "Skip Rate",
      value: "15.4%",
      change: "-5.2%",
      icon: Target,
      color: "text-gray-400"
    },
    {
      title: "Active Campaigns",
      value: "8",
      change: "+2",
      icon: TrendingUp,
      color: "text-gray-400"
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="mt-2 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src='/logo.png' alt='xStream Logo' width={36} height={36} />
              <div>
                <h2 className="text-white font-light text-lg">Creator Studio - Advertising</h2>
                <p className="text-white/50 font-light text-xs">Reach your audience with targeted ads</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex flex-col items-start gap-3 mb-4">
            <h1 className="text-4xl font-light text-white">Advertise on xStream</h1>
            <p className="text-white/70 text-sm font-light">Create campaigns, track performance, and grow your reach</p>
          </div>
        </div>

        <Tabs defaultValue="create" className="mb-8 text-sm font-light">
          <TabsList>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Create Ad
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              My Campaigns
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Create Ad Tab */}
          <TabsContent value="create" className="mt-8 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ad Creation Form */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white font-light">
                      <Upload className="h-5 w-5" />
                      <span>Create New Ad</span>
                    </CardTitle>
                    <CardDescription className="text-white/70 font-light">
                      Upload your ad and set targeting preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-light text-white mb-2">Ad Title</label>
                      <Input
                        placeholder="Enter ad title"
                        value={adTitle}
                        onChange={(e) => setAdTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-light text-white mb-2">Description</label>
                      <Textarea
                        placeholder="Describe your ad"
                        value={adDescription}
                        onChange={(e) => setAdDescription(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-light text-white mb-2">Ad Video</label>
                      <div className="border-2 border-dashed border-white/10 rounded-md p-6 text-center bg-white/[0.02] backdrop-blur-xl">
                        <PlayCircle className="h-12 w-12 mx-auto mb-2 text-white/50" />
                        <p className="text-sm text-white/70 mb-2 font-light">
                          Upload your ad video
                        </p>
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </Button>
                        <p className="text-xs text-white/50 mt-2 font-light">
                          Max duration: 60 seconds | Formats: MP4, MOV
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-light text-white mb-2">Ad Duration</label>
                      <Select value={adDuration} onValueChange={setAdDuration}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 seconds</SelectItem>
                          <SelectItem value="30">30 seconds</SelectItem>
                          <SelectItem value="60">60 seconds</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Ad Preview & Pricing */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-white font-light">Pricing Model</CardTitle>
                    <CardDescription className="text-white/70 font-light">
                      xStream&apos;s unique ad pricing system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-white/[0.02] rounded-md border border-white/10 backdrop-blur-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-white/70" />
                          <span className="font-light text-white">Pay-Per-View Model</span>
                        </div>
                        <p className="text-xs font-light text-white/70">
                          You only pay when viewers actually watch your ad, not for impressions
                        </p>
                      </div>

                      <div className="p-4 bg-white/[0.02] rounded-md border border-white/10 backdrop-blur-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-white/70" />
                          <span className="font-light text-white">Skip Revenue Share</span>
                        </div>
                        <p className="text-xs font-light text-white/70">
                          When viewers skip ads, they pay via x402 - creators and you both earn
                        </p>
                      </div>

                      <div className="p-4 bg-white/[0.02] rounded-md border border-white/10 backdrop-blur-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-white/70" />
                          <span className="font-light text-white">Quality Targeting</span>
                        </div>
                        <p className="text-xs font-light text-white/70">
                          Target viewers by video quality preference and engagement patterns
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white font-light">
                      <Target className="h-5 w-5" />
                      <span>Targeting</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-light text-white mb-2">Target Video</label>
                      <Select value={targetVideo} onValueChange={setTargetVideo}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a video to show your ad on" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="intro-x402">Introduction to x402 Micropayments</SelectItem>
                          <SelectItem value="base-dev">Building on Base: Developer Guide</SelectItem>
                          <SelectItem value="nft-rewards">NFT Rewards & Loyalty Programs</SelectItem>
                          <SelectItem value="any">Any video (platform choice)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-white/50 mt-1 font-light">
                        Choose specific videos or let xStream optimize placement
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-light text-white mb-2">Budget (USD)</label>
                      <Input
                        type="number"
                        placeholder="50.00"
                        value={adBudget}
                        onChange={(e) => setAdBudget(e.target.value)}
                        min="10"
                        step="1"
                      />
                      <p className="text-xs text-white/50 mt-1 font-light">
                        Minimum budget: $10 | You pay only when viewers watch your ad
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Cost Estimate Card - always at bottom */}
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-white font-light">Cost Estimate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70 font-light">Base cost per view:</span>
                      <span className="font-light text-white">$0.02</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70 font-light">Estimated views with ${adBudget || '0'} budget:</span>
                      <span className="font-light text-white">{adBudget ? Math.floor(parseFloat(adBudget) / 0.02) : 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70 font-light">Platform fee (10%):</span>
                      <span className="font-light text-white">${adBudget ? (parseFloat(adBudget) * 0.1).toFixed(2) : '0.00'}</span>
                    </div>
                    <div className="border-t border-white/10 pt-2">
                      <div className="flex justify-between font-light text-white">
                        <span>Total budget needed:</span>
                        <span>${adBudget ? (parseFloat(adBudget) * 1.1).toFixed(2) : '0.00'}</span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-4" disabled={!adTitle || !adBudget}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Create Ad Campaign
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Campaigns Tab */}
          <TabsContent value="campaigns" className="mt-8 space-y-6">
            <div className="space-y-4">
              {adCampaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-12 bg-white/10 rounded flex items-center justify-center backdrop-blur-xl">
                          <PlayCircle className="h-6 w-6 text-white/50" />
                        </div>
                        <div>
                          <h4 className="font-light text-white">{campaign.title}</h4>
                          <p className="text-sm text-white/70 font-light">Target: {campaign.targetVideo}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                              {campaign.status}
                            </Badge>
                            <span className="text-xs text-white/70 font-light">
                              {campaign.views.toLocaleString()} views
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-light text-white">
                          ${campaign.spent.toFixed(2)} / ${campaign.budget.toFixed(2)}
                        </p>
                        <p className="text-sm text-white/70 font-light">
                          {campaign.skips} skips ({((campaign.skips / campaign.views) * 100).toFixed(1)}%)
                        </p>
                        <div className="flex space-x-2 mt-2">
                          <Button size="sm" variant="outline">
                            <Settings className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <BarChart3 className="h-3 w-3 mr-1" />
                            Stats
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-8 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {adStats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-light text-white/70">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-light text-white">{stat.value}</p>
                        <p className="text-sm font-light text-white/70">{stat.change} this week</p>
                      </div>
                      <stat.icon className="h-8 w-8 text-white/50" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-white font-light">Performance Insights</CardTitle>
                <CardDescription className="text-white/70 font-light">
                  Key metrics and recommendations for your ad campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-white/[0.02] rounded-md backdrop-blur-xl border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-white/70" />
                      <span className="font-light text-white">
                        High Engagement
                      </span>
                    </div>
                    <p className="text-sm text-white/70 font-light">
                      Your &quot;Base Blockchain Tutorial&quot; ad has 85% completion rate - consider increasing budget
                    </p>
                  </div>

                  <div className="p-4 bg-white/[0.02] rounded-md backdrop-blur-xl border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <Eye className="h-4 w-4 text-white/70" />
                      <span className="font-light text-white">
                        Peak Hours
                      </span>
                    </div>
                    <p className="text-sm text-white/70 font-light">
                      Best performance between 7-9 PM on weekdays - optimize your scheduling
                    </p>
                  </div>

                  <div className="p-4 bg-white/[0.02] rounded-md backdrop-blur-xl border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-4 w-4 text-white/70" />
                      <span className="font-light text-white">
                        Audience Preference
                      </span>
                    </div>
                    <p className="text-sm text-white/70 font-light">
                      Viewers prefer 30-second ads over 60-second ones - 23% better completion rate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}