'use client';

import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRoleStore } from '@/store/roleStore';
import { ROUTES } from '@/lib/constants';
import { useState } from 'react';
import { profileService } from '@/services/profileService';
import toast from 'react-hot-toast';

export default function RoleSelectPage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { setRole } = useRoleStore();
  const [checking, setChecking] = useState(false);

  const handleSelect = async (role: 'user' | 'institute') => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    setChecking(true);
    try {
      if (role === 'user') {
        try {
          await profileService.getInstituteProfile(address);
          toast.error('This wallet is already registered as an Institute. Please use a different wallet to act as a User.');
          setChecking(false);
          return;
        } catch { /* all good */ }
      } else {
        try {
          await profileService.getUserProfile(address);
          toast.error('This wallet is already registered as a User. Please use a different wallet to act as an Institute.');
          setChecking(false);
          return;
        } catch { /* all good */ }
      }

      setRole(role);
      router.push(role === 'user' ? ROUTES.USER_SETUP : ROUTES.INSTITUTE_SETUP);
    } catch {
      toast.error('An error occurred while verifying the role');
    }
    setChecking(false);
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)' }}>
      <h1 className="page-title" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Choose Your Role</h1>
      <p className="page-subtitle" style={{ textAlign: 'center', marginBottom: '2rem' }}>Select how you want to use UniTrust</p>

      {!isConnected && (
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Connect wallet first</p>
          <ConnectButton />
        </div>
      )}

      <div className="role-cards">
        <div className="role-card" onClick={() => !checking && handleSelect('user')} style={{ opacity: checking ? 0.6 : 1, pointerEvents: checking ? 'none' : 'auto' }}>
          <div className="role-card-icon">👤</div>
          <h3 className="role-card-title">User</h3>
          <p className="role-card-desc">Register assets, receive certificates, manage ownership.</p>
        </div>
        <div className="role-card" onClick={() => !checking && handleSelect('institute')} style={{ opacity: checking ? 0.6 : 1, pointerEvents: checking ? 'none' : 'auto' }}>
          <div className="role-card-icon">🏫</div>
          <h3 className="role-card-title">Institute</h3>
          <p className="role-card-desc">Award certificates, mint soulbound NFTs, verify credentials.</p>
        </div>
      </div>
    </div>
  );
}
