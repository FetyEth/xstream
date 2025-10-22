"use client";

import { useState, useEffect } from "react";
import { useAccount, useBalance, useChainId } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loading } from "@/components/ui/loading";
import {
    Calendar,
    Wallet,
    Edit,
    Share2,
    Copy,
    Check
} from "lucide-react";

interface UserStats {
    totalEarned: number;
    totalVideos: number;
    totalViews: number;
    totalWatchTime: number;
    totalSpent: number;
}

interface UserData {
    id: string;
    walletAddress: string;
    username?: string;
    displayName?: string;
    profileImage?: string;
    createdAt: string;
    stats: UserStats;
    videos: any[];
}

export default function ProfilePage() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    
    const { data: balance } = useBalance({
        address: address as `0x${string}`,
    });
    
    const usdcAddresses: Record<number, `0x${string}`> = {
        8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base
        84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia
    };
    
    const { data: usdcBalance } = useBalance({
        address: address as `0x${string}`,
        token: usdcAddresses[chainId],
    });
    
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        async function fetchUserData() {
            if (!address) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(`/api/users/${address}/stats`);

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const data = await response.json();
                setUserData(data);
            } catch (err) {
                console.error('Failed to fetch user data:', err);
                setError('Unable to load profile data');
            } finally {
                setLoading(false);
            }
        }

        fetchUserData();
    }, [address]);

    const handleCopyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md w-full">
                    <CardContent className="p-8 text-center">
                        <Wallet className="h-16 w-16 mx-auto mb-4 text-white/50" />
                        <h2 className="text-2xl font-light text-white mb-2">Connect Your Wallet</h2>
                        <p className="text-white/50 font-light mb-6">
                            Please connect your wallet to view your profile
                        </p>
                        <Button onClick={() => window.location.href = '/connect'}>
                            Connect Wallet
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading text="Loading profile..." size="lg" />
            </div>
        );
    }

    if (error || !userData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md w-full">
                    <CardContent className="p-8 text-center">
                        <p className="text-xl text-white font-light mb-4">{error || 'Profile not found'}</p>
                        <Button onClick={() => window.location.reload()}>
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const displayName = userData.displayName || userData.username ||
        `${userData.walletAddress.slice(0, 6)}...${userData.walletAddress.slice(-4)}`;

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Profile Header */}
                <Card className="mb-6">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            {/* Avatar */}
                            <Avatar className="h-24 w-24 border-2 border-white/10">
                                <AvatarImage src={userData.profileImage} />
                                <AvatarFallback className="bg-white/5 text-white text-2xl font-light">
                                    {displayName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            {/* User Info */}
                            <div className="flex-1 space-y-3">
                                <div>
                                    <h1 className="text-3xl font-light text-white mb-1">{displayName}</h1>
                                    {userData.username && userData.displayName && (
                                        <p className="text-white/50 font-light">@{userData.username}</p>
                                    )}
                                </div>

                                {/* Wallet Address */}
                                <div className="flex items-center gap-2">
                                    <code className="text-sm text-white/70 font-mono bg-white/5 px-3 py-1 rounded">
                                        {userData.walletAddress.slice(0, 12)}...{userData.walletAddress.slice(-10)}
                                    </code>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCopyAddress}
                                        className="h-8 w-8 p-0"
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>

                                {/* Wallet Balances */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    {balance && (
                                        <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                                            <div className="flex items-center gap-2">
                                                <Wallet className="h-4 w-4 text-white/70" />
                                                <span className="text-white font-light">
                                                    {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {usdcBalance && parseFloat(usdcBalance.formatted) > 0 && (
                                        <div className="bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-blue-400 font-medium">USDC</span>
                                                <span className="text-white font-light">
                                                    {parseFloat(usdcBalance.formatted).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Join Date */}
                                <div className="flex items-center gap-2 text-sm text-white/50 font-light">
                                    <Calendar className="h-4 w-4" />
                                    <span>Joined {new Date(userData.createdAt).toLocaleDateString('en-US', {
                                        month: 'long',
                                        year: 'numeric'
                                    })}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Profile
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
