'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { certificateService } from '@/services/certificateService';
import { profileService } from '@/services/profileService';
import { IPFS_GATEWAY } from '@/lib/constants';
import {
  TokenBadge, CarbonBadge, VerifiedBadge, RequestStatusBadge,
  WalletAddress, LoadingState, EmptyState, TxHashLink,
} from '@/components/shared';
import toast from 'react-hot-toast';

export default function UserCertificatesPage() {
  const { address } = useAccount();
  const [tab, setTab] = useState<'pending' | 'certificates'>('pending');
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [hiddenIds, setHiddenIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [instituteProfiles, setInstituteProfiles] = useState<Record<string, any>>({});

  const fetchData = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const [reqRes, certRes, hiddenRes] = await Promise.all([
        certificateService.getRequestsByUser(address),
        certificateService.getCertificatesByHolder(address),
        certificateService.getHiddenCertificates(address),
      ]);

      const allReqs = reqRes.requests || [];
      const pending = allReqs.filter((r: any) => ['pending', 'accepted'].includes(r.status));
      setAllRequests(allReqs);
      setPendingRequests(pending);
      setCertificates(certRes.certificates || []);
      setHiddenIds(hiddenRes.hiddenTokenIds || []);

      // Fetch institute profiles
      const wallets = new Set<string>();
      allReqs.forEach((r: any) => r.instituteWallet && wallets.add(r.instituteWallet));
      (certRes.certificates || []).forEach((c: any) => c.issuerWallet && wallets.add(c.issuerWallet));

      const profiles: Record<string, any> = {};
      for (const w of wallets) {
        try {
          const p = await profileService.getInstituteProfile(w);
          profiles[w.toLowerCase()] = p.profile;
        } catch {}
      }
      setInstituteProfiles(profiles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);



  const handleAccept = async (requestId: string) => {
    try {
      await certificateService.acceptRequest(requestId);
      toast.success('Certificate request accepted!');
      fetchData();
    } catch {
      toast.error('Failed to accept request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await certificateService.rejectRequest(requestId);
      toast.success('Certificate request rejected');
      fetchData();
    } catch {
      toast.error('Failed to reject request');
    }
  };

  const handleHide = async (tokenId: number) => {
    if (!address) return;
    try {
      await certificateService.hideCertificate(address, tokenId);
      setHiddenIds([...hiddenIds, tokenId]);
      toast.success('Certificate hidden');
    } catch {
      toast.error('Failed to hide certificate');
    }
  };

  const visibleCerts = certificates.filter((c) => !hiddenIds.includes(c.tokenId));

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">My Certificates</h1>
        <p className="page-subtitle">View pending requests and your soulbound certificate NFTs</p>
      </div>

      <div className="tab-bar">
        <button className={`tab-item ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
          📩 Pending Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
        </button>
        <button className={`tab-item ${tab === 'certificates' ? 'active' : ''}`} onClick={() => setTab('certificates')}>
          🎓 My Certificates
        </button>
      </div>

      {loading ? (
        <LoadingState message="Loading certificates..." />
      ) : tab === 'pending' ? (
        pendingRequests.length === 0 ? (
          <EmptyState icon="📩" title="No pending requests" description="You'll see certificate requests from institutes here." />
        ) : (
          <div className="grid-auto">
            {pendingRequests.map((req) => {
              const inst = instituteProfiles[req.instituteWallet?.toLowerCase()];
              return (
                <div key={req._id} className="card pending-card">
                  <div className="cert-card-header">
                    <div className="cert-card-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', background: 'var(--bg-tertiary)' }}>
                      {inst?.logo ? <img src={inst.logo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '🏫'}
                    </div>
                    <div>
                      <div className="cert-card-institute">{inst?.instituteName || 'Institute'}</div>
                      <RequestStatusBadge status={req.status} />
                    </div>
                  </div>
                  <h3 className="cert-card-title">{req.certificateDetails?.title}</h3>
                  <div className="cert-card-details">
                    <span>👤 {req.certificateDetails?.studentName}</span>
                    <span>📚 {req.certificateDetails?.course}</span>
                    <span>📅 {req.certificateDetails?.issueDate}</span>
                    <span>🏷 {req.certificateDetails?.certificateType}</span>
                  </div>
                  <div className="cert-card-badges" style={{ marginBottom: '1rem' }}>
                    <CarbonBadge tag={req.certificateDetails?.sustainabilityTag || 'Green'} score={req.certificateDetails?.carbonScore} />
                  </div>
                  {req.certificateDetails?.pdfURI && (
                    <a href={`${IPFS_GATEWAY}${req.certificateDetails.pdfURI.replace('ipfs://', '')}`} target="_blank" rel="noopener" className="btn btn-sm btn-secondary" style={{ marginBottom: '1rem' }}>
                      📄 Download PDF
                    </a>
                  )}
                  {req.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button className="btn btn-success" style={{ flex: 1 }} onClick={() => handleAccept(req._id)}>
                        ✓ Accept
                      </button>
                      <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleReject(req._id)}>
                        ✕ Reject
                      </button>
                    </div>
                  ) : req.status === 'accepted' ? (
                    <div style={{ padding: '0.75rem', background: 'rgba(16,185,129,0.1)', border: '1px dashed rgba(16,185,129,0.4)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--success)', textAlign: 'center', fontWeight: 600 }}>
                      ✅ Request Accepted<br/><span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.8 }}>Waiting for institute to issue the NFT</span>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )
      ) : (
        visibleCerts.length === 0 ? (
          <EmptyState icon="🎓" title="No certificates yet" description="Accepted and minted certificates will appear here." />
        ) : (
          <div className="grid-auto">
            {visibleCerts.map((cert) => {
              const inst = instituteProfiles[cert.issuerWallet?.toLowerCase()];
              return (
                <div key={cert.tokenId} className="card card-elevated cert-card">
                  <button className="cert-card-hide" onClick={() => handleHide(cert.tokenId)} title="Hide certificate">
                    👁‍🗨
                  </button>
                  <div className="cert-card-header">
                    <div className="cert-card-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', background: 'var(--bg-tertiary)' }}>
                      {inst?.logo ? <img src={inst.logo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '🏫'}
                    </div>
                    <div className="cert-card-institute">{inst?.instituteName || 'Institute'}</div>
                  </div>
                  <h3 className="cert-card-title">Certificate #{cert.tokenId}</h3>
                  <div className="cert-card-details">
                    <span><strong>Holder:</strong> <WalletAddress address={cert.holderWallet} /></span>
                    <span><strong>Issuer:</strong> <WalletAddress address={cert.issuerWallet} /></span>
                  </div>
                  <div className="cert-card-footer">
                    <div className="cert-card-badges">
                      <TokenBadge tokenId={cert.tokenId} />
                      <CarbonBadge tag={cert.sustainabilityTag || 'Green'} score={cert.carbonScore} />
                    </div>
                    <VerifiedBadge />
                  </div>
                  {cert.txHash && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <TxHashLink hash={cert.txHash} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
