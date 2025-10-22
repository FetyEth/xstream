"use client";

import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, DollarSign, Shield, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ConnectPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-xl mx-auto">
        <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-xl p-6 md:p-8">
          <div className="text-center space-y-6">
            
            {/* Logo & Badge */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
                  <Image 
                    src="/logo.png" 
                    alt="xStream" 
                    width={32}
                    height={32}
                  />
                </div>
              </div>
              <Badge variant="secondary" className="bg-white/5 text-white/80 border-white/10 px-3 py-1">
                The Future of Streaming
              </Badge>
            </div>

            {/* Main Heading */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-light text-white">
                Connect Your Wallet
              </h1>
              <p className="text-white/60 font-light">
                Join xStream for decentralized video streaming with per-second monetization.
              </p>
            </div>

            {/* Connect Wallet Component */}
            <div className="flex justify-center py-2 mx-auto">
                <ConnectWallet />
            </div>

            {/* Features - Compact */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neutral-800/30 rounded-lg p-3 border border-neutral-700/50">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-white/70 mr-2" />
                  <h3 className="text-sm text-white font-light">Per-Second</h3>
                </div>
              </div>

              <div className="bg-neutral-800/30 rounded-lg p-3 border border-neutral-700/50">
                <div className="flex items-center">
                  <Zap className="w-4 h-4 text-white/70 mr-2" />
                  <h3 className="text-sm text-white font-light">Instant</h3>
                </div>
              </div>

              <div className="bg-neutral-800/30 rounded-lg p-3 border border-neutral-700/50">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-white/70 mr-2" />
                  <h3 className="text-sm text-white font-light">Secure</h3>
                </div>
              </div>

              <div className="bg-neutral-800/30 rounded-lg p-3 border border-neutral-700/50">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-white/70 mr-2" />
                  <h3 className="text-sm text-white font-light">Real-Time</h3>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="pt-4 border-t border-neutral-800 space-y-3">
              <p className="text-sm text-white/50 font-light">
                Ready to explore?
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button 
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-neutral-700 text-white hover:bg-neutral-800 font-light"
                >
                  <Link href="/browse">
                    Browse Videos
                  </Link>
                </Button>
                
                <Button 
                  asChild
                  size="sm"
                  className="bg-white text-black hover:bg-white/90 font-light"
                >
                  <Link href="/upload">
                    Start Creating
                  </Link>
                </Button>
              </div>
            </div>

          </div>
        </Card>
      </div>
    </div>
  );
}