'use client';

import { useAccount } from 'wagmi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { assetService } from '@/services/assetService';
import Link from 'next/link';
import { PlusCircle, QrCode, ArrowRightLeft, X, ExternalLink, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { IPFS_GATEWAY, QR_PREFIX_ASSET } from '@/lib/constants';
import toast from 'react-hot-toast';

function resolveIpfs(uri: string): string {
  if (!uri) return '';
  if (uri.startsWith('ipfs://')) return IPFS_GATEWAY + uri.replace('ipfs://', '');
  return uri;
}

async function fetchMetadata(uri: string): Promise<any> {
  try {
    const res = await fetch(resolveIpfs(uri));
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export default function MyAssetsPage() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['assets', address],
    queryFn: () => assetService.getAssetsByOwner(address as string),
    enabled: !!address,
  });

  const assets = data?.assets || [];

  // Load IPFS metadata for all assets
  const [metadataMap, setMetadataMap] = useState<Record<number, any>>({});
  useEffect(() => {
    assets.forEach(async (asset: any) => {
      if (metadataMap[asset.tokenId] !== undefined) return;
      const meta = await fetchMetadata(asset.metadataURI);
      if (meta) setMetadataMap((prev) => ({ ...prev, [asset.tokenId]: meta }));
    });
  }, [assets]);

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

  // Transfer modal
  const [transferModal, setTransferModal] = useState<{ show: boolean; tokenId: number } | null>(null);
  const [transferTo, setTransferTo] = useState('');
  const [transferring, setTransferring] = useState(false);

  const handleTransfer = async () => {
    if (!transferModal || !transferTo.trim()) return toast.error('Enter recipient address');
    if (!/^0x[a-fA-F0-9]{40}$/.test(transferTo)) return toast.error('Invalid Ethereum address');
    setTransferring(true);
    try {
      await assetService.updateOwner(transferModal.tokenId, transferTo, '');
      toast.success('Ownership transferred!');
      setTransferModal(null);
      setTransferTo('');
      queryClient.invalidateQueries({ queryKey: ['assets', address] });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Transfer failed');
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-display font-black text-foreground tracking-tight">My Assets</h2>
          <p className="text-muted mt-2 text-lg">Manage all your tokenized physical and digital assets.</p>
        </div>
        <Link
          href="/dashboard/assets/register"
          className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full font-bold hover:bg-black transition-transform active:scale-[0.98]"
        >
          <PlusCircle className="w-5 h-5" />
          Register Asset
        </Link>
      </div>

      {isLoading ? (
        <div className="bg-surface rounded-[32px] border border-black/[0.05] shadow-sm p-24 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-white/20 border-t-accent-pink animate-spin" />
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-surface rounded-[32px] border border-black/[0.05] shadow-sm p-24 text-center border-dashed">
          <div className="max-w-xs mx-auto space-y-4">
            <p className="text-5xl">📦</p>
            <p className="text-muted text-lg font-medium">No assets yet. Register your first asset to get started.</p>
            <Link href="/dashboard/assets/register" className="inline-block px-6 py-3 bg-foreground text-background rounded-full font-bold text-sm mt-2">
              Register Asset →
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {assets.map((asset: any) => {
            const meta = metadataMap[asset.tokenId];
            const imageUrl = meta?.image ? resolveIpfs(meta.image) : '';

            return (
              <div key={asset.tokenId} className="group perspective-1000 hover:z-10">
                <div className="relative w-full h-full preserve-3d transition-transform duration-300 will-change-transform group-hover:rotate-y-180">
                  
                  {/* Front side */}
                  <div className="relative backface-hidden shining-card bg-surface rounded-[24px] border border-black/[0.05] shadow-sm flex flex-col overflow-hidden h-full">
                    {/* Image */}
                    <div className="aspect-[4/3] bg-background relative overflow-hidden">
                      {imageUrl ? (
                        <img src={imageUrl} alt={meta?.name || 'Asset'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">📦</div>
                      )}
                      {/* Sustainability badge */}
                      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                        asset.sustainabilityTag === 'Green' ? 'bg-accent-green/90 text-background' :
                        asset.sustainabilityTag === 'Neutral' ? 'bg-amber-400/90 text-background' :
                        'bg-red-500/90 text-background'
                      }`}>
                        {asset.sustainabilityTag}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex flex-col gap-3 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-black text-foreground text-base leading-tight">
                            {meta?.name || `Asset #${asset.tokenId}`}
                          </h3>
                          {meta?.description && (
                            <p className="text-muted text-xs mt-1 line-clamp-2">{meta.description}</p>
                          )}
                        </div>
                        <span className="bg-black/5 px-2 py-0.5 rounded-full text-xs font-bold text-muted uppercase shrink-0">
                          #{asset.tokenId}
                        </span>
                      </div>

                      {/* Carbon Info */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-black/[0.03]">
                        <span className="text-xs font-bold text-muted uppercase tracking-widest">Carbon Impact</span>
                        <span className="font-black text-lg font-display">
                          {asset.carbonScore} <span className="text-xs font-medium text-muted">kg CO₂e</span>
                        </span>
                      </div>

                      {/* IPFS Link */}
                      <a
                        href={resolveIpfs(asset.metadataURI)}
                        target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs text-accent-pink font-mono bg-accent-pink/5 hover:bg-accent-pink/10 transition-colors px-3 py-2 rounded-xl truncate"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{asset.metadataURI}</span>
                      </a>

                    </div>
                  </div>

                  {/* Back side */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-surface rounded-[24px] border border-black/[0.05] shadow-lg flex flex-col items-center justify-center p-4 space-y-4 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/5 to-accent-blue/5 pointer-events-none" />
                    
                    <div className="relative z-10 bg-background p-3 rounded-2xl border border-black/5 shadow-inner">
                      <QRCodeCanvas
                        id={`qr-asset-${asset.tokenId}`}
                        value={`${QR_PREFIX_ASSET}${asset.tokenId}`}
                        size={220}
                        level="H"
                        includeMargin
                      />
                    </div>
                    
                    <div className="text-center relative z-10 w-full px-6">
                      <h3 className="font-black text-lg font-display mb-1">Asset Actions</h3>
                      <div className="flex flex-col gap-2 mx-auto mt-3 w-full max-w-[220px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            downloadQR(`qr-asset-${asset.tokenId}`, `Asset-${asset.tokenId}`);
                          }}
                          className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-foreground text-background rounded-xl text-sm font-bold hover:scale-105 active:scale-95 transition-transform"
                        >
                          <Download className="w-4 h-4" /> Save QR
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setTransferModal({ show: true, tokenId: asset.tokenId }); 
                            setTransferTo('');
                          }}
                          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-black/10 text-sm font-bold hover:bg-black/5 active:scale-95 transition-transform bg-background/50"
                        >
                          <ArrowRightLeft className="w-4 h-4" /> Transfer
                        </button>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            );
          })}
        </div>
      )}



      {/* Transfer Modal */}
      {transferModal?.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setTransferModal(null)}>
          <div className="bg-surface rounded-[32px] p-10 max-w-md w-full shadow-2xl space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="font-black text-xl font-display">Transfer Asset #{transferModal.tokenId}</h3>
              <button onClick={() => setTransferModal(null)} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-muted text-sm">Enter the recipient's wallet address to transfer ownership of this asset.</p>
            <input
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
              placeholder="0x..."
              className="w-full px-6 py-4 rounded-2xl border border-white/20 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-mono text-sm"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setTransferModal(null)}
                className="flex-1 py-4 border-2 border-white/20 rounded-full font-bold hover:border-black/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={transferring || !transferTo}
                className="flex-1 py-4 bg-foreground text-background rounded-full font-bold hover:bg-black transition-colors disabled:opacity-50"
              >
                {transferring ? 'Transferring…' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
