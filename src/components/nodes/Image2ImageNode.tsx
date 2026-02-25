import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import type { Image2ImageData, GridSize, AspectRatio, ImageSize } from '../../types';

const GRID_OPTIONS: { label: string; value: GridSize }[] = [
  { label: '1×1', value: '1x1' },
  { label: '2×2', value: '2x2' },
  { label: '3×3', value: '3x3' },
  { label: '4×4', value: '4x4' },
  { label: '5×5', value: '5x5' },
];

const ASPECT_RATIO_OPTIONS: { label: string; value: AspectRatio }[] = [
  { label: '1:1', value: '1:1' },
  { label: '16:9', value: '16:9' },
  { label: '9:16', value: '9:16' },
  { label: '4:3', value: '4:3' },
  { label: '3:4', value: '3:4' },
  { label: '3:2', value: '3:2' },
  { label: '2:3', value: '2:3' },
];

const IMAGE_SIZE_OPTIONS: { label: string; value: ImageSize }[] = [
  { label: '1K', value: '1k' },
  { label: '2K', value: '2k' },
  { label: '4K', value: '4k' },
];

function Image2ImageNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as Image2ImageData;
  const { updateNodeData, simulateGenerate } = useCanvasStore();
  const [localPrompt, setLocalPrompt] = useState(nodeData.prompt || '');
  const [selectedGrid, setSelectedGrid] = useState<GridSize>(nodeData.gridSize || '1x1');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>(nodeData.aspectRatio || '16:9');
  const [selectedImageSize, setSelectedImageSize] = useState<ImageSize>(nodeData.imageSize || '1k');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    updateNodeData(id, {
      prompt: localPrompt,
      gridSize: selectedGrid,
      aspectRatio: selectedAspectRatio,
      imageSize: selectedImageSize
    });
    simulateGenerate(id);
  };

  return (
    <div className="node-card w-70 rounded-xl border-2 overflow-hidden bg-node-bg dark:bg-node-bg-dark border-node-border dark:border-node-border-dark shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-linear-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 border-b border-border dark:border-border-dark">
        <ImageIcon size={14} className="text-emerald-500" />
        <span className="text-xs font-semibold text-text-primary dark:text-text-primary-dark">
          图生图
        </span>
        {nodeData.status === 'generating' && (
          <Loader2 size={12} className="animate-spin text-emerald-500 ml-auto" />
        )}
      </div>

      {/* Body */}
      <div className="p-3 space-y-2.5">
        {/* Source image preview */}
        <div className="rounded-lg overflow-hidden border border-dashed border-border dark:border-border-dark bg-canvas-bg dark:bg-canvas-bg-dark">
          {nodeData.sourceImage ? (
            <img src={nodeData.sourceImage} alt="source" className="w-full aspect-video object-cover" />
          ) : (
            <div className="w-full aspect-video flex items-center justify-center">
              <p className="text-[10px] text-text-secondary dark:text-text-secondary-dark">
                连接图片输入或拖入图片
              </p>
            </div>
          )}
        </div>

        <textarea
          ref={textareaRef}
          value={localPrompt}
          onChange={(e) => setLocalPrompt(e.target.value)}
          placeholder="输入提示词描述变化方向..."
          rows={2}
          className="w-full px-2.5 py-2 rounded-lg text-xs resize-none bg-canvas-bg dark:bg-canvas-bg-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark focus:outline-none focus:border-accent placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark min-h-10 max-h-50 overflow-y-auto custom-scrollbar"
        />

        {/* Grid size selector */}
        <div>
          <p className="text-[10px] text-text-secondary dark:text-text-secondary-dark mb-1">
            生成规格
          </p>
          <div className="flex gap-1 flex-wrap">
            {GRID_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedGrid(opt.value)}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                  selectedGrid === opt.value
                    ? 'bg-emerald-500 text-white'
                    : 'bg-canvas-bg dark:bg-canvas-bg-dark text-text-secondary dark:text-text-secondary-dark border border-border dark:border-border-dark'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio selector */}
        <div>
          <p className="text-[10px] text-text-secondary dark:text-text-secondary-dark mb-1">
            画面比例
          </p>
          <div className="flex gap-1 flex-wrap">
            {ASPECT_RATIO_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedAspectRatio(opt.value)}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                  selectedAspectRatio === opt.value
                    ? 'bg-emerald-500 text-white'
                    : 'bg-canvas-bg dark:bg-canvas-bg-dark text-text-secondary dark:text-text-secondary-dark border border-border dark:border-border-dark'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Image Size selector */}
        <div>
          <p className="text-[10px] text-text-secondary dark:text-text-secondary-dark mb-1">
            图片尺寸
          </p>
          <div className="flex gap-1 flex-wrap">
            {IMAGE_SIZE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedImageSize(opt.value)}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                  selectedImageSize === opt.value
                    ? 'bg-emerald-500 text-white'
                    : 'bg-canvas-bg dark:bg-canvas-bg-dark text-text-secondary dark:text-text-secondary-dark border border-border dark:border-border-dark'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={nodeData.status === 'generating'}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles size={14} />
          {nodeData.status === 'generating' ? '生成中...' : '生成图片'}
        </button>

        {nodeData.generatedImage && (
          <div className="rounded-lg overflow-hidden border border-border dark:border-border-dark">
            <img src={nodeData.generatedImage} alt="generated" className="w-full aspect-square object-cover" />
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Left} className="w-2.5! h-2.5!" />
      <Handle type="source" position={Position.Right} className="w-2.5! h-2.5!" />
    </div>
  );
}

export default memo(Image2ImageNode);
