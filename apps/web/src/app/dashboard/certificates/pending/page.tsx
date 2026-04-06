'use client';

import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { certificateService } from '@/services/certificateService';

export default function PendingRequestsPage() {
  const { address } = useAccount();

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
    ...(instReqsData?.requests || [])
  ];
  
  // Deduplicate by _id and filter pending
  const pendingRequests = Array.from(new Map(allRequests.map((r: any) => [r._id, r])).values())
    .filter((r: any) => r.status === 'pending');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-display font-black text-[#1A1A1A] tracking-tight">Pending Requests</h2>
        <p className="text-muted mt-2 text-lg">Certificate issuance requests waiting for approval.</p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-[32px] border border-black/[0.05] shadow-sm p-24 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-black/10 border-t-accent-pink animate-spin" />
        </div>
      ) : pendingRequests.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-black/[0.05] shadow-sm p-32 text-center">
          <p className="text-muted font-medium">No pending requests to review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingRequests.map((req: any) => (
            <div key={req._id} className="bg-white rounded-[24px] border border-black/[0.05] shadow-sm p-6 flex flex-col gap-4">
               <div>
                  <h3 className="text-lg font-black font-display tracking-tight">{req.certificateDetails?.title || 'Certificate'}</h3>
                  <p className="text-sm font-medium text-muted mt-1">To: {req.certificateDetails?.studentName}</p>
               </div>
               
               <div className="flex-1 text-sm bg-black/5 p-4 rounded-xl space-y-2 mt-2">
                 <div className="flex justify-between">
                    <span className="text-muted font-bold">Type</span>
                    <span className="font-medium">{req.certificateDetails?.certificateType}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-muted font-bold">Course</span>
                    <span className="font-medium">{req.certificateDetails?.course}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-muted font-bold">Institute</span>
                    <span className="font-mono truncate w-1/2 text-right">{req.instituteWallet}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-muted font-bold">Student</span>
                    <span className="font-mono truncate w-1/2 text-right">{req.userWallet}</span>
                 </div>
               </div>
               
               <div className="mt-4 flex gap-3">
                  <span className="w-full text-center py-3 bg-yellow-100 text-yellow-800 rounded-xl font-bold uppercase tracking-widest text-xs">Waiting</span>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
