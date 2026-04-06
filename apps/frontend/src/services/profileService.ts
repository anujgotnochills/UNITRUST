import { api } from './api';

export const profileService = {
  async createOrUpdateUser(data: { walletAddress: string; name?: string; profilePic?: string }) {
    const res = await api.post('/profiles/user', data);
    return res.data;
  },

  async getUserProfile(wallet: string) {
    const res = await api.get(`/profiles/user/${wallet}`);
    return res.data;
  },

  async createOrUpdateInstitute(data: { walletAddress: string; instituteName: string; logo?: string }) {
    const res = await api.post('/profiles/institute', data);
    return res.data;
  },

  async getInstituteProfile(wallet: string) {
    const res = await api.get(`/profiles/institute/${wallet}`);
    return res.data;
  },
};
