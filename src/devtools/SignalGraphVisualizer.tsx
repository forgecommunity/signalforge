/**
 * SignalGraph Visualizer for SignalForge
 * 
 * Interactive signal dependency graph visualization with:
 * - Force-directed layout using custom physics simulation
 * - Real-time updates when signals are created/destroyed
 * - Live highlighting when nodes update
 * - Hover interactions showing subscribers and metadata
 * - SVG-based rendering (no external dependencies)
 * 
 * @example
 * ```tsx
 * import { SignalGraphVisualizer } from 'signalforge/devtools';
 * import { enableDevTools } from 'signalforge';
 * 
 * enableDevTools();
 * 
 * function App() {
 *   return <SignalGraphVisualizer width={800} height={600} />;
 * }
 * ```
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  listSignals,
  getSignal,
  getDependencies,
  getSubscribers,
  onDevToolsEvent,
  isDevToolsEnabled,
  type SignalMetadata,
  type DevToolsEvent,
} from './runtime';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Graph node representing a signal
 */
interface GraphNode {
  /** Signal ID */
  id: string;
  /** Signal type */
  type: 'signal' | 'computed' | 'effect';
  /** Current value */
  value: any;
  /** Display label */
  label: string;
  /** Position X */
  x: number;
  /** Position Y */
  y: number;
  /** Velocity X (for physics) */
  vx: number;
  /** Velocity Y (for physics) */
  vy: number;
  /** Force X */
  fx: number;
  /** Force Y */
  fy: number;
  /** Is node currently updating */
  isUpdating: boolean;
  /** Last update timestamp */
  lastUpdate: number;
  /** Number of subscribers */
  subscriberCount: number;
  /** IDs of dependencies */
  dependencies: string[];
  /** IDs of subscribers */
  subscribers: string[];
}

/**
 * Graph edge representing a dependency
 */
interface GraphEdge {
  /** Source signal ID (dependent) */
  source: string;
  /** Target signal ID (dependency) */
  target: string;
}

/**
 * Graph data structure
 */
interface GraphData {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
}

/**
 * Component props
 */
export interface SignalGraphVisualizerProps {
  /** Canvas width */
  width?: number;
  /** Canvas height */
  height?: number;
  /** Show node labels */
  showLabels?: boolean;
  /** Enable animations */
  animate?: boolean;
  /** Update interval (ms) */
  updateInterval?: number;
  /** Physics simulation enabled */
  enablePhysics?: boolean;
  /** Node radius */
  nodeRadius?: number;
  /** Highlight duration (ms) */
  highlightDuration?: number;
}

// ============================================================================
// Physics Simulation (Force-Directed Layout)
// ============================================================================

/**
 * Simple force-directed graph layout simulation
 * Based on classic force-directed algorithms (Fruchterman-Reingold)
 */
class ForceSimulation {
  private nodes: Map<string, GraphNode>;
  private edges: GraphEdge[];
  private width: number;
  private height: number;
  
  // Physics parameters
  private readonly repulsionForce = 3000;
  private readonly attractionForce = 0.01;
  private readonly centerForce = 0.01;
  private readonly damping = 0.9;
  private readonly minDistance = 50;
  
  constructor(width: number, height: number) {
    this.nodes = new Map();
    this.edges = [];
    this.width = width;
    this.height = height;
  }
  
  /**
   * Update graph data
   */
  setGraph(nodes: Map<string, GraphNode>, edges: GraphEdge[]): void {
    this.nodes = nodes;
    this.edges = edges;
  }
  
  /**
   * Run one simulation step
   */
  tick(): void {
    // Reset forces
    for (const node of this.nodes.values()) {
      node.fx = 0;
      node.fy = 0;
    }
    
    // 1. Repulsion between all nodes (keep them apart)
    this.applyRepulsion();
    
    // 2. Attraction along edges (pull connected nodes together)
    this.applyAttraction();
    
    // 3. Center force (pull all nodes toward center)
    this.applyCenterForce();
    
    // 4. Update positions using forces
    this.updatePositions();
  }
  
  /**
   * Apply repulsion force between all node pairs
   */
  private applyRepulsion(): void {
    const nodes = Array.from(this.nodes.values());
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq) || 1;
        
