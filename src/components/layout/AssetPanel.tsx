import { useCallback } from 'react';
import { useCanvasStore } from '../../stores/canvasStore';
import AssetBrowser from '../ui/AssetBrowser';
import type { Asset } from '../../types';

export default function AssetPanel() {
  const handleDragStart = (e: React.DragEvent, image: string, name: string) => {
    e.dataTransfer.setData('application/instavideo-asset', JSON.stringify({ image, name }));
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

  return (
    <div className="w-64 h-full flex flex-col
      bg-panel-bg dark:bg-panel-bg-dark
      border-r border-border dark:border-border-dark">
      {/* Header */}
      <div className="px-3 py-3 border-b border-border dark:border-border-dark">
        <h2 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
          资产库
        </h2>
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
