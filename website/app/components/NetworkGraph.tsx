'use client';

import { useState, useMemo, useCallback } from 'react';
import { GraphNode, GraphEdge } from '../lib/graph';
import type { ResourceMetadata } from '../lib/markdown';
import { PanelLink } from './PanelLink';
import { usePanels } from './PanelContext';
import { ResourcePanelContent } from './ResourcePanelContent';
import { Button } from '@/components/ui/button';

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
  fx?: number;
  fy?: number;
}

// Get node icon based on category and tags
const getNodeIcon = (node: GraphNode): string => {
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
  const { addPanel } = usePanels();
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['tools']));
  const [minWeight, setMinWeight] = useState(2);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 700 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  // Zoom and pan state
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState<string | null>(null);
  const animationFrameRef = useRef<number>();

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

  // Calculate node positions with improved force-directed layout
  const [nodePositions, setNodePositions] = useState<NodePosition[]>([]);

  useEffect(() => {
    const nodeArray = Array.from(nodes.entries());
    if (nodeArray.length === 0) {
      setNodePositions([]);
      return;
    }

    // Cancel any existing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Initialize positions with better spacing - use a grid-like pattern
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const nodeCount = nodeArray.length;
    
    // Calculate grid dimensions for better initial distribution
    const cols = Math.ceil(Math.sqrt(nodeCount * (dimensions.width / dimensions.height)));
    const rows = Math.ceil(nodeCount / cols);
    const cellWidth = dimensions.width / (cols + 1);
    const cellHeight = dimensions.height / (rows + 1);
    const minSpacing = 120; // Minimum distance between nodes
    
    let positions: NodePosition[] = nodeArray.map(([id, node], index) => {
      // Use grid layout for initial positions
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = cellWidth * (col + 1) + (Math.random() - 0.5) * cellWidth * 0.3;
      const y = cellHeight * (row + 1) + (Math.random() - 0.5) * cellHeight * 0.3;
      
      return {
        id,
        x: Math.max(80, Math.min(dimensions.width - 80, x)),
        y: Math.max(80, Math.min(dimensions.height - 80, y)),
        node,
        vx: 0,
        vy: 0,
      };
    });

    // Set initial positions immediately so all nodes are visible
    setNodePositions([...positions]);

    // Improved force simulation with stronger repulsion
    let iteration = 0;
    const maxIterations = 300; // More iterations for better convergence
    const alpha = 1;
    const alphaDecay = 0.01; // Slower decay

    const simulate = () => {
      if (iteration >= maxIterations) {
        // Final update to ensure all positions are set
        setNodePositions([...positions]);
        return;
      }

      const currentAlpha = alpha * Math.max(0.1, 1 - iteration * alphaDecay);
      
      positions.forEach((pos1, i) => {
        if (pos1.fx !== undefined || pos1.fy !== undefined) return; // Fixed position
        
        let fx = 0;
        let fy = 0;
        
        // Stronger repulsion from other nodes to prevent overlap
        positions.forEach((pos2, j) => {
          if (i === j) return;
          const dx = pos1.x - pos2.x;
          const dy = pos1.y - pos2.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 0.1;
          
          // Minimum distance enforcement - very strong when too close
          if (distance < minSpacing) {
            const pushForce = (minSpacing - distance) * 5 * currentAlpha;
            fx += (dx / distance) * pushForce;
            fy += (dy / distance) * pushForce;
          }
          
          // Standard repulsion (weaker but still significant)
          const repulsionForce = (25000 * currentAlpha) / (distance * distance);
          fx += (dx / distance) * repulsionForce;
          fy += (dy / distance) * repulsionForce;
        });

        // Attraction along edges (weaker to allow more spreading)
        edges.forEach(edge => {
          if (edge.source === pos1.id || edge.target === pos1.id) {
            const otherId = edge.source === pos1.id ? edge.target : edge.source;
            const otherPos = positions.find(p => p.id === otherId);
            if (otherPos) {
              const dx = otherPos.x - pos1.x;
              const dy = otherPos.y - pos1.y;
              const distance = Math.sqrt(dx * dx + dy * dy) || 1;
              // Increased ideal distance for better spacing
              const idealDistance = 150 + edge.weight * 25;
              const force = ((distance - idealDistance) * currentAlpha * 0.3) / Math.max(edge.weight, 1);
              fx += (dx / distance) * force;
              fy += (dy / distance) * force;
            }
          }
        });

        // Very weak center gravity (just to prevent nodes from drifting too far)
        const centerForce = 0.001 * currentAlpha;
        fx -= (pos1.x - centerX) * centerForce;
        fy -= (pos1.y - centerY) * centerForce;

        // Apply forces with damping
        pos1.vx = (pos1.vx + fx * 0.2) * 0.75;
        pos1.vy = (pos1.vy + fy * 0.2) * 0.75;
        pos1.x += pos1.vx;
        pos1.y += pos1.vy;

        // Boundary constraints with padding
        const padding = 80;
        pos1.x = Math.max(padding, Math.min(dimensions.width - padding, pos1.x));
        pos1.y = Math.max(padding, Math.min(dimensions.height - padding, pos1.y));
      });

      iteration++;
      
      // Update positions every frame for smooth animation
      if (iteration % 1 === 0 || iteration >= maxIterations) {
        setNodePositions([...positions]);
      }
      
      if (iteration < maxIterations) {
        animationFrameRef.current = requestAnimationFrame(simulate);
      } else {
        // Final update
        setNodePositions([...positions]);
      }
    };

    // Start simulation after a brief delay to ensure dimensions are set
    const timeoutId = setTimeout(() => {
      animationFrameRef.current = requestAnimationFrame(simulate);
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
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

  // Zoom handlers
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newK = Math.max(0.1, Math.min(3, transform.k * (1 + delta)));
    
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const scale = newK / transform.k;
      setTransform({
        k: newK,
        x: mouseX - (mouseX - transform.x) * scale,
        y: mouseY - (mouseY - transform.y) * scale,
      });
    }
  }, [transform]);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    if ((e.target as HTMLElement).closest('circle, text')) return; // Don't pan if clicking on node
    
    setIsPanning(true);
    setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  }, [transform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setTransform({
        ...transform,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  }, [isPanning, panStart, transform]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Node drag handlers
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragNode(nodeId);
  }, []);

  const handleNodeMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && dragNode && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - transform.x) / transform.k;
      const y = (e.clientY - rect.top - transform.y) / transform.k;
      
      setNodePositions(prev => prev.map(pos => {
        if (pos.id === dragNode) {
          return { ...pos, x, y, fx: x, fy: y, vx: 0, vy: 0 };
        }
        return pos;
      }));
    }
  }, [isDragging, dragNode, transform]);

  const handleNodeMouseUp = useCallback(() => {
    if (dragNode) {
      setNodePositions(prev => prev.map(pos => {
        if (pos.id === dragNode) {
          return { ...pos, fx: undefined, fy: undefined };
        }
        return pos;
      }));
    }
    setIsDragging(false);
    setDragNode(null);
  }, [dragNode]);

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
    return 18 + Math.min(connectionCount * 1.5, 12);
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

  const handleZoomIn = () => {
    setTransform(prev => ({ ...prev, k: Math.min(3, prev.k * 1.2) }));
  };

  const handleZoomOut = () => {
    setTransform(prev => ({ ...prev, k: Math.max(0.1, prev.k / 1.2) }));
  };

  const handleReset = () => {
    setTransform({ x: 0, y: 0, k: 1 });
    setSelectedNodes(new Set());
    setSearchQuery('');
  };

  const handleFitView = () => {
    if (nodePositions.length === 0) return;
    
    const xs = nodePositions.map(p => p.x);
    const ys = nodePositions.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    const width = maxX - minX;
    const height = maxY - minY;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    const padding = 100;
    const scale = Math.min(
      (dimensions.width - padding * 2) / width,
      (dimensions.height - padding * 2) / height,
      1
    );
    
    setTransform({
      k: scale,
      x: dimensions.width / 2 - centerX * scale,
      y: dimensions.height / 2 - centerY * scale,
    });
  };

  const handleOpenAll = () => {
    Array.from(selectedNodes).forEach((nodeId) => {
      const node = nodes.get(nodeId);
      if (node) {
        const href = `/${node.category}/${node.slug}`;
        addPanel({
          id: `${href}-${Date.now()}-${Math.random()}`,
          title: node.title,
          path: href,
          content: <ResourcePanelContent path={href} />,
        });
      }
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
              <Button variant="ghost"
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
              </Button>
              
              {expandedSections.has(category) && (
                <div className="ml-4 mt-1 space-y-1">
                  {resources.slice(0, 20).map((resource) => {
                    const nodeId = `${resource.category}/${resource.slug}`;
                    const isSelected = selectedNodes.has(nodeId);
                    return (
                      <Button variant="ghost"
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
                      </Button>
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
      <div 
        className="flex-1 relative bg-gray-50 dark:bg-gray-900 overflow-hidden" 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="absolute inset-0 cursor-move"
          onWheel={handleWheel}
        >
          <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
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

            {/* Nodes - ensure ALL nodes are rendered */}
            <g>
              {Array.from(nodes.entries()).map(([nodeId, node]) => {
                // Find position for this node, or create a default one
                let pos = nodePositions.find(p => p.id === nodeId);
                
                // If node doesn't have a position yet, create a default one
                if (!pos) {
                  const centerX = dimensions.width / 2;
                  const centerY = dimensions.height / 2;
                  pos = {
                    id: nodeId,
                    x: centerX + (Math.random() - 0.5) * 200,
                    y: centerY + (Math.random() - 0.5) * 200,
                    node,
                    vx: 0,
                    vy: 0,
                  };
                }
                
                const size = getNodeSize(pos.id);
                const isSelected = selectedNodes.has(pos.id);
                const color = getNodeColor(pos.node, isSelected);
                const icon = getNodeIcon(pos.node);
                const isHovered = hoveredNode === pos.id;

                return (
                  <g 
                    key={pos.id}
                    onMouseDown={(e) => handleNodeMouseDown(e, pos.id)}
                    onMouseMove={handleNodeMouseMove}
                    onMouseUp={handleNodeMouseUp}
                    onMouseEnter={() => setHoveredNode(pos.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {/* Node circle */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={size}
                      fill={color}
                      stroke={isSelected ? '#fbbf24' : isHovered ? '#fbbf24' : '#fff'}
                      strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 2}
                      className="cursor-pointer transition-all"
                      style={{ 
                        filter: isHovered ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))' : 'none'
                      }}
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
                    
                    {/* Hover tooltip */}
                    {isHovered && (
                      <g transform={`translate(${pos.x}, ${pos.y - size - 10})`}>
                        <rect
                          x="-100"
                          y="-30"
                          width="200"
                          height="25"
                          rx="4"
                          fill="rgba(17, 24, 39, 0.95)"
                          className="dark:fill-gray-100"
                          stroke="rgba(251, 191, 36, 0.5)"
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="-12"
                          textAnchor="middle"
                          className="text-white dark:text-gray-900 font-semibold pointer-events-none select-none text-[10px]"
                          fill="currentColor"
                        >
                          {node.title.length > 25 ? node.title.substring(0, 22) + '...' : node.title}
                        </text>
                        <text
                          x="0"
                          y="0"
                          textAnchor="middle"
                          className="text-gray-300 dark:text-gray-600 pointer-events-none select-none text-[8px] capitalize"
                          fill="currentColor"
                        >
                          {node.category}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </g>
        </svg>

        {/* Top-right zoom controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-2">
          <Button variant="ghost"
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Zoom in"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
          <Button variant="ghost"
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Zoom out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </Button>
          <Button variant="ghost"
            onClick={handleFitView}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Fit to view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </Button>
        </div>

        {/* Bottom-right controls */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 shadow-lg">
          <Button variant="ghost"
            onClick={handleReset}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Reset view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Button>
          <div className="text-xs text-gray-600 dark:text-gray-400 px-2">
            Zoom: {Math.round(transform.k * 100)}%
          </div>
        </div>

        {/* Selected node info */}
        {selectedNodes.size > 0 && (
          <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-lg max-w-xs z-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Selected ({selectedNodes.size})
              </h3>
              <Button variant="ghost"
                onClick={() => setSelectedNodes(new Set())}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Clear selection"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <Button variant="ghost"
              onClick={handleOpenAll}
              className="w-full mb-3 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-full transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open all in panels
            </Button>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Array.from(selectedNodes).map((nodeId) => {
                const node = nodes.get(nodeId);
                if (!node) return null;
                return (
                  <PanelLink
                    key={nodeId}
                    href={`/${node.category}/${node.slug}`}
                    className="block p-2 text-xs rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {node.title}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-[10px] capitalize">
                      {node.category}
                    </div>
                  </PanelLink>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
