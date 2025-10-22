import Link from "next/link";
import { Name } from "@coinbase/onchainkit/identity";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Eye, Upload as UploadIcon } from "lucide-react";

interface SuccessMessageProps {
  isConnected: boolean;
  address: string | undefined;
  title: string;
  pricePerSecond: string;
  maxQuality: string;
  uploadedVideoUrl: string;
  onReset: () => void;
}

export default function SuccessMessage({
  isConnected,
  address,
  title,
  pricePerSecond,
  maxQuality,
  uploadedVideoUrl,
  onReset,
}: SuccessMessageProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/10">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-4 backdrop-blur-xl">
            <CheckCircle className="h-12 w-12 text-white/70" />
          </div>
          <h3 className="text-2xl font-light text-white mb-2">
            {isConnected && address ? (
              <span className="flex items-center justify-center gap-2">
                Congratulations,{" "}
                <Name address={address as `0x${string}`} className="text-white/70" />!
              </span>
            ) : (
              <>Video Published Successfully!</>
            )}
          </h3>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto font-light">
            Your video is now live on xStream and ready for viewers to watch. Start
            earning with every second watched!
          </p>

          {/* Success Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-2xl mx-auto">
            <div className="bg-white/[0.02] p-4 rounded-lg border border-white/10 backdrop-blur-xl">
              <p className="text-white/70 text-sm mb-1 font-light">Video Title</p>
              <p className="text-white font-light">{title}</p>
            </div>
            <div className="bg-white/[0.02] p-4 rounded-lg border border-white/10 backdrop-blur-xl">
              <p className="text-white/70 text-sm mb-1 font-light">Pricing</p>
              <p className="text-white font-light">${pricePerSecond}/second</p>
            </div>
            <div className="bg-white/[0.02] p-4 rounded-lg border border-white/10 backdrop-blur-xl">
              <p className="text-white/70 text-sm mb-1 font-light">Max Quality</p>
              <p className="text-white font-light">{maxQuality}</p>
            </div>
          </div>

          <p className="text-xs text-white/50 mb-6 font-light">
            {uploadedVideoUrl && (
              <>
                View your video here:{" "}
                <Link href={uploadedVideoUrl} className="text-white">
                  {uploadedVideoUrl}
                </Link>
              </>
            )}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/browse">
              <Button variant="outline" className="w-full sm:w-auto">
                <Eye className="h-4 w-4 mr-2" />
                Browse Videos
              </Button>
            </Link>
            <Button onClick={onReset} className="w-full sm:w-auto">
              <UploadIcon className="h-4 w-4 mr-2" />
              Upload Another Video
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
