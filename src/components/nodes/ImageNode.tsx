import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ImageIcon } from 'lucide-react';
import ImageContextMenu from '../ui/ImageContextMenu';
import type { ImageData } from '../../types';

function ImageNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as ImageData;

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
      <div className="p-1.5">
        <ImageContextMenu
          image={nodeData.image}
          sourceNodeId={id}
          label={nodeData.label}
          className="rounded-lg overflow-hidden"
        >
          <img
            src={nodeData.image}
            alt={nodeData.label}
            className="w-full aspect-square object-cover"
            loading="lazy"
          />
        </ImageContextMenu>
      </div>

      <Handle type="target" position={Position.Left} className="w-2.5! h-2.5!" />
      <Handle type="source" position={Position.Right} className="w-2.5! h-2.5!" />
    </div>
  );
}

export default memo(ImageNode);
