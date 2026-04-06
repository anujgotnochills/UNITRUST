'use client';

import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation';
import { useRoleStore } from '@/store/roleStore';
import { profileService } from '@/services/profileService';
import { Wallet, ArrowLeft, Shield, Fingerprint, Zap } from 'lucide-react';
import Link from 'next/link';

export default function ConnectPage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { role, setRole, getRoleForWallet, setRoleForWallet } = useRoleStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isConnected || !address) return;

    const checkExistingRole = async () => {
      // 1. Check if we already have a cached role for this wallet
      const cachedRole = getRoleForWallet(address);
      if (cachedRole === 'user') {
        setRole(cachedRole);
        router.push('/dashboard');
        return;
      }
      if (cachedRole === 'institute') {
        setRole(cachedRole);
        router.push('/institute/request');
        return;
      }

      // 2. No cached role — check the backend for existing profiles
      try {
        const userRes = await profileService.getUserProfile(address);
        if (userRes?.profile) {
          setRoleForWallet(address, 'user');
          router.push('/dashboard');
          return;
        }
      } catch {}

      try {
        const instRes = await profileService.getInstituteProfile(address);
        if (instRes?.profile) {
          setRoleForWallet(address, 'institute');
          router.push('/institute/request');
          return;
        }
      } catch {}

      // 3. No profile found anywhere — show role selection
      router.push('/connect/role');
    };

    checkExistingRole();
  }, [isConnected, address, mounted, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent-pink/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-green/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-purple/5 rounded-full blur-[150px]" />
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
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-muted hover:text-[#1A1A1A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 pb-16">
        <div className="max-w-lg w-full text-center space-y-10">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-[#1A1A1A] to-[#333] flex items-center justify-center shadow-2xl shadow-black/20">
            <Wallet className="w-9 h-9 text-white" />
          </div>

          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-5xl font-display font-black text-[#1A1A1A] tracking-tight leading-[1.1]">
              Connect Your<br />
              <span className="bg-gradient-to-r from-accent-pink to-accent-purple bg-clip-text text-transparent">Wallet</span>
            </h1>
            <p className="text-lg text-muted font-medium max-w-md mx-auto">
              Connect your Web3 wallet to access the UniTrust platform. Your wallet is your identity.
            </p>
          </div>

          {/* Connect Button */}
          <div className="flex justify-center">
            <div className="transform hover:scale-[1.02] transition-transform">
              <ConnectButton
                showBalance={false}
                chainStatus="icon"
                accountStatus="address"
                label="Connect Wallet"
              />
            </div>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-3 gap-4 pt-6">
            {[
              { icon: Shield, label: 'Secure', desc: 'Non-custodial' },
              { icon: Fingerprint, label: 'Private', desc: 'You own your data' },
              { icon: Zap, label: 'Instant', desc: 'One-click access' },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-black/[0.04] text-center space-y-2"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1A1A1A]/5 flex items-center justify-center mx-auto">
                  <item.icon className="w-5 h-5 text-[#1A1A1A]/60" />
                </div>
                <p className="text-sm font-bold text-[#1A1A1A]">{item.label}</p>
                <p className="text-xs text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer note */}
      <footer className="relative z-10 p-6 text-center">
        <p className="text-xs text-muted">
          By connecting, you agree to UniTrust's terms. We never access your private keys.
        </p>
      </footer>
    </div>
  );
}
