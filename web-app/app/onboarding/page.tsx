"use client";

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { UserProvider, useUser } from '../hooks/useUser';
import { User, Wallet } from 'lucide-react';
import Image from 'next/image';

function OnboardingForm() {
  const { address } = useAccount();
  const { refreshUser } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    profileImage: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.displayName && formData.displayName.length > 50) {
      newErrors.displayName = 'Display name must be 50 characters or less';
    }
    
    if (formData.username && !/^[a-zA-Z0-9_]{3,30}$/.test(formData.username)) {
      newErrors.username = 'Username must be 3-30 characters, letters, numbers, and underscores only';
    }
    
    if (formData.profileImage && formData.profileImage.trim()) {
      try {
        new URL(formData.profileImage);
      } catch {
        newErrors.profileImage = 'Please enter a valid URL';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !address) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          username: formData.username || undefined,
          displayName: formData.displayName,
          profileImage: formData.profileImage || undefined
        })
      });

      if (response.ok) {
        await refreshUser();
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.error || 'Failed to create account' });
      }
    } catch {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md mx-auto">
        <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-xl p-6 md:p-8">
          <div className="text-center space-y-6">
            
            {/* Logo */}
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

            {/* Welcome Badge */}
            <Badge variant="secondary" className="bg-white/5 text-white/80 border-white/10 px-3 py-1">
              Welcome to xStream
            </Badge>

            {/* Header */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-light text-white">
                Create Your Profile
              </h1>
              <p className="text-white/60 font-light">
                Customize your profile to get started on xStream
              </p>
              <p className="text-sm text-white/50 font-light">
                All fields are optional - you can skip and customize later
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              <div>
                <label className="block text-sm font-light text-white/80 mb-2">
                  Display Name (Optional)
                </label>
                <Input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder="How you want to be known"
                  className="bg-neutral-800/50 border-neutral-700 text-white placeholder:text-white/40 font-light"
                  maxLength={50}
                />
                {errors.displayName && (
                  <p className="text-red-400 text-sm mt-2 font-light">{errors.displayName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-light text-white/80 mb-2">
                  Username (Optional)
                </label>
                <Input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="@username"
                  className="bg-neutral-800/50 border-neutral-700 text-white placeholder:text-white/40 font-light"
                  maxLength={30}
                />
                {errors.username && (
                  <p className="text-red-400 text-sm mt-2 font-light">{errors.username}</p>
                )}
                <p className="text-white/50 text-xs mt-2 font-light">
                  3-30 characters, letters, numbers, and underscores only
                </p>
              </div>

              <div>
                <label className="block text-sm font-light text-white/80 mb-2">
                  Profile Image URL (Optional)
                </label>
                <Input
                  type="url"
                  value={formData.profileImage}
                  onChange={(e) => handleInputChange('profileImage', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="bg-neutral-800/50 border-neutral-700 text-white placeholder:text-white/40 font-light"
                />
              </div>



              {errors.submit && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm font-light">{errors.submit}</p>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white text-black hover:bg-white/90 font-light py-3"
                >
                  <User className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Creating Account...' : 'Create Profile'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={isSubmitting}
                  className="w-full border-neutral-700 text-white hover:bg-neutral-800 font-light"
                >
                  Skip for now
                </Button>
              </div>
            </form>

            {/* Connected Wallet Info */}
            <div className="pt-4 border-t border-neutral-800">
              <div className="flex items-center justify-center text-sm text-white/50 font-light">
                <Wallet className="w-4 h-4 mr-2" />
                <span>Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
              </div>
            </div>

          </div>
        </Card>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <UserProvider>
      <OnboardingForm />
    </UserProvider>
  );
}