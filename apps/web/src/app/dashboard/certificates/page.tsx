'use client';

import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { certificateService } from '@/services/certificateService';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ExternalLink, ShieldCheck, Award, Clock, Sparkles, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { IPFS_GATEWAY, POLYGONSCAN_URL, QR_PREFIX_CERT } from '@/lib/constants';

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

// ─── Status badge config ──────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  accepted: {
    label: 'Approved • Minting Soon',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    icon: Clock,
  },
  minted: {
    label: 'NFT Minted',
    bg: 'bg-green-100',
    text: 'text-green-700',
    icon: Award,
  },
};

export default function MyCertificatesPage() {
  const { address } = useAccount();

  // ── On-chain CertificateRecord NFTs ──────────────────────────────
  const { data: certData, isLoading: certLoading } = useQuery({
    queryKey: ['certificates', address],
    queryFn: () => certificateService.getCertificatesByHolder(address as string),
    enabled: !!address,
  });

  // ── All certificate requests by this user ─────────────────────────
  const { data: reqData, isLoading: reqLoading } = useQuery({
    queryKey: ['requests-user', address],
    queryFn: () => certificateService.getRequestsByUser(address as string),
    enabled: !!address,
    refetchInterval: 15000, // auto-refresh every 15s
  });

  const isLoading = certLoading || reqLoading;

  const nftCerts: any[] = certData?.certificates || [];
  const allRequests: any[] = reqData?.requests || [];

  // Show accepted + minted requests as certificate cards
  const requestCerts = allRequests.filter(
    (r: any) => r.status === 'accepted' || r.status === 'minted'
  );

  // IDs already covered by on-chain record (to avoid duplicates)
  const mintedTokenIds = new Set(nftCerts.map((c: any) => String(c.tokenId)));

  const [metadataMap, setMetadataMap] = useState<Record<string, any>>({});

  useEffect(() => {
    nftCerts.forEach(async (cert: any) => {
      const key = `nft-${cert.tokenId}`;
      if (metadataMap[key] !== undefined) return;
      const meta = await fetchMetadata(cert.metadataURI);
      if (meta) setMetadataMap((prev) => ({ ...prev, [key]: meta }));
    });

    requestCerts.forEach(async (req: any) => {
      const key = `req-${req._id}`;
      if (metadataMap[key] !== undefined || !req.metadataURI) return;
      const meta = await fetchMetadata(req.metadataURI);
      if (meta) setMetadataMap((prev) => ({ ...prev, [key]: meta }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftCerts.length, requestCerts.length]);

  const totalCount = nftCerts.length + requestCerts.length;

  const downloadQR = (id: string, name: string) => {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${name}-QR.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="space-y-8">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-display font-black text-foreground tracking-tight">My Certificates</h2>
          <p className="text-muted mt-2 text-lg">Your soulbound credentials, permanently on-chain.</p>
        </div>
        {totalCount > 0 && (
          <span className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-full text-sm font-bold">
            <Sparkles className="w-4 h-4" />
            {totalCount} Certificate{totalCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Loading ──────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="bg-surface rounded-[32px] border border-black/[0.05] shadow-sm p-24 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-white/20 border-t-accent-pink animate-spin" />
        </div>

      ) : totalCount === 0 ? (
        /* ── Empty state ───────────────────────────────────────── */
        <div className="bg-surface rounded-[32px] border border-black/[0.05] shadow-sm p-32 text-center">
          <div className="max-w-xs mx-auto space-y-4">
            <p className="text-5xl">🎓</p>
            <p className="text-muted text-lg font-medium">No certificates yet.</p>
            <p className="text-muted text-sm">Certificates will appear here once an institute issues one to your wallet.</p>
          </div>
        </div>

      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {/* ── REQUEST-BASED CARDS (accepted / minted) ──────────── */}
          {requestCerts.map((req: any) => {
            const meta = metadataMap[`req-${req._id}`];
            const attrs = meta?.attributes || [];

            // Prefer IPFS metadata, fallback to request details
            const instituteName =
              (meta && getAttr(attrs, 'Institute Name') !== '—')
                ? getAttr(attrs, 'Institute Name')
                : req.certificateDetails?.instituteName || 'Institute';

            const instituteLogo =
              (meta && getAttr(attrs, 'Institute Logo') !== '—')
                ? getAttr(attrs, 'Institute Logo')
                : null;

            const title =
              meta?.name
              || req.certificateDetails?.title
              || 'Certificate';

            const course =
              (meta && getAttr(attrs, 'Course') !== '—')
                ? getAttr(attrs, 'Course')
                : req.certificateDetails?.course || '—';

            const issueDate =
              (meta && getAttr(attrs, 'Issue Date') !== '—')
                ? getAttr(attrs, 'Issue Date')
                : req.certificateDetails?.issueDate || '—';

            const certType =
              (meta && getAttr(attrs, 'Certificate Type') !== '—')
                ? getAttr(attrs, 'Certificate Type')
                : req.certificateDetails?.certificateType || '—';

            const studentName = req.certificateDetails?.studentName || '—';
            const carbonScore = meta ? getAttr(attrs, 'Carbon Score (kg CO2e)') : '—';
            const sustainTag = meta ? getAttr(attrs, 'Sustainability Tag') : '—';

            const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.accepted;
            const StatusIcon = cfg.icon;

            const isAccepted = req.status === 'accepted';
            const gradientBar = isAccepted
              ? 'linear-gradient(90deg, #60a5fa, #3b82f6, #2563eb)'
              : 'linear-gradient(90deg, #34d399, #10b981, #059669)';

            return (
              <div key={`req-${req._id}`} className="group perspective-1000 hover:z-10 h-full">
                <div className="relative w-full h-full preserve-3d transition-transform duration-700 will-change-transform group-hover:rotate-y-180">
                  
                  {/* FRONT SIDE */}
                  <div className="relative backface-hidden shining-card bg-surface rounded-[24px] border border-black/[0.05] shadow-sm flex flex-col overflow-hidden h-full">
                    {/* Top colour bar */}
                    <div className="h-1.5 w-full" style={{ background: gradientBar }} />

                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex items-center gap-4">
                      {instituteLogo ? (
                        <img
                          src={instituteLogo}
                          alt={instituteName}
                          className="w-12 h-12 rounded-full object-cover border border-white/20 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-foreground flex items-center justify-center text-background font-black text-xl shrink-0">
                          🏫
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-muted uppercase tracking-widest truncate">{instituteName}</p>
                        <h3 className="font-black text-base text-foreground leading-tight mt-0.5 truncate">{title}</h3>
                        <p className="text-xs text-muted mt-0.5">To: <span className="font-semibold text-foreground">{studentName}</span></p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 rounded-full">
                          <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Verified</span>
                        </div>
                        <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full ${cfg.bg}`}>
                          <StatusIcon className={`w-3 h-3 ${cfg.text}`} />
                          <span className={`text-xs font-bold ${cfg.text}`}>
                            {req.status === 'minted' && req.tokenId != null ? `NFT #${req.tokenId}` : cfg.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Details grid */}
                    <div className="p-4 space-y-4 flex-1 flex flex-col">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {[
                          ['Type', certType],
                          ['Course', course],
                          ['Issued', issueDate],
                          ['Token', req.tokenId != null ? `#${req.tokenId}` : (isAccepted ? 'Minting…' : 'Pending')],
                        ].map(([label, val]) => (
                          <div key={label} className="bg-black/[0.03] p-3 rounded-xl">
                            <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">{label}</p>
                            <p className="font-semibold text-foreground truncate">{val}</p>
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

                      {/* Accepted status info */}
                      {isAccepted && (
                        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200 mt-auto">
                          <Clock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-blue-800">Certificate Approved ✓</p>
                            <p className="text-xs text-blue-600 mt-0.5">
                              The institute has approved your certificate. It will be minted as an NFT on Polygon shortly.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Issuer wallet & Links container */}
                      <div className="mt-auto space-y-4 pt-4">
                        <div>
                          <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1.5">Issuer Wallet</p>
                          <p className="font-mono text-xs bg-black/5 p-2.5 rounded-xl break-all">{req.instituteWallet || '—'}</p>
                        </div>

                        {/* IPFS link */}
                        {req.metadataURI && (
                          <a
                            href={resolveIpfs(req.metadataURI)}
                            target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 text-xs text-accent-pink font-mono bg-accent-pink/5 hover:bg-accent-pink/10 transition-colors px-3 py-2 rounded-xl"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">View IPFS Manifest</span>
                          </a>
                        )}

                        {/* Tx */}
                        {req.txHash && (
                          <a
                            href={`${POLYGONSCAN_URL}/tx/${req.txHash}`}
                            target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 text-xs text-muted font-mono bg-black/5 hover:bg-black/10 transition-colors px-3 py-2 rounded-xl"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">View Transaction</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BACK SIDE */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-surface rounded-[24px] border border-black/[0.05] shadow-lg flex flex-col items-center justify-center p-4 space-y-4 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 to-accent-purple/5 pointer-events-none" />
                    
                    {req.tokenId != null ? (
                      <>
                        <div className="relative z-10 bg-background p-3 rounded-2xl border border-black/5 shadow-inner">
                          <QRCodeCanvas id={`qr-cert-${req.tokenId}`} value={`${QR_PREFIX_CERT}${req.tokenId}`} size={220} level="H" includeMargin />
                        </div>
                        <div className="text-center relative z-10">
                          <h3 className="font-black text-lg font-display mb-1">Certificate QR</h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              downloadQR(`qr-cert-${req.tokenId}`, `Certificate-${req.tokenId}`);
                            }}
                            className="flex items-center justify-center gap-1.5 mx-auto mt-2 px-4 py-2 bg-foreground text-background rounded-full text-xs font-bold hover:scale-105 active:scale-95 transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Save QR
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center relative z-10 space-y-4 px-6">
                        <div className="w-16 h-16 rounded-full border-4 border-black/10 border-t-accent-blue animate-spin mx-auto" />
                        <h3 className="font-black text-lg font-display text-accent-blue">Minting...</h3>
                        <p className="text-muted text-xs font-medium">Your verifiable soulbound QR code will appear here once the institute issues the NFT.</p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}

          {/* ── ON-CHAIN RECORDS not already shown above ─────────── */}
          {nftCerts
            .filter((cert: any) => {
              // Only show if this tokenId isn't already represented by a request card
              const covered = requestCerts.some(
                (r: any) => r.tokenId != null && String(r.tokenId) === String(cert.tokenId)
              );
              return !covered;
            })
            .map((cert: any) => {
              const meta = metadataMap[`nft-${cert.tokenId}`];
              const attrs = meta?.attributes || [];
              const instituteLogo = getAttr(attrs, 'Institute Logo');
              const instituteName = getAttr(attrs, 'Institute Name');
              const title = meta?.name || `Certificate #${cert.tokenId}`;
              const course = getAttr(attrs, 'Course');
              const issueDate = getAttr(attrs, 'Issue Date');
              const certType = getAttr(attrs, 'Certificate Type');
              const carbonScore = getAttr(attrs, 'Carbon Score (kg CO2e)');
              const sustainTag = getAttr(attrs, 'Sustainability Tag');

              return (
                <div key={`nft-${cert.tokenId}`} className="group perspective-1000 hover:z-10 h-full">
                  <div className="relative w-full h-full preserve-3d transition-transform duration-700 will-change-transform group-hover:rotate-y-180">
                    
                    {/* FRONT SIDE */}
                    <div className="relative backface-hidden shining-card bg-surface rounded-[24px] border border-black/[0.05] shadow-sm flex flex-col overflow-hidden h-full">
                      <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #FF8DA1, #e05c7a, #a78bfa)' }} />

                      <div className="p-4 border-b border-white/10 flex items-center gap-4">
                        {instituteLogo && instituteLogo !== '—' ? (
                          <img src={instituteLogo} alt="Institute" className="w-12 h-12 rounded-full object-cover border border-white/20 shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-foreground flex items-center justify-center text-background font-black text-xl shrink-0">🏫</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-muted uppercase tracking-widest truncate">{instituteName}</p>
                          <h3 className="font-black text-base text-foreground leading-tight mt-0.5 truncate">{title}</h3>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 rounded-full">
                            <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-xs font-bold text-green-700 uppercase">Verified</span>
                          </div>
                          <div className="flex items-center gap-1 px-2.5 py-0.5 bg-purple-100 rounded-full">
                            <Award className="w-3 h-3 text-purple-600" />
                            <span className="text-xs font-bold text-purple-700">NFT #{cert.tokenId}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 space-y-4 flex-1 flex flex-col">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {[['Soulbound Token', `#${cert.tokenId}`], ['Type', certType], ['Course', course], ['Issued', issueDate]].map(([label, val]) => (
                            <div key={label} className="bg-black/[0.03] p-3 rounded-xl">
                              <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">{label}</p>
                              <p className="font-semibold text-foreground truncate">{val}</p>
                            </div>
                          ))}
                        </div>

                        {carbonScore !== '—' && (
                          <div className={`flex items-center justify-between p-3 rounded-xl text-sm ${sustainTag === 'Green' ? 'bg-green-50 border border-green-200' : sustainTag === 'Neutral' ? 'bg-amber-50 border border-amber-200' : 'bg-red-50 border border-red-200'}`}>
                            <span className="font-bold text-muted">Carbon Score</span>
                            <span className="font-black">{carbonScore} kg CO₂e <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${sustainTag === 'Green' ? 'bg-green-200 text-green-800' : sustainTag === 'Neutral' ? 'bg-amber-200 text-amber-800' : 'bg-red-200 text-red-800'}`}>{sustainTag}</span></span>
                          </div>
                        )}

                        <div className="mt-auto space-y-4 pt-4">
                          <div>
                            <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1.5">Issuer Wallet</p>
                            <p className="font-mono text-xs bg-black/5 p-2.5 rounded-xl break-all">{cert.issuerWallet}</p>
                          </div>

                          <a href={resolveIpfs(cert.metadataURI)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-accent-pink font-mono bg-accent-pink/5 hover:bg-accent-pink/10 transition-colors px-3 py-2 rounded-xl">
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">View IPFS Manifest</span>
                          </a>

                          {cert.txHash && (
                            <a href={`${POLYGONSCAN_URL}/tx/${cert.txHash}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-muted font-mono bg-black/5 hover:bg-black/10 transition-colors px-3 py-2 rounded-xl">
                              <ExternalLink className="w-3 h-3 shrink-0" />
                              <span className="truncate">View Transaction</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* BACK SIDE */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-surface rounded-[24px] border border-black/[0.05] shadow-lg flex flex-col items-center justify-center p-4 space-y-4 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/5 to-accent-purple/5 pointer-events-none" />
                      
                      <div className="relative z-10 bg-background p-3 rounded-2xl border border-black/5 shadow-inner">
                        <QRCodeCanvas id={`qr-cert-${cert.tokenId}`} value={`${QR_PREFIX_CERT}${cert.tokenId}`} size={220} level="H" includeMargin />
                      </div>
                      
                      <div className="text-center relative z-10">
                        <h3 className="font-black text-lg font-display mb-1">Certificate QR</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            downloadQR(`qr-cert-${cert.tokenId}`, `Certificate-${cert.tokenId}`);
                          }}
                          className="flex items-center justify-center gap-1.5 mx-auto mt-2 px-4 py-2 bg-foreground text-background rounded-full text-xs font-bold hover:scale-105 active:scale-95 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Save QR
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
          })}

        </div>
      )}
    </div>
  );
}
