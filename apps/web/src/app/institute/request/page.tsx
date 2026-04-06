'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useRoleStore } from '@/store/roleStore';
import { useProfileStore } from '@/store/profileStore';
import { profileService } from '@/services/profileService';
import { certificateService } from '@/services/certificateService';
import { CERTIFICATE_TYPES, SUSTAINABILITY_TAGS, QR_PREFIX_ASSET, QR_PREFIX_CERT, IPFS_GATEWAY } from '@/lib/constants';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Building2, Send, Clock, CheckCircle2, XCircle, Award,
  LogOut, ArrowLeft, Wallet, FilePlus, Files, Loader2, ShieldCheck, Upload
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  minted: 'bg-green-100 text-green-800',
};

export default function InstituteRequestPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const queryClient = useQueryClient();
  const { getRoleForWallet, clearRole } = useRoleStore();
  const role = address ? getRoleForWallet(address) : null;
  const { instituteProfile, setInstituteProfile, clearProfiles } = useProfileStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'history' | 'verify'>('new');
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);

  const [formData, setFormData] = useState({
    userWallet: '',
    studentName: '',
    title: '',
    course: '',
    description: '',
    issueDate: '',
    certificateType: CERTIFICATE_TYPES[0],
    carbonScore: 0,
    sustainabilityTag: SUSTAINABILITY_TAGS[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issueBusy, setIssueBusy] = useState<string | null>(null);

  // ── Verify tab state ──
  const [verifyTokenId, setVerifyTokenId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [uploadingQr, setUploadingQr] = useState(false);
  const qrFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isConnected) {
      router.push('/connect');
    } else if (role !== 'institute') {
      router.push('/connect/role');
    } else if (!instituteProfile) {
      const fetchProfile = async () => {
        setIsFetchingProfile(true);
        try {
          const res = await profileService.getInstituteProfile(address!);
          if (res.profile) {
            setInstituteProfile(res.profile);
          } else {
            router.push('/institute/register');
          }
        } catch (err: any) {
          if (err.response?.status === 404) {
            router.push('/institute/register');
          }
        } finally {
          setIsFetchingProfile(false);
        }
      };
      fetchProfile();
    }
  }, [isConnected, role, mounted, address, instituteProfile, router, setInstituteProfile]);

  // Fetch institute's requests
  const { data: reqsData, isLoading: reqsLoading } = useQuery({
    queryKey: ['requests-institute', address],
    queryFn: () => certificateService.getRequestsByInstitute(address as string),
    enabled: !!address && !!instituteProfile,
  });

  const requests = reqsData?.requests || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return toast.error('Please connect your wallet');

    setIsSubmitting(true);
    try {
      toast.loading('Sending certificate request...', { id: 'inst-req' });

      await certificateService.createRequest({
        instituteWallet: address,
        userWallet: formData.userWallet,
        certificateDetails: {
          studentName: formData.studentName,
          title: formData.title,
          course: formData.course,
          description: formData.description,
          issueDate: formData.issueDate,
          certificateType: formData.certificateType,
          carbonScore: formData.carbonScore,
          sustainabilityTag: formData.sustainabilityTag,
        },
      });

      toast.success('Certificate request submitted! Waiting for admin approval.', { id: 'inst-req' });
      setFormData({
        userWallet: '',
        studentName: '',
        title: '',
        course: '',
        description: '',
        issueDate: '',
        certificateType: CERTIFICATE_TYPES[0],
        carbonScore: 0,
        sustainabilityTag: SUSTAINABILITY_TAGS[0],
      });
      setActiveTab('history');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || 'Request failed', { id: 'inst-req' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisconnect = () => {
    // Do NOT clear role — same wallet reconnects as institute automatically
    disconnect();
    router.push('/');
  };

  // ── Issue Certificate NFT (from My Requests tab) ──
  const handleIssueCertificate = async (req: any) => {
    if (!req.metadataURI) {
      return toast.error('Metadata URI not ready. Student must accept first.');
    }
    setIssueBusy(req._id);
    try {
      toast.loading('Minting certificate...', { id: 'issue' });
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/certificates/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: req._id,
          studentWallet: req.userWallet,
          metadataUri: req.metadataURI,
          issuerWallet: req.instituteWallet,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Issue failed');
      toast.success(`Certificate issued! Token #${data.tokenId}`, { id: 'issue' });
      // Refresh requests list
      queryClient.invalidateQueries({ queryKey: ['requests-institute', address] });
    } catch (err: any) {
      toast.error(err?.message || 'Minting failed', { id: 'issue' });
    } finally {
      setIssueBusy(null);
    }
  };

  // ── Resolve IPFS URIs ──
  function resolveIpfs(uri: string): string {
    if (!uri) return '';
    return uri.startsWith('ipfs://') ? IPFS_GATEWAY + uri.replace('ipfs://', '') : uri;
  }

  async function fetchMetadata(uri: string): Promise<any> {
    try {
      const res = await fetch(resolveIpfs(uri));
      if (!res.ok) return null;
      return res.json();
    } catch { return null; }
  }

  // ── QR File Upload ──
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQr(true);
    try {
      const html5Qrcode = new Html5Qrcode('inst-qr-temp-canvas');
      const decodedText = await html5Qrcode.scanFile(file, true);

      let tokenIdStr = decodedText;
      if (decodedText.startsWith(QR_PREFIX_CERT)) tokenIdStr = decodedText.replace(QR_PREFIX_CERT, '');
      if (decodedText.startsWith(QR_PREFIX_ASSET)) tokenIdStr = decodedText.replace(QR_PREFIX_ASSET, '');
      const extracted = tokenIdStr.match(/\d+/)?.[0];
      if (extracted) {
        setVerifyTokenId(extracted);
        toast.success(`Token ID #${extracted} extracted from QR`);
        await runCertVerify(extracted);
      } else {
        toast.error('Could not extract a Token ID from this QR code');
      }
    } catch {
      toast.error('Could not read QR code from image. Please try a clearer image.');
    } finally {
      setUploadingQr(false);
      if (qrFileRef.current) qrFileRef.current.value = '';
    }
  };

  // ── Certificate verification ──
  const runCertVerify = async (tokenIdStr: string) => {
    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const res = await certificateService.getCertificateByTokenId(Number(tokenIdStr));
      const cert = res?.certificate || res;
      if (cert && (cert.holderWallet || cert.issuerWallet)) {
        const metadata = await fetchMetadata(cert.metadataURI);
        setVerifyResult({ ...cert, metadata });
        toast.success('Certificate verified!');
      } else {
        toast.error('Certificate not found for this Token ID.');
      }
    } catch {
      toast.error('Certificate not found for this Token ID.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCertVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyTokenId) return;
    await runCertVerify(verifyTokenId);
  };

  if (!mounted || !isConnected) return null;

  return (
    <div className="min-h-screen bg-background dot-grid-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-border/10 bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <span className="text-background font-bold text-sm font-display">U</span>
            </div>
            <span className="text-xl font-display font-black tracking-tight text-foreground">
              UniTrust
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 border border-black/10">
              {instituteProfile?.logo ? (
                <img src={instituteProfile.logo} alt="Logo" className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <Building2 className="w-3.5 h-3.5 text-black" />
              )}
              <span className="text-xs font-bold text-black uppercase tracking-wide">
                {instituteProfile?.instituteName || 'Institute'}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border/10 shadow-sm text-foreground">
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-mono font-medium">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        <div className="space-y-8">
          {/* Title */}
          <div>
            <h1 className="text-4xl font-display font-black text-foreground tracking-tight">
              Institute Portal
            </h1>
            <p className="text-muted mt-2 text-lg">
              Submit certificate issuance requests for your students.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-2 bg-surface rounded-xl p-1 border border-black/[0.06] w-fit mx-auto">
            <button
              onClick={() => setActiveTab('new')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'new'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <FilePlus className="w-4 h-4" />
              New Request
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <Files className="w-4 h-4" />
              My Requests
              {requests.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-accent-pink/20 text-accent-pink text-xs font-bold">
                  {requests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('verify'); setVerifyResult(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'verify'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Verify
            </button>
          </div>

          {/* New Request Form */}
          {activeTab === 'new' && (
            <div className="bg-surface rounded-[32px] border border-black/[0.1] shadow-xl p-10 max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-foreground uppercase tracking-widest px-1">Student Wallet Address</label>
                  <input
                    required
                    value={formData.userWallet}
                    onChange={(e) => setFormData({ ...formData, userWallet: e.target.value })}
                    type="text"
                    className="w-full px-6 py-4 rounded-2xl border border-white/20 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-mono"
                    placeholder="0x..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-foreground uppercase tracking-widest px-1">Student / Recipient Name</label>
                  <input
                    required
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    type="text"
                    className="w-full px-6 py-4 rounded-2xl border border-white/20 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-medium"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-foreground uppercase tracking-widest px-1">Certificate Title</label>
                    <input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      type="text"
                      className="w-full px-6 py-4 rounded-2xl border border-white/20 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-medium"
                      placeholder="e.g. B.S. Computer Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-foreground uppercase tracking-widest px-1">Course / Major</label>
                    <input
                      required
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      type="text"
                      className="w-full px-6 py-4 rounded-2xl border border-white/20 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-medium"
                      placeholder="Computer Science"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-foreground uppercase tracking-widest px-1">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-6 py-4 rounded-2xl border border-white/20 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-medium resize-none"
                    placeholder="Brief description of the certificate being awarded..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-foreground uppercase tracking-widest px-1">Issue Date</label>
                    <input
                      required
                      value={formData.issueDate}
                      onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                      type="date"
                      className="w-full px-6 py-4 rounded-2xl border border-white/20 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-foreground uppercase tracking-widest px-1">Certificate Type</label>
                    <select
                      value={formData.certificateType}
                      onChange={(e) => setFormData({ ...formData, certificateType: e.target.value as any })}
                      className="w-full px-6 py-4 rounded-2xl border border-white/20 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-medium"
                    >
                      {CERTIFICATE_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !address}
                  className="w-full py-5 bg-foreground text-background rounded-full font-black text-lg hover:bg-black transition-transform active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Certificate Request
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Request History */}
          {activeTab === 'history' && (
            <div>
              {reqsLoading ? (
                <div className="bg-surface rounded-[32px] border border-black/[0.05] shadow-sm p-24 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-4 border-white/20 border-t-accent-pink animate-spin" />
                </div>
              ) : requests.length === 0 ? (
                <div className="bg-surface rounded-[32px] border border-black/[0.05] shadow-sm p-32 text-center">
                  <div className="max-w-xs mx-auto space-y-4">
                    <p className="text-5xl">📭</p>
                    <p className="text-muted text-lg font-medium">No requests submitted yet.</p>
                    <button
                      onClick={() => setActiveTab('new')}
                      className="text-accent-pink font-bold hover:underline"
                    >
                      Create your first request →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {requests.map((req: any) => (
                    <div key={req._id} className="bg-surface rounded-[24px] border border-black/[0.05] shadow-sm p-6 flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-black font-display tracking-tight">{req.certificateDetails?.title || 'Certificate'}</h3>
                          <p className="text-sm font-medium text-muted mt-1">To: {req.certificateDetails?.studentName}</p>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-800'}`}>
                          {req.status}
                        </div>
                      </div>
                      <div className="flex-1 text-sm bg-black/5 p-4 rounded-xl space-y-2">
                        {[
                          ['Type', req.certificateDetails?.certificateType],
                          ['Course', req.certificateDetails?.course],
                          ['Date', req.certificateDetails?.issueDate],
                          ['Student', req.userWallet ? `${req.userWallet.slice(0, 8)}...${req.userWallet.slice(-6)}` : '—'],
                        ].map(([label, val]) => (
                          <div className="flex justify-between" key={label}>
                            <span className="text-muted font-bold">{label}</span>
                            <span className="font-medium text-right">{val || '—'}</span>
                          </div>
                        ))}
                      </div>
                      {req.status === 'minted' && (
                        <div className="flex items-center justify-between gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-bold text-green-700">Certificate Minted ✓</span>
                          </div>
                          {req.tokenId && (
                            <span className="font-mono text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-bold">Token #{req.tokenId}</span>
                          )}
                        </div>
                      )}
                      {req.status === 'accepted' && (
                        <button
                          disabled={issueBusy === req._id}
                          onClick={() => handleIssueCertificate(req)}
                          className="w-full flex items-center justify-center gap-2 py-4 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                          style={{ background: 'linear-gradient(135deg, #FF8DA1, #e05c7a)' }}
                        >
                          {issueBusy === req._id ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Issuing...</>
                          ) : (
                            <><Award className="w-4 h-4" /> Issue Certificate NFT</>
                          )}
                        </button>
                      )}
                      {req.status === 'pending' && (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                          <Clock className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm font-bold text-yellow-700">Waiting for student approval</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Verify Certificate Tab */}
          {activeTab === 'verify' && (
            <div className="max-w-2xl mx-auto space-y-8">
              {/* Hidden element required by html5-qrcode for file scanning */}
              <div id="inst-qr-temp-canvas" style={{ display: 'none' }} />

              <div className="bg-surface rounded-[32px] border border-black/[0.1] shadow-xl p-10">
                <form onSubmit={handleCertVerify} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-foreground uppercase tracking-widest px-1">Certificate Token ID</label>
                    <input
                      value={verifyTokenId}
                      onChange={e => setVerifyTokenId(e.target.value)}
                      type="text"
                      className="w-full px-6 py-4 rounded-2xl border border-white/20 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-mono"
                      placeholder="e.g. 42910"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isVerifying || !verifyTokenId}
                    className="w-full py-5 bg-foreground text-background rounded-full font-black text-lg hover:bg-black transition-transform active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isVerifying ? (
                      <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
                    ) : (
                      <><ShieldCheck className="w-5 h-5" /> Verify Certificate</>
                    )}
                  </button>
                </form>

                {/* QR Upload */}
                <div className="mt-8">
                  <div className="flex items-center gap-4 w-full px-2 mb-4">
                    <div className="h-px bg-black/10 flex-1"></div>
                    <span className="text-xs font-bold text-muted uppercase tracking-widest">OR</span>
                    <div className="h-px bg-black/10 flex-1"></div>
                  </div>
                  <input
                    ref={qrFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleQrUpload}
                    className="hidden"
                    id="inst-qr-file-input"
                  />
                  <button
                    type="button"
                    onClick={() => qrFileRef.current?.click()}
                    disabled={uploadingQr}
                    className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-white/20 text-foreground rounded-2xl font-bold text-lg hover:border-black/30 hover:bg-black/[0.02] transition-all font-display disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingQr ? (
                      <><div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" /> Reading QR...</>
                    ) : (
                      <><Upload className="w-5 h-5" /> Upload QR Image</>
                    )}
                  </button>
                </div>
              </div>

              {/* Verify Result */}
              {verifyResult && (
                <div className="bg-surface rounded-[32px] border border-green-500/20 shadow-xl p-8 space-y-6">
                  <div className="flex justify-between items-start border-b border-white/10 pb-6">
                    <div>
                      <h3 className="text-2xl font-black font-display tracking-tight text-green-600">Certificate Verified ✓</h3>
                      <p className="text-muted font-medium mt-1">Token #{verifyResult.tokenId}</p>
                    </div>
                    <div className="px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-green-100 text-green-700">
                      Soulbound Certificate
                    </div>
                  </div>

                  {verifyResult.metadata && (
                    <div className="flex bg-background rounded-2xl overflow-hidden border border-white/10">
                      {verifyResult.metadata.image && (
                        <div className="w-1/3 min-h-[120px] bg-black/5 shrink-0">
                          <img src={resolveIpfs(verifyResult.metadata.image)} alt="Certificate" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-6 flex flex-col justify-center">
                        <h4 className="text-xl font-black font-display text-foreground">
                          {verifyResult.metadata.name || `Certificate #${verifyResult.tokenId}`}
                        </h4>
                        {verifyResult.metadata.description && (
                          <p className="mt-2 text-sm text-muted line-clamp-3">{verifyResult.metadata.description}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-bold text-muted uppercase tracking-widest">Holder Wallet</span>
                      <p className="font-mono text-sm mt-1 bg-black/5 p-3 rounded-xl break-all">{verifyResult.holderWallet}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-muted uppercase tracking-widest">Issuer Wallet</span>
                      <p className="font-mono text-sm mt-1 bg-black/5 p-3 rounded-xl break-all">{verifyResult.issuerWallet}</p>
                    </div>
                    {verifyResult.metadataURI && (
                      <div>
                        <span className="text-xs font-bold text-muted uppercase tracking-widest">IPFS Metadata</span>
                        <a href={resolveIpfs(verifyResult.metadataURI)} target="_blank" rel="noreferrer" className="font-mono text-sm mt-1 text-accent-pink bg-accent-pink/5 hover:bg-accent-pink/10 transition-colors p-3 rounded-xl break-all block">
                          {verifyResult.metadataURI}
                        </a>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => { setVerifyResult(null); setVerifyTokenId(''); }}
                    className="w-full py-4 border-2 border-black/10 text-foreground rounded-xl font-bold hover:border-black/30 transition-all"
                  >
                    Verify Another
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
