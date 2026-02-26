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

    if (showToolbar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
          setShowToolbar(!showToolbar);
        }}
      >
        {children}
      </button>

      {showToolbar && (
        <div
          className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 p-2 backdrop-blur-sm transition-all z-10"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex flex-wrap justify-center gap-2 max-w-[80%]">
            {[
              { icon: <Expand size={16} />, label: '扩图', action: 'outpaint' },
              { icon: <Crop size={16} />, label: '裁剪', action: 'crop', onClick: () => setIsCropDialogOpen(true) },
              { icon: <Paintbrush size={16} />, label: '重绘', action: 'repaint' },
              { icon: <Paintbrush size={16} />, label: '局部重绘', action: 'inpaint' },
              { icon: <Camera size={16} />, label: '镜头角度', action: 'camera' },
              { icon: <Sun size={16} />, label: '灯光色调', action: 'lighting' },
            ].map((tool) => (
              <button
                key={tool.action}
                onClick={(e) => {
                  e.stopPropagation();
                  if (tool.onClick) {
                    tool.onClick();
                  }
                }}
                className="p-2 rounded-full bg-white/90 text-black hover:bg-white hover:scale-110 transition-all shadow-lg"
                title={tool.onClick ? tool.label : `${tool.label}（功能待接入）`}
              >
                {tool.icon}
              </button>
            ))}
          </div>
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
