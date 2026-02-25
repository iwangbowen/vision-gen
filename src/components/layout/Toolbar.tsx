import { useState, useCallback } from 'react';
import {
  Type,
  ImageIcon,
  Grid3X3,
  PanelLeftOpen,
  PanelLeftClose,
  PanelRightOpen,
  PanelRightClose,
  ChevronDown,
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import { useCanvasStore } from '../../stores/canvasStore';
import type { GridSize } from '../../types';

interface ToolbarProps {
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
}

const GRID_OPTIONS: { label: string; value: GridSize }[] = [
  { label: '单帧 1×1', value: '1x1' },
  { label: '2×2 宫格', value: '2x2' },
  { label: '3×3 宫格', value: '3x3' },
  { label: '4×4 宫格', value: '4x4' },
  { label: '5×5 宫格', value: '5x5' },
];

export default function Toolbar({
  leftPanelOpen,
  rightPanelOpen,
  onToggleLeftPanel,
  onToggleRightPanel,
}: ToolbarProps) {
  const { addText2ImageNode, addImage2ImageNode, addGridNode } = useCanvasStore();
  const [gridMenuOpen, setGridMenuOpen] = useState(false);

  const handleAddText2Image = useCallback(() => {
    addText2ImageNode({ x: 250 + Math.random() * 200, y: 150 + Math.random() * 200 });
  }, [addText2ImageNode]);

  const handleAddImage2Image = useCallback(() => {
    addImage2ImageNode({ x: 250 + Math.random() * 200, y: 150 + Math.random() * 200 });
  }, [addImage2ImageNode]);

  const handleAddGrid = useCallback((size: GridSize) => {
    addGridNode({ x: 250 + Math.random() * 200, y: 150 + Math.random() * 200 }, size);
    setGridMenuOpen(false);
  }, [addGridNode]);

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

        <span className="text-sm font-semibold text-text-primary dark:text-text-primary-dark tracking-wide">
          InstaVideo
        </span>
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

        <div className="relative">
          <button
            onClick={() => setGridMenuOpen(!gridMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              bg-accent/10 text-accent hover:bg-accent/20"
          >
            <Grid3X3 size={16} />
            生成宫格
            <ChevronDown size={14} />
          </button>
          {gridMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setGridMenuOpen(false)} />
              <div className="absolute top-full mt-1 left-0 z-50
                bg-surface dark:bg-surface-dark
                border border-border dark:border-border-dark
                rounded-lg shadow-lg py-1 min-w-[140px]">
                {GRID_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleAddGrid(opt.value)}
                    className="w-full text-left px-3 py-2 text-sm transition-colors
                      text-text-primary dark:text-text-primary-dark
                      hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
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
    </div>
  );
}
