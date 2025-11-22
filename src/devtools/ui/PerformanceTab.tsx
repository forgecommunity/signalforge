/**
 * SignalForge DevTools Performance Tab
 * 
 * PURPOSE:
 * ========
 * React component for displaying performance profiler data in DevTools UI.
 * Shows signal latency statistics, batch timing analysis, and live performance metrics.
 * 
 * FEATURES:
 * - Real-time latency stats with percentiles (p95, p99)
 * - Per-signal performance breakdown
 * - Batch operation timing analysis
 * - Visual charts and graphs
 * - Export capabilities for performance reports
 * - Auto-refresh with configurable interval
 * 
 * ARCHITECTURE:
 * =============
 * 
 * 1. Data Flow:
 *    Performance Profiler → getProfilerData() → Component State → UI Render
 *    → Auto-refresh timer → Re-fetch data → Update state
 * 
 * 2. Component Hierarchy:
 *    PerformanceTab (container)
 *      ├─ LatencyStatsTable (per-signal stats)
 *      ├─ BatchTimingChart (batch duration visualization)
 *      ├─ SummaryCards (aggregated metrics)
 *      └─ Controls (enable/disable, refresh, export)
 * 
 * 3. State Management:
 *    - profileData: Complete profiler snapshot
 *    - refreshInterval: Auto-refresh timer ID
 *    - selectedSignal: Signal for detail view
 *    - sortBy: Table sorting criteria
 * 
 * @module PerformanceTab
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  getProfilerData,
  enableProfiler,
  disableProfiler,
  resetProfiler,
  isProfilerEnabled,
  type ProfilerData,
  type SignalLatencyStats,
  type BatchTimingRecord,
} from '../performanceProfiler';

// ============================================================================
// Types
// ============================================================================

export interface PerformanceTabProps {
  /** Auto-refresh interval in milliseconds (0 = disabled) */
  refreshInterval?: number;
  /** Maximum number of batch records to display */
  maxBatchRecords?: number;
  /** Whether to show detailed statistics */
  showDetails?: boolean;
  /** Custom CSS class name */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
}

type SortKey = 'signalId' | 'mean' | 'p95' | 'p99' | 'sampleCount' | 'max';
type SortOrder = 'asc' | 'desc';

// ============================================================================
// Main Component
// ============================================================================

/**
 * Performance Tab Component
 * 
 * Displays performance profiler data with real-time updates
 * 
 * @example
 * ```tsx
 * <PerformanceTab refreshInterval={1000} showDetails={true} />
 * ```
 */
