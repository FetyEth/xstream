'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, ArrowUpFromLine, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';

interface Earnings {
  total: number;
  settled: number;
  available: number;
  canWithdraw: boolean;
}

interface Settlement {
  id: string;
  amount: number;
  status: string;
  txHash?: string;
  requestedAt: string;
  completedAt?: string;
}

export default function CreatorWithdrawals() {
  const { address } = useAccount();
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch earnings and settlement history
  const fetchData = async () => {
    if (!address) return;

    try {
      setLoading(true);
      
      // Get available earnings
      const earningsRes = await fetch(`/api/settlements/request?walletAddress=${address}`);
      const earningsData = await earningsRes.json();
      setEarnings(earningsData);

      // Get settlement history
      const historyRes = await fetch(`/api/settlements/history?walletAddress=${address}`);
      const historyData = await historyRes.json();
      setSettlements(historyData.settlements || []);
      
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [address]);

  // Request withdrawal
  const requestWithdrawal = async () => {
    if (!address) return;

    try {
      setRequesting(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/settlements/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to request withdrawal');
      }

      setSuccess(`Withdrawal requested! Amount: $${data.amount}`);
      
      // Refresh data
      await fetchData();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRequesting(false);
    }
  };

  if (!address) {
    return null; // Don't show anything if wallet not connected
  }

  // Always show the earnings card - creators need to see even $0 earnings
  // This encourages them to upload videos and shows the payout feature exists

  return (
    <div className="space-y-6">
      {/* Earnings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white font-light">
            <DollarSign className="h-5 w-5" />
            Creator Earnings
          </CardTitle>
          <CardDescription className="text-neutral-400 font-light">
            Earnings from your uploaded videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !earnings ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-sm text-neutral-400 font-light mb-1">Total Earnings</p>
                  <p className="text-2xl font-light text-white">
                    ${earnings?.total.toFixed(4) || '0.0000'}
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-sm text-neutral-400 font-light mb-1">Available</p>
                  <p className="text-2xl font-light text-white">
                    ${earnings?.available.toFixed(4) || '0.0000'}
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-sm text-neutral-400 font-light mb-1">Withdrawn</p>
                  <p className="text-2xl font-light text-white">
                    ${earnings?.settled.toFixed(4) || '0.0000'}
                  </p>
                </div>
              </div>

              {/* Withdraw Button */}
              <div className="mt-4">
                {error && (
                  <div className="mb-4 bg-white/5 border border-white/10 rounded-lg p-3">
                    <p className="text-neutral-400 text-sm font-light flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </p>
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 bg-white/5 border border-white/10 rounded-lg p-3">
                    <p className="text-white text-sm font-light flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      {success}
                    </p>
                  </div>
                )}

                <Button
                  onClick={requestWithdrawal}
                  disabled={requesting || !earnings?.canWithdraw}
                  className="w-full gap-2"
                >
                  {requesting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : earnings?.canWithdraw && earnings.available > 0 ? (
                    <>
                      <ArrowUpFromLine className="h-4 w-4" />
                      Request Withdrawal (${earnings.available.toFixed(4)})
                    </>
                  ) : earnings?.available === 0 ? (
                    <>
                      <DollarSign className="h-4 w-4" />
                      No earnings yet - Upload videos to start earning!
                    </>
                  ) : (
                    'No funds available'
                  )}
                </Button>
                
                <div className="text-xs text-neutral-500 font-light mt-3 space-y-1">
                  <p className="flex items-center gap-1">
                    ⚠️ Temporarily allowing withdrawals of any amount • Future minimum: $10 USDC
                  </p>
                  <p className="flex items-center gap-1">
                    ⚡ Powered by Coinbase AgentKit • Instant on-chain payouts via smart wallet
                  </p>
                  <p>
                    📍 Funds sent directly to your wallet on Base Sepolia • Processing time: Instant to 5 minutes
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settlement History */}
      {settlements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-white font-light">Withdrawal History</CardTitle>
            <CardDescription className="text-neutral-400 font-light">
              Track your settlement requests and payouts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {settlements.map((settlement) => (
                <div
                  key={settlement.id}
                  className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-lg font-light text-white">
                          ${Number(settlement.amount).toFixed(2)} USDC
                        </p>
                        <span
                          className={`px-2 py-1 text-xs font-light rounded flex items-center gap-1 ${
                            settlement.status === 'COMPLETED'
                              ? 'bg-white/10 text-white border border-white/20'
                              : settlement.status === 'PROCESSING'
                              ? 'bg-white/10 text-white border border-white/20'
                              : settlement.status === 'PENDING'
                              ? 'bg-white/10 text-white border border-white/20'
                              : 'bg-white/5 text-neutral-400 border border-white/10'
                          }`}
                        >
                          {settlement.status === 'COMPLETED' && <CheckCircle className="h-3 w-3" />}
                          {settlement.status === 'PROCESSING' && <Loader2 className="h-3 w-3 animate-spin" />}
                          {settlement.status === 'PENDING' && <Clock className="h-3 w-3" />}
                          {settlement.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-neutral-500 font-light">
                        Requested: {new Date(settlement.requestedAt).toLocaleString()}
                      </p>
                      
                      {settlement.completedAt && (
                        <p className="text-sm text-neutral-500 font-light">
                          Completed: {new Date(settlement.completedAt).toLocaleString()}
                        </p>
                      )}
                      
                      {settlement.txHash && (
                        <a
                          href={`https://sepolia.basescan.org/tx/${settlement.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-neutral-400 hover:text-white font-light mt-1 inline-block transition-colors"
                        >
                          View Transaction on BaseScan →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
