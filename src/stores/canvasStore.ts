import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import type {
  AppNode,
  AppEdge,
  Text2ImageData,
  Image2ImageData,
  GridSize,
  GridCell,
} from '../types';
import { getRandomSampleImage, getGridSampleImages } from '../utils/sampleData';

interface CanvasState {
  nodes: AppNode[];
  edges: AppEdge[];
  selectedNodeId: string | null;

  // Node operations
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setSelectedNodeId: (id: string | null) => void;

  // Add nodes
  addText2ImageNode: (position: { x: number; y: number }) => void;
  addImage2ImageNode: (position: { x: number; y: number }) => void;
  addImageNode: (position: { x: number; y: number }, image: string, label?: string) => void;
  addGridNode: (position: { x: number; y: number }, gridSize: GridSize) => void;

  // Node actions
  updateNodeData: (nodeId: string, data: Partial<Text2ImageData | Image2ImageData>) => void;
  simulateGenerate: (nodeId: string) => void;
  splitGridNode: (nodeId: string) => void;
  removeNode: (nodeId: string) => void;
}

let nodeIdCounter = 0;
const getNodeId = () => `node_${++nodeIdCounter}_${Date.now()}`;

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,

  onNodesChange: (changes) =>
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes) as AppNode[],
    })),

  onEdgesChange: (changes) =>
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    })),

  onConnect: (connection) =>
    set((state) => ({
      edges: addEdge(
        { ...connection, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        state.edges
      ),
    })),

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  addText2ImageNode: (position) => {
    const id = getNodeId();
    const newNode: AppNode = {
      id,
      type: 'text2image',
      position,
      data: {
        label: '文生图',
        prompt: '',
        status: 'idle',
      },
    };
    set((state) => ({ nodes: [...state.nodes, newNode] }));
  },

  addImage2ImageNode: (position) => {
    const id = getNodeId();
    const newNode: AppNode = {
      id,
      type: 'image2image',
      position,
      data: {
        label: '图生图',
        prompt: '',
        status: 'idle',
      },
    };
    set((state) => ({ nodes: [...state.nodes, newNode] }));
  },

  addImageNode: (position, image, label) => {
    const id = getNodeId();
    const newNode: AppNode = {
      id,
      type: 'image',
      position,
      data: {
        label: label || '图片',
        image,
      },
    };
    set((state) => ({ nodes: [...state.nodes, newNode] }));
  },

  addGridNode: (position, gridSize) => {
    const id = getNodeId();
    const size = parseInt(gridSize[0]);
    const totalCells = size * size;
    const images = getGridSampleImages(totalCells);
    const cells: GridCell[] = images.map((img, idx) => ({
      id: `${id}_cell_${idx}`,
      image: img,
      row: Math.floor(idx / size),
      col: idx % size,
    }));

    const newNode: AppNode = {
      id,
      type: 'grid',
      position,
      data: {
        label: `宫格 ${gridSize}`,
        gridSize,
        cells,
      },
    };
    set((state) => ({ nodes: [...state.nodes, newNode] }));
  },

  updateNodeData: (nodeId, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ) as AppNode[],
    })),

  simulateGenerate: (nodeId) => {
    const { updateNodeData } = get();
    updateNodeData(nodeId, { status: 'generating' } as Partial<Text2ImageData>);

    // Simulate generation delay
    setTimeout(() => {
      const node = get().nodes.find((n) => n.id === nodeId);
      if (!node) return;

      if (node.type === 'text2image' || node.type === 'image2image') {
        const data = node.data as Text2ImageData | Image2ImageData;
        const gridSize = data.gridSize;

        if (gridSize && gridSize !== '1x1') {
          // Generate grid node instead
          const { addGridNode } = get();
          const pos = { x: node.position.x + 350, y: node.position.y };
          addGridNode(pos, gridSize);
          updateNodeData(nodeId, { status: 'done', generatedImage: getRandomSampleImage() } as Partial<Text2ImageData>);
        } else {
          const image = getRandomSampleImage();
          updateNodeData(nodeId, { status: 'done', generatedImage: image } as Partial<Text2ImageData>);
        }
      }
    }, 1500);
  },

  splitGridNode: (nodeId) => {
    const state = get();
    const node = state.nodes.find((n) => n.id === nodeId);
    if (!node || node.type !== 'grid') return;

    const gridData = node.data as unknown as { cells: GridCell[]; gridSize: GridSize };
    const size = parseInt(gridData.gridSize[0]);
    const spacing = 220;
    const startX = node.position.x;
    const startY = node.position.y + 300;

    const newNodes: AppNode[] = gridData.cells.map((cell, idx) => ({
      id: getNodeId(),
      type: 'image' as const,
      position: {
        x: startX + (idx % size) * spacing,
        y: startY + Math.floor(idx / size) * spacing,
      },
      data: {
        label: `分镜 ${cell.row + 1}-${cell.col + 1}`,
        image: cell.image,
      },
    }));

    set((state) => ({ nodes: [...state.nodes, ...newNodes] }));
  },

  removeNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    })),
}));
