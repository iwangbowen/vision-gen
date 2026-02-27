import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Type, Send, Loader2 } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import GenerativeSettingsDialog from '../ui/GenerativeSettingsDialog';
import type { Text2ImageData } from '../../types';
import { IMAGE_STYLE_OPTIONS } from '../../utils/constants';

function Text2ImageNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as Text2ImageData;
  const { updateNodeData, simulateGenerate } = useCanvasStore();
  const [localPrompt, setLocalPrompt] = useState(nodeData.prompt || '');
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
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
    <div className={`node-card w-52 rounded-xl border-2 overflow-hidden bg-node-bg dark:bg-node-bg-dark shadow-lg transition-[border-color] duration-150 ${selected ? 'border-accent dark:border-accent' : 'border-node-border dark:border-node-border-dark'}`}>
      {/* Body */}
      <div className="p-1">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            placeholder="描述想要生成的画面..."
            rows={2}
            className="w-full pl-1.5 pr-7 py-1 rounded-md text-[10px] resize-none
              bg-canvas-bg dark:bg-canvas-bg-dark
              text-text-primary dark:text-text-primary-dark
              border border-border dark:border-border-dark
              focus:outline-none focus:border-accent
              placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark
              min-h-8 max-h-40 overflow-y-auto custom-scrollbar"
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={nodeData.status === 'generating'}
            aria-label={nodeData.status === 'generating' ? '生成中' : '生成'}
            title={nodeData.status === 'generating' ? '生成中' : '生成'}
            className="absolute right-2 bottom-2 p-0.5 flex items-center justify-center rounded
              transition-colors
              text-accent hover:bg-accent/10
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {nodeData.status === 'generating' ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Send size={12} />
            )}
          </button>
        </div>
        {/* Spec badge */}
        <div className="flex items-center gap-1 px-0.5 pt-0.5">
          <Type size={10} className="text-accent shrink-0" />
          {nodeData.status === 'generating' && (
            <Loader2 size={10} className="animate-spin text-accent shrink-0" />
          )}
          <button
            type="button"
            className="flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-surface-hover dark:hover:bg-surface-hover-dark text-[9px] text-text-secondary dark:text-text-secondary-dark transition-colors truncate"
            onClick={() => setShowSettingsDialog(true)}
            title="修改生成配置"
          >
            <span>{nodeData.gridSize || '1x1'}</span>
            <span>·</span>
            <span>{nodeData.aspectRatio || '16:9'}</span>
            <span>·</span>
            <span className="uppercase">{nodeData.imageSize || '1k'}</span>
            {nodeData.style && (
              <>
                <span>·</span>
                <span className="truncate">{IMAGE_STYLE_OPTIONS.find(o => o.value === nodeData.style)?.label || nodeData.style}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {showSettingsDialog && (
        <GenerativeSettingsDialog
          isOpen={showSettingsDialog}
          onClose={() => setShowSettingsDialog(false)}
          onConfirm={(settings) => updateNodeData(id, settings)}
          title="生成配置"
          initialValues={{ gridSize: nodeData.gridSize, aspectRatio: nodeData.aspectRatio, imageSize: nodeData.imageSize, style: nodeData.style }}
        />
      )}

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
