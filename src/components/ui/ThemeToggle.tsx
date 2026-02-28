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
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
