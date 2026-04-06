'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { profileService } from '@/services/profileService';
import { ipfsService } from '@/services/ipfsService';
import { UploadDropzone } from '@/components/shared/UploadDropzone';
import { ROUTES } from '@/lib/constants';
import toast from 'react-hot-toast';

export default function InstituteSetupPage() {
  const router = useRouter();
  const { address } = useAccount();
  const [instituteName, setInstituteName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogo = (file: File) => {
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!address) return;
    if (!instituteName.trim()) {
      setError('Institute name is required');
      return;
    }
    setError('');
    setLoading(true);

    try {
      let logo = '';
      if (logoFile) {
        const result = await ipfsService.uploadFile(logoFile);
        logo = result.gatewayUrl;
      }
      await profileService.createOrUpdateInstitute({ walletAddress: address, instituteName, logo });
      toast.success('Institute profile created!');
      router.push(ROUTES.INSTITUTE_AWARD);
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '480px' }}>
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1 className="page-title">Institute Setup 🏫</h1>
        <p className="page-subtitle">Set up your institute profile to start issuing certificates</p>
      </div>

      <div className="card card-elevated">
        <div className="form-group">
          <label className="form-label">Institute Name *</label>
          <input
            className="form-input"
            placeholder="e.g., IIT Delhi"
            value={instituteName}
            onChange={(e) => { setInstituteName(e.target.value); setError(''); }}
          />
          {error && <p className="form-error">{error}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Institute Logo</label>
          <UploadDropzone onFile={handleLogo} preview={logoPreview} label="Upload logo (optional)" />
          <p className="form-hint">A default logo will be used if you skip this</p>
        </div>

        <button
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginTop: '0.5rem' }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Create Institute Profile'}
        </button>
      </div>
    </div>
  );
}
