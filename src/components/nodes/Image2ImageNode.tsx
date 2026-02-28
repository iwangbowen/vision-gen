import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ImageIcon, Send, Loader2, Upload, Library } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import AssetPickerDialog from '../ui/AssetPickerDialog';
import ImageContextMenu from '../ui/ImageContextMenu';
import ImageEditOverlay from '../ui/ImageEditOverlay';
import GenerativeSettingsDialog from '../ui/GenerativeSettingsDialog';
import type { Image2ImageData } from '../../types';
import type { GenerativeSettingsValues } from '../ui/GenerativeSettings';
import { IMAGE_STYLE_OPTIONS } from '../../utils/constants';

function Image2ImageNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as Image2ImageData;
  const { updateNodeData, simulateGenerate, splitGeneratedImage } = useCanvasStore();

  const [localPrompt, setLocalPrompt] = useState(nodeData.prompt || '');
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
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

  const handleCropComplete = (croppedImageUrl: string) => {
    const store = useCanvasStore.getState();
    const node = store.nodes.find(n => n.id === id);
    if (node) {
      const newNodeId = store.addImage2ImageNode(
        { x: node.position.x + 250, y: node.position.y },
        croppedImageUrl,
        `${nodeData.label || 'Reference Image'} (Crop)`
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
    if (node && nodeData.sourceImage) {
      // Generate repaint, then create an Image2Image node with the result as sourceImage
      store.generateRepaintToImage2Image(id, nodeData.sourceImage, maskImageUrl, prompt, nodeData.label || 'Reference Image', options);
    }
  };

  const handleOutpaintComplete = (aspectRatio: string) => {
    if (nodeData.sourceImage) {
      useCanvasStore.getState().generateOutpaint(id, nodeData.sourceImage, aspectRatio, nodeData.label || 'Reference Image', nodeData.style);
    }
  };

  const handleEnhanceComplete = (settings?: GenerativeSettingsValues) => {
    if (nodeData.sourceImage) {
      useCanvasStore.getState().generateEnhance(id, nodeData.sourceImage, nodeData.label || 'Reference Image', settings ?? { style: nodeData.style });
    }
  };

  const handleRemoveWatermarkComplete = (settings?: GenerativeSettingsValues) => {
    if (nodeData.sourceImage) {
      useCanvasStore.getState().generateRemoveWatermark(id, nodeData.sourceImage, nodeData.label || 'Reference Image', settings);
    }
  };

  const handleCameraAngleComplete = (prompt: string) => {
    if (nodeData.sourceImage) {
      useCanvasStore.getState().generateCameraAngle(id, nodeData.sourceImage, prompt, nodeData.label || 'Reference Image', nodeData.style);
    }
  };

  return (
    <div className={`node-card w-52 rounded-xl border-2 bg-node-bg dark:bg-node-bg-dark shadow-lg overflow-hidden transition-[border-color] duration-150 ${selected ? 'border-accent dark:border-accent' : 'border-node-border dark:border-node-border-dark'}`}>
      {/* Body */}
      <div className="p-0 space-y-0">
        {nodeData.status === 'generating' && !nodeData.sourceImage ? (
          /* Full loading state - hide all inputs during generation */
          <div className="w-full aspect-video border-b border-border dark:border-border-dark bg-canvas-bg dark:bg-canvas-bg-dark flex flex-col items-center justify-center gap-2">
            <Loader2 size={28} className="animate-spin text-emerald-500" />
            <span className="text-xs text-text-secondary dark:text-text-secondary-dark">Inpaint generating...</span>
          </div>
        ) : (
          <>
        {/* Source image */}
        {nodeData.sourceImage ? (
          <div className="space-y-0">
            <ImageContextMenu
              image={nodeData.sourceImage}
              sourceNodeId={id}
              label={nodeData.label || 'Reference Image'}
              className="w-full border-b border-border dark:border-border-dark bg-canvas-bg dark:bg-canvas-bg-dark relative group overflow-hidden"
            >
              <ImageEditOverlay
                imageUrl={nodeData.sourceImage}
                nodeId={id}
                onCropComplete={handleCropComplete}
                onRepaintComplete={handleRepaintComplete}
                onOutpaintComplete={nodeData.sourceImage && nodeData.status !== 'generating' ? handleOutpaintComplete : undefined}
                onEnhanceComplete={nodeData.sourceImage && nodeData.status !== 'generating' ? handleEnhanceComplete : undefined}
                onRemoveWatermarkComplete={nodeData.sourceImage && nodeData.status !== 'generating' ? handleRemoveWatermarkComplete : undefined}
                onCameraAngleComplete={nodeData.sourceImage && nodeData.status !== 'generating' ? handleCameraAngleComplete : undefined}
                onSplitComplete={nodeData.status === 'generating' ? undefined : (size) => splitGeneratedImage(id, size)}
              >
                <img src={nodeData.sourceImage} alt="source" className="w-full h-auto block" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 pointer-events-none">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="p-1.5 rounded-full bg-white/90 text-black hover:bg-white transition-colors pointer-events-auto"
                    title="Local Upload"
                  >
                    <Upload size={10} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowAssetPicker(true); }}
                    className="p-1.5 rounded-full bg-white/90 text-black hover:bg-white transition-colors pointer-events-auto"
                    title="From Asset Library"
                  >
                    <Library size={10} />
                  </button>
                </div>
              </ImageEditOverlay>
            </ImageContextMenu>
          </div>
        ) : (
          <div className="w-full border-b border-border dark:border-border-dark bg-canvas-bg dark:bg-canvas-bg-dark overflow-hidden">
            <div className="w-full aspect-video flex items-center justify-center gap-2 p-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                title="Local Upload"
              >
                <Upload size={12} />
              </button>
              <button
                type="button"
                onClick={() => setShowAssetPicker(true)}
                className="p-1.5 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                title="From Asset Library"
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

        <div className="p-1">
          <div className="relative rounded-md border border-border dark:border-border-dark bg-canvas-bg dark:bg-canvas-bg-dark focus-within:border-accent">
            <textarea
              ref={textareaRef}
              value={localPrompt}
              onChange={(e) => setLocalPrompt(e.target.value)}
              placeholder="Enter prompt..."
              rows={2}
              className="w-full pl-1.5 pr-7 py-1 text-[10px] resize-none bg-transparent text-text-primary dark:text-text-primary-dark border-none focus:outline-none placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark min-h-6 max-h-40 overflow-y-auto custom-scrollbar"
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={nodeData.status === 'generating'}
              aria-label={nodeData.status === 'generating' ? 'Generating' : 'Generate'}
              title={nodeData.status === 'generating' ? 'Generating' : 'Generate'}
              className="absolute right-1.5 bottom-1.5 p-0.5 flex items-center justify-center rounded transition-colors text-emerald-500 hover:bg-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {nodeData.status === 'generating' ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Send size={12} />
              )}
            </button>
            {/* Spec badge inside input */}
            <div className="flex items-center gap-1 px-1 pb-1">
              <ImageIcon size={10} className="text-emerald-500 shrink-0" />
              {nodeData.status === 'generating' && (
                <Loader2 size={10} className="animate-spin text-emerald-500 shrink-0" />
              )}
              <button
                type="button"
                className="flex items-center gap-0.5 px-0.5 rounded hover:bg-surface-hover dark:hover:bg-surface-hover-dark text-[9px] text-text-secondary dark:text-text-secondary-dark transition-colors truncate"
                onClick={() => setShowSettingsDialog(true)}
                title="Modify Generation Settings"
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
          title="Generation Settings"
          initialValues={{ gridSize: nodeData.gridSize, aspectRatio: nodeData.aspectRatio, imageSize: nodeData.imageSize, style: nodeData.style }}
        />
      )}

      <Handle type="target" position={Position.Left} className="w-2.5! h-2.5!" />
      <Handle type="source" position={Position.Right} className="w-2.5! h-2.5!" />
    </div>
  );
}

export default memo(Image2ImageNode);
