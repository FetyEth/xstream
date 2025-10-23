"use client";

import { useState, useRef, useEffect } from "react";
import { useAccount } from "wagmi";
import Hls from "hls.js";
import { getWalletBalance, stakeForVideo } from "@/app/actions/wallet";
import { refundUnusedStake } from "@/app/actions/wallet";
import StakeConfirmationModal from "./StakeConfirmationModal";
import WalletDepositModal from "./WalletDepositModal";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Loader2, Wallet, AlertCircle } from "lucide-react";

interface VideoPlayerWithStakeProps {
  video: {
    id: string;
    title: string;
    duration: number;
    pricePerSecond: number;
    creatorWallet: string;
  };
}

export default function VideoPlayerWithStake({ video }: VideoPlayerWithStakeProps) {
  const { address, isConnected } = useAccount();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  console.log("🎬 VideoPlayerWithStake component loaded - NEW VERSION with Start Overlay");
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.duration);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [quality, setQuality] = useState("1080p");
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  
  // Stake state
  const [walletBalance, setWalletBalance] = useState(0);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStaked, setIsStaked] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDepositPrompt, setShowDepositPrompt] = useState(false);
  const [showStartOverlay, setShowStartOverlay] = useState(true);

  // Fetch wallet balance
  const fetchBalance = async () => {
    if (!address) return;
    try {
      const result = await getWalletBalance(address);
      if (result.success && result.balance) {
        setWalletBalance(parseFloat(result.balance));
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchBalance();
    }
  }, [address, isConnected]);

  // Initialize HLS player
  useEffect(() => {
    const initPlayer = async () => {
      if (!videoRef.current) return;

      try {
        setLoadingVideo(true);
        const response = await fetch(`/api/videos/${video.id}/stream`);
        
        if (!response.ok) {
          throw new Error("Failed to load video stream");
        }

        const data = await response.json();
        
        if (Hls.isSupported()) {
          const hls = new Hls({
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
          });
          
          hls.loadSource(data.url);
          hls.attachMedia(videoRef.current);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log("HLS manifest loaded");
            setLoadingVideo(false);
            console.log("Start overlay should show:", showStartOverlay);
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error("HLS error:", data);
            if (data.fatal) {
              setError("Failed to load video");
            }
          });

          hlsRef.current = hls;
        } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
          videoRef.current.src = data.url;
          setLoadingVideo(false);
        }
      } catch (error) {
        console.error("Video initialization error:", error);
        setError("Failed to load video");
        setLoadingVideo(false);
      }
    };

    initPlayer();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [video.id]);

  // Handle start video confirmation
  const handleStartVideo = async () => {
    const maxStake = (video.pricePerSecond * video.duration) / 1000000;
    
    // Check if sufficient balance
    if (walletBalance < maxStake) {
      setShowDepositPrompt(true);
      return;
    }
    
    // Auto-stake without modal
    setLoadingVideo(true);
    setShowStartOverlay(false);
    
    try {
      const result = await stakeForVideo(
        address!,
        video.id,
        maxStake
      );

      if (!result.success) {
        setError(result.error || "Failed to stake");
        setLoadingVideo(false);
        setShowStartOverlay(true);
        return;
      }

      // Set session and mark as staked
      setSessionId(result.sessionId!);
      setIsStaked(true);
      await fetchBalance(); // Refresh balance
      
      // Auto-play video after stake
      if (videoRef.current) {
        await videoRef.current.play();
        setIsPlaying(true);
      }
      setLoadingVideo(false);
    } catch (error) {
      console.error("Stake error:", error);
      setError("Failed to stake for video");
      setLoadingVideo(false);
      setShowStartOverlay(true);
      return;
    }
  };

  // Handle play/pause
  const togglePlayPause = async () => {
    if (!videoRef.current || !isStaked) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      await videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Handle stake confirmation
  const handleStakeConfirm = async (newSessionId: string) => {
    setSessionId(newSessionId);
    setIsStaked(true);
    await fetchBalance(); // Refresh balance
    
    // Auto-play video after stake
    if (videoRef.current) {
      await videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Handle video end or user leaves
  const handleRefund = async () => {
    if (!sessionId) return;

    try {
      const watchedSeconds = Math.floor(currentTime);
      const result = await refundUnusedStake(
        sessionId,
        watchedSeconds,
        video.pricePerSecond
      );

      if (result.success) {
        console.log("Refunded unused stake");
        await fetchBalance(); // Refresh balance
      }
    } catch (error) {
      console.error("Refund error:", error);
    }
  };

  // Auto-refund when video ends
  useEffect(() => {
    if (videoRef.current) {
      const handleEnded = () => {
        setIsPlaying(false);
        handleRefund();
      };
      
      videoRef.current.addEventListener("ended", handleEnded);
      return () => videoRef.current?.removeEventListener("ended", handleEnded);
    }
  }, [sessionId, currentTime]);

  // Cleanup refund on unmount
  useEffect(() => {
    return () => {
      if (sessionId && isStaked) {
        handleRefund();
      }
    };
  }, [sessionId, isStaked]);

  // Time update handler
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Progress bar click handler
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !isStaked) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    videoRef.current.currentTime = newTime;
  };

  // Volume change
  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (newMuted) {
        setVolume(0);
      } else {
        setVolume(videoRef.current.volume);
      }
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate cost
  const currentCost = (currentTime * video.pricePerSecond) / 1000000;
  const maxCost = (duration * video.pricePerSecond) / 1000000;

  if (!isConnected) {
    return (
      <div className="relative aspect-video bg-black rounded-lg flex items-center justify-center">
        <div className="text-center text-white">
          <Wallet className="h-12 w-12 mx-auto mb-4 text-blue-400" />
          <p className="text-lg mb-2">Connect Wallet to Watch</p>
          <p className="text-sm text-white/70">You need to connect your wallet to stake and watch videos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {loadingVideo && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center text-white">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-400" />
              <p>Loading video...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center text-white">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Start Video Overlay */}
        {showStartOverlay && !error && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-30">
            <div className="text-center text-white max-w-md mx-auto p-6">
              <Play className="h-16 w-16 mx-auto mb-4 text-blue-400" />
              <h3 className="text-2xl font-bold mb-2">Ready to Watch?</h3>
              <p className="text-white/70 mb-6">
                {video.title}
              </p>
              
              {/* Pricing Info */}
              <div className="bg-white/10 rounded-lg p-4 mb-6 space-y-2 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Duration:</span>
                  <span>{Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, "0")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Price per second:</span>
                  <span>${(video.pricePerSecond / 1000000).toFixed(6)}</span>
                </div>
                <div className="border-t border-white/20 pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total (full video):</span>
                    <span className="text-blue-400">
                      ${((video.pricePerSecond * video.duration) / 1000000).toFixed(4)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-white/50 mt-2">
                  <span>Your balance:</span>
                  <span>${walletBalance.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowStartOverlay(false);
                    window.history.back();
                  }}
                  variant="outline"
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStartVideo}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Start Video
                </Button>
              </div>

              <p className="text-xs text-white/50 mt-4">
                💡 You'll only be charged for what you watch. Unused amount will be refunded automatically.
              </p>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full h-full"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        />

        {/* Player Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
          {/* Progress Bar */}
          <div 
            className="w-full h-1 bg-white/30 rounded-full mb-4 cursor-pointer relative"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlayPause}
                className="text-white hover:bg-white/10 p-2"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-white/10 p-2"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-1"
              />

              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {isStaked && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-green-500/20 px-2 py-1 rounded border border-green-500/30 text-green-300">
                    Staked: ${maxCost.toFixed(4)}
                  </span>
                  <span className="bg-blue-500/20 px-2 py-1 rounded border border-blue-500/30">
                    Spent: ${currentCost.toFixed(4)}
                  </span>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/10 p-2"
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stake Modal */}
      {address && (
        <StakeConfirmationModal
          isOpen={showStakeModal}
          onClose={() => setShowStakeModal(false)}
          onConfirm={handleStakeConfirm}
          videoId={video.id}
          videoTitle={video.title}
          pricePerSecond={video.pricePerSecond}
          durationInSeconds={video.duration}
          walletAddress={address}
          walletBalance={walletBalance}
        />
      )}

      {/* Insufficient Balance Prompt */}
      {showDepositPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-black/95 border border-white/10 rounded-lg p-6 max-w-md mx-4">
            <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white text-center mb-2">
              Insufficient Balance
            </h3>
            <p className="text-white/70 text-center mb-4">
              You need ${((video.pricePerSecond * video.duration) / 1000000).toFixed(2)} USDC to watch this video.
              <br />
              Current balance: ${walletBalance.toFixed(2)} USDC
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDepositPrompt(false)}
                className="flex-1 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <WalletDepositModal onSuccess={() => {
                setShowDepositPrompt(false);
                fetchBalance();
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
