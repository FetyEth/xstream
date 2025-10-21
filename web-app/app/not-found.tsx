"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Search } from "lucide-react";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-xl p-8 md:p-12">
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
                <Image 
                  src="/logo.png" 
                  alt="xStream" 
                  width={32}
                  height={32}
                  className="opacity-70"
                />
              </div>
            </div>

            {/* Main Message */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-light text-white">
                Page Not Found
              </h1>
              <p className="text-lg text-white/60 font-light max-w-md mx-auto">
                The page you&apos;re looking for doesn&apos;t exist or has been moved to a different location.
              </p>
            </div>


            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                asChild
                className="bg-white text-black hover:bg-white/90 font-light px-6"
              >
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                asChild
                className="border-neutral-700 text-white hover:bg-neutral-800 font-light px-6"
              >
                <Link href="/browse">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Videos
                </Link>
              </Button>
            </div>

            {/* Footer Message */}
            <div className="pt-6 border-t border-neutral-800">
              <p className="text-sm text-white/40 font-light">
                Need help? Contact our support team or check our{" "}
                <Link href="/help" className="text-white/60 hover:text-white transition-colors">
                  help center
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}