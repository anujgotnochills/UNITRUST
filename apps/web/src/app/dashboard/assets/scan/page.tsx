'use client';

import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { assetService } from '@/services/assetService';
import { QR_PREFIX_ASSET } from '@/lib/constants';
import toast from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';

export default function ScanQRPage() {
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (asset || loading || error) return;

    const scanner = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: { width: 300, height: 300 } },
      /* verbose= */ false
    );

    scanner.render(
      async (decodedText) => {
        if (!decodedText.startsWith(QR_PREFIX_ASSET)) {
           toast.error('Invalid Unitrust Asset QR Code');
           return;
        }
        
        scanner.clear();
        setLoading(true);
        const tokenId = parseInt(decodedText.replace(QR_PREFIX_ASSET, ''));
        
        try {
           const res = await assetService.getAssetByTokenId(tokenId);
           setAsset(res.asset);
           toast.success('Asset confirmed authentic!');
        } catch(err: any) {
           setError('Asset not found or not indexed by backend yet.');
           toast.error('Failed to fetch asset');
        } finally {
           setLoading(false);
        }
      },
      (error) => {
        // ignore continuous scan errors
      }
    );

    return () => {
      scanner.clear().catch(e => console.error("Scanner clear error", e));
    };
  }, [asset, loading, error]);

  return (
    <div className="space-y-8 flex flex-col items-center justify-center text-center">
      <div className="max-w-2xl w-full">
        <h2 className="text-4xl font-display font-black text-foreground tracking-tight">Scan QR</h2>
        <p className="text-muted mt-3 mb-10 text-lg">Scan a UniTrust asset QR code to verify its on-chain provenance instantly.</p>
        
        {!asset && !loading && !error && (
            <div className="bg-surface rounded-[40px] border border-border/5 shadow-sm p-4 overflow-hidden relative">
                <div id="reader" className="w-full"></div>
            </div>
        )}

        {loading && (
          <div className="bg-surface rounded-[40px] border border-border/5 shadow-sm flex items-center justify-center p-24">
            <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-accent-pink animate-spin" />
          </div>
        )}

        {error && (
           <div className="bg-surface rounded-[40px] border border-red-100 shadow-sm p-12 flex flex-col items-center gap-6">
              <span className="text-4xl">⚠️</span>
              <p className="text-red-600 font-bold">{error}</p>
              <button onClick={() => { setError(''); setAsset(null); }} className="px-6 py-3 bg-foreground text-background rounded-full font-bold">Try Again</button>
           </div>
        )}

        {asset && (
           <div className="bg-surface rounded-[32px] border border-black/[0.05] shadow-xl p-8 text-left space-y-6">
              <div className="flex justify-between items-start border-b border-white/10 pb-6">
                 <div>
                    <h3 className="text-2xl font-black font-display tracking-tight text-foreground">Asset Authentic</h3>
                    <p className="text-muted font-medium mt-1">Token #{asset.tokenId}</p>
                 </div>
                 <div className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase ${
                    asset.sustainabilityTag === 'Green' ? 'bg-accent-green/20 text-foreground' :
                    asset.sustainabilityTag === 'Neutral' ? 'bg-accent-blue/20 text-foreground' :
                    'bg-red-100 text-red-700'
                 }`}>
                    {asset.sustainabilityTag}
                 </div>
              </div>

              <div className="space-y-4">
                 <div>
                    <span className="text-xs font-bold text-muted uppercase tracking-widest">Current Owner Wallet</span>
                    <p className="font-mono text-sm mt-1 bg-black/5 p-3 rounded-xl break-all">{asset.ownerWallet}</p>
                 </div>
                 <div>
                    <span className="text-xs font-bold text-muted uppercase tracking-widest">IPFS Document URI</span>
                    <a href={asset.metadataURI?.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')} target="_blank" rel="noreferrer" className="font-mono text-sm mt-1 text-accent-pink bg-accent-pink/5 hover:bg-accent-pink/10 transition-colors p-3 rounded-xl break-all block">
                       {asset.metadataURI}
                    </a>
                 </div>
                 <div className="pt-4 flex justify-between items-end border-t border-white/10">
                     <div>
                        <span className="text-xs font-bold text-muted uppercase tracking-widest">Carbon Impact Rating</span>
                        <p className="text-3xl font-black mt-1 font-display">{asset.carbonScore} <span className="text-lg font-medium text-muted">kg CO₂e</span></p>
                     </div>
                 </div>
              </div>

              <button onClick={() => setAsset(null)} className="w-full flex items-center justify-center gap-2 py-4 bg-foreground text-background rounded-xl font-bold hover:bg-black transition-colors mt-6">
                 <RefreshCw className="w-4 h-4" />
                 Scan Another
              </button>
           </div>
        )}
      </div>
    </div>
  );
}
