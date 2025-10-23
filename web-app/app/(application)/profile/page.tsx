"use client";

import { useState, useEffect } from "react";
import { useAccount, useBalance, useChainId } from "wagmi";
import { getWalletBalance } from "@/app/actions/wallet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loading } from "@/components/ui/loading";
import WalletDepositModal from "@/components/WalletDepositModal";
import {
    Calendar,
    Wallet,
    Edit,
    Share2,
    Copy,
    Check,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    Loader2,
    DollarSign,
    ArrowDownToLine,
    ArrowUpFromLine
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

interface Transaction {
    id: string;
    type: string;
    amount: string;
    description: string | null;
    createdAt: string;
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
    
    // Wallet state
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [walletLoading, setWalletLoading] = useState(false);

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

    // Fetch wallet data
    const fetchWalletData = async () => {
        if (!address) return;

        setWalletLoading(true);
        try {
            const result = await getWalletBalance(address);
            if (result.success) {
                setWalletBalance(parseFloat(result.balance || "0"));
                setTransactions(result.transactions || []);
            }
        } catch (error) {
            console.error("Failed to fetch wallet data:", error);
        } finally {
            setWalletLoading(false);
        }
    };

    useEffect(() => {
        if (isConnected && address) {
            fetchWalletData();
        }
    }, [address, isConnected]);

    const handleCopyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case "DEPOSIT":
                return <ArrowDownToLine className="h-4 w-4 text-green-400" />;
            case "STAKE":
                return <DollarSign className="h-4 w-4 text-blue-400" />;
            case "REFUND":
                return <ArrowUpFromLine className="h-4 w-4 text-purple-400" />;
            default:
                return <DollarSign className="h-4 w-4 text-white/50" />;
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

                {/* Wallet Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Balance Card */}
                    <Card className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 border-blue-500/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Wallet className="h-5 w-5" />
                                xStream Wallet Balance
                            </CardTitle>
                            <CardDescription className="text-blue-100">
                                Available for video viewing
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-5xl font-bold text-white mb-2">
                                        ${walletBalance.toFixed(2)}
                                    </div>
                                    <div className="text-sm text-blue-100">USDC on Base Sepolia</div>
                                </div>
                                <div className="flex gap-3">
                                    <WalletDepositModal onSuccess={fetchWalletData} />
                                    <Button
                                        variant="outline"
                                        onClick={fetchWalletData}
                                        disabled={walletLoading}
                                        className="gap-2 text-white border-white/20 hover:bg-white/10"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${walletLoading ? "animate-spin" : ""}`} />
                                        Refresh
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <div className="space-y-4">
                        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-white/70 mb-1">Total Deposits</p>
                                        <p className="text-2xl font-bold text-white">
                                            $
                                            {transactions
                                                .filter((tx) => tx.type === "DEPOSIT")
                                                .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
                                                .toFixed(2)}
                                        </p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-green-400" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-white/70 mb-1">Total Spent</p>
                                        <p className="text-2xl font-bold text-white">
                                            $
                                            {transactions
                                                .filter((tx) => tx.type === "STAKE")
                                                .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
                                                .toFixed(2)}
                                        </p>
                                    </div>
                                    <TrendingDown className="h-8 w-8 text-blue-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Transaction History */}
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">Transaction History</CardTitle>
                        <CardDescription className="text-white/70">
                            Your recent wallet activity
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {walletLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-white/50" />
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <AlertCircle className="h-12 w-12 text-white/30 mb-3" />
                                <p className="text-white/50 mb-2">No transactions yet</p>
                                <p className="text-white/30 text-sm mt-1 mb-4">
                                    Deposit funds to get started
                                </p>
                                <WalletDepositModal onSuccess={fetchWalletData} />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {transactions.map((tx) => (
                                    <div
                                        key={tx.id}
                                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-lg bg-white/5">
                                                {getTransactionIcon(tx.type)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge
                                                        variant="outline"
                                                        className={`${
                                                            tx.type === "DEPOSIT"
                                                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                                : tx.type === "STAKE"
                                                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                                                : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                                                        }`}
                                                    >
                                                        {tx.type}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-white/70">
                                                    {tx.description || "No description"}
                                                </p>
                                                <p className="text-xs text-white/50 mt-1">
                                                    {formatDistanceToNow(new Date(tx.createdAt), {
                                                        addSuffix: true,
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p
                                                className={`text-lg font-semibold ${
                                                    tx.type === "DEPOSIT" || tx.type === "REFUND"
                                                        ? "text-green-400"
                                                        : "text-white"
                                                }`}
                                            >
                                                {tx.type === "DEPOSIT" || tx.type === "REFUND" ? "+" : "-"}$
                                                {parseFloat(tx.amount).toFixed(4)}
                                            </p>
                                            <p className="text-xs text-white/50">USDC</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="mt-6 bg-blue-500/10 border-blue-500/20">
                    <CardContent className="p-6">
                        <div className="flex gap-4">
                            <div className="p-3 rounded-lg bg-blue-500/20">
                                <Wallet className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-2">How the Wallet Works</h3>
                                <ul className="text-sm text-white/70 space-y-1">
                                    <li>• Deposit USDC once using x402 payment protocol</li>
                                    <li>• Automatically stake before watching each video</li>
                                    <li>• Pay only for the time you actually watch</li>
                                    <li>• Get instant refunds for unwatched portions</li>
                                    <li>• No gas fees for video viewing after initial deposit</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
