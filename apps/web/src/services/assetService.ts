import { api } from './api';
import { BACKEND_URL } from '@/lib/constants';

export const assetService = {
  async recordAsset(data: {
    tokenId: number;
    ownerWallet: string;
    metadataURI: string;
    txHash: string;
    assetName: string;
    category: string;
  }) {
    const res = await api.post('/assets/record', data);
    return res.data;
  },

  async getAssetByTokenId(tokenId: number) {
    const res = await api.get(`/assets/${tokenId}`);
    return res.data;
  },

  async getAssetsByOwner(wallet: string) {
    const res = await api.get(`/assets/owner/${wallet}`);
    return res.data;
  },

  async updateOwner(tokenId: number, newOwnerWallet: string, txHash: string) {
    const res = await api.put(`/assets/${tokenId}/transfer`, { newOwnerWallet, txHash });
    return res.data;
  },
};

export async function fetchIpfsMetadata(metadataURI: string): Promise<any> {
  if (!metadataURI) return null;
  try {
    const url = metadataURI.startsWith('ipfs://')
      ? `${BACKEND_URL.replace('/api', '')}/api/ipfs/gateway?cid=${metadataURI.replace('ipfs://', '')}`
      : metadataURI;
    // Try Pinata gateway directly
    const pinataUrl = metadataURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
    const res = await fetch(pinataUrl);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
