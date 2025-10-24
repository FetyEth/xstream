"use client";

import { useState } from "react";
import { stakeForVideo } from "@/app/actions/wallet";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, DollarSign, AlertCircle } from "lucide-react";

interface StakeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sessionId: string) => void;
  videoId: string;
  videoTitle: string;
  pricePerSecond: number;
  durationInSeconds: number;
  walletAddress: string;
  walletBalance: number;
}

export default function StakeConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  videoId,
  videoTitle,
  pricePerSecond,
  durationInSeconds,
  walletAddress,
  walletBalance,
}: StakeConfirmationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate max stake amount (full video duration)
  const maxStakeAmount = (pricePerSecond * durationInSeconds) / 1000000;
  const remainingBalance = walletBalance - maxStakeAmount;

  const handleStake = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await stakeForVideo(
        walletAddress,
        videoId,
        maxStakeAmount
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to stake");
      }

      onConfirm(result.sessionId!);
      onClose();
    } catch (error) {
      console.error("Stake error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to stake for video"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black/95 backdrop-blur-xl border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <DollarSign className="h-5 w-5" />
            Confirm Stake
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Watch &quot;{videoTitle}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Pricing breakdown */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Video Duration</span>
              <span className="text-white">
                {Math.floor(durationInSeconds / 60)}:{String(durationInSeconds % 60).padStart(2, "0")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Price per Second</span>
              <span className="text-white">
                ${(pricePerSecond / 1000000).toFixed(6)} USDC
              </span>
            </div>
            <div className="border-t border-white/10 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-white font-medium">Max Stake</span>
                <span className="text-white font-medium">
                  ${maxStakeAmount.toFixed(4)} USDC
                </span>
              </div>
            </div>
          </div>

          {/* Wallet balance */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Current Balance</span>
              <span className="text-white">${walletBalance.toFixed(2)} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">After Stake</span>
              <span className={remainingBalance < 0 ? "text-red-400" : "text-white"}>
                ${remainingBalance.toFixed(2)} USDC
              </span>
            </div>
          </div>

          {/* Insufficient balance warning */}
          {remainingBalance < 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex gap-2">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-red-400 font-medium">Insufficient Balance</p>
                <p className="text-red-300/80 mt-1">
                  You need ${Math.abs(remainingBalance).toFixed(2)} more USDC to watch this video.
                </p>
              </div>
            </div>
          )}

          {/* Refund information */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-300">
              <strong>Auto-Refund:</strong> You&apos;ll only be charged for the time you actually watch.
              If you watch 50% of the video, 50% of your stake will be refunded automatically.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleStake}
            disabled={isProcessing || remainingBalance < 0}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Staking...
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4" />
                Stake ${maxStakeAmount.toFixed(4)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
