"use client"
import { Box, Input } from "@yamada-ui/react";
import { useCallback, useState } from "react";
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, NodeChange, EdgeChange, Connection, Handle, Position, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// カスタム検索ノード
function SearchNode({ data }: { data: { label: string; onSearch: (value: string) => void } }) {
  return (
    <Box
      p="12px"
      bg="#fff"
      border="2px solid #007acc"
      borderRadius="8px"
      minW="200px"
      boxShadow="0 2px 8px rgba(0,0,0,0.1)"
    >
      <Input
      placeholder="検索してください..."
      onChange={(e) => data.onSearch(e.target.value)}
      border="none"
      outline="none"
      />
      <Handle type="source" position={Position.Bottom} />
    </Box>
  );
}

// カスタム検索結果ノード
function ResultNode({ data }: { data: { label: string } }) {
  return (
    <Box
      p="10px 16px"
      bg="#f8f9fa"
      border="1px solid #dee2e6"
      borderRadius="6px"
      minW="120px"
      boxShadow="0 1px 4px rgba(0,0,0,0.1)"
    >
      <Handle type="target" position={Position.Top} />
      <Box as="span" fontSize="14px" color="#495057">
        {data.label}
      </Box>
    </Box>
  );
}

const nodeTypes = {
  searchNode: SearchNode,
  resultNode: ResultNode,
};

const initialNodes: Node[] = [
  {
    id: 'search',
    type: 'searchNode',
    position: { x: 250, y: 50 },
    data: {
      label: '検索',
      onSearch: (value: string) => console.log('検索:', value)
    }
  },
  {
    id: 'result1',
    type: 'resultNode',
    position: { x: 100, y: 200 },
    data: { label: '検索結果 1' }
  },
  {
    id: 'result2',
    type: 'resultNode',
    position: { x: 250, y: 200 },
    data: { label: '検索結果 2' }
  },
  {
    id: 'result3',
    type: 'resultNode',
    position: { x: 400, y: 200 },
    data: { label: '検索結果 3' }
  },
  {
    id: 'result4',
    type: 'resultNode',
    position: { x: 175, y: 300 },
    data: { label: '検索結果 4' }
  },
  {
    id: 'result5',
    type: 'resultNode',
    position: { x: 325, y: 300 },
    data: { label: '検索結果 5' }
  },
];

const initialEdges: Edge[] = [
  { id: 'search-result1', source: 'search', target: 'result1' },
  { id: 'search-result2', source: 'search', target: 'result2' },
  { id: 'search-result3', source: 'search', target: 'result3' },
  { id: 'search-result4', source: 'search', target: 'result4' },
  { id: 'search-result5', source: 'search', target: 'result5' },
];


export default function Home() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [],
  );
  return (
    <Box w="full" h="100dvh">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
      />
    </Box>
  );
}
