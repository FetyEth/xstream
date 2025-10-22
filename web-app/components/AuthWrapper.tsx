"use client";

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { UserProvider, useUser } from '../app/hooks/useUser';
import { Loading } from './ui/loading';

interface AuthWrapperProps {
  children: React.ReactNode;
}

function AuthContent({ children }: AuthWrapperProps) {
  const { isConnected } = useAccount();
  const { user, isLoading } = useUser();
  const router = useRouter();

  // Redirect to connect page if wallet not connected
  useEffect(() => {
    if (!isConnected && !isLoading) {
      router.push('/connect');
      return;
    }
  }, [isConnected, isLoading, router]);

  // Redirect to onboarding if wallet connected but no user
  useEffect(() => {
    if (isConnected && !isLoading && !user) {
      router.push('/onboarding');
      return;
    }
  }, [isConnected, isLoading, user, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-black flex items-center justify-center">
        <Loading text="Authenticating..." size="lg" />
      </div>
    );
  }

  // Don't render children if wallet not connected or no user
  if (!isConnected || !user) {
    return null;
  }

  return <>{children}</>;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  return (
    <UserProvider>
      <AuthContent>{children}</AuthContent>
    </UserProvider>
  );
}