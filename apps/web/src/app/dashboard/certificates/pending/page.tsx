'use client';

import { useAccount } from 'wagmi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { certificateService } from '@/services/certificateService';
import { IPFS_GATEWAY } from '@/lib/constants';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { CheckCircle2, XCircle, Award, Clock } from 'lucide-react';

function resolveIpfs(uri: string): string {
  if (!uri) return '';
  return uri.startsWith('ipfs://') ? IPFS_GATEWAY + uri.replace('ipfs://', '') : uri;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  minted: 'bg-green-100 text-green-800',
};

export default function PendingRequestsPage() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);

  const { data: userReqsData, isLoading: userLoading } = useQuery({
    queryKey: ['requests-user', address],
    queryFn: () => certificateService.getRequestsByUser(address as string),
    enabled: !!address,
  });

  const { data: instReqsData, isLoading: instLoading } = useQuery({
    queryKey: ['requests-institute', address],
    queryFn: () => certificateService.getRequestsByInstitute(address as string),
    enabled: !!address,
  });

  const isLoading = userLoading || instLoading;

  const allRequests = [
    ...(userReqsData?.requests || []),
    ...(instReqsData?.requests || []),
  ];

  // Deduplicate and show all non-rejected, non-minted requests
  const activeRequests = Array.from(
    new Map(allRequests.map((r: any) => [r._id, r])).values()
  ).filter((r: any) => !['rejected', 'minted'].includes(r.status));

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['requests-user', address] });
    queryClient.invalidateQueries({ queryKey: ['requests-institute', address] });
    queryClient.invalidateQueries({ queryKey: ['certificates', address] });
  };

  // USER: Accept
  const handleAccept = async (requestId: string) => {
    setBusy(requestId + '-accept');
    try {
      toast.loading('Accepting request & building metadata…', { id: 'req-action' });
      await certificateService.acceptRequest(requestId);
      toast.success('Request accepted! Institute can now issue the NFT.', { id: 'req-action' });
      invalidate();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to accept request', { id: 'req-action' });
    } finally {
      setBusy(null);
    }
  };

  // USER: Reject
  const handleReject = async (requestId: string) => {
    setBusy(requestId + '-reject');
    try {
      toast.loading('Rejecting request…', { id: 'req-action' });
      await certificateService.rejectRequest(requestId);
      toast.success('Request rejected.', { id: 'req-action' });
      invalidate();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to reject request', { id: 'req-action' });
    } finally {
      setBusy(null);
    }
  };

  // INSTITUTE: Issue Certificate NFT via backend
  const handleIssueCertificate = async (req: any) => {
    if (!req.metadataURI) {
      return toast.error('Metadata URI not ready. Student must accept first.');
    }
    setBusy(req._id + '-issue');
    try {
      toast.loading('Minting certificate NFT on Polygon Amoy…', { id: 'issue' });
      // Call backend to mint (backend has ISSUER_ROLE)
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
      toast.success(`Certificate NFT minted! Token #${data.tokenId}`, { id: 'issue' });
      invalidate();
    } catch (err: any) {
      toast.error(err?.message || 'Minting failed', { id: 'issue' });
    } finally {
      setBusy(null);
    }
  };

  const addressLower = address?.toLowerCase() || '';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-display font-black text-[#1A1A1A] tracking-tight">Pending Requests</h2>
        <p className="text-muted mt-2 text-lg">Certificate issuance requests — accept, reject, or issue an NFT.</p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-[32px] border border-black/[0.05] shadow-sm p-24 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-black/10 border-t-accent-pink animate-spin" />
        </div>
      ) : activeRequests.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-black/[0.05] shadow-sm p-32 text-center">
          <div className="max-w-xs mx-auto space-y-4">
            <p className="text-4xl">📭</p>
            <p className="text-muted font-medium text-lg">No active requests to review.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeRequests.map((req: any) => {
            const isUserSide = req.userWallet?.toLowerCase() === addressLower;
            const isInstituteSide = req.instituteWallet?.toLowerCase() === addressLower;
            const isBusyAccept = busy === req._id + '-accept';
            const isBusyReject = busy === req._id + '-reject';
            const isBusyIssue = busy === req._id + '-issue';

            return (
              <div
                key={req._id}
                className={`bg-white rounded-[24px] border shadow-sm p-6 flex flex-col gap-4 ${
                  req.status === 'accepted' ? 'border-blue-200' : 'border-black/[0.05]'
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black font-display tracking-tight">
                      {req.certificateDetails?.title || 'Certificate'}
                    </h3>
                    <p className="text-sm font-medium text-muted mt-0.5">
                      To: {req.certificateDetails?.studentName}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-700'}`}>
                    {req.status}
                  </span>
                </div>

                {/* Details */}
                <div className="text-sm bg-black/5 p-4 rounded-xl space-y-2">
                  {[
                    ['Type', req.certificateDetails?.certificateType],
                    ['Course', req.certificateDetails?.course],
                    ['Date', req.certificateDetails?.issueDate],
                    ['Institute', req.instituteWallet ? `${req.instituteWallet.slice(0, 8)}...${req.instituteWallet.slice(-6)}` : '—'],
                    ['Student', req.userWallet ? `${req.userWallet.slice(0, 8)}...${req.userWallet.slice(-6)}` : '—'],
                  ].map(([label, val]) => (
                    <div className="flex justify-between" key={label}>
                      <span className="text-muted font-bold">{label}</span>
                      <span className="font-medium text-right">{val || '—'}</span>
                    </div>
                  ))}
                </div>

                {/* Actions based on role and status */}
                {req.status === 'pending' && isUserSide && (
                  <div className="flex gap-3">
                    <button
                      disabled={isBusyAccept || isBusyReject}
                      onClick={() => handleAccept(req._id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1A1A1A] text-white rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50"
                    >
                      {isBusyAccept ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Accept
                    </button>
                    <button
                      disabled={isBusyAccept || isBusyReject}
                      onClick={() => handleReject(req._id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 border-2 border-red-200 rounded-xl font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {isBusyReject ? <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" /> : <XCircle className="w-4 h-4" />}
                      Reject
                    </button>
                  </div>
                )}

                {req.status === 'accepted' && isUserSide && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                    <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-blue-800">Request Accepted</p>
                      <p className="text-xs text-blue-600 mt-0.5">Waiting for the institute to issue your certificate NFT.</p>
                    </div>
                  </div>
                )}

                {req.status === 'accepted' && isInstituteSide && (
                  <button
                    disabled={!!busy}
                    onClick={() => handleIssueCertificate(req)}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-accent-pink text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #FF8DA1, #e05c7a)' }}
                  >
                    {isBusyIssue ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Minting NFT…</>
                    ) : (
                      <><Award className="w-4 h-4" /> Issue Certificate NFT</>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
