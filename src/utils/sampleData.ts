// Sample image URLs using picsum.photos for demo purposes
const SAMPLE_IMAGES = [
  'https://picsum.photos/seed/char1/400/400',
  'https://picsum.photos/seed/char2/400/400',
  'https://picsum.photos/seed/scene1/400/400',
  'https://picsum.photos/seed/scene2/400/400',
  'https://picsum.photos/seed/prop1/400/400',
  'https://picsum.photos/seed/prop2/400/400',
  'https://picsum.photos/seed/costume1/400/400',
  'https://picsum.photos/seed/costume2/400/400',
  'https://picsum.photos/seed/board1/400/400',
  'https://picsum.photos/seed/board2/400/400',
  'https://picsum.photos/seed/img1/400/400',
  'https://picsum.photos/seed/img2/400/400',
  'https://picsum.photos/seed/img3/400/400',
  'https://picsum.photos/seed/img4/400/400',
  'https://picsum.photos/seed/img5/400/400',
  'https://picsum.photos/seed/img6/400/400',
];

export function getRandomSampleImage(): string {
  return SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)];
}

export function getSampleImageBySeed(seed: string): string {
  return `https://picsum.photos/seed/${seed}/400/400`;
}

export function getGridSampleImages(count: number): string[] {
  return Array.from({ length: count }, (_, i) =>
    `https://picsum.photos/seed/grid${Date.now()}_${i}/400/400`
  );
}

export { SAMPLE_IMAGES };

import type { Asset } from '../types';

export const SAMPLE_ASSETS: Asset[] = [
  { id: 'asset-1', name: '勇士角色', category: 'character', thumbnail: 'https://picsum.photos/seed/warrior/200/200', createdAt: Date.now() },
  { id: 'asset-2', name: '法师角色', category: 'character', thumbnail: 'https://picsum.photos/seed/mage/200/200', createdAt: Date.now() },
  { id: 'asset-3', name: '弓箭手', category: 'character', thumbnail: 'https://picsum.photos/seed/archer/200/200', createdAt: Date.now() },
  { id: 'asset-4', name: '魔法剑', category: 'prop', thumbnail: 'https://picsum.photos/seed/sword/200/200', createdAt: Date.now() },
  { id: 'asset-5', name: '盾牌', category: 'prop', thumbnail: 'https://picsum.photos/seed/shield/200/200', createdAt: Date.now() },
  { id: 'asset-6', name: '森林场景', category: 'scene', thumbnail: 'https://picsum.photos/seed/forest/200/200', createdAt: Date.now() },
  { id: 'asset-7', name: '城堡场景', category: 'scene', thumbnail: 'https://picsum.photos/seed/castle/200/200', createdAt: Date.now() },
  { id: 'asset-8', name: '沙漠场景', category: 'scene', thumbnail: 'https://picsum.photos/seed/desert/200/200', createdAt: Date.now() },
  { id: 'asset-9', name: '骑士铠甲', category: 'costume', thumbnail: 'https://picsum.photos/seed/armor/200/200', createdAt: Date.now() },
  { id: 'asset-10', name: '魔法长袍', category: 'costume', thumbnail: 'https://picsum.photos/seed/robe/200/200', createdAt: Date.now() },
  { id: 'asset-11', name: '开场分镜', category: 'storyboard', thumbnail: 'https://picsum.photos/seed/story1/200/200', createdAt: Date.now() },
  { id: 'asset-12', name: '战斗分镜', category: 'storyboard', thumbnail: 'https://picsum.photos/seed/story2/200/200', createdAt: Date.now() },
];
