import { useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type OnSelectionChangeFunc,
} from '@xyflow/react';
import { useCanvasStore } from '../../stores/canvasStore';
import Text2ImageNode from '../nodes/Text2ImageNode';
import Image2ImageNode from '../nodes/Image2ImageNode';
import ImageNode from '../nodes/ImageNode';
import GridNode from '../nodes/GridNode';

const nodeTypes = {
  text2image: Text2ImageNode,
  image2image: Image2ImageNode,
  image: ImageNode,
  grid: GridNode,
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

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

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
      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;

      const position = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };
      addImageNode(position, image, name);
    },
    [addImageNode],
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
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ maxZoom: 0.6, padding: 0.3 }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        minZoom={0.1}
        maxZoom={2}
        snapToGrid
        snapGrid={[16, 16]}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode="Shift"
        className="bg-canvas-bg dark:bg-canvas-bg-dark"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          className="!bg-canvas-bg dark:!bg-canvas-bg-dark"
        />
        <Controls
          className="!bg-surface dark:!bg-surface-dark !border-border dark:!border-border-dark !rounded-lg !shadow-lg [&>button]:!bg-surface [&>button]:dark:!bg-surface-dark [&>button]:!border-border [&>button]:dark:!border-border-dark [&>button]:!text-text-primary [&>button]:dark:!text-text-primary-dark"
        />
        <MiniMap
          className="!bg-surface dark:!bg-surface-dark !border-border dark:!border-border-dark !rounded-lg"
          nodeColor="#e8e8e8"
          maskColor="rgba(0,0,0,0.1)"
        />
      </ReactFlow>
    </div>
  );
}
