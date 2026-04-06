'use client';

import React, { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { PRODUCT_NFT_ADDRESS, PRODUCT_NFT_ABI, CERTIFICATE_NFT_ADDRESS, CERTIFICATE_NFT_ABI } from '@/lib/contracts';
import { assetService } from '@/services/assetService';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QR_PREFIX_ASSET, QR_PREFIX_CERT } from '@/lib/constants';
import toast from 'react-hot-toast';

function resolveIpfs(uri: string): string {
  if (!uri) return '';
  if (uri.startsWith('ipfs://')) return 'https://gateway.pinata.cloud/ipfs/' + uri.replace('ipfs://', '');
  return uri;
}

async function fetchMetadata(uri: string): Promise<any> {
  try {
    const res = await fetch(resolveIpfs(uri));
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export default function VerifyPage() {
  const [inputId, setInputId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!scannerOpen) return;
    const scanner = new Html5QrcodeScanner(
      'verify-reader',
      { fps: 10, qrbox: { width: 300, height: 300 } },
      /* verbose= */ false
    );
    scanner.render(
      (decodedText) => {
        let tokenIdStr = decodedText;
        if (decodedText.startsWith(QR_PREFIX_ASSET)) tokenIdStr = decodedText.replace(QR_PREFIX_ASSET, '');
        if (decodedText.startsWith(QR_PREFIX_CERT)) tokenIdStr = decodedText.replace(QR_PREFIX_CERT, '');
        
        const extractedId = tokenIdStr.match(/\d+/)?.[0];
        if (extractedId) {
            setInputId(extractedId);
            setScannerOpen(false);
            scanner.clear().catch(() => {});
            executeVerification(extractedId);
        } else {
            toast.error("Invalid QR format");
        }
      },
      () => {} // silence errors
    );
    return () => { scanner.clear().catch(() => {}); };
  }, [scannerOpen]);

  const handleVerify = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!inputId) return;
     await executeVerification(inputId);
  };

  const executeVerification = async (targetId: string) => {
     if (!publicClient) return toast.error('Web3 connection unavailable');

     setIsVerifying(true);
     setResult(null);

     try {
         const tokenId = BigInt(targetId);
         // Try Asset
         try {
             const owner = await publicClient.readContract({
                 address: PRODUCT_NFT_ADDRESS,
                 abi: PRODUCT_NFT_ABI,
                 functionName: 'ownerOf',
                 args: [tokenId]
             });
             
             if (owner) {
                 const uri = await publicClient.readContract({
                     address: PRODUCT_NFT_ADDRESS,
                     abi: PRODUCT_NFT_ABI,
                     functionName: 'tokenURI',
                     args: [tokenId]
                 }) as string;
                 const metadata = await fetchMetadata(uri);
                 setResult({ type: 'Product Asset', owner, uri, tokenId: Number(tokenId), metadata });
                 toast.success('Asset verified on-chain!');
                 setIsVerifying(false);
                 return;
             }
         } catch(e) { 
             // Fallback: Check MongoDB backend for Gasless / Simulated assets
             try {
                const resultObj = await assetService.getAssetByTokenId(Number(tokenId));
                const dbAsset = resultObj?.asset || resultObj; // Handle `{asset:...}` or raw asset
                if (dbAsset && dbAsset.ownerWallet) {
                    const metadata = await fetchMetadata(dbAsset.metadataURI);
                    setResult({ type: 'Protocol Asset (Off-Chain)', owner: dbAsset.ownerWallet, uri: dbAsset.metadataURI, tokenId: Number(tokenId), metadata });
                    toast.success('Asset verified in Unitrust Database!');
                    setIsVerifying(false);
                    return;
                }
             } catch (dbErr) { }
         }

         // Try Certificate
         try {
             const owner = await publicClient.readContract({
                 address: CERTIFICATE_NFT_ADDRESS,
                 abi: CERTIFICATE_NFT_ABI,
                 functionName: 'ownerOf',
                 args: [tokenId]
             });
             if (owner) {
                 const uri = await publicClient.readContract({
                     address: CERTIFICATE_NFT_ADDRESS,
                     abi: CERTIFICATE_NFT_ABI,
                     functionName: 'tokenURI',
                     args: [tokenId]
                 });
                 const issuer = await publicClient.readContract({
                     address: CERTIFICATE_NFT_ADDRESS,
                     abi: CERTIFICATE_NFT_ABI,
                     functionName: 'getIssuer',
                     args: [tokenId]
                 }).catch(() => null); // getIssuer / issuerOf fallback

                 const metadata = await fetchMetadata(uri as string);

                 setResult({ type: 'Soulbound Certificate', owner, issuer, uri, tokenId: Number(tokenId), metadata });
                 toast.success('Certificate verified on-chain!');
                 setIsVerifying(false);
                 return;
             }
         } catch(e) { }

         toast.error('Could not find any token with this ID on-chain.');

     } catch(err: any) {
         toast.error('Invalid ID format. Must be a numeric Token ID.');
     } finally {
         setIsVerifying(false);
     }
  };

  return (
    <div className="space-y-10 max-w-2xl mx-auto py-10">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-display font-black text-[#1A1A1A] tracking-tighter">Verify Authenticity</h2>
        <p className="text-muted text-xl font-medium">Verify any on-chain Token ID instantly.</p>
      </div>
      <div className="bg-white rounded-[40px] border border-black/[0.1] shadow-2xl p-12">
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-3">
             <label className="block text-xs font-black text-[#1A1A1A] uppercase tracking-[0.2em] px-2">Token ID</label>
             <input 
               value={inputId}
               onChange={e => setInputId(e.target.value)}
               type="text" 
               className="w-full px-8 py-5 rounded-[24px] border-2 border-black/5 bg-[#FAF7F5]/50 focus:bg-white focus:border-accent-pink/30 outline-none transition-all font-mono text-sm" 
               placeholder="e.g. 1" 
             />
          </div>
          <button 
             type="submit"
             disabled={isVerifying || !inputId}
             className="w-full py-6 bg-[#1A1A1A] text-white rounded-full font-black text-xl hover:bg-black transition-all active:scale-[0.98] shadow-xl group disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
             {isVerifying ? (
               <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Verifying...</>
             ) : (
               <>Run Verification Sweep <span className="group-hover:translate-x-1 transition-transform inline-block">→</span></>
             )}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center">
            <div className="flex items-center gap-4 w-full px-2 mb-4">
               <div className="h-px bg-black/10 flex-1"></div>
               <span className="text-xs font-bold text-muted uppercase tracking-widest">OR</span>
               <div className="h-px bg-black/10 flex-1"></div>
            </div>
            
            {!scannerOpen ? (
                <button 
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-4 border-2 border-black/10 text-[#1A1A1A] rounded-2xl font-bold text-lg hover:border-black/30 transition-all font-display"
                >
                  📸 Scan or Upload QR Image
                </button>
            ) : (
                <div className="w-full">
                    <div id="verify-reader" className="w-full rounded-2xl overflow-hidden border-2 border-black/10 bg-[#FAF7F5]"></div>
                    <button 
                      type="button"
                      onClick={() => setScannerOpen(false)}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all"
                    >
                      Close Scanner
                    </button>
                </div>
            )}
        </div>
      </div>
      
      {!result ? (
        <div className="grid grid-cols-2 gap-6 pt-6">
           <div className="p-6 rounded-[32px] bg-white border border-black/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent-pink/10 flex items-center justify-center text-accent-pink font-bold">1</div>
              <span className="text-sm font-bold text-[#1A1A1A] opacity-60">Enter the cryptographic Token ID</span>
           </div>
           <div className="p-6 rounded-[32px] bg-white border border-black/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent-pink/10 flex items-center justify-center text-accent-pink font-bold">2</div>
              <span className="text-sm font-bold text-[#1A1A1A] opacity-60">Validate against Polygon Amoy</span>
           </div>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-green-500/20 shadow-xl p-8 space-y-6">
           <div className="flex justify-between items-start border-b border-black/5 pb-6">
               <div>
                  <h3 className="text-2xl font-black font-display tracking-tight text-green-600">Verified Authentic</h3>
                  <p className="text-muted font-medium mt-1">Found on Polygon Amoy Testnet</p>
               </div>
               <div className="px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-green-100 text-green-700">
                  {result.type}
               </div>
           </div>

           {result.metadata && (
               <div className="flex bg-[#FAF7F5] rounded-2xl overflow-hidden border border-black/5">
                   {result.metadata.image && (
                     <div className="w-1/3 min-h-[120px] bg-black/5 shrink-0">
                        <img src={resolveIpfs(result.metadata.image)} alt="Asset Image" className="w-full h-full object-cover" />
                     </div>
                   )}
                   <div className="p-6 flex flex-col justify-center">
                     <h4 className="text-xl font-black font-display text-[#1A1A1A]">
                        {result.metadata.name || `Asset #${result.tokenId}`}
                     </h4>
                     {result.metadata.description && (
                        <p className="mt-2 text-sm text-muted line-clamp-3">
                           {result.metadata.description}
                        </p>
                     )}
                   </div>
               </div>
           )}

           <div className="space-y-4">
               <div>
                  <span className="text-xs font-bold text-muted uppercase tracking-widest">Token ID</span>
                  <p className="font-mono text-sm mt-1 bg-black/5 p-3 rounded-xl break-all">#{result.tokenId}</p>
               </div>
               <div>
                  <span className="text-xs font-bold text-muted uppercase tracking-widest">Current Owner Wallet</span>
                  <p className="font-mono text-sm mt-1 bg-black/5 p-3 rounded-xl break-all">{result.owner}</p>
               </div>
               {result.issuer && (
                 <div>
                    <span className="text-xs font-bold text-muted uppercase tracking-widest">Issuer Wallet</span>
                    <p className="font-mono text-sm mt-1 bg-black/5 p-3 rounded-xl break-all">{result.issuer}</p>
                 </div>
               )}
               <div>
                  <span className="text-xs font-bold text-muted uppercase tracking-widest">IPFS Document URI</span>
                  <a href={resolveIpfs(result.uri)} target="_blank" rel="noreferrer" className="font-mono text-sm mt-1 text-accent-pink bg-accent-pink/5 hover:bg-accent-pink/10 transition-colors p-3 rounded-xl break-all block">
                     {result.uri}
                  </a>
               </div>
           </div>
        </div>
      )}
    </div>
  );
}
