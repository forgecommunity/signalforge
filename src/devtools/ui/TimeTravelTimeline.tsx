/**
 * SignalForge Time Travel Timeline UI Component
 * 
 * PURPOSE:
 * ========
 * React component for visualizing and navigating time-travel history.
 * Provides an interactive timeline slider, snapshot list, and controls.
 * 
 * FEATURES:
 * - Timeline slider for quick navigation
 * - Snapshot list with timestamps and values
 * - Undo/Redo buttons
 * - Jump to specific snapshots
 * - Export/Import session data
 * - Memory usage display
 * - Auto-refresh option
 * 
 * @module TimeTravelTimeline
 */

import React, { useState, useEffect } from 'react';
import {
  TimeTravelPlugin,
  calculateMemoryUsage,
  formatMemorySize,
  type TimelineState,
  type TimeTravelSnapshot,
} from '../../plugins/timeTravel';

// ============================================================================
// Types
// ============================================================================

export interface TimeTravelTimelineProps {
  /** Time travel plugin instance */
  plugin: TimeTravelPlugin;
  /** Auto-refresh interval (ms), 0 = disabled */
  refreshInterval?: number;
  /** Show detailed snapshot info */
  showDetails?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Time Travel Timeline Component
 * 
 * Interactive UI for time-travel debugging with timeline slider and controls.
 * 
 * @example
 * ```tsx
 * const timeTravel = new TimeTravelPlugin();
 * 
 * function App() {
 *   return <TimeTravelTimeline plugin={timeTravel} refreshInterval={1000} />;
 * }
 * ```
 */
export const TimeTravelTimeline: React.FC<TimeTravelTimelineProps> = ({
  plugin,
  refreshInterval = 1000,
  showDetails = true,
  className = '',
  style = {},
}) => {
  const [timeline, setTimeline] = useState<TimelineState | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<TimeTravelSnapshot | null>(null);
  const [memoryUsage, setMemoryUsage] = useState<string>('0 B');

  // Fetch timeline data
  const refreshTimeline = () => {
    const state = plugin.getTimelineState();
    setTimeline(state);
    
    const snapshots = plugin.getSnapshots();
    const bytes = calculateMemoryUsage(snapshots as TimeTravelSnapshot[]);
    setMemoryUsage(formatMemorySize(bytes));
  };

  // Auto-refresh
  useEffect(() => {
    refreshTimeline();
    
    if (refreshInterval > 0) {
      const timer = setInterval(refreshTimeline, refreshInterval);
      return () => clearInterval(timer);
    }
  }, [refreshInterval]);

  // Handlers
  const handleUndo = () => {
    plugin.undo();
    refreshTimeline();
  };

  const handleRedo = () => {
    plugin.redo();
    refreshTimeline();
  };

  const handleJumpTo = (index: number) => {
    plugin.jumpTo(index);
    refreshTimeline();
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value, 10);
    handleJumpTo(index);
  };

  const handleSnapshotClick = (index: number) => {
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
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const session = JSON.parse(event.target?.result as string);
          plugin.importSession(session);
          refreshTimeline();
        } catch (error) {
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
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div className={`time-travel-timeline ${className}`} style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', ...style }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>⏱️ Time Travel</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleToggleRecording} style={buttonStyle}>
            {plugin.isEnabled() ? '⏸️ Pause' : '▶️ Record'}
          </button>
          <button onClick={handleExport} style={buttonStyle} disabled={timeline.total === 0}>
            📥 Export
          </button>
          <button onClick={handleImport} style={buttonStyle}>
            📤 Import
          </button>
          <button onClick={handleClear} style={buttonStyle} disabled={timeline.total === 0}>
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', fontSize: '14px', color: '#666' }}>
        <div>
          <strong>Snapshots:</strong> {timeline.total}
        </div>
        <div>
          <strong>Position:</strong> {timeline.current + 1} / {timeline.total}
        </div>
        <div>
          <strong>Memory:</strong> {memoryUsage}
        </div>
        <div>
          <strong>Status:</strong> {plugin.isEnabled() ? '🟢 Recording' : '⏸️ Paused'}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={handleUndo} 
          disabled={!timeline.canUndo}
          style={{ ...buttonStyle, flex: 1 }}
        >
          ⏪ Undo
        </button>
        <button 
          onClick={handleRedo} 
          disabled={!timeline.canRedo}
          style={{ ...buttonStyle, flex: 1 }}
        >
          ⏩ Redo
        </button>
        <button 
          onClick={() => handleJumpTo(0)} 
          disabled={timeline.total === 0 || timeline.current === 0}
          style={{ ...buttonStyle, flex: 1 }}
        >
          ⏮️ Start
        </button>
        <button 
          onClick={() => handleJumpTo(timeline.total - 1)} 
          disabled={timeline.total === 0 || timeline.current === timeline.total - 1}
          style={{ ...buttonStyle, flex: 1 }}
        >
          ⏭️ End
        </button>
      </div>

      {/* Timeline Slider */}
      {timeline.total > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <input
            type="range"
            min="0"
            max={timeline.total - 1}
            value={timeline.current}
            onChange={handleSliderChange}
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '4px',
              outline: 'none',
              cursor: 'pointer',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999', marginTop: '5px' }}>
            <span>Start</span>
            <span>Position: {timeline.current + 1}</span>
            <span>End</span>
          </div>
        </div>
      )}

