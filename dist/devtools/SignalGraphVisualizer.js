import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState, useCallback } from 'react';
import { listSignals, onDevToolsEvent, isDevToolsEnabled, } from './runtime';
class ForceSimulation {
    constructor(width, height) {
        this.repulsionForce = 3000;
        this.attractionForce = 0.01;
        this.centerForce = 0.01;
        this.damping = 0.9;
        this.minDistance = 50;
        this.nodes = new Map();
        this.edges = [];
        this.width = width;
        this.height = height;
    }
    setGraph(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
    }
    tick() {
        for (const node of this.nodes.values()) {
            node.fx = 0;
            node.fy = 0;
        }
        this.applyRepulsion();
        this.applyAttraction();
        this.applyCenterForce();
        this.updatePositions();
    }
    applyRepulsion() {
        const nodes = Array.from(this.nodes.values());
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const n1 = nodes[i];
                const n2 = nodes[j];
                const dx = n2.x - n1.x;
                const dy = n2.y - n1.y;
                const distSq = dx * dx + dy * dy;
                const dist = Math.sqrt(distSq) || 1;
                if (dist < this.minDistance) {
                    const force = this.repulsionForce / (this.minDistance * this.minDistance);
                    const fx = (dx / dist) * force;
                    const fy = (dy / dist) * force;
                    n1.fx -= fx;
                    n1.fy -= fy;
                    n2.fx += fx;
                    n2.fy += fy;
                }
                else {
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
    applyAttraction() {
        for (const edge of this.edges) {
            const source = this.nodes.get(edge.source);
            const target = this.nodes.get(edge.target);
            if (!source || !target)
                continue;
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
    applyCenterForce() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        for (const node of this.nodes.values()) {
            const dx = centerX - node.x;
            const dy = centerY - node.y;
            node.fx += dx * this.centerForce;
            node.fy += dy * this.centerForce;
        }
    }
    updatePositions() {
        for (const node of this.nodes.values()) {
            node.vx = (node.vx + node.fx) * this.damping;
            node.vy = (node.vy + node.fy) * this.damping;
            node.x += node.vx;
            node.y += node.vy;
            const margin = 50;
            if (node.x < margin) {
                node.x = margin;
                node.vx *= -0.5;
            }
            else if (node.x > this.width - margin) {
                node.x = this.width - margin;
                node.vx *= -0.5;
            }
            if (node.y < margin) {
                node.y = margin;
                node.vy *= -0.5;
            }
            else if (node.y > this.height - margin) {
                node.y = this.height - margin;
                node.vy *= -0.5;
            }
        }
    }
    initializePositions() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.min(this.width, this.height) / 4;
        for (const node of this.nodes.values()) {
            if (node.x === 0 && node.y === 0) {
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
export const SignalGraphVisualizer = ({ width = 800, height = 600, showLabels = true, animate = true, updateInterval = 50, enablePhysics = true, nodeRadius = 20, highlightDuration = 1000, }) => {
    const [graphData, setGraphData] = useState({ nodes: new Map(), edges: [] });
    const [hoveredNode, setHoveredNode] = useState(null);
    const simulationRef = useRef(new ForceSimulation(width, height));
    const animationRef = useRef(null);
    const lastUpdateRef = useRef(Date.now());
    const buildGraph = useCallback(() => {
        if (!isDevToolsEnabled()) {
            return { nodes: new Map(), edges: [] };
        }
        const signals = listSignals();
        const nodes = new Map();
        const edges = [];
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
    const handleSignalCreated = useCallback((event) => {
        setGraphData(prev => {
            const newGraph = buildGraph();
            simulationRef.current.setGraph(newGraph.nodes, newGraph.edges);
            simulationRef.current.initializePositions();
            return newGraph;
        });
    }, [buildGraph]);
    const handleSignalUpdated = useCallback((event) => {
        const { id } = event.payload;
        setGraphData(prev => {
            const node = prev.nodes.get(id);
            if (node) {
                node.isUpdating = true;
                node.lastUpdate = event.timestamp;
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
    const handleSignalDestroyed = useCallback((event) => {
        setGraphData(prev => {
            const newGraph = buildGraph();
            simulationRef.current.setGraph(newGraph.nodes, newGraph.edges);
            return newGraph;
        });
    }, [buildGraph]);
    const handleDependencyChanged = useCallback((event) => {
        setGraphData(prev => {
            const newGraph = buildGraph();
            simulationRef.current.setGraph(newGraph.nodes, newGraph.edges);
            return newGraph;
        });
    }, [buildGraph]);
    useEffect(() => {
        if (!isDevToolsEnabled()) {
            console.warn('[SignalGraphVisualizer] DevTools is not enabled');
            return;
        }
        const initial = buildGraph();
        setGraphData(initial);
        simulationRef.current.setGraph(initial.nodes, initial.edges);
        simulationRef.current.initializePositions();
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
    useEffect(() => {
        if (!animate || !enablePhysics)
            return;
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
    const getNodeColor = (node) => {
        if (node.isUpdating) {
            return '#ff4444';
        }
        switch (node.type) {
            case 'signal':
                return '#4CAF50';
            case 'computed':
                return '#2196F3';
            case 'effect':
                return '#FF9800';
            default:
                return '#9E9E9E';
        }
    };
    const getNodeStroke = (node) => {
        if (hoveredNode === node.id) {
            return '#FFD700';
        }
        return '#ffffff';
    };
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
    };
    const formatValue = (value) => {
        if (value === null)
            return 'null';
        if (value === undefined)
            return 'undefined';
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value).slice(0, 50);
            }
            catch {
                return '[Object]';
            }
        }
        return String(value).slice(0, 50);
    };
    if (!isDevToolsEnabled()) {
        return (_jsxs("div", { style: { padding: 20, color: '#ff0000' }, children: ["DevTools is not enabled. Call ", _jsx("code", { children: "enableDevTools()" }), " to use the visualizer."] }));
    }
    return (_jsxs("div", { style: { position: 'relative', width, height, background: '#1e1e1e', borderRadius: 8 }, children: [_jsxs("svg", { width: width, height: height, children: [_jsx("defs", { children: _jsx("marker", { id: "arrowhead", markerWidth: "10", markerHeight: "10", refX: "9", refY: "3", orient: "auto", markerUnits: "strokeWidth", children: _jsx("path", { d: "M0,0 L0,6 L9,3 z", fill: "#666" }) }) }), _jsx("g", { className: "edges", children: graphData.edges.map((edge, idx) => {
                            const source = graphData.nodes.get(edge.source);
                            const target = graphData.nodes.get(edge.target);
                            if (!source || !target)
                                return null;
                            const dx = target.x - source.x;
                            const dy = target.y - source.y;
                            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                            const offsetX = (dx / dist) * nodeRadius;
                            const offsetY = (dy / dist) * nodeRadius;
                            return (_jsx("line", { x1: source.x + offsetX, y1: source.y + offsetY, x2: target.x - offsetX, y2: target.y - offsetY, stroke: "#666", strokeWidth: 2, markerEnd: "url(#arrowhead)", opacity: hoveredNode === source.id || hoveredNode === target.id ? 1 : 0.3 }, `${edge.source}-${edge.target}-${idx}`));
                        }) }), _jsx("g", { className: "nodes", children: Array.from(graphData.nodes.values()).map(node => (_jsxs("g", { onMouseEnter: () => setHoveredNode(node.id), onMouseLeave: () => setHoveredNode(null), style: { cursor: 'pointer' }, children: [_jsx("circle", { cx: node.x, cy: node.y, r: nodeRadius, fill: getNodeColor(node), stroke: getNodeStroke(node), strokeWidth: hoveredNode === node.id ? 3 : 1, opacity: hoveredNode && hoveredNode !== node.id ? 0.5 : 1 }), showLabels && (_jsx("text", { x: node.x, y: node.y + nodeRadius + 15, textAnchor: "middle", fill: "#ffffff", fontSize: "12", fontFamily: "monospace", children: node.label })), node.isUpdating && (_jsxs("circle", { cx: node.x, cy: node.y, r: nodeRadius, fill: "none", stroke: "#ff4444", strokeWidth: 2, opacity: 0.6, children: [_jsx("animate", { attributeName: "r", from: nodeRadius, to: nodeRadius * 2, dur: "0.5s", repeatCount: "indefinite" }), _jsx("animate", { attributeName: "opacity", from: "0.6", to: "0", dur: "0.5s", repeatCount: "indefinite" })] }))] }, node.id))) })] }), hoveredNode && graphData.nodes.has(hoveredNode) && (_jsx("div", { style: {
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
                }, children: (() => {
                    const node = graphData.nodes.get(hoveredNode);
                    return (_jsxs(_Fragment, { children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: 8, fontSize: 14 }, children: node.label }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("strong", { children: "Type:" }), " ", node.type] }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("strong", { children: "ID:" }), " ", node.id] }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("strong", { children: "Value:" }), " ", formatValue(node.value)] }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("strong", { children: "Last Update:" }), " ", formatTime(node.lastUpdate)] }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("strong", { children: "Subscribers:" }), " ", node.subscriberCount] }), node.dependencies.length > 0 && (_jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("strong", { children: "Dependencies:" }), _jsx("ul", { style: { margin: '4px 0', paddingLeft: 20 }, children: node.dependencies.map(depId => {
                                            const depNode = graphData.nodes.get(depId);
                                            return (_jsx("li", { children: depNode?.label || depId }, depId));
                                        }) })] })), node.subscribers.length > 0 && (_jsxs("div", { children: [_jsx("strong", { children: "Subscribers:" }), _jsxs("ul", { style: { margin: '4px 0', paddingLeft: 20 }, children: [node.subscribers.slice(0, 5).map(subId => {
                                                const subNode = graphData.nodes.get(subId);
                                                return (_jsx("li", { children: subNode?.label || subId }, subId));
                                            }), node.subscribers.length > 5 && (_jsxs("li", { children: ["... and ", node.subscribers.length - 5, " more"] }))] })] }))] }));
                })() })), _jsxs("div", { style: {
                    position: 'absolute',
                    bottom: 10,
                    left: 10,
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: '#fff',
                    padding: 10,
                    borderRadius: 8,
                    fontSize: 11,
                    fontFamily: 'sans-serif',
                }, children: [_jsx("div", { style: { marginBottom: 5, fontWeight: 'bold' }, children: "Legend" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', marginBottom: 3 }, children: [_jsx("div", { style: { width: 12, height: 12, background: '#4CAF50', borderRadius: '50%', marginRight: 6 } }), "Signal"] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', marginBottom: 3 }, children: [_jsx("div", { style: { width: 12, height: 12, background: '#2196F3', borderRadius: '50%', marginRight: 6 } }), "Computed"] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', marginBottom: 3 }, children: [_jsx("div", { style: { width: 12, height: 12, background: '#FF9800', borderRadius: '50%', marginRight: 6 } }), "Effect"] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center' }, children: [_jsx("div", { style: { width: 12, height: 12, background: '#ff4444', borderRadius: '50%', marginRight: 6 } }), "Updating"] })] }), _jsxs("div", { style: {
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: '#fff',
                    padding: 10,
                    borderRadius: 8,
                    fontSize: 11,
                    fontFamily: 'monospace',
                }, children: [_jsxs("div", { children: ["Signals: ", graphData.nodes.size] }), _jsxs("div", { children: ["Edges: ", graphData.edges.length] })] })] }));
};
export default SignalGraphVisualizer;
