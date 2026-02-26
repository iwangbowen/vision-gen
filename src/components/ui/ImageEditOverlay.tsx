import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Expand, Crop, Paintbrush, Camera, Sun, Eye, Scissors, ChevronRight } from 'lucide-react';
import CropDialog from './CropDialog';
import RepaintDialog from './RepaintDialog';
import ImagePreviewDialog from './ImagePreviewDialog';

interface ImageEditOverlayProps {
  readonly imageUrl: string;
  readonly onCropComplete: (croppedImageUrl: string) => void;
  readonly onRepaintComplete?: (maskImageUrl: string, prompt: string, options: { gridSize: string; aspectRatio: string; imageSize: string; style: string }) => void;
  readonly onSplitComplete?: (gridSize?: string) => void;
  readonly children: React.ReactNode;
}

export default function ImageEditOverlay({ imageUrl, onCropComplete, onRepaintComplete, onSplitComplete, children }: ImageEditOverlayProps) {
  const [showToolbar, setShowToolbar] = useState(false);
  const [showSplitMenu, setShowSplitMenu] = useState(false);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [isRepaintDialogOpen, setIsRepaintDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowToolbar(false);
        setShowSplitMenu(false);
      }
    };

    const handleCloseOtherToolbars = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail !== containerRef.current) {
        setShowToolbar(false);
        setShowSplitMenu(false);
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
          const newShowToolbar = !showToolbar;
          setShowToolbar(newShowToolbar);
          if (newShowToolbar && containerRef.current) {
            // Calculate toolbar position
            const rect = containerRef.current.getBoundingClientRect();
            setToolbarPosition({
              top: rect.top - 10, // 10px above the image
              left: rect.left + rect.width / 2,
            });
            document.dispatchEvent(new CustomEvent('imageEditToolbarOpened', { detail: containerRef.current }));
          }
        }}
      >
        {children}
      </div>

      {showToolbar && createPortal(
        <div
          className="fixed flex items-center justify-center gap-1 p-1.5 rounded-lg bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-xl z-50 w-max"
          style={{
            top: `${toolbarPosition.top}px`,
            left: `${toolbarPosition.left}px`,
            transform: 'translate(-50%, -100%)',
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {[
            { icon: <Expand size={14} />, label: '扩图', action: 'outpaint' },
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
            ...(onSplitComplete ? [{
              icon: <Scissors size={14} />,
              label: '切分',
              action: 'split',
              onClick: () => setShowSplitMenu(!showSplitMenu),
              hasSubmenu: true
            }] : []),
            { icon: <Camera size={14} />, label: '镜头角度', action: 'camera' },
            { icon: <Sun size={14} />, label: '灯光色调', action: 'lighting' },
          ].map((tool) => (
            <div key={tool.action} className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (tool.onClick) {
                    tool.onClick();
                  }
                }}
                className={`p-1.5 rounded-md text-text-primary dark:text-text-primary-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark transition-colors flex items-center gap-1 ${tool.action === 'split' && showSplitMenu ? 'bg-surface-hover dark:bg-surface-hover-dark' : ''}`}
                title={tool.onClick ? tool.label : `${tool.label}（功能待接入）`}
              >
                {tool.icon}
                {tool.hasSubmenu && <ChevronRight size={10} className={`transition-transform ${showSplitMenu ? '-rotate-90' : 'rotate-90'}`} />}
              </button>

              {tool.action === 'split' && showSplitMenu && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 py-1 rounded-lg bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-xl z-50 w-max flex flex-col">
                  {['2x2', '3x3', '4x4'].map((size) => (
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
            </div>
          ))}
        </div>,
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
        imageUrl={imageUrl}
      />
    </div>
  );
}
