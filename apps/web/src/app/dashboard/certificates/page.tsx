'use client';

import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { certificateService } from '@/services/certificateService';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { IPFS_GATEWAY, POLYGONSCAN_URL } from '@/lib/constants';

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

function getAttr(attrs: any[], key: string) {
  return attrs?.find((a: any) => a.trait_type === key)?.value ?? '—';
}

export default function MyCertificatesPage() {
  const { address } = useAccount();

  const { data, isLoading } = useQuery({
    queryKey: ['certificates', address],
    queryFn: () => certificateService.getCertificatesByHolder(address as string),
    enabled: !!address,
  });

  const certs = data?.certificates || [];
  const [metadataMap, setMetadataMap] = useState<Record<number, any>>({});

  useEffect(() => {
    certs.forEach(async (cert: any) => {
      if (metadataMap[cert.tokenId] !== undefined) return;
      const meta = await fetchMetadata(cert.metadataURI);
      if (meta) setMetadataMap((prev) => ({ ...prev, [cert.tokenId]: meta }));
    });
  }, [certs]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-display font-black text-[#1A1A1A] tracking-tight">My Certificates</h2>
          <p className="text-muted mt-2 text-lg">Your soulbound credentials, permanently on-chain.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-[32px] border border-black/[0.05] shadow-sm p-24 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-black/10 border-t-accent-pink animate-spin" />
        </div>
      ) : certs.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-black/[0.05] shadow-sm p-32 text-center">
          <div className="max-w-xs mx-auto space-y-4">
            <p className="text-5xl">🎓</p>
            <p className="text-muted text-lg font-medium">No certificates yet.</p>
            <Link href="/dashboard/requests/new" className="text-accent-pink font-bold hover:underline block">
              Request certification →
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certs.map((cert: any) => {
            const meta = metadataMap[cert.tokenId];
            const attrs = meta?.attributes || [];
            const instituteLogo = getAttr(attrs, 'Institute Logo');
            const instituteName = getAttr(attrs, 'Institute Name');
            const title = meta?.name || getAttr(attrs, 'Certificate Title') || `Certificate #${cert.tokenId}`;
            const course = getAttr(attrs, 'Course');
            const issueDate = getAttr(attrs, 'Issue Date');
            const certType = getAttr(attrs, 'Certificate Type');
            const carbonScore = getAttr(attrs, 'Carbon Score (kg CO2e)');
            const sustainTag = getAttr(attrs, 'Sustainability Tag');

            return (
              <div key={cert.tokenId} className="bg-white rounded-[24px] border border-black/[0.05] shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Header Band */}
                <div className="p-5 border-b border-black/5 flex items-center gap-4">
                  {instituteLogo && instituteLogo !== '—' ? (
                    <img src={instituteLogo} alt="Institute" className="w-12 h-12 rounded-full object-cover border border-black/10" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white font-black text-lg shrink-0">🏫</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-muted uppercase tracking-widest truncate">{instituteName}</p>
                    <h3 className="font-black text-base text-[#1A1A1A] leading-tight mt-0.5 truncate">{title}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 rounded-full shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Verified</span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      ['Soulbound Token', `#${cert.tokenId}`],
                      ['Type', certType],
                      ['Course', course],
                      ['Issued', issueDate],
                    ].map(([label, val]) => (
                      <div key={label} className="bg-black/[0.03] p-3 rounded-xl">
                        <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">{label}</p>
                        <p className="font-semibold text-[#1A1A1A] truncate">{val}</p>
                      </div>
                    ))}
                  </div>

                  {/* Carbon */}
                  {carbonScore !== '—' && (
                    <div className={`flex items-center justify-between p-3 rounded-xl text-sm ${
                      sustainTag === 'Green' ? 'bg-green-50 border border-green-200' :
                      sustainTag === 'Neutral' ? 'bg-amber-50 border border-amber-200' :
                      'bg-red-50 border border-red-200'
                    }`}>
                      <span className="font-bold text-muted">Carbon Score</span>
                      <span className="font-black">
                        {carbonScore} kg CO₂e
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                          sustainTag === 'Green' ? 'bg-green-200 text-green-800' :
                          sustainTag === 'Neutral' ? 'bg-amber-200 text-amber-800' :
                          'bg-red-200 text-red-800'
                        }`}>{sustainTag}</span>
                      </span>
                    </div>
                  )}

                  {/* Issuer */}
                  <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1.5">Issuer Wallet</p>
                    <p className="font-mono text-xs bg-black/5 p-2.5 rounded-xl break-all">{cert.issuerWallet}</p>
                  </div>

                  {/* IPFS Link */}
                  <a
                    href={resolveIpfs(cert.metadataURI)}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-xs text-accent-pink font-mono bg-accent-pink/5 hover:bg-accent-pink/10 transition-colors px-3 py-2 rounded-xl"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">View IPFS Manifest</span>
                  </a>

                  {/* Polygonscan */}
                  {cert.txHash && (
                    <a
                      href={`${POLYGONSCAN_URL}/tx/${cert.txHash}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-xs text-muted font-mono bg-black/5 hover:bg-black/10 transition-colors px-3 py-2 rounded-xl"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">View Transaction</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
