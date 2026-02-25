import { create } from 'zustand';
import type { Theme } from '../types';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dark',
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      return { theme: next };
    }),
  setTheme: (theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({ theme });
  },
}));
