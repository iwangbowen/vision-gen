import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ImageIcon, Sparkles, Loader2, Settings2, Upload, Library } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import AssetPickerDialog from '../ui/AssetPickerDialog';
import ImageContextMenu from '../ui/ImageContextMenu';
import type { Image2ImageData } from '../../types';
import { IMAGE_STYLE_OPTIONS } from '../../utils/constants';

function Image2ImageNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as Image2ImageData;
  const { updateNodeData, simulateGenerate, setSelectedNodeId, setRightPanelOpen } = useCanvasStore();

  const [localPrompt, setLocalPrompt] = useState(nodeData.prompt || '');
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [localPrompt]);

  const handleGenerate = () => {
    updateNodeData(id, { prompt: localPrompt });
    simulateGenerate(id);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        updateNodeData(id, { sourceImage: result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="node-card w-56 rounded-xl border-2 overflow-hidden bg-node-bg dark:bg-node-bg-dark border-node-border dark:border-node-border-dark shadow-lg">
      {/* Header - icon only */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark">
        <div className="flex items-center gap-1.5">
          <ImageIcon size={12} className="text-emerald-500" />
          {nodeData.status === 'generating' && (
            <Loader2 size={10} className="animate-spin text-emerald-500" />
          )}
        </div>
        <button
          type="button"
          className="p-0.5 rounded hover:bg-surface-hover dark:hover:bg-surface-hover-dark text-text-secondary dark:text-text-secondary-dark"
          onClick={() => {
            setSelectedNodeId(id);
            setRightPanelOpen(true);
          }}
          title="设置"
        >
          <Settings2 size={10} />
        </button>
      </div>

      {/* Body */}
      <div className="p-2 space-y-2">
        {/* Source image */}
        {nodeData.sourceImage ? (
          <ImageContextMenu
            image={nodeData.sourceImage}
            sourceNodeId={id}
            label={nodeData.label || '参考图'}
            className="w-full rounded-lg overflow-hidden border border-border dark:border-border-dark bg-canvas-bg dark:bg-canvas-bg-dark relative group"
          >
            <img src={nodeData.sourceImage} alt="source" className="w-full aspect-video object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-full bg-white/90 text-black hover:bg-white transition-colors"
                title="本地上传"
              >
                <Upload size={10} />
              </button>
              <button
                type="button"
                onClick={() => setShowAssetPicker(true)}
                className="p-1.5 rounded-full bg-white/90 text-black hover:bg-white transition-colors"
                title="从资产库选择"
              >
                <Library size={10} />
              </button>
            </div>
          </ImageContextMenu>
        ) : (
          <div className="w-full rounded-lg border border-dashed border-border dark:border-border-dark bg-canvas-bg dark:bg-canvas-bg-dark">
            <div className="w-full aspect-video flex items-center justify-center gap-2 p-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                title="本地上传"
              >
                <Upload size={12} />
              </button>
              <button
                type="button"
                onClick={() => setShowAssetPicker(true)}
                className="p-1.5 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                title="从资产库选择"
              >
                <Library size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Asset picker dialog */}
        <AssetPickerDialog
          open={showAssetPicker}
          onClose={() => setShowAssetPicker(false)}
          onSelect={(asset) => updateNodeData(id, { sourceImage: asset.thumbnail })}
        />

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />

        <textarea
          ref={textareaRef}
          value={localPrompt}
          onChange={(e) => setLocalPrompt(e.target.value)}
          placeholder="输入提示词..."
          rows={2}
          className="w-full px-2 py-1.5 rounded-lg text-[11px] resize-none bg-canvas-bg dark:bg-canvas-bg-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark focus:outline-none focus:border-accent placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark min-h-8 max-h-40 overflow-y-auto custom-scrollbar"
        />

        {/* Compact settings + generate row */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-1.5 py-1 rounded bg-canvas-bg dark:bg-canvas-bg-dark border border-border dark:border-border-dark text-[9px] text-text-secondary dark:text-text-secondary-dark">
            <span>{nodeData.gridSize || '1x1'}</span>
            <span>·</span>
            <span>{nodeData.aspectRatio || '16:9'}</span>
            <span>·</span>
            <span className="uppercase">{nodeData.imageSize || '1k'}</span>
            {nodeData.style && (
              <>
                <span>·</span>
                <span>{IMAGE_STYLE_OPTIONS.find(o => o.value === nodeData.style)?.label || nodeData.style}</span>
              </>
            )}
          </div>
          <button
            onClick={handleGenerate}
            disabled={nodeData.status === 'generating'}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={12} />
            {nodeData.status === 'generating' ? '生成中' : '生成'}
          </button>
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="w-2.5! h-2.5!" />
      <Handle type="source" position={Position.Right} className="w-2.5! h-2.5!" />
    </div>
  );
}

export default memo(Image2ImageNode);
