import { useEffect, useRef } from 'react';
import { Copy, Trash2, ArrowDownToLine, Scissors } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { useTimelineStore } from '../../stores/timelineStore';
import type { ImageData, GridData, GridCell } from '../../types';

interface ContextMenuProps {
  readonly nodeId: string;
  readonly x: number;
  readonly y: number;
  readonly onClose: () => void;
}

export default function NodeContextMenu({ nodeId, x, y, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { nodes, removeNode, duplicateNode, splitGridNode } = useCanvasStore();
  const { addItem } = useTimelineStore();

  const node = nodes.find((n) => n.id === nodeId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (!node) return null;

  const handleDuplicate = () => {
    duplicateNode(nodeId);
    onClose();
  };

  const handleDelete = () => {
    removeNode(nodeId);
    onClose();
  };

  const handleAddToTimeline = () => {
    if (node.type === 'image') {
      const data = node.data as unknown as ImageData;
      addItem({
        id: `timeline_${nodeId}_${Date.now()}`,
        image: data.image,
        sourceNodeId: nodeId,
        label: data.label,
      });
    }
    onClose();
  };

  const handleSplitGrid = () => {
    splitGridNode(nodeId);
    onClose();
  };

  const handleAddGridCellsToTimeline = () => {
    if (node.type === 'grid') {
      const data = node.data as unknown as GridData;
      data.cells.forEach((cell: GridCell) => {
        addItem({
          id: `timeline_${nodeId}_cell_${cell.id}_${Date.now()}`,
          image: cell.image,
          sourceNodeId: nodeId,
          label: `分镜 ${cell.row + 1}-${cell.col + 1}`,
        });
      });
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-9999 min-w-40 py-1 rounded-lg shadow-xl border
        bg-surface dark:bg-surface-dark
        border-border dark:border-border-dark"
      style={{ left: x, top: y }}
    >
      {/* Duplicate */}
      <button
        onClick={handleDuplicate}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors
          text-text-primary dark:text-text-primary-dark
          hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
      >
        <Copy size={14} />
        复制节点
      </button>

      {/* Add to timeline - image node */}
      {node.type === 'image' && (
        <button
          onClick={handleAddToTimeline}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors
            text-text-primary dark:text-text-primary-dark
            hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
        >
          <ArrowDownToLine size={14} />
          添加到轨道
        </button>
      )}

      {/* Grid-specific actions */}
      {node.type === 'grid' && (
        <>
          <button
            onClick={handleSplitGrid}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors
              text-text-primary dark:text-text-primary-dark
              hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
          >
            <Scissors size={14} />
            切分为独立节点
          </button>
          <button
            onClick={handleAddGridCellsToTimeline}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors
              text-text-primary dark:text-text-primary-dark
              hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
          >
            <ArrowDownToLine size={14} />
            全部添加到轨道
          </button>
        </>
      )}

      {/* Divider */}
      <div className="my-1 border-t border-border dark:border-border-dark" />

      {/* Delete */}
      <button
        onClick={handleDelete}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors
          text-red-500 hover:bg-red-500/10"
      >
        <Trash2 size={14} />
        删除节点
      </button>
    </div>
  );
}
