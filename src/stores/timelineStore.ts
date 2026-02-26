import { create } from 'zustand';
import type { TimelineItem } from '../types';

interface TimelineState {
  items: TimelineItem[];
  collapsed: boolean;

  addItem: (item: Omit<TimelineItem, 'order'>) => void;
  removeItem: (id: string) => void;
  reorderItems: (items: TimelineItem[]) => void;
  updateItemPosition: (id: string, position: number) => void;
  clearTimeline: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  items: [],
  collapsed: false,

  addItem: (item) => {
    const { items } = get();
    // Prevent duplicates from same node
    if (items.some((i) => i.sourceNodeId === item.sourceNodeId)) return;

    // Find the maximum position to append at the end
    const maxPosition = items.reduce((max, i) => Math.max(max, i.position || 0), -1);
    const nextPosition = maxPosition >= 0 ? maxPosition + 1 : 0;

    const newItem: TimelineItem = {
      ...item,
      order: items.length,
      position: item.position ?? nextPosition,
    };
    set((state) => ({ items: [...state.items, newItem] }));
  },

  removeItem: (id) =>
    set((state) => ({
      items: state.items
        .filter((i) => i.id !== id)
        .map((item, idx) => ({ ...item, order: idx })),
    })),

  reorderItems: (items) => set({ items }),

  updateItemPosition: (id: string, position: number) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, position } : item
      ),
    })),

  clearTimeline: () => set({ items: [] }),
  setCollapsed: (collapsed) => set({ collapsed }),
}));
