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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // x402 Payment Requirements for upload fee ($0.01 in USDC)
  const paymentRequirements: PaymentRequirements = {
    scheme: "exact",
    network: "base-sepolia",
    maxAmountRequired: "10000", // 0.01 USDC (6 decimals)
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
        setUploadError("File size must be less than 500MB");
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
        setUploadError("Please upload a valid video file (MP4, MOV, AVI, WMV)");
        return;
      }

      setVideoFile(file);
      setUploadError(null);
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
      setUploadError("Please connect your wallet first");
      return;
    }

    if (!videoFile) {
      setUploadError("Please select a video file");
      return;
    }

    if (!title.trim()) {
      setUploadError("Please enter a video title");
      return;
    }

    if (!category.trim()) {
      setUploadError("Please select a category");
      return;
    }

    setIsUploading(true);
    setIsProcessingPayment(true);
    setUploadError(null);
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
