'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useRoleStore } from '@/store/roleStore';
import { useProfileStore } from '@/store/profileStore';
import { profileService } from '@/services/profileService';
import { certificateService } from '@/services/certificateService';
import { CERTIFICATE_TYPES, SUSTAINABILITY_TAGS } from '@/lib/constants';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Building2, Send, Clock, CheckCircle2, XCircle, Award,
  LogOut, ArrowLeft, Wallet, FilePlus, Files, Loader2
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
  const { getRoleForWallet, clearRole } = useRoleStore();
  const role = address ? getRoleForWallet(address) : null;
  const { instituteProfile, setInstituteProfile, clearProfiles } = useProfileStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);

  const [formData, setFormData] = useState({
    userWallet: '',
    studentName: '',
    title: '',
    course: '',
    issueDate: '',
    certificateType: CERTIFICATE_TYPES[0],
    carbonScore: 0,
    sustainabilityTag: SUSTAINABILITY_TAGS[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
                          <Award className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-bold text-green-700">Certificate NFT Minted ✓</span>
                        </div>
                      )}
                      {req.status === 'pending' && (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                          <Clock className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm font-bold text-yellow-700">Awaiting admin approval</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
