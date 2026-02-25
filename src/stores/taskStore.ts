import { create } from 'zustand';

export interface Task {
  id: string;
  nodeId: string;
  type: 'text2image' | 'image2image';
  prompt: string;
  status: 'generating' | 'done' | 'error';
  progress: number; // 0 to 100
  startTime: number;
  endTime?: number;
  error?: string;
}

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'progress' | 'startTime' | 'status'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  clearCompletedTasks: () => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  addTask: (task) => set((state) => ({
    tasks: [
      {
        ...task,
        status: 'generating',
        progress: 0,
        startTime: Date.now(),
      },
      ...state.tasks,
    ],
  })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  })),
  removeTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id),
  })),
  clearCompletedTasks: () => set((state) => ({
    tasks: state.tasks.filter((t) => t.status === 'generating'),
  })),
}));
