import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ImageIcon, ArrowDownToLine } from 'lucide-react';
import { useTimelineStore } from '../../stores/timelineStore';
import type { ImageData } from '../../types';

function ImageNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as ImageData;
  const { addItem } = useTimelineStore();

  const handleAddToTimeline = () => {
    addItem({
      id: `timeline_${id}_${Date.now()}`,
      image: nodeData.image,
      sourceNodeId: id,
      label: nodeData.label,
    });
  };

  return (
    <div className="node-card w-[200px] rounded-xl border-2 overflow-hidden bg-node-bg dark:bg-node-bg-dark border-node-border dark:border-node-border-dark shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark">
        <div className="flex items-center gap-1.5">
          <ImageIcon size={12} className="text-amber-500" />
          <span className="text-[11px] font-semibold text-text-primary dark:text-text-primary-dark truncate max-w-[120px]">
            {nodeData.label}
          </span>
        </div>
        <button
          onClick={handleAddToTimeline}
          className="p-1 rounded hover:bg-surface-hover dark:hover:bg-surface-hover-dark text-text-secondary dark:text-text-secondary-dark hover:text-accent transition-colors"
          title="添加到轨道"
        >
          <ArrowDownToLine size={12} />
        </button>
      </div>

      {/* Image */}
      <div className="p-2">
        <div className="rounded-lg overflow-hidden">
          <img
            src={nodeData.image}
            alt={nodeData.label}
            className="w-full aspect-square object-cover"
            loading="lazy"
          />
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5" />
    </div>
  );
}

export default memo(ImageNode);