      {/* Snapshot List */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '10px' }}>Snapshots</h3>
        {timeline.total === 0 ? (
          <p style={{ color: '#666' }}>No snapshots recorded yet. Start using signals to see history.</p>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
            {timeline.snapshots.map((snapshot, index) => (
              <div
                key={snapshot.id}
                onClick={() => handleSnapshotClick(index)}
                style={{
                  padding: '12px',
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  backgroundColor: index === timeline.current ? '#e3f2fd' : 'transparent',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (index !== timeline.current) {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== timeline.current) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>#{snapshot.id}</strong> {snapshot.signalLabel || snapshot.signalId}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(snapshot.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div style={{ fontSize: '14px', color: '#555', marginTop: '4px' }}>
                  {snapshot.preview}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Snapshot Details */}
      {showDetails && selectedSnapshot && (
        <div style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <h3 style={{ marginTop: 0 }}>Snapshot Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
            <div><strong>ID:</strong> #{selectedSnapshot.id}</div>
            <div><strong>Index:</strong> {selectedSnapshot.index}</div>
            <div><strong>Signal:</strong> {selectedSnapshot.signalLabel || selectedSnapshot.signalId}</div>
            <div><strong>Type:</strong> {selectedSnapshot.signalType}</div>
            <div><strong>Time:</strong> {new Date(selectedSnapshot.timestamp).toLocaleString()}</div>
            <div><strong>Is Full:</strong> {selectedSnapshot.isFull ? 'Yes' : 'No (Diff)'}</div>
          </div>
          <div style={{ marginTop: '15px' }}>
            <div style={{ marginBottom: '5px' }}><strong>Old Value:</strong></div>
            <pre style={codeStyle}>{JSON.stringify(selectedSnapshot.oldValue, null, 2)}</pre>
          </div>
          <div style={{ marginTop: '15px' }}>
            <div style={{ marginBottom: '5px' }}><strong>New Value:</strong></div>
            <pre style={codeStyle}>{JSON.stringify(selectedSnapshot.newValue, null, 2)}</pre>
          </div>
          {selectedSnapshot.diff && (
            <div style={{ marginTop: '15px' }}>
              <div style={{ marginBottom: '5px' }}><strong>Diff:</strong></div>
              <pre style={codeStyle}>{JSON.stringify(selectedSnapshot.diff, null, 2)}</pre>
            </div>
          )}
          <button 
            onClick={() => setSelectedSnapshot(null)} 
            style={{ ...buttonStyle, marginTop: '15px' }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Styles
// ============================================================================

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: '#2196F3',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'background-color 0.2s',
};

const codeStyle: React.CSSProperties = {
  backgroundColor: '#f5f5f5',
  padding: '10px',
  borderRadius: '4px',
  fontSize: '12px',
  fontFamily: 'monospace',
  overflow: 'auto',
  maxHeight: '200px',
};

// ============================================================================
// Default Export
// ============================================================================

export default TimeTravelTimeline;
