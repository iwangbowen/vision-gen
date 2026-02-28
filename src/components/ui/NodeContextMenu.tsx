import { useEffect, useRef } from 'react';
import { Copy, Trash2, ArrowDownToLine, Scissors, Layers, ClipboardCopy, ClipboardX, Ungroup } from 'lucide-react';
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
  const { nodes, removeNodes, duplicateNodes, splitGridNode, ungroupSplitGroup, createMultiInputFromSelection, copyNodes, cutNodes } = useCanvasStore();
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

  const handleCopy = () => {
    copyNodes(nodeIds);
    onClose();
  };

  const handleCut = () => {
    cutNodes(nodeIds);
    onClose();
  };

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
          label: `Storyboard ${cell.row + 1}-${cell.col + 1}`,
        });
      });
    }
    onClose();
  };

  const handleCreateMultiInput = () => {
    createMultiInputFromSelection(nodeIds);
    onClose();
  };

  const handleUngroupSplitGroup = () => {
    if (isSingleNode && node?.type === 'splitGroup') {
      ungroupSplitGroup(node.id);
    }
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
      {/* Copy */}
      <button
        onClick={handleCopy}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors
          text-text-primary dark:text-text-primary-dark
          hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
      >
        <ClipboardCopy size={14} />
        {isSingleNode ? 'Copy Node' : `Copy ${targetNodes.length} nodes`}
      </button>

      {/* Cut */}
      <button
        onClick={handleCut}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors
          text-text-primary dark:text-text-primary-dark
          hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
      >
        <ClipboardX size={14} />
        {isSingleNode ? 'Cut Node' : `Cut ${targetNodes.length} nodes`}
      </button>

      {/* Duplicate */}
      <button
        onClick={handleDuplicate}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors
          text-text-primary dark:text-text-primary-dark
          hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
      >
        <Copy size={14} />
        {isSingleNode ? 'Duplicate Node' : `Clone ${targetNodes.length} nodes`}
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
          {isSingleNode ? 'Add to Timeline' : 'Add image nodes to timeline'}
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
            Split into Nodes
          </button>
          <button
            onClick={handleAddGridCellsToTimeline}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors
              text-text-primary dark:text-text-primary-dark
              hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
          >
            <ArrowDownToLine size={14} />
            AllAdd to Tracks
          </button>
        </>
      )}

      {/* Ungroup split group */}
      {isSingleNode && node?.type === 'splitGroup' && (
        <button
          onClick={handleUngroupSplitGroup}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors
            text-pink-500 hover:bg-pink-500/10"
        >
          <Ungroup size={14} />
          Ungroup
        </button>
      )}

      {/* Multi-input creation */}
      {canCreateMultiInput && (
        <button
          onClick={handleCreateMultiInput}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors
            text-purple-500 hover:bg-purple-500/10"
        >
          <Layers size={14} />
          Blend selected {targetNodes.length} nodes
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
        {isSingleNode ? 'Delete Node' : `Delete ${targetNodes.length} nodes`}
      </button>
    </div>
  );
}
