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
    { keys: ['Ctrl', 'C'], description: '复制节点' },
    { keys: ['Ctrl', 'X'], description: '剪切节点' },
    { keys: ['Ctrl', 'V'], description: '粘贴节点' },
    { keys: ['Delete'], description: '删除节点' },
    { keys: ['Ctrl', 'B'], description: '资产面板' },
    { keys: ['Ctrl', 'Alt', 'B'], description: '属性面板' },
    { keys: ['Ctrl', 'Alt', 'P'], description: '轨道面板' },
    { keys: ['Ctrl', 'K', 'Ctrl', 'S'], description: '快捷键' },
  ];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 w-full h-full cursor-default"
        onClick={onClose}
        aria-label="Close shortcuts dialog"
      />
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 text-xs font-semibold">
            <Keyboard size={13} />
            <h2>快捷键</h2>
          </div>
          <button
            onClick={onClose}
            className="p-0.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content - Two columns */}
        <div className="overflow-y-auto px-3.5 py-2.5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.description} className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-zinc-600 dark:text-zinc-300 truncate">
                  {shortcut.description}
                </span>
                <div className="flex items-center gap-0.5 shrink-0">
                  {shortcut.keys.map((key, i) => (
                    <span
                      key={`${key}-${i}`}
                      className="px-1.5 py-0.5 text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded border border-zinc-200 dark:border-zinc-700 leading-tight"
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
