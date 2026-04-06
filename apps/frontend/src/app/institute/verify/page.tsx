'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { certificateService } from '@/services/certificateService';
import { profileService } from '@/services/profileService';
import { QR_PREFIX_CERT, IPFS_GATEWAY } from '@/lib/constants';
import { QRScanner } from '@/components/shared/QRScanner';
import {
  TokenBadge, CarbonBadge, VerifiedBadge, WalletAddress, TxHashLink, LoadingState,
} from '@/components/shared';
import toast from 'react-hot-toast';

export default function InstituteVerifyPage() {
  const [manualTokenId, setManualTokenId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [institute, setInstitute] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (tokenId: string) => {
    setLoading(true);
    setResult(null);
    try {
      const cert = await certificateService.getCertificateByTokenId(Number(tokenId));
      setResult(cert);
      try {
        const inst = await profileService.getInstituteProfile(cert.issuerWallet);
        setInstitute(inst.profile);
      } catch { setInstitute(null); }
    } catch {
      toast.error('Certificate not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Verify Certificate</h1>
        <p className="page-subtitle">Scan a QR code or enter a Token ID to verify a certificate</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', maxWidth: '800px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>📷 QR Scanner</h3>
          <QRScanner prefix={QR_PREFIX_CERT} onScan={handleVerify} errorMessage="Invalid QR. Please scan a certificate QR code." />
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>🔢 Manual Entry</h3>
          <div className="form-group">
            <label className="form-label">Certificate Token ID</label>
            <input className="form-input" type="number" placeholder="e.g., 1" value={manualTokenId} onChange={(e) => setManualTokenId(e.target.value)} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => manualTokenId && handleVerify(manualTokenId)} disabled={!manualTokenId || loading}>
            {loading ? 'Verifying...' : '🔍 Verify Certificate'}
          </button>
        </div>
      </div>

      {loading && <LoadingState message="Verifying certificate..." />}

      {result && (
        <div className="card card-elevated" style={{ maxWidth: '600px', marginTop: '2rem' }}>
          <div className="cert-card-header">
            <div className="cert-card-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', background: 'var(--surface-2)' }}>
              {institute?.logo ? <img src={institute.logo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '🏫'}
            </div>
            <div>
              <div className="cert-card-institute">{institute?.instituteName || 'Institute'}</div>
              <VerifiedBadge />
            </div>
          </div>

          <h2 style={{ marginBottom: '1rem' }}>Certificate #{result.tokenId}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div><span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Issuer</span><br /><WalletAddress address={result.issuerWallet} /></div>
            <div><span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Holder</span><br /><WalletAddress address={result.holderWallet} /></div>
          </div>

          <div className="cert-card-badges" style={{ marginBottom: '1rem' }}>
            <TokenBadge tokenId={result.tokenId} />
            <CarbonBadge tag={result.sustainabilityTag || 'Green'} score={result.carbonScore} />
            <span className="badge badge-primary">🔒 Soulbound</span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1rem' }}>
            This certificate is non-transferable (soulbound to the holder wallet).
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {result.txHash && <TxHashLink hash={result.txHash} label="View on PolygonScan ↗" />}
            {result.metadataURI && (
              <a href={`${IPFS_GATEWAY}${result.metadataURI.replace('ipfs://', '')}`} target="_blank" rel="noopener" className="tx-link">
                IPFS Metadata ↗
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
