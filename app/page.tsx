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
      <Handle type="source" position={Position.Top} id="top" />
      <Input
        placeholder="検索してください..."
        value={data.searchTerm}
        onChange={(e) => data.onSearch(e.target.value)}
        border="none"
        outline="none"
      />
      <Handle type="source" position={Position.Bottom} id="bottom" />
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

// カスタム検索語ノード
function SearchTermNode({ data }: { data: { label: string; category?: string } }) {
  return (
    <Box
      p="10px 16px"
      bg="#e3f2fd"
      border="2px solid #1976d2"
      borderRadius="6px"
      minW="120px"
      boxShadow="0 2px 6px rgba(25,118,210,0.2)"
    >
      <Handle type="target" position={Position.Bottom} />
      <Box>
        <Box as="span" fontSize="14px" color="#1565c0" fontWeight="bold">
          {data.label}
        </Box>
        {data.category && (
          <Box as="span" fontSize="12px" color="#1976d2" display="block" mt="4px">
            {data.category}
          </Box>
        )}
      </Box>
      <Handle type="source" position={Position.Bottom} />
    </Box>
  );
}

const nodeTypes = {
  searchNode: SearchNode,
  resultNode: ResultNode,
  searchTermNode: SearchTermNode,
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
    
    if (value.trim() === '') {
      // 検索語が空の場合は検索ノードを削除し、結果ノードを全て表示
      setNodes(currentNodes => 
        currentNodes.filter(node => node.id !== 'search-term').map(node => {
          if (node.id === 'search') return node;
          return { ...node, hidden: false };
        })
      );
      setEdges(currentEdges =>
        currentEdges.filter(edge => 
          edge.source !== 'search-term' && 
          edge.target !== 'search-term' && 
          !edge.id.startsWith('term-to-')
        ).map(edge => ({
          ...edge,
          hidden: false
        }))
      );
    } else {
      // 検索語のノードを追加または更新
      setNodes(currentNodes => {
        const existingSearchTermNode = currentNodes.find(node => node.id === 'search-term');
        
        let updatedNodes = currentNodes;
        if (existingSearchTermNode) {
          // 既存の検索語ノードを更新
          updatedNodes = currentNodes.map(node => 
            node.id === 'search-term' 
              ? { ...node, data: { ...node.data, label: value } }
              : node
          );
        } else {
          // 新しい検索語ノードを追加
          const newSearchTermNode: Node = {
            id: 'search-term',
            type: 'searchTermNode',
            position: { x: 250, y: 50 }, // 検索ボックスの上に配置
            data: {
              label: value,
              category: '検索語'
            }
          };
          updatedNodes = [...currentNodes, newSearchTermNode];
        }
        
        // 検索結果ノードの表示/非表示を更新
        return updatedNodes.map(node => {
          if (node.id === 'search' || node.id === 'search-term') return node;
          
          const result = allResults.find(r => r.id === node.id);
          if (!result) return node;
          
          const isVisible = result.label.toLowerCase().includes(value.toLowerCase()) ||
            result.category.toLowerCase().includes(value.toLowerCase());
          
          return { ...node, hidden: !isVisible };
        });
      });
      
      // 検索語ノードと検索ボックスを繋ぐエッジを追加し、結果ノードのエッジを更新
      setEdges(currentEdges => {
        let updatedEdges = currentEdges;
        
        // 検索語エッジを追加
        const existingSearchTermEdge = currentEdges.find(edge => edge.id === 'search-to-term');
        if (!existingSearchTermEdge) {
          const newEdge: Edge = {
            id: 'search-to-term',
            source: 'search',
            target: 'search-term',
            sourceHandle: 'top'
          };
          updatedEdges = [...currentEdges, newEdge];
        }
        
        // 検索語ノードから検索結果への接続線を追加
        const matchedResults = allResults.filter(result =>
          result.label.toLowerCase().includes(value.toLowerCase()) ||
          result.category.toLowerCase().includes(value.toLowerCase())
        );
        
        // 既存の検索語→結果エッジを削除
        updatedEdges = updatedEdges.filter(edge => !edge.id.startsWith('term-to-'));
        
        updatedEdges = [...updatedEdges];
        
        // 結果ノードのエッジの表示/非表示を更新
        return updatedEdges.map(edge => {
          if (edge.id === 'search-to-term' || edge.id.startsWith('term-to-')) return edge;
          
          const targetResult = allResults.find(r => r.id === edge.target);
          if (!targetResult) return edge;
          
          const isVisible = targetResult.label.toLowerCase().includes(value.toLowerCase()) ||
            targetResult.category.toLowerCase().includes(value.toLowerCase());
          
          return { ...edge, hidden: !isVisible };
        });
      });
    }
  }, []);

  // 初期ノード（元の方式）
  const initialNodes: Node[] = [
    {
      id: 'search',
      type: 'searchNode',
      position: { x: 250, y: 150 }, // 検索ボックスを少し下に移動
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
          y: 300 + row * 100 // 初期位置も少し下に移動
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
    target: result.id,
    sourceHandle: 'bottom' // 検索ボックスの下部から接続
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
          検索中: "{searchTerm}" ({nodes.filter(n => n.id !== 'search' && n.id !== 'search-term' && !n.hidden).length}件の結果)
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
