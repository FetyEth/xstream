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
import { Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  
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
