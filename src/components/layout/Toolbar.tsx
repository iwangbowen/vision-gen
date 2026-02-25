import { useState, useCallback } from 'react';
import {
  Type,
  ImageIcon,
  PanelLeftOpen,
  PanelLeftClose,
  PanelRightOpen,
  PanelRightClose,
  Settings as SettingsIcon,
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import SettingsDialog from '../ui/SettingsDialog';
import NotificationCenter from '../ui/NotificationCenter';
import { useCanvasStore } from '../../stores/canvasStore';

interface ToolbarProps {
  readonly leftPanelOpen: boolean;
  readonly rightPanelOpen: boolean;
  readonly onToggleLeftPanel: () => void;
  readonly onToggleRightPanel: () => void;
}

export default function Toolbar({
  leftPanelOpen,
  rightPanelOpen,
  onToggleLeftPanel,
  onToggleRightPanel,
}: ToolbarProps) {
  const { addText2ImageNode, addImage2ImageNode } = useCanvasStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleAddText2Image = useCallback(() => {
    addText2ImageNode({ x: 250 + Math.random() * 200, y: 150 + Math.random() * 200 });
  }, [addText2ImageNode]);

  const handleAddImage2Image = useCallback(() => {
    addImage2ImageNode({ x: 250 + Math.random() * 200, y: 150 + Math.random() * 200 });
  }, [addImage2ImageNode]);

  return (
    <div className="h-12 flex items-center justify-between px-4
      bg-toolbar-bg dark:bg-toolbar-bg-dark
      border-b border-border dark:border-border-dark
      z-50 relative">
      {/* Left section */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleLeftPanel}
          className="p-2 rounded-lg transition-colors
            hover:bg-surface-hover dark:hover:bg-surface-hover-dark
            text-text-secondary dark:text-text-secondary-dark"
          title={leftPanelOpen ? '收起资产面板' : '展开资产面板'}
        >
          {leftPanelOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>

        <div className="w-px h-6 bg-border dark:bg-border-dark mx-1" />

        <a href="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
          <img src="/favicon.svg" alt="InstaVideo Logo" className="w-5 h-5" />
          <span className="text-sm font-semibold text-text-primary dark:text-text-primary-dark tracking-wide">
            InstaVideo
          </span>
        </a>
      </div>

      {/* Center section - tools */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleAddText2Image}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
            bg-accent/10 text-accent hover:bg-accent/20"
        >
          <Type size={16} />
          文生图
        </button>

        <button
          onClick={handleAddImage2Image}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
            bg-accent/10 text-accent hover:bg-accent/20"
        >
          <ImageIcon size={16} />
          图生图
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <NotificationCenter />
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 rounded-lg transition-colors
            hover:bg-surface-hover dark:hover:bg-surface-hover-dark
            text-text-secondary dark:text-text-secondary-dark"
          title="设置"
        >
          <SettingsIcon size={18} />
        </button>
        <ThemeToggle />
        <div className="w-px h-6 bg-border dark:bg-border-dark mx-1" />
        <button
          onClick={onToggleRightPanel}
          className="p-2 rounded-lg transition-colors
            hover:bg-surface-hover dark:hover:bg-surface-hover-dark
            text-text-secondary dark:text-text-secondary-dark"
          title={rightPanelOpen ? '收起属性面板' : '展开属性面板'}
        >
          {rightPanelOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
        </button>
      </div>

      <SettingsDialog isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
