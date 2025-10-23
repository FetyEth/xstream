"use client";

import { Input } from "@/components/ui/input";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance
} from '@coinbase/onchainkit/identity';
import { Search, User, Network } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAccount, useSwitchChain } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const getNetworkName = (chainId: number | undefined) => {
    if (!chainId) return "Network";
    switch (chainId) {
      case 8453:
        return "Base";
      case 84532:
        return "Sepolia";
      default:
        return `Chain ${chainId}`;
    }
  };

  const getNetworkColor = (chainId: number | undefined) => {
    if (!chainId) return "text-white/50";
    switch (chainId) {
      default:
        return "text-white/50";
    }
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
      <div className="px-6 py-4 flex items-center justify-between gap-4" >
        <Link href="/" className="flex items-center gap-3 hover:bg-white/5 px-2 py-1 rounded-md transition-colors duration-300 shrink-0">
          <Image src="/logo.png" alt="xStream Logo" width={36} height={36} />
          <span className="text-xl font-light tracking-tight text-white">
            xStream
          </span>
        </Link>

        <div className="flex-1 max-w-2xl hidden lg:block">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Search videos, creators, topics..."
              className="pl-11"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Network Switcher */}
          {isConnected && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors duration-300 ${getNetworkColor(chain?.id)}`}
                  title="Switch Network"
                >
                  <Network className="h-4 w-4" />
                  <span className="text-sm font-light hidden sm:inline">{getNetworkName(chain?.id)}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/95 backdrop-blur-xl border-white/10 text-white">
                <DropdownMenuLabel className="font-light text-white/70">
                  Switch Network
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={() => switchChain({ chainId: baseSepolia.id })}
                  className={`cursor-pointer hover:bg-white/10 ${
                    chain?.id === 84532 ? "bg-white/20 text-white" : ""
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span>Base Sepolia</span>
                    </div>
                    {chain?.id === 84532 && (
                      <span className="text-xs text-white">✓</span>
                    )}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {isConnected && (
            <Link 
              href="/profile" 
              className="p-2 rounded-lg hover:bg-white/5 transition-colors duration-300"
              title="View Profile"
            >
              <User className="h-5 w-5 text-white/70 hover:text-white transition-colors" />
            </Link>
          )}
          <Wallet>
            <ConnectWallet>
              <Name className="text-sm font-light" />
            </ConnectWallet>
            <WalletDropdown>
              <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                <Avatar />
                <Name />
                <Address />
                <EthBalance />
              </Identity>
              <WalletDropdownLink icon="wallet" href="https://keys.coinbase.com">
                Wallet
              </WalletDropdownLink>
              <WalletDropdownDisconnect />
            </WalletDropdown>
          </Wallet>
        </div>
      </div>
    </header>
  );
}
