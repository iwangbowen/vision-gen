import { useEffect, useRef } from 'react';
import { Copy, Trash2, ArrowDownToLine, Scissors, Layers } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { useTimelineStore } from '../../stores/timelineStore';
import type { ImageData, GridData, GridCell } from '../../types';

interface ContextMenuProps {
  readonly nodeIds: string[];
  readonly x: number;
  readonly y: number;
  readonly onClose: () => void;
}

export default function NodeContextMenu({ nodeIds, x, y, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { nodes, removeNodes, duplicateNodes, splitGridNode, createMultiInputFromSelection } = useCanvasStore();
  const { addItem } = useTimelineStore();

  const targetNodes = nodes.filter((n) => nodeIds.includes(n.id));

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

  if (targetNodes.length === 0) return null;

  const isSingleNode = targetNodes.length === 1;
  const node = isSingleNode ? targetNodes[0] : null;

  const handleDuplicate = () => {
    duplicateNodes(nodeIds);
    onClose();
  };

  const handleDelete = () => {
    removeNodes(nodeIds);
    onClose();
  };

  const handleAddToTimeline = () => {
    targetNodes.forEach(n => {
      if (n.type === 'image') {
        const data = n.data as unknown as ImageData;
        addItem({
          id: `timeline_${n.id}_${Date.now()}`,
          image: data.image,
          sourceNodeId: n.id,
          label: data.label,
        });
      }
    });
    onClose();
  };

  const handleSplitGrid = () => {
    if (isSingleNode && node?.type === 'grid') {
      splitGridNode(node.id);
    }
    onClose();
  };

  const handleAddGridCellsToTimeline = () => {
    if (isSingleNode && node?.type === 'grid') {
      const data = node.data as unknown as GridData;
      data.cells.forEach((cell: GridCell) => {
        addItem({
          id: `timeline_${node.id}_cell_${cell.id}_${Date.now()}`,
          image: cell.image,
          sourceNodeId: node.id,
          label: `分镜 ${cell.row + 1}-${cell.col + 1}`,
        });
      });
    }
    onClose();
  };

  const handleCreateMultiInput = () => {
    createMultiInputFromSelection(nodeIds);
    onClose();
  };

  const hasImageNodes = targetNodes.some(n => n.type === 'image');
  const canCreateMultiInput = targetNodes.length > 1;

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
        {isSingleNode ? '复制节点' : `复制 ${targetNodes.length} 个节点`}
      </button>

      {/* Add to timeline - image node */}
      {hasImageNodes && (
        <button
          onClick={handleAddToTimeline}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors
            text-text-primary dark:text-text-primary-dark
            hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
        >
          <ArrowDownToLine size={14} />
          {isSingleNode ? '添加到轨道' : '将图片节点添加到轨道'}
        </button>
      )}

      {/* Grid-specific actions */}
      {isSingleNode && node?.type === 'grid' && (
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

      {/* Multi-input creation */}
      {canCreateMultiInput && (
        <button
          onClick={handleCreateMultiInput}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors
            text-purple-500 hover:bg-purple-500/10"
        >
          <Layers size={14} />
          将选中的 {targetNodes.length} 个节点融合生成
        </button>
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
        {isSingleNode ? '删除节点' : `删除 ${targetNodes.length} 个节点`}
      </button>
    </div>
  );
}
