"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/Header";
import { Name } from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Eye,
  Zap,
  AlertCircle,
  CheckCircle,
  X,
  RotateCw,
  Video,
  Upload as UploadIcon,
  DollarSign,
} from "lucide-react";
import Image from "next/image";

export default function UploadPage() {
  const router = useRouter();
  const [uploadStep, setUploadStep] = useState(1);
  const { address, isConnected } = useAccount();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Education");
  const [tags, setTags] = useState("");
  const [pricePerSecond, setPricePerSecond] = useState("0.01");
  const [maxQuality, setMaxQuality] = useState("1080p");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 500MB for demo)
      if (file.size > 500 * 1024 * 1024) {
        setError("File size must be less than 500MB");
        return;
      }

      // Validate file type
      const validTypes = [
        "video/mp4",
        "video/quicktime",
        "video/x-msvideo",
        "video/x-ms-wmv",
      ];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid video file (MP4, MOV, AVI, WMV)");
        return;
      }

      setVideoFile(file);
      setError(null);
      setUploadStep(2);
    }
  };

  const handleThumbnailUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
  };

  const handleSubmit = async () => {
    if (!address || !isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!videoFile) {
      setError("Please select a video file");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a video title");
      return;
    }

    if (!category.trim()) {
      setError("Please select a category");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("tags", tags);
      
      if (address) {
        formData.append("walletAddress", address);
      }

      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      setUploadProgress(30);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(60);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || errorData.details || "Failed to upload video"
        );
      }

      const data = await response.json();
      console.log("Video uploaded successfully:", data);

      setUploadProgress(100);
      
      setTimeout(() => {
        router.push(`/watch/${data.video.id}`);
      }, 1000);

    } catch (error) {
      console.error("Upload error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to upload video"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const getQualityOptions = () => {
    return [
      { value: "4K", label: "4K (2160p)", multiplier: 1.0 },
      { value: "1080p", label: "Full HD (1080p)", multiplier: 0.75 },
      { value: "720p", label: "HD (720p)", multiplier: 0.5 },
      { value: "480p", label: "SD (480p)", multiplier: 0.35 },
      { value: "360p", label: "Low (360p)", multiplier: 0.2 },
    ];
  };

  const resetForm = () => {
    setUploadStep(1);
    setVideoFile(null);
    setTitle("");
    setDescription("");
    setTags("");
    setPricePerSecond("0.01");
    setMaxQuality("1080p");
    setThumbnail(null);
    setThumbnailPreview(null);
    seterror(null);
    setUploadProgress(0);
    setUploadedVideoUrl("");
    setCategory("Education");
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Creator Tool Banner */}
      <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="xStream Logo" width={36} height={36} />
              <div>
                <h2 className="text-white font-light text-lg">
                  Creator Studio - Upload
                </h2>
                <p className="text-white/70 text-sm">
                  Share your content and start earning
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-white mb-2">Upload Video</h1>
          <p className="text-white/70 font-light">
            Share your content and earn with x402 micropayments
          </p>
        </div>

        {/* Upload Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 md:space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-light transition-all ${
                    step <= uploadStep
                      ? "bg-white text-black"
                      : "bg-white/10 text-white/50 backdrop-blur-xl"
                  } ${
                    step === uploadStep
                      ? "ring-2 ring-white/30 ring-offset-2 ring-offset-transparent"
                      : ""
                  }`}
                >
                  {step < uploadStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step
                  )}
                </div>
                {step < 4 && (
                  <div
                    className={`w-8 md:w-16 h-0.5 transition-all ${
                      step < uploadStep ? "bg-white" : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-3">
            <div className="text-sm text-white/70 font-light">
              {uploadStep === 1 && "Upload Video"}
              {uploadStep === 2 && "Video Details"}
              {uploadStep === 3 && "Pricing & Settings"}
              {uploadStep === 4 && "Review & Publish"}
              {uploadStep === 5 && "Complete!"}
            </div>
          </div>
        </div>

        {/* Step 1: Upload Video */}
        {uploadStep === 1 && (
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
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload">
                    <Button
                      className="cursor-pointer"
                      asChild
                    >
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

                  {error && (
                    <div className="mt-4 p-3 bg-white/[0.02] border border-white/10 rounded-lg backdrop-blur-xl">
                      <p className="text-white/70 text-sm font-light">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Video Details */}
        {uploadStep === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-white font-light">Video Details</CardTitle>
                <CardDescription className="text-white/70 font-light">
                  Add information about your video
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {videoFile && (
                  <div className="bg-white/[0.02] p-4 rounded-lg mb-4 border border-white/10 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/70 font-light">Selected file:</p>
                        <p className="text-white font-light">
                          {videoFile.name}
                        </p>
                        <p className="text-xs text-white/50 mt-1 font-light">
                          {formatFileSize(videoFile.size)}
                        </p>
                      </div>
                      <Video className="h-8 w-8 text-white/50" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-light mb-2 text-white">
                    Title <span className="text-white/70">*</span>
                  </label>
                  <Input
                    placeholder="Enter video title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                  />
                  <p className="text-xs text-white/50 mt-1 font-light">
                    {title.length}/100 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-light mb-2 text-white">
                    Description
                  </label>
                  <Textarea
                    placeholder="Describe your video content"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-white/50 mt-1 font-light">
                    {description.length}/500 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-light mb-2 text-white">
                    Category
                  </label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Entertainment">
                        Entertainment
                      </SelectItem>
                      <SelectItem value="Gaming">Gaming</SelectItem>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="News">News</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-light mb-2 text-white">
                    Tags
                  </label>
                  <Input
                    placeholder="Enter tags separated by commas"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                  <p className="text-xs text-white/50 mt-1 font-light">
                    Example: blockchain, tutorial, crypto, x402
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-light mb-2 text-white">
                    Thumbnail (Optional)
                  </label>
                  {thumbnailPreview ? (
                    <div className="relative">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={removeThumbnail}
                        className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-xl border border-white/10 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                        id="thumbnail-upload"
                      />
                      <label htmlFor="thumbnail-upload">
                        <div className="border-2 border-dashed border-white/10 rounded-lg p-8 hover:border-white/20 transition-colors cursor-pointer text-center">
                          <UploadIcon className="h-8 w-8 mx-auto mb-2 text-white/50" />
                          <p className="text-sm text-white/70 font-light">
                            Click to upload thumbnail
                          </p>
                        </div>
                      </label>
                    </div>
                  )}
                  <p className="text-xs text-white/50 mt-1 font-light">
                    Recommended: 1280x720px. If not provided, a thumbnail will
                    be auto-generated.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setUploadStep(1)}
              >
                Back
              </Button>
              <Button
                onClick={() => setUploadStep(3)}
                disabled={!title.trim()}
              >
                Next: Pricing
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Pricing & Settings */}
        {uploadStep === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-white font-light">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Pricing Settings
                </CardTitle>
                <CardDescription className="text-white/70 font-light">
                  Set your video pricing and quality options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-light mb-2 text-white">
                      Price per Second (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 font-light">
                        $
                      </span>
                      <Input
                        type="number"
                        step="0.001"
                        min="0.001"
                        max="1"
                        placeholder="0.010"
                        value={pricePerSecond}
                        onChange={(e) => setPricePerSecond(e.target.value)}
                        className="pl-7"
                      />
                    </div>
                    <p className="text-xs text-white/50 mt-1 font-light">
                      Recommended: $0.005 - $0.020 per second
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-light mb-2 text-white">
                      Maximum Quality
                    </label>
                    <Select value={maxQuality} onValueChange={setMaxQuality}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getQualityOptions().map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-white/50 mt-1 font-light">
                      Higher quality = better viewing experience
                    </p>
                  </div>
                </div>

                {/* Pricing Preview */}
                <div className="bg-white/[0.02] p-4 rounded-lg border border-white/10 backdrop-blur-xl">
                  <h4 className="font-light text-white mb-3 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Pricing Preview (5 min video example)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {getQualityOptions()
                      .filter(
                        (q) => {
                          const selectedOption = getQualityOptions().find(
                            (opt) => opt.value === maxQuality
                          );
                          return selectedOption ? q.multiplier <= selectedOption.multiplier : false;
                        }
                      )
                      .map((option) => (
                        <div
                          key={option.value}
                          className="text-center bg-white/[0.02] p-3 rounded-lg border border-white/5"
                        >
                          <Badge
                            variant="outline"
                            className="mb-2"
                          >
                            {option.value}
                          </Badge>
                          <p className="font-light text-white text-lg">
                            $
                            {(
                              parseFloat(pricePerSecond) *
                              option.multiplier *
                              300
                            ).toFixed(2)}
                          </p>
                          <p className="text-xs text-white/70 font-light">per 5 min</p>
                        </div>
                      ))}
                  </div>
                  <p className="text-xs text-white/70 mt-3 text-center font-light">
                    Viewers pay only for what they watch. Quality adjusts
                    automatically based on connection.
                  </p>
                </div>

                {/* Upload Fee Info */}
                <div className="bg-white/[0.02] p-4 rounded-lg border border-white/10 backdrop-blur-xl">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-white/70 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-light text-white mb-1">
                        Upload Fee
                      </h4>
                      <p className="text-sm text-white/70 font-light">
                        A one-time fee of <strong className="font-normal">$0.50</strong> (paid via x402)
                        is required to upload to xStream. This helps maintain
                        platform quality and covers storage costs.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Platform Fee Info */}
                <div className="bg-white/[0.02] p-4 rounded-lg border border-white/10 backdrop-blur-xl">
                  <h4 className="font-light text-white mb-2">
                    Creator Earnings
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70 font-light">Your Revenue Share:</span>
                      <span className="text-white font-light">95%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70 font-light">Platform Fee:</span>
                      <span className="text-white/70 font-light">5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setUploadStep(2)}
              >
                Back
              </Button>
              <Button
                onClick={() => setUploadStep(4)}
              >
                Review & Publish
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Publishing */}
        {uploadStep === 4 && (
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
                    <p className="font-light text-white mt-1">
                      ${pricePerSecond}
                    </p>
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
                    <p className="font-light text-white mt-1">
                      $0.50 (via x402)
                    </p>
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
                      <p className="font-light text-white mt-1 text-sm">
                        {description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Terms */}
              <div className="bg-white/[0.02] p-4 rounded-lg border border-white/10 backdrop-blur-xl">
                <h4 className="text-white font-light mb-2">
                  Creator Agreement
                </h4>
                <div className="text-sm text-white/70 space-y-2 font-light">
                  <p className="text-white mb-2 font-light">
                    By publishing, you agree to:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>xStream&apos;s Terms of Service and Creator Guidelines</li>
                    <li>
                      Instant settlement of viewer payments to your connected
                      wallet
                    </li>
                    <li>Quality-based pricing as configured above</li>
                    <li>Platform fee of 5% on all viewer payments</li>
                    <li>
                      Content ownership and responsibility for uploaded material
                    </li>
                  </ul>
                </div>
              </div>

              {/* Progress Bar */}
              {isUploading && (
                <div className="bg-white/[0.02] p-4 rounded-lg border border-white/10 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white font-light">
                      Processing video...
                    </span>
                    <span className="text-sm text-white font-light">
                      {uploadProgress}%
                    </span>
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
                    {uploadProgress < 10 && "Uploading video file..."}
                    {uploadProgress >= 10 &&
                      uploadProgress < 90 &&
                      "Processing with FFmpeg and creating HLS segments..."}
                    {uploadProgress >= 90 &&
                      uploadProgress < 95 &&
                      "Uploading segments to MinIO..."}
                    {uploadProgress >= 95 && "Finalizing upload..."}
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-white/[0.02] p-4 rounded-lg border border-white/10 backdrop-blur-xl">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-white/70 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-light text-white mb-1">
                        Upload Failed
                      </h4>
                      <p className="text-sm text-white/70 font-light">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => seterror(null)}
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
                      <h4 className="font-light text-white mb-1">
                        Wallet Not Connected
                      </h4>
                      <p className="text-sm text-white/70 font-light">
                        Please connect your wallet to publish your video and
                        receive payments.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setUploadStep(3)}
                  disabled={isUploading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
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
        )}

        {/* Step 5: Success Message */}
        {uploadStep === 5 && (
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
                      <Name address={address} className="text-white/70" />!
                    </span>
                  ) : (
                    <>Video Published Successfully!</>
                  )}
                </h3>
                <p className="text-white/70 mb-6 max-w-2xl mx-auto font-light">
                  Your video is now live on xStream and ready for viewers to
                  watch. Start earning with every second watched!
                </p>

                {/* Success Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-2xl mx-auto">
                  <div className="bg-white/[0.02] p-4 rounded-lg border border-white/10 backdrop-blur-xl">
                    <p className="text-white/70 text-sm mb-1 font-light">Video Title</p>
                    <p className="text-white font-light">{title}</p>
                  </div>
                  <div className="bg-white/[0.02] p-4 rounded-lg border border-white/10 backdrop-blur-xl">
                    <p className="text-white/70 text-sm mb-1 font-light">Pricing</p>
                    <p className="text-white font-light">
                      ${pricePerSecond}/second
                    </p>
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
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Browse Videos
                    </Button>
                  </Link>
                  <Button
                    onClick={resetForm}
                    className="w-full sm:w-auto"
                  >
                    <UploadIcon className="h-4 w-4 mr-2" />
                    Upload Another Video
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        )}
      </div>
    </div>
  );
}
