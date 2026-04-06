'use client';

import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useRoleStore } from '@/store/roleStore';
import { profileService } from '@/services/profileService';
import { GraduationCap, Building2, ArrowRight, ArrowLeft, Wallet, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function RoleSelectPage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { role, setRole } = useRoleStore();
  const [mounted, setMounted] = useState(false);
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isConnected) {
      router.push('/connect');
    }
  }, [isConnected, mounted, router]);

  const handleRoleSelect = async (selectedRole: 'user' | 'institute') => {
    if (!address) return;
    
    setRole(selectedRole);
    if (selectedRole === 'user') {
      router.push('/dashboard');
    } else {
      setIsLoadingProfile(true);
      try {
        // Check if institute profile exists
        const res = await profileService.getInstituteProfile(address);
        if (res.profile) {
          router.push('/institute/request');
        } else {
          router.push('/institute/register');
        }
      } catch (err: any) {
        // If 404, it means profile not found, so redirect to register
        if (err.response?.status === 404) {
          router.push('/institute/register');
        } else {
          console.error('Error fetching institute profile:', err);
          // Fallback to register if there's an error (e.g. backend down or first time)
          router.push('/institute/register');
        }
      } finally {
        setIsLoadingProfile(false);
      }
    }
  };

  if (!mounted || !isConnected) return null;

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-20 w-80 h-80 bg-accent-pink/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 left-20 w-96 h-96 bg-accent-green/8 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
            <span className="text-white font-bold text-sm font-display">U</span>
          </div>
          <span className="text-xl font-display font-black tracking-tight text-[#1A1A1A]">
            Uni<span className="text-accent-pink">Trust</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/10 shadow-sm">
            <Wallet className="w-4 h-4 text-[#1A1A1A]" />
            <span className="text-sm font-mono font-medium text-[#1A1A1A]">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 pb-16">
        <div className="max-w-3xl w-full text-center space-y-12">
          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-5xl font-display font-black text-[#1A1A1A] tracking-tight leading-[1.1]">
              Choose Your Role
            </h1>
            <p className="text-lg text-muted font-medium max-w-md mx-auto">
              Select how you want to use UniTrust. You can always switch later.
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* User Card */}
            <button
              onClick={() => handleRoleSelect('user')}
              onMouseEnter={() => setHoveredRole('user')}
              onMouseLeave={() => setHoveredRole(null)}
              className={`group relative bg-white rounded-[32px] border-2 p-8 text-left transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                hoveredRole === 'user'
                  ? 'border-accent-green shadow-accent-green/10'
                  : 'border-black/[0.06] shadow-sm'
              }`}
            >
              <div className="space-y-5">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
                  hoveredRole === 'user' ? 'bg-accent-green/20' : 'bg-[#1A1A1A]/5'
                }`}>
                  <GraduationCap className={`w-8 h-8 transition-colors duration-300 ${
                    hoveredRole === 'user' ? 'text-accent-green' : 'text-[#1A1A1A]/50'
                  }`} />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-black text-[#1A1A1A] tracking-tight">
                    I'm a User
                  </h3>
                  <p className="text-muted text-sm mt-2 leading-relaxed">
                    Register & manage assets, view certificates, verify authenticity, and track your digital portfolio.
                  </p>
                </div>
                <div className={`flex items-center gap-2 text-sm font-bold transition-colors duration-300 ${
                  hoveredRole === 'user' ? 'text-accent-green' : 'text-muted'
                }`}>
                  Enter Dashboard
                  <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${
                    hoveredRole === 'user' ? 'translate-x-1' : ''
                  }`} />
                </div>
              </div>
            </button>

            {/* Institute Card */}
            <button
              onClick={() => handleRoleSelect('institute')}
              onMouseEnter={() => setHoveredRole('institute')}
              onMouseLeave={() => setHoveredRole(null)}
              className={`group relative bg-white rounded-[32px] border-2 p-8 text-left transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                hoveredRole === 'institute'
                  ? 'border-accent-pink shadow-accent-pink/10'
                  : 'border-black/[0.06] shadow-sm'
              }`}
            >
              <div className="space-y-5">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
                  hoveredRole === 'institute' ? 'bg-accent-pink/20' : 'bg-[#1A1A1A]/5'
                }`}>
                  <Building2 className={`w-8 h-8 transition-colors duration-300 ${
                    hoveredRole === 'institute' ? 'text-accent-pink' : 'text-[#1A1A1A]/50'
                  }`} />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-black text-[#1A1A1A] tracking-tight">
                    I'm an Institute
                  </h3>
                  <p className="text-muted text-sm mt-2 leading-relaxed">
                    Submit certificate issuance requests for students. Manage and track your issued credentials.
                  </p>
                </div>
                <div className={`flex items-center gap-2 text-sm font-bold transition-colors duration-300 ${
                  hoveredRole === 'institute' ? 'text-accent-pink' : 'text-muted'
                }`}>
                  {isLoadingProfile ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Submit Requests
                      <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${
                        hoveredRole === 'institute' ? 'translate-x-1' : ''
                      }`} />
                    </>
                  )}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center">
        <p className="text-xs text-muted">
          Your role determines your dashboard experience. Both roles use the same wallet.
        </p>
      </footer>
    </div>
  );
}
