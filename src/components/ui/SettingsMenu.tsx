import { useState, useRef } from 'react';
import { Settings as SettingsIcon, ChevronRight, Cpu, Keyboard } from 'lucide-react';
import SettingsDialog from './SettingsDialog';
import ShortcutsDialog from './ShortcutsDialog';

interface MenuItemProps {
  readonly icon?: React.ReactNode;
  readonly label: string;
  readonly onClick?: () => void;
  readonly children?: React.ReactNode;
}

function MenuItem({ icon, label, onClick, children }: MenuItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150); // Small delay to make moving to submenu easier
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-3 py-2 text-sm text-text-primary dark:text-text-primary-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark transition-colors rounded-md"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
        </div>
        {children && <ChevronRight size={14} className="text-text-secondary dark:text-text-secondary-dark" />}
      </button>

      {/* Cascading Submenu */}
      {isHovered && children && (
        <div className="absolute top-0 left-full ml-1 w-48 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg shadow-xl p-1 z-50">
          {children}
        </div>
      )}
    </div>
  );
}

export default function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-md transition-colors hover:bg-surface-hover dark:hover:bg-surface-hover-dark text-text-secondary dark:text-text-secondary-dark"
        title="设置"
      >
        <SettingsIcon size={15} />
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-transparent border-none cursor-default w-full h-full"
            onClick={handleClose}
            aria-label="Close settings menu"
          />
          <div className="absolute top-full right-0 mt-2 w-48 z-50 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg shadow-xl p-1 flex flex-col">
            <MenuItem
              icon={<Cpu size={16} className="text-text-secondary dark:text-text-secondary-dark" />}
              label="LLM 配置"
              onClick={() => {
                setIsDialogOpen(true);
                setIsOpen(false);
              }}
            />
            <MenuItem
              icon={<Keyboard size={16} className="text-text-secondary dark:text-text-secondary-dark" />}
              label="快捷键"
              onClick={() => {
                setIsShortcutsOpen(true);
                setIsOpen(false);
              }}
            />
            {/* Future multi-level menus can be added here like this:
            <MenuItem label="更多设置" icon={<SettingsIcon size={16} />}>
              <MenuItem label="二级菜单 1" />
              <MenuItem label="二级菜单 2">
                <MenuItem label="三级菜单 1" />
              </MenuItem>
            </MenuItem>
            */}
          </div>
        </>
      )}

      <SettingsDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
      <ShortcutsDialog isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </div>
  );
}
