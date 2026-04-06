'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { assetService } from '@/services/assetService';
import { ipfsService } from '@/services/ipfsService';
import { PRODUCT_NFT_ADDRESS, PRODUCT_NFT_ABI } from '@/lib/contracts';
import { QR_PREFIX_ASSET, ASSET_CATEGORIES, SUSTAINABILITY_TAGS, IPFS_GATEWAY } from '@/lib/constants';
import { UploadDropzone } from '@/components/shared/UploadDropzone';
import { QRCard } from '@/components/shared/QRCard';
import { QRScanner } from '@/components/shared/QRScanner';
import {
  TokenBadge, CarbonBadge, TxHashLink, LoadingState, EmptyState,
  StepIndicator, WalletAddress, VerifiedBadge, ConfirmModal,
} from '@/components/shared';
import toast from 'react-hot-toast';

export default function UserAssetsPage() {
  const { address } = useAccount();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'grid' | 'register' | 'scanner'>('grid');

  // Registration form state
  const [formData, setFormData] = useState({
    name: '', description: '', category: 'Electronics',
    carbonScore: 0, sustainabilityTag: 'Green', ecoDescription: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [minting, setMinting] = useState(false);
  const [mintStep, setMintStep] = useState(0);
  const [mintResult, setMintResult] = useState<any>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Transfer state
  const [transferModal, setTransferModal] = useState<{ tokenId: number; show: boolean }>({ tokenId: 0, show: false });
  const [transferTo, setTransferTo] = useState('');
  const [transferring, setTransferring] = useState(false);

  // Scanner state
  const [scannedAsset, setScannedAsset] = useState<any>(null);

  const { writeContract, data: txHash } = useWriteContract();
  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (address) fetchAssets();
  }, [address]);

  const fetchAssets = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const result = await assetService.getAssetsByOwner(address);
      setAssets(result.assets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageFile = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Asset name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!imageFile) errors.image = 'Image is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm() || !address || !imageFile) return;
    setMinting(true);
    setMintResult(null);

    try {
      // Step 1: Upload image
      setMintStep(0);
      const imageResult = await ipfsService.uploadFile(imageFile);

      // Step 2: Build & upload metadata
      setMintStep(1);
      const metadata = {
        name: formData.name,
        description: formData.description,
        image: imageResult.ipfsUrl,
        attributes: [
          { trait_type: 'Category', value: formData.category },
          { trait_type: 'Carbon Score', value: formData.carbonScore },
          { trait_type: 'Sustainability Tag', value: formData.sustainabilityTag },
          { trait_type: 'Eco Description', value: formData.ecoDescription },
          { trait_type: 'Original Owner', value: address },
          { trait_type: 'Registered On', value: new Date().toISOString() },
        ],
      };
      const metadataResult = await ipfsService.uploadMetadata(metadata);

      // Step 3: Mint on-chain
      setMintStep(2);
      writeContract({
        address: PRODUCT_NFT_ADDRESS,
        abi: PRODUCT_NFT_ABI,
        functionName: 'mintAsset',
        args: [address, metadataResult.metadataUri],
      });

      // Note: We'll handle the tx confirmation in a useEffect
      setMintResult({
        metadataUri: metadataResult.metadataUri,
        imageUrl: imageResult.gatewayUrl,
        pending: true,
      });

    } catch (err: any) {
      toast.error(err.message || 'Minting failed');
      setMinting(false);
    }
  };

  useEffect(() => {
    if (txConfirmed && txHash && mintResult?.pending) {
      setMintStep(3);
      setMintResult((prev: any) => ({ ...prev, txHash, pending: false }));
      toast.success('Asset minted successfully!');
      setMinting(false);
      fetchAssets();
      // Reset form
      setFormData({ name: '', description: '', category: 'Electronics', carbonScore: 0, sustainabilityTag: 'Green', ecoDescription: '' });
      setImageFile(null);
      setImagePreview('');
    }
  }, [txConfirmed, txHash]);

  const handleTransfer = async (tokenId: number) => {
    if (!address || !transferTo) return;
    setTransferring(true);
    try {
      writeContract({
        address: PRODUCT_NFT_ADDRESS,
        abi: PRODUCT_NFT_ABI,
        functionName: 'transferFrom',
        args: [address as `0x${string}`, transferTo as `0x${string}`, BigInt(tokenId)],
      });
      toast.success('Transfer initiated!');
      setTransferModal({ tokenId: 0, show: false });
      setTransferTo('');
      setTimeout(fetchAssets, 3000);
    } catch (err: any) {
      toast.error('Transfer failed');
    } finally {
      setTransferring(false);
    }
  };

  const handleScan = async (tokenId: string) => {
    try {
      const data = await assetService.getAssetByTokenId(Number(tokenId));
      setScannedAsset(data);
    } catch {
      toast.error('Asset not found');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">My Assets</h1>
        <p className="page-subtitle">Manage your registered asset NFTs</p>
      </div>

      {/* Sub-tabs */}
      <div className="tab-bar">
        <button className={`tab-item ${activeTab === 'grid' ? 'active' : ''}`} onClick={() => setActiveTab('grid')}>
          📦 My Assets
        </button>
        <button className={`tab-item ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')}>
          ➕ Register Asset
        </button>
        <button className={`tab-item ${activeTab === 'scanner' ? 'active' : ''}`} onClick={() => setActiveTab('scanner')}>
          📷 Scan QR
        </button>
      </div>

      {/* Grid Tab */}
      {activeTab === 'grid' && (
        <>
          {loading ? (
            <LoadingState message="Loading your assets..." />
          ) : assets.length === 0 ? (
            <EmptyState
              icon="📦"
              title="No assets yet"
              description="Register your first physical asset as an NFT to get started."
              action={<button className="btn btn-primary" onClick={() => setActiveTab('register')}>Register Asset</button>}
            />
          ) : (
            <div className="grid-auto">
              {assets.map((asset) => (
                <div key={asset.tokenId} className="card card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
                  <div
                    className="asset-card-image"
                    style={{
                      backgroundImage: asset.metadataURI ? `url(${IPFS_GATEWAY}${asset.metadataURI.replace('ipfs://', '')})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: 'var(--surface-2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '2rem', color: 'var(--text-muted)',
                    }}
                  >
                    {!asset.metadataURI && '📦'}
                  </div>
                  <div className="asset-card-body">
                    <h3 className="asset-card-name">{asset.tokenId ? `Asset #${asset.tokenId}` : 'Asset'}</h3>
                    <div className="asset-card-meta">
                      <TokenBadge tokenId={asset.tokenId} />
                      <CarbonBadge tag={asset.sustainabilityTag || 'Green'} score={asset.carbonScore} />
                    </div>
                    <div className="asset-card-actions">
                      <button className="btn btn-sm btn-secondary" onClick={() => setTransferModal({ tokenId: asset.tokenId, show: true })}>
                        Transfer
                      </button>
                      {asset.txHash && <TxHashLink hash={asset.txHash} label="View Tx" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Register Tab */}
      {activeTab === 'register' && (
        <div style={{ maxWidth: '560px' }}>
          {minting ? (
            <StepIndicator
              steps={4}
              current={mintStep}
              message={['Uploading image to IPFS...', 'Building metadata...', 'Minting on Polygon...', 'Confirming transaction...'][mintStep]}
            />
          ) : mintResult && !mintResult.pending ? (
            <div className="card card-elevated" style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--success)' }}>✅ Asset Minted!</h3>
              {mintResult.txHash && <TxHashLink hash={mintResult.txHash} label="View on PolygonScan" />}
              <div style={{ marginTop: '1rem' }}>
                <QRCard data={`${QR_PREFIX_ASSET}${assets[0]?.tokenId || 1}`} label="Asset QR Code" />
              </div>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => { setMintResult(null); setActiveTab('grid'); }}>
                View My Assets
              </button>
            </div>
          ) : (
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem' }}>Register New Asset</h3>

              <div className="form-group">
                <label className="form-label">Asset Name *</label>
                <input className="form-input" placeholder="e.g., MacBook Pro M3" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                {formErrors.name && <p className="form-error">{formErrors.name}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-textarea" placeholder="Describe your asset..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                {formErrors.description && <p className="form-error">{formErrors.description}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  {ASSET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Asset Image *</label>
                <UploadDropzone onFile={handleImageFile} preview={imagePreview} label="Upload asset image" />
                {formErrors.image && <p className="form-error">{formErrors.image}</p>}
              </div>

              <hr className="section-divider" />
              <h4 style={{ marginBottom: '1rem' }}>🌿 Carbon Tracking</h4>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Carbon Score (kg CO₂)</label>
                  <input className="form-input" type="number" step="0.01" min="0" value={formData.carbonScore} onChange={(e) => setFormData({ ...formData, carbonScore: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Sustainability Tag</label>
                  <select className="form-select" value={formData.sustainabilityTag} onChange={(e) => setFormData({ ...formData, sustainabilityTag: e.target.value })}>
                    {SUSTAINABILITY_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Eco Description</label>
                <input className="form-input" placeholder="Optional sustainability notes" value={formData.ecoDescription} onChange={(e) => setFormData({ ...formData, ecoDescription: e.target.value })} />
              </div>

              <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }} onClick={handleRegister}>
                🔗 Register Asset as NFT
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scanner Tab */}
      {activeTab === 'scanner' && (
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>📷 Asset QR Scanner</h3>
            <QRScanner
              prefix={QR_PREFIX_ASSET}
              onScan={handleScan}
              errorMessage="Invalid QR. Please scan an asset QR code."
            />
          </div>

          {scannedAsset && (
            <div className="card" style={{ marginTop: '1rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Asset Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div><strong>Token ID:</strong> <TokenBadge tokenId={scannedAsset.tokenId} /></div>
                <div><strong>Owner:</strong> <WalletAddress address={scannedAsset.ownerWallet} /></div>
                <div><strong>Carbon:</strong> <CarbonBadge tag={scannedAsset.sustainabilityTag || 'Green'} score={scannedAsset.carbonScore} /></div>
                {scannedAsset.txHash && <div><strong>Tx:</strong> <TxHashLink hash={scannedAsset.txHash} /></div>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transfer Modal */}
      <ConfirmModal
        isOpen={transferModal.show}
        title="Transfer Ownership"
        message={`Transfer Asset #${transferModal.tokenId} to a new owner. This action cannot be undone.`}
        confirmLabel={transferring ? 'Transferring...' : 'Transfer'}
        onConfirm={() => handleTransfer(transferModal.tokenId)}
        onCancel={() => setTransferModal({ tokenId: 0, show: false })}
      />
      {transferModal.show && (
        <div className="modal-overlay" onClick={() => setTransferModal({ tokenId: 0, show: false })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">🔄 Transfer Ownership</h3>
            <p className="modal-body">Enter the wallet address of the new owner for Asset #{transferModal.tokenId}.</p>
            <div className="form-group">
              <label className="form-label">Recipient Wallet Address</label>
              <input className="form-input" placeholder="0x..." value={transferTo} onChange={(e) => setTransferTo(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setTransferModal({ tokenId: 0, show: false })}>Cancel</button>
              <button className="btn btn-primary" onClick={() => handleTransfer(transferModal.tokenId)} disabled={!transferTo || transferring}>
                {transferring ? 'Transferring...' : 'Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
