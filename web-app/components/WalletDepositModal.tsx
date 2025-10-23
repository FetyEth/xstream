"use client";

import { useState } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import { preparePaymentHeader } from "x402/client";
import { getNetworkId } from "x402/shared";
import { exact } from "x402/schemes";
import { PaymentRequirements, PaymentPayload } from "x402/types";
import { depositToWallet } from "@/app/actions/wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Wallet, Plus, Loader2 } from "lucide-react";

interface WalletDepositModalProps {
  onSuccess?: () => void;
}

export default function WalletDepositModal({ onSuccess }: WalletDepositModalProps) {
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("1.00");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeposit = async () => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Convert amount to USDC format (6 decimals)
      const amountInUSDC = Math.floor(depositAmount * 1000000).toString();

      const paymentRequirements: PaymentRequirements = {
        scheme: "exact",
        network: "base-sepolia",
        maxAmountRequired: amountInUSDC,
        resource: "https://xstream.app/wallet/deposit",
        description: `Deposit ${amount} USDC to xStream Wallet`,
        mimeType: "application/json",
        payTo: "0x86EA19b5647aF1beF9DCa055737417EF877ff935",
        maxTimeoutSeconds: 300,
        asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        outputSchema: undefined,
        extra: {
          name: "USDC",
          version: "2",
        },
      };

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

      const signature = await signTypedDataAsync(eip712Data);

      const paymentPayload: PaymentPayload = {
        ...unSignedPaymentHeader,
        payload: {
          ...unSignedPaymentHeader.payload,
          signature,
        },
      };

      const payment: string = exact.evm.encodePayment(paymentPayload);

      // Process deposit on server
      const result = await depositToWallet(payment, amountInUSDC, address);

      if (!result.success) {
        throw new Error(result.error || "Deposit failed");
      }

      setIsOpen(false);
      setAmount("1.00");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Deposit error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to deposit funds"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Funds
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-black/95 backdrop-blur-xl border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Wallet className="h-5 w-5" />
            Add Funds to Wallet
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Deposit USDC to your xStream wallet for seamless video viewing
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <label className="text-sm font-light text-white/70 mb-2 block">
              Amount (USDC)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1.00"
              className="bg-white/5 border-white/10 text-white"
            />
            <p className="text-xs text-white/50 mt-1">
              Minimum deposit: $0.01 USDC
            </p>
          </div>

          {/* Quick amounts */}
          <div className="flex gap-2">
            {["1.00", "5.00", "10.00", "25.00"].map((quickAmount) => (
              <Button
                key={quickAmount}
                variant="outline"
                size="sm"
                onClick={() => setAmount(quickAmount)}
                className="flex-1 text-white hover:bg-white/10"
              >
                ${quickAmount}
              </Button>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <p className="text-xs text-white/70">
              <strong>How it works:</strong>
              <br />
              1. Sign the payment with your wallet
              <br />
              2. USDC will be deposited to your xStream wallet
              <br />
              3. Use your balance to watch videos without repeated transactions
            </p>
          </div>

          <Button
            onClick={handleDeposit}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Deposit ${amount}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
