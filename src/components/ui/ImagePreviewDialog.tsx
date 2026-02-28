import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

export interface PreviewImage {
  url: string;
  label?: string;
}

const AUTOPLAY_INTERVALS = [
  { label: '2s', value: 2000 },
  { label: '3s', value: 3000 },
  { label: '5s', value: 5000 },
  { label: '10s', value: 10000 },
];

interface ImagePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  images: PreviewImage[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export default function ImagePreviewDialog({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
}: ImagePreviewDialogProps) {
  const [autoPlay, setAutoPlay] = useState(false);
  const [intervalMs, setIntervalMs] = useState(3000);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onIndexChange(currentIndex - 1);
  }, [hasPrev, currentIndex, onIndexChange]);

  const goNext = useCallback(() => {
    if (hasNext) onIndexChange(currentIndex + 1);
  }, [hasNext, currentIndex, onIndexChange]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    globalThis.addEventListener('keydown', handler);
    return () => globalThis.removeEventListener('keydown', handler);
  }, [isOpen, onClose, goPrev, goNext]);

  // Auto-play
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!autoPlay || !isOpen) return;
    timerRef.current = setInterval(() => {
      const nextIndex = currentIndex >= images.length - 1 ? 0 : currentIndex + 1;
      onIndexChange(nextIndex);
    }, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoPlay, intervalMs, isOpen, images.length, currentIndex, onIndexChange]);

  // Stop auto-play when dialog closes
  useEffect(() => {
    if (!isOpen) setAutoPlay(false);
  }, [isOpen]);

  // Focus container on open
  useEffect(() => {
    if (isOpen) containerRef.current?.focus();
  }, [isOpen]);

  if (!isOpen || images.length === 0) return null;

  const current = images[currentIndex] ?? images[0];

  return createPortal(
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      onClick={onClose}
      tabIndex={-1}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
        aria-label="ClosePreview"
      >
        <X size={24} />
      </button>

      {/* Left arrow */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
          aria-label="Previous"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Right arrow */}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
          aria-label="Next"
        >
          <ChevronRight size={28} />
        </button>
      )}

      {/* Image area */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={current.url}
          alt={current.label || 'Preview'}
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
        />

        {/* Bottom bar: counter + auto-play controls */}
        <div className="mt-3 flex items-center gap-3 bg-black/60 rounded-full px-4 py-2 text-white text-xs select-none">
          {/* Image counter */}
          <span className="tabular-nums">
            {currentIndex + 1} / {images.length}
          </span>

          <div className="w-px h-4 bg-white/30" />

          {/* Auto-play toggle */}
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className="flex items-center gap-1 hover:text-accent transition-colors"
            aria-label={autoPlay ? 'Stop Autoplay' : 'Start Autoplay'}
          >
            {autoPlay ? <Pause size={14} /> : <Play size={14} />}
            <span>{autoPlay ? 'Pause' : 'Play'}</span>
          </button>

          {/* Interval selector */}
          {AUTOPLAY_INTERVALS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setIntervalMs(opt.value)}
              className={`px-2 py-0.5 rounded-full transition-colors ${
                intervalMs === opt.value
                  ? 'bg-accent text-white'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
