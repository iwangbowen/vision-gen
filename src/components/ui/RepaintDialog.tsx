import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Eraser, Undo, Paintbrush, ZoomIn, ZoomOut, Move } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

interface RepaintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onRepaintComplete: (maskImageUrl: string, prompt: string) => void;
}

const BRUSH_COLORS = ['#FFFFFF', '#EF4444', '#F59E0B', '#22C55E', '#3B82F6', '#A855F7'];

export default function RepaintDialog({ isOpen, onClose, imageUrl, onRepaintComplete }: RepaintDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [brushSize, setBrushSize] = useState(20);
  const [isErasing, setIsErasing] = useState(false);
  const [isPanMode, setIsPanMode] = useState(false);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [brushColor, setBrushColor] = useState('#FFFFFF');
  const [zoom, setZoom] = useState(1);
  const sigCanvas = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingSnapshotRef = useRef<string | null>(null);
  const dragStateRef = useRef({
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    startScrollTop: 0,
  });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const renderWidth = Math.max(1, Math.round(dimensions.width * zoom));
  const renderHeight = Math.max(1, Math.round(dimensions.height * zoom));

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
          width: Math.round(img.width * scale),
          height: Math.round(img.height * scale)
        });
      };
      img.src = imageUrl;
    }
  }, [isOpen, imageUrl]);

  const handleClose = () => {
    setPrompt('');
    setZoom(1);
    setIsErasing(false);
    setIsPanMode(false);
    setIsDraggingCanvas(false);
    setBrushColor('#FFFFFF');
    pendingSnapshotRef.current = null;
    sigCanvas.current?.clear();
    onClose();
  };

  const handleComplete = () => {
    if (sigCanvas.current) {
      // Convert canvas to mask: non-black drawn pixels => white(mask), others => black(unmasked)
      const canvas = sigCanvas.current.getCanvas();
      const exportWidth = Math.max(1, dimensions.width || canvas.width);
      const exportHeight = Math.max(1, dimensions.height || canvas.height);

      const normalizedCanvas = document.createElement('canvas');
      normalizedCanvas.width = exportWidth;
      normalizedCanvas.height = exportHeight;
      const normalizedCtx = normalizedCanvas.getContext('2d');

      if (!normalizedCtx) {
        handleClose();
        return;
      }

      normalizedCtx.drawImage(canvas, 0, 0, exportWidth, exportHeight);

      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = exportWidth;
      maskCanvas.height = exportHeight;
      const ctx = maskCanvas.getContext('2d');

      if (ctx) {
        const sourceImage = normalizedCtx.getImageData(0, 0, exportWidth, exportHeight);
        const maskImage = ctx.createImageData(exportWidth, exportHeight);
        const src = sourceImage.data;
        const dst = maskImage.data;

        for (let i = 0; i < src.length; i += 4) {
          const alpha = src[i + 3];
          const isMasked = alpha > 0;
          const value = isMasked ? 255 : 0;

          dst[i] = value;
          dst[i + 1] = value;
          dst[i + 2] = value;
          dst[i + 3] = 255;
        }

        ctx.putImageData(maskImage, 0, 0);
        const maskImageUrl = maskCanvas.toDataURL('image/png');
        onRepaintComplete(maskImageUrl, prompt);
      }
    }
    handleClose();
  };

  const handleClear = () => {
    sigCanvas.current?.clear();
  };

  const clampZoom = (nextZoom: number) => Math.max(0.5, Math.min(3, nextZoom));

  const captureCanvasSnapshot = () => {
    const canvas = sigCanvas.current?.getCanvas();
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  };

  const setZoomClamped = (nextZoom: number) => {
    const clampedZoom = clampZoom(nextZoom);
    if (clampedZoom === zoom) return;
    pendingSnapshotRef.current = captureCanvasSnapshot();
    setZoom(clampedZoom);
  };

  useEffect(() => {
    if (!pendingSnapshotRef.current || !sigCanvas.current) return;
    const snapshot = pendingSnapshotRef.current;
    pendingSnapshotRef.current = null;

    requestAnimationFrame(() => {
      sigCanvas.current?.fromDataURL(snapshot, {
        width: renderWidth,
        height: renderHeight,
      });
    });
  }, [renderWidth, renderHeight, zoom]);

  useEffect(() => {
    const signaturePad = sigCanvas.current?.getSignaturePad();
    const padWithContext = signaturePad as unknown as { _ctx?: CanvasRenderingContext2D };
    if (!padWithContext?._ctx) return;
    padWithContext._ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
  }, [isErasing, renderWidth, renderHeight]);

  const handleCanvasWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.1 : -0.1;
    const nextZoom = clampZoom(zoom + delta);
    if (nextZoom === zoom) return;
    pendingSnapshotRef.current = captureCanvasSnapshot();
    setZoom(nextZoom);
  };

  const handleCanvasPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanMode || zoom <= 1 || event.button !== 0) return;
    event.preventDefault();
    setIsDraggingCanvas(true);
    dragStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: event.currentTarget.scrollLeft,
      startScrollTop: event.currentTarget.scrollTop,
    };
  };

  const handleCanvasPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanMode || !isDraggingCanvas || zoom <= 1) return;
    event.preventDefault();
    const deltaX = event.clientX - dragStateRef.current.startX;
    const deltaY = event.clientY - dragStateRef.current.startY;
    event.currentTarget.scrollLeft = dragStateRef.current.startScrollLeft - deltaX;
    event.currentTarget.scrollTop = dragStateRef.current.startScrollTop - deltaY;
  };

  const stopCanvasDrag = () => {
    if (isDraggingCanvas) {
      setIsDraggingCanvas(false);
    }
  };

  let panCursorClass = 'cursor-default';
  if (isPanMode && zoom > 1) {
    panCursorClass = isDraggingCanvas ? 'cursor-grabbing' : 'cursor-grab';
  }

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl h-[90vh] max-h-[90vh] bg-surface dark:bg-surface-dark rounded-xl shadow-2xl border border-border dark:border-border-dark overflow-hidden flex flex-col">
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
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-w-0 min-h-0">
          {/* Canvas Area */}
          <div
            ref={containerRef}
            onWheel={handleCanvasWheel}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={stopCanvasDrag}
            onPointerCancel={stopCanvasDrag}
            onPointerLeave={stopCanvasDrag}
            className={`flex-1 min-w-0 p-4 bg-canvas-bg dark:bg-canvas-bg-dark relative overflow-auto min-h-75 ${panCursorClass}`}
          >
            {dimensions.width > 0 && (
              <div className={`min-w-full min-h-full flex ${zoom > 1 ? 'items-start justify-start' : 'items-center justify-center'}`}>
                <div
                  className="relative shrink-0"
                  style={{
                    width: renderWidth,
                    height: renderHeight,
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  <SignatureCanvas
                    ref={sigCanvas}
                    penColor={brushColor}
                    canvasProps={{
                      width: renderWidth,
                      height: renderHeight,
                      className: `absolute inset-0 ${isPanMode ? 'pointer-events-none cursor-grab' : 'cursor-crosshair'}`
                    }}
                    minWidth={brushSize}
                    maxWidth={brushSize}
                    dotSize={brushSize}
                    velocityFilterWeight={0}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Controls Area */}
          <div className="w-full md:w-64 md:shrink-0 p-4 border-t md:border-t-0 md:border-l border-border dark:border-border-dark flex flex-col gap-4 bg-surface dark:bg-surface-dark">
            <div className="space-y-2">
              <p className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark">
                图片缩放（{Math.round(zoom * 100)}%）
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomClamped(zoom - 0.1)}
                  className="p-1.5 rounded-md bg-surface-hover dark:bg-surface-hover-dark text-text-primary dark:text-text-primary-dark hover:bg-border dark:hover:bg-border-dark transition-colors"
                  title="缩小"
                >
                  <ZoomOut size={14} />
                </button>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoomClamped(Number(e.target.value))}
                  className="w-full accent-accent"
                />
                <button
                  type="button"
                  onClick={() => setZoomClamped(zoom + 0.1)}
                  className="p-1.5 rounded-md bg-surface-hover dark:bg-surface-hover-dark text-text-primary dark:text-text-primary-dark hover:bg-border dark:hover:bg-border-dark transition-colors"
                  title="放大"
                >
                  <ZoomIn size={14} />
                </button>
              </div>
              <p className="text-[10px] text-text-secondary dark:text-text-secondary-dark">
                支持滚轮缩放；放大后可切到“移动”模式拖拽查看细节。
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark">
                画笔大小
              </p>
              <input
                type="range"
                min="5"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark">
                画笔颜色
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                {BRUSH_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setIsPanMode(false);
                      setIsErasing(false);
                      setBrushColor(color);
                    }}
                    className={`w-5 h-5 rounded-full border transition-transform ${
                      brushColor === color && !isErasing
                        ? 'ring-2 ring-accent scale-105 border-white'
                        : 'border-border dark:border-border-dark'
                    }`}
                    style={{ backgroundColor: color }}
                    title={`选择颜色 ${color}`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-text-secondary dark:text-text-secondary-dark leading-relaxed">
                颜色用于区分涂抹区域；提交时会统一作为重绘区域。
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPanMode(true)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isPanMode
                    ? 'bg-accent text-white dark:text-black'
                    : 'bg-surface-hover dark:bg-surface-hover-dark text-text-primary dark:text-text-primary-dark'
                }`}
              >
                <Move size={14} />
                移动
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPanMode(false);
                  setIsErasing(false);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isErasing || isPanMode
                    ? 'bg-surface-hover dark:bg-surface-hover-dark text-text-primary dark:text-text-primary-dark'
                    : 'bg-accent text-white dark:text-black'
                }`}
              >
                <Paintbrush size={14} />
                画笔
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPanMode(false);
                  setIsErasing(true);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isErasing && !isPanMode
                    ? 'bg-accent text-white dark:text-black'
                    : 'bg-surface-hover dark:bg-surface-hover-dark text-text-primary dark:text-text-primary-dark'
                }`}
              >
                <Eraser size={14} />
                橡皮擦
              </button>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-surface-hover dark:bg-surface-hover-dark text-text-primary dark:text-text-primary-dark hover:bg-border dark:hover:bg-border-dark transition-colors"
            >
              <Undo size={14} />
              清除蒙版
            </button>

            <div className="space-y-2 flex-1 flex flex-col">
              <p className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark">
                重绘提示词
              </p>
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
