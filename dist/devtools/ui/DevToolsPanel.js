import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { enableDevTools, isDevToolsEnabled, onDevToolsEvent, listSignals, getSignal, getDependencies, getSubscribers, getActivePlugins, getPerformanceMetrics, clearPerformanceMetrics, } from '../runtime';
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
    tableRow: {
        display: 'grid',
        gridTemplateColumns: 'minmax(120px, 1.2fr) 80px 80px 80px minmax(120px, 1fr)',
        gap: '8px',
        alignItems: 'center',
        padding: '8px 10px',
        borderBottom: '1px solid #333',
    },
    timelineItem: (type) => ({
        padding: '10px 12px',
        backgroundColor: '#252526',
        borderLeft: `3px solid ${type === 'performance-warning' ? '#f44336' : type === 'signal-updated' ? '#4fc3f7' : '#81c784'}`,
        borderRadius: '4px',
        borderTop: '1px solid #3e3e3e',
        borderRight: '1px solid #3e3e3e',
        borderBottom: '1px solid #3e3e3e',
    }),
    pill: (color) => ({
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 6px',
        borderRadius: '10px',
        backgroundColor: color,
        color: '#fff',
        fontSize: '10px',
        fontWeight: 600,
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
    const [plugins, setPlugins] = useState([]);
    useEffect(() => {
        if (!isDevToolsEnabled())
            return;
        const refresh = () => setPlugins(getActivePlugins());
        refresh();
        const intervalId = window.setInterval(refresh, 1000);
        return () => window.clearInterval(intervalId);
    }, []);
    if (!isDevToolsEnabled()) {
        return _jsx("div", { style: styles.emptyState, children: "Enable DevTools to inspect plugins." });
    }
    if (plugins.length === 0) {
        return (_jsxs("div", { style: styles.emptyState, children: [_jsx("div", { style: { fontSize: '14px', fontWeight: 600, marginBottom: '8px' }, children: "No registered plugins" }), _jsx("div", { children: "Register logger, validation, time-travel, or custom plugins to inspect their hooks." })] }));
    }
    return (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 }, children: plugins.map((plugin) => (_jsxs("div", { style: styles.metricCard, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { children: [_jsx("strong", { style: { color: '#4fc3f7' }, children: plugin.name }), plugin.version && _jsxs("span", { style: { color: '#858585', marginLeft: 8 }, children: ["v", plugin.version] })] }), _jsx("span", { style: styles.pill(plugin.enabled ? '#2d5a2d' : '#5a2d2d'), children: plugin.enabled ? 'enabled' : 'disabled' })] }), _jsxs("div", { style: { marginTop: 10, color: '#858585' }, children: ["Hooks: ", plugin.hookCount, " | Tracked plugin signals: ", plugin.signalCount] }), _jsx("div", { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }, children: Object.entries(plugin.stats).map(([hook, enabled]) => (_jsx("span", { style: styles.pill(enabled ? '#0e639c' : '#3e3e3e'), children: hook }, hook))) })] }, plugin.name))) }));
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
const GraphTab = () => {
    const [signals, setSignals] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    useEffect(() => {
        if (!isDevToolsEnabled())
            return;
        setSignals(listSignals());
        return onDevToolsEvent('*', () => setSignals(listSignals()));
    }, []);
    const filteredSignals = useMemo(() => filterGraphSignals(signals, query, typeFilter), [signals, query, typeFilter]);
    const layout = useMemo(() => buildGraphLayout(filteredSignals), [filteredSignals]);
    const selected = selectedId ? signals.find((signal) => signal.id === selectedId) : null;
    if (!isDevToolsEnabled() || signals.length === 0) {
        return (_jsxs("div", { style: styles.emptyState, children: [_jsx("div", { style: { fontSize: '14px', fontWeight: 600, marginBottom: '8px' }, children: "No graph data" }), _jsx("div", { children: "Create signals and computed values to see dependency edges." })] }));
    }
    return (_jsxs("div", { style: { display: 'grid', gap: '12px' }, children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 160px', gap: 8 }, children: [_jsx("input", { type: "text", placeholder: "Filter graph by name or ID...", value: query, onChange: (event) => setQuery(event.target.value), style: { ...styles.searchInput, marginBottom: 0 } }), _jsxs("select", { value: typeFilter, onChange: (event) => setTypeFilter(event.target.value), style: { ...styles.searchInput, marginBottom: 0 }, children: [_jsx("option", { value: "all", children: "All types" }), _jsx("option", { value: "signal", children: "Signals" }), _jsx("option", { value: "computed", children: "Computed" }), _jsx("option", { value: "effect", children: "Effects" })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 260px', gap: '12px', minHeight: 420 }, children: [_jsx("div", { style: { ...styles.graphContainer, height: 420, overflow: 'hidden' }, children: _jsxs("svg", { width: "100%", height: "420", viewBox: `0 0 ${layout.width} ${layout.height}`, role: "img", "aria-label": "Signal dependency graph", children: [_jsx("defs", { children: _jsx("marker", { id: "signalforge-arrow", markerWidth: "8", markerHeight: "8", refX: "6", refY: "3", orient: "auto", children: _jsx("path", { d: "M0,0 L0,6 L7,3 z", fill: "#5f6b73" }) }) }), layout.edges.map((edge) => (_jsx("line", { x1: edge.x1, y1: edge.y1, x2: edge.x2, y2: edge.y2, stroke: "#5f6b73", strokeWidth: "1.5", markerEnd: "url(#signalforge-arrow)" }, `${edge.from}-${edge.to}`))), layout.nodes.map((node) => (_jsxs("g", { transform: `translate(${node.x}, ${node.y})`, onClick: () => setSelectedId(node.id), style: { cursor: 'pointer' }, children: [_jsx("rect", { width: "150", height: "58", rx: "6", fill: nodeColor(node.type), stroke: selectedId === node.id ? '#ffffff' : '#3e3e3e', strokeWidth: selectedId === node.id ? 2 : 1 }), _jsx("text", { x: "10", y: "22", fill: "#ffffff", fontSize: "11", fontWeight: "600", children: shortLabel(node.label) }), _jsxs("text", { x: "10", y: "40", fill: "#d4d4d4", fontSize: "10", children: [node.type, " | ", node.updateCount, " updates"] })] }, node.id)))] }) }), _jsxs("aside", { style: { ...styles.metricCard, minHeight: 420 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, children: [_jsx("div", { style: { fontSize: '13px', fontWeight: 600 }, children: "Inspect" }), _jsxs("span", { style: { color: '#858585', fontSize: 11 }, children: [filteredSignals.length, "/", signals.length] })] }), selected ? (_jsxs(_Fragment, { children: [_jsx("div", { style: styles.signalName, children: selected.name || selected.id }), _jsx("div", { style: { marginTop: 8 }, children: _jsx("span", { style: styles.signalType(selected.type), children: selected.type }) }), _jsxs("div", { style: { marginTop: 12, color: '#858585' }, children: ["Dependencies: ", selected.dependencies.length] }), _jsxs("div", { style: { marginTop: 4, color: '#858585' }, children: ["Subscribers: ", selected.subscribers.length] }), _jsxs("div", { style: { marginTop: 4, color: '#858585' }, children: ["Updates: ", selected.updateCount] }), _jsx("pre", { style: { marginTop: 12, whiteSpace: 'pre-wrap', color: '#ce9178', fontSize: 11 }, children: formatValue(selected.value) })] })) : (_jsx("div", { style: { color: '#858585' }, children: "Select a node to inspect dependencies, subscribers, and current value." }))] })] })] }));
};
const TimelineTab = ({ events }) => {
    const [typeFilter, setTypeFilter] = useState('all');
    const [grouped, setGrouped] = useState(true);
    const visibleEvents = useMemo(() => {
        const filtered = typeFilter === 'all'
            ? events
            : events.filter((event) => event.type === typeFilter);
        return filtered.slice(-80).reverse();
    }, [events, typeFilter]);
    const groups = useMemo(() => groupTimelineEvents(visibleEvents), [visibleEvents]);
    const eventTypes = useMemo(() => Array.from(new Set(events.map((event) => event.type))).sort(), [events]);
    if (visibleEvents.length === 0) {
        return (_jsxs("div", { style: styles.emptyState, children: [_jsx("div", { style: { fontSize: '14px', fontWeight: 600, marginBottom: '8px' }, children: "No timeline events" }), _jsx("div", { children: "Create or update signals to stream lifecycle events here." })] }));
    }
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }, children: [_jsxs("select", { value: typeFilter, onChange: (event) => setTypeFilter(event.target.value), style: { ...styles.searchInput, marginBottom: 0 }, children: [_jsx("option", { value: "all", children: "All events" }), eventTypes.map((type) => _jsx("option", { value: type, children: type }, type))] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 6, color: '#cccccc' }, children: [_jsx("input", { type: "checkbox", checked: grouped, onChange: (event) => setGrouped(event.target.checked) }), "Group"] })] }), grouped ? groups.map((group) => (_jsxs("section", { style: { display: 'grid', gap: 6 }, children: [_jsxs("div", { style: { color: '#858585', fontSize: 11, fontWeight: 600 }, children: [group.label, " | ", group.events.length, " events"] }), group.events.map((event) => _jsx(TimelineEventRow, { event: event }, event.sequence))] }, group.key))) : visibleEvents.map((event) => _jsx(TimelineEventRow, { event: event }, event.sequence))] }));
};
const TimelineEventRow = ({ event }) => (_jsxs("div", { style: styles.timelineItem(event.type), children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', gap: 12 }, children: [_jsx("strong", { style: { color: '#cccccc' }, children: event.type }), _jsx("span", { style: { color: '#858585' }, children: new Date(event.timestamp).toLocaleTimeString() })] }), _jsx("div", { style: { marginTop: 6, color: '#858585' }, children: formatTimelinePayload(event) })] }));
const RenderImpactTab = () => {
    const [signals, setSignals] = useState([]);
    const [metrics, setMetrics] = useState([]);
    useEffect(() => {
        if (!isDevToolsEnabled())
            return;
        const refresh = () => {
            setSignals(listSignals());
            setMetrics(getPerformanceMetrics());
        };
        refresh();
        return onDevToolsEvent('*', refresh);
    }, []);
    const rows = useMemo(() => signals
        .map((signal) => {
        const signalMetrics = metrics.filter((metric) => metric.signalId === signal.id && !metric.skipped);
        const maxDuration = signalMetrics.reduce((max, metric) => Math.max(max, metric.duration), 0);
        const fanout = signal.subscribers.length;
        const impactScore = signal.updateCount * Math.max(1, fanout);
        return { signal, fanout, maxDuration, impactScore };
    })
        .sort((a, b) => b.impactScore - a.impactScore || b.maxDuration - a.maxDuration), [signals, metrics]);
    if (rows.length === 0) {
        return (_jsxs("div", { style: styles.emptyState, children: [_jsx("div", { style: { fontSize: '14px', fontWeight: 600, marginBottom: '8px' }, children: "No render impact data" }), _jsx("div", { children: "Update tracked signals to identify high fan-out or slow nodes." })] }));
    }
    return (_jsxs("div", { children: [_jsxs("div", { style: { ...styles.tableRow, color: '#858585', fontWeight: 600 }, children: [_jsx("span", { children: "Signal" }), _jsx("span", { children: "Type" }), _jsx("span", { children: "Fan-out" }), _jsx("span", { children: "Updates" }), _jsx("span", { children: "Impact" })] }), rows.map(({ signal, fanout, maxDuration, impactScore }) => (_jsxs("div", { style: styles.tableRow, children: [_jsx("span", { style: { color: '#4fc3f7', overflow: 'hidden', textOverflow: 'ellipsis' }, children: signal.name || signal.id }), _jsx("span", { style: styles.signalType(signal.type), children: signal.type }), _jsx("span", { children: fanout }), _jsx("span", { children: signal.updateCount }), _jsxs("span", { children: [_jsx("span", { style: styles.pill(impactScore > 50 || maxDuration > 16 ? '#c72e2e' : impactScore > 10 ? '#9c6b0e' : '#2d5a2d'), children: impactScore }), _jsxs("span", { style: { marginLeft: 8, color: '#858585' }, children: ["max ", maxDuration.toFixed(3), "ms"] })] })] }, signal.id)))] }));
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
    const [timelineEvents, setTimelineEvents] = useState([]);
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
    useEffect(() => {
        if (!isDevToolsEnabled())
            return;
        return onDevToolsEvent('*', (event) => {
            setTimelineEvents((previous) => [...previous.slice(-199), event]);
        });
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
    return (_jsxs("div", { style: styles.panel(panelState), children: [_jsxs("div", { style: styles.header, onMouseDown: handleMouseDown, children: [_jsxs("div", { style: styles.headerTitle, children: [_jsx("span", { children: "\uD83D\uDD25" }), _jsx("span", { children: "SignalForge DevTools" }), isDevToolsEnabled() && (_jsx("span", { style: styles.badge('#4caf50'), children: "ON" }))] }), _jsxs("div", { style: styles.headerActions, children: [_jsx("button", { onClick: handleMinimize, style: styles.iconButton, title: panelState.isMinimized ? 'Maximize' : 'Minimize', children: panelState.isMinimized ? '◻' : '_' }), _jsx("button", { onClick: handleClose, style: styles.iconButton, title: "Close", children: "\u2715" })] })] }), !panelState.isMinimized && (_jsxs(_Fragment, { children: [_jsxs("div", { style: styles.tabs, children: [_jsx("button", { onClick: () => setActiveTab('signals'), style: styles.tab(activeTab === 'signals'), children: "\uD83D\uDCE1 Signals" }), _jsx("button", { onClick: () => setActiveTab('performance'), style: styles.tab(activeTab === 'performance'), children: "\u26A1 Performance" }), _jsx("button", { onClick: () => setActiveTab('graph'), style: styles.tab(activeTab === 'graph'), children: "Graph" }), _jsx("button", { onClick: () => setActiveTab('timeline'), style: styles.tab(activeTab === 'timeline'), children: "Timeline" }), _jsx("button", { onClick: () => setActiveTab('impact'), style: styles.tab(activeTab === 'impact'), children: "Impact" }), _jsx("button", { onClick: () => setActiveTab('plugins'), style: styles.tab(activeTab === 'plugins'), children: "\uD83E\uDDE9 Plugins" })] }), _jsxs("div", { style: styles.content, children: [activeTab === 'signals' && _jsx(SignalsTab, {}), activeTab === 'performance' && _jsx(PerformanceTab, {}), activeTab === 'graph' && _jsx(GraphTab, {}), activeTab === 'timeline' && _jsx(TimelineTab, { events: timelineEvents }), activeTab === 'impact' && _jsx(RenderImpactTab, {}), activeTab === 'plugins' && _jsx(PluginsTab, {})] })] }))] }));
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
export function buildGraphLayout(signals) {
    const depthById = new Map();
    const signalById = new Map(signals.map((signal) => [signal.id, signal]));
    const getDepth = (signal, seen = new Set()) => {
        if (depthById.has(signal.id))
            return depthById.get(signal.id);
        if (seen.has(signal.id) || signal.dependencies.length === 0) {
            depthById.set(signal.id, 0);
            return 0;
        }
        seen.add(signal.id);
        const depth = 1 + Math.max(0, ...signal.dependencies
            .map((id) => signalById.get(id))
            .filter((dependency) => Boolean(dependency))
            .map((dependency) => getDepth(dependency, seen)));
        depthById.set(signal.id, depth);
        return depth;
    };
    for (const signal of signals)
        getDepth(signal);
    const columns = new Map();
    for (const signal of signals) {
        const depth = depthById.get(signal.id) || 0;
        const column = columns.get(depth) || [];
        column.push(signal);
        columns.set(depth, column);
    }
    const nodes = [];
    for (const [depth, column] of columns) {
        column.forEach((signal, index) => {
            nodes.push({
                id: signal.id,
                label: signal.name || signal.id,
                type: signal.type,
                updateCount: signal.updateCount,
                x: 24 + depth * 210,
                y: 24 + index * 92,
            });
        });
    }
    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const edges = signals.flatMap((signal) => {
        const target = nodeById.get(signal.id);
        if (!target)
            return [];
        return signal.dependencies
            .map((dependencyId) => {
            const source = nodeById.get(dependencyId);
            if (!source)
                return null;
            return {
                from: dependencyId,
                to: signal.id,
                x1: source.x + 150,
                y1: source.y + 29,
                x2: target.x,
                y2: target.y + 29,
            };
        })
            .filter((edge) => Boolean(edge));
    });
    const maxX = Math.max(600, ...nodes.map((node) => node.x + 190));
    const maxY = Math.max(420, ...nodes.map((node) => node.y + 90));
    return { width: maxX, height: maxY, nodes, edges };
}
export function filterGraphSignals(signals, query, typeFilter) {
    const normalized = query.trim().toLowerCase();
    const directMatches = new Set();
    for (const signal of signals) {
        const typeMatches = typeFilter === 'all' || signal.type === typeFilter;
        const queryMatches = !normalized
            || signal.id.toLowerCase().includes(normalized)
            || signal.name?.toLowerCase().includes(normalized);
        if (typeMatches && queryMatches) {
            directMatches.add(signal.id);
        }
    }
    if (!normalized && typeFilter === 'all')
        return signals;
    const idsToKeep = new Set(directMatches);
    const signalById = new Map(signals.map((signal) => [signal.id, signal]));
    for (const id of directMatches) {
        const signal = signalById.get(id);
        if (!signal)
            continue;
        for (const dependency of signal.dependencies)
            idsToKeep.add(dependency);
        for (const subscriber of signal.subscribers)
            idsToKeep.add(subscriber);
    }
    return signals.filter((signal) => idsToKeep.has(signal.id));
}
function nodeColor(type) {
    if (type === 'computed')
        return '#5a4d2d';
    if (type === 'effect')
        return '#4d2d5a';
    return '#2d5a2d';
}
function shortLabel(label) {
    return label.length > 18 ? `${label.slice(0, 15)}...` : label;
}
function formatTimelinePayload(event) {
    const payload = event.payload || {};
    if (payload.id)
        return payload.id;
    if (payload.signalId)
        return `${payload.signalId} ${payload.duration ? `${payload.duration.toFixed(3)}ms` : ''}`;
    if (payload.subscriberId && payload.dependencyId) {
        return `${payload.subscriberId} -> ${payload.dependencyId}`;
    }
    return JSON.stringify(payload).slice(0, 160);
}
export function groupTimelineEvents(events) {
    const groups = new Map();
    for (const event of events) {
        const time = new Date(event.timestamp);
        const key = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
        const group = groups.get(key) || [];
        group.push(event);
        groups.set(key, group);
    }
    return Array.from(groups.entries()).map(([key, groupedEvents]) => ({
        key,
        label: new Date(groupedEvents[0]?.timestamp || Date.now()).toLocaleTimeString(),
        events: groupedEvents,
    }));
}
export default DevToolsPanel;
