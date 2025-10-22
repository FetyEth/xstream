import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, CheckCircle, AlertCircle, RotateCw, Zap } from "lucide-react";

interface PublishReviewProps {
  title: string;
  category: string;
  maxQuality: string;
  pricePerSecond: string;
  videoFile: File | null;
  tags: string;
  description: string;
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  isConnected: boolean;
  isProcessingPayment?: boolean;
  onBack: () => void;
  onSubmit: () => void;
  onDismissError: () => void;
  formatFileSize: (bytes: number) => string;
}

export default function PublishReview({
  title,
  category,
  maxQuality,
  pricePerSecond,
  videoFile,
  tags,
  description,
  isUploading,
  uploadProgress,
  uploadError,
  isConnected,
  isProcessingPayment = false,
  onBack,
  onSubmit,
  onDismissError,
  formatFileSize,
}: PublishReviewProps) {
  const getProgressMessage = () => {
    if (uploadProgress < 5) return "Initializing...";
    if (uploadProgress < 10) return "Processing payment...";
    if (uploadProgress < 15) return "Uploading video file...";
    if (uploadProgress < 90) return "Processing with FFmpeg and creating HLS segments...";
    if (uploadProgress < 95) return "Uploading segments to MinIO...";
    return "Finalizing upload...";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-white font-light">
          <CheckCircle className="h-5 w-5 mr-2 text-white/70" />
          Ready to Publish
        </CardTitle>
        <CardDescription className="text-white/70 font-light">
          Review your video details and publish to xStream
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Video Summary */}
        <div className="border border-white/10 rounded-lg p-4 bg-white/[0.02] backdrop-blur-xl">
          <h4 className="font-light mb-4 text-white flex items-center">
            <Video className="h-4 w-4 mr-2" />
            Video Summary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white/70 font-light">Title:</span>
              <p className="font-light text-white mt-1">
                {title || "Untitled Video"}
              </p>
            </div>
            <div>
              <span className="text-white/70 font-light">Category:</span>
              <p className="font-light text-white mt-1">{category}</p>
            </div>
            <div>
              <span className="text-white/70 font-light">Max Quality:</span>
              <p className="font-light text-white mt-1">{maxQuality}</p>
            </div>
            <div>
              <span className="text-white/70 font-light">Price per Second:</span>
              <p className="font-light text-white mt-1">${pricePerSecond}</p>
            </div>
            {videoFile && (
              <div>
                <span className="text-white/70 font-light">File Size:</span>
                <p className="font-light text-white mt-1">
                  {formatFileSize(videoFile.size)}
                </p>
              </div>
            )}
            <div>
              <span className="text-white/70 font-light">Upload Fee:</span>
              <p className="font-light text-white mt-1">$0.50 (via x402)</p>
            </div>
            {tags && (
              <div className="col-span-2">
                <span className="text-white/70 font-light">Tags:</span>
                <p className="font-light text-white mt-1">{tags}</p>
              </div>
            )}
            {description && (
              <div className="col-span-2">
                <span className="text-white/70 font-light">Description:</span>
                <p className="font-light text-white mt-1 text-sm">{description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Terms */}
        <div className="bg-white/[0.02] p-4 rounded-lg border border-white/10 backdrop-blur-xl">
          <h4 className="text-white font-light mb-2">Creator Agreement</h4>
          <div className="text-sm text-white/70 space-y-2 font-light">
            <p className="text-white mb-2 font-light">By publishing, you agree to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>xStream&apos;s Terms of Service and Creator Guidelines</li>
              <li>Instant settlement of viewer payments to your connected wallet</li>
              <li>Quality-based pricing as configured above</li>
              <li>Platform fee of 5% on all viewer payments</li>
              <li>Content ownership and responsibility for uploaded material</li>
            </ul>
          </div>
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <div className="bg-white/[0.02] p-4 rounded-lg border border-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white font-light">
                {isProcessingPayment ? "Processing payment..." : "Processing video..."}
              </span>
              <span className="text-sm text-white font-light">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="bg-white h-3 rounded-full transition-all duration-300 relative"
                style={{ width: `${uploadProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <p className="text-xs text-white/70 mt-2 flex items-center font-light">
              <RotateCw className="h-3 w-3 mr-2 animate-spin" />
              {getProgressMessage()}
            </p>
            {isProcessingPayment && uploadProgress < 10 && (
              <p className="text-xs text-white/50 mt-2 font-light">
                Please sign the transaction in your wallet to pay the upload fee ($0.50 USDC)
              </p>
            )}
          </div>
        )}

        {/* Error Message */}
        {uploadError && (
          <div className="bg-white/[0.02] p-4 rounded-lg border border-white/10 backdrop-blur-xl">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-white/70 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-light text-white mb-1">Upload Failed</h4>
                <p className="text-sm text-white/70 font-light">{uploadError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDismissError}
                  className="mt-3"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Connection Notice */}
        {!isConnected && (
          <div className="bg-white/[0.02] p-4 rounded-lg border border-white/10 backdrop-blur-xl">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-white/70 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-light text-white mb-1">Wallet Not Connected</h4>
                <p className="text-sm text-white/70 font-light">
                  Please connect your wallet to publish your video and receive payments.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack} disabled={isUploading}>
            Back
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isUploading || !isConnected}
            className="min-w-[200px]"
          >
            {isUploading ? (
              <>
                <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : !isConnected ? (
              <>Connect Wallet to Publish</>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Publish Video
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
