import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-1.5 rounded-md transition-colors
        bg-canvas-bg dark:bg-surface-dark
        hover:bg-surface-hover dark:hover:bg-surface-hover-dark
        text-text-primary dark:text-text-primary-dark"
      title={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
    >
      {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
