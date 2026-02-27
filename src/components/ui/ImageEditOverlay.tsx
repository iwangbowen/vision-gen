import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Expand, Crop, Paintbrush, Camera, Sun, Eye, Scissors, ChevronRight, Sparkles, Eraser, SlidersHorizontal } from 'lucide-react';
import CropDialog from './CropDialog';
import RepaintDialog from './RepaintDialog';
import ImagePreviewDialog from './ImagePreviewDialog';
import CameraAngleDialog from './CameraAngleDialog';
import GenerativeSettingsDialog from './GenerativeSettingsDialog';
import type { GenerativeSettingsValues } from './GenerativeSettings';
import { ASPECT_RATIO_OPTIONS } from '../../utils/constants';
import { useCanvasStore } from '../../stores/canvasStore';

interface ImageEditOverlayProps {
  readonly imageUrl: string;
  readonly nodeId?: string;
  readonly onCropComplete: (croppedImageUrl: string) => void;
  readonly onRepaintComplete?: (maskImageUrl: string, prompt: string, options: { gridSize: string; aspectRatio: string; imageSize: string; style: string }) => void;
  readonly onOutpaintComplete?: (targetAspectRatio: string) => void;
  readonly onEnhanceComplete?: (settings?: GenerativeSettingsValues) => void;
  readonly onRemoveWatermarkComplete?: (settings?: GenerativeSettingsValues) => void;
  readonly onSplitComplete?: (gridSize?: string) => void;
  readonly onCameraAngleComplete?: (prompt: string) => void;
  readonly children: React.ReactNode;
}

