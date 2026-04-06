'use client';

import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation';
import { useRoleStore } from '@/store/roleStore';
import { Wallet, ArrowLeft, Shield, Fingerprint, Zap } from 'lucide-react';
import Link from 'next/link';

export default function ConnectPage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { getRoleForWallet } = useRoleStore();
  const role = address ? getRoleForWallet(address) : null;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isConnected) {
      // If already connected and has a role, go straight to appropriate page
      if (role === 'user') {
        router.push('/dashboard');
      } else if (role === 'institute') {
        router.push('/institute/request');
      } else {
        router.push('/connect/role');
      }
    }
  }, [isConnected, role, mounted, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background dot-grid-bg flex flex-col relative overflow-hidden">


      {/* Header */}
      <header className="relative z-10 p-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
            <span className="text-background font-bold text-sm font-display">U</span>
          </div>
          <span className="text-xl font-display font-black tracking-tight text-foreground">
            UniTrust
          </span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 pb-16">
        <div className="max-w-lg w-full text-center space-y-10">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 rounded-3xl bg-foreground flex items-center justify-center shadow-2xl shadow-black/20">
            <Wallet className="w-9 h-9 text-background" />
          </div>

          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-5xl md:text-6xl font-display font-black text-foreground tracking-tight">
              Connect Wallet
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
                className="bg-white rounded-[32px] p-6 border border-black/5 shadow-xl flex flex-col items-center justify-center gap-4 transition-all hover:border-black/10 hover:shadow-2xl hover:scale-105"
              >
                <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center mx-auto">
                  <item.icon className="w-5 h-5 text-foreground/60" />
                </div>
                <p className="text-sm font-bold text-foreground">{item.label}</p>
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
