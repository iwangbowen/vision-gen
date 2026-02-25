import { useSettingsStore } from '../../stores/settingsStore';
import type { LLMService } from './index';
import { GeminiImageService } from './gemini';
import { CustomImageService } from './custom';

export function getLLMService(): LLMService {
  const settings = useSettingsStore.getState();

  if (settings.provider === 'gemini') {
    return new GeminiImageService(
      settings.gemini.apiKey,
      settings.gemini.baseUrl,
      settings.gemini.model
    );
  } else if (settings.provider === 'custom') {
    return new CustomImageService(
      settings.custom.apiKey,
      settings.custom.baseUrl,
      settings.custom.model
    );
  }

  throw new Error(`Unsupported LLM provider: ${settings.provider}`);
}
