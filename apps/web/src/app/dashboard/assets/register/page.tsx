'use client';

import React, { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { ASSET_CATEGORIES } from '@/lib/constants';
import { ipfsService } from '@/services/ipfsService';
import { assetService } from '@/services/assetService';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Upload, Leaf, CheckCircle2, Loader2 } from 'lucide-react';

const STEPS = ['Upload Image', 'Upload Metadata', 'Register On-Chain', 'Done'];

function getCarbonEstimate(name: string, category: string) {
  const n = name.toLowerCase();
  const dataMap: Record<string, { score: number; tag: string }> = {
    laptop: { score: 316, tag: 'High Impact' }, computer: { score: 400, tag: 'High Impact' },
    phone: { score: 70, tag: 'Neutral' }, mobile: { score: 70, tag: 'Neutral' },
    tv: { score: 200, tag: 'High Impact' }, television: { score: 200, tag: 'High Impact' },
    bicycle: { score: 5, tag: 'Green' }, bike: { score: 5, tag: 'Green' },
    car: { score: 6000, tag: 'High Impact' }, vehicle: { score: 6000, tag: 'High Impact' },
    solar: { score: 0.05, tag: 'Green' }, book: { score: 1.2, tag: 'Green' },
    shirt: { score: 8, tag: 'Neutral' }, watch: { score: 15, tag: 'Neutral' },
  };
  for (const [kw, val] of Object.entries(dataMap)) {
    if (n.includes(kw)) return val;
  }
  const catDefaults: Record<string, { score: number; tag: string }> = {
    Electronics: { score: 150, tag: 'High Impact' },
    Vehicle: { score: 5000, tag: 'High Impact' },
    Property: { score: 50, tag: 'Neutral' },
    Document: { score: 0.5, tag: 'Green' },
    Other: { score: 20, tag: 'Neutral' },
  };
  return catDefaults[category] || { score: 20, tag: 'Neutral' };
}