export default function ImageEditOverlay({ imageUrl, nodeId, onCropComplete, onRepaintComplete, onOutpaintComplete, onEnhanceComplete, onRemoveWatermarkComplete, onSplitComplete, onCameraAngleComplete, children }: ImageEditOverlayProps) {
  const [showToolbar, setShowToolbar] = useState(false);
  const [showSplitMenu, setShowSplitMenu] = useState(false);
  const [showOutpaintMenu, setShowOutpaintMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [isRepaintDialogOpen, setIsRepaintDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isCameraAngleDialogOpen, setIsCameraAngleDialogOpen] = useState(false);
  const [enhanceSettingsOpen, setEnhanceSettingsOpen] = useState(false);
  const [watermarkSettingsOpen, setWatermarkSettingsOpen] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [submenuDirection, setSubmenuDirection] = useState<'up' | 'down'>('up');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowToolbar(false);
        setShowSplitMenu(false);
        setShowOutpaintMenu(false);
        setShowMoreMenu(false);
      }
    };

    const handleCloseOtherToolbars = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail !== containerRef.current) {
        setShowToolbar(false);
        setShowSplitMenu(false);
        setShowOutpaintMenu(false);
        setShowMoreMenu(false);
      }
    };

    if (showToolbar) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('imageEditToolbarOpened', handleCloseOtherToolbars);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('imageEditToolbarOpened', handleCloseOtherToolbars);
    };
  }, [showToolbar]);

  const handleCropComplete = (croppedImageUrl: string) => {
    onCropComplete(croppedImageUrl);
    setIsCropDialogOpen(false);
    setShowToolbar(false);
  };

  const handleRepaintComplete = (maskImageUrl: string, prompt: string, options: { gridSize: string; aspectRatio: string; imageSize: string; style: string }) => {
    if (onRepaintComplete) {
      onRepaintComplete(maskImageUrl, prompt, options);
    }
    setIsRepaintDialogOpen(false);
    setShowToolbar(false);
  };

  return (
    <div className="relative group w-full h-full" ref={containerRef}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="w-full h-full cursor-pointer block p-0 m-0 border-none bg-transparent text-left"
        onPointerDown={(e) => {
          // Use onPointerDown instead of onClick to capture the event before React Flow's drag/select handlers
          e.stopPropagation();
          // Ensure the parent node gets selected in the property panel
          if (nodeId) useCanvasStore.getState().setSelectedNodeId(nodeId);
          const newShowToolbar = !showToolbar;
          setShowToolbar(newShowToolbar);
          if (newShowToolbar && containerRef.current) {
            // Calculate toolbar position
            const rect = containerRef.current.getBoundingClientRect();
            const toolbarTop = rect.top - 10;
            // If less than 200px above the toolbar, expand submenus downward
            setSubmenuDirection(toolbarTop < 200 ? 'down' : 'up');
            setToolbarPosition({
              top: toolbarTop,
              left: rect.left + rect.width / 2,
            });
            document.dispatchEvent(new CustomEvent('imageEditToolbarOpened', { detail: containerRef.current }));
          }
          if (!newShowToolbar) {
            setShowSplitMenu(false);
            setShowOutpaintMenu(false);
            setShowMoreMenu(false);
          }
        }}
      >
        {children}
      </div>

      {showToolbar && createPortal(
        <>
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div
            className="fixed inset-0 z-40"
            onPointerDown={() => {
              setShowToolbar(false);
              setShowSplitMenu(false);
              setShowOutpaintMenu(false);
              setShowMoreMenu(false);
            }}
          />
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div
            role="toolbar"
            aria-label="图片编辑工具栏"
            className="fixed flex items-center justify-center gap-1 p-1.5 rounded-lg bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-xl z-50 w-max"
            style={{
              top: `${toolbarPosition.top}px`,
              left: `${toolbarPosition.left}px`,
              transform: 'translate(-50%, -100%)',
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
          {[
            {
              icon: <Eye size={14} />,
              label: '预览',
              action: 'preview',
              onClick: () => {
                setIsPreviewDialogOpen(true);
                setShowToolbar(false);
              }
            },
            { icon: <Crop size={14} />, label: '裁剪', action: 'crop', onClick: () => setIsCropDialogOpen(true) },
            { icon: <Paintbrush size={14} />, label: '重绘', action: 'repaint', onClick: () => setIsRepaintDialogOpen(true) },
            ...(onOutpaintComplete ? [{
              icon: <Expand size={14} />,
              label: '扩图',
              action: 'outpaint',
              onClick: () => { setShowOutpaintMenu(!showOutpaintMenu); setShowSplitMenu(false); setShowMoreMenu(false); },
              hasSubmenu: true,
              showSubmenu: showOutpaintMenu,
            }] : []),
            ...(onSplitComplete ? [{
              icon: <Scissors size={14} />,
              label: '切分',
              action: 'split',
              onClick: () => { setShowSplitMenu(!showSplitMenu); setShowOutpaintMenu(false); setShowMoreMenu(false); },
              hasSubmenu: true,
              showSubmenu: showSplitMenu,
            }] : []),
            ...(onCameraAngleComplete ? [{
              icon: <Camera size={14} />,
              label: '镜头角度',
              action: 'cameraAngle',
              onClick: () => { setIsCameraAngleDialogOpen(true); setShowToolbar(false); },
            }] : []),
            {
              icon: null,
              label: '更多',
              action: 'more',
              onClick: () => { setShowMoreMenu(!showMoreMenu); setShowSplitMenu(false); setShowOutpaintMenu(false); },
              hasSubmenu: true,
              showSubmenu: showMoreMenu,
            },
          ].map((tool) => (
            <div key={tool.action} className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (tool.onClick) {
                    tool.onClick();
                  }
                }}
                className={`p-1.5 rounded-md text-text-primary dark:text-text-primary-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark transition-colors flex items-center gap-1 ${'showSubmenu' in tool && tool.showSubmenu ? 'bg-surface-hover dark:bg-surface-hover-dark' : ''}`}
                title={tool.label}
              >
                {tool.icon}
                {tool.hasSubmenu && <ChevronRight size={10} className={`transition-transform ${'showSubmenu' in tool && tool.showSubmenu ? '-rotate-90' : 'rotate-90'}`} />}
              </button>

              {tool.action === 'outpaint' && showOutpaintMenu && (
                <div className={`absolute left-1/2 -translate-x-1/2 py-1 rounded-lg bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-xl z-50 w-max flex flex-col ${submenuDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
                  {ASPECT_RATIO_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOutpaintComplete?.(opt.value);
                        setShowOutpaintMenu(false);
                        setShowToolbar(false);
                      }}
                      className="px-3 py-1.5 text-xs text-text-primary dark:text-text-primary-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark text-left"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {tool.action === 'split' && showSplitMenu && (
                <div className={`absolute left-1/2 -translate-x-1/2 py-1 rounded-lg bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-xl z-50 w-max flex flex-col ${submenuDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
                  {['2x2', '3x3', '4x4', '5x5'].map((size) => (
                    <button
                      key={size}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSplitComplete?.(size);
                        setShowSplitMenu(false);
                        setShowToolbar(false);
                      }}
                      className="px-3 py-1.5 text-xs text-text-primary dark:text-text-primary-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark text-left"
                    >
                      {size} 宫格
                    </button>
                  ))}
                </div>
              )}

              {tool.action === 'more' && showMoreMenu && (
                <div className={`absolute left-1/2 -translate-x-1/2 py-1 rounded-lg bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-xl z-50 w-max flex flex-col ${submenuDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
                  {/* 变清晰 - 分栏按钮 */}
                  <div className="flex items-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEnhanceComplete?.(); setShowMoreMenu(false); setShowToolbar(false); }}
                      className="flex-1 px-3 py-1.5 text-xs text-text-primary dark:text-text-primary-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark text-left flex items-center gap-2"
                      title="直接生成"
                    >
                      <Sparkles size={12} />变清晰
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowMoreMenu(false); setShowToolbar(false); setEnhanceSettingsOpen(true); }}
                      className="px-2 py-1.5 text-xs text-text-secondary dark:text-text-secondary-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark hover:text-accent border-l border-border dark:border-border-dark"
                      title="配置后生成"
                    >
                      <SlidersHorizontal size={12} />
                    </button>
                  </div>
                  {/* 去水印 - 分栏按钮 */}
                  <div className="flex items-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemoveWatermarkComplete?.(); setShowMoreMenu(false); setShowToolbar(false); }}
                      className="flex-1 px-3 py-1.5 text-xs text-text-primary dark:text-text-primary-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark text-left flex items-center gap-2"
                      title="直接生成"
                    >
                      <Eraser size={12} />去水印
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowMoreMenu(false); setShowToolbar(false); setWatermarkSettingsOpen(true); }}
                      className="px-2 py-1.5 text-xs text-text-secondary dark:text-text-secondary-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark hover:text-accent border-l border-border dark:border-border-dark"
                      title="配置后生成"
                    >
                      <SlidersHorizontal size={12} />
                    </button>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowMoreMenu(false); setShowToolbar(false); }}
                    className="px-3 py-1.5 text-xs text-text-primary dark:text-text-primary-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark text-left flex items-center gap-2"
                  >
                    <Sun size={12} />灯光色调
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        </>,
        document.body
      )}

      <CropDialog
        isOpen={isCropDialogOpen}
        onClose={() => setIsCropDialogOpen(false)}
        imageUrl={imageUrl}
        onCropComplete={handleCropComplete}
      />

      <RepaintDialog
        isOpen={isRepaintDialogOpen}
        onClose={() => setIsRepaintDialogOpen(false)}
        imageUrl={imageUrl}
        onRepaintComplete={handleRepaintComplete}
      />

      <ImagePreviewDialog
        isOpen={isPreviewDialogOpen}
        onClose={() => setIsPreviewDialogOpen(false)}
        images={[{ url: imageUrl }]}
        currentIndex={0}
        onIndexChange={() => {}}
      />

      <CameraAngleDialog
        isOpen={isCameraAngleDialogOpen}
        imageUrl={imageUrl}
        onClose={() => setIsCameraAngleDialogOpen(false)}
        onConfirm={(prompt) => {
          setIsCameraAngleDialogOpen(false);
          onCameraAngleComplete?.(prompt);
        }}
      />

      <GenerativeSettingsDialog
        isOpen={enhanceSettingsOpen}
        onClose={() => setEnhanceSettingsOpen(false)}
        onConfirm={(settings) => onEnhanceComplete?.(settings)}
        title="变清晰 - 生成配置"
        confirmLabel="生成"
        confirmIcon={<Sparkles size={11} />}
      />

      <GenerativeSettingsDialog
        isOpen={watermarkSettingsOpen}
        onClose={() => setWatermarkSettingsOpen(false)}
        onConfirm={(settings) => onRemoveWatermarkComplete?.(settings)}
        title="去水印 - 生成配置"
        confirmLabel="生成"
        confirmIcon={<Sparkles size={11} />}
      />
    </div>
  );
}
