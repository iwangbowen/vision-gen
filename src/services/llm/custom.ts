import type { LLMService, GenerateImageOptions } from './index';
import { LLMServiceError } from './index';

export class CustomImageService implements LLMService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(apiKey: string, baseUrl: string, model: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async generateImage(options: GenerateImageOptions): Promise<string> {
    if (!this.apiKey || !this.baseUrl) {
      throw new LLMServiceError('Custom API Key or Base URL is not configured');
    }

    try {
      const url = `${this.baseUrl.replace(/\/$/, '')}/images/generations`;

      let prompt = options.prompt;
      if (options.style) {
        prompt = `Style: ${options.style}. ${prompt}`;
      }

      const payload = {
        model: this.model || 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: options.size || '1024x1024',
        response_format: 'b64_json',
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const image = data.data[0];
        if (image.b64_json) {
          return `data:image/png;base64,${image.b64_json}`;
        } else if (image.url) {
          return image.url;
        }
      }

      throw new Error('Invalid response format from Custom API');
    } catch (error) {
      if (error instanceof LLMServiceError) {
        throw error;
      }
      throw new LLMServiceError(`Failed to generate image with Custom API: ${error instanceof Error ? error.message : String(error)}`, error);
    }
  }
}
