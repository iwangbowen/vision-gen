import { useState } from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import type { LLMProvider } from '../../stores/settingsStore';
import { GEMINI_IMAGE_MODELS } from '../../services/llm/gemini';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputClass = 'w-full px-2.5 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-accent/50 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500';
const labelClass = 'block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-0.5';

export default function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { provider, gemini, custom, setProvider, updateGeminiSettings, updateCustomSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<LLMProvider>(provider);

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
            <h2>设置</h2>
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
          <div className="mb-4">
            <div className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
              默认模型提供商
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  setProvider('gemini');
                  setActiveTab('gemini');
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors border ${
                  provider === 'gemini'
                    ? 'bg-accent text-white dark:text-black border-accent'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                Gemini
              </button>
              <button
                onClick={() => {
                  setProvider('custom');
                  setActiveTab('custom');
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors border ${
                  provider === 'custom'
                    ? 'bg-accent text-white dark:text-black border-accent'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                自定义 (OpenAI)
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-3">
            <button
              onClick={() => setActiveTab('gemini')}
              className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'gemini'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              Gemini
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'custom'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              自定义
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-3">
            {activeTab === 'gemini' && (
              <>
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
                  <div className={labelClass}>图像模型</div>
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
              </>
            )}

            {activeTab === 'custom' && (
              <>
                <div>
                  <div className={labelClass}>API Key</div>
                  <input
                    type="password"
                    value={custom.apiKey}
                    onChange={(e) => updateCustomSettings({ apiKey: e.target.value })}
                    placeholder="sk-..."
                    className={inputClass}
                  />
                </div>
                <div>
                  <div className={labelClass}>Base URL</div>
                  <input
                    type="text"
                    value={custom.baseUrl}
                    onChange={(e) => updateCustomSettings({ baseUrl: e.target.value })}
                    placeholder="https://api.openai.com/v1"
                    className={inputClass}
                  />
                </div>
                <div>
                  <div className={labelClass}>Model</div>
                  <input
                    type="text"
                    value={custom.model}
                    onChange={(e) => updateCustomSettings({ model: e.target.value })}
                    placeholder="gpt-4o"
                    className={inputClass}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-accent text-white dark:text-black rounded-lg text-xs font-medium hover:bg-accent/90 transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
