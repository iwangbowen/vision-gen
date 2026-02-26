import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDownToLine, Download } from 'lucide-react';
import { saveAs } from 'file-saver';
import { useTimelineStore } from '../../stores/timelineStore';

interface ImageContextMenuProps {
  /** Image src (data URL or URL) */
  readonly image: string;
  /** Source node id for timeline tracking */
  readonly sourceNodeId: string;
  /** Label for the timeline item */
  readonly label: string;
  /** The child element (image) to wrap */
  readonly children: React.ReactNode;
  /** Optional extra className on wrapper */
  readonly className?: string;
  /** Whether to show a quick add to timeline icon on hover */
  readonly showAddToTimelineIcon?: boolean;
}

interface MenuState {
  open: boolean;
  x: number;
  y: number;
}

export default function ImageContextMenu({ image, sourceNodeId, label, children, className, showAddToTimelineIcon }: ImageContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<MenuState>({ open: false, x: 0, y: 0 });
  const addToTimeline = useTimelineStore((s) => s.addItem);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Prevent ReactFlow's native contextmenu from firing
    e.nativeEvent.stopImmediatePropagation();
    setMenu({ open: true, x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    if (!menu.open) return;
    const close = (e: Event) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenu((m) => ({ ...m, open: false }));
      }
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu((m) => ({ ...m, open: false }));
    };

    // Use capture phase to ensure we catch the event before React Flow stops propagation
    document.addEventListener('mousedown', close, { capture: true });
    document.addEventListener('touchstart', close, { capture: true });
    document.addEventListener('wheel', close, { capture: true });
    document.addEventListener('keydown', esc);

    return () => {
      document.removeEventListener('mousedown', close, { capture: true });
      document.removeEventListener('touchstart', close, { capture: true });
      document.removeEventListener('wheel', close, { capture: true });
      document.removeEventListener('keydown', esc);
    };
  }, [menu.open]);

  const handleAddToTimeline = () => {
    addToTimeline({
      id: `timeline_${sourceNodeId}_${Date.now()}`,
      image,
      sourceNodeId,
      label,
    });
    setMenu((m) => ({ ...m, open: false }));
  };

  const handleDownload = () => {
    setMenu((m) => ({ ...m, open: false }));
    saveAs(image, `${label || 'image'}.png`);
  };

  return (
    <>
      <div onContextMenu={handleContextMenu} className={`relative group ${className || ''}`}>
        {children}
        {showAddToTimelineIcon && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToTimeline();
            }}
            className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            title="添加到轨道"
          >
            <ArrowDownToLine size={14} />
          </button>
        )}
      </div>

      {menu.open && createPortal(
        <div
          ref={menuRef}
          className="fixed z-9999 min-w-36 py-1 rounded-lg shadow-xl border
            bg-surface dark:bg-surface-dark
            border-border dark:border-border-dark"
          style={{ left: menu.x, top: menu.y }}
        >
          <button
            onClick={handleAddToTimeline}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors
              text-text-primary dark:text-text-primary-dark
              hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
          >
            <ArrowDownToLine size={14} />
            添加到轨道
          </button>
          <button
            onClick={handleDownload}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors
              text-text-primary dark:text-text-primary-dark
              hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
          >
            <Download size={14} />
            下载到本地
          </button>
        </div>,
        document.body
      )}
    </>
  );
}
