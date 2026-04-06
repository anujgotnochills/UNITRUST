import { create } from 'zustand';

interface AssetState {
  assets: any[];
  loading: boolean;
  setAssets: (assets: any[]) => void;
  setLoading: (loading: boolean) => void;
  addAsset: (asset: any) => void;
  removeAsset: (tokenId: number) => void;
}

export const useAssetStore = create<AssetState>()((set) => ({
  assets: [],
  loading: false,
  setAssets: (assets) => set({ assets }),
  setLoading: (loading) => set({ loading }),
  addAsset: (asset) => set((state) => ({ assets: [asset, ...state.assets] })),
  removeAsset: (tokenId) => set((state) => ({ assets: state.assets.filter((a) => a.tokenId !== tokenId) })),
}));
