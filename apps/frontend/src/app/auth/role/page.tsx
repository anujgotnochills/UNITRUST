'use client';

import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRoleStore } from '@/store/roleStore';
import { ROUTES } from '@/lib/constants';

export default function RoleSelectPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { setRole } = useRoleStore();

  const handleSelect = (role: 'user' | 'institute') => {
    setRole(role);
    if (isConnected) {
      router.push(role === 'user' ? ROUTES.USER_SETUP : ROUTES.INSTITUTE_SETUP);
    }
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
        <div className="role-card" onClick={() => handleSelect('user')}>
          <div className="role-card-icon">👤</div>
          <h3 className="role-card-title">User</h3>
          <p className="role-card-desc">Register assets, receive certificates, manage ownership.</p>
        </div>
        <div className="role-card" onClick={() => handleSelect('institute')}>
          <div className="role-card-icon">🏫</div>
          <h3 className="role-card-title">Institute</h3>
          <p className="role-card-desc">Award certificates, mint soulbound NFTs, verify credentials.</p>
        </div>
      </div>
    </div>
  );
}
