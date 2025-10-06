"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface FlowNode {
  id: string;
  type: 'question' | 'article';
  title: string;
  content: string;
  position: { x: number; y: number };
  options?: Array<{ label: string; value: string }>;
  connections: { [key: string]: string }; // answer value -> target node id
}

interface FlowConnection {
  id: string;
  from: string;
  to: string;
  fromAnswer?: string; // For answer-specific connections
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
  const [connectingFrom, setConnectingFrom] = useState<{ nodeId: string; answerValue?: string } | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredConnectionPoint, setHoveredConnectionPoint] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addQuestionNode = (question: any) => {
    const newNode: FlowNode = {
      id: `question-${question.id}`,
      type: 'question',
      title: question.prompt,
      content: question.prompt,
      position: { x: 100, y: 100 + nodes.length * 200 },
      options: question.options,
      connections: {}
    };
    setNodes([...nodes, newNode]);
  };

  const addArticleNode = (article: any) => {
    const newNode: FlowNode = {
      id: `article-${article.id}`,
      type: 'article',
      title: article.title,
      content: article.content,
      position: { x: 400, y: 100 + nodes.length * 200 },
      connections: {}
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
    if (connectingFrom && connectingFrom.nodeId !== nodeId) {
      // Create connection
      const newConnection: FlowConnection = {
        id: `conn-${connectingFrom.nodeId}-${nodeId}-${Date.now()}`,
        from: connectingFrom.nodeId,
        to: nodeId,
        fromAnswer: connectingFrom.answerValue,
        label: connectingFrom.answerValue
      };
      setConnections([...connections, newConnection]);
      setConnectingFrom(null);
    } else {
      setSelectedNode(nodeId);
    }
  };

  const startConnection = (nodeId: string, answerValue?: string) => {
    setConnectingFrom({ nodeId, answerValue });
  };

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId));
  };

  const deleteConnection = (connectionId: string) => {
    setConnections(connections.filter(c => c.id !== connectionId));
  };

  const getConnectionPoint = (nodeId: string, answerValue?: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };

    const baseX = node.position.x + 200; // Right side of node
    const baseY = node.position.y + 30; // Top of node

    if (answerValue && node.options) {
      // Find the index of this answer to position the connection point
      const answerIndex = node.options.findIndex(opt => opt.value === answerValue);
      return {
        x: baseX,
        y: baseY + (answerIndex * 25) + 12 // Space out connection points for each answer
      };
    }

    return { x: baseX, y: baseY + 50 }; // Default connection point
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

        {/* Instructions */}
        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">How to Connect:</h4>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• Drag questions/articles to canvas</li>
            <li>• Click arrow on right side to start connection</li>
            <li>• For questions: click specific answer arrows</li>
            <li>• Click target node to complete connection</li>
            <li>• Each answer can lead to different outcomes</li>
          </ul>
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
            const fromPoint = getConnectionPoint(connection.from, connection.fromAnswer);
            const toPoint = getConnectionPoint(connection.to);

            return (
              <svg
                key={connection.id}
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: 1 }}
              >
                <defs>
                  <marker
                    id={`arrowhead-${connection.id}`}
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#3B82F6"
                    />
                  </marker>
                </defs>
                <path
                  d={`M ${fromPoint.x} ${fromPoint.y} Q ${fromPoint.x + 100} ${fromPoint.y} ${toPoint.x - 50} ${toPoint.y} L ${toPoint.x} ${toPoint.y}`}
                  stroke="#3B82F6"
                  strokeWidth="2"
                  fill="none"
                  markerEnd={`url(#arrowhead-${connection.id})`}
                  className="cursor-pointer hover:stroke-blue-600"
                  onClick={() => deleteConnection(connection.id)}
                />
                {connection.label && (
                  <text
                    x={(fromPoint.x + toPoint.x) / 2}
                    y={fromPoint.y - 10}
                    textAnchor="middle"
                    className="text-xs fill-blue-600 font-medium pointer-events-none"
                  >
                    {connection.label}
                  </text>
                )}
              </svg>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute w-64 p-4 rounded-lg border-2 cursor-move ${
                node.type === 'question'
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-green-50 border-green-300'
              } ${
                selectedNode === node.id ? 'ring-2 ring-blue-500' : ''
              } ${
                connectingFrom?.nodeId === node.id ? 'ring-2 ring-green-500' : ''
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
                  className="text-red-500 hover:text-red-700 text-lg"
                >
                  ×
                </button>
              </div>
              
              <div className="text-sm font-medium text-gray-900 mb-2">
                {node.title.length > 40 ? `${node.title.substring(0, 40)}...` : node.title}
              </div>

              {/* Question Options */}
              {node.type === 'question' && node.options && (
                <div className="space-y-1 mb-3">
                  {node.options.map((option, index) => (
                    <div key={option.value} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{option.label}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startConnection(node.id, option.value);
                        }}
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs ${
                          connectingFrom?.nodeId === node.id && connectingFrom?.answerValue === option.value
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'bg-white border-gray-300 hover:border-blue-500'
                        }`}
                        title={`Connect "${option.label}" to another element`}
                      >
                        →
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Article Connection Point */}
              {node.type === 'article' && (
                <div className="flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startConnection(node.id);
                    }}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                      connectingFrom?.nodeId === node.id
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-white border-gray-300 hover:border-blue-500'
                    }`}
                    title="Connect this article to another element"
                  >
                    →
                  </button>
                </div>
              )}
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
                <p className="text-sm text-gray-500">Click arrows to connect elements with answer-specific routing</p>
              </div>
            </div>
          )}

          {/* Connection Mode Indicator */}
          {connectingFrom && (
            <div className="absolute top-4 right-4 bg-green-100 border border-green-300 rounded-lg p-3">
              <div className="text-sm font-medium text-green-800">
                Connecting from: {connectingFrom.answerValue || 'General'}
              </div>
              <div className="text-xs text-green-600">
                Click a target node to complete the connection
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}