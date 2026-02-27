import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps, useNodeConnections, useNodesData } from '@xyflow/react';
import { Layers, Send, Loader2 } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import ImageContextMenu from '../ui/ImageContextMenu';
import ImageEditOverlay from '../ui/ImageEditOverlay';
import ImagePreviewDialog from '../ui/ImagePreviewDialog';
import GenerativeSettingsDialog from '../ui/GenerativeSettingsDialog';
import type { MultiInputData, ImageData, Image2ImageData } from '../../types';
import type { GenerativeSettingsValues } from '../ui/GenerativeSettings';
import { IMAGE_STYLE_OPTIONS } from '../../utils/constants';

function MultiInputNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as MultiInputData;
  const { updateNodeData, simulateGenerate, splitGeneratedImage } = useCanvasStore();

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
  const [imagesExpanded, setImagesExpanded] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
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

  const handleOutpaintComplete = (aspectRatio: string) => {
    if (nodeData.generatedImage) {
      useCanvasStore.getState().generateOutpaint(id, nodeData.generatedImage, aspectRatio, nodeData.label || '融合结果');
    }
  };

  const handleEnhanceComplete = (settings?: GenerativeSettingsValues) => {
    if (nodeData.generatedImage) {
      useCanvasStore.getState().generateEnhance(id, nodeData.generatedImage, nodeData.label || '融合结果', settings);
    }
  };

  const handleRemoveWatermarkComplete = (settings?: GenerativeSettingsValues) => {
    if (nodeData.generatedImage) {
      useCanvasStore.getState().generateRemoveWatermark(id, nodeData.generatedImage, nodeData.label || '融合结果', settings);
    }
  };

  const handleCameraAngleComplete = (prompt: string) => {
    if (nodeData.generatedImage) {
      useCanvasStore.getState().generateCameraAngle(id, nodeData.generatedImage, prompt, nodeData.label || '融合结果');
    }
  };

  return (
    <div className={`node-card w-52 rounded-xl border-2 bg-node-bg dark:bg-node-bg-dark shadow-lg overflow-hidden transition-[border-color] duration-150 ${selected ? 'border-accent dark:border-accent' : 'border-node-border dark:border-node-border-dark'}`}>
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
                onOutpaintComplete={nodeData.generatedImage && nodeData.status !== 'generating' ? handleOutpaintComplete : undefined}
                onEnhanceComplete={nodeData.generatedImage && nodeData.status !== 'generating' ? handleEnhanceComplete : undefined}
                onRemoveWatermarkComplete={nodeData.generatedImage && nodeData.status !== 'generating' ? handleRemoveWatermarkComplete : undefined}
                onCameraAngleComplete={nodeData.generatedImage && nodeData.status !== 'generating' ? handleCameraAngleComplete : undefined}
                onSplitComplete={nodeData.status === 'generating' ? undefined : (size) => splitGeneratedImage(id, size)}
              >
                <img src={nodeData.generatedImage} alt="generated" className="w-full h-auto block" />
              </ImageEditOverlay>
            </ImageContextMenu>

          </div>
        ) : (
          <div className="p-2 border-b border-border dark:border-border-dark bg-surface-hover dark:bg-surface-hover-dark">
            <div className="text-[10px] text-text-secondary dark:text-text-secondary-dark mb-1.5">
              输入图片 ({sourceImages.length})
            </div>
            {sourceImages.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {(imagesExpanded ? sourceImages : sourceImages.slice(0, 4)).map((img, idx) => (
              <button
                type="button"
                key={`${id}-src-${idx}`}
                className="w-8 h-8 rounded overflow-hidden border border-border dark:border-border-dark hover:ring-2 hover:ring-accent transition-all cursor-pointer"
                onClick={(e) => { e.stopPropagation(); setPreviewIndex(idx); }}
                title="点击预览"
              >
                <img src={img} alt={`Source ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
                {sourceImages.length > 4 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setImagesExpanded(v => !v); }}
                    className="w-8 h-8 rounded bg-surface dark:bg-surface-dark border border-border dark:border-border-dark flex items-center justify-center text-[10px] text-accent hover:bg-accent/10 transition-colors font-medium"
                    title={imagesExpanded ? '收起' : '展开全部'}
                  >
                    {imagesExpanded ? '收起' : `+${sourceImages.length - 4}`}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-[10px] text-text-secondary dark:text-text-secondary-dark italic py-2 text-center">
                请连接图片节点
              </div>
            )}
          </div>
        )}

        <div className="p-1">
          <div className="relative rounded-md border border-border dark:border-border-dark bg-canvas-bg dark:bg-canvas-bg-dark focus-within:border-accent">
            <textarea
              ref={textareaRef}
              value={localPrompt}
              onChange={(e) => setLocalPrompt(e.target.value)}
              placeholder="输入提示词..."
              rows={2}
              className="w-full pl-1.5 pr-7 py-1 text-[10px] resize-none bg-transparent text-text-primary dark:text-text-primary-dark border-none focus:outline-none placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark min-h-6 max-h-40 overflow-y-auto custom-scrollbar"
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={nodeData.status === 'generating'}
              aria-label={nodeData.status === 'generating' ? '生成中' : '生成'}
              title={nodeData.status === 'generating' ? '生成中' : '生成'}
              className="absolute right-1.5 bottom-1.5 p-0.5 flex items-center justify-center rounded transition-colors text-purple-500 hover:bg-purple-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {nodeData.status === 'generating' ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Send size={12} />
              )}
            </button>
            {/* Spec badge inside input */}
            <div className="flex items-center gap-1 px-1 pb-1">
              <Layers size={10} className="text-purple-500 shrink-0" />
              {nodeData.status === 'generating' && (
                <Loader2 size={10} className="animate-spin text-purple-500 shrink-0" />
              )}
              <button
                type="button"
                className="flex items-center gap-0.5 px-0.5 rounded hover:bg-surface-hover dark:hover:bg-surface-hover-dark text-[9px] text-text-secondary dark:text-text-secondary-dark transition-colors truncate"
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
        </div>
          </>
        )}
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

      <Handle type="target" position={Position.Left} className="w-2.5! h-2.5!" />
      <Handle type="source" position={Position.Right} className="w-2.5! h-2.5!" />

      {previewIndex !== null && (
        <ImagePreviewDialog
          isOpen={true}
          onClose={() => setPreviewIndex(null)}
          images={sourceImages.map((url, i) => ({ url, label: `输入图片 ${i + 1}` }))}
          currentIndex={previewIndex}
          onIndexChange={setPreviewIndex}
        />
      )}
    </div>
  );
}

export default memo(MultiInputNode);
