'use client';

import Link from 'next/link';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRoleStore } from '@/store/roleStore';
import { ROUTES } from '@/lib/constants';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const roles = useRoleStore((state) => state.roles);
  const router = useRouter();

  const role = address ? roles[address] : null;

  // Watch for disconnect to redirect
  useEffect(() => {
    if (!isConnected) {
      router.push(ROUTES.HOME);
    }
  }, [isConnected, router]);

  const handleLogout = () => {
    disconnect();
    router.push(ROUTES.HOME);
  };

  const navLinks = role === 'user'
    ? [
        { href: ROUTES.USER_ASSETS, label: 'Assets' },
        { href: ROUTES.USER_CERTIFICATES, label: 'Certificates' },
      ]
    : role === 'institute'
    ? [
        { href: ROUTES.INSTITUTE_AWARD, label: 'Award' },
        { href: ROUTES.INSTITUTE_VERIFY, label: 'Verify' },
      ]
    : [];

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        Uni<span>Trust</span>
      </Link>

      {isConnected && role && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '0.4rem 0.875rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)',
                transition: 'all var(--transition)',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <div className="navbar-right">
        {role && (
          <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
            {role}
          </span>
        )}
        {isConnected && role && (
          <button
            onClick={handleLogout}
            className="btn btn-sm btn-secondary"
            style={{ fontSize: '0.75rem', borderColor: 'var(--error)', color: 'var(--error)', background: 'rgba(239, 68, 68, 0.05)' }}
          >
            Logout
          </button>
        )}
        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus={{
            smallScreen: 'avatar',
            largeScreen: 'address',
          }}
        />
      </div>
    </nav>
  );
}
