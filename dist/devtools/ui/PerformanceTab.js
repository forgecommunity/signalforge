import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { getProfilerData, enableProfiler, disableProfiler, resetProfiler, isProfilerEnabled, } from '../performanceProfiler';
export const PerformanceTab = ({ refreshInterval = 1000, maxBatchRecords = 20, showDetails = true, className = '', style = {}, }) => {
    const [profilerData, setProfilerData] = useState(null);
    const [selectedSignal, setSelectedSignal] = useState(null);
    const [sortKey, setSortKey] = useState('mean');
    const [sortOrder, setSortOrder] = useState('desc');
    const [isEnabled, setIsEnabled] = useState(isProfilerEnabled());
    const fetchData = () => {
        const data = getProfilerData();
        setProfilerData(data);
    };
    useEffect(() => {
        if (refreshInterval > 0) {
            const timer = setInterval(fetchData, refreshInterval);
            return () => clearInterval(timer);
        }
    }, [refreshInterval]);
    useEffect(() => {
        fetchData();
    }, []);
    const handleToggleProfiler = () => {
        if (isEnabled) {
            disableProfiler();
        }
        else {
            enableProfiler();
        }
        setIsEnabled(!isEnabled);
        fetchData();
    };
    const handleReset = () => {
        resetProfiler();
        fetchData();
    };
    const handleExport = () => {
        if (!profilerData)
            return;
        const json = JSON.stringify(profilerData, (key, value) => {
            if (value instanceof Map) {
                return Object.fromEntries(value);
            }
            return value;
        }, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `signalforge-performance-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };
    const sortedSignalStats = useMemo(() => {
        if (!profilerData)
            return [];
        const stats = Array.from(profilerData.signalStats.values());
        return stats.sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];
            const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [profilerData, sortKey, sortOrder]);
    const handleSort = (key) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        }
        else {
            setSortKey(key);
            setSortOrder('desc');
        }
    };
    if (!profilerData) {
        return (_jsx("div", { className: `performance-tab ${className}`, style: { padding: '20px', ...style }, children: _jsx("p", { children: "Loading profiler data..." }) }));
    }
    return (_jsxs("div", { className: `performance-tab ${className}`, style: { padding: '20px', fontFamily: 'system-ui, sans-serif', ...style }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }, children: [_jsx("h2", { style: { margin: 0 }, children: "Performance Profiler" }), _jsxs("div", { style: { display: 'flex', gap: '10px' }, children: [_jsx("button", { onClick: handleToggleProfiler, style: buttonStyle, children: isEnabled ? '⏸️ Pause' : '▶️ Start' }), _jsx("button", { onClick: handleReset, style: buttonStyle, children: "\uD83D\uDD04 Reset" }), _jsx("button", { onClick: handleExport, style: buttonStyle, children: "\uD83D\uDCE5 Export" }), _jsx("button", { onClick: fetchData, style: buttonStyle, children: "\u27F3 Refresh" })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }, children: [_jsx(SummaryCard, { title: "Total Signals", value: profilerData.totalSignals, icon: "\uD83D\uDCCA" }), _jsx(SummaryCard, { title: "Total Samples", value: profilerData.totalSamples, icon: "\uD83D\uDCC8" }), _jsx(SummaryCard, { title: "Total Batches", value: profilerData.batchStats.totalBatches, icon: "\uD83D\uDD00" }), _jsx(SummaryCard, { title: "Avg Batch Duration", value: `${profilerData.batchStats.avgDuration.toFixed(2)}ms`, icon: "\u23F1\uFE0F" }), _jsx(SummaryCard, { title: "Session Duration", value: `${(profilerData.duration / 1000).toFixed(1)}s`, icon: "\u23F3" }), _jsx(SummaryCard, { title: "Status", value: isEnabled ? 'Running' : 'Paused', icon: isEnabled ? '✅' : '⏸️' })] }), _jsxs("section", { style: { marginBottom: '30px' }, children: [_jsx("h3", { children: "Signal Latency Statistics" }), sortedSignalStats.length === 0 ? (_jsx("p", { style: { color: '#666' }, children: "No signals profiled yet. Start using signals to see data." })) : (_jsxs("table", { style: tableStyle, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsxs("th", { style: thStyle, onClick: () => handleSort('signalId'), children: ["Signal ID ", sortKey === 'signalId' && (sortOrder === 'asc' ? '↑' : '↓')] }), _jsx("th", { style: thStyle, children: "Type" }), _jsxs("th", { style: thStyle, onClick: () => handleSort('sampleCount'), children: ["Samples ", sortKey === 'sampleCount' && (sortOrder === 'asc' ? '↑' : '↓')] }), _jsxs("th", { style: thStyle, onClick: () => handleSort('mean'), children: ["Mean ", sortKey === 'mean' && (sortOrder === 'asc' ? '↑' : '↓')] }), _jsx("th", { style: thStyle, children: "Median" }), _jsxs("th", { style: thStyle, onClick: () => handleSort('p95'), children: ["P95 ", sortKey === 'p95' && (sortOrder === 'asc' ? '↑' : '↓')] }), _jsxs("th", { style: thStyle, onClick: () => handleSort('p99'), children: ["P99 ", sortKey === 'p99' && (sortOrder === 'asc' ? '↑' : '↓')] }), _jsxs("th", { style: thStyle, onClick: () => handleSort('max'), children: ["Max ", sortKey === 'max' && (sortOrder === 'asc' ? '↑' : '↓')] }), _jsx("th", { style: thStyle, children: "Skipped" })] }) }), _jsx("tbody", { children: sortedSignalStats.map((stats) => (_jsxs("tr", { style: {
                                        backgroundColor: selectedSignal === stats.signalId ? '#e3f2fd' : 'transparent',
                                        cursor: 'pointer',
                                    }, onClick: () => setSelectedSignal(stats.signalId), children: [_jsx("td", { style: tdStyle, children: stats.signalId }), _jsx("td", { style: tdStyle, children: stats.type }), _jsx("td", { style: tdStyle, children: stats.sampleCount }), _jsxs("td", { style: tdStyle, children: [stats.mean.toFixed(2), "ms"] }), _jsxs("td", { style: tdStyle, children: [stats.median.toFixed(2), "ms"] }), _jsxs("td", { style: tdStyle, children: [stats.p95.toFixed(2), "ms"] }), _jsxs("td", { style: tdStyle, children: [stats.p99.toFixed(2), "ms"] }), _jsxs("td", { style: tdStyle, children: [stats.max.toFixed(2), "ms"] }), _jsx("td", { style: tdStyle, children: stats.skippedCount })] }, stats.signalId))) })] }))] }), profilerData.batchRecords.length > 0 && (_jsxs("section", { style: { marginBottom: '30px' }, children: [_jsx("h3", { children: "Recent Batch Operations" }), _jsxs("table", { style: tableStyle, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: thStyle, children: "Batch ID" }), _jsx("th", { style: thStyle, children: "Duration" }), _jsx("th", { style: thStyle, children: "Operations" }), _jsx("th", { style: thStyle, children: "Signals Affected" }), _jsx("th", { style: thStyle, children: "Depth" })] }) }), _jsx("tbody", { children: profilerData.batchRecords.slice(-maxBatchRecords).map((record) => (_jsxs("tr", { children: [_jsxs("td", { style: tdStyle, children: ["#", record.batchId] }), _jsxs("td", { style: tdStyle, children: [record.duration.toFixed(2), "ms"] }), _jsx("td", { style: tdStyle, children: record.operationCount }), _jsx("td", { style: tdStyle, children: record.affectedSignals.length }), _jsx("td", { style: tdStyle, children: record.depth })] }, record.batchId))) })] })] })), showDetails && selectedSignal && (_jsxs("section", { style: { marginTop: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }, children: [_jsxs("h3", { children: ["Signal Details: ", selectedSignal] }), (() => {
                        const stats = profilerData.signalStats.get(selectedSignal);
                        if (!stats)
                            return null;
                        return (_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }, children: [_jsxs("div", { children: [_jsx("strong", { children: "Type:" }), " ", stats.type] }), _jsxs("div", { children: [_jsx("strong", { children: "Sample Count:" }), " ", stats.sampleCount] }), _jsxs("div", { children: [_jsx("strong", { children: "Min Latency:" }), " ", stats.min.toFixed(2), "ms"] }), _jsxs("div", { children: [_jsx("strong", { children: "Max Latency:" }), " ", stats.max.toFixed(2), "ms"] }), _jsxs("div", { children: [_jsx("strong", { children: "Mean Latency:" }), " ", stats.mean.toFixed(2), "ms"] }), _jsxs("div", { children: [_jsx("strong", { children: "Median Latency:" }), " ", stats.median.toFixed(2), "ms"] }), _jsxs("div", { children: [_jsx("strong", { children: "P95 Latency:" }), " ", stats.p95.toFixed(2), "ms"] }), _jsxs("div", { children: [_jsx("strong", { children: "P99 Latency:" }), " ", stats.p99.toFixed(2), "ms"] }), _jsxs("div", { children: [_jsx("strong", { children: "Std Deviation:" }), " ", stats.stdDev.toFixed(2), "ms"] }), _jsxs("div", { children: [_jsx("strong", { children: "Avg Subscribers:" }), " ", stats.avgSubscribers.toFixed(1)] }), _jsxs("div", { children: [_jsx("strong", { children: "Skipped Updates:" }), " ", stats.skippedCount] }), _jsxs("div", { children: [_jsx("strong", { children: "Effective Updates:" }), " ", stats.sampleCount - stats.skippedCount] })] }));
                    })(), _jsx("button", { onClick: () => setSelectedSignal(null), style: { ...buttonStyle, marginTop: '15px' }, children: "Close Details" })] }))] }));
};
const SummaryCard = ({ title, value, icon }) => (_jsxs("div", { style: {
        padding: '15px',
        backgroundColor: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }, children: [_jsx("div", { style: { fontSize: '24px', marginBottom: '5px' }, children: icon }), _jsx("div", { style: { fontSize: '12px', color: '#666', marginBottom: '5px' }, children: title }), _jsx("div", { style: { fontSize: '20px', fontWeight: 'bold' }, children: value })] }));
const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
};
const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};
const thStyle = {
    padding: '12px',
    backgroundColor: '#f5f5f5',
    borderBottom: '2px solid #e0e0e0',
    textAlign: 'left',
    fontWeight: 'bold',
    cursor: 'pointer',
    userSelect: 'none',
};
const tdStyle = {
    padding: '10px 12px',
    borderBottom: '1px solid #e0e0e0',
};
export default PerformanceTab;
