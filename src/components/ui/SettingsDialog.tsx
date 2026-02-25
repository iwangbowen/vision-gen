import { useState } from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import type { LLMProvider } from '../../stores/settingsStore';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { provider, gemini, custom, setProvider, updateGeminiSettings, updateCustomSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<LLMProvider>(provider);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface dark:bg-surface-dark rounded-xl shadow-2xl border border-border dark:border-border-dark overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-border-dark">
          <div className="flex items-center gap-2 text-text-primary dark:text-text-primary-dark font-semibold">
            <SettingsIcon size={20} />
            <h2>设置</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-text-secondary dark:text-text-secondary-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
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
                    ? 'bg-accent text-white border-accent'
                    : 'bg-surface dark:bg-surface-dark text-text-secondary dark:text-text-secondary-dark border-border dark:border-border-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark'
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
                    ? 'bg-accent text-white border-accent'
                    : 'bg-surface dark:bg-surface-dark text-text-secondary dark:text-text-secondary-dark border-border dark:border-border-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark'
                }`}
              >
                自定义 (兼容 OpenAI)
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border dark:border-border-dark mb-4">
            <button
              onClick={() => setActiveTab('gemini')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'gemini'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark'
              }`}
            >
              Gemini 设置
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'custom'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark'
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
                  <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={gemini.apiKey}
                    onChange={(e) => updateGeminiSettings({ apiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-sm text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">
                    Base URL
                  </label>
                  <input
                    type="text"
                    value={gemini.baseUrl}
                    onChange={(e) => updateGeminiSettings({ baseUrl: e.target.value })}
                    placeholder="https://generativelanguage.googleapis.com/v1beta"
                    className="w-full px-3 py-2 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-sm text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    value={gemini.model}
                    onChange={(e) => updateGeminiSettings({ model: e.target.value })}
                    placeholder="gemini-2.5-pro"
                    className="w-full px-3 py-2 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-sm text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
              </>
            )}

            {activeTab === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={custom.apiKey}
                    onChange={(e) => updateCustomSettings({ apiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-sm text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">
                    Base URL
                  </label>
                  <input
                    type="text"
                    value={custom.baseUrl}
                    onChange={(e) => updateCustomSettings({ baseUrl: e.target.value })}
                    placeholder="https://api.openai.com/v1"
                    className="w-full px-3 py-2 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-sm text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    value={custom.model}
                    onChange={(e) => updateCustomSettings({ model: e.target.value })}
                    placeholder="gpt-4o"
                    className="w-full px-3 py-2 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-sm text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border dark:border-border-dark flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
