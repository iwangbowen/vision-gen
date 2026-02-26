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

import { useTaskStore } from './taskStore';

interface CanvasState {
  nodes: AppNode[];
  edges: AppEdge[];
  selectedNodeId: string | null;
  rightPanelOpen: boolean;

  // Node operations
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setSelectedNodeId: (id: string | null) => void;
  setRightPanelOpen: (open: boolean) => void;

  // Add nodes
  addText2ImageNode: (position: { x: number; y: number }) => void;
  addImage2ImageNode: (position: { x: number; y: number }, image?: string, label?: string) => string;
  addImageNode: (position: { x: number; y: number }, image: string, label?: string) => string;
  addGridNode: (position: { x: number; y: number }, gridSize: GridSize, generatedImages?: string[]) => void;

  // Node actions
  updateNodeData: (nodeId: string, data: Partial<Text2ImageData | Image2ImageData>) => void;
  simulateGenerate: (nodeId: string) => Promise<void>;
  splitGridNode: (nodeId: string) => void;
  splitGeneratedImage: (nodeId: string) => Promise<void>;
  duplicateNode: (nodeId: string) => void;
  duplicateNodes: (nodeIds: string[]) => void;
  removeNode: (nodeId: string) => void;
  removeNodes: (nodeIds: string[]) => void;
}

