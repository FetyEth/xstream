"use client";

import { useState, useRef, useEffect } from "react";
import Hls from "hls.js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize,
  Settings,
  DollarSign, 
  Zap, 
  AlertCircle,
  CheckCircle,
  Wallet
} from "lucide-react";

interface VideoPlayerProps {
  video: {
    id: string;
    title: string;
    creator: string;
    duration: string;
    pricePerSecond: number;
    maxQuality: string;
    videoUrl?: string;
  };
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [quality, setQuality] = useState(video.maxQuality);
  const [showStakeDialog, setShowStakeDialog] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("");
  const [currentSpent, setCurrentSpent] = useState(0);
  const [isStaked, setIsStaked] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [loadingUrl, setLoadingUrl] = useState(true);
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);
  const [currentQualityIndex, setCurrentQualityIndex] = useState<number>(-1);
  const [showSettings, setShowSettings] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch secure signed URL from backend
  useEffect(() => {
    async function fetchSecureUrl() {
      try {
        setLoadingUrl(true);
        const streamUrl = `/api/videos/${video.id}/stream`;
        setVideoSrc(streamUrl);
        setLoadingUrl(false);
      } catch (error) {
        console.error('Error setting stream URL:', error);
        setLoadingUrl(false);
      }
    }

    if (video.id) {
      fetchSecureUrl();
    }
  }, [video.id]);

  useEffect(() => {
    if (!videoSrc || !videoRef.current) return;

    const videoElement = videoRef.current;
    const isHLS = videoSrc.includes('.m3u8') || videoSrc.includes('/stream');

    if (isHLS && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      
      hlsRef.current = hls;
      hls.loadSource(videoSrc);
      hls.attachMedia(videoElement);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const qualities = hls.levels.map(l => `${l.height}p`);
        setAvailableQualities(['Auto', ...qualities]);
        setCurrentQualityIndex(0);
        hls.currentLevel = -1;
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (isHLS && videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = videoSrc;
    } else {
      videoElement.src = videoSrc;
    }
  }, [videoSrc]);

  // Calculate quality multiplier for pricing
  const getQualityMultiplier = (selectedQuality: string) => {
    const qualityMap: { [key: string]: number } = {
      '4K': 1.0,
      '1080p': 0.75,
      '720p': 0.5,
      '480p': 0.35,
      '240p': 0.2
    };
    return qualityMap[selectedQuality] || 1.0;
  };

  const getCurrentPricePerSecond = () => {
    return video.pricePerSecond * getQualityMultiplier(quality);
  };

  const calculateTotalCost = () => {
    const totalSeconds = typeof video.duration === 'number' ? video.duration : 0;
    return (getCurrentPricePerSecond() * totalSeconds).toFixed(2);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle quality change
  const changeQuality = (qualityIndex: number) => {
    if (!hlsRef.current) return;
    
    const hls = hlsRef.current;
    setCurrentQualityIndex(qualityIndex);
    
    if (qualityIndex === 0) {
      // Auto quality
      hls.currentLevel = -1;
      console.log('✅ Quality set to Auto');
    } else {
      // Specific quality (subtract 1 because index 0 is "Auto")
      hls.currentLevel = qualityIndex - 1;
      console.log(`✅ Quality set to ${availableQualities[qualityIndex]}`);
    }
    
    setShowSettings(false);
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Handle play/pause
  const togglePlayPause = () => {
    if (!isStaked) {
      setShowStakeDialog(true);
      return;
    }

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle stake submission
  const handleStakeSubmit = () => {
    const totalCost = parseFloat(calculateTotalCost());
    const userStake = parseFloat(stakeAmount);

    if (userStake >= totalCost) {
      setIsStaked(true);
      setShowStakeDialog(false);
      setShowPaymentConfirm(false);
      // Here you would integrate with x402 to actually stake the amount
    } else {
      alert(`Minimum stake required: $${totalCost}`);
    }
  };

  // Handle payment confirmation before watching
  const handlePaymentConfirm = () => {
    setShowPaymentConfirm(false);
    togglePlayPause();
  };

  // Update spending based on watch time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && isStaked) {
      interval = setInterval(() => {
        setCurrentSpent(prev => prev + getCurrentPricePerSecond());
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isStaked, quality]);

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showSettings && !target.closest('.quality-selector')) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettings]);

  // Available quality options (simplified for demo)
  const qualityOptions = ['4K', '1080p', '720p', '480p', '240p'].filter(q => 
    getQualityMultiplier(q) <= getQualityMultiplier(video.maxQuality)
  );

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <Card className="overflow-hidden">
        <div ref={containerRef} className="relative aspect-video bg-black">
          {loadingUrl && (
            <div className="absolute inset-0 flex items-center justify-center text-white z-[5] bg-black/50 backdrop-blur-sm">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Loading secure video stream...</p>
              </div>
            </div>
          )}
          {!loadingUrl && !videoSrc && (
            <div className="absolute inset-0 flex items-center justify-center text-white z-10">
              <p>Failed to load video. Please try again.</p>
            </div>
          )}
          {!loadingUrl && videoSrc && (
            <video
              ref={videoRef}
              className="w-full h-full"
              preload="metadata"
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={() => {
                setCurrentTime(0);
                console.log('✅ Video loaded successfully');
              }}
              onError={(e) => {
                console.error('❌ Video playback error');
                const videoElement = e.currentTarget;
                if (videoElement.error) {
                  console.error('Error code:', videoElement.error.code);
                  console.error('Error message:', videoElement.error.message);
                }
              }}
              onCanPlay={() => console.log('✅ Video ready to play')}
            />
          )}
          
          {/* Player Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent backdrop-blur-sm p-4">
            {/* Progress Bar */}
            <div 
              ref={progressBarRef}
              className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer group/progress"
              onClick={(e) => {
                if (videoRef.current && progressBarRef.current) {
                  const rect = progressBarRef.current.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newTime = (clickX / rect.width) * videoRef.current.duration;
                  videoRef.current.currentTime = newTime;
                }
              }}
            >
              <div 
                className="h-full bg-white rounded-full transition-all duration-300 group-hover/progress:h-1.5"
                style={{ 
                  width: videoRef.current ? `${(currentTime / videoRef.current.duration) * 100}%` : '0%' 
                }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlayPause}
                  className="text-white hover:text-white hover:bg-white/10 font-light"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-white hover:text-white hover:bg-white/10 font-light"
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20 accent-white"
                  />
                </div>

                <span className="text-sm font-light">
                  {formatTime(currentTime)} / {video.duration}
                </span>
              </div>

              <div className="flex items-center space-x-2 relative">
                {/* Quality Selector */}
                {availableQualities.length > 0 && (
                  <div className="relative quality-selector">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSettings(!showSettings)}
                      className="text-white hover:text-white hover:bg-white/10 font-light px-3"
                    >
                      <span className="text-sm">
                        {currentQualityIndex >= 0 ? availableQualities[currentQualityIndex] : 'Quality'}
                      </span>
                    </Button>
                    
                    {showSettings && (
                      <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-md rounded-lg border border-white/20 p-2 min-w-[120px]">
                        <div className="text-xs text-white/60 px-3 py-1 mb-1">Quality</div>
                        {availableQualities.map((qual, index) => (
                          <button
                            key={qual}
                            onClick={() => changeQuality(index)}
                            className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-white/10 transition-colors ${
                              currentQualityIndex === index ? 'text-blue-400' : 'text-white'
                            }`}
                          >
                            {qual} {currentQualityIndex === index && '✓'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Fullscreen Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:text-white hover:bg-white/10 font-light"
                >
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Stake Required Overlay */}
          {!isStaked && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center">
              <Card className="max-w-md w-full mx-4">
                <CardContent className="p-6 text-center">
                  <Wallet className="h-12 w-12 mx-auto mb-4 text-white" />
                  <h3 className="text-lg font-light mb-2 text-white">Stake to Watch</h3>
                  <p className="text-white/50 mb-4 font-light">
                    Stake funds to start watching. You&apos;ll only be charged for what you actually watch.
                  </p>
                  <Button onClick={() => setShowStakeDialog(true)} className="w-full">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Stake ${calculateTotalCost()}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </Card>

      {/* Payment Info */}
      {isStaked && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-white/10 border-white/20 text-white font-light">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Staked
                </Badge>
                <div className="text-sm font-light">
                  <span className="text-white/50">Current spend: </span>
                  <span className="text-white">${currentSpent.toFixed(4)}</span>
                </div>
                <div className="text-sm font-light">
                  <span className="text-white/50">Rate: </span>
                  <span className="text-white">${getCurrentPricePerSecond().toFixed(4)}/sec</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-white/70" />
                <span className="text-sm font-light text-white">Quality: {quality}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stake Dialog */}
      <Dialog open={showStakeDialog} onOpenChange={setShowStakeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-light">Stake Funds to Watch</DialogTitle>
            <DialogDescription className="font-light">
              Stake the maximum amount you&apos;re willing to spend. You&apos;ll only be charged for the time you actually watch.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-light text-white/70">Recommended Stake:</span>
                <span className="text-lg font-light text-white">${calculateTotalCost()}</span>
              </div>
              <p className="text-xs text-white/50 font-light">
                For full video at {quality} quality
              </p>
            </div>

            <div>
              <label className="block text-sm font-light mb-2 text-white/70">Stake Amount (USD)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                min={calculateTotalCost()}
                step="0.01"
              />
            </div>

            <div className="text-xs text-white/50 font-light space-y-1">
              <p>• Minimum stake: ${calculateTotalCost()}</p>
              <p>• Unused funds will be automatically refunded</p>
              <p>• Charges are calculated per second watched</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStakeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStakeSubmit}>
              <Wallet className="h-4 w-4 mr-2" />
              Stake ${stakeAmount || calculateTotalCost()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation Dialog */}
      <Dialog open={showPaymentConfirm} onOpenChange={setShowPaymentConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-light">Confirm Payment</DialogTitle>
            <DialogDescription className="font-light">
              Starting playback will begin charging ${getCurrentPricePerSecond().toFixed(4)} per second.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 border border-white/10 bg-white/[0.02] backdrop-blur-sm rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-4 w-4 text-white/70" />
              <span className="font-light text-white">Payment Authorization</span>
            </div>
            <p className="text-sm text-white/50 font-light">
              This video will charge you based on your watch time and selected quality.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={handlePaymentConfirm}>
              <Play className="h-4 w-4 mr-2" />
              Start Watching
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
