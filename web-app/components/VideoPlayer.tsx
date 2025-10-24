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
    creatorWallet: string;
    duration: string;
    pricePerSecond: number;
    maxQuality: string;
    videoUrl?: string;
  };
  connectedWallet?: {
    address: string;
    isConnected: boolean;
  };
  onBalanceUpdate?: (newBalance: number) => void;
}

export default function VideoPlayer({ video, connectedWallet, onBalanceUpdate }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [quality, setQuality] = useState(video.maxQuality);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [currentSpent, setCurrentSpent] = useState(0);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [loadingUrl, setLoadingUrl] = useState(true);
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);
  const [currentQualityIndex, setCurrentQualityIndex] = useState<number>(-1);
  const [showSettings, setShowSettings] = useState(false);
  
  // Wallet state - Now using connected wallet
  const [userBalance, setUserBalance] = useState(0);
  const [creatorBalance, setCreatorBalance] = useState(0);
  const [lastSpentAmount, setLastSpentAmount] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get the current user's wallet address
  const userWalletAddress = connectedWallet?.address;
  const isWalletConnected = connectedWallet?.isConnected || false;

  // Function to update wallet balances
  const updateWalletBalances = async (spentAmount: number) => {
    if (!userWalletAddress) {
      console.error('❌ No wallet address available for transfer');
      return;
    }

    try {
      // Calculate the difference from last update
      const chargeAmount = spentAmount - lastSpentAmount;
      
      if (chargeAmount > 0) {
        // Update local state immediately for UI responsiveness
        const newUserBalance = Math.max(0, userBalance - chargeAmount);
        const newCreatorBalance = creatorBalance + chargeAmount;
        
        setUserBalance(newUserBalance);
        setCreatorBalance(newCreatorBalance);
        setLastSpentAmount(spentAmount);
        
        // Notify parent component of balance change
        if (onBalanceUpdate) {
          onBalanceUpdate(newUserBalance);
        }
        
        // API call to update balances in database
        const response = await fetch('/api/wallet/transfer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fromWalletAddress: userWalletAddress,
            toWalletAddress: video.creatorWallet,
            amount: chargeAmount,
            videoId: video.id,
            timestamp: Date.now(),
            metadata: {
              quality: quality,
              pricePerSecond: getCurrentPricePerSecond(),
              watchTimeSeconds: currentTime
            }
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update wallet balances');
        }
        
        const result = await response.json();

        
        // Update local state with actual database values
        setUserBalance(result.fromBalance);
        setCreatorBalance(result.toBalance);
        
        // If user balance is insufficient, pause the video
        if (result.fromBalance <= 0) {
          setIsPlaying(false);
          if (videoRef.current) {
            videoRef.current.pause();
          }
          alert('Insufficient balance. Video paused.');
        }
      }
    } catch (error) {
      console.error('❌ Error updating wallet balances:', error);
      
      // Revert local state on error
      setUserBalance(userBalance + (spentAmount - lastSpentAmount));
      setCreatorBalance(creatorBalance - (spentAmount - lastSpentAmount));
      setLastSpentAmount(lastSpentAmount);
      
      // Pause video on payment error
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.pause();
      }
      
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Fetch user data when wallet is connected
  useEffect(() => {
    const fetchUserData = async () => {
      if (userWalletAddress && isWalletConnected) {
        try {
          setIsLoadingBalance(true);

          // Normalize address to lowercase for consistency
          const normalizedAddress = userWalletAddress.toLowerCase();
          const response = await fetch(`/api/users/${normalizedAddress}`);

          
          if (response.ok) {
            const userData = await response.json();

            setUserProfile(userData);
            const balance = parseFloat(userData.walletBalance?.toString() || '0');
            setUserBalance(balance);

          } else if (response.status === 404) {

            const createResponse = await fetch('/api/users/create', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                walletAddress: normalizedAddress,
                initialBalance: 100
              }),
            });
            
            if (createResponse.ok) {
              const newUser = await createResponse.json();

              setUserProfile(newUser);
              setUserBalance(parseFloat(newUser.walletBalance.toString()));
            } else {
              console.error('❌ Failed to create viewer');
              setUserBalance(0);
            }
          } else {
            const errorText = await response.text();
            console.error('❌ User API error:', response.status, errorText);
            setUserBalance(0);
          }
        } catch (error) {
          console.error('❌ Error fetching user data:', error);
          setUserBalance(0);
        } finally {
          setIsLoadingBalance(false);
        }
      } else if (!isWalletConnected) {

        setIsLoadingBalance(false);
        setUserBalance(0);
        setUserProfile(null);
      }
    };

    fetchUserData();
  }, [userWalletAddress, isWalletConnected]);

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
      hls.currentLevel = -1;

    } else {
      hls.currentLevel = qualityIndex - 1;

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

  // Handle play/pause - Updated with wallet connection check
  const togglePlayPause = () => {
    if (!isWalletConnected) {
      alert('Please connect your wallet to watch videos.');
      return;
    }

    if (!isAuthorized) {
      setShowPaymentDialog(true);
      return;
    }

    // Check if user has sufficient balance before playing
    if (!isPlaying && userBalance <= 0) {
      alert('Insufficient balance to continue watching.');
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

  // Handle payment authorization - Updated with wallet connection check
  const handlePaymentAuthorization = () => {
    if (!isWalletConnected) {
      alert('Please connect your wallet to authorize payment.');
      return;
    }

    if (userBalance <= 0) {
      alert(`Insufficient balance. Your current balance: $${userBalance.toFixed(2)}`);
      return;
    }

    // Check if user has enough for at least a few seconds of viewing
    const minRequiredBalance = getCurrentPricePerSecond() * 10; // 10 seconds minimum
    if (userBalance < minRequiredBalance) {
      alert(`Insufficient balance. Minimum required: $${minRequiredBalance.toFixed(4)} for 10 seconds of viewing.`);
      return;
    }

    setIsAuthorized(true);
    setShowPaymentDialog(false);
    setShowPaymentConfirm(false);

  };

  // Handle payment confirmation before watching
  const handlePaymentConfirm = () => {
    setShowPaymentConfirm(false);
    togglePlayPause();
  };

  // Update spending based on watch time and update wallets
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && isAuthorized && isWalletConnected) {
      interval = setInterval(() => {
        const newSpent = currentSpent + getCurrentPricePerSecond();
        setCurrentSpent(newSpent);
        
        // Update wallet balances every second
        updateWalletBalances(newSpent);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isAuthorized, isWalletConnected, quality, currentSpent, userBalance, creatorBalance, lastSpentAmount]);

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

  return (
    <div className="space-y-4">
      {/* Wallet Balance Display - Updated with connection status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm font-light">
                <span className="text-white/50">Your Balance: </span>
                {!isWalletConnected ? (
                  <span className="text-red-400">Wallet not connected</span>
                ) : isLoadingBalance ? (
                  <span className="text-white/30">Loading...</span>
                ) : (
                  <span className={`text-white ${userBalance < 1 ? 'text-red-400' : ''}`}>
                    ${userBalance.toFixed(4)}
                  </span>
                )}
              </div>
              <div className="text-sm font-light">
                <span className="text-white/50">Creator Earnings: </span>
                <span className="text-green-400">${creatorBalance.toFixed(4)}</span>
              </div>
            </div>
            <div className="text-sm font-light">
              <span className="text-white/50">Current spend: </span>
              <span className="text-white">${currentSpent.toFixed(4)}</span>
            </div>
          </div>
          {/* Debug info - Updated with connection status */}
          <div className="text-xs text-white/30 mt-2">
            Debug: Connected={isWalletConnected ? 'YES' : 'NO'}, 
            Viewer={userWalletAddress ? `${userWalletAddress.slice(0,8)}...` : 'N/A'}, 
            Creator={video.creatorWallet?.slice(0,8)}..., Balance={userBalance}
          </div>
        </CardContent>
      </Card>

      {/* Video Player */}
      <Card className="overflow-hidden">
        <div ref={containerRef} className="relative aspect-video bg-black">
          {/* ... existing video loading and error states ... */}
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
          
          {/* Player Controls - Same as before */}
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

          {/* Payment Required Overlay - Updated with wallet connection check */}
          {(!isAuthorized || !isWalletConnected) && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center">
              <Card className="max-w-md w-full mx-4">
                <CardContent className="p-6 text-center">
                  <Wallet className="h-12 w-12 mx-auto mb-4 text-white" />
                  <h3 className="text-lg font-light mb-2 text-white">
                    {!isWalletConnected ? 'Connect Wallet' : 'Authorize Payment'}
                  </h3>
                  <p className="text-white/50 mb-4 font-light">
                    {!isWalletConnected 
                      ? 'Connect your wallet to start watching videos.'
                      : 'Authorize payment to start watching. You\'ll be charged based on your actual watch time.'
                    }
                  </p>
                  <Button 
                    onClick={() => !isWalletConnected ? alert('Please connect your wallet first.') : setShowPaymentDialog(true)} 
                    className="w-full"
                    disabled={!isWalletConnected}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    {!isWalletConnected ? 'Connect Wallet Required' : 'Authorize Payment'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </Card>

      {/* Payment Info */}
      {isAuthorized && isWalletConnected && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-white/10 border-white/20 text-white font-light">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Authorized
                </Badge>
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

      {/* Payment Authorization Dialog - Updated with wallet connection check */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-light">Authorize Payment</DialogTitle>
            <DialogDescription className="font-light">
              Authorize payment to watch this video. Funds will be deducted from your wallet balance based on actual watch time.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-light text-white/70">Connected Wallet:</span>
                <span className="text-sm font-light text-white">
                  {userWalletAddress ? `${userWalletAddress.slice(0,6)}...${userWalletAddress.slice(-4)}` : 'Not connected'}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-light text-white/70">Your Balance:</span>
                <span className="text-lg font-light text-white">${userBalance.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-light text-white/70">Rate per Second:</span>
                <span className="text-lg font-light text-white">${getCurrentPricePerSecond().toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-light text-white/70">Est. Full Video Cost:</span>
                <span className="text-lg font-light text-white">${calculateTotalCost()}</span>
              </div>
              <p className="text-xs text-white/50 font-light">
                At {quality} quality • You can pause anytime
              </p>
            </div>

            <div className="p-4 border border-blue-500/20 bg-blue-500/5 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-100/90 font-light">
                  <p className="font-medium mb-1">How Payment Works:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Funds are deducted from your wallet balance in real-time</li>
                    <li>• You pay only for the time you actually watch</li>
                    <li>• Video pauses automatically if balance is insufficient</li>
                    <li>• No upfront payment or staking required</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-xs text-white/50 font-light space-y-1">
              <p>• Video will pause if your balance reaches $0</p>
              <p>• Payment is processed every second during playback</p>
              <p>• Creator earnings are updated in real-time</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePaymentAuthorization}
              disabled={!isWalletConnected || userBalance <= 0}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Authorize Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation Dialog */}
      <Dialog open={showPaymentConfirm} onOpenChange={setShowPaymentConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-light">Start Watching</DialogTitle>
            <DialogDescription className="font-light">
              Starting playback will begin charging ${getCurrentPricePerSecond().toFixed(4)} per second from your wallet balance.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 border border-white/10 bg-white/[0.02] backdrop-blur-sm rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-4 w-4 text-white/70" />
              <span className="font-light text-white">Payment Active</span>
            </div>
            <p className="text-sm text-white/50 font-light">
              Your wallet balance will be charged based on your actual watch time and selected quality.
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
