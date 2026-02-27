import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check } from 'lucide-react';
import GenerativeSettings from './GenerativeSettings';

interface GenerativeSettingsDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onConfirm: (settings: { gridSize: string; aspectRatio: string; imageSize: string; style: string }) => void;
  readonly title: string;
  readonly initialValues?: { gridSize?: string; aspectRatio?: string; imageSize?: string; style?: string };
}

export default function GenerativeSettingsDialog({ isOpen, onClose, onConfirm, title, initialValues }: GenerativeSettingsDialogProps) {
  const [settings, setSettings] = useState({
    gridSize: initialValues?.gridSize || '1x1',
    aspectRatio: initialValues?.aspectRatio || '16:9',
    imageSize: initialValues?.imageSize || '1k',
    style: initialValues?.style || '',
  });

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div
        className="bg-surface dark:bg-surface-dark rounded-xl shadow-2xl w-lg max-w-[90vw] overflow-hidden flex flex-col border border-border dark:border-border-dark animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border dark:border-border-dark">
          <h3 className="text-xs font-semibold text-text-primary dark:text-text-primary-dark">{title}</h3>
          <button
            onClick={onClose}
            className="p-0.5 rounded text-text-secondary dark:text-text-secondary-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-3.5 py-3 overflow-y-auto max-h-[50vh]">
          <GenerativeSettings
            gridSize={settings.gridSize}
            aspectRatio={settings.aspectRatio}
            imageSize={settings.imageSize}
            style={settings.style}
            onChange={(key, value) => setSettings(prev => ({ ...prev, [key]: value }))}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-3.5 py-2.5 border-t border-border dark:border-border-dark bg-canvas-bg/50 dark:bg-canvas-bg-dark/50">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md text-[11px] font-medium text-text-secondary dark:text-text-secondary-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => {
              onConfirm(settings);
              onClose();
            }}
            className="px-3 py-1 rounded-md text-[11px] font-medium bg-accent text-white dark:text-black hover:bg-accent-hover transition-colors flex items-center gap-1"
          >
            <Check size={11} />
            确认
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