        // Prevent division by zero
        if (dist < this.minDistance) {
          const force = this.repulsionForce / (this.minDistance * this.minDistance);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          
          n1.fx -= fx;
          n1.fy -= fy;
          n2.fx += fx;
          n2.fy += fy;
        } else {
          const force = this.repulsionForce / distSq;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          
          n1.fx -= fx;
          n1.fy -= fy;
          n2.fx += fx;
          n2.fy += fy;
        }
      }
    }
  }
  
  /**
   * Apply attraction force along edges
   */
  private applyAttraction(): void {
    for (const edge of this.edges) {
      const source = this.nodes.get(edge.source);
      const target = this.nodes.get(edge.target);
      
      if (!source || !target) continue;
      
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      
      const force = dist * this.attractionForce;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      
      source.fx += fx;
      source.fy += fy;
      target.fx -= fx;
      target.fy -= fy;
    }
  }
  
  /**
   * Apply center force to keep graph centered
   */
  private applyCenterForce(): void {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    for (const node of this.nodes.values()) {
      const dx = centerX - node.x;
      const dy = centerY - node.y;
      
      node.fx += dx * this.centerForce;
      node.fy += dy * this.centerForce;
    }
  }
  
  /**
   * Update node positions based on forces
   */
  private updatePositions(): void {
    for (const node of this.nodes.values()) {
      // Update velocity
      node.vx = (node.vx + node.fx) * this.damping;
      node.vy = (node.vy + node.fy) * this.damping;
      
      // Update position
      node.x += node.vx;
      node.y += node.vy;
      
      // Keep within bounds with soft boundaries
      const margin = 50;
      if (node.x < margin) {
        node.x = margin;
        node.vx *= -0.5;
      } else if (node.x > this.width - margin) {
        node.x = this.width - margin;
        node.vx *= -0.5;
      }
      
      if (node.y < margin) {
        node.y = margin;
        node.vy *= -0.5;
      } else if (node.y > this.height - margin) {
        node.y = this.height - margin;
        node.vy *= -0.5;
      }
    }
  }
  
  /**
   * Initialize random positions for new nodes
   */
  initializePositions(): void {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radius = Math.min(this.width, this.height) / 4;
    
    for (const node of this.nodes.values()) {
      if (node.x === 0 && node.y === 0) {
        // Random position in a circle around center
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * radius;
        node.x = centerX + Math.cos(angle) * r;
        node.y = centerY + Math.sin(angle) * r;
        node.vx = 0;
        node.vy = 0;
      }
    }
  }
}

// ============================================================================
// Graph Visualizer Component
// ============================================================================

/**
 * SignalGraph Visualizer Component
 * 
 * Displays an interactive force-directed graph of signal dependencies
 */
