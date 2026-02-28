import type { AssetCategory, GridSize, AspectRatio, ImageSize, ImageStyle } from '../types';

export const ASSET_CATEGORIES: { label: string; value: AssetCategory }[] = [
  { label: 'Character', value: 'character' },
  { label: 'Prop', value: 'prop' },
  { label: 'Scene', value: 'scene' },
  { label: 'Costume', value: 'costume' },
  { label: 'Storyboard', value: 'storyboard' },
];

export const GRID_OPTIONS: { label: string; value: GridSize }[] = [
  { label: '1×1', value: '1x1' },
  { label: '2×2', value: '2x2' },
  { label: '3×3', value: '3x3' },
  { label: '4×4', value: '4x4' },
  { label: '5×5', value: '5x5' },
];

export const ASPECT_RATIO_OPTIONS: { label: string; value: AspectRatio }[] = [
  { label: '1:1', value: '1:1' },
  { label: '16:9', value: '16:9' },
  { label: '9:16', value: '9:16' },
  { label: '4:3', value: '4:3' },
  { label: '3:4', value: '3:4' },
  { label: '3:2', value: '3:2' },
  { label: '2:3', value: '2:3' },
];

export const IMAGE_SIZE_OPTIONS: { label: string; value: ImageSize }[] = [
  { label: '1K', value: '1k' },
  { label: '2K', value: '2k' },
  { label: '4K', value: '4k' },
];

export const IMAGE_STYLE_OPTIONS: { label: string; value: ImageStyle }[] = [
  { label: 'None', value: '' },
  { label: 'Photorealistic', value: 'photorealistic' },
  { label: 'Concept Art', value: 'concept-art' },
  { label: 'Sketch', value: 'sketch' },
  { label: 'Comic Book', value: 'comic-book' },
  { label: 'Anime', value: 'anime' },
  { label: '3D Render', value: '3d-render' },
  { label: 'Watercolor', value: 'watercolor' },
  { label: 'Oil Painting', value: 'oil-painting' },
  { label: 'Cyberpunk', value: 'cyberpunk' },
  { label: 'Ink Wash', value: 'ink-wash' },
];
