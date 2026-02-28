import { useCallback } from 'react';
import { Images } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import AssetBrowser from '../ui/AssetBrowser';
import type { Asset } from '../../types';

type AssetTab = 'assets';

export default function AssetPanel() {
  const handleDragStart = (e: React.DragEvent, image: string, name: string) => {
    e.dataTransfer.setData('application/visiongen-asset', JSON.stringify({ image, name }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDoubleClick = useCallback((asset: Asset) => {
    const { addImage2ImageNode } = useCanvasStore.getState();
    addImage2ImageNode(
      { x: 300 + Math.random() * 300, y: 200 + Math.random() * 300 },
      asset.thumbnail,
      asset.name,
    );
  }, []);

  const activeTab: AssetTab = 'assets';

  const tabClass = (tab: AssetTab) =>
    `flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium border-b-2 transition-colors ${
      activeTab === tab
        ? 'border-accent text-accent'
        : 'border-transparent text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark'
    }`;

  return (
    <div className="w-64 h-full flex flex-col
      bg-panel-bg dark:bg-panel-bg-dark
      border-r border-border dark:border-border-dark">
      {/* Tab bar */}
      <div className="flex border-b border-border dark:border-border-dark bg-panel-bg dark:bg-panel-bg-dark">
        <button className={tabClass('assets')}>
          <Images size={12} />
          素材库
        </button>
      </div>

      {/* Asset browser */}
      <div className="flex-1 overflow-y-auto p-3">
        <AssetBrowser
          onSelect={handleDoubleClick}
          onDragStart={handleDragStart}
          columns={2}
        />
      </div>
    </div>
  );
}
