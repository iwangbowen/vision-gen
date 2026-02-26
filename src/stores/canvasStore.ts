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
  MultiInputData,
  ImageData as AppImageData,
  GridSize,
  GridCell,
  ImageStyle,
} from '../types';

type GenerativeNodeData = Text2ImageData | Image2ImageData | MultiInputData;
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
  addMultiInputNode: (position: { x: number; y: number }) => string;
  createMultiInputFromSelection: (nodeIds: string[]) => void;
  addGridNode: (position: { x: number; y: number }, gridSize: GridSize, generatedImages?: string[]) => void;

  // Node actions
  updateNodeData: (nodeId: string, data: Partial<GenerativeNodeData>) => void;
  simulateGenerate: (nodeId: string) => Promise<void>;
  generateRepaint: (nodeId: string, sourceImage: string, maskImage: string, prompt: string) => Promise<void>;
  generateRepaintToImage2Image: (
    sourceNodeId: string,
    sourceImage: string,
    maskImage: string,
    prompt: string,
    label: string,
    options?: {
      gridSize?: string;
      aspectRatio?: string;
      imageSize?: string;
      style?: string;
    }
  ) => Promise<void>;
  splitGridNode: (nodeId: string) => void;
  splitGeneratedImage: (nodeId: string, customGridSize?: string) => Promise<void>;
  generateOutpaint: (sourceNodeId: string, sourceImage: string, targetAspectRatio: string, label: string, style?: string) => Promise<void>;
  generateEnhance: (sourceNodeId: string, sourceImage: string, label: string, style?: string) => Promise<void>;
  generateRemoveWatermark: (sourceNodeId: string, sourceImage: string, label: string) => Promise<void>;
  duplicateNode: (nodeId: string) => void;
  duplicateNodes: (nodeIds: string[]) => void;
  removeNode: (nodeId: string) => void;
  removeNodes: (nodeIds: string[]) => void;

  // Clipboard operations
  clipboard: { nodes: AppNode[]; isCut: boolean };
  copyNodes: (nodeIds: string[]) => void;
  cutNodes: (nodeIds: string[]) => void;
  pasteNodes: (offset?: { x: number; y: number }) => void;
}

