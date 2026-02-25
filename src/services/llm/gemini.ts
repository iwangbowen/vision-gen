import type { LLMService, GenerateImageOptions } from './index';
import { LLMServiceError } from './index';

// Gemini image generation models
export const GEMINI_IMAGE_MODELS = [
  { label: 'Gemini 3 Pro (Image Preview)', value: 'gemini-3-pro-image-preview' },
  { label: 'Gemini 2.5 Flash (Image)', value: 'gemini-2.5-flash-image' },
] as const;

// Map image size from our format to API format
function mapImageSize(size: string | undefined): string {
  switch (size) {
    case '1k': return '1K';
    case '2k': return '2K';
    case '4k': return '4K';
    default: return '1K';
  }
}

export class GeminiImageService implements LLMService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(
    apiKey: string,
    baseUrl: string = 'https://generativelanguage.googleapis.com',
    model: string = 'gemini-3-pro-image-preview'
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.model = model;
  }

  async generateImage(options: GenerateImageOptions): Promise<string | string[]> {
    if (!this.apiKey) {
      throw new LLMServiceError('Gemini API Key is not configured');
    }

    // Determine how many images to generate
    let imageCount = 1;
    if (options.gridSize && options.gridSize !== '1x1') {
      const size = parseInt(options.gridSize[0], 10);
      imageCount = size * size;
    }

    const aspectRatio = options.aspectRatio || '1:1';
    const imageSize = mapImageSize(options.size);

    // Build prompt with grid context if applicable
    let prompt = options.prompt;
    if (imageCount > 1) {
      prompt = `Generate a set of ${imageCount} distinct images for a storyboard grid. Each image should be a variation of the following scene but with slightly different compositions or angles. Scene description: ${options.prompt}`;
    }

    try {
      return await this.generateWithGeminiAPI(prompt, aspectRatio, imageSize, imageCount, options.sourceImage);
    } catch (error) {
      if (error instanceof LLMServiceError) {
        throw error;
      }
      throw new LLMServiceError(
        `Failed to generate image with Gemini: ${error instanceof Error ? error.message : String(error)}`,
        error
      );
    }
  }

  private async generateWithGeminiAPI(prompt: string, aspectRatio: string, imageSize: string, imageCount: number, sourceImage?: string): Promise<string | string[]> {
    const url = `${this.baseUrl}/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const allImages: string[] = [];

    for (let i = 0; i < imageCount; i++) {
      const currentPrompt = imageCount > 1
        ? `${prompt}\n\nThis is image ${i + 1} of ${imageCount} in the storyboard grid.`
        : prompt;

      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [{ text: currentPrompt }];

      if (sourceImage) {
        // Extract base64 data and mime type
        const regex = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/;
        const match = regex.exec(sourceImage);
        if (match) {
          parts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2]
            }
          });
        }
      }

      const payload = {
        contents: [
          {
            parts
          }
        ],
        generationConfig: {
          imageConfig: {
            aspectRatio,
            imageSize,
          },
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const image = this.extractImageFromGeminiResponse(data);
      if (image) {
        allImages.push(image);
      }
    }

    if (allImages.length === 0) {
      throw new Error('No images generated from Gemini API');
    }

    return imageCount === 1 ? allImages[0] : allImages;
  }

  private extractImageFromGeminiResponse(data: Record<string, unknown>): string | null {
    const candidates = data.candidates as Array<Record<string, unknown>> | undefined;
    if (!candidates || candidates.length === 0) return null;

    const content = candidates[0].content as Record<string, unknown> | undefined;
    if (!content) return null;

    const parts = content.parts as Array<Record<string, unknown>> | undefined;
    if (!parts) return null;

    for (const part of parts) {
      const inlineData = part.inlineData as Record<string, string> | undefined;
      if (inlineData?.data && inlineData?.mimeType) {
        return `data:${inlineData.mimeType};base64,${inlineData.data}`;
      }
    }

    return null;
  }
}
