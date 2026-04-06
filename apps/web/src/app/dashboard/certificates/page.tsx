'use client';

import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { certificateService } from '@/services/certificateService';
import Link from 'next/link';

export default function MyCertificatesPage() {
  const { address } = useAccount();

  const { data, isLoading } = useQuery({
    queryKey: ['certificates', address],
    queryFn: () => certificateService.getCertificatesByHolder(address as string),
    enabled: !!address,
  });

  const certs = data?.certificates || [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-display font-black text-[#1A1A1A] tracking-tight">Certificates</h2>
          <p className="text-muted mt-2 text-lg">Manage your soulbound credentials and verified trust seals.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-[32px] border border-black/[0.05] shadow-sm p-24 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-black/10 border-t-accent-pink animate-spin" />
        </div>
      ) : certs.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-black/[0.05] shadow-sm p-32 text-center">
          <div className="max-w-xs mx-auto space-y-4">
            <p className="text-muted text-lg font-medium">You don't have any verified certificates yet.</p>
            <Link href="/dashboard/requests/new" className="text-accent-pink font-bold hover:underline block">Request certification →</Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certs.map((cert: any) => (
            <div key={cert.tokenId} className="bg-white rounded-[24px] border border-black/[0.05] shadow-sm p-6 flex flex-col gap-4">
               <div className="flex justify-between items-start">
                  <div className="bg-[#1A1A1A] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                     Soulbound Token #{cert.tokenId}
                  </div>
               </div>
               <div className="flex-1 space-y-2 mt-4">
                  <span className="text-xs font-bold text-muted uppercase tracking-widest">Issuer Profile</span>
                  <p className="font-mono text-xs bg-gray-50 p-2 rounded-lg break-all">{cert.issuerWallet}</p>
                  
                  <span className="text-xs font-bold text-muted uppercase tracking-widest block mt-4">Manifest URI</span>
                  <a href={cert.metadataURI?.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')} target="_blank" rel="noreferrer" className="text-xs text-accent-pink bg-accent-pink/5 hover:bg-accent-pink/10 transition-colors p-3 rounded-xl break-all font-mono block">
                     {cert.metadataURI}
                  </a>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