let nodeIdCounter = 0;
const getNodeId = () => `node_${++nodeIdCounter}_${Date.now()}`;

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  rightPanelOpen: false,

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
        { ...connection, animated: true, style: { strokeWidth: 2 } },
        state.edges
      ),
    })),

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),

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
        gridSize: '1x1',
        aspectRatio: '16:9',
        imageSize: '1k',
        style: '',
      },
    };
    set((state) => ({ nodes: [...state.nodes, newNode] }));
  },

  addImage2ImageNode: (position, image, label) => {
    const id = getNodeId();
    const newNode: AppNode = {
      id,
      type: 'image2image',
      position,
      data: {
        label: label || '图生图',
        prompt: '',
        status: 'idle',
        gridSize: '1x1',
        aspectRatio: '16:9',
        imageSize: '1k',
        style: '',
        sourceImage: image,
      },
    };
    set((state) => ({ nodes: [...state.nodes, newNode] }));
    return id;
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
    return id;
  },

  addGridNode: (position, gridSize, generatedImages) => {
    const id = getNodeId();
    const size = Number.parseInt(gridSize[0]);
    const totalCells = size * size;
    const images = generatedImages?.length === totalCells
      ? generatedImages
      : getGridSampleImages(totalCells);
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

  simulateGenerate: async (nodeId) => {
    const { updateNodeData } = get();
    const node = get().nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const data = node.data as Text2ImageData | Image2ImageData;
    const prompt = data.prompt || '';
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    useTaskStore.getState().addTask({
      id: taskId,
      nodeId,
      type: node.type as 'text2image' | 'image2image',
      prompt,
    });

    updateNodeData(nodeId, { status: 'generating' } as Partial<Text2ImageData>);

    // Create a placeholder node for the generated image
    const outgoingEdges = get().edges.filter(e => e.source === nodeId);
    const yOffset = outgoingEdges.length * 150;
    const newNodeId = getNodeId();
    const newNodePosition = {
      x: node.position.x + 300,
      y: node.position.y + yOffset
    };

    const newNode: AppNode = {
      id: newNodeId,
      type: 'image',
      position: newNodePosition,
      data: {
        label: prompt || '生成中...',
        image: '', // Empty image initially
        status: 'generating',
      },
    };

    const newEdge: AppEdge = {
      id: `edge_${nodeId}_${newNodeId}`,
      source: nodeId,
      target: newNodeId,
      animated: true,
      style: { strokeWidth: 2, stroke: '#3b82f6' } // Blue animated line to indicate working
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      edges: [...state.edges, newEdge]
    }));

    // Simulate progress
    const progressInterval = setInterval(() => {
      const task = useTaskStore.getState().tasks.find(t => t.id === taskId);
      if (task?.status === 'generating' && task.progress < 90) {
        useTaskStore.getState().updateTask(taskId, { progress: task.progress + Math.floor(Math.random() * 10) + 5 });
      }
    }, 500);

    try {
      const { getLLMService } = await import('../services/llm/factory');
      const llmService = getLLMService();

      const aspectRatio = data.aspectRatio || '1:1';
      const imageSize = data.imageSize || '1k';
      const gridSize = data.gridSize || '1x1';
      const style = data.style || '';

      // Call the actual LLM service with all parameters
      const result = await llmService.generateImage({
        prompt,
        aspectRatio,
        size: imageSize,
        gridSize,
        style,
        sourceImage: (data as Image2ImageData).sourceImage,
        maskImage: (data as Image2ImageData).maskImage,
      });

      clearInterval(progressInterval);
      useTaskStore.getState().updateTask(taskId, { status: 'done', progress: 100, endTime: Date.now() });

      // Always store as single generatedImage on the node (even for grid sizes)
      let image: string;
      if (typeof result === 'string') {
        image = result;
      } else if (Array.isArray(result)) {
        image = result[0];
      } else {
        image = String(result);
      }

      updateNodeData(nodeId, { status: 'done' } as Partial<Text2ImageData>);

      // Update the placeholder node with the generated image
      updateNodeData(newNodeId, {
        label: prompt || '生成的图片',
        image: image,
        gridSize: gridSize,
        status: 'done',
      } as Partial<ImageData>);

      // Update edge to normal state
      set((state) => ({
        edges: state.edges.map(e =>
          e.id === `edge_${nodeId}_${newNodeId}`
            ? { ...e, animated: false, style: { strokeWidth: 2 } }
            : e
        )
      }));
    } catch (error) {
      console.error('Failed to generate image:', error);

      const errorMessage = error instanceof Error ? error.message : String(error);

      // If API key is not configured, fallback to simulation for demo purposes
      if (errorMessage.includes('not configured')) {
        setTimeout(() => {
          clearInterval(progressInterval);
          useTaskStore.getState().updateTask(taskId, { status: 'done', progress: 100, endTime: Date.now() });

          const node = get().nodes.find((n) => n.id === nodeId);
          if (!node) return;

          if (node.type === 'text2image' || node.type === 'image2image') {
            const image = getRandomSampleImage();
            updateNodeData(nodeId, { status: 'done' } as Partial<Text2ImageData>);

            // Update the placeholder node with the generated image
            updateNodeData(newNodeId, {
              label: prompt || '生成的图片',
              image: image,
              gridSize: (node.data as Text2ImageData).gridSize || '1x1',
              status: 'done',
            } as Partial<ImageData>);

            // Update edge to normal state
            set((state) => ({
              edges: state.edges.map(e =>
                e.id === `edge_${nodeId}_${newNodeId}`
                  ? { ...e, animated: false, style: { strokeWidth: 2 } }
                  : e
              )
            }));
          }
        }, 1500);
      } else {
        clearInterval(progressInterval);
        useTaskStore.getState().updateTask(taskId, { status: 'error', error: errorMessage, endTime: Date.now() });
        alert(`生成图片失败: ${errorMessage}`);
        updateNodeData(nodeId, { status: 'idle' } as Partial<Text2ImageData>);

        // Remove the placeholder node and edge on error
        set((state) => ({
          nodes: state.nodes.filter(n => n.id !== newNodeId),
          edges: state.edges.filter(e => e.id !== `edge_${nodeId}_${newNodeId}`)
        }));
      }
    }
  },

  splitGridNode: (nodeId) => {
    const state = get();
    const node = state.nodes.find((n) => n.id === nodeId);
    if (!node || node.type !== 'grid') return;

    const gridData = node.data as unknown as { cells: GridCell[]; gridSize: GridSize };
    const size = Number.parseInt(gridData.gridSize[0]);
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

  splitGeneratedImage: async (nodeId) => {
    const state = get();
    const node = state.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    let generatedImage: string | undefined;
    let gridSize: GridSize | undefined;

    if (node.type === 'text2image' || node.type === 'image2image') {
      generatedImage = (node.data as Text2ImageData).generatedImage;
      gridSize = (node.data as Text2ImageData).gridSize;
    } else if (node.type === 'image') {
      generatedImage = (node.data as ImageData).image;
      gridSize = (node.data as ImageData).gridSize;
    }

    if (!generatedImage || !gridSize || gridSize === '1x1') return;

    const size = Number.parseInt(gridSize[0]);

    // Load image and split using Canvas API
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const splitImages = await new Promise<string[]>((resolve, reject) => {
      img.onload = () => {
        const cellWidth = Math.floor(img.width / size);
        const cellHeight = Math.floor(img.height / size);
        const results: string[] = [];

        for (let row = 0; row < size; row++) {
          for (let col = 0; col < size; col++) {
            const canvas = document.createElement('canvas');
            canvas.width = cellWidth;
            canvas.height = cellHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) continue;
            ctx.drawImage(
              img,
              col * cellWidth, row * cellHeight, cellWidth, cellHeight,
              0, 0, cellWidth, cellHeight
            );
            results.push(canvas.toDataURL('image/png'));
          }
        }
        resolve(results);
      };
      img.onerror = () => reject(new Error('Failed to load image for splitting'));
      img.src = generatedImage;
    });

    const cellSpacing = 210;
    const padding = 20;
    const groupWidth = size * cellSpacing + padding * 2;
    const groupHeight = size * cellSpacing + padding * 2 + 40; // extra 40 for label

    // Create a group node as the parent
    const groupId = getNodeId();
    const groupNode: AppNode = {
      id: groupId,
      type: 'splitGroup',
      position: { x: node.position.x, y: node.position.y + 500 },
      data: {
        label: `切分组 ${gridSize}`,
      },
      style: { width: groupWidth, height: groupHeight },
    } as AppNode;

    // Create child image nodes with positions relative to the group
    const childNodes: AppNode[] = splitImages.map((imgSrc, idx) => ({
      id: getNodeId(),
      type: 'image' as const,
      position: {
        x: padding + (idx % size) * cellSpacing,
        y: padding + 40 + Math.floor(idx / size) * cellSpacing,
      },
      parentId: groupId,
      extent: 'parent' as const,
      data: {
        label: `分镜 ${Math.floor(idx / size) + 1}-${(idx % size) + 1}`,
        image: imgSrc,
      },
    }));

    set((s) => ({ nodes: [...s.nodes, groupNode, ...childNodes] }));
  },

  duplicateNode: (nodeId) => {
    const state = get();
    const node = state.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const newNode: AppNode = {
      ...node,
      id: getNodeId(),
      position: { x: node.position.x + 50, y: node.position.y + 50 },
      data: { ...node.data },
      selected: false,
    } as AppNode;
    set((s) => ({ nodes: [...s.nodes, newNode] }));
  },

  duplicateNodes: (nodeIds) => {
    const state = get();
    const nodesToDuplicate = state.nodes.filter((n) => nodeIds.includes(n.id));
    if (nodesToDuplicate.length === 0) return;

    const newNodes: AppNode[] = nodesToDuplicate.map((node) => ({
      ...node,
      id: getNodeId(),
      position: { x: node.position.x + 50, y: node.position.y + 50 },
      data: { ...node.data },
      selected: false,
    } as AppNode));

    set((s) => ({ nodes: [...s.nodes, ...newNodes] }));
  },

  removeNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    })),

  removeNodes: (nodeIds) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => !nodeIds.includes(n.id)),
      edges: state.edges.filter((e) => !nodeIds.includes(e.source) && !nodeIds.includes(e.target)),
    })),
}));
