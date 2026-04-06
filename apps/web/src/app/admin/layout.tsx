'use client';

import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ADMIN_WALLET } from '@/lib/constants';
import Link from 'next/link';
import { ShieldAlert, Wallet, ArrowLeft } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto">
            <Wallet className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-3xl font-display font-black text-white tracking-tight">
            Wallet Not Connected
          </h1>
          <p className="text-white/50 text-lg">
            You need to connect your admin wallet to access this panel.
          </p>
          <Link
            href="/connect"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors"
          >
            Connect Wallet
          </Link>
        </div>
      </div>
    );
  }

  // Not admin
  if (ADMIN_WALLET && address?.toLowerCase() !== ADMIN_WALLET) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-3xl font-display font-black text-white tracking-tight">
            Access Denied
          </h1>
          <p className="text-white/50 text-lg">
            This admin panel is restricted. Your wallet does not have permission to access it.
          </p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-xs text-white/30 uppercase tracking-widest font-bold mb-1">Connected Wallet</p>
            <p className="text-sm text-white/60 font-mono break-all">{address}</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
