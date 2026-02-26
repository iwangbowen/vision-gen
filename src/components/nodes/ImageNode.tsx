import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ImageIcon, Scissors, Loader2 } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import ImageContextMenu from '../ui/ImageContextMenu';
import ImageEditOverlay from '../ui/ImageEditOverlay';
import type { ImageData } from '../../types';

function ImageNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as ImageData;
  const { splitGeneratedImage } = useCanvasStore();

  const handleCropComplete = (croppedImageUrl: string) => {
    const store = useCanvasStore.getState();
    const node = store.nodes.find(n => n.id === id);
    if (node) {
      const newNodeId = store.addImage2ImageNode(
        { x: node.position.x + 200, y: node.position.y },
        croppedImageUrl,
        `${nodeData.label} (裁剪)`
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
    if (node) {
      // Generate repaint, then create an Image2Image node with the result as sourceImage
      store.generateRepaintToImage2Image(id, nodeData.image, maskImageUrl, prompt, nodeData.label, options);
    }
  };

  return (
    <div className={`node-card w-44 rounded-xl border-2 bg-node-bg dark:bg-node-bg-dark shadow-lg transition-[border-color] duration-150 ${selected ? 'border-accent dark:border-accent' : 'border-node-border dark:border-node-border-dark'}`}>
      {/* Header - compact */}
      <div className="flex items-center px-2 py-1 bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark rounded-t-xl">
        <div className="flex items-center gap-1">
          <ImageIcon size={10} className="text-amber-500" />
          {nodeData.status === 'generating' && (
            <Loader2 size={10} className="animate-spin text-amber-500" />
          )}
          <span className="text-[10px] font-medium text-text-primary dark:text-text-primary-dark truncate max-w-25">
            {nodeData.label}
          </span>
        </div>
      </div>

      {/* Image */}
      <div className="p-1.5 space-y-1">
        {nodeData.status === 'generating' ? (
          <div className="w-full aspect-square rounded-lg border border-dashed border-border dark:border-border-dark bg-canvas-bg dark:bg-canvas-bg-dark flex flex-col items-center justify-center gap-2 text-text-secondary dark:text-text-secondary-dark">
            <Loader2 size={24} className="animate-spin text-accent" />
            <span className="text-xs">生成中...</span>
          </div>
        ) : (
          <ImageContextMenu
            image={nodeData.image}
            sourceNodeId={id}
            label={nodeData.label}
            className="rounded-lg"
            showAddToTimelineIcon={true}
          >
            <ImageEditOverlay
              imageUrl={nodeData.image}
              onCropComplete={handleCropComplete}
              onRepaintComplete={handleRepaintComplete}
              onSplitComplete={(size) => splitGeneratedImage(id, size)}
            >
              <img
                src={nodeData.image}
                alt={nodeData.label}
                className="w-full h-auto rounded-lg"
                loading="lazy"
              />
            </ImageEditOverlay>
          </ImageContextMenu>
        )}
        {nodeData.gridSize && nodeData.gridSize !== '1x1' && nodeData.status !== 'generating' && (
          <button
            onClick={() => splitGeneratedImage(id)}
            className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors bg-pink-500/10 text-pink-500 hover:bg-pink-500/20"
          >
            <Scissors size={10} />
            切分
          </button>
        )}
      </div>

      <Handle type="target" position={Position.Left} className="w-2.5! h-2.5!" />
      <Handle type="source" position={Position.Right} className="w-2.5! h-2.5!" />
    </div>
  );
}

export default memo(ImageNode);
