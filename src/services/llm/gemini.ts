import type { LLMService, GenerateImageOptions } from './index';
import { LLMServiceError } from './index';

// Gemini image generation models
export const GEMINI_IMAGE_MODELS = [
  { label: 'Gemini 3 Pro (Image Preview)', value: 'gemini-3-pro-image-preview' },
  { label: 'Gemini 2.5 Flash (Image)', value: 'gemini-2.5-flash-image' },
] as const;

// Gemini text/vision models
export const GEMINI_TEXT_MODELS = [
  { label: 'Gemini 3 Flash Preview', value: 'gemini-3-flash-preview' },
  { label: 'Gemini 3.1 Pro Preview', value: 'gemini-3.1-pro-preview' },
] as const;

// Shared utility: convert an image URL/data-URI to { mimeType, data }
async function processImageToBase64(imageUrl: string): Promise<{ mimeType: string; data: string }> {
  let mimeType = 'image/jpeg';
  let data = '';

  if (imageUrl.startsWith('data:')) {
    const regex = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/;
    const match = regex.exec(imageUrl);
    if (match) {
      mimeType = match[1];
      data = match[2];
    }
  } else if (imageUrl.startsWith('http')) {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      mimeType = blob.type || 'image/jpeg';
      const buffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCodePoint(bytes[i]);
      }
      data = btoa(binary);
    } catch (error) {
      console.error('Failed to fetch image:', error);
    }
  }
  return { mimeType, data };
}

// Analyze an image using a Gemini text/vision model
export async function analyzeImageWithGemini(params: {
  apiKey: string;
  baseUrl: string;
  textModel: string;
  prompt: string;
  imageUrl: string;
}): Promise<string> {
  if (!params.apiKey) {
    throw new LLMServiceError('Gemini API Key is not configured');
  }

  const baseUrl = params.baseUrl.replace(/\/+$/, '');
  const url = `${baseUrl}/v1beta/models/${params.textModel}:generateContent?key=${params.apiKey}`;

  const { mimeType, data } = await processImageToBase64(params.imageUrl);

  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
  if (data) {
    parts.push({ inlineData: { mimeType, data } });
  }
  parts.push({ text: params.prompt });

  const payload = { contents: [{ parts }] };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new LLMServiceError(
      (errorData as { error?: { message?: string } } | null)?.error?.message || `HTTP ${response.status}`
    );
  }

  const responseData = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new LLMServiceError('No text response from Gemini API');
  }
  return text;
}

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

  async generateImage(options: GenerateImageOptions): Promise<string> {
    if (!this.apiKey) {
      throw new LLMServiceError('Gemini API Key is not configured');
    }

    const aspectRatio = options.aspectRatio || '1:1';
    const imageSize = mapImageSize(options.size);

    // Build prompt — include grid context so the LLM returns a single composite grid image
    let prompt = options.prompt;
    if (options.style) {
      prompt = `Style: ${options.style}. ${prompt}`;
    }
    if (options.gridSize && options.gridSize !== '1x1') {
      const size = Number.parseInt(options.gridSize[0], 10);
      prompt = `Generate a single image that is a ${options.gridSize} grid layout (${size} rows × ${size} columns) of distinct scenes. Each cell should show a different variation of the following description with different compositions or angles. Description: ${prompt}`;
    }

    try {
      return await this.generateWithGeminiAPI(prompt, aspectRatio, imageSize, options.sourceImage, options.maskImage, options.sourceImages);
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

  private async generateWithGeminiAPI(prompt: string, aspectRatio: string, imageSize: string, sourceImage?: string, maskImage?: string, sourceImages?: string[]): Promise<string> {
    const url = `${this.baseUrl}/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [{ text: prompt }];

    if (sourceImage) {
      const { mimeType, data } = await processImageToBase64(sourceImage);
      if (data) {
        parts.push({ inlineData: { mimeType, data } });
      }
    }

    if (sourceImages && sourceImages.length > 0) {
      for (const img of sourceImages) {
        const { mimeType, data } = await processImageToBase64(img);
        if (data) {
          parts.push({ inlineData: { mimeType, data } });
        }
      }
    }

    if (maskImage) {
      const { mimeType, data } = await processImageToBase64(maskImage);
      if (data) {
        parts.push({ inlineData: { mimeType, data } });
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
    if (!image) {
      throw new Error('No image generated from Gemini API');
    }
    return image;
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
