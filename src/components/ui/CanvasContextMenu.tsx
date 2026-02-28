import { useEffect, useRef } from 'react';
import { Type, ImageIcon, Layers, ClipboardPaste } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { useReactFlow } from '@xyflow/react';

interface CanvasContextMenuProps {
  readonly x: number;
  readonly y: number;
  readonly onClose: () => void;
}

export default function CanvasContextMenu({ x, y, onClose }: CanvasContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { addText2ImageNode, addImage2ImageNode, addMultiInputNode, clipboard, pasteNodes } = useCanvasStore();
  const { screenToFlowPosition } = useReactFlow();

  const hasClipboard = clipboard.nodes.length > 0;

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

  const handleAddNode = (type: 'text2image' | 'image2image' | 'multiInput') => {
    const position = screenToFlowPosition({ x, y });

    switch (type) {
      case 'text2image':
        addText2ImageNode(position);
        break;
      case 'image2image':
        addImage2ImageNode(position);
        break;
      case 'multiInput':
        addMultiInputNode(position);
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
      {/* Paste */}
      {hasClipboard && (
        <>
          <button
            onClick={() => { pasteNodes(); onClose(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors
              text-text-primary dark:text-text-primary-dark
              hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
          >
            <ClipboardPaste size={14} className="text-amber-500" />
            Paste Node ({clipboard.nodes.length})
          </button>
          <div className="my-1 border-t border-border dark:border-border-dark" />
        </>
      )}

      <div className="px-3 py-1.5 text-[10px] font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
        Add Node
      </div>

      <button
        onClick={() => handleAddNode('text2image')}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors
          text-text-primary dark:text-text-primary-dark
          hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
      >
        <Type size={14} className="text-indigo-500" />
        Text to Image
      </button>

      <button
        onClick={() => handleAddNode('image2image')}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors
          text-text-primary dark:text-text-primary-dark
          hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
      >
        <ImageIcon size={14} className="text-emerald-500" />
        Image to Image
      </button>

      <button
        onClick={() => handleAddNode('multiInput')}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors
          text-text-primary dark:text-text-primary-dark
          hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
      >
        <Layers size={14} className="text-purple-500" />
        Multi-Input Fusion
      </button>
    </div>
  );
}
