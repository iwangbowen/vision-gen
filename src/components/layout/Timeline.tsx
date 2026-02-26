import { useCallback, useState } from 'react';
import {
  X,
  Download,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Film,
} from 'lucide-react';
import { useTimelineStore } from '../../stores/timelineStore';
import ImagePreviewDialog from '../ui/ImagePreviewDialog';

export default function Timeline() {
  const { items, removeItem, reorderItems, clearTimeline, collapsed, setCollapsed } = useTimelineStore();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, idx: number) => {
    setDragIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
    // Add a specific type for internal timeline dragging
    e.dataTransfer.setData('application/instavideo-timeline-item', String(idx));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent track drag over from firing
    e.dataTransfer.dropEffect = 'move';
    setDropIndex(idx);
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragIndex !== null && dropIndex !== null && dragIndex !== dropIndex) {
      const newItems = [...items];
      const [dragged] = newItems.splice(dragIndex, 1);
      newItems.splice(dropIndex, 0, dragged);
      reorderItems(newItems.map((item, idx) => ({ ...item, order: idx })));
    }
    setDragIndex(null);
    setDropIndex(null);
  }, [dragIndex, dropIndex, items, reorderItems]);

  const handleTrackDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Check if it's an internal drag or external asset
    if (e.dataTransfer.types.includes('application/instavideo-timeline-item')) {
      e.dataTransfer.dropEffect = 'move';
    } else {
      e.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  const handleTrackDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();

    const trackElement = e.currentTarget as HTMLDivElement;
    const trackRect = trackElement.getBoundingClientRect();

    // Calculate the slot position based on mouse X coordinate
    // Assuming each slot is roughly 104px wide (w-24 = 96px + gap-2 = 8px + padding)
    // We'll use a fixed slot width for calculation
    const SLOT_WIDTH = 104;
    const scrollLeft = trackElement.scrollLeft;
    const relativeX = e.clientX - trackRect.left + scrollLeft;

    // Calculate which slot the mouse is over
    const targetPosition = Math.max(0, Math.floor(relativeX / SLOT_WIDTH));

    // Handle internal reordering
    const timelineItemData = e.dataTransfer.getData('application/instavideo-timeline-item');
    if (timelineItemData) {
      const sourceIdx = Number.parseInt(timelineItemData, 10);
      if (!Number.isNaN(sourceIdx) && sourceIdx >= 0 && sourceIdx < items.length) {
        const newItems = [...items];

        // Check if the target position is already occupied
        const occupiedIndex = newItems.findIndex(item => item.position === targetPosition);

        if (occupiedIndex !== -1 && occupiedIndex !== sourceIdx) {
          // Swap positions if dropping on an occupied slot
          const tempPos = newItems[sourceIdx].position;
          newItems[sourceIdx].position = newItems[occupiedIndex].position;
          newItems[occupiedIndex].position = tempPos;
        } else {
          // Just move to the new position
          newItems[sourceIdx].position = targetPosition;
        }

        reorderItems(newItems);
      }
      setDragIndex(null);
      setDropIndex(null);
      return;
    }

    // Handle external asset drop
    const data = e.dataTransfer.getData('application/instavideo-asset');
    if (!data) return;

    const { image, name } = JSON.parse(data);

    const newItem = {
      id: `timeline_asset_${Date.now()}`,
      image,
      sourceNodeId: `asset_${Date.now()}`,
      label: name,
      position: targetPosition,
    };

    // If dropping on an occupied slot, shift existing items to the right
    const newItems = [...items];
    const occupiedIndex = newItems.findIndex(item => item.position === targetPosition);

    if (occupiedIndex !== -1) {
      // Shift all items from targetPosition onwards to the right
      newItems.forEach(item => {
        if (item.position !== undefined && item.position >= targetPosition) {
          item.position += 1;
        }
      });
    }

    newItems.push({ ...newItem, order: newItems.length });
    reorderItems(newItems);
  }, [items, reorderItems]);

  return (
    <div
      className={`border-t border-border dark:border-border-dark bg-timeline-bg dark:bg-timeline-bg-dark transition-all ${
        collapsed ? 'h-8' : 'h-28'
      }`}
    >
      {/* Header */}
      <div className="h-8 flex items-center justify-between px-4 border-b border-border dark:border-border-dark">
        <div className="flex items-center gap-2">
          <Film size={14} className="text-accent" />
          <span className="text-xs font-semibold text-text-primary dark:text-text-primary-dark">
            轨道
          </span>
          <span className="text-[10px] text-text-secondary dark:text-text-secondary-dark">
            ({items.length} 帧)
          </span>
        </div>
        <div className="flex items-center gap-1">
          {items.length > 0 && (
            <>
              <button
                onClick={() => {
                  /* Export placeholder */
                }}
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
              >
                <Download size={12} />
                导出
              </button>
              <button
                onClick={clearTimeline}
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
              >
                <Trash2 size={12} />
                清空
              </button>
            </>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-surface-hover dark:hover:bg-surface-hover-dark text-text-secondary dark:text-text-secondary-dark"
          >
            {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Timeline track */}
      {!collapsed && (
        <section
          className="h-[calc(100%-32px)] flex items-center px-4 overflow-x-auto relative"
          onDragOver={handleTrackDragOver}
          onDrop={handleTrackDrop}
          aria-label="Timeline Track"
        >
          {/* Render a fixed number of slots or dynamically based on max position */}
          <div className="flex items-center gap-2 min-w-max relative h-full py-2">
            {/* Background slots for visual guidance */}
            {Array.from({ length: Math.max(20, Math.max(...items.map(i => i.position ?? 0)) + 5) }).map((_, i) => (
              <div
                key={`empty-slot-${i}`}
                className="w-24 h-16 rounded-lg border-2 border-dashed border-border/80 dark:border-border-dark/50 bg-surface/50 dark:bg-transparent flex items-center justify-center shrink-0"
              >
                <span className="text-[8px] text-text-secondary/50 dark:text-text-secondary-dark/30">#{i + 1}</span>
              </div>
            ))}

            {/* Actual items positioned absolutely over the slots */}
            {items.map((item, idx) => {
              const pos = item.position ?? idx;
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`absolute top-2 shrink-0 group transition-transform ${
                    dragIndex === idx ? 'opacity-50' : ''
                  } ${dropIndex === idx && dragIndex !== idx ? 'scale-110' : ''}`}
                  style={{ left: `${pos * 104}px` }} // 104px = 96px (w-24) + 8px (gap-2)
                >
                  {/* Frame number */}
                  <div className="absolute -top-0.5 left-1 text-[8px] font-bold text-text-secondary dark:text-text-secondary-dark z-10 bg-timeline-bg/80 dark:bg-timeline-bg-dark/80 px-1 rounded">
                    #{pos + 1}
                  </div>
                  <div className="w-24 h-16 rounded-lg overflow-hidden border-2 border-border dark:border-border-dark hover:border-accent transition-colors cursor-grab active:cursor-grabbing relative bg-surface dark:bg-surface-dark">
                    <button
                      type="button"
                      className="w-full h-full p-0 m-0 border-none bg-transparent cursor-pointer block"
                      onClick={() => setPreviewImage(item.image)}
                      aria-label={item.label ? `Preview ${item.label}` : `Preview Frame ${pos + 1}`}
                    >
                      <img
                        src={item.image}
                        alt={item.label || `Frame ${pos + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 pointer-events-none">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded bg-black/60 text-white hover:bg-red-500 transition-all pointer-events-auto"
                        title="移除"
                      >
                        <X size={10} />
                      </button>
                      <div className="opacity-0 group-hover:opacity-100 p-1 rounded bg-black/60 text-white cursor-grab pointer-events-auto">
                        <GripVertical size={10} />
                      </div>
                    </div>
                  </div>
                  {item.label && (
                    <p className="text-[8px] text-text-secondary dark:text-text-secondary-dark text-center mt-0.5 truncate w-24 bg-timeline-bg/80 dark:bg-timeline-bg-dark/80 rounded">
                      {item.label}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <ImagePreviewDialog
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage || ''}
      />
    </div>
  );
}
