'use client';

import { base, baseSepolia, mainnet, sepolia, optimism, arbitrum, polygon } from 'wagmi/chains';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors';
import type { ReactNode } from 'react';

const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'xStream',
      preference: 'all',
    }),
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http()
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers(props: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={baseSepolia}
          config={{
            appearance: {
              mode: 'dark',
              theme: 'default',
            },
          }}
        >
          {props.children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
