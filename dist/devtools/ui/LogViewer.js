import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useRef } from 'react';
export function LogViewer({ plugin, refreshInterval = 500, maxDisplayLogs = 200, showStats = true, autoScroll = true, style, }) {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterLevel, setFilterLevel] = useState('all');
    const [filterSignal, setFilterSignal] = useState('all');
    const [selectedLog, setSelectedLog] = useState(null);
    const logsEndRef = useRef(null);
    useEffect(() => {
        const updateLogs = () => {
            const allLogs = plugin.getLogs();
            setLogs(allLogs);
        };
        updateLogs();
        const interval = setInterval(updateLogs, refreshInterval);
        return () => clearInterval(interval);
    }, [plugin, refreshInterval]);
    useEffect(() => {
        let filtered = [...logs];
        if (filterType !== 'all') {
            filtered = filtered.filter(log => log.type === filterType);
        }
        if (filterLevel !== 'all') {
            filtered = filtered.filter(log => log.level === filterLevel);
        }
        if (filterSignal !== 'all') {
            filtered = filtered.filter(log => (log.signalLabel || log.signalId) === filterSignal);
        }
        if (searchQuery) {
            filtered = plugin.search(searchQuery);
            if (filterType !== 'all') {
                filtered = filtered.filter(log => log.type === filterType);
            }
            if (filterLevel !== 'all') {
                filtered = filtered.filter(log => log.level === filterLevel);
            }
            if (filterSignal !== 'all') {
                filtered = filtered.filter(log => (log.signalLabel || log.signalId) === filterSignal);
            }
        }
        if (filtered.length > maxDisplayLogs) {
            filtered = filtered.slice(-maxDisplayLogs);
        }
        setFilteredLogs(filtered);
    }, [logs, searchQuery, filterType, filterLevel, filterSignal, maxDisplayLogs, plugin]);
    useEffect(() => {
        if (autoScroll) {
            logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [filteredLogs, autoScroll]);
    const signalLabels = React.useMemo(() => {
        const labels = new Set();
        logs.forEach(log => {
            const label = log.signalLabel || log.signalId;
            labels.add(label);
        });
        return Array.from(labels).sort();
    }, [logs]);
    const stats = React.useMemo(() => plugin.getStats(), [logs, plugin]);
    const handleClear = () => {
        plugin.clear();
        setLogs([]);
        setFilteredLogs([]);
        setSelectedLog(null);
    };
    const handleExport = () => {
        const json = plugin.exportLogs();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `signalforge-logs-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };
    const handleLogClick = (log) => {
        setSelectedLog(log);
    };
    const handleCloseDetails = () => {
        setSelectedLog(null);
    };
    return (_jsxs("div", { style: { ...containerStyle, ...style }, children: [_jsxs("div", { style: headerStyle, children: [_jsx("h3", { style: { margin: 0 }, children: "\uD83D\uDCDD Signal Logger" }), _jsxs("div", { style: { display: 'flex', gap: '10px' }, children: [_jsx("button", { onClick: handleClear, style: buttonStyle, children: "\uD83D\uDDD1\uFE0F Clear" }), _jsx("button", { onClick: handleExport, style: buttonStyle, children: "\uD83D\uDCBE Export" })] })] }), showStats && (_jsxs("div", { style: statsStyle, children: [_jsxs("div", { style: statItemStyle, children: [_jsx("strong", { children: "Total:" }), " ", stats.total] }), _jsxs("div", { style: statItemStyle, children: [_jsx("strong", { children: "Creates:" }), " ", stats.byType.create] }), _jsxs("div", { style: statItemStyle, children: [_jsx("strong", { children: "Updates:" }), " ", stats.byType.update] }), _jsxs("div", { style: statItemStyle, children: [_jsx("strong", { children: "Destroys:" }), " ", stats.byType.destroy] }), _jsxs("div", { style: statItemStyle, children: [_jsx("strong", { children: "Signals:" }), " ", Object.keys(stats.bySignal).length] })] })), _jsxs("div", { style: filtersStyle, children: [_jsx("input", { type: "text", placeholder: "\uD83D\uDD0D Search logs...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), style: searchInputStyle }), _jsxs("select", { value: filterType, onChange: (e) => setFilterType(e.target.value), style: selectStyle, children: [_jsx("option", { value: "all", children: "All Types" }), _jsx("option", { value: "create", children: "\uD83D\uDFE2 Create" }), _jsx("option", { value: "update", children: "\uD83D\uDD35 Update" }), _jsx("option", { value: "destroy", children: "\uD83D\uDD34 Destroy" })] }), _jsxs("select", { value: filterLevel, onChange: (e) => setFilterLevel(e.target.value), style: selectStyle, children: [_jsx("option", { value: "all", children: "All Levels" }), _jsx("option", { value: "debug", children: "Debug" }), _jsx("option", { value: "info", children: "Info" }), _jsx("option", { value: "warn", children: "Warning" }), _jsx("option", { value: "error", children: "Error" })] }), _jsxs("select", { value: filterSignal, onChange: (e) => setFilterSignal(e.target.value), style: selectStyle, children: [_jsx("option", { value: "all", children: "All Signals" }), signalLabels.map(label => (_jsx("option", { value: label, children: label }, label)))] })] }), _jsx("div", { style: logsContainerStyle, children: filteredLogs.length === 0 ? (_jsx("div", { style: emptyStateStyle, children: logs.length === 0 ? (_jsx(_Fragment, { children: "\uD83D\uDCED No logs yet. Signals will be logged here." })) : (_jsx(_Fragment, { children: "\uD83D\uDD0D No logs match your filters." })) })) : (_jsxs(_Fragment, { children: [filteredLogs.map(log => (_jsx(LogEntryRow, { log: log, onClick: () => handleLogClick(log), isSelected: selectedLog?.id === log.id }, log.id))), _jsx("div", { ref: logsEndRef })] })) }), selectedLog && (_jsx(LogDetailsPanel, { log: selectedLog, onClose: handleCloseDetails }))] }));
}
function LogEntryRow({ log, onClick, isSelected }) {
    const icon = getLogIcon(log.type);
    const timestamp = new Date(log.timestamp).toLocaleTimeString();
    const label = log.signalLabel || log.signalId;
    const rowStyle = {
        ...logRowStyle,
        backgroundColor: isSelected ? '#e3f2fd' :
            log.level === 'error' ? '#ffebee' :
                log.level === 'warn' ? '#fff3e0' :
                    '#fff',
        borderLeft: isSelected ? '3px solid #2196F3' : 'none',
    };
    return (_jsxs("div", { style: rowStyle, onClick: onClick, children: [_jsx("span", { style: { fontSize: '14px' }, children: icon }), _jsx("span", { style: { color: '#666', fontSize: '12px', minWidth: '80px' }, children: timestamp }), _jsx("span", { style: { fontWeight: 500, flex: 1 }, children: label }), log.type === 'update' && (_jsxs("span", { style: { fontSize: '12px', color: '#666' }, children: [formatValue(log.oldValue), " \u2192 ", formatValue(log.newValue)] })), log.type === 'create' && (_jsxs("span", { style: { fontSize: '12px', color: '#666' }, children: ["= ", formatValue(log.newValue)] }))] }));
}
function LogDetailsPanel({ log, onClose }) {
    return (_jsx("div", { style: detailsOverlayStyle, children: _jsxs("div", { style: detailsPanelStyle, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }, children: [_jsx("h4", { style: { margin: 0 }, children: "Log Details" }), _jsx("button", { onClick: onClose, style: closeButtonStyle, children: "\u2715" })] }), _jsxs("div", { style: detailsContentStyle, children: [_jsx(DetailRow, { label: "ID", value: log.id }), _jsx(DetailRow, { label: "Type", value: `${getLogIcon(log.type)} ${log.type}` }), _jsx(DetailRow, { label: "Level", value: log.level }), _jsx(DetailRow, { label: "Timestamp", value: new Date(log.timestamp).toISOString() }), _jsx(DetailRow, { label: "Signal ID", value: log.signalId }), log.signalLabel && (_jsx(DetailRow, { label: "Signal Label", value: log.signalLabel })), log.metadata && (_jsx(DetailRow, { label: "Metadata", value: JSON.stringify(log.metadata, null, 2), isCode: true })), log.oldValue !== undefined && (_jsx(DetailRow, { label: "Old Value", value: JSON.stringify(log.oldValue, null, 2), isCode: true })), log.newValue !== undefined && (_jsx(DetailRow, { label: "New Value", value: JSON.stringify(log.newValue, null, 2), isCode: true })), log.message && (_jsx(DetailRow, { label: "Message", value: log.message })), log.stack && (_jsx(DetailRow, { label: "Stack Trace", value: log.stack, isCode: true }))] })] }) }));
}
function DetailRow({ label, value, isCode }) {
    return (_jsxs("div", { style: { marginBottom: '10px' }, children: [_jsx("div", { style: { fontWeight: 600, marginBottom: '5px', fontSize: '12px', color: '#666' }, children: label }), isCode ? (_jsx("pre", { style: codeStyle, children: value })) : (_jsx("div", { children: value }))] }));
}
function getLogIcon(type) {
    switch (type) {
        case 'create': return '🟢';
        case 'update': return '🔵';
        case 'destroy': return '🔴';
        default: return '⚪';
    }
}
function formatValue(value) {
    if (value === undefined)
        return 'undefined';
    if (value === null)
        return 'null';
    if (typeof value === 'object') {
        try {
            const json = JSON.stringify(value);
            return json.length > 30 ? json.substring(0, 27) + '...' : json;
        }
        catch {
            return '[Object]';
        }
    }
    return String(value);
}
const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#f5f5f5',
    fontFamily: 'system-ui, -apple-system, sans-serif',
};
const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
};
const statsStyle = {
    display: 'flex',
    gap: '15px',
    padding: '10px 15px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    fontSize: '13px',
};
const statItemStyle = {
    display: 'flex',
    gap: '5px',
};
const filtersStyle = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    gap: '10px',
    padding: '10px 15px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
};
const searchInputStyle = {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
};
const selectStyle = {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: '#fff',
};
const logsContainerStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '10px',
};
const logRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    marginBottom: '2px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
    fontSize: '14px',
};
const emptyStateStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    color: '#999',
    fontSize: '14px',
};
const buttonStyle = {
    padding: '6px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
};
const detailsOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
};
const detailsPanelStyle = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
};
const detailsContentStyle = {
    fontSize: '14px',
};
const closeButtonStyle = {
    padding: '4px 8px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#666',
};
const codeStyle = {
    backgroundColor: '#f5f5f5',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
    overflow: 'auto',
    maxHeight: '200px',
};
