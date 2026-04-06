'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { certificateService } from '@/services/certificateService';
import { ipfsService } from '@/services/ipfsService';
import { CERTIFICATE_TYPES, SUSTAINABILITY_TAGS } from '@/lib/constants';
import { UploadDropzone } from '@/components/shared/UploadDropzone';
import {
  RequestStatusBadge, WalletAddress, LoadingState, EmptyState, TxHashLink,
} from '@/components/shared';
import toast from 'react-hot-toast';

export default function InstituteAwardPage() {
  const { address } = useAccount();
  const [tab, setTab] = useState<'form' | 'requests'>('form');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    studentWallet: '',
    studentName: '',
    title: '',
    course: '',
    issueDate: '',
    certificateType: 'Academic',
    carbonScore: 0,
    sustainabilityTag: 'Green',
    ecoDescription: '',
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchRequests = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await certificateService.getRequestsByInstitute(address);
      setRequests(res.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.studentWallet.trim()) errors.studentWallet = 'Student wallet is required';
    else if (!formData.studentWallet.startsWith('0x')) errors.studentWallet = 'Must start with 0x';
    else if (formData.studentWallet.length !== 42) errors.studentWallet = 'Invalid wallet address length';
    if (!formData.studentName.trim()) errors.studentName = 'Student name is required';
    if (!formData.title.trim()) errors.title = 'Certificate title is required';
    if (!formData.course.trim()) errors.course = 'Course name is required';
    if (!formData.issueDate) errors.issueDate = 'Issue date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !address) return;
    setSubmitting(true);
    try {
      let pdfURI = '';
      if (pdfFile) {
        const result = await ipfsService.uploadFile(pdfFile);
        pdfURI = result.ipfsUrl;
      }

      await certificateService.createRequest({
        instituteWallet: address,
        userWallet: formData.studentWallet,
        certificateDetails: {
          title: formData.title,
          studentName: formData.studentName,
          course: formData.course,
          issueDate: formData.issueDate,
          certificateType: formData.certificateType,
          carbonScore: formData.carbonScore,
          sustainabilityTag: formData.sustainabilityTag,
          ecoDescription: formData.ecoDescription,
          pdfURI,
        },
      });

      toast.success('Certificate request sent to student! ✅');
      setFormData({
        studentWallet: '', studentName: '', title: '', course: '',
        issueDate: '', certificateType: 'Academic',
        carbonScore: 0, sustainabilityTag: 'Green', ecoDescription: '',
      });
      setPdfFile(null);
      setFormErrors({});
      fetchRequests();
      setTab('requests');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  // Record certificate after student accepts — backend records the mint
  const handleRecordMint = async (request: any) => {
    try {
      // Build and upload metadata to IPFS
      const metadata = {
        name: request.certificateDetails?.title,
        description: `Certificate issued by ${request.instituteWallet} to ${request.certificateDetails?.studentName}`,
        attributes: [
          { trait_type: 'Student', value: request.certificateDetails?.studentName },
          { trait_type: 'Course', value: request.certificateDetails?.course },
          { trait_type: 'Issue Date', value: request.certificateDetails?.issueDate },
          { trait_type: 'Certificate Type', value: request.certificateDetails?.certificateType },
          { trait_type: 'Carbon Score', value: request.certificateDetails?.carbonScore || 0 },
          { trait_type: 'Sustainability Tag', value: request.certificateDetails?.sustainabilityTag || 'Green' },
          { trait_type: 'Issuer', value: request.instituteWallet },
          { trait_type: 'Holder', value: request.userWallet },
        ],
      };
      toast.loading('Uploading metadata to IPFS...', { id: 'mint' });
      const metaRes = await ipfsService.uploadMetadata(metadata);

      // Record the certificate  
      await certificateService.recordCertificate({
        tokenId: Date.now(),
        issuerWallet: request.instituteWallet,
        holderWallet: request.userWallet,
        metadataURI: metaRes.metadataUri,
        txHash: '',
        carbonScore: request.certificateDetails?.carbonScore || 0,
      });

      // Mark as minted
      await certificateService.markMinted(request._id, { tokenId: Date.now(), txHash: '' });

      toast.success('Certificate recorded! ✅', { id: 'mint' });
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to record certificate', { id: 'mint' });
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Award Certificate</h1>
        <p className="page-subtitle">Send certificate requests to students and track their status</p>
      </div>

      <div className="tab-bar">
        <button className={`tab-item ${tab === 'form' ? 'active' : ''}`} onClick={() => setTab('form')}>
          📝 New Request
        </button>
        <button className={`tab-item ${tab === 'requests' ? 'active' : ''}`} onClick={() => setTab('requests')}>
          📋 My Requests {requests.length > 0 && `(${requests.length})`}
        </button>
      </div>

      {/* === FORM TAB === */}
      {tab === 'form' && (
        <div style={{ maxWidth: '560px' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>Award Certificate Form</h3>

            <div className="form-group">
              <label className="form-label">Student Wallet Address *</label>
              <input
                className="form-input"
                placeholder="0x..."
                value={formData.studentWallet}
                onChange={(e) => setFormData({ ...formData, studentWallet: e.target.value })}
              />
              {formErrors.studentWallet && <p className="form-error">{formErrors.studentWallet}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Student Full Name *</label>
              <input
                className="form-input"
                placeholder="e.g., Dhruv Singh"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              />
              {formErrors.studentName && <p className="form-error">{formErrors.studentName}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Certificate Title *</label>
              <input
                className="form-input"
                placeholder="e.g., B.Tech Computer Science"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              {formErrors.title && <p className="form-error">{formErrors.title}</p>}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Course / Program *</label>
                <input
                  className="form-input"
                  placeholder="e.g., B.Tech CSE"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                />
                {formErrors.course && <p className="form-error">{formErrors.course}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Issue Date *</label>
                <input
                  className="form-input"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                />
                {formErrors.issueDate && <p className="form-error">{formErrors.issueDate}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Certificate Type</label>
              <select
                className="form-select"
                value={formData.certificateType}
                onChange={(e) => setFormData({ ...formData, certificateType: e.target.value })}
              >
                {CERTIFICATE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Certificate PDF (optional)</label>
              <UploadDropzone
                onFile={(f) => setPdfFile(f)}
                accept={{ 'application/pdf': ['.pdf'] }}
                label={pdfFile ? `✅ ${pdfFile.name}` : 'Upload certificate PDF'}
                hint="PDF only, max 10MB"
              />
            </div>

            <hr className="section-divider" />
            <h4 style={{ marginBottom: '1rem' }}>🌿 Carbon Tracking</h4>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Carbon Score (kg CO₂)</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.carbonScore}
                  onChange={(e) => setFormData({ ...formData, carbonScore: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Sustainability Tag</label>
                <select
                  className="form-select"
                  value={formData.sustainabilityTag}
                  onChange={(e) => setFormData({ ...formData, sustainabilityTag: e.target.value })}
                >
                  {SUSTAINABILITY_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? '⏳ Sending...' : '📤 Send Certificate Request'}
            </button>
          </div>
        </div>
      )}

      {/* === REQUESTS TAB === */}
      {tab === 'requests' && (
        <>
          {loading ? (
            <LoadingState message="Loading requests..." />
          ) : requests.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No requests yet"
              description="Send your first certificate request to a student."
              action={<button className="btn btn-primary" onClick={() => setTab('form')}>Send Request</button>}
            />
          ) : (
            <div className="grid-auto">
              {requests.map((req) => (
                <div key={req._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, flex: 1, marginRight: '0.5rem' }}>
                      {req.certificateDetails?.title}
                    </h4>
                    <RequestStatusBadge status={req.status} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    <span>👤 {req.certificateDetails?.studentName}</span>
                    <span>💼 <WalletAddress address={req.userWallet} /></span>
                    <span>📚 {req.certificateDetails?.course}</span>
                    <span>📅 {req.certificateDetails?.issueDate}</span>
                    <span>🏷 {req.certificateDetails?.certificateType}</span>
                  </div>

                  {req.status === 'accepted' && (
                    <button
                      className="btn btn-accent"
                      style={{ width: '100%', marginBottom: '0.5rem' }}
                      onClick={() => handleRecordMint(req)}
                    >
                      🎓 Issue Certificate NFT
                    </button>
                  )}

                  {req.status === 'pending' && (
                    <div style={{ padding: '0.75rem', background: 'var(--warning-bg)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--warning)' }}>
                      ⏳ Waiting for student to accept
                    </div>
                  )}

                  {req.status === 'rejected' && (
                    <div style={{ padding: '0.75rem', background: 'var(--error-bg)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--error)' }}>
                      ❌ Student rejected this request
                    </div>
                  )}

                  {req.status === 'minted' && (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="badge badge-success">✅ Certificate Issued</span>
                      {req.txHash && <TxHashLink hash={req.txHash} />}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
