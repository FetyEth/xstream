"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useSignTypedData } from "wagmi";
import { preparePaymentHeader } from "x402/client";
import { getNetworkId } from "x402/shared";
import { exact } from "x402/schemes";
import { PaymentRequirements, PaymentPayload } from "x402/types";
import { verifyUploadPayment } from "../../actions";
import UploadBanner from "./components/UploadBanner";
import UploadSteps from "./components/UploadSteps";
import VideoUploadForm from "./components/VideoUploadForm";
import VideoDetailsForm from "./components/VideoDetailsForm";
import PricingSettingsForm from "./components/PricingSettingsForm";
import { Progress } from "@/components/ui/progress";
import PublishReview from "./components/PublishReview";
import SuccessMessage from "./components/SuccessMessage";

export default function UploadPage() {
  const router = useRouter();
  const [uploadStep, setUploadStep] = useState(1);
  const { address, isConnected } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
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
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // x402 Payment Requirements for upload fee ($0.50 in USDC)
  const paymentRequirements: PaymentRequirements = {
    scheme: "exact",
    network: "base-sepolia",
    maxAmountRequired: "500000", // 0.50 USDC (6 decimals)
    resource: "https://xstream.app/upload",
    description: "xStream Upload Fee",
    mimeType: "application/json",
    payTo: "0x86EA19b5647aF1beF9DCa055737417EF877ff935", // Your platform wallet
    maxTimeoutSeconds: 300,
    asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC on Base Sepolia
    outputSchema: undefined,
    extra: {
      name: "USDC",
      version: "2",
    },
  };

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
    setIsProcessingPayment(true);
    setError(null);
    setUploadProgress(10);

    try {
      // Step 1: Process x402 payment for upload fee
      console.log("Processing upload fee payment...");
      setUploadProgress(5);

      const unSignedPaymentHeader = preparePaymentHeader(
        address,
        1,
        paymentRequirements
      );

      const eip712Data = {
        types: {
          TransferWithAuthorization: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "validAfter", type: "uint256" },
            { name: "validBefore", type: "uint256" },
            { name: "nonce", type: "bytes32" },
          ],
        },
        domain: {
          name: paymentRequirements.extra?.name,
          version: paymentRequirements.extra?.version,
          chainId: getNetworkId(paymentRequirements.network),
          verifyingContract: paymentRequirements.asset as `0x${string}`,
        },
        primaryType: "TransferWithAuthorization" as const,
        message: unSignedPaymentHeader.payload.authorization,
      };

      // Sign the payment
      const signature = await signTypedDataAsync(eip712Data);
      setUploadProgress(8);

      const paymentPayload: PaymentPayload = {
        ...unSignedPaymentHeader,
        payload: {
          ...unSignedPaymentHeader.payload,
          signature,
        },
      };

      const payment: string = exact.evm.encodePayment(paymentPayload);

      // Verify and settle the payment
      console.log("Verifying payment...");
      const paymentResult = await verifyUploadPayment(payment);
      
      if (paymentResult.startsWith("Error:")) {
        throw new Error(paymentResult);
      }

      console.log("Payment verified successfully!");
      setIsProcessingPayment(false);
      setUploadProgress(10);

      // Step 2: Continue with video upload
      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("tags", tags);
      
      if (address) {
        formData.append("walletAddress", address);
      }
      formData.append("creatorWallet", address);

      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }
      console.log("Creator wallet address:", address);

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
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload video"
      );
      setIsProcessingPayment(false);
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
    setUploadError(null);
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
      <UploadBanner />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-white mb-2">Upload Video</h1>
          <p className="text-white/70 font-light">
            Share your content and earn with x402 micropayments
          </p>
        </div>

        <UploadSteps currentStep={uploadStep} />

        {/* Step 1: Upload Video */}
        {uploadStep === 1 && (
          <VideoUploadForm
            onVideoUpload={handleVideoUpload}
            uploadError={uploadError}
          />
        )}

        {/* Step 2: Video Details */}
        {uploadStep === 2 && (
          <VideoDetailsForm
            videoFile={videoFile}
            title={title}
            description={description}
            category={category}
            tags={tags}
            thumbnailPreview={thumbnailPreview}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onCategoryChange={setCategory}
            onTagsChange={setTags}
            onThumbnailUpload={handleThumbnailUpload}
            onRemoveThumbnail={removeThumbnail}
            onBack={() => setUploadStep(1)}
            onNext={() => setUploadStep(3)}
            formatFileSize={formatFileSize}
          />
        )}

        {/* Step 3: Pricing & Settings */}
        {uploadStep === 3 && (
          <PricingSettingsForm
            pricePerSecond={pricePerSecond}
            maxQuality={maxQuality}
            onPriceChange={setPricePerSecond}
            onQualityChange={setMaxQuality}
            onBack={() => setUploadStep(2)}
            onNext={() => setUploadStep(4)}
            qualityOptions={getQualityOptions()}
          />
        )}

        {/* Step 4: Publishing */}
        {uploadStep === 4 && (
          <PublishReview
            title={title}
            category={category}
            maxQuality={maxQuality}
            pricePerSecond={pricePerSecond}
            videoFile={videoFile}
            tags={tags}
            description={description}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            uploadError={uploadError}
            isConnected={isConnected}
            isProcessingPayment={isProcessingPayment}
            onBack={() => setUploadStep(3)}
            onSubmit={handleSubmit}
            onDismissError={() => setUploadError(null)}
            formatFileSize={formatFileSize}
          />
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
          <SuccessMessage
            isConnected={isConnected}
            address={address}
            title={title}
            pricePerSecond={pricePerSecond}
            maxQuality={maxQuality}
            uploadedVideoUrl={uploadedVideoUrl}
            onReset={resetForm}
          />
        )}
      </div>
    </div>
  );
}