export const SignalGraphVisualizer: React.FC<SignalGraphVisualizerProps> = ({
  width = 800,
  height = 600,
  showLabels = true,
  animate = true,
  updateInterval = 50,
  enablePhysics = true,
  nodeRadius = 20,
  highlightDuration = 1000,
}) => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: new Map(), edges: [] });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const simulationRef = useRef<ForceSimulation>(new ForceSimulation(width, height));
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  
  /**
   * Build graph from current signals
   */
  const buildGraph = useCallback((): GraphData => {
    if (!isDevToolsEnabled()) {
      return { nodes: new Map(), edges: [] };
    }
    
    const signals = listSignals();
    const nodes = new Map<string, GraphNode>();
    const edges: GraphEdge[] = [];
    
    // Create nodes
    for (const signal of signals) {
      const existingNode = graphData.nodes.get(signal.id);
      
      nodes.set(signal.id, {
        id: signal.id,
        type: signal.type,
        value: signal.value,
        label: signal.name || signal.id.split('_')[0],
        x: existingNode?.x || 0,
        y: existingNode?.y || 0,
        vx: existingNode?.vx || 0,
        vy: existingNode?.vy || 0,
        fx: 0,
        fy: 0,
        isUpdating: existingNode?.isUpdating || false,
        lastUpdate: signal.updatedAt,
        subscriberCount: signal.subscriberCount,
        dependencies: signal.dependencies,
        subscribers: signal.subscribers,
      });
    }
    
    // Create edges from dependencies
    for (const node of nodes.values()) {
      for (const depId of node.dependencies) {
        if (nodes.has(depId)) {
          edges.push({
            source: node.id,
            target: depId,
          });
        }
      }
    }
    
    return { nodes, edges };
  }, [graphData.nodes]);
  
  /**
   * Handle signal created event
   */
  const handleSignalCreated = useCallback((event: DevToolsEvent) => {
    setGraphData(prev => {
      const newGraph = buildGraph();
      simulationRef.current.setGraph(newGraph.nodes, newGraph.edges);
      simulationRef.current.initializePositions();
      return newGraph;
    });
  }, [buildGraph]);
  
  /**
   * Handle signal updated event
   */
  const handleSignalUpdated = useCallback((event: DevToolsEvent) => {
    const { id } = event.payload;
    
    setGraphData(prev => {
      const node = prev.nodes.get(id);
      if (node) {
        node.isUpdating = true;
        node.lastUpdate = event.timestamp;
        
        // Clear highlight after duration
        setTimeout(() => {
          setGraphData(current => {
            const n = current.nodes.get(id);
            if (n) {
              n.isUpdating = false;
            }
            return { ...current };
          });
        }, highlightDuration);
      }
      
      return { ...prev };
    });
  }, [highlightDuration]);
  
  /**
   * Handle signal destroyed event
   */
  const handleSignalDestroyed = useCallback((event: DevToolsEvent) => {
    setGraphData(prev => {
      const newGraph = buildGraph();
      simulationRef.current.setGraph(newGraph.nodes, newGraph.edges);
      return newGraph;
    });
  }, [buildGraph]);
  
  /**
   * Handle dependency added event
   */
  const handleDependencyChanged = useCallback((event: DevToolsEvent) => {
    setGraphData(prev => {
      const newGraph = buildGraph();
      simulationRef.current.setGraph(newGraph.nodes, newGraph.edges);
      return newGraph;
    });
  }, [buildGraph]);
  
  /**
   * Initialize graph and subscribe to events
   */
  useEffect(() => {
    if (!isDevToolsEnabled()) {
      console.warn('[SignalGraphVisualizer] DevTools is not enabled');
      return;
    }
    
    // Initial graph build
    const initial = buildGraph();
    setGraphData(initial);
    simulationRef.current.setGraph(initial.nodes, initial.edges);
    simulationRef.current.initializePositions();
    
    // Subscribe to DevTools events
    const unsubscribers = [
      onDevToolsEvent('signal-created', handleSignalCreated),
      onDevToolsEvent('signal-updated', handleSignalUpdated),
      onDevToolsEvent('signal-destroyed', handleSignalDestroyed),
      onDevToolsEvent('dependency-added', handleDependencyChanged),
      onDevToolsEvent('dependency-removed', handleDependencyChanged),
    ];
    
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [buildGraph, handleSignalCreated, handleSignalUpdated, handleSignalDestroyed, handleDependencyChanged]);
  
  /**
   * Animation loop for physics simulation
   */
  useEffect(() => {
    if (!animate || !enablePhysics) return;
    
    const runSimulation = () => {
      const now = Date.now();
      if (now - lastUpdateRef.current >= updateInterval) {
        simulationRef.current.tick();
        setGraphData(prev => ({ ...prev }));
        lastUpdateRef.current = now;
      }
      
      animationRef.current = requestAnimationFrame(runSimulation);
    };
    
    animationRef.current = requestAnimationFrame(runSimulation);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, enablePhysics, updateInterval]);
  
  /**
   * Get node color based on type and state
   */
  const getNodeColor = (node: GraphNode): string => {
    if (node.isUpdating) {
      return '#ff4444'; // Red for updating
    }
    
    switch (node.type) {
      case 'signal':
        return '#4CAF50'; // Green
      case 'computed':
        return '#2196F3'; // Blue
      case 'effect':
        return '#FF9800'; // Orange
      default:
        return '#9E9E9E'; // Gray
    }
  };
  
  /**
   * Get node stroke color
   */
  const getNodeStroke = (node: GraphNode): string => {
    if (hoveredNode === node.id) {
      return '#FFD700'; // Gold for hovered
    }
    return '#ffffff';
  };
  
  /**
   * Format timestamp for display
   */
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };
  
  /**
   * Format value for display
   */
  const formatValue = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value).slice(0, 50);
      } catch {
        return '[Object]';
      }
    }
    return String(value).slice(0, 50);
  };
  
  if (!isDevToolsEnabled()) {
    return (
      <div style={{ padding: 20, color: '#ff0000' }}>
        DevTools is not enabled. Call <code>enableDevTools()</code> to use the visualizer.
      </div>
    );
  }
  
  return (
    <div style={{ position: 'relative', width, height, background: '#1e1e1e', borderRadius: 8 }}>
      <svg width={width} height={height}>
        {/* Define arrow marker for edges */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#666" />
          </marker>
        </defs>
        
        {/* Render edges */}
        <g className="edges">
          {graphData.edges.map((edge, idx) => {
            const source = graphData.nodes.get(edge.source);
            const target = graphData.nodes.get(edge.target);
            
            if (!source || !target) return null;
            
            // Calculate edge endpoints (accounting for node radius)
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const offsetX = (dx / dist) * nodeRadius;
            const offsetY = (dy / dist) * nodeRadius;
            
            return (
              <line
                key={`${edge.source}-${edge.target}-${idx}`}
                x1={source.x + offsetX}
                y1={source.y + offsetY}
                x2={target.x - offsetX}
                y2={target.y - offsetY}
                stroke="#666"
                strokeWidth={2}
                markerEnd="url(#arrowhead)"
                opacity={hoveredNode === source.id || hoveredNode === target.id ? 1 : 0.3}
              />
            );
          })}
        </g>
        
        {/* Render nodes */}
        <g className="nodes">
          {Array.from(graphData.nodes.values()).map(node => (
            <g
              key={node.id}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={nodeRadius}
                fill={getNodeColor(node)}
                stroke={getNodeStroke(node)}
                strokeWidth={hoveredNode === node.id ? 3 : 1}
                opacity={hoveredNode && hoveredNode !== node.id ? 0.5 : 1}
              />
              
              {showLabels && (
                <text
                  x={node.x}
                  y={node.y + nodeRadius + 15}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontFamily="monospace"
                >
                  {node.label}
                </text>
              )}
              
              {/* Update pulse animation */}
              {node.isUpdating && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeRadius}
                  fill="none"
                  stroke="#ff4444"
                  strokeWidth={2}
                  opacity={0.6}
                >
                  <animate
                    attributeName="r"
                    from={nodeRadius}
                    to={nodeRadius * 2}
                    dur="0.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.6"
                    to="0"
                    dur="0.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          ))}
        </g>
      </svg>
      
      {/* Hover tooltip */}
      {hoveredNode && graphData.nodes.has(hoveredNode) && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(0, 0, 0, 0.9)',
            color: '#fff',
            padding: 15,
            borderRadius: 8,
            fontSize: 12,
            fontFamily: 'monospace',
            maxWidth: 300,
            border: '2px solid #FFD700',
          }}
        >
          {(() => {
            const node = graphData.nodes.get(hoveredNode)!;
            return (
              <>
                <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>
                  {node.label}
                </div>
                <div style={{ marginBottom: 4 }}>
                  <strong>Type:</strong> {node.type}
                </div>
                <div style={{ marginBottom: 4 }}>
                  <strong>ID:</strong> {node.id}
                </div>
                <div style={{ marginBottom: 4 }}>
                  <strong>Value:</strong> {formatValue(node.value)}
                </div>
                <div style={{ marginBottom: 4 }}>
                  <strong>Last Update:</strong> {formatTime(node.lastUpdate)}
                </div>
                <div style={{ marginBottom: 4 }}>
                  <strong>Subscribers:</strong> {node.subscriberCount}
                </div>
                {node.dependencies.length > 0 && (
                  <div style={{ marginBottom: 4 }}>
                    <strong>Dependencies:</strong>
                    <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                      {node.dependencies.map(depId => {
                        const depNode = graphData.nodes.get(depId);
                        return (
                          <li key={depId}>
                            {depNode?.label || depId}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                {node.subscribers.length > 0 && (
                  <div>
                    <strong>Subscribers:</strong>
                    <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                      {node.subscribers.slice(0, 5).map(subId => {
                        const subNode = graphData.nodes.get(subId);
                        return (
                          <li key={subId}>
                            {subNode?.label || subId}
                          </li>
                        );
                      })}
                      {node.subscribers.length > 5 && (
                        <li>... and {node.subscribers.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
      
      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          padding: 10,
          borderRadius: 8,
          fontSize: 11,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ marginBottom: 5, fontWeight: 'bold' }}>Legend</div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
          <div style={{ width: 12, height: 12, background: '#4CAF50', borderRadius: '50%', marginRight: 6 }} />
          Signal
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
          <div style={{ width: 12, height: 12, background: '#2196F3', borderRadius: '50%', marginRight: 6 }} />
          Computed
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
          <div style={{ width: 12, height: 12, background: '#FF9800', borderRadius: '50%', marginRight: 6 }} />
          Effect
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 12, height: 12, background: '#ff4444', borderRadius: '50%', marginRight: 6 }} />
          Updating
        </div>
      </div>
      
      {/* Stats */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          padding: 10,
          borderRadius: 8,
          fontSize: 11,
          fontFamily: 'monospace',
        }}
      >
        <div>Signals: {graphData.nodes.size}</div>
        <div>Edges: {graphData.edges.length}</div>
      </div>
    </div>
  );
};

export default SignalGraphVisualizer;
