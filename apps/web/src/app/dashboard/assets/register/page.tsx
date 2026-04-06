'use client';

import React, { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { PRODUCT_NFT_ADDRESS, PRODUCT_NFT_ABI } from '@/lib/contracts';
import { ASSET_CATEGORIES, SUSTAINABILITY_TAGS } from '@/lib/constants';
import { ipfsService } from '@/services/ipfsService';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function RegisterAssetPage() {
  const router = useRouter();
  const { address } = useAccount();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: ASSET_CATEGORIES[0],
    carbonScore: 0,
    sustainabilityTag: SUSTAINABILITY_TAGS[0],
  });
  const [image, setImage] = useState<File | null>(null);
  const [isMinting, setIsMinting] = useState(false);

  const { writeContractAsync } = useWriteContract();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return toast.error('Please connect your wallet');
    if (!image) return toast.error('Please upload an image');

    setIsMinting(true);
    try {
      toast.loading('Uploading image to IPFS...', { id: 'mint' });
      const { ipfsUrl: imageUri } = await ipfsService.uploadFile(image);

      toast.loading('Uploading metadata to IPFS...', { id: 'mint' });
      const metadata = {
        name: formData.name,
        description: formData.description,
        image: imageUri,
        attributes: [
           { trait_type: 'Category', value: formData.category },
           { trait_type: 'Carbon Score', value: Number(formData.carbonScore) },
           { trait_type: 'Sustainability Tag', value: formData.sustainabilityTag }
        ]
      };
      
      const { metadataUri } = await ipfsService.uploadMetadata(metadata);

      toast.loading('Confirm transaction in wallet...', { id: 'mint' });
      const txHash = await writeContractAsync({
        address: PRODUCT_NFT_ADDRESS,
        abi: PRODUCT_NFT_ABI,
        functionName: 'mintAsset',
        args: [address, metadataUri],
      });

      toast.success('Successfully registered asset! Tx attached to blockchain.', { id: 'mint' });
      router.push('/dashboard/assets');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Transaction failed', { id: 'mint' });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-4xl font-display font-black text-[#1A1A1A] tracking-tight">Register Asset</h2>
        <p className="text-muted mt-2 text-lg">Tokenize a new physical or digital asset on-chain.</p>
      </div>
      <div className="bg-white rounded-[32px] border border-black/[0.1] shadow-xl p-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1A1A1A] uppercase tracking-widest px-1">Asset Name</label>
            <input 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              type="text" 
              className="w-full px-6 py-4 rounded-2xl border border-black/10 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-medium" 
              placeholder="e.g. Solar Panel 45A" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1A1A1A] uppercase tracking-widest px-1">Description</label>
            <textarea 
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-6 py-4 rounded-2xl border border-black/10 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-medium" 
              placeholder="Asset details..." 
              rows={4} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#1A1A1A] uppercase tracking-widest px-1">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-6 py-4 rounded-2xl border border-black/10 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-medium"
              >
                {ASSET_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#1A1A1A] uppercase tracking-widest px-1">Carbon Score (kg CO2e)</label>
              <input 
                required
                type="number"
                min="0"
                step="0.01"
                value={formData.carbonScore}
                onChange={(e) => setFormData({...formData, carbonScore: Number(e.target.value)})}
                className="w-full px-6 py-4 rounded-2xl border border-black/10 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-medium" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1A1A1A] uppercase tracking-widest px-1">Sustainability Tag</label>
            <select 
              value={formData.sustainabilityTag}
              onChange={(e) => setFormData({...formData, sustainabilityTag: e.target.value})}
              className="w-full px-6 py-4 rounded-2xl border border-black/10 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-medium"
            >
              {SUSTAINABILITY_TAGS.map(tag => <option key={tag} value={tag}>{tag}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1A1A1A] uppercase tracking-widest px-1">Asset Image</label>
            <input 
              required
              type="file" 
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="w-full px-6 py-4 rounded-2xl border border-black/10 bg-black/5 outline-none font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-gray-100" 
            />
          </div>

          <button 
            type="submit"
            disabled={isMinting || !address}
            className="w-full py-5 bg-[#1A1A1A] text-white rounded-full font-black text-lg hover:bg-black transition-transform active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMinting ? 'Processing...' : address ? 'Mint Asset NFT' : 'Connect Wallet to Mint'}
          </button>
        </form>
      </div>
    </div>
  );
}
