import { X, Keyboard } from 'lucide-react';

interface ShortcutsDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export default function ShortcutsDialog({ isOpen, onClose }: ShortcutsDialogProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['Ctrl', 'Z'], description: '撤销' },
    { keys: ['Ctrl', 'Shift', 'Z'], description: '重做' },
    { keys: ['Ctrl', 'C'], description: '复制选中节点' },
    { keys: ['Ctrl', 'X'], description: '剪切选中节点' },
    { keys: ['Ctrl', 'V'], description: '粘贴节点' },
    { keys: ['Delete'], description: '删除选中节点' },
    { keys: ['Ctrl', 'B'], description: '显示/隐藏左侧资产面板' },
    { keys: ['Ctrl', 'Alt', 'B'], description: '显示/隐藏右侧属性面板' },
    { keys: ['Ctrl', 'Alt', 'P'], description: '显示/隐藏底部轨道面板' },
  ];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 w-full h-full cursor-default"
        onClick={onClose}
        aria-label="Close shortcuts dialog"
      />
      <div className="relative w-full max-w-sm bg-white dark:bg-zinc-950 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 text-sm font-semibold">
            <Keyboard size={14} />
            <h2>快捷键</h2>
          </div>
          <button
            onClick={onClose}
            className="p-0.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.description} className="flex items-center justify-between">
                <span className="text-sm text-zinc-600 dark:text-zinc-300">
                  {shortcut.description}
                </span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key) => (
                    <span
                      key={key}
                      className="px-2 py-1 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded border border-zinc-200 dark:border-zinc-700"
                    >
                      {key}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
