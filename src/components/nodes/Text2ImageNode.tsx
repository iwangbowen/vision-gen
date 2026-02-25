import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Type, Sparkles, Loader2, Settings2, Scissors, ArrowDownToLine } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { useTimelineStore } from '../../stores/timelineStore';
import type { Text2ImageData } from '../../types';

function Text2ImageNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as Text2ImageData;
  const { updateNodeData, simulateGenerate, splitGeneratedImage, setSelectedNodeId, setRightPanelOpen } = useCanvasStore();
  const addToTimeline = useTimelineStore((s) => s.addItem);
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
      {/* Header - icon only */}
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
        <textarea
          ref={textareaRef}
          value={localPrompt}
          onChange={(e) => setLocalPrompt(e.target.value)}
          placeholder="描述想要生成的画面..."
          rows={2}
          className="w-full px-2 py-1.5 rounded-lg text-[11px] resize-none
            bg-canvas-bg dark:bg-canvas-bg-dark
            text-text-primary dark:text-text-primary-dark
            border border-border dark:border-border-dark
            focus:outline-none focus:border-accent
            placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark
            min-h-10 max-h-40 overflow-y-auto custom-scrollbar"
        />

        {/* Compact settings + generate row */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-1.5 py-1 rounded bg-canvas-bg dark:bg-canvas-bg-dark border border-border dark:border-border-dark text-[9px] text-text-secondary dark:text-text-secondary-dark">
            <span>{nodeData.gridSize || '1x1'}</span>
            <span>·</span>
            <span>{nodeData.aspectRatio || '16:9'}</span>
            <span>·</span>
            <span className="uppercase">{nodeData.imageSize || '1k'}</span>
          </div>
          <button
            onClick={handleGenerate}
            disabled={nodeData.status === 'generating'}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg
              text-[11px] font-medium transition-colors
              bg-accent text-white dark:text-black hover:bg-accent-hover
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={12} />
            {nodeData.status === 'generating' ? '生成中' : '生成'}
          </button>
        </div>

        {/* Generated image preview */}
        {nodeData.generatedImage && (
          <div className="space-y-1">
            <div className="relative group rounded-lg overflow-hidden border border-border dark:border-border-dark">
              <img
                src={nodeData.generatedImage}
                alt="generated"
                className="w-full aspect-square object-cover"
              />
              <button
                onClick={() => addToTimeline({ id: `timeline_${id}_${Date.now()}`, image: nodeData.generatedImage!, sourceNodeId: id, label: nodeData.prompt || '生成图片' })}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                title="添加到轨道"
              >
                <ArrowDownToLine size={10} />
              </button>
            </div>
            {nodeData.gridSize && nodeData.gridSize !== '1x1' && (
              <button
                onClick={() => splitGeneratedImage(id)}
                className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors bg-pink-500/10 text-pink-500 hover:bg-pink-500/20"
              >
                <Scissors size={10} />
                切分
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
