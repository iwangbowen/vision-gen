import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { Group } from 'lucide-react';
import type { SplitGroupData } from '../../types';

function SplitGroupNode({ data }: NodeProps) {
  const nodeData = data as unknown as SplitGroupData;

  return (
    <div className="w-full h-full rounded-xl border-2 border-dashed border-pink-500/30 bg-pink-500/5 dark:bg-pink-500/10">
      <div className="flex items-center gap-1.5 px-3 py-2">
        <Group size={14} className="text-pink-500" />
        <span className="text-xs font-semibold text-text-secondary dark:text-text-secondary-dark">
          {nodeData.label}
        </span>
      </div>
    </div>
  );
}

export default memo(SplitGroupNode);
