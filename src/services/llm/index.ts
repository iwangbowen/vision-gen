export interface GenerateImageOptions {
  prompt: string;
  aspectRatio?: string;
  size?: string;
  gridSize?: string;
  [key: string]: unknown;
}

export interface LLMService {
  generateImage(options: GenerateImageOptions): Promise<string | string[]>;
}

export class LLMServiceError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'LLMServiceError';
  }
}
