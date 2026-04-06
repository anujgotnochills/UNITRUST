'use client';

import React, { useState } from 'react';
import { usePublicClient } from 'wagmi';
import { PRODUCT_NFT_ADDRESS, PRODUCT_NFT_ABI, CERTIFICATE_NFT_ADDRESS, CERTIFICATE_NFT_ABI } from '@/lib/contracts';
import toast from 'react-hot-toast';

export default function VerifyPage() {
  const [inputId, setInputId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const publicClient = usePublicClient();

  const handleVerify = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!inputId) return;
     if (!publicClient) return toast.error('Web3 connection unavailable');

     setIsVerifying(true);
     setResult(null);

     try {
         const tokenId = BigInt(inputId);
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
                 });
                 setResult({ type: 'Product Asset', owner, uri, tokenId: Number(tokenId) });
                 toast.success('Asset verified on-chain!');
                 setIsVerifying(false);
                 return;
             }
         } catch(e) { 
             // Fails if token doesn't exist on this contract
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

                 setResult({ type: 'Soulbound Certificate', owner, issuer, uri, tokenId: Number(tokenId) });
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
                  <a href={result.uri?.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')} target="_blank" rel="noreferrer" className="font-mono text-sm mt-1 text-accent-pink bg-accent-pink/5 hover:bg-accent-pink/10 transition-colors p-3 rounded-xl break-all block">
                     {result.uri}
                  </a>
               </div>
           </div>
        </div>
      )}
    </div>
  );
}
