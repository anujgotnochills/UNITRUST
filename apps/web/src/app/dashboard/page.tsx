'use client';

import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { assetService } from '@/services/assetService';
import { certificateService } from '@/services/certificateService';

export default function DashboardPage() {
  const { address } = useAccount();

  const { data: assetsData } = useQuery({
    queryKey: ['assets', address],
    queryFn: () => assetService.getAssetsByOwner(address as string),
    enabled: !!address,
  });

  const { data: certsData } = useQuery({
    queryKey: ['certificates', address],
    queryFn: () => certificateService.getCertificatesByHolder(address as string),
    enabled: !!address,
  });

  const { data: requestsData } = useQuery({
    queryKey: ['requests', address],
    queryFn: () => certificateService.getRequestsByUser(address as string),
    enabled: !!address,
  });

  const totalAssets = assetsData?.assets?.length || 0;
  const activeCerts = certsData?.certificates?.length || 0;
  const pendingRequests = requestsData?.requests?.filter((r: any) => r.status === 'pending').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-black text-foreground tracking-tight text-gradient-off">Overview</h2>
          <p className="text-muted mt-2 font-medium">Welcome to your UniTrust portal.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Assets', value: totalAssets },
          { label: 'Active Certificates', value: activeCerts },
          { label: 'Pending Requests', value: pendingRequests },
        ].map((stat, i) => (
          <div key={i} className="bg-surface p-8 rounded-3xl border border-black/[0.05] shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xs font-bold text-muted uppercase tracking-widest">{stat.label}</h3>
            <p className="text-5xl font-display font-black text-foreground mt-3 tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
