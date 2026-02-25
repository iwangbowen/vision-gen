import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Type, Sparkles, Loader2 } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import type { Text2ImageData, GridSize } from '../../types';

const GRID_OPTIONS: { label: string; value: GridSize }[] = [
  { label: '1×1', value: '1x1' },
  { label: '2×2', value: '2x2' },
  { label: '3×3', value: '3x3' },
  { label: '4×4', value: '4x4' },
  { label: '5×5', value: '5x5' },
];

function Text2ImageNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as Text2ImageData;
  const { updateNodeData, simulateGenerate } = useCanvasStore();
  const [localPrompt, setLocalPrompt] = useState(nodeData.prompt || '');
  const [selectedGrid, setSelectedGrid] = useState<GridSize>(nodeData.gridSize || '1x1');
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
    updateNodeData(id, { prompt: localPrompt, gridSize: selectedGrid });
    simulateGenerate(id);
  };

  return (
    <div className="node-card w-70 rounded-xl border-2 overflow-hidden
      bg-node-bg dark:bg-node-bg-dark
      border-node-border dark:border-node-border-dark
      shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2
        bg-linear-to-r from-indigo-500/10 to-purple-500/10
        dark:from-indigo-500/20 dark:to-purple-500/20
        border-b border-border dark:border-border-dark">
        <Type size={14} className="text-accent" />
        <span className="text-xs font-semibold text-text-primary dark:text-text-primary-dark">
          文生图
        </span>
        {nodeData.status === 'generating' && (
          <Loader2 size={12} className="animate-spin text-accent ml-auto" />
        )}
      </div>

      {/* Body */}
      <div className="p-3 space-y-2.5">
        <textarea
          ref={textareaRef}
          value={localPrompt}
          onChange={(e) => setLocalPrompt(e.target.value)}
          placeholder="输入提示词描述想要生成的画面..."
          rows={3}
          className="w-full px-2.5 py-2 rounded-lg text-xs resize-none
            bg-canvas-bg dark:bg-canvas-bg-dark
            text-text-primary dark:text-text-primary-dark
            border border-border dark:border-border-dark
            focus:outline-none focus:border-accent
            placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark
            min-h-15 max-h-50 overflow-y-auto custom-scrollbar"
        />

        {/* Grid size selector */}
        <div>
          <p className="text-[10px] text-text-secondary dark:text-text-secondary-dark mb-1">
            生成规格
          </p>
          <div className="flex gap-1">
            {GRID_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedGrid(opt.value)}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-colors
                  ${selectedGrid === opt.value
                    ? 'bg-accent text-white dark:text-black'
                    : 'bg-canvas-bg dark:bg-canvas-bg-dark text-text-secondary dark:text-text-secondary-dark border border-border dark:border-border-dark'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={nodeData.status === 'generating'}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg
            text-xs font-medium transition-colors
            bg-accent text-white dark:text-black hover:bg-accent-hover
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles size={14} />
          {nodeData.status === 'generating' ? '生成中...' : '生成图片'}
        </button>

        {/* Generated image preview */}
        {nodeData.generatedImage && (
          <div className="rounded-lg overflow-hidden border border-border dark:border-border-dark">
            <img
              src={nodeData.generatedImage}
              alt="generated"
              className="w-full aspect-square object-cover"
            />
          </div>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5! h-2.5!"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5! h-2.5!"
      />
    </div>
  );
}

export default memo(Text2ImageNode);
