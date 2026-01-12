'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { GraphNode, GraphEdge } from '../lib/graph';
import { ResourceMetadata } from '../lib/markdown';
import { PanelLink } from './PanelLink';

interface NetworkGraphProps {
  allResources: ResourceMetadata[];
  graphData: {
    nodes: Array<{ id: string; node: GraphNode }>;
    edges: GraphEdge[];
  };
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
  node: GraphNode;
  vx: number;
  vy: number;
}

// Icon components for different resource types
const getNodeIcon = (node: GraphNode): string => {
  // Check tags for resource type
  if (node.tags.includes('framework')) return 'F';
  if (node.tags.includes('canvas')) return 'C';
  if (node.tags.includes('toolkit')) return 'T';
  if (node.tags.includes('method')) return 'M';
  if (node.tags.includes('template')) return 'P';
  if (node.tags.includes('academic-articles')) return 'A';
  if (node.tags.includes('book')) return 'B';
  
  // Category-based icons
  if (node.category === 'tools') return 'T';
  if (node.category === 'collections') return 'K';
  if (node.category === 'articles') return 'A';
  
  return '•';
};

const getNodeColor = (node: GraphNode, isSelected: boolean): string => {
  if (isSelected) return '#a855f7'; // purple for selected
  if (node.category === 'tools') return '#3b82f6'; // blue
  if (node.category === 'collections') return '#8b5cf6'; // purple
  if (node.category === 'articles') return '#10b981'; // green
  return '#6b7280'; // gray
};

