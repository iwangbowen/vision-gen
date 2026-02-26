import { useState, useEffect, useRef } from 'react';
import { Expand, Crop, Paintbrush, Camera, Sun } from 'lucide-react';
import CropDialog from './CropDialog';

interface ImageEditOverlayProps {
  readonly imageUrl: string;
  readonly onCropComplete: (croppedImageUrl: string) => void;
  readonly children: React.ReactNode;
}

export default function ImageEditOverlay({ imageUrl, onCropComplete, children }: ImageEditOverlayProps) {
  const [showToolbar, setShowToolbar] = useState(false);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowToolbar(false);
      }
    };

    const handleCloseOtherToolbars = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail !== containerRef.current) {
        setShowToolbar(false);
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

  return (
    <div className="relative group w-full h-full" ref={containerRef}>
      <button
        type="button"
        className="w-full h-full cursor-pointer block p-0 m-0 border-none bg-transparent text-left"
        onClick={() => {
          const newShowToolbar = !showToolbar;
          setShowToolbar(newShowToolbar);
          if (newShowToolbar) {
            document.dispatchEvent(new CustomEvent('imageEditToolbarOpened', { detail: containerRef.current }));
          }
        }}
      >
        {children}
      </button>

      {showToolbar && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex items-center justify-center gap-1 p-1.5 rounded-lg bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-xl z-50 w-max"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {[
            { icon: <Expand size={14} />, label: '扩图', action: 'outpaint' },
            { icon: <Crop size={14} />, label: '裁剪', action: 'crop', onClick: () => setIsCropDialogOpen(true) },
            { icon: <Paintbrush size={14} />, label: '重绘', action: 'repaint' },
            { icon: <Paintbrush size={14} />, label: '局部重绘', action: 'inpaint' },
            { icon: <Camera size={14} />, label: '镜头角度', action: 'camera' },
            { icon: <Sun size={14} />, label: '灯光色调', action: 'lighting' },
          ].map((tool) => (
            <button
              key={tool.action}
              onClick={(e) => {
                e.stopPropagation();
                if (tool.onClick) {
                  tool.onClick();
                }
              }}
              className="p-1.5 rounded-md text-text-primary dark:text-text-primary-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark transition-colors"
              title={tool.onClick ? tool.label : `${tool.label}（功能待接入）`}
            >
              {tool.icon}
            </button>
          ))}
        </div>
      )}

      <CropDialog
        isOpen={isCropDialogOpen}
        onClose={() => setIsCropDialogOpen(false)}
        imageUrl={imageUrl}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