let nodeIdCounter = 0;
const getNodeId = () => `node_${++nodeIdCounter}_${Date.now()}`;

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  rightPanelOpen: false,
  clipboard: { nodes: [], isCut: false },

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

  addMultiInputNode: (position) => {
    const id = getNodeId();
    const newNode: AppNode = {
      id,
      type: 'multiInput',
      position,
      data: {
        label: '多图融合',
        prompt: '',
        status: 'idle',
        gridSize: '1x1',
        aspectRatio: '16:9',
        imageSize: '1k',
        style: '',
      },
    };
    set((state) => ({ nodes: [...state.nodes, newNode] }));
    return id;
  },

  createMultiInputFromSelection: (nodeIds) => {
    const state = get();
    const selectedNodes = state.nodes.filter(n => nodeIds.includes(n.id));
    if (selectedNodes.length === 0) return;

    // Calculate position (right of the rightmost selected node)
    let maxX = -Infinity;
    let avgY = 0;
    selectedNodes.forEach(n => {
      if (n.position.x > maxX) maxX = n.position.x;
      avgY += n.position.y;
    });
    avgY /= selectedNodes.length;

    const position = { x: maxX + 400, y: avgY };
    const newId = get().addMultiInputNode(position);

    // Create edges
    const newEdges = selectedNodes.map(n => ({
      id: `e_${n.id}_${newId}`,
      source: n.id,
      target: newId,
      animated: true,
      style: { strokeWidth: 2 },
    }));

    set((state) => ({
      edges: [...state.edges, ...newEdges],
      // Deselect old nodes, select new node
      nodes: state.nodes.map(n => ({
        ...n,
        selected: n.id === newId
      })),
      selectedNodeId: newId
    }));
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

    const data = node.data as GenerativeNodeData;
    const prompt = data.prompt || '';
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    useTaskStore.getState().addTask({
      id: taskId,
      nodeId,
      type: node.type as 'text2image' | 'image2image' | 'multiInput',
      prompt,
    });

    updateNodeData(nodeId, { status: 'generating' } as Partial<GenerativeNodeData>);

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
      type: 'image2image',
      position: newNodePosition,
      data: {
        label: prompt || '生成中...',
        prompt: '',
        sourceImage: '', // Empty source image initially, will be set after generation
        status: 'generating',
        gridSize: '1x1',
        aspectRatio: data.aspectRatio || '16:9',
        imageSize: data.imageSize || '1k',
        style: data.style || '',
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
        sourceImages: (data as MultiInputData).sourceImages,
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

      updateNodeData(nodeId, { status: 'done' } as Partial<GenerativeNodeData>);

      // Update the result node with the generated image as sourceImage
      updateNodeData(newNodeId, {
        label: prompt || '生成的图片',
        sourceImage: image,
        status: 'idle',
      } as Partial<Image2ImageData>);

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

          if (node.type === 'text2image' || node.type === 'image2image' || node.type === 'multiInput') {
            const image = getRandomSampleImage();
            updateNodeData(nodeId, { status: 'done' } as Partial<GenerativeNodeData>);

            // Update the result node with the generated image as sourceImage
            updateNodeData(newNodeId, {
              label: prompt || '生成的图片',
              sourceImage: image,
              status: 'idle',
            } as Partial<Image2ImageData>);

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
        updateNodeData(nodeId, { status: 'idle' } as Partial<GenerativeNodeData>);

        // Remove the placeholder node and edge on error
        set((state) => ({
          nodes: state.nodes.filter(n => n.id !== newNodeId),
          edges: state.edges.filter(e => e.id !== `edge_${nodeId}_${newNodeId}`)
        }));
      }
    }
  },

  generateRepaint: async (nodeId, sourceImage, maskImage, prompt) => {
    const { updateNodeData } = get();
    const node = get().nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    useTaskStore.getState().addTask({
      id: taskId,
      nodeId,
      type: 'image2image',
      prompt,
    });

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

      // Call the actual LLM service with all parameters
      const result = await llmService.generateImage({
        prompt,
        sourceImage,
        maskImage,
      });

      clearInterval(progressInterval);
      useTaskStore.getState().updateTask(taskId, { status: 'done', progress: 100, endTime: Date.now() });

      let image: string;
      if (typeof result === 'string') {
        image = result;
      } else if (Array.isArray(result)) {
        image = result[0];
      } else {
        image = String(result);
      }

      // Update the node with the generated image
      updateNodeData(nodeId, {
        image: image,
        status: 'done',
      } as Partial<AppImageData>);

    } catch (error) {
      console.error('Failed to generate repaint image:', error);

      const errorMessage = error instanceof Error ? error.message : String(error);

      // If API key is not configured, fallback to simulation for demo purposes
      if (errorMessage.includes('not configured')) {
        setTimeout(() => {
          clearInterval(progressInterval);
          useTaskStore.getState().updateTask(taskId, { status: 'done', progress: 100, endTime: Date.now() });

          const image = getRandomSampleImage();

          // Update the node with the generated image
          updateNodeData(nodeId, {
            image: image,
            status: 'done',
          } as Partial<AppImageData>);
        }, 1500);
      } else {
        clearInterval(progressInterval);
        useTaskStore.getState().updateTask(taskId, { status: 'error', error: errorMessage, endTime: Date.now() });
        alert(`重绘图片失败: ${errorMessage}`);
        updateNodeData(nodeId, { status: 'idle' } as Partial<AppImageData>);
      }
    }
  },

  generateRepaintToImage2Image: async (sourceNodeId, sourceImage, maskImage, prompt, label, options) => {
    const node = get().nodes.find((n) => n.id === sourceNodeId);
    if (!node) return;

    // Create a placeholder Image2Image node immediately (shown as generating)
    const newNodeId = get().addImage2ImageNode(
      { x: node.position.x + 250, y: node.position.y },
      '', // No source image yet — will be set after generation
      `${label} (重绘)`
    );

    get().updateNodeData(newNodeId, { status: 'generating' } as Partial<Image2ImageData>);

    get().onConnect({
      source: sourceNodeId,
      target: newNodeId,
      sourceHandle: null,
      targetHandle: null
    });

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    useTaskStore.getState().addTask({
      id: taskId,
      nodeId: newNodeId,
      type: 'image2image',
      prompt,
    });

    const progressInterval = setInterval(() => {
      const task = useTaskStore.getState().tasks.find(t => t.id === taskId);
      if (task?.status === 'generating' && task.progress < 90) {
        useTaskStore.getState().updateTask(taskId, { progress: task.progress + Math.floor(Math.random() * 10) + 5 });
      }
    }, 500);

    try {
      const { getLLMService } = await import('../services/llm/factory');
      const llmService = getLLMService();

      const result = await llmService.generateImage({
        prompt,
        sourceImage,
        maskImage,
        gridSize: options?.gridSize,
        aspectRatio: options?.aspectRatio,
        size: options?.imageSize,
        style: options?.style,
      });

      clearInterval(progressInterval);
      useTaskStore.getState().updateTask(taskId, { status: 'done', progress: 100, endTime: Date.now() });

      let image: string;
      if (typeof result === 'string') {
        image = result;
      } else if (Array.isArray(result)) {
        image = result[0];
      } else {
        image = String(result);
      }

      // Set the repaint result as sourceImage on the Image2Image node
      get().updateNodeData(newNodeId, {
        sourceImage: image,
        status: 'idle',
        gridSize: options?.gridSize || '1x1',
      } as Partial<Image2ImageData>);

    } catch (error) {
      console.error('Failed to generate repaint image:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('not configured')) {
        setTimeout(() => {
          clearInterval(progressInterval);
          useTaskStore.getState().updateTask(taskId, { status: 'done', progress: 100, endTime: Date.now() });

          const image = getRandomSampleImage();
          get().updateNodeData(newNodeId, {
            sourceImage: image,
            status: 'idle',
            gridSize: options?.gridSize || '1x1',
          } as Partial<Image2ImageData>);
        }, 1500);
      } else {
        clearInterval(progressInterval);
        useTaskStore.getState().updateTask(taskId, { status: 'error', error: errorMessage, endTime: Date.now() });
        alert(`重绘图片失败: ${errorMessage}`);
        // Remove the placeholder node on error
        set((state) => ({
          nodes: state.nodes.filter(n => n.id !== newNodeId),
          edges: state.edges.filter(e => e.target !== newNodeId)
        }));
      }
    }
  },

  generateOutpaint: async (sourceNodeId, sourceImage, targetAspectRatio, label, style) => {
    const node = get().nodes.find((n) => n.id === sourceNodeId);
    if (!node) return;

    const newNodeId = get().addImage2ImageNode(
      { x: node.position.x + 280, y: node.position.y },
      '',
      `${label} (扩图 ${targetAspectRatio})`
    );

    get().updateNodeData(newNodeId, { status: 'generating' } as Partial<Image2ImageData>);
    get().onConnect({ source: sourceNodeId, target: newNodeId, sourceHandle: null, targetHandle: null });

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    useTaskStore.getState().addTask({ id: taskId, nodeId: newNodeId, type: 'image2image', prompt: '扩图' });

    const progressInterval = setInterval(() => {
      const task = useTaskStore.getState().tasks.find(t => t.id === taskId);
      if (task?.status === 'generating' && task.progress < 90) {
        useTaskStore.getState().updateTask(taskId, { progress: task.progress + Math.floor(Math.random() * 10) + 5 });
      }
    }, 500);

    const outpaintPrompt = `Extend and expand this image to fill a ${targetAspectRatio} aspect ratio. Seamlessly fill the new areas by naturally continuing the scene, maintaining the same artistic style, lighting, color palette, and visual coherence as the original image.`;

    try {
      const { getLLMService } = await import('../services/llm/factory');
      const llmService = getLLMService();

      const result = await llmService.generateImage({
        prompt: outpaintPrompt,
        sourceImage,
        aspectRatio: targetAspectRatio,
        style,
      });

      clearInterval(progressInterval);
      useTaskStore.getState().updateTask(taskId, { status: 'done', progress: 100, endTime: Date.now() });

      const image = typeof result === 'string' ? result : Array.isArray(result) ? result[0] : String(result);

      get().updateNodeData(newNodeId, {
        sourceImage: image,
        status: 'idle',
        aspectRatio: targetAspectRatio,
      } as Partial<Image2ImageData>);

    } catch (error) {
      console.error('Failed to outpaint image:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('not configured')) {
        setTimeout(() => {
          clearInterval(progressInterval);
          useTaskStore.getState().updateTask(taskId, { status: 'done', progress: 100, endTime: Date.now() });
          const image = getRandomSampleImage();
          get().updateNodeData(newNodeId, { sourceImage: image, status: 'idle', aspectRatio: targetAspectRatio } as Partial<Image2ImageData>);
        }, 1500);
      } else {
        clearInterval(progressInterval);
        useTaskStore.getState().updateTask(taskId, { status: 'error', error: errorMessage, endTime: Date.now() });
        alert(`扩图失败: ${errorMessage}`);
        set((state) => ({
          nodes: state.nodes.filter(n => n.id !== newNodeId),
          edges: state.edges.filter(e => e.target !== newNodeId),
        }));
      }
    }
  },

  generateEnhance: async (sourceNodeId, sourceImage, label, style) => {
    const node = get().nodes.find((n) => n.id === sourceNodeId);
    if (!node) return;

    const newNodeId = get().addImage2ImageNode(
      { x: node.position.x + 280, y: node.position.y },
      '',
      `${label} (变清晰)`
    );
    get().updateNodeData(newNodeId, { status: 'generating' } as Partial<Image2ImageData>);
    get().onConnect({ source: sourceNodeId, target: newNodeId, sourceHandle: null, targetHandle: null });

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    useTaskStore.getState().addTask({ id: taskId, nodeId: newNodeId, type: 'image2image', prompt: '变清晰' });

    const progressInterval = setInterval(() => {
      const task = useTaskStore.getState().tasks.find(t => t.id === taskId);
      if (task?.status === 'generating' && task.progress < 90) {
        useTaskStore.getState().updateTask(taskId, { progress: task.progress + Math.floor(Math.random() * 10) + 5 });
      }
    }, 500);

    const enhancePrompt = 'Enhance and sharpen this image. Make it clearer, more detailed, with improved resolution and sharpness while maintaining the original composition, colors, and style.';

    try {
      const { getLLMService } = await import('../services/llm/factory');
      const llmService = getLLMService();
      const result = await llmService.generateImage({ prompt: enhancePrompt, sourceImage, style });

      clearInterval(progressInterval);
      useTaskStore.getState().updateTask(taskId, { status: 'done', progress: 100, endTime: Date.now() });
      const image = typeof result === 'string' ? result : Array.isArray(result) ? result[0] : String(result);
      get().updateNodeData(newNodeId, { sourceImage: image, status: 'idle' } as Partial<Image2ImageData>);
    } catch (error) {
      console.error('Failed to enhance image:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('not configured')) {
        setTimeout(() => {
          clearInterval(progressInterval);
          useTaskStore.getState().updateTask(taskId, { status: 'done', progress: 100, endTime: Date.now() });
          get().updateNodeData(newNodeId, { sourceImage: getRandomSampleImage(), status: 'idle' } as Partial<Image2ImageData>);
        }, 1500);
      } else {
        clearInterval(progressInterval);
        useTaskStore.getState().updateTask(taskId, { status: 'error', error: errorMessage, endTime: Date.now() });
        alert(`变清晰失败: ${errorMessage}`);
        set((state) => ({
          nodes: state.nodes.filter(n => n.id !== newNodeId),
          edges: state.edges.filter(e => e.target !== newNodeId),
        }));
      }
    }
  },

  generateRemoveWatermark: async (sourceNodeId, sourceImage, label) => {
    const node = get().nodes.find((n) => n.id === sourceNodeId);
    if (!node) return;

    const newNodeId = get().addImage2ImageNode(
      { x: node.position.x + 280, y: node.position.y },
      '',
      `${label} (去水印)`
    );
    get().updateNodeData(newNodeId, { status: 'generating' } as Partial<Image2ImageData>);
    get().onConnect({ source: sourceNodeId, target: newNodeId, sourceHandle: null, targetHandle: null });

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    useTaskStore.getState().addTask({ id: taskId, nodeId: newNodeId, type: 'image2image', prompt: '去水印' });

    const progressInterval = setInterval(() => {
      const task = useTaskStore.getState().tasks.find(t => t.id === taskId);
      if (task?.status === 'generating' && task.progress < 90) {
        useTaskStore.getState().updateTask(taskId, { progress: task.progress + Math.floor(Math.random() * 10) + 5 });
      }
    }, 500);

    const removeWatermarkPrompt = 'Remove all watermarks, logos, text overlays, and stamps from this image. Seamlessly restore the underlying content behind the removed elements, maintaining a natural and coherent appearance.';

    try {
      const { getLLMService } = await import('../services/llm/factory');
      const llmService = getLLMService();
      const result = await llmService.generateImage({ prompt: removeWatermarkPrompt, sourceImage });

      clearInterval(progressInterval);
      useTaskStore.getState().updateTask(taskId, { status: 'done', progress: 100, endTime: Date.now() });
      const image = typeof result === 'string' ? result : Array.isArray(result) ? result[0] : String(result);
      get().updateNodeData(newNodeId, { sourceImage: image, status: 'idle' } as Partial<Image2ImageData>);
    } catch (error) {
      console.error('Failed to remove watermark:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('not configured')) {
        setTimeout(() => {
          clearInterval(progressInterval);
          useTaskStore.getState().updateTask(taskId, { status: 'done', progress: 100, endTime: Date.now() });
          get().updateNodeData(newNodeId, { sourceImage: getRandomSampleImage(), status: 'idle' } as Partial<Image2ImageData>);
        }, 1500);
      } else {
        clearInterval(progressInterval);
        useTaskStore.getState().updateTask(taskId, { status: 'error', error: errorMessage, endTime: Date.now() });
        alert(`去水印失败: ${errorMessage}`);
        set((state) => ({
          nodes: state.nodes.filter(n => n.id !== newNodeId),
          edges: state.edges.filter(e => e.target !== newNodeId),
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

  splitGeneratedImage: async (nodeId, customGridSize) => {
    const state = get();
    const node = state.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    let generatedImage: string | undefined;
    let gridSize: string | undefined;
    let parentStyle: string | undefined = '';

    if (node.type === 'text2image') {
      generatedImage = (node.data as Text2ImageData).generatedImage;
      gridSize = customGridSize || (node.data as Text2ImageData).gridSize;
      parentStyle = (node.data as Text2ImageData).style;
    } else if (node.type === 'image2image') {
      // For image2image, the result is stored in sourceImage (e.g. after repaint) or generatedImage
      generatedImage = (node.data as Image2ImageData).generatedImage || (node.data as Image2ImageData).sourceImage;
      gridSize = customGridSize || (node.data as Image2ImageData).gridSize;
      parentStyle = (node.data as Image2ImageData).style;
    } else if (node.type === 'image') {
      generatedImage = (node.data as AppImageData).image;
      gridSize = customGridSize || (node.data as AppImageData).gridSize;
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

    const cellSpacingX = 250; // Increased spacing for image2image nodes
    const cellSpacingY = 300; // Increased vertical spacing for image2image nodes
    const padding = 20;
    const groupWidth = size * cellSpacingX + padding * 2;
    const groupHeight = size * cellSpacingY + padding * 2 + 40; // extra 40 for label

    // Create a group node as the parent
    const groupId = getNodeId();
    const groupNode: AppNode = {
      id: groupId,
      type: 'splitGroup',
      position: { x: node.position.x + 300, y: node.position.y },
      data: {
        label: `切分组 ${gridSize}`,
      },
      style: { width: groupWidth, height: groupHeight },
    } as AppNode;

    // Create child image nodes with positions relative to the group
    const childNodes: AppNode[] = splitImages.map((imgSrc, idx) => ({
      id: getNodeId(),
      type: 'image2image' as const,
      position: {
        x: padding + (idx % size) * cellSpacingX,
        y: padding + 40 + Math.floor(idx / size) * cellSpacingY,
      },
      parentId: groupId,
      extent: 'parent' as const,
      data: {
        label: `分镜 ${Math.floor(idx / size) + 1}-${(idx % size) + 1}`,
        sourceImage: imgSrc,
        prompt: '',
        status: 'idle',
        gridSize: '1x1',
        aspectRatio: '16:9',
        imageSize: '1k',
        style: parentStyle as ImageStyle || '',
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

  copyNodes: (nodeIds) => {
    const state = get();
    const nodesToCopy = state.nodes.filter((n) => nodeIds.includes(n.id));
    if (nodesToCopy.length === 0) return;
    set({ clipboard: { nodes: nodesToCopy.map((n) => ({ ...n, data: { ...n.data } } as AppNode)), isCut: false } });
  },

  cutNodes: (nodeIds) => {
    const state = get();
    const nodesToCut = state.nodes.filter((n) => nodeIds.includes(n.id));
    if (nodesToCut.length === 0) return;
    set({
      clipboard: { nodes: nodesToCut.map((n) => ({ ...n, data: { ...n.data } } as AppNode)), isCut: true },
      nodes: state.nodes.filter((n) => !nodeIds.includes(n.id)),
      edges: state.edges.filter((e) => !nodeIds.includes(e.source) && !nodeIds.includes(e.target)),
    });
  },

  pasteNodes: (offset) => {
    const state = get();
    const { nodes: clipboardNodes, isCut } = state.clipboard;
    if (clipboardNodes.length === 0) return;

    const dx = offset?.x ?? 50;
    const dy = offset?.y ?? 50;

    const newNodes: AppNode[] = clipboardNodes.map((node) => ({
      ...node,
      id: getNodeId(),
      position: { x: node.position.x + dx, y: node.position.y + dy },
      data: { ...node.data },
      selected: false,
    } as AppNode));

    set((s) => ({ nodes: [...s.nodes, ...newNodes] }));

    // After paste from cut, clear clipboard so it's a one-time move
    if (isCut) {
      set({ clipboard: { nodes: [], isCut: false } });
    }
  },
}));
