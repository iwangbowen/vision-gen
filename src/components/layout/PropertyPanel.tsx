import {
  Expand,
  Crop,
  Paintbrush,
  Camera,
  Sun,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { useAssetStore } from '../../stores/assetStore';
import type { AssetCategory } from '../../types';
import { useState } from 'react';

const ASSET_CATEGORIES: { label: string; value: AssetCategory }[] = [
  { label: '人物', value: 'character' },
  { label: '道具', value: 'prop' },
  { label: '场景', value: 'scene' },
  { label: '服装', value: 'costume' },
  { label: '分镜', value: 'storyboard' },
];

export default function PropertyPanel() {
  const { nodes, selectedNodeId, removeNode, setSelectedNodeId } = useCanvasStore();
  const { addAsset } = useAssetStore();
  const [saveCategory, setSaveCategory] = useState<AssetCategory>('scene');
  const [saveName, setSaveName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="w-72 h-full flex flex-col items-center justify-center
        bg-panel-bg dark:bg-panel-bg-dark
        border-l border-border dark:border-border-dark">
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
          选择一个节点查看属性
        </p>
      </div>
    );
  }

  // Get image from node depending on type
  const getNodeImage = (): string | undefined => {
    const data = selectedNode.data as Record<string, unknown>;
    return (data.generatedImage as string) || (data.image as string) || (data.sourceImage as string);
  };

  const nodeImage = getNodeImage();

  const handleSaveAsAsset = () => {
    if (!nodeImage || !saveName.trim()) return;
    addAsset({
      name: saveName.trim(),
      category: saveCategory,
      thumbnail: nodeImage,
    });
    setShowSaveForm(false);
    setSaveName('');
  };

  return (
    <div className="w-72 h-full flex flex-col
      bg-panel-bg dark:bg-panel-bg-dark
      border-l border-border dark:border-border-dark">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border dark:border-border-dark
        flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
          节点属性
        </h2>
        <button
          onClick={() => setSelectedNodeId(null)}
          className="p-1 rounded hover:bg-surface-hover dark:hover:bg-surface-hover-dark
            text-text-secondary dark:text-text-secondary-dark"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Node info */}
        <div className="px-4 py-3 border-b border-border dark:border-border-dark">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase
              bg-accent/10 text-accent">
              {selectedNode.type}
            </span>
            <span className="text-xs text-text-secondary dark:text-text-secondary-dark">
              {selectedNode.id}
            </span>
          </div>
          <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
            {(selectedNode.data as { label: string }).label}
          </p>
        </div>

        {/* Image preview */}
        {nodeImage && (
          <div className="px-4 py-3 border-b border-border dark:border-border-dark">
            <p className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
              预览
            </p>
            <div className="rounded-lg overflow-hidden border border-border dark:border-border-dark">
              <img
                src={nodeImage}
                alt="preview"
                className="w-full aspect-square object-cover"
              />
            </div>
          </div>
        )}

        {/* Edit tools */}
        {nodeImage && (
          <div className="px-4 py-3 border-b border-border dark:border-border-dark">
            <p className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
              编辑工具
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { icon: <Expand size={14} />, label: '扩图', action: 'outpaint' },
                { icon: <Crop size={14} />, label: '裁剪', action: 'crop' },
                { icon: <Paintbrush size={14} />, label: '重绘', action: 'repaint' },
                { icon: <Paintbrush size={14} />, label: '局部重绘', action: 'inpaint' },
                { icon: <Camera size={14} />, label: '镜头角度', action: 'camera' },
                { icon: <Sun size={14} />, label: '灯光色调', action: 'lighting' },
              ].map((tool) => (
                <button
                  key={tool.action}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors
                    bg-canvas-bg dark:bg-canvas-bg-dark
                    text-text-primary dark:text-text-primary-dark
                    hover:bg-accent/10 hover:text-accent
                    border border-border dark:border-border-dark"
                  title={`${tool.label}（功能待接入）`}
                >
                  {tool.icon}
                  {tool.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Save as asset */}
        {nodeImage && (
          <div className="px-4 py-3 border-b border-border dark:border-border-dark">
            {!showSaveForm ? (
              <button
                onClick={() => setShowSaveForm(true)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                  bg-accent text-white dark:text-black hover:bg-accent-hover transition-colors"
              >
                <Save size={14} />
                保存为资产
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="资产名称..."
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md text-xs
                    bg-canvas-bg dark:bg-canvas-bg-dark
                    text-text-primary dark:text-text-primary-dark
                    border border-border dark:border-border-dark
                    focus:outline-none focus:border-accent"
                />
                <select
                  value={saveCategory}
                  onChange={(e) => setSaveCategory(e.target.value as AssetCategory)}
                  className="w-full px-3 py-1.5 rounded-md text-xs
                    bg-canvas-bg dark:bg-canvas-bg-dark
                    text-text-primary dark:text-text-primary-dark
                    border border-border dark:border-border-dark"
                >
                  {ASSET_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <div className="flex gap-1.5">
                  <button
                    onClick={handleSaveAsAsset}
                    className="flex-1 px-3 py-1.5 rounded-md text-xs font-medium
                      bg-accent text-white dark:text-black hover:bg-accent-hover transition-colors"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setShowSaveForm(false)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium
                      bg-canvas-bg dark:bg-canvas-bg-dark
                      text-text-secondary dark:text-text-secondary-dark
                      hover:bg-surface-hover dark:hover:bg-surface-hover-dark
                      border border-border dark:border-border-dark"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Position info */}
        <div className="px-4 py-3 border-b border-border dark:border-border-dark">
          <p className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
            位置
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-text-primary dark:text-text-primary-dark">
            <div>
              <span className="text-text-secondary dark:text-text-secondary-dark">X: </span>
              {Math.round(selectedNode.position.x)}
            </div>
            <div>
              <span className="text-text-secondary dark:text-text-secondary-dark">Y: </span>
              {Math.round(selectedNode.position.y)}
            </div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-4 py-3 border-t border-border dark:border-border-dark">
        <button
          onClick={() => {
            removeNode(selectedNode.id);
            setSelectedNodeId(null);
          }}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
            bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
        >
          <Trash2 size={14} />
          删除节点
        </button>
      </div>
    </div>
  );
}
