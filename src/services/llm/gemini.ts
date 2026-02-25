import type { LLMService, GenerateImageOptions } from './index';
import { LLMServiceError } from './index';

export class GeminiImageService implements LLMService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(
    apiKey: string,
    baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta',
    model: string = 'imagen-3.0-generate-001'
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async generateImage(options: GenerateImageOptions): Promise<string> {
    if (!this.apiKey) {
      throw new LLMServiceError('Gemini API Key is not configured');
    }

    try {
      // Note: The exact endpoint and payload might vary based on the specific Gemini/Imagen API version.
      // This is a standard implementation based on Google AI Studio's Imagen API.
      const url = `${this.baseUrl.replace(/\/$/, '')}/models/${this.model}:predict?key=${this.apiKey}`;

      const payload = {
        instances: [
          {
            prompt: options.prompt,
          }
        ],
        parameters: {
          sampleCount: 1,
          // Map aspect ratio if needed, e.g., "1:1", "16:9"
          aspectRatio: options.aspectRatio || "1:1",
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Extract the base64 image from the response
      // The exact response structure depends on the API version
      if (data.predictions && data.predictions.length > 0) {
        const prediction = data.predictions[0];
        if (prediction.bytesBase64Encoded) {
          return `data:image/jpeg;base64,${prediction.bytesBase64Encoded}`;
        }
      }

      throw new Error('Invalid response format from Gemini API');
    } catch (error) {
      if (error instanceof LLMServiceError) {
        throw error;
      }
      throw new LLMServiceError(`Failed to generate image with Gemini: ${error instanceof Error ? error.message : String(error)}`, error);
    }
  }
}
