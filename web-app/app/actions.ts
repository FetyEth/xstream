"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { useFacilitator as getFacilitator } from "x402/verify";
import { PaymentRequirements } from "x402/types";
import { exact } from "x402/schemes";

const PLATFORM_WALLET = "0x86EA19b5647aF1beF9DCa055737417EF877ff935";
const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const USDC_EXTRA = {
  name: "USDC",
  version: "2",
};

/**
 * Core payment verification and settlement logic
 */
async function processPayment(
  payload: string,
  paymentRequirements: PaymentRequirements
): Promise<{ success: boolean; error?: string }> {
  const { verify, settle } = getFacilitator();

  try {
    const payment = exact.evm.decodePayment(payload);

    // Verify payment
    const valid = await verify(payment, paymentRequirements);
    if (!valid.isValid) {
      throw new Error(valid.invalidReason || "Payment verification failed");
    }

    // Settle payment
    const settleResponse = await settle(payment, paymentRequirements);
    if (!settleResponse.success) {
      throw new Error(settleResponse.errorReason || "Payment settlement failed");
    }

    return { success: true };
  } catch (error) {
    console.error("Payment processing error:", error);

    // Check for connection errors
    if (error instanceof Error && error.message.includes("ECONNREFUSED")) {
      return {
        success: false,
        error: "Cannot connect to x402 facilitator. Please ensure the facilitator service is running.",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Verify general payment and redirect to protected content
 */
export async function verifyPayment(payload: string): Promise<string> {
  const paymentRequirements: PaymentRequirements = {
    scheme: "exact",
    network: "base-sepolia",
    maxAmountRequired: "10000",
    resource: "https://example.com",
    description: "Payment for a service",
    mimeType: "text/html",
    payTo: PLATFORM_WALLET,
    maxTimeoutSeconds: 60,
    asset: USDC_BASE_SEPOLIA,
    outputSchema: undefined,
    extra: USDC_EXTRA,
  };

  const result = await processPayment(payload, paymentRequirements);

  if (!result.success) {
    return `Error: ${result.error}`;
  }

  const cookieStore = await cookies();
  cookieStore.set("payment-session", payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/protected");
}

/**
 * Verify upload fee payment ($0.50 USDC)
 */
export async function verifyUploadPayment(payload: string): Promise<string> {
  const paymentRequirements: PaymentRequirements = {
    scheme: "exact",
    network: "base-sepolia",
    maxAmountRequired: "500000", // 0.50 USDC (6 decimals)
    resource: "http://localhost:3000/upload",
    description: "xStream Upload Fee",
    mimeType: "application/json",
    payTo: PLATFORM_WALLET,
    maxTimeoutSeconds: 300,
    asset: USDC_BASE_SEPOLIA,
    outputSchema: undefined,
    extra: USDC_EXTRA,
  };

  const result = await processPayment(payload, paymentRequirements);

  if (!result.success) {
    return `Error: ${result.error}`;
  }

  // Store payment confirmation for tracking
  const cookieStore = await cookies();
  cookieStore.set("upload-payment-verified", "true", {
    maxAge: 300, // 5 minutes
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  return "Payment verified successfully";
}
