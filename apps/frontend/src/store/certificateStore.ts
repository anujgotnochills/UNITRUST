import { create } from 'zustand';

interface CertificateState {
  certificates: any[];
  pendingRequests: any[];
  loading: boolean;
  setCertificates: (certificates: any[]) => void;
  setPendingRequests: (requests: any[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useCertificateStore = create<CertificateState>()((set) => ({
  certificates: [],
  pendingRequests: [],
  loading: false,
  setCertificates: (certificates) => set({ certificates }),
  setPendingRequests: (requests) => set({ pendingRequests: requests }),
  setLoading: (loading) => set({ loading }),
}));