export default function RegisterAssetPage() {
  const router = useRouter();
  const { address } = useAccount();

  const [formData, setFormData] = useState({
    name: '', description: '', category: ASSET_CATEGORIES[0] as string, ecoNotes: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [step, setStep] = useState(-1);
  const [isDone, setIsDone] = useState(false);

  const carbon = useMemo(
    () => getCarbonEstimate(formData.name, formData.category),
    [formData.name, formData.category]
  );

  const isMinting = step >= 0 && !isDone;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return toast.error('Please connect your wallet');
    if (!image) return toast.error('Please upload an image');
    if (!formData.name.trim()) return toast.error('Asset name is required');

    setStep(0);
    const mintToast = toast.loading('Uploading image to IPFS…');

    try {
      const { ipfsUrl: imageUri, gatewayUrl } = await ipfsService.uploadFile(image);

      setStep(1);
      toast.loading('Uploading metadata to IPFS…', { id: mintToast });

      const metadata = {
        name: formData.name,
        description: formData.description,
        image: imageUri,
        attributes: [
          { trait_type: 'Category', value: formData.category },
          { trait_type: 'Carbon Score', value: carbon.score },
          { trait_type: 'Sustainability Tag', value: carbon.tag },
          { trait_type: 'Eco Notes', value: formData.ecoNotes },
          { trait_type: 'Original Owner', value: address },
          { trait_type: 'Registered On', value: new Date().toISOString() },
        ],
      };

      const { metadataUri } = await ipfsService.uploadMetadata(metadata);

      setStep(2);
      toast.loading('Recording asset via frictionless protocol…', { id: mintToast });

      const generatedTokenId = Math.floor(Math.random() * 90000) + 10000; // 5-digit number

      await assetService.recordAsset({
        tokenId: generatedTokenId,
        ownerWallet: address,
        metadataURI: metadataUri,
        txHash: '0x0000000000000000000000000000simulated',
        assetName: formData.name,
        category: formData.category,
      });

      setStep(3);
      setIsDone(true);
      toast.success('Asset registered successfully! ✅', { id: mintToast });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || 'Registration failed', { id: mintToast });
      setStep(-1);
    }
  };

  if (isDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <div className="w-20 h-20 rounded-full bg-accent-green/20 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-accent-green" />
        </div>
        <h2 className="text-4xl font-display font-black text-[#1A1A1A] tracking-tight">Asset Registered!</h2>
        <p className="text-muted text-lg">Your asset metadata is on IPFS and recorded in UniTrust.</p>
        <div className="flex gap-4">
          <button
            onClick={() => { setIsDone(false); setStep(-1); setFormData({ name: '', description: '', category: ASSET_CATEGORIES[0], ecoNotes: '' }); setImage(null); setImagePreview(''); }}
            className="px-8 py-3 border-2 border-[#1A1A1A] rounded-full font-bold hover:bg-[#1A1A1A] hover:text-white transition-colors"
          >
            Register Another
          </button>
          <button
            onClick={() => router.push('/dashboard/assets')}
            className="px-8 py-3 bg-[#1A1A1A] text-white rounded-full font-bold hover:bg-black transition-colors"
          >
            View My Assets →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-4xl font-display font-black text-[#1A1A1A] tracking-tight">Register Asset</h2>
        <p className="text-muted mt-2 text-lg">Tokenize a physical or digital asset with IPFS metadata.</p>
      </div>

      {/* Progress Steps */}
      {isMinting && (
        <div className="bg-white rounded-[24px] border border-black/[0.05] p-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-black/5 z-0" />
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-col items-center gap-2 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step ? 'bg-accent-green text-white' : i === step ? 'bg-[#1A1A1A] text-white' : 'bg-white border-2 border-black/10 text-muted'
                }`}>
                  {i < step ? '✓' : i === step ? <Loader2 className="w-4 h-4 animate-spin" /> : i + 1}
                </div>
                <span className="text-xs font-semibold text-muted text-center w-20">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-[32px] border border-black/[0.1] shadow-xl p-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1A1A1A] uppercase tracking-widest px-1">Asset Image</label>
            <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all h-48 overflow-hidden relative ${imagePreview ? 'border-transparent' : 'border-black/10 hover:border-accent-pink/40 bg-black/[0.02] hover:bg-accent-pink/5'}`}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-3 text-muted">
                  <Upload className="w-8 h-8 opacity-40" />
                  <span className="text-sm font-medium">Click to upload image</span>
                  <span className="text-xs opacity-60">PNG, JPG, GIF up to 10MB</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1A1A1A] uppercase tracking-widest px-1">Asset Name</label>
            <input
              required value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              type="text" placeholder="e.g. MacBook Pro 2023"
              className="w-full px-6 py-4 rounded-2xl border border-black/10 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-medium"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1A1A1A] uppercase tracking-widest px-1">Description</label>
            <textarea
              required value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the asset — condition, serial number, etc."
              rows={3}
              className="w-full px-6 py-4 rounded-2xl border border-black/10 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-medium resize-none"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1A1A1A] uppercase tracking-widest px-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-6 py-4 rounded-2xl border border-black/10 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-medium"
            >
              {ASSET_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {/* Auto Carbon Score */}
          {formData.name.trim() && (
            <div className={`p-5 rounded-2xl border-2 ${carbon.tag === 'Green' ? 'border-green-200 bg-green-50' : carbon.tag === 'Neutral' ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Leaf className={`w-4 h-4 ${carbon.tag === 'Green' ? 'text-green-600' : carbon.tag === 'Neutral' ? 'text-amber-600' : 'text-red-600'}`} />
                <span className="text-sm font-bold text-[#1A1A1A]">Auto-Estimated Carbon Footprint</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-display">{carbon.score}</span>
                <span className="text-sm text-muted font-medium">kg CO₂e</span>
                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${carbon.tag === 'Green' ? 'bg-green-200 text-green-800' : carbon.tag === 'Neutral' ? 'bg-amber-200 text-amber-800' : 'bg-red-200 text-red-800'}`}>
                  {carbon.tag}
                </span>
              </div>
            </div>
          )}

          {/* Eco Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1A1A1A] uppercase tracking-widest px-1">Eco Notes <span className="text-muted font-normal normal-case">(optional)</span></label>
            <input
              value={formData.ecoNotes}
              onChange={(e) => setFormData({ ...formData, ecoNotes: e.target.value })}
              type="text" placeholder="e.g. Recycled packaging, energy efficient use"
              className="w-full px-6 py-4 rounded-2xl border border-black/10 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={isMinting || !address}
            className="w-full py-5 bg-[#1A1A1A] text-white rounded-full font-black text-lg hover:bg-black transition-transform active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isMinting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>
            ) : address ? (
              'Register Asset'
            ) : (
              'Connect Wallet to Register'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
