import { create } from 'zustand';

interface ProfileState {
  userProfile: any | null;
  instituteProfile: any | null;
  setUserProfile: (profile: any) => void;
  setInstituteProfile: (profile: any) => void;
  clearProfiles: () => void;
}

export const useProfileStore = create<ProfileState>()((set) => ({
  userProfile: null,
  instituteProfile: null,
  setUserProfile: (profile) => set({ userProfile: profile }),
  setInstituteProfile: (profile) => set({ instituteProfile: profile }),
  clearProfiles: () => set({ userProfile: null, instituteProfile: null }),
}));
