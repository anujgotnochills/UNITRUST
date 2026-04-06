import { api } from './api';

export const certificateService = {
  async recordCertificate(data: {
    tokenId: number;
    issuerWallet: string;
    holderWallet: string;
    metadataURI: string;
    txHash: string;
    carbonScore?: number;
  }) {
    const res = await api.post('/certificates/record', data);
    return res.data;
  },

  async getCertificateByTokenId(tokenId: number) {
    const res = await api.get(`/certificates/${tokenId}`);
    return res.data;
  },

  async getCertificatesByHolder(wallet: string) {
    const res = await api.get(`/certificates/holder/${wallet}`);
    return res.data;
  },

  async getCertificatesByIssuer(wallet: string) {
    const res = await api.get(`/certificates/issuer/${wallet}`);
    return res.data;
  },

  // Request flow
  async createRequest(data: {
    instituteWallet: string;
    userWallet: string;
    certificateDetails: any;
  }) {
    const res = await api.post('/requests/create', data);
    return res.data;
  },

  async acceptRequest(requestId: string) {
    const res = await api.put(`/requests/${requestId}/accept`);
    return res.data;
  },

  async rejectRequest(requestId: string) {
    const res = await api.put(`/requests/${requestId}/reject`);
    return res.data;
  },

  async markMinted(requestId: string, data: { tokenId: number; txHash: string }) {
    const res = await api.put(`/requests/${requestId}/minted`, data);
    return res.data;
  },

  async getRequestsByUser(wallet: string) {
    const res = await api.get(`/requests/user/${wallet}`);
    return res.data;
  },

  async getRequestsByInstitute(wallet: string) {
    const res = await api.get(`/requests/institute/${wallet}`);
    return res.data;
  },

  // Hidden
  async hideCertificate(walletAddress: string, tokenId: number) {
    const res = await api.post('/hidden/hide', { walletAddress, tokenId });
    return res.data;
  },

  async getHiddenCertificates(wallet: string) {
    const res = await api.get(`/hidden/${wallet}`);
    return res.data;
  },
};
