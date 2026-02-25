import { useState } from 'react';
import {
  User,
  Sword,
  Mountain,
  Shirt,
  Film,
  Search,
  GripVertical,
} from 'lucide-react';
import { useAssetStore } from '../../stores/assetStore';
import { useCanvasStore } from '../../stores/canvasStore';
import type { AssetCategory } from '../../types';

const CATEGORIES: { label: string; value: AssetCategory | 'all'; icon: React.ReactNode }[] = [
  { label: '全部', value: 'all', icon: null },
  { label: '人物', value: 'character', icon: <User size={14} /> },
  { label: '道具', value: 'prop', icon: <Sword size={14} /> },
  { label: '场景', value: 'scene', icon: <Mountain size={14} /> },
  { label: '服装', value: 'costume', icon: <Shirt size={14} /> },
  { label: '分镜', value: 'storyboard', icon: <Film size={14} /> },
];

export default function AssetPanel() {
  const { selectedCategory, setSelectedCategory, getFilteredAssets } = useAssetStore();
  const { addImageNode } = useCanvasStore();
  const [searchQuery, setSearchQuery] = useState('');

  const assets = getFilteredAssets().filter(
    (a) => !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDragStart = (e: React.DragEvent, image: string, name: string) => {
    e.dataTransfer.setData('application/instavideo-asset', JSON.stringify({ image, name }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDoubleClick = (image: string, name: string) => {
    addImageNode(
      { x: 300 + Math.random() * 300, y: 200 + Math.random() * 300 },
      image,
      name,
    );
  };

  return (
    <div className="w-64 h-full flex flex-col
      bg-panel-bg dark:bg-panel-bg-dark
      border-r border-border dark:border-border-dark">
      {/* Header */}
      <div className="px-3 py-3 border-b border-border dark:border-border-dark">
        <h2 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark mb-2">
          资产库
        </h2>
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
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-border dark:border-border-dark">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors
              ${selectedCategory === cat.value
                ? 'bg-accent text-white'
                : 'bg-canvas-bg dark:bg-canvas-bg-dark text-text-secondary dark:text-text-secondary-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark'
              }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Asset list */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-2 gap-2">
          {assets.map((asset) => (
            <div
              key={asset.id}
              draggable
              onDragStart={(e) => handleDragStart(e, asset.thumbnail, asset.name)}
              onDoubleClick={() => handleDoubleClick(asset.thumbnail, asset.name)}
              className="group relative rounded-lg overflow-hidden cursor-grab active:cursor-grabbing
                border border-border dark:border-border-dark
                hover:border-accent transition-colors"
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
                bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-[10px] text-white truncate">{asset.name}</p>
              </div>
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical size={12} className="text-white drop-shadow" />
              </div>
            </div>
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
