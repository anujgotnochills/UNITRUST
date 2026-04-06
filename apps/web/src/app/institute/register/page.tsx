'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useRoleStore } from '@/store/roleStore';
import { profileService } from '@/services/profileService';
import { ipfsService } from '@/services/ipfsService';
import toast from 'react-hot-toast';
import { Building2, Upload, Loader2, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function InstituteRegisterPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { role } = useRoleStore();
  
  const [instituteName, setInstituteName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isConnected) {
      router.push('/connect');
    } else if (role !== 'institute') {
      router.push('/connect/role');
    }
  }, [isConnected, role, mounted, router]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await ipfsService.uploadFile(file);
      setLogoUrl(res.url);
      toast.success('Logo uploaded to IPFS!');
    } catch (err) {
      console.error(err);
      toast.error('Logo upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setIsSubmitting(true);
    try {
      await profileService.createOrUpdateInstitute({
        walletAddress: address,
        instituteName,
        logo: logoUrl,
      });
      toast.success('Institute registered successfully!');
      router.push('/institute/request');
    } catch (err) {
      console.error(err);
      toast.error('Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || !isConnected) return null;

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-pink/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-green/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10 text-center">
        <div className="space-y-4">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-[#1A1A1A] flex items-center justify-center shadow-2xl">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-display font-black text-[#1A1A1A] tracking-tight">
            Register Institute
          </h1>
          <p className="text-muted font-medium">
            Complete your profile to start issuing certificates.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[32px] border border-black/10 shadow-xl p-8 space-y-6 text-left">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1A1A1A] uppercase tracking-widest px-1">
              Institute Name
            </label>
            <input
              required
              type="text"
              value={instituteName}
              onChange={(e) => setInstituteName(e.target.value)}
              placeholder="Enter official name"
              className="w-full px-5 py-4 rounded-2xl border border-black/10 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1A1A1A] uppercase tracking-widest px-1">
              Institute Logo
            </label>
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="logo-upload"
                className={`flex flex-col items-center justify-center w-full aspect-video rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                  logoUrl ? 'border-accent-green bg-accent-green/5' : 'border-black/10 hover:border-accent-pink/50 bg-black/[0.02] hover:bg-black/[0.04]'
                }`}
              >
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-accent-pink animate-spin" />
                ) : logoUrl ? (
                  <div className="relative w-full h-full p-4">
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-muted" />
                    <span className="text-sm font-bold text-muted">Upload PNG/JPG</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !instituteName}
            className="w-full py-5 bg-[#1A1A1A] text-white rounded-full font-black text-lg hover:bg-black transition-all active:scale-[0.98] shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 group"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                Register & Continue
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
