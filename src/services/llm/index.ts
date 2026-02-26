export interface GenerateImageOptions {
  prompt: string;
  aspectRatio?: string;
  size?: string;
  gridSize?: string;
  style?: string;
  sourceImage?: string;
  maskImage?: string;
  [key: string]: unknown;
}

export interface LLMService {
  generateImage(options: GenerateImageOptions): Promise<string>;
}

export class LLMServiceError extends Error {
  readonly cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'LLMServiceError';
    this.cause = cause;
  }
}
