'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { certificateService } from '@/services/certificateService';
import { BACKEND_URL } from '@/lib/constants';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  ShieldCheck, CheckCircle2, XCircle, Award, Clock,
  ArrowLeft, Wallet, RefreshCw, Filter
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  accepted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  minted: 'bg-green-500/10 text-green-400 border-green-500/20',
};

export default function AdminPage() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: reqsData, isLoading, refetch } = useQuery({
    queryKey: ['admin-all-requests'],
    queryFn: () => certificateService.getAllRequests(),
  });

  const allRequests = reqsData?.requests || [];
  const filteredRequests = statusFilter === 'all'
    ? allRequests
    : allRequests.filter((r: any) => r.status === statusFilter);

  const stats = {
    total: allRequests.length,
    pending: allRequests.filter((r: any) => r.status === 'pending').length,
    accepted: allRequests.filter((r: any) => r.status === 'accepted').length,
    minted: allRequests.filter((r: any) => r.status === 'minted').length,
    rejected: allRequests.filter((r: any) => r.status === 'rejected').length,
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-all-requests'] });
  };

  const handleAccept = async (requestId: string) => {
    setBusy(requestId + '-accept');
    try {
      toast.loading('Accepting request…', { id: 'admin-action' });
      await certificateService.acceptRequest(requestId);
      toast.success('Request accepted! Metadata built.', { id: 'admin-action' });
      invalidate();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed', { id: 'admin-action' });
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setBusy(requestId + '-reject');
    try {
      toast.loading('Rejecting request…', { id: 'admin-action' });
      await certificateService.rejectRequest(requestId);
      toast.success('Request rejected.', { id: 'admin-action' });
      invalidate();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed', { id: 'admin-action' });
    } finally {
      setBusy(null);
    }
  };

  const handleMint = async (req: any) => {
    if (!req.metadataURI) {
      return toast.error('Metadata URI not ready. Accept the request first.');
    }
    setBusy(req._id + '-mint');
    try {
      toast.loading('Minting certificate NFT on Polygon Amoy…', { id: 'admin-mint' });
      const res = await fetch(`${BACKEND_URL}/api/certificates/issue`, {
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
      toast.success(`Certificate NFT minted! Token #${data.tokenId}`, { id: 'admin-mint' });
      invalidate();
    } catch (err: any) {
      toast.error(err?.message || 'Minting failed', { id: 'admin-mint' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <span className="text-[#0A0A0A] font-bold text-sm font-display">U</span>
              </div>
              <span className="text-xl font-display font-black tracking-tight">
                Uni<span className="text-accent-pink">Trust</span>
              </span>
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
              <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs font-bold text-red-400 uppercase tracking-wide">Admin Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <Wallet className="w-4 h-4 text-white/50" />
              <span className="text-sm font-mono text-white/70">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-white' },
            { label: 'Pending', value: stats.pending, color: 'text-yellow-400' },
            { label: 'Accepted', value: stats.accepted, color: 'text-blue-400' },
            { label: 'Minted', value: stats.minted, color: 'text-green-400' },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{stat.label}</p>
              <p className={`text-3xl font-display font-black mt-2 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter + Title */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-black tracking-tight">Certificate Requests</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/40" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2 outline-none focus:border-accent-pink/40"
            >
              <option value="all" className="bg-[#1A1A1A]">All Statuses</option>
              <option value="pending" className="bg-[#1A1A1A]">Pending</option>
              <option value="accepted" className="bg-[#1A1A1A]">Accepted</option>
              <option value="minted" className="bg-[#1A1A1A]">Minted</option>
              <option value="rejected" className="bg-[#1A1A1A]">Rejected</option>
            </select>
          </div>
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-24 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-white/10 border-t-accent-pink animate-spin" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-24 text-center">
            <p className="text-white/40 text-lg font-medium">No requests found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRequests.map((req: any) => {
              const isBusyAccept = busy === req._id + '-accept';
              const isBusyReject = busy === req._id + '-reject';
              const isBusyMint = busy === req._id + '-mint';

              return (
                <div
                  key={req._id}
                  className="bg-white/[0.03] border border-white/10 rounded-[24px] p-6 flex flex-col gap-4 hover:bg-white/[0.05] transition-colors"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-black font-display tracking-tight">
                        {req.certificateDetails?.title || 'Certificate'}
                      </h3>
                      <p className="text-sm text-white/40 mt-0.5">
                        To: {req.certificateDetails?.studentName}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${STATUS_COLORS[req.status] || 'bg-white/5 text-white/40 border-white/10'}`}>
                      {req.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="text-sm bg-white/5 rounded-xl p-4 space-y-2">
                    {[
                      ['Type', req.certificateDetails?.certificateType],
                      ['Course', req.certificateDetails?.course],
                      ['Date', req.certificateDetails?.issueDate],
                      ['Institute', req.instituteWallet ? `${req.instituteWallet.slice(0, 8)}...${req.instituteWallet.slice(-6)}` : '—'],
                      ['Student', req.userWallet ? `${req.userWallet.slice(0, 8)}...${req.userWallet.slice(-6)}` : '—'],
                    ].map(([label, val]) => (
                      <div className="flex justify-between" key={label}>
                        <span className="text-white/30 font-bold">{label}</span>
                        <span className="text-white/70 font-medium">{val || '—'}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  {req.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        disabled={!!busy}
                        onClick={() => handleAccept(req._id)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl font-bold hover:bg-green-500/20 transition-colors disabled:opacity-50"
                      >
                        {isBusyAccept ? (
                          <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                      <button
                        disabled={!!busy}
                        onClick={() => handleReject(req._id)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        {isBusyReject ? (
                          <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        Reject
                      </button>
                    </div>
                  )}

                  {req.status === 'accepted' && (
                    <button
                      disabled={!!busy}
                      onClick={() => handleMint(req)}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white disabled:opacity-50 transition-all"
                      style={{ background: 'linear-gradient(135deg, #FF8DA1, #e05c7a)' }}
                    >
                      {isBusyMint ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Minting NFT…
                        </>
                      ) : (
                        <>
                          <Award className="w-4 h-4" />
                          Mint Certificate NFT
                        </>
                      )}
                    </button>
                  )}

                  {req.status === 'minted' && (
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                      <Award className="w-5 h-5 text-green-400" />
                      <span className="text-sm font-bold text-green-400">Certificate NFT Minted ✓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
