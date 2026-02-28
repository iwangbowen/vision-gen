import { X, Settings as SettingsIcon } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { GEMINI_IMAGE_MODELS, GEMINI_TEXT_MODELS } from '../../services/llm/gemini';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputClass = 'w-full px-2.5 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-accent/50 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500';
const labelClass = 'block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-0.5';

export default function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { gemini, updateGeminiSettings } = useSettingsStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 w-full h-full cursor-default"
        onClick={onClose}
        aria-label="Close settings dialog"
      />
      <div className="relative w-full max-w-sm bg-white dark:bg-zinc-950 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 text-sm font-semibold">
            <SettingsIcon size={14} />
            <h2>Settings</h2>
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
          {/* Gemini Settings */}
          <div className="space-y-3">
                <div>
                  <div className={labelClass}>API Key</div>
                  <input
                    type="password"
                    value={gemini.apiKey}
                    onChange={(e) => updateGeminiSettings({ apiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className={inputClass}
                  />
                </div>
                <div>
                  <div className={labelClass}>Base URL</div>
                  <input
                    type="text"
                    value={gemini.baseUrl}
                    onChange={(e) => updateGeminiSettings({ baseUrl: e.target.value })}
                    placeholder="https://generativelanguage.googleapis.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <div className={labelClass}>Image Model</div>
                  <select
                    value={gemini.model}
                    onChange={(e) => updateGeminiSettings({ model: e.target.value })}
                    className={inputClass}
                  >
                    {GEMINI_IMAGE_MODELS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className={labelClass}>Text/Vision Model</div>
                  <select
                    value={gemini.textModel}
                    onChange={(e) => updateGeminiSettings({ textModel: e.target.value })}
                    className={inputClass}
                  >
                    {GEMINI_TEXT_MODELS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-accent text-white dark:text-black rounded-lg text-xs font-medium hover:bg-accent/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
