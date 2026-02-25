import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Grid3X3, Scissors, ArrowDownToLine } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { useTimelineStore } from '../../stores/timelineStore';
import type { GridData, GridCell } from '../../types';

function GridNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as GridData;
  const { splitGridNode } = useCanvasStore();
  const { addItem } = useTimelineStore();
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  const size = parseInt(nodeData.gridSize[0]);
  const cellSize = Math.max(50, Math.floor(240 / size));

  const handleSplit = () => {
    splitGridNode(id);
  };

  const handleCellAddToTimeline = (cell: GridCell) => {
    addItem({
      id: `timeline_${id}_cell_${cell.id}_${Date.now()}`,
      image: cell.image,
      sourceNodeId: id,
      label: `分镜 ${cell.row + 1}-${cell.col + 1}`,
    });
  };

  return (
    <div className="node-card rounded-xl border-2 overflow-hidden bg-node-bg dark:bg-node-bg-dark border-node-border dark:border-node-border-dark shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-pink-500/10 to-rose-500/10 dark:from-pink-500/20 dark:to-rose-500/20 border-b border-border dark:border-border-dark">
        <div className="flex items-center gap-1.5">
          <Grid3X3 size={14} className="text-pink-500" />
          <span className="text-xs font-semibold text-text-primary dark:text-text-primary-dark">
            {nodeData.label}
          </span>
        </div>
        <button
          onClick={handleSplit}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 transition-colors"
          title="切分为独立节点"
        >
          <Scissors size={12} />
          切分
        </button>
      </div>

      {/* Grid */}
      <div className="p-3">
        <div
          className="grid gap-1 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${size}, ${cellSize}px)`,
          }}
        >
          {nodeData.cells.map((cell) => (
            <div
              key={cell.id}
              onClick={() => setSelectedCell(selectedCell === cell.id ? null : cell.id)}
              className={`relative rounded overflow-hidden cursor-pointer transition-all group ${
                selectedCell === cell.id
                  ? 'ring-2 ring-accent scale-105 z-10'
                  : 'hover:ring-1 hover:ring-accent/50'
              }`}
            >
              <img
                src={cell.image}
                alt={`cell ${cell.row}-${cell.col}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Cell overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCellAddToTimeline(cell);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded bg-black/50 text-white hover:bg-black/70 transition-all"
                  title="添加到轨道"
                >
                  <ArrowDownToLine size={10} />
                </button>
              </div>
              {/* Cell index */}
              <div className="absolute top-0.5 left-0.5 px-1 rounded text-[8px] font-bold bg-black/50 text-white">
                {cell.row + 1},{cell.col + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5" />
    </div>
  );
}

export default memo(GridNode);
