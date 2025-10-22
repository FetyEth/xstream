import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Upload as UploadIcon } from "lucide-react";

interface VideoUploadFormProps {
  onVideoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadError: string | null;
}

export default function VideoUploadForm({ onVideoUpload, uploadError }: VideoUploadFormProps) {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="text-center">
          <div className="border-2 border-dashed border-white/10 rounded-lg p-12 hover:border-white/20 transition-colors cursor-pointer">
            <Video className="h-16 w-16 mx-auto mb-4 text-white/50" />
            <h3 className="text-lg font-light text-white mb-2">
              Upload your video
            </h3>
            <p className="text-white/70 mb-6 font-light">
              Choose a video file to get started
            </p>

            <input
              type="file"
              accept="video/*"
              onChange={onVideoUpload}
              className="hidden"
              id="video-upload"
            />
            <label htmlFor="video-upload">
              <Button className="cursor-pointer" asChild>
                <span>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Select Video File
                </span>
              </Button>
            </label>

            <div className="mt-6 text-sm text-white/70 space-y-1 font-light">
              <p>Supported formats: MP4, MOV, AVI, WMV</p>
              <p>Maximum file size: 500MB</p>
              <p className="text-xs text-white/50 mt-2">
                Your video will be processed into HLS format for streaming
              </p>
            </div>

            {uploadError && (
              <div className="mt-4 p-3 bg-white/[0.02] border border-white/10 rounded-lg backdrop-blur-xl">
                <p className="text-white/70 text-sm font-light">{uploadError}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