export const PerformanceTab: React.FC<PerformanceTabProps> = ({
  refreshInterval = 1000,
  maxBatchRecords = 20,
  showDetails = true,
  className = '',
  style = {},
}) => {
  // State
  const [profilerData, setProfilerData] = useState<ProfilerData | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('mean');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isEnabled, setIsEnabled] = useState(isProfilerEnabled());

  // Fetch profiler data
  const fetchData = () => {
    const data = getProfilerData();
    setProfilerData(data);
  };

  // Auto-refresh effect
  useEffect(() => {
    if (refreshInterval > 0) {
      const timer = setInterval(fetchData, refreshInterval);
      return () => clearInterval(timer);
    }
  }, [refreshInterval]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Handle enable/disable
  const handleToggleProfiler = () => {
    if (isEnabled) {
      disableProfiler();
    } else {
      enableProfiler();
    }
    setIsEnabled(!isEnabled);
    fetchData();
  };

  // Handle reset
  const handleReset = () => {
    resetProfiler();
    fetchData();
  };

  // Handle export
  const handleExport = () => {
    if (!profilerData) return;
    
    const json = JSON.stringify(profilerData, (key, value) => {
      // Convert Map to Object for JSON serialization
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

  // Sort signal stats
  const sortedSignalStats = useMemo(() => {
    if (!profilerData) return [];
    
    const stats = Array.from(profilerData.signalStats.values());
    return stats.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [profilerData, sortKey, sortOrder]);

  // Handle sort
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  if (!profilerData) {
    return (
      <div className={`performance-tab ${className}`} style={{ padding: '20px', ...style }}>
        <p>Loading profiler data...</p>
      </div>
    );
  }

  return (
    <div className={`performance-tab ${className}`} style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', ...style }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Performance Profiler</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleToggleProfiler} style={buttonStyle}>
            {isEnabled ? '⏸️ Pause' : '▶️ Start'}
          </button>
          <button onClick={handleReset} style={buttonStyle}>
            🔄 Reset
          </button>
          <button onClick={handleExport} style={buttonStyle}>
            📥 Export
          </button>
          <button onClick={fetchData} style={buttonStyle}>
            ⟳ Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <SummaryCard
          title="Total Signals"
          value={profilerData.totalSignals}
          icon="📊"
        />
        <SummaryCard
          title="Total Samples"
          value={profilerData.totalSamples}
          icon="📈"
        />
        <SummaryCard
          title="Total Batches"
          value={profilerData.batchStats.totalBatches}
          icon="🔀"
        />
        <SummaryCard
          title="Avg Batch Duration"
          value={`${profilerData.batchStats.avgDuration.toFixed(2)}ms`}
          icon="⏱️"
        />
        <SummaryCard
          title="Session Duration"
          value={`${(profilerData.duration / 1000).toFixed(1)}s`}
          icon="⏳"
        />
        <SummaryCard
          title="Status"
          value={isEnabled ? 'Running' : 'Paused'}
          icon={isEnabled ? '✅' : '⏸️'}
        />
      </div>

      {/* Latency Stats Table */}
      <section style={{ marginBottom: '30px' }}>
        <h3>Signal Latency Statistics</h3>
        {sortedSignalStats.length === 0 ? (
          <p style={{ color: '#666' }}>No signals profiled yet. Start using signals to see data.</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle} onClick={() => handleSort('signalId')}>
                  Signal ID {sortKey === 'signalId' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={thStyle}>Type</th>
                <th style={thStyle} onClick={() => handleSort('sampleCount')}>
                  Samples {sortKey === 'sampleCount' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={thStyle} onClick={() => handleSort('mean')}>
                  Mean {sortKey === 'mean' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={thStyle}>Median</th>
                <th style={thStyle} onClick={() => handleSort('p95')}>
                  P95 {sortKey === 'p95' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={thStyle} onClick={() => handleSort('p99')}>
                  P99 {sortKey === 'p99' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={thStyle} onClick={() => handleSort('max')}>
                  Max {sortKey === 'max' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={thStyle}>Skipped</th>
              </tr>
            </thead>
            <tbody>
              {sortedSignalStats.map((stats) => (
                <tr
                  key={stats.signalId}
                  style={{
                    backgroundColor: selectedSignal === stats.signalId ? '#e3f2fd' : 'transparent',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedSignal(stats.signalId)}
                >
                  <td style={tdStyle}>{stats.signalId}</td>
                  <td style={tdStyle}>{stats.type}</td>
                  <td style={tdStyle}>{stats.sampleCount}</td>
                  <td style={tdStyle}>{stats.mean.toFixed(2)}ms</td>
                  <td style={tdStyle}>{stats.median.toFixed(2)}ms</td>
                  <td style={tdStyle}>{stats.p95.toFixed(2)}ms</td>
                  <td style={tdStyle}>{stats.p99.toFixed(2)}ms</td>
                  <td style={tdStyle}>{stats.max.toFixed(2)}ms</td>
                  <td style={tdStyle}>{stats.skippedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Batch Timing Records */}
      {profilerData.batchRecords.length > 0 && (
        <section style={{ marginBottom: '30px' }}>
          <h3>Recent Batch Operations</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Batch ID</th>
                <th style={thStyle}>Duration</th>
                <th style={thStyle}>Operations</th>
                <th style={thStyle}>Signals Affected</th>
                <th style={thStyle}>Depth</th>
              </tr>
            </thead>
            <tbody>
              {profilerData.batchRecords.slice(-maxBatchRecords).map((record) => (
                <tr key={record.batchId}>
                  <td style={tdStyle}>#{record.batchId}</td>
                  <td style={tdStyle}>{record.duration.toFixed(2)}ms</td>
                  <td style={tdStyle}>{record.operationCount}</td>
                  <td style={tdStyle}>{record.affectedSignals.length}</td>
                  <td style={tdStyle}>{record.depth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Selected Signal Details */}
      {showDetails && selectedSignal && (
        <section style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Signal Details: {selectedSignal}</h3>
          {(() => {
            const stats = profilerData.signalStats.get(selectedSignal);
            if (!stats) return null;
            
            return (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><strong>Type:</strong> {stats.type}</div>
                <div><strong>Sample Count:</strong> {stats.sampleCount}</div>
                <div><strong>Min Latency:</strong> {stats.min.toFixed(2)}ms</div>
                <div><strong>Max Latency:</strong> {stats.max.toFixed(2)}ms</div>
                <div><strong>Mean Latency:</strong> {stats.mean.toFixed(2)}ms</div>
                <div><strong>Median Latency:</strong> {stats.median.toFixed(2)}ms</div>
                <div><strong>P95 Latency:</strong> {stats.p95.toFixed(2)}ms</div>
                <div><strong>P99 Latency:</strong> {stats.p99.toFixed(2)}ms</div>
                <div><strong>Std Deviation:</strong> {stats.stdDev.toFixed(2)}ms</div>
                <div><strong>Avg Subscribers:</strong> {stats.avgSubscribers.toFixed(1)}</div>
                <div><strong>Skipped Updates:</strong> {stats.skippedCount}</div>
                <div><strong>Effective Updates:</strong> {stats.sampleCount - stats.skippedCount}</div>
              </div>
            );
          })()}
          <button 
            onClick={() => setSelectedSignal(null)} 
            style={{ ...buttonStyle, marginTop: '15px' }}
          >
            Close Details
          </button>
        </section>
      )}
    </div>
  );
};

// ============================================================================
// Subcomponents
// ============================================================================

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon }) => (
  <div style={{
    padding: '15px',
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  }}>
    <div style={{ fontSize: '24px', marginBottom: '5px' }}>{icon}</div>
    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>{title}</div>
    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{value}</div>
  </div>
);

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
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: '#fff',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const thStyle: React.CSSProperties = {
  padding: '12px',
  backgroundColor: '#f5f5f5',
  borderBottom: '2px solid #e0e0e0',
  textAlign: 'left',
  fontWeight: 'bold',
  cursor: 'pointer',
  userSelect: 'none',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid #e0e0e0',
};

// ============================================================================
// Default Export
// ============================================================================

export default PerformanceTab;
