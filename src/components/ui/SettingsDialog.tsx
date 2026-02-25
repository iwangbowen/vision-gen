import { useState } from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import type { LLMProvider } from '../../stores/settingsStore';
import { GEMINI_IMAGE_MODELS } from '../../services/llm/gemini';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputClass = 'w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500';
const labelClass = 'block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1';

export default function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { provider, gemini, custom, setProvider, updateGeminiSettings, updateCustomSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<LLMProvider>(provider);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold">
            <SettingsIcon size={20} />
            <h2>设置</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-2">
              默认模型提供商
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setProvider('gemini');
                  setActiveTab('gemini');
                }}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors border ${
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
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors border ${
                  provider === 'custom'
                    ? 'bg-accent text-white dark:text-black border-accent'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                自定义 (兼容 OpenAI)
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-4">
            <button
              onClick={() => setActiveTab('gemini')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'gemini'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              Gemini 设置
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'custom'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              自定义设置
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === 'gemini' && (
              <>
                <div>
                  <label className={labelClass}>API Key</label>
                  <input
                    type="password"
                    value={gemini.apiKey}
                    onChange={(e) => updateGeminiSettings({ apiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Base URL</label>
                  <input
                    type="text"
                    value={gemini.baseUrl}
                    onChange={(e) => updateGeminiSettings({ baseUrl: e.target.value })}
                    placeholder="https://generativelanguage.googleapis.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>图像模型</label>
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
                  <label className={labelClass}>API Key</label>
                  <input
                    type="password"
                    value={custom.apiKey}
                    onChange={(e) => updateCustomSettings({ apiKey: e.target.value })}
                    placeholder="sk-..."
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Base URL</label>
                  <input
                    type="text"
                    value={custom.baseUrl}
                    onChange={(e) => updateCustomSettings({ baseUrl: e.target.value })}
                    placeholder="https://api.openai.com/v1"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Model</label>
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
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-accent text-white dark:text-black rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
