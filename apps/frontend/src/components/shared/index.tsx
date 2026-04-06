'use client';

import { useState } from 'react';
import React from 'react';


export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button className="copy-btn" onClick={handleCopy} title="Copy">
      {copied ? '✓' : '📋'}
    </button>
  );
}

export function WalletAddress({ address }: { address: string }) {
  if (!address) return null;
  const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;
  return (
    <span className="wallet-address">
      {truncated}
      <CopyButton text={address} />
    </span>
  );
}

export function TokenBadge({ tokenId }: { tokenId: number | string }) {
  return <span className="token-badge">#{tokenId}</span>;
}

export function CarbonBadge({ tag, score }: { tag: string; score?: number }) {
  const className = tag === 'Green' ? 'carbon-green' : tag === 'Neutral' ? 'carbon-neutral' : 'carbon-high';
  return (
    <span className={`carbon-badge ${className}`}>
      {tag === 'Green' ? '🌿' : tag === 'Neutral' ? '⚡' : '🔥'} {tag}
      {score !== undefined && ` · ${score} kg`}
    </span>
  );
}

export function TxHashLink({ hash, label }: { hash: string; label?: string }) {
  const polygonscanUrl = process.env.NEXT_PUBLIC_POLYGONSCAN_URL || 'https://amoy.polygonscan.com';
  const truncated = `${hash.slice(0, 10)}...${hash.slice(-6)}`;
  return (
    <a
      href={`${polygonscanUrl}/tx/${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="tx-link"
    >
      {label || truncated} ↗
    </a>
  );
}

export function VerifiedBadge() {
  return (
    <span className="verified-badge">
      ✓ Verified on Polygon
    </span>
  );
}

export function RequestStatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; label: string }> = {
    pending: { className: 'badge-warning', label: 'Pending' },
    accepted: { className: 'badge-success', label: 'Accepted' },
    rejected: { className: 'badge-error', label: 'Rejected' },
    minted: { className: 'badge-primary', label: 'Minted' },
  };
  const { className, label } = config[status] || config.pending;
  return <span className={`badge ${className}`}>{label}</span>;
}

export function LoadingState({ message }: { message?: string }) {
  return (
    <div className="loading-state">
      <div className="spinner" />
      <p className="loading-text">{message || 'Loading...'}</p>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {action}
    </div>
  );
}

export function StepIndicator({
  steps,
  current,
  message,
}: {
  steps: number;
  current: number;
  message: string;
}) {
  return (
    <div className="step-indicator">
      <div className="step-dots">
        {Array.from({ length: steps }).map((_, i) => (
          <div
            key={i}
            className={`step-dot ${i < current ? 'completed' : i === current ? 'active' : ''}`}
          />
        ))}
      </div>
      <p className="step-message">{message}</p>
      <div className="spinner" />
    </div>
  );
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  variant = 'primary',
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'primary' | 'danger';
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-body">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelLabel || 'Cancel'}
          </button>
          <button
            className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
