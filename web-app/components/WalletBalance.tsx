"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getWalletBalance } from "@/app/actions/wallet";
import { Wallet, Loader2 } from "lucide-react";
import WalletDepositModal from "./WalletDepositModal";

export default function WalletBalance() {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const result = await getWalletBalance(address);
      if (result.success && result.balance !== undefined) {
        setBalance(parseFloat(result.balance));
      }
    } catch (error) {
      console.error("Failed to fetch wallet balance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchBalance();
    } else {
      setBalance(null);
    }
  }, [address, isConnected]);

  if (!isConnected) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
        <Wallet className="h-4 w-4 text-white/70" />
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-white/70" />
        ) : (
          <span className="text-sm font-medium text-white">
            ${balance !== null ? balance.toFixed(2) : "0.00"}
          </span>
        )}
      </div>
      <WalletDepositModal onSuccess={fetchBalance} />
    </div>
  );
}
