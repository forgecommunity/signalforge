/**
 * LogViewer Component for SignalForge DevTools
 * 
 * Displays logger plugin output in DevTools Plugins tab with:
 * - Real-time log updates
 * - Filtering by type, level, signal
 * - Search functionality
 * - Export logs to file
 * - Clear logs
 * - Statistics display
 * 
 * @example
 * ```typescript
 * <LogViewer 
 *   plugin={loggerPlugin}
 *   refreshInterval={500}
 *   maxDisplayLogs={200}
 * />
 * ```
 */

import React, { useState, useEffect, useRef } from 'react';
import type { LoggerPlugin, LogEntry, LogType, LogLevel } from '../../plugins/logger';

// ============================================================================
// Types
// ============================================================================

export interface LogViewerProps {
  /** Logger plugin instance */
  plugin: LoggerPlugin;
  
  /** Auto-refresh interval in milliseconds (default: 500) */
  refreshInterval?: number;
  
  /** Maximum logs to display (default: 200) */
  maxDisplayLogs?: number;
  
  /** Show statistics panel (default: true) */
  showStats?: boolean;
  
  /** Enable auto-scroll to latest log (default: true) */
  autoScroll?: boolean;
  
  /** Custom CSS styles */
  style?: React.CSSProperties;
}

// ============================================================================
// LogViewer Component
// ============================================================================