export function NetworkGraph({ allResources, graphData }: NetworkGraphProps) {
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['tools']));
  const [depth, setDepth] = useState(3); // Connection depth
  const [minWeight, setMinWeight] = useState(2);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 700 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Organize resources by category for sidebar
  const resourcesByCategory = useMemo(() => {
    const grouped: Record<string, ResourceMetadata[]> = {
      tools: [],
      collections: [],
      articles: [],
    };
    allResources.forEach(r => {
      if (grouped[r.category]) {
        grouped[r.category].push(r);
      }
    });
    return grouped;
  }, [allResources]);

  // Filter and process graph data
  const { nodes, edges } = useMemo(() => {
    const nodesMap = new Map<string, GraphNode>();
    graphData.nodes.forEach(({ id, node }) => {
      nodesMap.set(id, node);
    });

    // Filter by search
    const filteredNodes = new Map<string, GraphNode>();
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      nodesMap.forEach((node, id) => {
        if (
          node.title.toLowerCase().includes(query) ||
          node.tags.some(tag => tag.toLowerCase().includes(query)) ||
          node.category.toLowerCase().includes(query)
        ) {
          filteredNodes.set(id, node);
        }
      });
    } else {
      nodesMap.forEach((node, id) => {
        filteredNodes.set(id, node);
      });
    }

    // Filter edges
    const filteredEdges = graphData.edges.filter(edge => {
      return filteredNodes.has(edge.source) && 
             filteredNodes.has(edge.target) && 
             edge.weight >= minWeight;
    });

    return { nodes: filteredNodes, edges: filteredEdges };
  }, [graphData, searchQuery, minWeight]);

  // Calculate node positions with force-directed layout
  const nodePositions = useMemo(() => {
    const positions: NodePosition[] = [];
    const nodeArray = Array.from(nodes.entries());
    
    if (nodeArray.length === 0) return positions;

    // Initialize positions in a circle
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.min(dimensions.width, dimensions.height) * 0.3;
    
    nodeArray.forEach(([id, node], index) => {
      const angle = (index / nodeArray.length) * 2 * Math.PI;
      positions.push({
        id,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        node,
        vx: 0,
        vy: 0,
      });
    });

    // Force simulation
    for (let iteration = 0; iteration < 100; iteration++) {
      positions.forEach((pos1, i) => {
        let fx = 0;
        let fy = 0;
        
        // Repulsion from other nodes
        positions.forEach((pos2, j) => {
          if (i === j) return;
          const dx = pos1.x - pos2.x;
          const dy = pos1.y - pos2.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 8000 / (distance * distance);
          fx += (dx / distance) * force;
          fy += (dy / distance) * force;
        });

        // Attraction along edges
        edges.forEach(edge => {
          if (edge.source === pos1.id || edge.target === pos1.id) {
            const otherId = edge.source === pos1.id ? edge.target : edge.source;
            const otherPos = positions.find(p => p.id === otherId);
            if (otherPos) {
              const dx = otherPos.x - pos1.x;
              const dy = otherPos.y - pos1.y;
              const distance = Math.sqrt(dx * dx + dy * dy) || 1;
              const idealDistance = 100 + edge.weight * 10;
              const force = (distance - idealDistance) * 0.1;
              fx += (dx / distance) * force;
              fy += (dy / distance) * force;
            }
          }
        });

        // Apply forces
        pos1.vx = (pos1.vx + fx * 0.1) * 0.9;
        pos1.vy = (pos1.vy + fy * 0.1) * 0.9;
        pos1.x += pos1.vx;
        pos1.y += pos1.vy;

        // Boundary constraints
        pos1.x = Math.max(30, Math.min(dimensions.width - 30, pos1.x));
        pos1.y = Math.max(30, Math.min(dimensions.height - 30, pos1.y));
      });
    }

    return positions;
  }, [nodes, edges, dimensions]);

  // Update dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width || 1000, height: rect.height || 700 });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const toggleNodeSelection = (nodeId: string) => {
    setSelectedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleNodeClick = (nodeId: string) => {
    toggleNodeSelection(nodeId);
  };

  const getNodeSize = (nodeId: string): number => {
    const connectionCount = edges.filter(e => e.source === nodeId || e.target === nodeId).length;
    return 20 + Math.min(connectionCount * 2, 15);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  return (
    <div className="flex h-[800px] bg-[var(--bg-primary)] rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-[var(--bg-secondary)] flex flex-col">
        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Tree */}
        <div className="flex-1 overflow-y-auto p-2">
          {Object.entries(resourcesByCategory).map(([category, resources]) => (
            <div key={category} className="mb-2">
              <button
                onClick={() => toggleSection(category)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="capitalize">{category}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${expandedSections.has(category) ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {expandedSections.has(category) && (
                <div className="ml-4 mt-1 space-y-1">
                  {resources.slice(0, 20).map((resource) => {
                    const nodeId = `${resource.category}/${resource.slug}`;
                    const isSelected = selectedNodes.has(nodeId);
                    return (
                      <button
                        key={resource.slug}
                        onClick={() => handleNodeClick(nodeId)}
                        className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-2 ${
                          isSelected
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                          {getNodeIcon({ slug: resource.slug, title: resource.title, category: resource.category, tags: resource.tags })}
                        </span>
                        <span className="truncate flex-1">{resource.title}</span>
                      </button>
                    );
                  })}
                  {resources.length > 20 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1">
                      +{resources.length - 20} more
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Controls */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
            <span>Min weight:</span>
            <span>{minWeight}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={minWeight}
            onChange={(e) => setMinWeight(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Right Pane - Graph */}
      <div className="flex-1 relative bg-gray-50 dark:bg-gray-900" ref={containerRef}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="absolute inset-0"
        >
          {/* Edges */}
          <g opacity="0.3">
            {edges.map((edge, index) => {
              const sourcePos = nodePositions.find(p => p.id === edge.source);
              const targetPos = nodePositions.find(p => p.id === edge.target);
              
              if (!sourcePos || !targetPos) return null;

              const isHighlighted = selectedNodes.has(edge.source) || selectedNodes.has(edge.target);
              const opacity = isHighlighted ? 0.6 : Math.min(edge.weight / 10, 0.3);
              const strokeWidth = isHighlighted ? 2 : Math.min(edge.weight / 3, 1.5);

              return (
                <line
                  key={index}
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke={isHighlighted ? '#a855f7' : '#64748b'}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g>
            {nodePositions.map((pos) => {
              const size = getNodeSize(pos.id);
              const isSelected = selectedNodes.has(pos.id);
              const color = getNodeColor(pos.node, isSelected);
              const icon = getNodeIcon(pos.node);

              return (
                <g key={pos.id}>
                  {/* Node circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={size}
                    fill={color}
                    stroke={isSelected ? '#fbbf24' : '#fff'}
                    strokeWidth={isSelected ? 3 : 2}
                    className="cursor-pointer transition-all"
                    onClick={() => handleNodeClick(pos.id)}
                  />
                  
                  {/* Icon inside node */}
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-white font-bold pointer-events-none select-none"
                    fontSize={size * 0.6}
                    fill="white"
                  >
                    {icon}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Bottom-right controls */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 shadow-lg">
          <button
            onClick={() => setDepth(Math.max(1, depth - 1))}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
            Level: {depth}
          </span>
          <button
            onClick={() => setDepth(Math.min(10, depth + 1))}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => {
              setSelectedNodes(new Set());
              setSearchQuery('');
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors ml-2"
            title="Reset"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Selected node info */}
        {selectedNodes.size > 0 && (
          <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-lg max-w-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Selected ({selectedNodes.size})
              </h3>
              <button
                onClick={() => setSelectedNodes(new Set())}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Array.from(selectedNodes).slice(0, 5).map((nodeId) => {
                const pos = nodePositions.find(p => p.id === nodeId);
                if (!pos) return null;
                return (
                  <PanelLink
                    key={nodeId}
                    href={`/${pos.node.category}/${pos.node.slug}`}
                    className="block p-2 text-xs rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {pos.node.title}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-[10px] capitalize">
                      {pos.node.category}
                    </div>
                  </PanelLink>
                );
              })}
              {selectedNodes.size > 5 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  +{selectedNodes.size - 5} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
