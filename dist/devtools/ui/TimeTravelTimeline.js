import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { calculateMemoryUsage, formatMemorySize, } from '../../plugins/timeTravel';
export const TimeTravelTimeline = ({ plugin, refreshInterval = 1000, showDetails = true, className = '', style = {}, }) => {
    const [timeline, setTimeline] = useState(null);
    const [selectedSnapshot, setSelectedSnapshot] = useState(null);
    const [memoryUsage, setMemoryUsage] = useState('0 B');
    const refreshTimeline = () => {
        const state = plugin.getTimelineState();
        setTimeline(state);
        const snapshots = plugin.getSnapshots();
        const bytes = calculateMemoryUsage(snapshots);
        setMemoryUsage(formatMemorySize(bytes));
    };
    useEffect(() => {
        refreshTimeline();
        if (refreshInterval > 0) {
            const timer = setInterval(refreshTimeline, refreshInterval);
            return () => clearInterval(timer);
        }
    }, [refreshInterval]);
    const handleUndo = () => {
        plugin.undo();
        refreshTimeline();
    };
    const handleRedo = () => {
        plugin.redo();
        refreshTimeline();
    };
    const handleJumpTo = (index) => {
        plugin.jumpTo(index);
        refreshTimeline();
    };
    const handleSliderChange = (e) => {
        const index = parseInt(e.target.value, 10);
        handleJumpTo(index);
    };
    const handleSnapshotClick = (index) => {
        const snapshot = plugin.getSnapshotAt(index);
        setSelectedSnapshot(snapshot || null);
    };
    const handleExport = () => {
        const session = plugin.exportSession();
        const json = JSON.stringify(session, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `time-travel-session-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };
    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            const file = e.target.files?.[0];
            if (!file)
                return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const session = JSON.parse(event.target?.result);
                    plugin.importSession(session);
                    refreshTimeline();
                }
                catch (error) {
                    alert('Failed to import session: ' + error);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };
    const handleClear = () => {
        if (confirm('Clear all history?')) {
            plugin.clear();
            setSelectedSnapshot(null);
            refreshTimeline();
        }
    };
    const handleToggleRecording = () => {
        plugin.setEnabled(!plugin.isEnabled());
        refreshTimeline();
    };
    if (!timeline) {
        return _jsx("div", { style: { padding: '20px' }, children: "Loading..." });
    }
    return (_jsxs("div", { className: `time-travel-timeline ${className}`, style: { padding: '20px', fontFamily: 'system-ui, sans-serif', ...style }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }, children: [_jsx("h2", { style: { margin: 0 }, children: "\u23F1\uFE0F Time Travel" }), _jsxs("div", { style: { display: 'flex', gap: '10px' }, children: [_jsx("button", { onClick: handleToggleRecording, style: buttonStyle, children: plugin.isEnabled() ? '⏸️ Pause' : '▶️ Record' }), _jsx("button", { onClick: handleExport, style: buttonStyle, disabled: timeline.total === 0, children: "\uD83D\uDCE5 Export" }), _jsx("button", { onClick: handleImport, style: buttonStyle, children: "\uD83D\uDCE4 Import" }), _jsx("button", { onClick: handleClear, style: buttonStyle, disabled: timeline.total === 0, children: "\uD83D\uDDD1\uFE0F Clear" })] })] }), _jsxs("div", { style: { display: 'flex', gap: '20px', marginBottom: '20px', fontSize: '14px', color: '#666' }, children: [_jsxs("div", { children: [_jsx("strong", { children: "Snapshots:" }), " ", timeline.total] }), _jsxs("div", { children: [_jsx("strong", { children: "Position:" }), " ", timeline.current + 1, " / ", timeline.total] }), _jsxs("div", { children: [_jsx("strong", { children: "Memory:" }), " ", memoryUsage] }), _jsxs("div", { children: [_jsx("strong", { children: "Status:" }), " ", plugin.isEnabled() ? '🟢 Recording' : '⏸️ Paused'] })] }), _jsxs("div", { style: { display: 'flex', gap: '10px', marginBottom: '20px' }, children: [_jsx("button", { onClick: handleUndo, disabled: !timeline.canUndo, style: { ...buttonStyle, flex: 1 }, children: "\u23EA Undo" }), _jsx("button", { onClick: handleRedo, disabled: !timeline.canRedo, style: { ...buttonStyle, flex: 1 }, children: "\u23E9 Redo" }), _jsx("button", { onClick: () => handleJumpTo(0), disabled: timeline.total === 0 || timeline.current === 0, style: { ...buttonStyle, flex: 1 }, children: "\u23EE\uFE0F Start" }), _jsx("button", { onClick: () => handleJumpTo(timeline.total - 1), disabled: timeline.total === 0 || timeline.current === timeline.total - 1, style: { ...buttonStyle, flex: 1 }, children: "\u23ED\uFE0F End" })] }), timeline.total > 0 && (_jsxs("div", { style: { marginBottom: '30px' }, children: [_jsx("input", { type: "range", min: "0", max: timeline.total - 1, value: timeline.current, onChange: handleSliderChange, style: {
                            width: '100%',
                            height: '8px',
                            borderRadius: '4px',
                            outline: 'none',
                            cursor: 'pointer',
                        } }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999', marginTop: '5px' }, children: [_jsx("span", { children: "Start" }), _jsxs("span", { children: ["Position: ", timeline.current + 1] }), _jsx("span", { children: "End" })] })] })), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("h3", { style: { marginBottom: '10px' }, children: "Snapshots" }), timeline.total === 0 ? (_jsx("p", { style: { color: '#666' }, children: "No snapshots recorded yet. Start using signals to see history." })) : (_jsx("div", { style: { maxHeight: '400px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '4px' }, children: timeline.snapshots.map((snapshot, index) => (_jsxs("div", { onClick: () => handleSnapshotClick(index), style: {
                                padding: '12px',
                                borderBottom: '1px solid #f0f0f0',
                                cursor: 'pointer',
                                backgroundColor: index === timeline.current ? '#e3f2fd' : 'transparent',
                                transition: 'background-color 0.2s',
                            }, onMouseEnter: (e) => {
                                if (index !== timeline.current) {
                                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                                }
                            }, onMouseLeave: (e) => {
                                if (index !== timeline.current) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { children: [_jsxs("strong", { children: ["#", snapshot.id] }), " ", snapshot.signalLabel || snapshot.signalId] }), _jsx("div", { style: { fontSize: '12px', color: '#666' }, children: new Date(snapshot.timestamp).toLocaleTimeString() })] }), _jsx("div", { style: { fontSize: '14px', color: '#555', marginTop: '4px' }, children: snapshot.preview })] }, snapshot.id))) }))] }), showDetails && selectedSnapshot && (_jsxs("div", { style: { padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #e0e0e0' }, children: [_jsx("h3", { style: { marginTop: 0 }, children: "Snapshot Details" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }, children: [_jsxs("div", { children: [_jsx("strong", { children: "ID:" }), " #", selectedSnapshot.id] }), _jsxs("div", { children: [_jsx("strong", { children: "Index:" }), " ", selectedSnapshot.index] }), _jsxs("div", { children: [_jsx("strong", { children: "Signal:" }), " ", selectedSnapshot.signalLabel || selectedSnapshot.signalId] }), _jsxs("div", { children: [_jsx("strong", { children: "Type:" }), " ", selectedSnapshot.signalType] }), _jsxs("div", { children: [_jsx("strong", { children: "Time:" }), " ", new Date(selectedSnapshot.timestamp).toLocaleString()] }), _jsxs("div", { children: [_jsx("strong", { children: "Is Full:" }), " ", selectedSnapshot.isFull ? 'Yes' : 'No (Diff)'] })] }), _jsxs("div", { style: { marginTop: '15px' }, children: [_jsx("div", { style: { marginBottom: '5px' }, children: _jsx("strong", { children: "Old Value:" }) }), _jsx("pre", { style: codeStyle, children: JSON.stringify(selectedSnapshot.oldValue, null, 2) })] }), _jsxs("div", { style: { marginTop: '15px' }, children: [_jsx("div", { style: { marginBottom: '5px' }, children: _jsx("strong", { children: "New Value:" }) }), _jsx("pre", { style: codeStyle, children: JSON.stringify(selectedSnapshot.newValue, null, 2) })] }), selectedSnapshot.diff && (_jsxs("div", { style: { marginTop: '15px' }, children: [_jsx("div", { style: { marginBottom: '5px' }, children: _jsx("strong", { children: "Diff:" }) }), _jsx("pre", { style: codeStyle, children: JSON.stringify(selectedSnapshot.diff, null, 2) })] })), _jsx("button", { onClick: () => setSelectedSnapshot(null), style: { ...buttonStyle, marginTop: '15px' }, children: "Close" })] }))] }));
};
const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
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
export default TimeTravelTimeline;
