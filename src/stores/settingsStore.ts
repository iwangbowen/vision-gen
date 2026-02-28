import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LLMProvider = 'gemini' | 'custom';

export interface SettingsState {
  provider: LLMProvider;
  gemini: {
    apiKey: string;
    baseUrl: string;
    model: string;
    textModel: string;
  };
  custom: {
    apiKey: string;
    baseUrl: string;
    model: string;
  };
  setProvider: (provider: LLMProvider) => void;
  updateGeminiSettings: (settings: Partial<SettingsState['gemini']>) => void;
  updateCustomSettings: (settings: Partial<SettingsState['custom']>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      provider: 'gemini',
      gemini: {
        apiKey: '',
        baseUrl: 'https://generativelanguage.googleapis.com',
        model: 'gemini-3-pro-image-preview',
        textModel: 'gemini-3-flash-preview',
      },
      custom: {
        apiKey: '',
        baseUrl: '',
        model: '',
      },
      setProvider: (provider) => set({ provider }),
      updateGeminiSettings: (settings) =>
        set((state) => ({
          gemini: { ...state.gemini, ...settings },
        })),
      updateCustomSettings: (settings) =>
        set((state) => ({
          custom: { ...state.custom, ...settings },
        })),
    }),
    {
      name: 'visiongen-settings',
      merge: (persistedState, currentState) => {
        const ps = persistedState as Partial<SettingsState>;
        return {
          ...currentState,
          ...ps,
          gemini: { ...currentState.gemini, ...ps?.gemini },
          custom: { ...currentState.custom, ...ps?.custom },
        };
      },
    }
  )
);
