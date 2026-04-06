'use client';

import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRoleStore } from '@/store/roleStore';
import { ROUTES } from '@/lib/constants';
import { useEffect, useState } from 'react';
import { profileService } from '@/services/profileService';

export default function HomePage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const roles = useRoleStore((state) => state.roles);
  const setRoleStore = useRoleStore((state) => state.setRole);
  const role = address ? roles[address] : null;
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);

  useEffect(() => {
    if (isConnected && !role && address) {
      const checkProfile = async () => {
        setIsCheckingProfile(true);
        try {
          await profileService.getUserProfile(address);
          setRoleStore(address, 'user');
          return;
        } catch (e) {
          // Not a user
        }
        
        try {
          await profileService.getInstituteProfile(address);
          setRoleStore(address, 'institute');
          return;
        } catch (e) {
          // Not an institute neither
        }
        
        setIsCheckingProfile(false);
      };
      
      checkProfile();
    }
  }, [isConnected, role, address, setRoleStore]);

  useEffect(() => {
    if (isConnected && role === 'user') {
      router.push(ROUTES.USER_ASSETS);
    } else if (isConnected && role === 'institute') {
      router.push(ROUTES.INSTITUTE_AWARD);
    }
  }, [isConnected, role, router]);

  const handleRoleSelect = (selectedRole: 'user' | 'institute') => {
    if (address) {
      setRoleStore(address, selectedRole);
    }
    if (isConnected) {
      router.push(selectedRole === 'user' ? ROUTES.USER_SETUP : ROUTES.INSTITUTE_SETUP);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '640px', marginBottom: '3rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔗</div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.2 }}>
          Uni<span style={{ color: 'var(--primary)' }}>Trust</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.5rem' }}>
          Own it. Prove it. Track it.
        </p>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto' }}>
          Register physical assets as NFTs, receive soulbound certificates, and track carbon footprint — all on Polygon.
        </p>
      </div>

      {!isConnected ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Connect your wallet to get started
          </p>
          <ConnectButton />
        </div>
      ) : isCheckingProfile ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(0,0,0,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Resolving identity...</p>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : !role ? (
        <div style={{ width: '100%', maxWidth: '640px' }}>
          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
            Choose how you want to continue
          </p>
          <div className="role-cards">
            <div className="role-card" onClick={() => handleRoleSelect('user')}>
              <div className="role-card-icon">👤</div>
              <h3 className="role-card-title">Continue as User</h3>
              <p className="role-card-desc">
                Register assets, receive certificates, manage ownership, and track carbon impact.
              </p>
            </div>
            <div className="role-card" onClick={() => handleRoleSelect('institute')}>
              <div className="role-card-icon">🏫</div>
              <h3 className="role-card-title">Continue as Institute</h3>
              <p className="role-card-desc">
                Award certificates to students, mint soulbound NFTs, and verify credentials via QR.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { icon: '📦', label: 'Asset NFTs', desc: 'ERC-721 tokens for real-world assets' },
          { icon: '🎓', label: 'Soulbound Certs', desc: 'Non-transferable certificate NFTs' },
          { icon: '🌿', label: 'Carbon Tracking', desc: 'Sustainability data on every token' },
        ].map((f) => (
          <div key={f.label} style={{ textAlign: 'center', maxWidth: '160px' }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{f.icon}</div>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)' }}>{f.label}</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
