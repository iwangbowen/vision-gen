import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Eraser, Undo, Paintbrush } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

interface RepaintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onRepaintComplete: (maskImageUrl: string, prompt: string) => void;
}

export default function RepaintDialog({ isOpen, onClose, imageUrl, onRepaintComplete }: RepaintDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [brushSize, setBrushSize] = useState(20);
  const [isErasing, setIsErasing] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const img = new Image();
      img.onload = () => {
        const containerWidth = containerRef.current?.clientWidth || 500;
        const containerHeight = containerRef.current?.clientHeight || 400;

        const scale = Math.min(
          containerWidth / img.width,
          containerHeight / img.height
        );

        setDimensions({
          width: img.width * scale,
          height: img.height * scale
        });
      };
      img.src = imageUrl;
    }
  }, [isOpen, imageUrl]);

  const handleClose = () => {
    setPrompt('');
    sigCanvas.current?.clear();
    onClose();
  };

  if (!isOpen) return null;

  const handleComplete = () => {
    if (sigCanvas.current) {
      // Get the mask image (white background, black strokes for mask)
      const canvas = sigCanvas.current.getCanvas();
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      const ctx = maskCanvas.getContext('2d');

      if (ctx) {
        // Fill with black (unmasked area)
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

        // Draw the strokes as white (masked area)
        ctx.drawImage(canvas, 0, 0);

        // Convert to data URL
        const maskImageUrl = maskCanvas.toDataURL('image/png');
        onRepaintComplete(maskImageUrl, prompt);
      }
    }
    handleClose();
  };

  const handleClear = () => {
    sigCanvas.current?.clear();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-surface dark:bg-surface-dark rounded-xl shadow-2xl border border-border dark:border-border-dark overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-border-dark">
          <h2 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
            局部重绘
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-md text-text-secondary dark:text-text-secondary-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Canvas Area */}
          <div
            ref={containerRef}
            className="flex-1 p-4 flex items-center justify-center bg-canvas-bg dark:bg-canvas-bg-dark relative overflow-hidden min-h-[300px]"
          >
            {dimensions.width > 0 && (
              <div
                className="relative"
                style={{
                  width: dimensions.width,
                  height: dimensions.height,
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor={isErasing ? 'rgba(0,0,0,1)' : 'rgba(255, 255, 255, 0.8)'}
                  canvasProps={{
                    width: dimensions.width,
                    height: dimensions.height,
                    className: 'absolute inset-0 cursor-crosshair mix-blend-normal'
                  }}
                  minWidth={brushSize}
                  maxWidth={brushSize}
                  dotSize={brushSize}
                  velocityFilterWeight={0}
                />
              </div>
            )}
          </div>

          {/* Controls Area */}
          <div className="w-full md:w-64 p-4 border-t md:border-t-0 md:border-l border-border dark:border-border-dark flex flex-col gap-4 bg-surface dark:bg-surface-dark">
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark">
                画笔大小
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsErasing(false)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  !isErasing
                    ? 'bg-accent text-white dark:text-black'
                    : 'bg-surface-hover dark:bg-surface-hover-dark text-text-primary dark:text-text-primary-dark'
                }`}
              >
                <Paintbrush size={14} />
                画笔
              </button>
              <button
                onClick={() => setIsErasing(true)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isErasing
                    ? 'bg-accent text-white dark:text-black'
                    : 'bg-surface-hover dark:bg-surface-hover-dark text-text-primary dark:text-text-primary-dark'
                }`}
              >
                <Eraser size={14} />
                橡皮擦
              </button>
            </div>

            <button
              onClick={handleClear}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-surface-hover dark:bg-surface-hover-dark text-text-primary dark:text-text-primary-dark hover:bg-border dark:hover:bg-border-dark transition-colors"
            >
              <Undo size={14} />
              清除蒙版
            </button>

            <div className="space-y-2 flex-1 flex flex-col">
              <label className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark">
                重绘提示词
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="描述你想要在涂抹区域生成的内容..."
                className="w-full flex-1 min-h-25 p-2 text-sm bg-canvas-bg dark:bg-canvas-bg-dark border border-border dark:border-border-dark rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-accent text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-text-secondary dark:text-text-secondary-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleComplete}
            disabled={!prompt.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-accent text-white dark:text-black hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={14} />
            确认重绘
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
