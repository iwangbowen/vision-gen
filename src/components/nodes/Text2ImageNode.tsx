import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Type, Sparkles, Loader2, Settings2, Scissors } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import type { Text2ImageData } from '../../types';

function Text2ImageNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as Text2ImageData;
  const { updateNodeData, simulateGenerate, splitGeneratedImage, setSelectedNodeId, setRightPanelOpen } = useCanvasStore();
  const [localPrompt, setLocalPrompt] = useState(nodeData.prompt || '');
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
    updateNodeData(id, { prompt: localPrompt });
    simulateGenerate(id);
  };

  return (
    <div className="node-card w-70 rounded-xl border-2 overflow-hidden
      bg-node-bg dark:bg-node-bg-dark
      border-node-border dark:border-node-border-dark
      shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2
        bg-surface dark:bg-surface-dark
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

        {/* Settings Summary */}
        <button
          type="button"
          className="w-full flex items-center justify-between px-2 py-1.5 rounded-md bg-canvas-bg dark:bg-canvas-bg-dark border border-border dark:border-border-dark cursor-pointer hover:border-accent/50 transition-colors"
          onClick={() => {
            setSelectedNodeId(id);
            setRightPanelOpen(true);
          }}
          title="点击在右侧面板修改设置"
        >
          <div className="flex items-center gap-2 text-[10px] text-text-secondary dark:text-text-secondary-dark font-medium">
            <span>{nodeData.gridSize || '1x1'}</span>
            <span className="w-1 h-1 rounded-full bg-border dark:bg-border-dark"></span>
            <span>{nodeData.aspectRatio || '16:9'}</span>
            <span className="w-1 h-1 rounded-full bg-border dark:bg-border-dark"></span>
            <span className="uppercase">{nodeData.imageSize || '1k'}</span>
          </div>
          <Settings2 size={12} className="text-text-secondary dark:text-text-secondary-dark" />
        </button>
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
          <div className="space-y-1.5">
            <div className="rounded-lg overflow-hidden border border-border dark:border-border-dark">
              <img
                src={nodeData.generatedImage}
                alt="generated"
                className="w-full aspect-square object-cover"
              />
            </div>
            {nodeData.gridSize && nodeData.gridSize !== '1x1' && (
              <button
                onClick={() => splitGeneratedImage(id)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-pink-500/10 text-pink-500 hover:bg-pink-500/20"
              >
                <Scissors size={12} />
                切分为独立图片
              </button>
            )}
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
