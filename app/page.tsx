"use client"
import { Box, Input } from "@yamada-ui/react";
import { useCallback, useState, useEffect } from "react";
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, NodeChange, EdgeChange, Connection, Handle, Position, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// カスタム検索ノード
function SearchNode({ data }: { data: { label: string; onSearch: (value: string) => void; searchTerm: string } }) {
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
        value={data.searchTerm}
        onChange={(e) => data.onSearch(e.target.value)}
        border="none"
        outline="none"
      />
      <Handle type="source" position={Position.Bottom} />
    </Box>
  );
}

// カスタム検索結果ノード
function ResultNode({ data }: { data: { label: string; category?: string } }) {
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
      <Box>
        <Box as="span" fontSize="14px" color="#495057" fontWeight="bold">
          {data.label}
        </Box>
        {data.category && (
          <Box as="span" fontSize="12px" color="#6c757d" display="block" mt="4px">
            {data.category}
          </Box>
        )}
      </Box>
    </Box>
  );
}

const nodeTypes = {
  searchNode: SearchNode,
  resultNode: ResultNode,
};

// 検索対象のデータ
const allResults = [
  { id: 'result1', label: 'React フック', category: 'フロントエンド' },
  { id: 'result2', label: 'TypeScript 型定義', category: 'フロントエンド' },
  { id: 'result3', label: 'Node.js サーバー', category: 'バックエンド' },
  { id: 'result4', label: 'データベース設計', category: 'バックエンド' },
  { id: 'result5', label: 'API 設計', category: 'バックエンド' },
  { id: 'result6', label: 'CSS アニメーション', category: 'フロントエンド' },
  { id: 'result7', label: 'GraphQL クエリ', category: 'バックエンド' },
  { id: 'result8', label: 'React コンポーネント', category: 'フロントエンド' },
];

export default function Home() {
  // 検索関連の状態
  const [searchTerm, setSearchTerm] = useState('');
  
  // 検索機能
  const handleSearch = useCallback((value: string) => {
    console.log('検索中:', value);
    setSearchTerm(value);
    
    // ノードの表示/非表示を更新
    setNodes(currentNodes => 
      currentNodes.map(node => {
        if (node.id === 'search') return node;
        
        const result = allResults.find(r => r.id === node.id);
        if (!result) return node;
        
        const isVisible = value.trim() === '' || 
          result.label.toLowerCase().includes(value.toLowerCase()) ||
          result.category.toLowerCase().includes(value.toLowerCase());
          
        return { ...node, hidden: !isVisible };
      })
    );
    
    // エッジの表示/非表示も更新
    setEdges(currentEdges =>
      currentEdges.map(edge => {
        const targetResult = allResults.find(r => r.id === edge.target);
        if (!targetResult) return edge;
        
        const isVisible = value.trim() === '' || 
          targetResult.label.toLowerCase().includes(value.toLowerCase()) ||
          targetResult.category.toLowerCase().includes(value.toLowerCase());
          
        return { ...edge, hidden: !isVisible };
      })
    );
  }, []);

  // 初期ノード（元の方式）
  const initialNodes: Node[] = [
    {
      id: 'search',
      type: 'searchNode',
      position: { x: 250, y: 50 },
      data: {
        label: '検索',
        onSearch: handleSearch,
        searchTerm: searchTerm
      }
    },
    ...allResults.map((result, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      return {
        id: result.id,
        type: 'resultNode',
        position: {
          x: 150 + col * 150,
          y: 200 + row * 100
        },
        data: {
          label: result.label,
          category: result.category
        }
      };
    })
  ];

  const initialEdges: Edge[] = allResults.map(result => ({
    id: `search-${result.id}`,
    source: 'search',
    target: result.id
  }));

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  // 検索語句が変更されたときに検索ノードを更新
  const updateSearchNode = useCallback(() => {
    setNodes(currentNodes => 
      currentNodes.map(node => 
        node.id === 'search' 
          ? { ...node, data: { ...node.data, searchTerm: searchTerm } }
          : node
      )
    );
  }, [searchTerm]);

  // searchTermが変わったら検索ノードを更新
  useEffect(() => {
    updateSearchNode();
  }, [updateSearchNode]);

  // ReactFlowの標準的なコールバック
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
    <Box w="full" h="100dvh" position="relative">
      {/* 検索状態表示 */}
      {searchTerm && (
        <Box
          position="absolute"
          top="10px"
          left="10px"
          bg="rgba(0, 122, 204, 0.1)"
          border="1px solid #007acc"
          borderRadius="6px"
          p="8px 12px"
          zIndex={1000}
          fontSize="14px"
          color="#007acc"
        >
          検索中: "{searchTerm}" ({nodes.filter(n => n.id !== 'search' && !n.hidden).length}件の結果)
        </Box>
      )}
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
