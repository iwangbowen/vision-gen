import type { Node, Edge } from '@xyflow/react';

// ===== Asset Types =====
export type AssetCategory = 'character' | 'prop' | 'scene' | 'costume' | 'storyboard';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  thumbnail: string;
  createdAt: number;
}

// ===== Node Data Types =====
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '3:2' | '2:3';
export type ImageSize = '1k' | '2k' | '4k';
export type ImageStyle = '' | 'photorealistic' | 'concept-art' | 'sketch' | 'comic-book' | 'anime' | '3d-render' | 'watercolor' | 'oil-painting' | 'cyberpunk' | 'ink-wash';

export interface Text2ImageData {
  [key: string]: unknown;
  label: string;
  prompt: string;
  generatedImage?: string;
  gridSize?: GridSize;
  aspectRatio?: AspectRatio;
  imageSize?: ImageSize;
  style?: ImageStyle;
  status: 'idle' | 'generating' | 'done';
}

export interface Image2ImageData {
  [key: string]: unknown;
  label: string;
  prompt: string;
  sourceImage?: string;
  generatedImage?: string;
  gridSize?: GridSize;
  aspectRatio?: AspectRatio;
  imageSize?: ImageSize;
  style?: ImageStyle;
  status: 'idle' | 'generating' | 'done';
}

export interface ImageData {
  [key: string]: unknown;
  label: string;
  image: string;
  width?: number;
  height?: number;
}

export type GridSize = '1x1' | '2x2' | '3x3' | '4x4' | '5x5';

export interface GridCell {
  id: string;
  image: string;
  row: number;
  col: number;
}

export interface GridData {
  [key: string]: unknown;
  label: string;
  gridSize: GridSize;
  cells: GridCell[];
  sourcePrompt?: string;
}

export interface SplitGroupData {
  [key: string]: unknown;
  label: string;
}

// ===== Node Type Aliases =====
export type Text2ImageNode = Node<Text2ImageData, 'text2image'>;
export type Image2ImageNode = Node<Image2ImageData, 'image2image'>;
export type ImageNode = Node<ImageData, 'image'>;
export type GridNode = Node<GridData, 'grid'>;
export type SplitGroupNode = Node<SplitGroupData, 'splitGroup'>;

export type AppNode = Text2ImageNode | Image2ImageNode | ImageNode | GridNode | SplitGroupNode;
export type AppEdge = Edge;

// ===== Timeline =====
export interface TimelineItem {
  id: string;
  image: string;
  sourceNodeId: string;
  order: number;
  label?: string;
  position?: number; // Position in pixels or grid units for snap effect
}

// ===== Theme =====
export type Theme = 'light' | 'dark';

// ===== API interfaces for future backend integration =====
export interface GenerateImageRequest {
  type: 'text2image' | 'image2image';
  prompt: string;
  sourceImage?: string;
  gridSize?: GridSize;
  params?: Record<string, unknown>;
}

export interface GenerateImageResponse {
  id: string;
  images: string[];
  gridSize?: GridSize;
}

export interface SaveAssetRequest {
  name: string;
  category: AssetCategory;
  image: string;
  metadata?: Record<string, unknown>;
}
