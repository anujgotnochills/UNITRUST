'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { certificateService } from '@/services/certificateService';
import { CERTIFICATE_TYPES, SUSTAINABILITY_TAGS } from '@/lib/constants';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function NewRequestPage() {
  const router = useRouter();
  const { address } = useAccount();
  
  const [formData, setFormData] = useState({
    instituteWallet: '',
    studentName: '',
    title: '',
    course: '',
    issueDate: '',
    certificateType: CERTIFICATE_TYPES[0],
    carbonScore: 0,
    sustainabilityTag: SUSTAINABILITY_TAGS[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return toast.error('Please connect your wallet');

    setIsSubmitting(true);
    try {
      toast.loading('Sending request...', { id: 'req' });

      // Build payload for backend
      await certificateService.createRequest({
        instituteWallet: formData.instituteWallet,
        userWallet: address,
        certificateDetails: {
           studentName: formData.studentName,
           title: formData.title,
           course: formData.course,
           issueDate: formData.issueDate,
           certificateType: formData.certificateType,
           carbonScore: formData.carbonScore,
           sustainabilityTag: formData.sustainabilityTag
        }
      });

      toast.success('Certificate request sent to institute!', { id: 'req' });
      router.push('/dashboard/requests');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || 'Request failed', { id: 'req' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
     <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-4xl font-display font-black text-[#1A1A1A] tracking-tight">Request Certificate</h2>
        <p className="text-muted mt-2 text-lg">Send a verifiable credential request to an educational institution.</p>
      </div>
      
      <div className="bg-white rounded-[32px] border border-black/[0.1] shadow-xl p-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1A1A1A] uppercase tracking-widest px-1">Institute Wallet Address</label>
            <input 
              required
              value={formData.instituteWallet}
              onChange={(e) => setFormData({...formData, instituteWallet: e.target.value})}
              type="text" 
              className="w-full px-6 py-4 rounded-2xl border border-black/10 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-mono" 
              placeholder="0x..." 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1A1A1A] uppercase tracking-widest px-1">Student / Recipient Name</label>
            <input 
              required
              value={formData.studentName}
              onChange={(e) => setFormData({...formData, studentName: e.target.value})}
              type="text" 
              className="w-full px-6 py-4 rounded-2xl border border-black/10 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-medium" 
              placeholder="John Doe" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="block text-sm font-bold text-[#1A1A1A] uppercase tracking-widest px-1">Certificate Title</label>
               <input 
                 required
                 value={formData.title}
                 onChange={(e) => setFormData({...formData, title: e.target.value})}
                 type="text" 
                 className="w-full px-6 py-4 rounded-2xl border border-black/10 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-medium" 
                 placeholder="e.g. B.S. Computer Science" 
               />
             </div>
             <div className="space-y-2">
               <label className="block text-sm font-bold text-[#1A1A1A] uppercase tracking-widest px-1">Course / Major</label>
               <input 
                 required
                 value={formData.course}
                 onChange={(e) => setFormData({...formData, course: e.target.value})}
                 type="text" 
                 className="w-full px-6 py-4 rounded-2xl border border-black/10 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-medium" 
                 placeholder="Computer Science" 
               />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#1A1A1A] uppercase tracking-widest px-1">Issue Date</label>
              <input 
                 required
                 value={formData.issueDate}
                 onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                 type="date" 
                 className="w-full px-6 py-4 rounded-2xl border border-black/10 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-medium" 
               />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#1A1A1A] uppercase tracking-widest px-1">Certificate Type</label>
              <select 
                value={formData.certificateType}
                onChange={(e) => setFormData({...formData, certificateType: e.target.value as any})}
                className="w-full px-6 py-4 rounded-2xl border border-black/10 focus:ring-4 focus:ring-accent-pink/20 outline-none transition-all font-medium"
              >
                {CERTIFICATE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || !address}
            className="w-full py-5 bg-[#1A1A1A] text-white rounded-full font-black text-lg hover:bg-black transition-transform active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : address ? 'Send Request' : 'Connect Wallet to Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
