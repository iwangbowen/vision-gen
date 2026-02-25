import { useState } from 'react';
import {
  User,
  Sword,
  Mountain,
  Shirt,
  Film,
  Search,
} from 'lucide-react';
import { useAssetStore } from '../../stores/assetStore';
import type { Asset, AssetCategory } from '../../types';

const CATEGORIES: { label: string; value: AssetCategory | 'all'; icon: React.ReactNode }[] = [
  { label: '全部', value: 'all', icon: null },
  { label: '人物', value: 'character', icon: <User size={14} /> },
  { label: '道具', value: 'prop', icon: <Sword size={14} /> },
  { label: '场景', value: 'scene', icon: <Mountain size={14} /> },
  { label: '服装', value: 'costume', icon: <Shirt size={14} /> },
  { label: '分镜', value: 'storyboard', icon: <Film size={14} /> },
];

interface AssetBrowserProps {
  onSelect?: (asset: Asset) => void;
  onDragStart?: (e: React.DragEvent, image: string, name: string) => void;
  columns?: number;
}

export default function AssetBrowser({ onSelect, onDragStart, columns = 3 }: AssetBrowserProps) {
  const { selectedCategory, setSelectedCategory, getFilteredAssets } = useAssetStore();
  const [searchQuery, setSearchQuery] = useState('');

  const assets = getFilteredAssets().filter(
    (a) => !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary dark:text-text-secondary-dark" />
        <input
          type="text"
          placeholder="搜索资产..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 rounded-md text-xs
            bg-canvas-bg dark:bg-canvas-bg-dark
            text-text-primary dark:text-text-primary-dark
            border border-border dark:border-border-dark
            focus:outline-none focus:border-accent
            placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark"
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors
              ${selectedCategory === cat.value
                ? 'bg-accent text-white dark:text-black'
                : 'bg-canvas-bg dark:bg-canvas-bg-dark text-text-secondary dark:text-text-secondary-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark'
              }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Asset grid */}
      <div className="flex-1 overflow-y-auto">
        <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {assets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              draggable={!!onDragStart}
              onDragStart={(e) => onDragStart?.(e, asset.thumbnail, asset.name)}
              onClick={() => onSelect?.(asset)}
              className="group relative rounded-lg overflow-hidden
                border border-border dark:border-border-dark
                hover:border-accent transition-colors text-left"
            >
              <div className="aspect-square bg-canvas-bg dark:bg-canvas-bg-dark">
                <img
                  src={asset.thumbnail}
                  alt={asset.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1
                bg-linear-to-t from-black/60 to-transparent">
                <p className="text-[10px] text-white truncate">{asset.name}</p>
              </div>
            </button>
          ))}
        </div>
        {assets.length === 0 && (
          <p className="text-xs text-text-secondary dark:text-text-secondary-dark text-center mt-8">
            暂无资产
          </p>
        )}
      </div>
    </div>
  );
}
