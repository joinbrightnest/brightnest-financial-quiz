"use client";

import { useState, useRef, useCallback } from "react";

interface FlowNode {
  id: string;
  type: 'question' | 'article';
  title: string;
  content: string;
  position: { x: number; y: number };
  connections: string[];
}

interface FlowConnection {
  id: string;
  from: string;
  to: string;
  label?: string;
}

interface FlowBuilderProps {
  questions: Array<{
    id: string;
    prompt: string;
    options: Array<{ label: string; value: string }>;
  }>;
  articles: Array<{
    id: string;
    title: string;
    content: string;
    category: string;
  }>;
  onSave: (nodes: FlowNode[], connections: FlowConnection[]) => void;
  onCreateArticle: () => void;
  onRefresh?: () => void;
}

export default function FlowBuilder({ questions, articles, onSave, onCreateArticle, onRefresh }: FlowBuilderProps) {
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [connections, setConnections] = useState<FlowConnection[]>([]);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addQuestionNode = (question: any) => {
    const newNode: FlowNode = {
      id: `question-${question.id}`,
      type: 'question',
      title: question.prompt,
      content: question.prompt,
      position: { x: 100, y: 100 + nodes.length * 150 },
      connections: []
    };
    setNodes([...nodes, newNode]);
  };

  const addArticleNode = (article: any) => {
    const newNode: FlowNode = {
      id: `article-${article.id}`,
      type: 'article',
      title: article.title,
      content: article.content,
      position: { x: 400, y: 100 + nodes.length * 150 },
      connections: []
    };
    setNodes([...nodes, newNode]);
  };

  const handleNodeDrag = useCallback((nodeId: string, e: React.MouseEvent) => {
    if (draggedNode !== nodeId) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, position: { x, y } }
        : node
    ));
  }, [draggedNode]);

  const handleNodeMouseDown = (nodeId: string) => {
    setDraggedNode(nodeId);
  };

  const handleNodeMouseUp = () => {
    setDraggedNode(null);
  };

  const handleNodeClick = (nodeId: string) => {
    if (connectingFrom && connectingFrom !== nodeId) {
      // Create connection
      const newConnection: FlowConnection = {
        id: `conn-${connectingFrom}-${nodeId}`,
        from: connectingFrom,
        to: nodeId
      };
      setConnections([...connections, newConnection]);
      setConnectingFrom(null);
    } else {
      setSelectedNode(nodeId);
    }
  };

  const startConnection = (nodeId: string) => {
    setConnectingFrom(nodeId);
  };

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId));
  };

  const deleteConnection = (connectionId: string) => {
    setConnections(connections.filter(c => c.id !== connectionId));
  };

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Flow Builder</h2>
        
        {/* Questions */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Questions</h3>
          <div className="space-y-2">
            {questions.map((question) => (
              <div
                key={question.id}
                className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100"
                onClick={() => addQuestionNode(question)}
              >
                <div className="text-sm font-medium text-blue-900">{question.prompt}</div>
                <div className="text-xs text-blue-600">{question.options.length} options</div>
              </div>
            ))}
          </div>
        </div>

        {/* Articles */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Articles</h3>
            <div className="flex space-x-1">
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  title="Refresh articles"
                >
                  ↻
                </button>
              )}
              <button
                onClick={onCreateArticle}
                className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
              >
                + Create
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {articles.map((article) => (
              <div
                key={article.id}
                className="p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100"
                onClick={() => addArticleNode(article)}
              >
                <div className="text-sm font-medium text-green-900">{article.title}</div>
                <div className="text-xs text-green-600">{article.category}</div>
              </div>
            ))}
            {articles.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No articles yet. Click "+ Create" to add one.
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => onSave(nodes, connections)}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            Save Flow
          </button>
          <button
            onClick={() => {
              setNodes([]);
              setConnections([]);
            }}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={canvasRef}
          className="w-full h-full relative bg-gray-50"
          onMouseMove={(e) => {
            if (draggedNode) {
              handleNodeDrag(draggedNode, e);
            }
          }}
          onMouseUp={handleNodeMouseUp}
        >
          {/* Connections */}
          {connections.map((connection) => {
            const fromNode = nodes.find(n => n.id === connection.from);
            const toNode = nodes.find(n => n.id === connection.to);
            
            if (!fromNode || !toNode) return null;

            const fromX = fromNode.position.x + 100; // Center of node
            const fromY = fromNode.position.y + 50;
            const toX = toNode.position.x + 100;
            const toY = toNode.position.y + 50;

            return (
              <svg
                key={connection.id}
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: 1 }}
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#6B7280"
                    />
                  </marker>
                </defs>
                <path
                  d={`M ${fromX} ${fromY} Q ${(fromX + toX) / 2} ${fromY - 50} ${toX} ${toY}`}
                  stroke="#6B7280"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                  className="cursor-pointer hover:stroke-blue-500"
                  onClick={() => deleteConnection(connection.id)}
                />
              </svg>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute w-48 p-4 rounded-lg border-2 cursor-move ${
                node.type === 'question'
                  ? 'bg-blue-100 border-blue-300'
                  : 'bg-green-100 border-green-300'
              } ${
                selectedNode === node.id ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{
                left: node.position.x,
                top: node.position.y,
                zIndex: 2
              }}
              onMouseDown={() => handleNodeMouseDown(node.id)}
              onClick={() => handleNodeClick(node.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`text-xs px-2 py-1 rounded-full ${
                  node.type === 'question'
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-green-200 text-green-800'
                }`}>
                  {node.type === 'question' ? 'QUESTION' : 'ARTICLE'}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNode(node.id);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
              
              <div className="text-sm font-medium text-gray-900 mb-1">
                {node.title.length > 30 ? `${node.title.substring(0, 30)}...` : node.title}
              </div>
              
              <div className="text-xs text-gray-600 mb-2">
                {node.content.length > 50 ? `${node.content.substring(0, 50)}...` : node.content}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startConnection(node.id);
                }}
                className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
              >
                Connect
              </button>
            </div>
          ))}

          {/* Instructions */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Build Your Quiz Flow</h3>
                <p className="text-gray-600 mb-4">Drag questions and articles from the sidebar to create your flow</p>
                <p className="text-sm text-gray-500">Click "Connect" to link elements with dotted lines</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
