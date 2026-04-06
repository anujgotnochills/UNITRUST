'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { profileService } from '@/services/profileService';
import { ipfsService } from '@/services/ipfsService';
import { UploadDropzone } from '@/components/shared/UploadDropzone';
import { ROUTES } from '@/lib/constants';
import toast from 'react-hot-toast';

export default function UserSetupPage() {
  const router = useRouter();
  const { address } = useAccount();
  const [name, setName] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = (file: File) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!address) return;
    setLoading(true);
    try {
      let profilePic = '';
      if (image) {
        const result = await ipfsService.uploadFile(image);
        profilePic = result.gatewayUrl;
      }
      await profileService.createOrUpdateUser({ walletAddress: address, name, profilePic });
      toast.success('Profile saved!');
      router.push(ROUTES.USER_ASSETS);
    } catch (err) {
      toast.error('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (address) {
      profileService.createOrUpdateUser({ walletAddress: address }).catch(() => {});
    }
    router.push(ROUTES.USER_ASSETS);
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '480px' }}>
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1 className="page-title">Welcome! 👋</h1>
        <p className="page-subtitle">Set up your profile (optional)</p>
      </div>

      <div className="card card-elevated">
        <div className="form-group">
          <label className="form-label">Display Name</label>
          <input
            className="form-input"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <p className="form-hint">This is optional and can be changed later</p>
        </div>

        <div className="form-group">
          <label className="form-label">Profile Picture</label>
          <UploadDropzone onFile={handleFile} preview={preview} label="Upload profile picture" />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button className="btn btn-secondary" onClick={handleSkip} style={{ flex: 1 }}>
            Skip
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ flex: 1 }}>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
