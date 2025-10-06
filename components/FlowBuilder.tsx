"use client";

import { useState, useRef, useCallback } from "react";

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
  fromAnswer?: string;
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
  const [draggedConnection, setDraggedConnection] = useState<{
    from: string;
    fromAnswer?: string;
    startPoint: { x: number; y: number };
    currentPoint: { x: number; y: number };
  } | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Add question to canvas
  const addQuestionToCanvas = (question: any) => {
    const newNode: FlowNode = {
      id: `question-${question.id}-${Date.now()}`,
      type: 'question',
      title: question.prompt,
      content: question.prompt,
      position: { x: 100 + (nodes.length % 3) * 300, y: 100 + Math.floor(nodes.length / 3) * 200 },
      options: question.options,
      connections: {}
    };
    setNodes([...nodes, newNode]);
  };

  // Add article to canvas
  const addArticleToCanvas = (article: any) => {
    const newNode: FlowNode = {
      id: `article-${article.id}-${Date.now()}`,
      type: 'article',
      title: article.title,
      content: article.content,
      position: { x: 100 + (nodes.length % 3) * 300, y: 100 + Math.floor(nodes.length / 3) * 200 },
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

  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggedNode(nodeId);
    setSelectedNode(nodeId);
  };

  const handleNodeMouseUp = () => {
    setDraggedNode(null);
  };

  const handleConnectionDragStart = (nodeId: string, answerValue: string | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const startPoint = getConnectionPoint(nodeId, answerValue);
    const currentPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    setDraggedConnection({
      from: nodeId,
      fromAnswer: answerValue,
      startPoint,
      currentPoint
    });
  };

  const handleConnectionDragMove = (e: React.MouseEvent) => {
    if (!draggedConnection) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    setDraggedConnection(prev => prev ? { ...prev, currentPoint } : null);
  };

  const handleConnectionDragEnd = (e: React.MouseEvent) => {
    if (!draggedConnection) return;

    // Find if we're over a node
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const targetNode = nodes.find(node => {
      const nodeRect = {
        left: node.position.x,
        top: node.position.y,
        right: node.position.x + 280,
        bottom: node.position.y + 120
      };
      return x >= nodeRect.left && x <= nodeRect.right && y >= nodeRect.top && y <= nodeRect.bottom;
    });

    if (targetNode && targetNode.id !== draggedConnection.from) {
      // Create connection
      const newConnection: FlowConnection = {
        id: `conn-${draggedConnection.from}-${targetNode.id}-${Date.now()}`,
        from: draggedConnection.from,
        to: targetNode.id,
        fromAnswer: draggedConnection.fromAnswer,
        label: draggedConnection.fromAnswer
      };
      setConnections([...connections, newConnection]);
    }

    setDraggedConnection(null);
  };

  const getConnectionPoint = (nodeId: string, answerValue?: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };

    const baseX = node.position.x + 280; // Right side of node
    const baseY = node.position.y + 30; // Top of node

    if (answerValue && node.options) {
      const answerIndex = node.options.findIndex(opt => opt.value === answerValue);
      return {
        x: baseX,
        y: baseY + (answerIndex * 20) + 15
      };
    }

    return { x: baseX, y: baseY + 60 }; // Default connection point
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
      {/* Sidebar - Palette */}
      <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Flow Builder</h2>
        
        {/* Instructions */}
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">How to Build Your Flow:</h4>
          <ol className="text-xs text-blue-700 space-y-1">
            <li>1. Click questions/articles to add to canvas</li>
            <li>2. Drag elements to position them</li>
            <li>3. Hold and drag arrows to connect elements</li>
            <li>4. Each answer can lead to different outcomes</li>
            <li>5. Save when your flow is complete</li>
          </ol>
        </div>
        
        {/* Questions */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Questions</h3>
          <div className="space-y-2">
            {questions.map((question) => (
              <div
                key={question.id}
                className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => addQuestionToCanvas(question)}
              >
                <div className="text-sm font-medium text-blue-900">{question.prompt}</div>
                <div className="text-xs text-blue-600">{question.options.length} options</div>
                <div className="text-xs text-gray-500 mt-1">Click to add to canvas</div>
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
                className="p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                onClick={() => addArticleToCanvas(article)}
              >
                <div className="text-sm font-medium text-green-900">{article.title}</div>
                <div className="text-xs text-green-600">{article.category}</div>
                <div className="text-xs text-gray-500 mt-1">Click to add to canvas</div>
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

      {/* Canvas - Workspace */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={canvasRef}
          className="w-full h-full relative bg-gray-50"
          onMouseMove={(e) => {
            if (draggedNode) {
              handleNodeDrag(draggedNode, e);
            }
            if (draggedConnection) {
              handleConnectionDragMove(e);
            }
          }}
          onMouseUp={(e) => {
            handleNodeMouseUp();
            handleConnectionDragEnd(e);
          }}
        >
          {/* Static Connections */}
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

          {/* Dynamic Connection Being Drawn */}
          {draggedConnection && (
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 10 }}
            >
              <defs>
                <marker
                  id="temp-arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#10B981"
                  />
                </marker>
              </defs>
              <path
                d={`M ${draggedConnection.startPoint.x} ${draggedConnection.startPoint.y} Q ${draggedConnection.startPoint.x + 100} ${draggedConnection.startPoint.y} ${draggedConnection.currentPoint.x} ${draggedConnection.currentPoint.y}`}
                stroke="#10B981"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
                markerEnd="url(#temp-arrowhead)"
              />
            </svg>
          )}

          {/* Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute w-72 p-4 rounded-lg border-2 cursor-move ${
                node.type === 'question'
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-green-50 border-green-300'
              } ${
                selectedNode === node.id ? 'ring-2 ring-blue-500' : ''
              } ${
                hoveredNode === node.id ? 'shadow-lg' : ''
              }`}
              style={{
                left: node.position.x,
                top: node.position.y,
                zIndex: 2
              }}
              onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
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
                {node.title.length > 50 ? `${node.title.substring(0, 50)}...` : node.title}
              </div>

              {/* Question Options with Connection Arrows */}
              {node.type === 'question' && node.options && (
                <div className="space-y-1">
                  {node.options.map((option, index) => (
                    <div key={option.value} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 flex-1">{option.label}</span>
                      <div
                        className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600 transition-colors cursor-grab active:cursor-grabbing"
                        onMouseDown={(e) => handleConnectionDragStart(node.id, option.value, e)}
                        title={`Drag to connect "${option.label}" to another element`}
                      >
                        →
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Article Connection Arrow */}
              {node.type === 'article' && (
                <div className="flex justify-end mt-2">
                  <div
                    className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-green-600 transition-colors cursor-grab active:cursor-grabbing"
                    onMouseDown={(e) => handleConnectionDragStart(node.id, undefined, e)}
                    title="Drag to connect this article to another element"
                  >
                    →
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Empty State */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Build Your Quiz Flow</h3>
                <p className="text-gray-600 mb-4">Click questions and articles from the sidebar to add them to your flow</p>
                <p className="text-sm text-gray-500">Then use the arrows to connect them and create your routing logic</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}