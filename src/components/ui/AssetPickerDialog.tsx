import { X } from 'lucide-react';
import AssetBrowser from './AssetBrowser';
import type { Asset } from '../../types';

interface AssetPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: Asset) => void;
}

export default function AssetPickerDialog({ open, onClose, onSelect }: AssetPickerDialogProps) {
  if (!open) return null;

  const handleSelect = (asset: Asset) => {
    onSelect(asset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="关闭"
      />

      {/* Dialog */}
      <div className="relative w-[480px] max-h-[70vh] rounded-xl border border-border dark:border-border-dark bg-panel-bg dark:bg-panel-bg-dark shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-border-dark">
          <h3 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
            从资产库选择图片
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface-hover dark:hover:bg-surface-hover-dark text-text-secondary dark:text-text-secondary-dark"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          <AssetBrowser onSelect={handleSelect} columns={4} />
        </div>
      </div>
    </div>
  );
}
