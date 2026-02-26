import { useCallback } from 'react';
import {
  Type,
  ImageIcon,
  Layers,
  PanelLeftOpen,
  PanelLeftClose,
  PanelRightOpen,
  PanelRightClose,
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import SettingsMenu from '../ui/SettingsMenu';
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
  const { addText2ImageNode, addImage2ImageNode, addMultiInputNode } = useCanvasStore();

  const handleAddText2Image = useCallback(() => {
    addText2ImageNode({ x: 250 + Math.random() * 200, y: 150 + Math.random() * 200 });
  }, [addText2ImageNode]);

  const handleAddImage2Image = useCallback(() => {
    addImage2ImageNode({ x: 250 + Math.random() * 200, y: 150 + Math.random() * 200 });
  }, [addImage2ImageNode]);

  const handleAddMultiInput = useCallback(() => {
    addMultiInputNode({ x: 250 + Math.random() * 200, y: 150 + Math.random() * 200 });
  }, [addMultiInputNode]);

  return (
    <div className="h-9 flex items-center justify-between px-3
      bg-toolbar-bg dark:bg-toolbar-bg-dark
      border-b border-border dark:border-border-dark
      z-50 relative">
      {/* Left section */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onToggleLeftPanel}
          className="p-1.5 rounded-md transition-colors
            hover:bg-surface-hover dark:hover:bg-surface-hover-dark
            text-text-secondary dark:text-text-secondary-dark"
          title={leftPanelOpen ? '收起资产面板' : '展开资产面板'}
        >
          {leftPanelOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
        </button>

        <div className="w-px h-4 bg-border dark:bg-border-dark mx-0.5" />

        <a href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
          <img src="/favicon.svg" alt="InstaVideo Logo" className="w-4 h-4" />
          <span className="text-xs font-semibold text-text-primary dark:text-text-primary-dark tracking-wide">
            InstaVideo
          </span>
        </a>
      </div>

      {/* Center section - tools */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleAddText2Image}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors
            bg-accent/10 text-accent hover:bg-accent/20"
        >
          <Type size={13} />
          <span className="hidden sm:inline">文生图</span>
        </button>

        <button
          onClick={handleAddImage2Image}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors
            bg-accent/10 text-accent hover:bg-accent/20"
        >
          <ImageIcon size={13} />
          <span className="hidden sm:inline">图生图</span>
        </button>

        <button
          onClick={handleAddMultiInput}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors
            bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
        >
          <Layers size={13} />
          <span className="hidden sm:inline">多图融合</span>
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1.5">
        <NotificationCenter />
        <SettingsMenu />
        <ThemeToggle />
        <div className="w-px h-4 bg-border dark:bg-border-dark mx-0.5" />
        <button
          onClick={onToggleRightPanel}
          className="p-1.5 rounded-md transition-colors
            hover:bg-surface-hover dark:hover:bg-surface-hover-dark
            text-text-secondary dark:text-text-secondary-dark"
          title={rightPanelOpen ? '收起属性面板' : '展开属性面板'}
        >
          {rightPanelOpen ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
        </button>
      </div>
    </div>
  );
}
