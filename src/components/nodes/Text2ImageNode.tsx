import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Type, Send, Loader2 } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import type { Text2ImageData } from '../../types';
import { IMAGE_STYLE_OPTIONS } from '../../utils/constants';

function Text2ImageNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as Text2ImageData;
  const { updateNodeData, simulateGenerate, setSelectedNodeId, setRightPanelOpen } = useCanvasStore();
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
    <div className="node-card w-56 rounded-xl border-2 overflow-hidden
      bg-node-bg dark:bg-node-bg-dark
      border-node-border dark:border-node-border-dark
      shadow-lg">
      {/* Header - icon and settings */}
      <div className="flex items-center justify-between px-2.5 py-1.5
        bg-surface dark:bg-surface-dark
        border-b border-border dark:border-border-dark">
        <div className="flex items-center gap-1.5">
          <Type size={12} className="text-accent" />
          {nodeData.status === 'generating' && (
            <Loader2 size={10} className="animate-spin text-accent" />
          )}
        </div>
        <button
          type="button"
          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-surface-hover dark:hover:bg-surface-hover-dark text-[9px] text-text-secondary dark:text-text-secondary-dark transition-colors"
          onClick={() => {
            setSelectedNodeId(id);
            setRightPanelOpen(true);
          }}
          title="打开属性设置"
        >
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
        </button>
      </div>

      {/* Body */}
      <div className="p-2">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            placeholder="描述想要生成的画面..."
            rows={2}
            className="w-full pl-2 pr-8 py-1.5 rounded-lg text-[11px] resize-none
              bg-canvas-bg dark:bg-canvas-bg-dark
              text-text-primary dark:text-text-primary-dark
              border border-border dark:border-border-dark
              focus:outline-none focus:border-accent
              placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark
              min-h-10 max-h-40 overflow-y-auto custom-scrollbar"
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={nodeData.status === 'generating'}
            aria-label={nodeData.status === 'generating' ? '生成中' : '生成'}
            title={nodeData.status === 'generating' ? '生成中' : '生成'}
            className="absolute right-1 bottom-1 w-6 h-6 flex items-center justify-center rounded-md
              transition-colors
              bg-accent text-white dark:text-black hover:bg-accent-hover
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {nodeData.status === 'generating' ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Send size={12} />
            )}
          </button>
        </div>
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
