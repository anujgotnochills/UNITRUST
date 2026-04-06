import { api } from './api';

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