export function LogViewer({
  plugin,
  refreshInterval = 500,
  maxDisplayLogs = 200,
  showStats = true,
  autoScroll = true,
  style,
}: LogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<LogType | 'all'>('all');
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all');
  const [filterSignal, setFilterSignal] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-refresh logs
  useEffect(() => {
    const updateLogs = () => {
      const allLogs = plugin.getLogs();
      setLogs(allLogs);
    };
    
    updateLogs();
    const interval = setInterval(updateLogs, refreshInterval);
    
    return () => clearInterval(interval);
  }, [plugin, refreshInterval]);
  
  // Apply filters
  useEffect(() => {
    let filtered = [...logs];
    
    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(log => log.type === filterType);
    }
    
    // Level filter
    if (filterLevel !== 'all') {
      filtered = filtered.filter(log => log.level === filterLevel);
    }
    
    // Signal filter
    if (filterSignal !== 'all') {
      filtered = filtered.filter(log => 
        (log.signalLabel || log.signalId) === filterSignal
      );
    }
    
    // Search filter
    if (searchQuery) {
      filtered = plugin.search(searchQuery);
      
      // Re-apply other filters to search results
      if (filterType !== 'all') {
        filtered = filtered.filter(log => log.type === filterType);
      }
      if (filterLevel !== 'all') {
        filtered = filtered.filter(log => log.level === filterLevel);
      }
      if (filterSignal !== 'all') {
        filtered = filtered.filter(log => 
          (log.signalLabel || log.signalId) === filterSignal
        );
      }
    }
    
    // Limit display
    if (filtered.length > maxDisplayLogs) {
      filtered = filtered.slice(-maxDisplayLogs);
    }
    
    setFilteredLogs(filtered);
  }, [logs, searchQuery, filterType, filterLevel, filterSignal, maxDisplayLogs, plugin]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs, autoScroll]);
  
  // Get unique signal labels
  const signalLabels = React.useMemo(() => {
    const labels = new Set<string>();
    logs.forEach(log => {
      const label = log.signalLabel || log.signalId;
      labels.add(label);
    });
    return Array.from(labels).sort();
  }, [logs]);
  
  // Get statistics
  const stats = React.useMemo(() => plugin.getStats(), [logs, plugin]);
  
  // Handlers
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
  
  const handleLogClick = (log: LogEntry) => {
    setSelectedLog(log);
  };
  
  const handleCloseDetails = () => {
    setSelectedLog(null);
  };
  
  return (
    <div style={{ ...containerStyle, ...style }}>
      {/* Header */}
      <div style={headerStyle}>
        <h3 style={{ margin: 0 }}>📝 Signal Logger</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleClear} style={buttonStyle}>
            🗑️ Clear
          </button>
          <button onClick={handleExport} style={buttonStyle}>
            💾 Export
          </button>
        </div>
      </div>
      
      {/* Statistics */}
      {showStats && (
        <div style={statsStyle}>
          <div style={statItemStyle}>
            <strong>Total:</strong> {stats.total}
          </div>
          <div style={statItemStyle}>
            <strong>Creates:</strong> {stats.byType.create}
          </div>
          <div style={statItemStyle}>
            <strong>Updates:</strong> {stats.byType.update}
          </div>
          <div style={statItemStyle}>
            <strong>Destroys:</strong> {stats.byType.destroy}
          </div>
          <div style={statItemStyle}>
            <strong>Signals:</strong> {Object.keys(stats.bySignal).length}
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div style={filtersStyle}>
        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Search logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={searchInputStyle}
        />
        
        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as LogType | 'all')}
          style={selectStyle}
        >
          <option value="all">All Types</option>
          <option value="create">🟢 Create</option>
          <option value="update">🔵 Update</option>
          <option value="destroy">🔴 Destroy</option>
        </select>
        
        {/* Level Filter */}
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value as LogLevel | 'all')}
          style={selectStyle}
        >
          <option value="all">All Levels</option>
          <option value="debug">Debug</option>
          <option value="info">Info</option>
          <option value="warn">Warning</option>
          <option value="error">Error</option>
        </select>
        
        {/* Signal Filter */}
        <select
          value={filterSignal}
          onChange={(e) => setFilterSignal(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All Signals</option>
          {signalLabels.map(label => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Logs List */}
      <div style={logsContainerStyle}>
        {filteredLogs.length === 0 ? (
          <div style={emptyStateStyle}>
            {logs.length === 0 ? (
              <>📭 No logs yet. Signals will be logged here.</>
            ) : (
              <>🔍 No logs match your filters.</>
            )}
          </div>
        ) : (
          <>
            {filteredLogs.map(log => (
              <LogEntryRow
                key={log.id}
                log={log}
                onClick={() => handleLogClick(log)}
                isSelected={selectedLog?.id === log.id}
              />
            ))}
            <div ref={logsEndRef} />
          </>
        )}
      </div>
      
      {/* Details Panel */}
      {selectedLog && (
        <LogDetailsPanel
          log={selectedLog}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
}

// ============================================================================
// Log Entry Row Component
// ============================================================================

interface LogEntryRowProps {
  log: LogEntry;
  onClick: () => void;
  isSelected: boolean;
}

function LogEntryRow({ log, onClick, isSelected }: LogEntryRowProps) {
  const icon = getLogIcon(log.type);
  const timestamp = new Date(log.timestamp).toLocaleTimeString();
  const label = log.signalLabel || log.signalId;
  
  const rowStyle: React.CSSProperties = {
    ...logRowStyle,
    backgroundColor: isSelected ? '#e3f2fd' : 
                     log.level === 'error' ? '#ffebee' :
                     log.level === 'warn' ? '#fff3e0' :
                     '#fff',
    borderLeft: isSelected ? '3px solid #2196F3' : 'none',
  };
  
  return (
    <div style={rowStyle} onClick={onClick}>
      <span style={{ fontSize: '14px' }}>{icon}</span>
      <span style={{ color: '#666', fontSize: '12px', minWidth: '80px' }}>
        {timestamp}
      </span>
      <span style={{ fontWeight: 500, flex: 1 }}>
        {label}
      </span>
      {log.type === 'update' && (
        <span style={{ fontSize: '12px', color: '#666' }}>
          {formatValue(log.oldValue)} → {formatValue(log.newValue)}
        </span>
      )}
      {log.type === 'create' && (
        <span style={{ fontSize: '12px', color: '#666' }}>
          = {formatValue(log.newValue)}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// Log Details Panel Component
// ============================================================================

interface LogDetailsPanelProps {
  log: LogEntry;
  onClose: () => void;
}

function LogDetailsPanel({ log, onClose }: LogDetailsPanelProps) {
  return (
    <div style={detailsOverlayStyle}>
      <div style={detailsPanelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h4 style={{ margin: 0 }}>Log Details</h4>
          <button onClick={onClose} style={closeButtonStyle}>
            ✕
          </button>
        </div>
        
        <div style={detailsContentStyle}>
          <DetailRow label="ID" value={log.id} />
          <DetailRow label="Type" value={`${getLogIcon(log.type)} ${log.type}`} />
          <DetailRow label="Level" value={log.level} />
          <DetailRow 
            label="Timestamp" 
            value={new Date(log.timestamp).toISOString()} 
          />
          <DetailRow label="Signal ID" value={log.signalId} />
          {log.signalLabel && (
            <DetailRow label="Signal Label" value={log.signalLabel} />
          )}
          {log.metadata && (
            <DetailRow 
              label="Metadata" 
              value={JSON.stringify(log.metadata, null, 2)}
              isCode
            />
          )}
          {log.oldValue !== undefined && (
            <DetailRow 
              label="Old Value" 
              value={JSON.stringify(log.oldValue, null, 2)}
              isCode
            />
          )}
          {log.newValue !== undefined && (
            <DetailRow 
              label="New Value" 
              value={JSON.stringify(log.newValue, null, 2)}
              isCode
            />
          )}
          {log.message && (
            <DetailRow label="Message" value={log.message} />
          )}
          {log.stack && (
            <DetailRow 
              label="Stack Trace" 
              value={log.stack}
              isCode
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Detail Row Component
// ============================================================================

interface DetailRowProps {
  label: string;
  value: string;
  isCode?: boolean;
}

function DetailRow({ label, value, isCode }: DetailRowProps) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ fontWeight: 600, marginBottom: '5px', fontSize: '12px', color: '#666' }}>
        {label}
      </div>
      {isCode ? (
        <pre style={codeStyle}>{value}</pre>
      ) : (
        <div>{value}</div>
      )}
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function getLogIcon(type: LogType): string {
  switch (type) {
    case 'create': return '🟢';
    case 'update': return '🔵';
    case 'destroy': return '🔴';
    default: return '⚪';
  }
}

function formatValue(value: any): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  
  if (typeof value === 'object') {
    try {
      const json = JSON.stringify(value);
      return json.length > 30 ? json.substring(0, 27) + '...' : json;
    } catch {
      return '[Object]';
    }
  }
  
  return String(value);
}

// ============================================================================
// Styles
// ============================================================================

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: '#f5f5f5',
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '15px',
  backgroundColor: '#fff',
  borderBottom: '1px solid #e0e0e0',
};

const statsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '15px',
  padding: '10px 15px',
  backgroundColor: '#fff',
  borderBottom: '1px solid #e0e0e0',
  fontSize: '13px',
};

const statItemStyle: React.CSSProperties = {
  display: 'flex',
  gap: '5px',
};

const filtersStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr',
  gap: '10px',
  padding: '10px 15px',
  backgroundColor: '#fff',
  borderBottom: '1px solid #e0e0e0',
};

const searchInputStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '14px',
};

const selectStyle: React.CSSProperties = {
  padding: '8px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '14px',
  backgroundColor: '#fff',
};

const logsContainerStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '10px',
};

const logRowStyle: React.CSSProperties = {
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

const emptyStateStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '200px',
  color: '#999',
  fontSize: '14px',
};

const buttonStyle: React.CSSProperties = {
  padding: '6px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  backgroundColor: '#fff',
  cursor: 'pointer',
  fontSize: '14px',
};

const detailsOverlayStyle: React.CSSProperties = {
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

const detailsPanelStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  padding: '20px',
  maxWidth: '600px',
  maxHeight: '80vh',
  overflow: 'auto',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
};

const detailsContentStyle: React.CSSProperties = {
  fontSize: '14px',
};

const closeButtonStyle: React.CSSProperties = {
  padding: '4px 8px',
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  fontSize: '18px',
  color: '#666',
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
