import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps, useNodeConnections, useNodesData } from '@xyflow/react';
import { Layers, Send, Loader2, Scissors } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import ImageContextMenu from '../ui/ImageContextMenu';
import ImageEditOverlay from '../ui/ImageEditOverlay';
import type { MultiInputData, ImageData, Image2ImageData } from '../../types';
import { IMAGE_STYLE_OPTIONS } from '../../utils/constants';

function MultiInputNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as MultiInputData;
  const { updateNodeData, simulateGenerate, setSelectedNodeId, setRightPanelOpen, splitGeneratedImage } = useCanvasStore();

  // Get connected source nodes data
  const connections = useNodeConnections({ handleType: 'target' });
  const sourceNodesData = useNodesData(connections.map(c => c.source));

  // Extract images from source nodes
  const sourceImages = sourceNodesData
    .map(node => {
      if (!node) return null;
      if (node.type === 'image') return (node.data as unknown as ImageData).image;
      if (node.type === 'image2image') return (node.data as unknown as Image2ImageData).sourceImage;
      return null;
    })
    .filter(Boolean) as string[];

  // Update node data when source images change
  useEffect(() => {
    // Check if sourceImages actually changed to prevent infinite loops
    const currentImages = nodeData.sourceImages || [];
    const isDifferent = sourceImages.length !== currentImages.length ||
      sourceImages.some((img, i) => img !== currentImages[i]);

    if (isDifferent) {
      updateNodeData(id, { sourceImages });
    }
  }, [sourceImages, id, updateNodeData, nodeData.sourceImages]);

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

  const handleCropComplete = (croppedImageUrl: string) => {
    const store = useCanvasStore.getState();
    const node = store.nodes.find(n => n.id === id);
    if (node) {
      const newNodeId = store.addImage2ImageNode(
        { x: node.position.x + 250, y: node.position.y },
        croppedImageUrl,
        `${nodeData.label || '参考图'} (裁剪)`
      );
      store.onConnect({
        source: id,
        target: newNodeId,
        sourceHandle: null,
        targetHandle: null
      });
    }
  };

  const handleRepaintComplete = (maskImageUrl: string, prompt: string, options: { gridSize: string; aspectRatio: string; imageSize: string; style: string }) => {
    const store = useCanvasStore.getState();
    const node = store.nodes.find(n => n.id === id);
    if (node && nodeData.generatedImage) {
      // Generate repaint, then create an Image2Image node with the result as sourceImage
      store.generateRepaintToImage2Image(id, nodeData.generatedImage, maskImageUrl, prompt, nodeData.label || '融合结果', options);
    }
  };

  return (
    <div className="node-card w-52 rounded-xl border-2 bg-node-bg dark:bg-node-bg-dark border-node-border dark:border-node-border-dark shadow-lg overflow-hidden">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-purple-500 border-2 border-white dark:border-gray-800"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-purple-500 border-2 border-white dark:border-gray-800"
        isConnectable={true}
      />

      {/* Header - icon and settings */}
      <div className="flex items-center justify-between px-1.5 py-1 bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark">
        <div className="flex items-center gap-1.5">
          <Layers size={12} className="text-purple-500" />
          {nodeData.status === 'generating' && (
            <Loader2 size={10} className="animate-spin text-purple-500" />
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
      <div className="p-0 space-y-0">
        {nodeData.status === 'generating' && !nodeData.generatedImage ? (
          /* Full loading state - hide all inputs during generation */
          <div className="w-full aspect-video border-b border-border dark:border-border-dark bg-canvas-bg dark:bg-canvas-bg-dark flex flex-col items-center justify-center gap-2">
            <Loader2 size={28} className="animate-spin text-purple-500" />
            <span className="text-xs text-text-secondary dark:text-text-secondary-dark">融合生成中...</span>
          </div>
        ) : (
          <>
        {/* Generated image */}
        {nodeData.generatedImage ? (
          <div className="space-y-0">
            <ImageContextMenu
              image={nodeData.generatedImage}
              sourceNodeId={id}
              label={nodeData.label || '融合结果'}
              className="w-full border-b border-border dark:border-border-dark bg-canvas-bg dark:bg-canvas-bg-dark relative group overflow-hidden"
            >
              <ImageEditOverlay
                imageUrl={nodeData.generatedImage}
                onCropComplete={handleCropComplete}
                onRepaintComplete={handleRepaintComplete}
                onSplitComplete={nodeData.status === 'generating' ? undefined : (size) => splitGeneratedImage(id, size)}
              >
                <img src={nodeData.generatedImage} alt="generated" className="w-full h-auto block" />
              </ImageEditOverlay>
            </ImageContextMenu>
            {nodeData.gridSize && nodeData.gridSize !== '1x1' && nodeData.status !== 'generating' && (
              <div className="p-1.5 border-b border-border dark:border-border-dark">
                <button
                  onClick={() => splitGeneratedImage(id)}
                  className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors bg-pink-500/10 text-pink-500 hover:bg-pink-500/20"
                >
                  <Scissors size={10} />
                  切分
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-2 border-b border-border dark:border-border-dark bg-surface-hover dark:bg-surface-hover-dark">
            <div className="text-[10px] text-text-secondary dark:text-text-secondary-dark mb-1.5">
              输入图片 ({sourceImages.length})
            </div>
            {sourceImages.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {sourceImages.slice(0, 4).map((img, idx) => (
              <div key={`${id}-src-${idx}`} className="w-8 h-8 rounded overflow-hidden border border-border dark:border-border-dark">
                <img src={img} alt={`Source ${idx}`} className="w-full h-full object-cover" />
              </div>
            ))}
                {sourceImages.length > 4 && (
                  <div className="w-8 h-8 rounded bg-surface dark:bg-surface-dark border border-border dark:border-border-dark flex items-center justify-center text-[10px] text-text-secondary">
                    +{sourceImages.length - 4}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[10px] text-text-secondary dark:text-text-secondary-dark italic py-2 text-center">
                请连接图片节点
              </div>
            )}
          </div>
        )}

        <div className="relative p-1">
          <textarea
            ref={textareaRef}
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            placeholder="输入提示词..."
            rows={2}
            className="w-full pl-1.5 pr-7 py-1 rounded-md text-[10px] resize-none bg-canvas-bg dark:bg-canvas-bg-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark focus:outline-none focus:border-accent placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark min-h-6 max-h-40 overflow-y-auto custom-scrollbar"
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={nodeData.status === 'generating'}
            aria-label={nodeData.status === 'generating' ? '生成中' : '生成'}
            title={nodeData.status === 'generating' ? '生成中' : '生成'}
            className="absolute right-2 bottom-2 p-0.5 flex items-center justify-center rounded transition-colors text-emerald-500 hover:bg-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {nodeData.status === 'generating' ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Send size={12} />
            )}
          </button>
        </div>
          </>
        )}
      </div>

      <Handle type="target" position={Position.Left} className="w-2.5! h-2.5!" />
      <Handle type="source" position={Position.Right} className="w-2.5! h-2.5!" />
    </div>
  );
}

export default memo(MultiInputNode);
