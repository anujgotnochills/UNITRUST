'use client';

import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { certificateService } from '@/services/certificateService';

export default function MyRequestsPage() {
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
  
  const requests = Array.from(new Map(allRequests.map((r: any) => [r._id, r])).values());

  const getStatusColor = (status: string) => {
     switch(status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'accepted': return 'bg-blue-100 text-blue-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        case 'minted': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
     }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-display font-black text-[#1A1A1A] tracking-tight">My Requests</h2>
          <p className="text-muted mt-2 text-lg">Track all your outgoing certificate and verification requests.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-[32px] border border-black/[0.05] shadow-sm p-24 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-black/10 border-t-accent-pink animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-black/[0.05] shadow-sm p-32 text-center">
          <div className="max-w-xs mx-auto space-y-4">
            <p className="text-muted text-lg font-medium">No active requests found.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((req: any) => (
            <div key={req._id} className="bg-white rounded-[24px] border border-black/[0.05] shadow-sm p-6 flex flex-col gap-4">
               <div className="flex justify-between items-start">
                  <div>
                     <h3 className="text-lg font-black font-display tracking-tight">{req.certificateDetails?.title || 'Certificate'}</h3>
                     <p className="text-sm font-medium text-muted mt-1">To: {req.certificateDetails?.studentName}</p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${getStatusColor(req.status)}`}>
                     {req.status}
                  </div>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
