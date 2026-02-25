import { create } from 'zustand';
import type { Asset, AssetCategory } from '../types';
import { SAMPLE_ASSETS } from '../utils/sampleData';

interface AssetState {
  assets: Asset[];
  selectedCategory: AssetCategory | 'all';

  setSelectedCategory: (cat: AssetCategory | 'all') => void;
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt'>) => void;
  removeAsset: (id: string) => void;
  getFilteredAssets: () => Asset[];
}

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: SAMPLE_ASSETS,
  selectedCategory: 'all',

  setSelectedCategory: (cat) => set({ selectedCategory: cat }),

  addAsset: (asset) => {
    const newAsset: Asset = {
      ...asset,
      id: `asset_${Date.now()}`,
      createdAt: Date.now(),
    };
    set((state) => ({ assets: [newAsset, ...state.assets] }));
  },

  removeAsset: (id) =>
    set((state) => ({ assets: state.assets.filter((a) => a.id !== id) })),

  getFilteredAssets: () => {
    const { assets, selectedCategory } = get();
    if (selectedCategory === 'all') return assets;
    return assets.filter((a) => a.category === selectedCategory);
  },
}));
