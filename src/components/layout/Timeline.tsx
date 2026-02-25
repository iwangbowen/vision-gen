import { useState, useCallback } from 'react';
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

export default function Timeline() {
  const { items, removeItem, reorderItems, clearTimeline } = useTimelineStore();
  const [collapsed, setCollapsed] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, idx: number) => {
    setDragIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropIndex(idx);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragIndex !== null && dropIndex !== null && dragIndex !== dropIndex) {
      const newItems = [...items];
      const [dragged] = newItems.splice(dragIndex, 1);
      newItems.splice(dropIndex, 0, dragged);
      reorderItems(newItems.map((item, idx) => ({ ...item, order: idx })));
    }
    setDragIndex(null);
    setDropIndex(null);
  }, [dragIndex, dropIndex, items, reorderItems]);

  return (
    <div
      className={`border-t border-border dark:border-border-dark bg-timeline-bg dark:bg-timeline-bg-dark transition-all ${
        collapsed ? 'h-10' : 'h-40'
      }`}
    >
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-4 border-b border-border dark:border-border-dark">
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
        <div className="h-[calc(100%-40px)] flex items-center px-4 overflow-x-auto gap-3">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                从画布拖入图片或点击图片节点上的 ↓ 按钮添加到轨道
              </p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`shrink-0 group relative transition-transform ${
                  dragIndex === idx ? 'opacity-50' : ''
                } ${dropIndex === idx && dragIndex !== idx ? 'scale-110' : ''}`}
              >
                {/* Frame number */}
                <div className="absolute -top-0.5 left-1 text-[8px] font-bold text-text-secondary dark:text-text-secondary-dark z-10">
                  #{idx + 1}
                </div>
                <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-border dark:border-border-dark hover:border-accent transition-colors cursor-grab active:cursor-grabbing relative">
                  <img
                    src={item.image}
                    alt={item.label || `Frame ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded bg-black/60 text-white hover:bg-red-500 transition-all"
                      title="移除"
                    >
                      <X size={10} />
                    </button>
                    <div className="opacity-0 group-hover:opacity-100 p-1 rounded bg-black/60 text-white cursor-grab">
                      <GripVertical size={10} />
                    </div>
                  </div>
                </div>
                {item.label && (
                  <p className="text-[8px] text-text-secondary dark:text-text-secondary-dark text-center mt-0.5 truncate w-20">
                    {item.label}
                  </p>
                )}
                {/* Connector line between frames */}
                {idx < items.length - 1 && (
                  <div className="absolute top-1/2 -right-2.5 w-3 h-px bg-border dark:bg-border-dark" />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
