import { useCallback } from 'react';
import {
  Type,
  ImageIcon,
  Layers,
  PanelLeftOpen,
  PanelLeftClose,
  PanelRightOpen,
  PanelRightClose,
  Undo2,
  Redo2,
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
  const { addText2ImageNode, addImage2ImageNode, addMultiInputNode, undo, redo, _history, _historyFuture } = useCanvasStore();

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
          title={leftPanelOpen ? 'Collapse Asset Panel' : 'Expand Asset Panel'}
        >
          {leftPanelOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
        </button>

        <div className="w-px h-4 bg-border dark:bg-border-dark mx-0.5" />

        <a href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
          <img src="/favicon.svg" alt="VisionGen Logo" className="w-4 h-4" />
          <span className="text-xs font-semibold text-text-primary dark:text-text-primary-dark tracking-wide">
            VisionGen
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
          <span className="hidden sm:inline">Text to Image</span>
        </button>

        <button
          onClick={handleAddImage2Image}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors
            bg-accent/10 text-accent hover:bg-accent/20"
        >
          <ImageIcon size={13} />
          <span className="hidden sm:inline">Image to Image</span>
        </button>

        <button
          onClick={handleAddMultiInput}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors
            bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
        >
          <Layers size={13} />
          <span className="hidden sm:inline">Multi-Input Fusion</span>
        </button>

        <div className="w-px h-4 bg-border dark:bg-border-dark mx-0.5" />

        <button
          onClick={undo}
          disabled={_history.length === 0}
          className="p-1.5 rounded-md transition-colors
            hover:bg-surface-hover dark:hover:bg-surface-hover-dark
            text-text-secondary dark:text-text-secondary-dark
            disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={15} />
        </button>

        <button
          onClick={redo}
          disabled={_historyFuture.length === 0}
          className="p-1.5 rounded-md transition-colors
            hover:bg-surface-hover dark:hover:bg-surface-hover-dark
            text-text-secondary dark:text-text-secondary-dark
            disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 size={15} />
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
          title={rightPanelOpen ? 'Collapse Property Panel' : 'Expand Property Panel'}
        >
          {rightPanelOpen ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
        </button>
      </div>
    </div>
  );
}
