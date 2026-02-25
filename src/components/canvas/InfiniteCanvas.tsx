import { useCallback, useRef, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  type OnSelectionChangeFunc,
  type NodeMouseHandler,
} from '@xyflow/react';
import { useCanvasStore } from '../../stores/canvasStore';
import { useThemeStore } from '../../stores/themeStore';
import Text2ImageNode from '../nodes/Text2ImageNode';
import Image2ImageNode from '../nodes/Image2ImageNode';
import ImageNode from '../nodes/ImageNode';
import GridNode from '../nodes/GridNode';
import SplitGroupNode from '../nodes/SplitGroupNode';
import NodeContextMenu from '../ui/NodeContextMenu';
import CanvasContextMenu from '../ui/CanvasContextMenu';

const nodeTypes = {
  text2image: Text2ImageNode,
  image2image: Image2ImageNode,
  image: ImageNode,
  grid: GridNode,
  splitGroup: SplitGroupNode,
};

export default function InfiniteCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNodeId,
    addImageNode,
  } = useCanvasStore();

  const { theme } = useThemeStore();

  const { screenToFlowPosition } = useReactFlow();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const [contextMenu, setContextMenu] = useState<{
    nodeIds: string[];
    x: number;
    y: number;
  } | null>(null);

  const [canvasContextMenu, setCanvasContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const onNodeContextMenu: NodeMouseHandler = useCallback(
    (event, node) => {
      event.preventDefault();
      setCanvasContextMenu(null);

      const { nodes } = useCanvasStore.getState();
      const selectedNodes = nodes.filter(n => n.selected);
      const isSelected = selectedNodes.some(n => n.id === node.id);

      let targetNodeIds = [node.id];
      if (isSelected && selectedNodes.length > 1) {
        targetNodeIds = selectedNodes.map(n => n.id);
      }

      setContextMenu({ nodeIds: targetNodeIds, x: event.clientX, y: event.clientY });
    },
    [],
  );

  const onPaneContextMenu = useCallback((event: React.MouseEvent | MouseEvent) => {
    event.preventDefault();
    setContextMenu(null);
    setCanvasContextMenu({ x: event.clientX, y: event.clientY });
  }, []);

  const onNodeDragStart = useCallback(() => {
    setContextMenu(null);
    setCanvasContextMenu(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
    setCanvasContextMenu(null);
  }, []);

  const onSelectionChange: OnSelectionChangeFunc = useCallback(
    ({ nodes: selectedNodes }) => {
      if (selectedNodes.length === 1) {
        setSelectedNodeId(selectedNodes[0].id);
      } else {
        setSelectedNodeId(null);
      }
    },
    [setSelectedNodeId],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const data = event.dataTransfer.getData('application/instavideo-asset');
      if (!data) return;

      const { image, name } = JSON.parse(data);

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Offset by half the node size to center it on the cursor
      // ImageNode is 200px wide and roughly 225px high
      // We don't need to manually offset here because screenToFlowPosition already handles the zoom level
      // and we want the top-left corner of the node to be at the cursor position, or we can offset by a fixed amount
      // in flow coordinates (which are already scaled)
      position.x -= 100;
      position.y -= 112;

      addImageNode(position, image, name);
    },
    [addImageNode, screenToFlowPosition],
  );

  const defaultEdgeOptions = useMemo(
    () => ({
      animated: true,
      style: { strokeWidth: 2 },
    }),
    [],
  );

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        onNodeDragStart={onNodeDragStart}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.1}
        maxZoom={2}
        snapToGrid
        snapGrid={[16, 16]}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Shift', 'Control', 'Meta']}
        className="bg-canvas-bg dark:bg-canvas-bg-dark"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={2}
          color={theme === 'dark' ? '#444' : '#aaa'}
          className="bg-canvas-bg! dark:bg-canvas-bg-dark!"
        />
        <Controls
          className="bg-surface! dark:bg-surface-dark! border-border! dark:border-border-dark! rounded-lg! shadow-lg! [&>button]:bg-surface! [&>button]:dark:bg-surface-dark! [&>button]:border-border! [&>button]:dark:border-border-dark! [&>button]:text-text-primary! [&>button]:dark:text-text-primary-dark!"
        />
        <MiniMap
          className="bg-surface! dark:bg-surface-dark! border-border! dark:border-border-dark! rounded-lg!"
          nodeColor={theme === 'dark' ? '#333333' : '#e8e8e8'}
          maskColor={theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
        />
      </ReactFlow>
      {contextMenu && (
        <NodeContextMenu
          nodeIds={contextMenu.nodeIds}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
      {canvasContextMenu && (
        <CanvasContextMenu
          x={canvasContextMenu.x}
          y={canvasContextMenu.y}
          onClose={() => setCanvasContextMenu(null)}
        />
      )}
    </div>
  );
}
