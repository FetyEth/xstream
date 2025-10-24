"use client";

import { Button } from "@/components/ui/button";
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
import { Search, Upload as UploadIcon, Play, TrendingUp, Home, LayoutDashboard, Target, Network, Wallet as WalletIcon } from "lucide-react";
import Link from "next/link";
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
import WalletBalance from "@/components/WalletBalance";

export default function Header() {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const getNetworkName = (chainId: number | undefined) => {
    if (!chainId) return "Not Connected";
    switch (chainId) {
      case 8453:
        return "Base";
      case 84532:
        return "Base Sepolia";
      default:
        return `Chain ${chainId}`;
    }
  };

  const getNetworkColor = (chainId: number | undefined) => {
    if (!chainId) return "text-gray-400";
    switch (chainId) {
      case 8453:
        return "text-blue-400";
      case 84532:
        return "text-purple-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
      <div className="px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
            <Play className="w-6 h-6 text-white" fill="white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            xStream
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-4 ml-8">
          <Link href="/browse">
            <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-blue-400">
              <Home className="w-4 h-4 mr-2" />
              Browse
            </Button>
          </Link>
          <Link href="/trending">
            <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-blue-400">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-blue-400">
              <WalletIcon className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-blue-400">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <div className="w-px h-6 bg-white/20 mx-2"></div>
          <Link href="/advertise">
            <Button variant="ghost" className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-300">
              <Target className="w-4 h-4 mr-2" />
              Advertise
            </Button>
          </Link>
        </nav>

        <div className="flex-1 max-w-2xl mx-8 hidden lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              placeholder="Search videos, creators, topics..." 
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Wallet Balance */}
          <WalletBalance />

          {/* Network Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={`text-white hover:bg-white/10 ${getNetworkColor(chain?.id)}`}
              >
                <Network className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{getNetworkName(chain?.id)}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black/95 backdrop-blur-xl border-white/10 text-white">
              <DropdownMenuLabel className="font-light text-white/70">
                Switch Network
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={() => switchChain({ chainId: base.id })}
                className={`cursor-pointer hover:bg-white/10 ${
                  chain?.id === 8453 ? "bg-blue-500/20 text-blue-400" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span>Base Mainnet</span>
                  {chain?.id === 8453 && (
                    <span className="ml-auto text-xs text-blue-400">✓</span>
                  )}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => switchChain({ chainId: baseSepolia.id })}
                className={`cursor-pointer hover:bg-white/10 ${
                  chain?.id === 84532 ? "bg-purple-500/20 text-purple-400" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span>Base Sepolia</span>
                  {chain?.id === 84532 && (
                    <span className="ml-auto text-xs text-purple-400">✓</span>
                  )}
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/upload">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <UploadIcon className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Upload</span>
            </Button>
          </Link>
          
          <Wallet>
            <ConnectWallet>
              <Avatar className="h-6 w-6" />
              <Name />
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
