import { useEffect, useRef } from 'react';
import { Type, ImageIcon, Image as ImageIcon2, LayoutGrid } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { useReactFlow } from '@xyflow/react';

interface CanvasContextMenuProps {
  readonly x: number;
  readonly y: number;
  readonly onClose: () => void;
}

export default function CanvasContextMenu({ x, y, onClose }: CanvasContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { addText2ImageNode, addImage2ImageNode, addImageNode, addGridNode } = useCanvasStore();
  const { screenToFlowPosition } = useReactFlow();

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

  const handleAddNode = (type: 'text2image' | 'image2image' | 'image' | 'grid') => {
    const position = screenToFlowPosition({ x, y });

    switch (type) {
      case 'text2image':
        addText2ImageNode(position);
        break;
      case 'image2image':
        addImage2ImageNode(position);
        break;
      case 'image':
        // For image node, we might need a default image or just an empty one
        addImageNode(position, '', '新图片');
        break;
      case 'grid':
        addGridNode(position, '2x2');
        break;
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
      <div className="px-3 py-1.5 text-[10px] font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
        添加节点
      </div>

      <button
        onClick={() => handleAddNode('text2image')}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors
          text-text-primary dark:text-text-primary-dark
          hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
      >
        <Type size={14} className="text-indigo-500" />
        文生图
      </button>

      <button
        onClick={() => handleAddNode('image2image')}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors
          text-text-primary dark:text-text-primary-dark
          hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
      >
        <ImageIcon size={14} className="text-emerald-500" />
        图生图
      </button>

      <button
        onClick={() => handleAddNode('image')}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors
          text-text-primary dark:text-text-primary-dark
          hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
      >
        <ImageIcon2 size={14} className="text-blue-500" />
        图片
      </button>

      <button
        onClick={() => handleAddNode('grid')}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors
          text-text-primary dark:text-text-primary-dark
          hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
      >
        <LayoutGrid size={14} className="text-orange-500" />
        分镜网格
      </button>
    </div>
  );
}
