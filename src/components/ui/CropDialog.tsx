import { useState, useRef } from 'react';
import { X, Check } from 'lucide-react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface CropDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function CropDialog({ isOpen, onClose, imageUrl, onCropComplete }: CropDialogProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const handleClose = () => {
    setCrop(undefined);
    setCompletedCrop(undefined);
    onClose();
  };

  if (!isOpen) return null;

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    // Default crop to center 90%
    setCrop(centerAspectCrop(width, height, 1));
  };

  const handleComplete = async () => {
    if (imgRef.current && completedCrop?.width && completedCrop?.height) {
      const canvas = document.createElement('canvas');
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY
      );

      const base64Image = canvas.toDataURL('image/jpeg');
      onCropComplete(base64Image);
    }
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 w-full h-full cursor-default"
        onClick={handleClose}
        aria-label="Close crop dialog"
      />
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            裁剪图片
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            className="max-h-full"
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Crop preview"
              onLoad={onImageLoad}
              crossOrigin="anonymous"
              className="max-h-[60vh] object-contain"
            />
          </ReactCrop>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleComplete}
            disabled={!completedCrop?.width || !completedCrop?.height}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-accent text-white dark:text-black hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={14} />
            确认裁剪
          </button>
        </div>
      </div>
    </div>
  );
}
