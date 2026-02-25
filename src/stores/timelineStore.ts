import { create } from 'zustand';
import type { TimelineItem } from '../types';

interface TimelineState {
  items: TimelineItem[];

  addItem: (item: Omit<TimelineItem, 'order'>) => void;
  removeItem: (id: string) => void;
  reorderItems: (items: TimelineItem[]) => void;
  clearTimeline: () => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  items: [],

  addItem: (item) => {
    const { items } = get();
    // Prevent duplicates from same node
    if (items.some((i) => i.sourceNodeId === item.sourceNodeId)) return;
    const newItem: TimelineItem = {
      ...item,
      order: items.length,
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

  clearTimeline: () => set({ items: [] }),
}));
