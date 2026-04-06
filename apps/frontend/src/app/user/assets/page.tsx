'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { assetService } from '@/services/assetService';
import { ipfsService } from '@/services/ipfsService';
import { QR_PREFIX_ASSET, ASSET_CATEGORIES, SUSTAINABILITY_TAGS, IPFS_GATEWAY } from '@/lib/constants';
import { UploadDropzone } from '@/components/shared/UploadDropzone';
import { QRCard } from '@/components/shared/QRCard';
import { QRScanner } from '@/components/shared/QRScanner';
import {
  TokenBadge, CarbonBadge, TxHashLink, LoadingState, EmptyState,
  StepIndicator, WalletAddress,
} from '@/components/shared';
import toast from 'react-hot-toast';

export default function UserAssetsPage() {
  const { address } = useAccount();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'grid' | 'register' | 'scanner'>('grid');

  // Registration form
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

  // Transfer
  const [transferModal, setTransferModal] = useState<{ tokenId: number; show: boolean }>({ tokenId: 0, show: false });
  const [transferTo, setTransferTo] = useState('');
  const [transferring, setTransferring] = useState(false);

  // QR Scanner
  const [scannedAsset, setScannedAsset] = useState<any>(null);

  // Metadata cache for image display
  const [metadataCache, setMetadataCache] = useState<Record<number, any>>({});

  const fetchAssets = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const result = await assetService.getAssetsByOwner(address);
      const fetchedAssets = result.assets || [];
      setAssets(fetchedAssets);

      // Fetch metadata for each asset to get images
      for (const asset of fetchedAssets) {
        if (asset.metadataURI && !metadataCache[asset.tokenId]) {
          try {
            const url = asset.metadataURI.replace('ipfs://', IPFS_GATEWAY);
            const res = await fetch(url);
            const meta = await res.json();
            setMetadataCache(prev => ({ ...prev, [asset.tokenId]: meta }));
          } catch { /* ignore */ }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Asset name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Mint via BACKEND (backend has MINTER_ROLE, signs the transaction)
  const handleRegister = async () => {
    if (!validateForm() || !address) return;
    setMinting(true);
    setMintResult(null);

    try {
      let imageResult = { ipfsUrl: '', gatewayUrl: '' };

      if (imageFile) {
        setMintStep(0);
        const res = await ipfsService.uploadFile(imageFile);
        imageResult = res;
      }

      setMintStep(1);
      const metadata = {
        name: formData.name,
        description: formData.description,
        image: imageResult.ipfsUrl || '',
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

      setMintStep(2);
      // Record to backend — in production the backend would mint via its wallet
      // For now we record off-chain and the user sees their asset immediately
      const recorded = await assetService.recordAsset({
        tokenId: Date.now(), // temporary ID until on-chain event syncs
        ownerWallet: address,
        metadataURI: metadataResult.metadataUri,
        txHash: '',
        carbonScore: formData.carbonScore,
        sustainabilityTag: formData.sustainabilityTag,
      });

      setMintStep(3);
      setMintResult({ ...recorded, imageUrl: imageResult.gatewayUrl, txHash: '' });
      toast.success('Asset registered! Metadata uploaded to IPFS ✅');
      setMinting(false);

      // Reset form
      setFormData({ name: '', description: '', category: 'Electronics', carbonScore: 0, sustainabilityTag: 'Green', ecoDescription: '' });
      setImageFile(null);
      setImagePreview('');
      fetchAssets();

    } catch (err: any) {
      toast.error(err?.response?.data?.error || err.message || 'Registration failed');
      setMinting(false);
    }
  };

  const handleTransfer = async (tokenId: number) => {
    if (!transferTo) { toast.error('Enter recipient address'); return; }
    setTransferring(true);
    try {
      await assetService.updateOwner(tokenId, transferTo, '');
      toast.success('Ownership transferred!');
      setTransferModal({ tokenId: 0, show: false });
      setTransferTo('');
      fetchAssets();
    } catch {
      toast.error('Transfer failed');
    } finally {
      setTransferring(false);
    }
  };

  const handleScan = async (tokenId: string) => {
    try {
      const data = await assetService.getAssetByTokenId(Number(tokenId));
      setScannedAsset(data);
      toast.success('Asset found!');
    } catch {
      toast.error('Asset not found');
      setScannedAsset(null);
    }
  };

  const getAssetImage = (asset: any) => {
    const meta = metadataCache[asset.tokenId];
    if (meta?.image) return meta.image.replace('ipfs://', IPFS_GATEWAY);
    return null;
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">My Assets</h1>
        <p className="page-subtitle">Register physical assets as NFTs and manage ownership</p>
      </div>

      <div className="tab-bar">
        <button className={`tab-item ${activeTab === 'grid' ? 'active' : ''}`} onClick={() => setActiveTab('grid')}>
          📦 My Assets {assets.length > 0 && `(${assets.length})`}
        </button>
        <button className={`tab-item ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')}>
          ➕ Register Asset
        </button>
        <button className={`tab-item ${activeTab === 'scanner' ? 'active' : ''}`} onClick={() => setActiveTab('scanner')}>
          📷 Scan QR
        </button>
      </div>

      {/* === GRID TAB === */}
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
              {assets.map((asset) => {
                const imageUrl = getAssetImage(asset);
                const meta = metadataCache[asset.tokenId];
                return (
                  <div key={asset.tokenId} className="card card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '4/3',
                        background: imageUrl ? `url(${imageUrl}) center/cover` : 'var(--bg-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                      }}
                    >
                      {!imageUrl && '📦'}
                    </div>
                    <div className="asset-card-body">
                      <h3 className="asset-card-name">{meta?.name || `Asset #${asset.tokenId}`}</h3>
                      {meta?.description && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                          {meta.description.slice(0, 80)}{meta.description.length > 80 ? '...' : ''}
                        </p>
                      )}
                      <div className="asset-card-meta">
                        <TokenBadge tokenId={asset.tokenId} />
                        <CarbonBadge tag={asset.sustainabilityTag || 'Green'} score={asset.carbonScore} />
                      </div>
                      <div className="asset-card-actions">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setTransferModal({ tokenId: asset.tokenId, show: true })}
                        >
                          🔄 Transfer
                        </button>
                        {asset.txHash && <TxHashLink hash={asset.txHash} label="View Tx" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* === REGISTER TAB === */}
      {activeTab === 'register' && (
        <div style={{ maxWidth: '560px' }}>
          {minting ? (
            <StepIndicator
              steps={4}
              current={mintStep}
              message={[
                'Uploading image to IPFS...',
                'Building metadata...',
                'Registering asset...',
                'Done!',
              ][mintStep]}
            />
          ) : mintResult ? (
            <div className="card card-elevated" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--success)' }}>Asset Registered!</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Metadata is stored on IPFS. Your asset is now in your portfolio.
              </p>
              <div style={{ marginBottom: '1.5rem' }}>
                <QRCard
                  data={`${QR_PREFIX_ASSET}${mintResult?.record?.tokenId || ''}`}
                  label="Asset QR Code"
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={() => { setMintResult(null); setActiveTab('grid'); }}
              >
                View My Assets
              </button>
            </div>
          ) : (
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem' }}>Register New Asset</h3>

              <div className="form-group">
                <label className="form-label">Asset Name *</label>
                <input
                  className="form-input"
                  placeholder="e.g., MacBook Pro M3"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {formErrors.name && <p className="form-error">{formErrors.name}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe your asset..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                {formErrors.description && <p className="form-error">{formErrors.description}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {ASSET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Asset Image</label>
                <UploadDropzone onFile={(f) => { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }} preview={imagePreview} label="Upload asset image" />
                <p className="form-hint">Optional — uploaded to IPFS</p>
              </div>

              <hr className="section-divider" />
              <h4 style={{ marginBottom: '1rem' }}>🌿 Carbon Tracking</h4>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Carbon Score (kg CO₂)</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.carbonScore}
                    onChange={(e) => setFormData({ ...formData, carbonScore: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sustainability Tag</label>
                  <select
                    className="form-select"
                    value={formData.sustainabilityTag}
                    onChange={(e) => setFormData({ ...formData, sustainabilityTag: e.target.value })}
                  >
                    {SUSTAINABILITY_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Eco Notes</label>
                <input
                  className="form-input"
                  placeholder="Optional sustainability notes..."
                  value={formData.ecoDescription}
                  onChange={(e) => setFormData({ ...formData, ecoDescription: e.target.value })}
                />
              </div>

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '0.5rem' }}
                onClick={handleRegister}
                disabled={minting}
              >
                🔗 Register Asset
              </button>
            </div>
          )}
        </div>
      )}

      {/* === SCANNER TAB === */}
      {activeTab === 'scanner' && (
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>📷 Asset QR Scanner</h3>
            <QRScanner
              prefix={QR_PREFIX_ASSET}
              onScan={handleScan}
              errorMessage="Invalid QR. Please scan a UniTrust asset QR code."
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

      {/* === TRANSFER MODAL === */}
      {transferModal.show && (
        <div className="modal-overlay" onClick={() => setTransferModal({ tokenId: 0, show: false })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">🔄 Transfer Ownership</h3>
            <p className="modal-body">
              Transfer Asset #{transferModal.tokenId} to a new owner. Enter their wallet address.
            </p>
            <div className="form-group">
              <label className="form-label">Recipient Wallet Address</label>
              <input
                className="form-input"
                placeholder="0x..."
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => { setTransferModal({ tokenId: 0, show: false }); setTransferTo(''); }}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleTransfer(transferModal.tokenId)}
                disabled={!transferTo || transferring}
              >
                {transferring ? 'Transferring...' : 'Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
