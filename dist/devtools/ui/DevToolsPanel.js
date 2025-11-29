import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { enableDevTools, isDevToolsEnabled, onDevToolsEvent, listSignals, getSignal, getDependencies, getSubscribers, getPerformanceMetrics, clearPerformanceMetrics, } from '../runtime';
const styles = {
    panel: (state) => ({
        position: 'fixed',
        ...getPositionStyles(state.position),
        width: state.isMinimized ? '320px' : `${state.width}px`,
        height: state.isMinimized ? '48px' : `${state.height}px`,
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        fontFamily: 'Monaco, Menlo, "Courier New", monospace',
        fontSize: '12px',
        border: '1px solid #3e3e3e',
        borderRadius: '8px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 999999,
        overflow: 'hidden',
        transition: 'all 0.2s ease',
    }),
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        backgroundColor: '#252526',
        borderBottom: '1px solid #3e3e3e',
        cursor: 'move',
        userSelect: 'none',
    },
    headerTitle: {
        fontSize: '13px',
        fontWeight: 600,
        color: '#cccccc',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    headerActions: {
        display: 'flex',
        gap: '6px',
    },
    button: (variant = 'secondary') => ({
        padding: '4px 8px',
        backgroundColor: variant === 'primary' ? '#0e639c' : variant === 'danger' ? '#c72e2e' : '#3e3e3e',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: 500,
        transition: 'background-color 0.15s',
    }),
    iconButton: {
        padding: '4px 8px',
        backgroundColor: 'transparent',
        color: '#cccccc',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'color 0.15s',
    },
    tabs: {
        display: 'flex',
        gap: '0',
        backgroundColor: '#2d2d30',
        borderBottom: '1px solid #3e3e3e',
    },
    tab: (isActive) => ({
        padding: '8px 16px',
        backgroundColor: isActive ? '#1e1e1e' : 'transparent',
        color: isActive ? '#ffffff' : '#969696',
        border: 'none',
        borderBottom: isActive ? '2px solid #0e639c' : '2px solid transparent',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 500,
        transition: 'all 0.15s',
    }),
    content: {
        flex: 1,
        overflow: 'auto',
        padding: '12px',
        backgroundColor: '#1e1e1e',
    },
    signalList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    signalCard: {
        padding: '12px',
        backgroundColor: '#252526',
        border: '1px solid #3e3e3e',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
    },
    signalCardHover: {
        borderColor: '#0e639c',
        boxShadow: '0 0 0 1px #0e639c',
    },
    signalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
    },
    signalName: {
        fontSize: '13px',
        fontWeight: 600,
        color: '#4fc3f7',
    },
    signalType: (type) => ({
        padding: '2px 6px',
        backgroundColor: type === 'signal' ? '#2d5a2d' : type === 'computed' ? '#5a4d2d' : '#4d2d5a',
        color: type === 'signal' ? '#81c784' : type === 'computed' ? '#ffb74d' : '#ba68c8',
        borderRadius: '3px',
        fontSize: '10px',
        fontWeight: 600,
        textTransform: 'uppercase',
    }),
    signalValue: {
        fontSize: '12px',
        color: '#ce9178',
        marginBottom: '6px',
        wordBreak: 'break-all',
    },
    signalMeta: {
        display: 'flex',
        gap: '12px',
        fontSize: '11px',
        color: '#858585',
    },
    metricsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '16px',
    },
    metricCard: {
        padding: '12px',
        backgroundColor: '#252526',
        border: '1px solid #3e3e3e',
        borderRadius: '6px',
    },
    metricLabel: {
        fontSize: '11px',
        color: '#858585',
        marginBottom: '4px',
    },
    metricValue: (color) => ({
        fontSize: '20px',
        fontWeight: 600,
        color: color || '#4fc3f7',
    }),
    searchInput: {
        width: '100%',
        padding: '8px 12px',
        backgroundColor: '#3c3c3c',
        color: '#cccccc',
        border: '1px solid #3e3e3e',
        borderRadius: '4px',
        fontSize: '12px',
        marginBottom: '12px',
    },
    graphContainer: {
        width: '100%',
        height: '400px',
        backgroundColor: '#252526',
        border: '1px solid #3e3e3e',
        borderRadius: '6px',
        overflow: 'auto',
        position: 'relative',
    },
    graphNode: (type) => ({
        padding: '8px 12px',
        backgroundColor: type === 'signal' ? '#2d5a2d' : type === 'computed' ? '#5a4d2d' : '#4d2d5a',
        color: '#ffffff',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 500,
        border: '2px solid transparent',
        transition: 'all 0.15s',
        cursor: 'pointer',
    }),
    emptyState: {
        textAlign: 'center',
        padding: '48px 24px',
        color: '#858585',
    },
    badge: (color) => ({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '18px',
        height: '18px',
        padding: '0 4px',
        backgroundColor: color,
        color: '#ffffff',
        borderRadius: '9px',
        fontSize: '10px',
        fontWeight: 600,
    }),
};
function getPositionStyles(position) {
    switch (position) {
        case 'bottom-right':
            return { bottom: '16px', right: '16px' };
        case 'bottom-left':
            return { bottom: '16px', left: '16px' };
        case 'top-right':
            return { top: '16px', right: '16px' };
        case 'top-left':
            return { top: '16px', left: '16px' };
    }
}
const SignalsTab = () => {
    const [signals, setSignals] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSignals, setExpandedSignals] = useState(new Set());
    useEffect(() => {
        if (isDevToolsEnabled()) {
            setSignals(listSignals());
        }
    }, []);
    useEffect(() => {
        if (!isDevToolsEnabled())
            return;
        const cleanup = onDevToolsEvent('*', () => {
            setSignals(listSignals());
        });
        return cleanup;
    }, []);
    const filteredSignals = useMemo(() => {
        if (!searchQuery)
            return signals;
        const query = searchQuery.toLowerCase();
        return signals.filter(signal => (signal.name?.toLowerCase().includes(query)) ||
            signal.id.toLowerCase().includes(query) ||
            signal.type.toLowerCase().includes(query));
    }, [signals, searchQuery]);
    const toggleExpanded = useCallback((id) => {
        setExpandedSignals(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            }
            else {
                next.add(id);
            }
            return next;
        });
    }, []);
    if (!isDevToolsEnabled()) {
        return (_jsxs("div", { style: styles.emptyState, children: [_jsx("div", { style: { fontSize: '32px', marginBottom: '12px' }, children: "\uD83D\uDD12" }), _jsx("div", { style: { fontSize: '14px', fontWeight: 600, marginBottom: '8px' }, children: "DevTools Not Enabled" }), _jsx("div", { children: "Enable DevTools to monitor signals" })] }));
    }
    return (_jsxs(_Fragment, { children: [_jsx("input", { type: "text", placeholder: "\uD83D\uDD0D Search signals by name, ID, or type...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), style: styles.searchInput }), filteredSignals.length === 0 ? (_jsxs("div", { style: styles.emptyState, children: [_jsx("div", { style: { fontSize: '32px', marginBottom: '12px' }, children: searchQuery ? '🔍' : '📡' }), _jsx("div", { style: { fontSize: '14px', fontWeight: 600, marginBottom: '8px' }, children: searchQuery ? 'No Signals Found' : 'No Active Signals' }), _jsx("div", { children: searchQuery ? 'Try a different search query' : 'Create signals to see them here' })] })) : (_jsx("div", { style: styles.signalList, children: filteredSignals.map((signal) => {
                    const isExpanded = expandedSignals.has(signal.id);
                    return (_jsx(SignalCard, { signal: signal, isExpanded: isExpanded, onToggle: () => toggleExpanded(signal.id) }, signal.id));
                }) })), _jsxs("div", { style: { marginTop: '16px', fontSize: '11px', color: '#858585', textAlign: 'center' }, children: [filteredSignals.length, " signal", filteredSignals.length !== 1 ? 's' : '', " active", searchQuery && signals.length !== filteredSignals.length && (_jsxs(_Fragment, { children: [" \u00B7 ", signals.length - filteredSignals.length, " hidden"] }))] })] }));
};
const SignalCard = ({ signal, isExpanded, onToggle }) => {
    const [isHovered, setIsHovered] = useState(false);
    const dependencies = getDependencies(signal.id);
    const subscribers = getSubscribers(signal.id);
    const cardStyle = {
        ...styles.signalCard,
        ...(isHovered ? styles.signalCardHover : {}),
    };
    return (_jsxs("div", { style: cardStyle, onMouseEnter: () => setIsHovered(true), onMouseLeave: () => setIsHovered(false), onClick: onToggle, children: [_jsxs("div", { style: styles.signalHeader, children: [_jsx("div", { style: styles.signalName, children: signal.name || signal.id }), _jsx("span", { style: styles.signalType(signal.type), children: signal.type })] }), _jsx("div", { style: styles.signalValue, children: formatValue(signal.value) }), _jsxs("div", { style: styles.signalMeta, children: [_jsxs("span", { children: ["\uD83D\uDD04 ", signal.updateCount, " update", signal.updateCount !== 1 ? 's' : ''] }), _jsxs("span", { children: ["\uD83D\uDC65 ", signal.subscriberCount, " subscriber", signal.subscriberCount !== 1 ? 's' : ''] }), dependencies.length > 0 && (_jsxs("span", { children: ["\uD83D\uDD17 ", dependencies.length, " dep", dependencies.length !== 1 ? 's' : ''] }))] }), isExpanded && (_jsxs("div", { style: { marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #3e3e3e' }, children: [_jsxs("div", { style: { fontSize: '11px', color: '#858585', marginBottom: '8px' }, children: [_jsx("strong", { children: "ID:" }), " ", signal.id] }), dependencies.length > 0 && (_jsxs("div", { style: { fontSize: '11px', color: '#858585', marginBottom: '8px' }, children: [_jsx("strong", { children: "Dependencies:" }), _jsx("div", { style: { marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }, children: dependencies.map(depId => {
                                    const dep = getSignal(depId);
                                    return (_jsx("span", { style: {
                                            padding: '2px 6px',
                                            backgroundColor: '#3e3e3e',
                                            borderRadius: '3px',
                                            fontSize: '10px',
                                        }, children: dep?.name || depId }, depId));
                                }) })] })), subscribers.length > 0 && (_jsxs("div", { style: { fontSize: '11px', color: '#858585', marginBottom: '8px' }, children: [_jsx("strong", { children: "Subscribers:" }), _jsx("div", { style: { marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }, children: subscribers.map(subId => {
                                    const sub = getSignal(subId);
                                    return (_jsx("span", { style: {
                                            padding: '2px 6px',
                                            backgroundColor: '#3e3e3e',
                                            borderRadius: '3px',
                                            fontSize: '10px',
                                        }, children: sub?.name || subId }, subId));
                                }) })] })), _jsxs("div", { style: { fontSize: '11px', color: '#858585' }, children: [_jsx("strong", { children: "Created:" }), " ", new Date(signal.createdAt).toLocaleTimeString()] }), _jsxs("div", { style: { fontSize: '11px', color: '#858585' }, children: [_jsx("strong", { children: "Updated:" }), " ", new Date(signal.updatedAt).toLocaleTimeString()] })] }))] }));
};
const PerformanceTab = () => {
    const [metrics, setMetrics] = useState([]);
    const [autoRefresh, setAutoRefresh] = useState(true);
    useEffect(() => {
        if (isDevToolsEnabled()) {
            setMetrics(getPerformanceMetrics());
        }
    }, []);
    useEffect(() => {
        if (!isDevToolsEnabled() || !autoRefresh)
            return;
        const cleanup = onDevToolsEvent('signal-updated', () => {
            setMetrics(getPerformanceMetrics());
        });
        return cleanup;
    }, [autoRefresh]);
    const handleClearMetrics = useCallback(() => {
        clearPerformanceMetrics();
        setMetrics([]);
    }, []);
    if (!isDevToolsEnabled()) {
        return (_jsxs("div", { style: styles.emptyState, children: [_jsx("div", { style: { fontSize: '32px', marginBottom: '12px' }, children: "\uD83D\uDD12" }), _jsx("div", { style: { fontSize: '14px', fontWeight: 600, marginBottom: '8px' }, children: "DevTools Not Enabled" }), _jsx("div", { children: "Enable DevTools to track performance" })] }));
    }
    const stats = useMemo(() => {
        if (metrics.length === 0) {
            return { total: 0, avg: 0, min: 0, max: 0, slow: 0 };
        }
        const durations = metrics.map(m => m.duration);
        const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
        const min = Math.min(...durations);
        const max = Math.max(...durations);
        const slow = metrics.filter(m => m.duration > 16).length;
        return { total: metrics.length, avg, min, max, slow };
    }, [metrics]);
    const recentMetrics = metrics.slice(-20);
    return (_jsxs(_Fragment, { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cccccc' }, children: [_jsx("input", { type: "checkbox", checked: autoRefresh, onChange: (e) => setAutoRefresh(e.target.checked) }), "Auto-refresh"] }), _jsx("button", { onClick: handleClearMetrics, style: styles.button('danger'), disabled: metrics.length === 0, children: "Clear Metrics" })] }), _jsxs("div", { style: styles.metricsGrid, children: [_jsxs("div", { style: styles.metricCard, children: [_jsx("div", { style: styles.metricLabel, children: "Total Updates" }), _jsx("div", { style: styles.metricValue('#4fc3f7'), children: stats.total })] }), _jsxs("div", { style: styles.metricCard, children: [_jsx("div", { style: styles.metricLabel, children: "Avg Duration" }), _jsxs("div", { style: styles.metricValue('#81c784'), children: [stats.avg.toFixed(3), "ms"] })] }), _jsxs("div", { style: styles.metricCard, children: [_jsx("div", { style: styles.metricLabel, children: "Min Duration" }), _jsxs("div", { style: styles.metricValue('#ffb74d'), children: [stats.min.toFixed(3), "ms"] })] }), _jsxs("div", { style: styles.metricCard, children: [_jsx("div", { style: styles.metricLabel, children: "Max Duration" }), _jsxs("div", { style: styles.metricValue('#ba68c8'), children: [stats.max.toFixed(3), "ms"] })] }), stats.slow > 0 && (_jsxs("div", { style: styles.metricCard, children: [_jsx("div", { style: styles.metricLabel, children: "\u26A0\uFE0F Slow Updates" }), _jsx("div", { style: styles.metricValue('#f44336'), children: stats.slow })] }))] }), recentMetrics.length === 0 ? (_jsxs("div", { style: styles.emptyState, children: [_jsx("div", { style: { fontSize: '32px', marginBottom: '12px' }, children: "\uD83D\uDCCA" }), _jsx("div", { style: { fontSize: '14px', fontWeight: 600, marginBottom: '8px' }, children: "No Performance Data" }), _jsx("div", { children: "Update signals to see performance metrics" })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { style: { fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: '#cccccc' }, children: ["Recent Updates (Last ", recentMetrics.length, ")"] }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '6px' }, children: recentMetrics.reverse().map((metric, index) => (_jsx(PerformanceMetricCard, { metric: metric }, index))) })] }))] }));
};
const PerformanceMetricCard = ({ metric }) => {
    const signal = getSignal(metric.signalId);
    const isSlow = metric.duration > 16;
    return (_jsxs("div", { style: {
            padding: '8px 12px',
            backgroundColor: isSlow ? '#3d2121' : '#252526',
            border: `1px solid ${isSlow ? '#c72e2e' : '#3e3e3e'}`,
            borderRadius: '4px',
            fontSize: '11px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        }, children: [_jsxs("div", { children: [_jsx("span", { style: { color: '#4fc3f7', fontWeight: 600 }, children: signal?.name || metric.signalId }), _jsxs("span", { style: { color: '#858585', marginLeft: '8px' }, children: ["(", metric.type, ")"] }), metric.skipped && (_jsx("span", { style: { color: '#ffb74d', marginLeft: '8px' }, children: "\u26A1 skipped" })), isSlow && (_jsx("span", { style: { color: '#f44336', marginLeft: '8px' }, children: "\u26A0\uFE0F slow" }))] }), _jsxs("div", { style: { color: isSlow ? '#f44336' : '#81c784', fontWeight: 600 }, children: [metric.duration.toFixed(3), "ms"] })] }));
};
const PluginsTab = () => {
    return (_jsxs("div", { style: styles.emptyState, children: [_jsx("div", { style: { fontSize: '32px', marginBottom: '12px' }, children: "\uD83E\uDDE9" }), _jsx("div", { style: { fontSize: '14px', fontWeight: 600, marginBottom: '8px' }, children: "Plugins Coming Soon" }), _jsx("div", { children: "Plugin inspection and management will be available in a future release" })] }));
};
const DependencyGraph = () => {
    const signals = listSignals();
    if (signals.length === 0) {
        return (_jsxs("div", { style: styles.emptyState, children: [_jsx("div", { style: { fontSize: '32px', marginBottom: '12px' }, children: "\uD83D\uDD78\uFE0F" }), _jsx("div", { style: { fontSize: '14px', fontWeight: 600, marginBottom: '8px' }, children: "No Signals to Visualize" }), _jsx("div", { children: "Create signals to see dependency graph" })] }));
    }
    return (_jsx("div", { style: styles.graphContainer, children: _jsxs("div", { style: { padding: '16px' }, children: [_jsx("div", { style: { fontSize: '13px', fontWeight: 600, marginBottom: '16px', color: '#cccccc' }, children: "Dependency Graph" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: signals.map(signal => (_jsx(DependencyNode, { signal: signal }, signal.id))) })] }) }));
};
const DependencyNode = ({ signal }) => {
    const dependencies = getDependencies(signal.id);
    return (_jsxs("div", { style: { marginLeft: dependencies.length > 0 ? '0' : '0' }, children: [_jsxs("div", { style: styles.graphNode(signal.type), children: [_jsx("div", { style: { fontWeight: 600 }, children: signal.name || signal.id }), _jsxs("div", { style: { fontSize: '10px', opacity: 0.7, marginTop: '4px' }, children: [signal.type, " \u00B7 ", signal.updateCount, " updates"] })] }), dependencies.length > 0 && (_jsx("div", { style: { marginLeft: '20px', marginTop: '8px', borderLeft: '2px solid #3e3e3e', paddingLeft: '12px' }, children: dependencies.map(depId => {
                    const dep = getSignal(depId);
                    if (!dep)
                        return null;
                    return (_jsx("div", { style: { marginBottom: '8px' }, children: _jsxs("div", { style: styles.graphNode(dep.type), children: [_jsx("div", { style: { fontWeight: 600 }, children: dep.name || dep.id }), _jsx("div", { style: { fontSize: '10px', opacity: 0.7, marginTop: '4px' }, children: dep.type })] }) }, depId));
                }) }))] }));
};
export const DevToolsPanel = () => {
    const [panelState, setPanelState] = useState({
        isOpen: true,
        isMinimized: false,
        position: 'bottom-right',
        width: 600,
        height: 500,
    });
    const [activeTab, setActiveTab] = useState('signals');
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    useEffect(() => {
        if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
            if (!isDevToolsEnabled()) {
                enableDevTools({
                    enabled: true,
                    trackPerformance: true,
                    logToConsole: false,
                    slowUpdateThreshold: 16,
                    emitPerformanceWarnings: true,
                });
            }
        }
    }, []);
    const handleMinimize = useCallback(() => {
        setPanelState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
    }, []);
    const handleClose = useCallback(() => {
        setPanelState(prev => ({ ...prev, isOpen: false }));
    }, []);
    const handleMouseDown = useCallback((e) => {
        if (e.target.closest('button, input'))
            return;
        setIsDragging(true);
        dragStartPos.current = { x: e.clientX, y: e.clientY };
    }, []);
    const handleMouseMove = useCallback((e) => {
        if (!isDragging)
            return;
    }, [isDragging]);
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);
    if (!panelState.isOpen) {
        return null;
    }
    return (_jsxs("div", { style: styles.panel(panelState), children: [_jsxs("div", { style: styles.header, onMouseDown: handleMouseDown, children: [_jsxs("div", { style: styles.headerTitle, children: [_jsx("span", { children: "\uD83D\uDD25" }), _jsx("span", { children: "SignalForge DevTools" }), isDevToolsEnabled() && (_jsx("span", { style: styles.badge('#4caf50'), children: "ON" }))] }), _jsxs("div", { style: styles.headerActions, children: [_jsx("button", { onClick: handleMinimize, style: styles.iconButton, title: panelState.isMinimized ? 'Maximize' : 'Minimize', children: panelState.isMinimized ? '◻' : '_' }), _jsx("button", { onClick: handleClose, style: styles.iconButton, title: "Close", children: "\u2715" })] })] }), !panelState.isMinimized && (_jsxs(_Fragment, { children: [_jsxs("div", { style: styles.tabs, children: [_jsx("button", { onClick: () => setActiveTab('signals'), style: styles.tab(activeTab === 'signals'), children: "\uD83D\uDCE1 Signals" }), _jsx("button", { onClick: () => setActiveTab('performance'), style: styles.tab(activeTab === 'performance'), children: "\u26A1 Performance" }), _jsx("button", { onClick: () => setActiveTab('plugins'), style: styles.tab(activeTab === 'plugins'), children: "\uD83E\uDDE9 Plugins" })] }), _jsxs("div", { style: styles.content, children: [activeTab === 'signals' && _jsx(SignalsTab, {}), activeTab === 'performance' && _jsx(PerformanceTab, {}), activeTab === 'plugins' && _jsx(PluginsTab, {})] })] }))] }));
};
export const DevToolsProvider = ({ children }) => {
    const [showDevTools, setShowDevTools] = useState(false);
    useEffect(() => {
        if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
            setShowDevTools(true);
        }
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                setShowDevTools(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    return (_jsxs(_Fragment, { children: [children, showDevTools && _jsx(DevToolsPanel, {})] }));
};
function formatValue(value) {
    if (value === null)
        return 'null';
    if (value === undefined)
        return 'undefined';
    if (typeof value === 'string')
        return `"${value}"`;
    if (typeof value === 'number')
        return String(value);
    if (typeof value === 'boolean')
        return String(value);
    if (Array.isArray(value)) {
        if (value.length === 0)
            return '[]';
        if (value.length <= 3)
            return JSON.stringify(value);
        return `[${value.length} items]`;
    }
    if (typeof value === 'object') {
        const keys = Object.keys(value);
        if (keys.length === 0)
            return '{}';
        if (keys.length <= 3) {
            try {
                return JSON.stringify(value);
            }
            catch {
                return '{...}';
            }
        }
        return `{${keys.length} keys}`;
    }
    return String(value);
}
export default DevToolsPanel;
