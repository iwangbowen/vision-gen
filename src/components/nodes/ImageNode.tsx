import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ImageIcon, Scissors } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import ImageContextMenu from '../ui/ImageContextMenu';
import type { ImageData } from '../../types';

function ImageNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as ImageData;
  const { splitGeneratedImage } = useCanvasStore();

  return (
    <div className="node-card w-44 rounded-xl border-2 overflow-hidden bg-node-bg dark:bg-node-bg-dark border-node-border dark:border-node-border-dark shadow-lg">
      {/* Header - compact */}
      <div className="flex items-center px-2 py-1 bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark">
        <div className="flex items-center gap-1">
          <ImageIcon size={10} className="text-amber-500" />
          <span className="text-[10px] font-medium text-text-primary dark:text-text-primary-dark truncate max-w-25">
            {nodeData.label}
          </span>
        </div>
      </div>

      {/* Image */}
      <div className="p-1.5 space-y-1">
        <ImageContextMenu
          image={nodeData.image}
          sourceNodeId={id}
          label={nodeData.label}
          className="rounded-lg overflow-hidden"
          showAddToTimelineIcon={true}
        >
          <img
            src={nodeData.image}
            alt={nodeData.label}
            className="w-full aspect-square object-cover"
            loading="lazy"
          />
        </ImageContextMenu>
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

      <Handle type="target" position={Position.Left} className="w-2.5! h-2.5!" />
      <Handle type="source" position={Position.Right} className="w-2.5! h-2.5!" />
    </div>
  );
}

export default memo(ImageNode);
