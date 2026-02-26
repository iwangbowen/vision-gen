import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';
import { useCanvasStore } from '../../stores/canvasStore';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { tasks, removeTask, clearCompletedTasks } = useTaskStore();
  const { setSelectedNodeId } = useCanvasStore();

  const activeTasks = tasks.filter(t => t.status === 'generating');
  const completedTasks = tasks.filter(t => t.status !== 'generating');

  // Auto-close completed tasks after 5 seconds
  useEffect(() => {
    const timeouts = completedTasks.map(task => {
      return setTimeout(() => {
        removeTask(task.id);
      }, 5000);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [completedTasks, removeTask]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-md transition-colors hover:bg-surface-hover dark:hover:bg-surface-hover-dark text-text-secondary dark:text-text-secondary-dark"
        title="通知中心"
      >
        <Bell size={15} />
        {activeTasks.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-transparent border-none cursor-default"
            onClick={() => setIsOpen(false)}
            aria-label="Close notifications"
          />
          <div className="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-y-auto custom-scrollbar z-50 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-border dark:border-border-dark sticky top-0 bg-surface dark:bg-surface-dark z-10">
              <h3 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                通知中心 {activeTasks.length > 0 ? `(${activeTasks.length} 个进行中)` : ''}
              </h3>
              {completedTasks.length > 0 && (
                <button
                  onClick={clearCompletedTasks}
                  className="text-xs text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors"
                >
                  清除已完成
                </button>
              )}
            </div>

            <div className="p-2 space-y-2">
              {tasks.length === 0 ? (
                <div className="p-4 text-center text-sm text-text-secondary dark:text-text-secondary-dark">
                  暂无通知
                </div>
              ) : (
                tasks.map(task => (
                  <button
                    key={task.id}
                    className="w-full text-left p-3 rounded-lg bg-canvas-bg dark:bg-canvas-bg-dark border border-border dark:border-border-dark flex flex-col gap-2 cursor-pointer hover:border-emerald-500/50 transition-colors"
                    onClick={() => {
                      setSelectedNodeId(task.nodeId);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="p-1.5 rounded-md bg-surface dark:bg-surface-dark shrink-0">
                          <ImageIcon size={14} className="text-emerald-500" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-xs font-medium text-text-primary dark:text-text-primary-dark truncate">
                            {task.type === 'text2image' ? '文生图' : '图生图'}
                          </span>
                          <span className="text-[10px] text-text-secondary dark:text-text-secondary-dark truncate">
                            {task.prompt || '无提示词'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTask(task.id);
                        }}
                        className="p-1 rounded-md hover:bg-surface dark:hover:bg-surface-dark text-text-secondary dark:text-text-secondary-dark shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {task.status === 'generating' && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-emerald-500 flex items-center gap-1">
                            <Loader2 size={10} className="animate-spin" />
                            生成中...
                          </span>
                          <span className="text-text-secondary dark:text-text-secondary-dark font-medium">
                            {task.progress}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-surface dark:bg-surface-dark rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {task.status === 'done' && (
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-500">
                        <CheckCircle2 size={12} />
                        <span>已完成</span>
                      </div>
                    )}
                    {task.status === 'error' && (
                      <div className="flex items-center gap-1.5 text-[10px] text-red-500">
                        <AlertCircle size={12} />
                        <span className="truncate" title={task.error}>
                          {task.error || '生成失败'}
                        </span>
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
