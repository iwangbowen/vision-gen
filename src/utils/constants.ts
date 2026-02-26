import type { AssetCategory, GridSize, AspectRatio, ImageSize, ImageStyle } from '../types';

export const ASSET_CATEGORIES: { label: string; value: AssetCategory }[] = [
  { label: '人物', value: 'character' },
  { label: '道具', value: 'prop' },
  { label: '场景', value: 'scene' },
  { label: '服装', value: 'costume' },
  { label: '分镜', value: 'storyboard' },
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
  { label: '无', value: '' },
  { label: '摄影写实', value: 'photorealistic' },
  { label: '概念设计', value: 'concept-art' },
  { label: '手绘草图', value: 'sketch' },
  { label: '美漫风格', value: 'comic-book' },
  { label: '日系动漫', value: 'anime' },
  { label: '3D渲染', value: '3d-render' },
  { label: '水彩艺术', value: 'watercolor' },
  { label: '油画质感', value: 'oil-painting' },
  { label: '赛博朋克', value: 'cyberpunk' },
  { label: '水墨丹青', value: 'ink-wash' },
];
