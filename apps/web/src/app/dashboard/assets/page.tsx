'use client';

import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { assetService } from '@/services/assetService';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export default function MyAssetsPage() {
  const { address } = useAccount();

  const { data, isLoading } = useQuery({
    queryKey: ['assets', address],
    queryFn: () => assetService.getAssetsByOwner(address as string),
    enabled: !!address,
  });

  const assets = data?.assets || [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-display font-black text-[#1A1A1A] tracking-tight">My Assets</h2>
          <p className="text-muted mt-2 text-lg">Manage all your tokenized physical and digital assets.</p>
        </div>
        <Link href="/dashboard/assets/register" className="flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white rounded-full font-bold hover:bg-black transition-transform active:scale-[0.98]">
          <PlusCircle className="w-5 h-5" />
          Register Asset
        </Link>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-[32px] border border-black/[0.05] shadow-sm p-24 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-black/10 border-t-accent-pink animate-spin" />
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-black/[0.05] shadow-sm p-24 text-center border-dashed">
          <div className="max-w-xs mx-auto space-y-4">
            <p className="text-muted text-lg font-medium">No assets found. Try registering a new asset to get started.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {assets.map((asset: any) => (
            <div key={asset.tokenId} className="bg-white rounded-[24px] border border-black/[0.05] shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="bg-black/5 px-3 py-1 rounded-full text-xs font-bold text-muted uppercase tracking-widest">
                  #{asset.tokenId}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                  asset.sustainabilityTag === 'Green' ? 'bg-accent-green/20 text-[#1A1A1A]' :
                  asset.sustainabilityTag === 'Neutral' ? 'bg-accent-blue/20 text-[#1A1A1A]' :
                  'bg-red-100 text-red-700'
                }`}>
                  {asset.sustainabilityTag}
                </div>
              </div>
              <div className="flex-1 space-y-2">
                 <p className="text-xs font-bold text-muted uppercase tracking-widest">IPFS Metadata</p>
                 <a href={asset.metadataURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')} target="_blank" rel="noreferrer" className="text-xs text-accent-pink break-all font-mono bg-accent-pink/5 hover:bg-accent-pink/10 transition-colors p-3 rounded-xl block">
                    {asset.metadataURI}
                 </a>
              </div>
              <div className="mt-4 pt-4 border-t border-black/5 flex justify-between items-center">
                 <div className="flex flex-col">
                    <span className="text-xs font-bold text-muted uppercase tracking-widest">Carbon Impact</span>
                    <span className="text-2xl font-black font-display">{asset.carbonScore} <span className="text-sm font-medium text-muted">kg CO₂e</span></span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
