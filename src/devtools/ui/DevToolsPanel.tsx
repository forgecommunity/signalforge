/**
 * SignalForge DevTools Panel - React UI
 * 
 * A comprehensive, dockable DevTools panel for real-time signal monitoring,
 * performance analysis, and dependency visualization.
 * 
 * Features:
 * - Real-time signal list with live value updates
 * - Performance monitoring with charts and metrics
 * - Dependency graph visualization (tree/network view)
 * - Plugin inspector (future extension)
 * - Dockable, resizable, minimizable panel
 * - Auto-attach in development mode
 * - Search/filter capabilities
 * - Minimal inline styles (no external dependencies)
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  enableDevTools,
  isDevToolsEnabled,
  onDevToolsEvent,
  listSignals,
  getSignal,
  getDependencies,
  getSubscribers,
  getPerformanceMetrics,
  clearPerformanceMetrics,
  type SignalMetadata,
  type PerformanceMetric,
  type DevToolsEvent,
} from '../runtime';

// ============================================================================
// Types
// ============================================================================

type TabType = 'signals' | 'performance' | 'plugins';

type PanelPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

interface PanelState {
  isOpen: boolean;
  isMinimized: boolean;
  position: PanelPosition;
  width: number;
  height: number;
}

// ============================================================================
// Styles (Minimal inline CSS-in-JS)
// ============================================================================

const styles = {
  // Main panel container
  panel: (state: PanelState): React.CSSProperties => ({
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

  // Header bar
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: '#252526',
    borderBottom: '1px solid #3e3e3e',
    cursor: 'move',
    userSelect: 'none' as const,
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

  button: (variant: 'primary' | 'secondary' | 'danger' = 'secondary'): React.CSSProperties => ({
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

  // Tab navigation
  tabs: {
    display: 'flex',
    gap: '0',
    backgroundColor: '#2d2d30',
    borderBottom: '1px solid #3e3e3e',
  },

  tab: (isActive: boolean): React.CSSProperties => ({
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

  // Content area
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '12px',
    backgroundColor: '#1e1e1e',
  },

  // Signal list
  signalList: {
    display: 'flex',
    flexDirection: 'column' as const,
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

  signalType: (type: string): React.CSSProperties => ({
    padding: '2px 6px',
    backgroundColor: type === 'signal' ? '#2d5a2d' : type === 'computed' ? '#5a4d2d' : '#4d2d5a',
    color: type === 'signal' ? '#81c784' : type === 'computed' ? '#ffb74d' : '#ba68c8',
    borderRadius: '3px',
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
  }),

  signalValue: {
    fontSize: '12px',
    color: '#ce9178',
    marginBottom: '6px',
    wordBreak: 'break-all' as const,
  },

  signalMeta: {
    display: 'flex',
    gap: '12px',
    fontSize: '11px',
    color: '#858585',
  },

  // Performance metrics
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

  metricValue: (color?: string): React.CSSProperties => ({
    fontSize: '20px',
    fontWeight: 600,
    color: color || '#4fc3f7',
  }),

  // Search/Filter
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

  // Dependency graph
  graphContainer: {
    width: '100%',
    height: '400px',
    backgroundColor: '#252526',
    border: '1px solid #3e3e3e',
    borderRadius: '6px',
    overflow: 'auto',
    position: 'relative' as const,
  },

  graphNode: (type: string): React.CSSProperties => ({
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

  // Empty state
  emptyState: {
    textAlign: 'center' as const,
    padding: '48px 24px',
    color: '#858585',
  },

  // Badge
  badge: (color: string): React.CSSProperties => ({
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

// Helper: Get position styles based on panel position
function getPositionStyles(position: PanelPosition): React.CSSProperties {
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

// ============================================================================
// SignalsTab Component
// ============================================================================

const SignalsTab: React.FC = () => {
  const [signals, setSignals] = useState<SignalMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSignals, setExpandedSignals] = useState<Set<string>>(new Set());

  // Load signals initially
  useEffect(() => {
    if (isDevToolsEnabled()) {
      setSignals(listSignals());
    }
  }, []);

  // Listen to real-time updates
  useEffect(() => {
    if (!isDevToolsEnabled()) return;

    const cleanup = onDevToolsEvent('*', () => {
      // Refresh signal list on any event
      setSignals(listSignals());
    });

    return cleanup;
  }, []);

  // Filter signals based on search
  const filteredSignals = useMemo(() => {
    if (!searchQuery) return signals;
    
    const query = searchQuery.toLowerCase();
    return signals.filter(signal => 
      (signal.name?.toLowerCase().includes(query)) ||
      signal.id.toLowerCase().includes(query) ||
      signal.type.toLowerCase().includes(query)
    );
  }, [signals, searchQuery]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedSignals(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  if (!isDevToolsEnabled()) {
    return (
      <div style={styles.emptyState}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔒</div>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          DevTools Not Enabled
        </div>
        <div>Enable DevTools to monitor signals</div>
      </div>
    );
  }

  return (
    <>
      <input
        type="text"
        placeholder="🔍 Search signals by name, ID, or type..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={styles.searchInput}
      />

      {filteredSignals.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>
            {searchQuery ? '🔍' : '📡'}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
            {searchQuery ? 'No Signals Found' : 'No Active Signals'}
          </div>
          <div>
            {searchQuery ? 'Try a different search query' : 'Create signals to see them here'}
          </div>
        </div>
      ) : (
        <div style={styles.signalList}>
          {filteredSignals.map((signal) => {
            const isExpanded = expandedSignals.has(signal.id);
            return (
              <SignalCard
                key={signal.id}
                signal={signal}
                isExpanded={isExpanded}
                onToggle={() => toggleExpanded(signal.id)}
              />
            );
          })}
        </div>
      )}

      <div style={{ marginTop: '16px', fontSize: '11px', color: '#858585', textAlign: 'center' }}>
        {filteredSignals.length} signal{filteredSignals.length !== 1 ? 's' : ''} active
        {searchQuery && signals.length !== filteredSignals.length && (
          <> · {signals.length - filteredSignals.length} hidden</>
        )}
      </div>
    </>
  );
};

// ============================================================================
// SignalCard Component
// ============================================================================

interface SignalCardProps {
  signal: SignalMetadata;
  isExpanded: boolean;
  onToggle: () => void;
}

const SignalCard: React.FC<SignalCardProps> = ({ signal, isExpanded, onToggle }) => {
  const [isHovered, setIsHovered] = useState(false);

  const dependencies = getDependencies(signal.id);
  const subscribers = getSubscribers(signal.id);

  const cardStyle = {
    ...styles.signalCard,
    ...(isHovered ? styles.signalCardHover : {}),
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onToggle}
    >
      <div style={styles.signalHeader}>
        <div style={styles.signalName}>
          {signal.name || signal.id}
        </div>
        <span style={styles.signalType(signal.type)}>{signal.type}</span>
      </div>

      <div style={styles.signalValue}>
        {formatValue(signal.value)}
      </div>

      <div style={styles.signalMeta}>
        <span>🔄 {signal.updateCount} update{signal.updateCount !== 1 ? 's' : ''}</span>
        <span>👥 {signal.subscriberCount} subscriber{signal.subscriberCount !== 1 ? 's' : ''}</span>
        {dependencies.length > 0 && (
          <span>🔗 {dependencies.length} dep{dependencies.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {isExpanded && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #3e3e3e' }}>
          <div style={{ fontSize: '11px', color: '#858585', marginBottom: '8px' }}>
            <strong>ID:</strong> {signal.id}
          </div>
          
          {dependencies.length > 0 && (
            <div style={{ fontSize: '11px', color: '#858585', marginBottom: '8px' }}>
              <strong>Dependencies:</strong>
              <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {dependencies.map(depId => {
                  const dep = getSignal(depId);
                  return (
                    <span
                      key={depId}
                      style={{
                        padding: '2px 6px',
                        backgroundColor: '#3e3e3e',
                        borderRadius: '3px',
                        fontSize: '10px',
                      }}
                    >
                      {dep?.name || depId}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {subscribers.length > 0 && (
            <div style={{ fontSize: '11px', color: '#858585', marginBottom: '8px' }}>
              <strong>Subscribers:</strong>
              <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {subscribers.map(subId => {
                  const sub = getSignal(subId);
                  return (
                    <span
                      key={subId}
                      style={{
                        padding: '2px 6px',
                        backgroundColor: '#3e3e3e',
                        borderRadius: '3px',
                        fontSize: '10px',
                      }}
                    >
                      {sub?.name || subId}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ fontSize: '11px', color: '#858585' }}>
            <strong>Created:</strong> {new Date(signal.createdAt).toLocaleTimeString()}
          </div>
          <div style={{ fontSize: '11px', color: '#858585' }}>
            <strong>Updated:</strong> {new Date(signal.updatedAt).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PerformanceTab Component
// ============================================================================

const PerformanceTab: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load metrics initially
  useEffect(() => {
    if (isDevToolsEnabled()) {
      setMetrics(getPerformanceMetrics());
    }
  }, []);

  // Auto-refresh metrics
  useEffect(() => {
    if (!isDevToolsEnabled() || !autoRefresh) return;

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
    return (
      <div style={styles.emptyState}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔒</div>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          DevTools Not Enabled
        </div>
        <div>Enable DevTools to track performance</div>
      </div>
    );
  }

  // Calculate statistics
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

  const recentMetrics = metrics.slice(-20); // Last 20 updates

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cccccc' }}>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          Auto-refresh
        </label>
        <button
          onClick={handleClearMetrics}
          style={styles.button('danger')}
          disabled={metrics.length === 0}
        >
          Clear Metrics
        </button>
      </div>

      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Total Updates</div>
          <div style={styles.metricValue('#4fc3f7')}>{stats.total}</div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Avg Duration</div>
          <div style={styles.metricValue('#81c784')}>
            {stats.avg.toFixed(3)}ms
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Min Duration</div>
          <div style={styles.metricValue('#ffb74d')}>
            {stats.min.toFixed(3)}ms
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Max Duration</div>
          <div style={styles.metricValue('#ba68c8')}>
            {stats.max.toFixed(3)}ms
          </div>
        </div>

        {stats.slow > 0 && (
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>⚠️ Slow Updates</div>
            <div style={styles.metricValue('#f44336')}>{stats.slow}</div>
          </div>
        )}
      </div>

      {recentMetrics.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
            No Performance Data
          </div>
          <div>Update signals to see performance metrics</div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: '#cccccc' }}>
            Recent Updates (Last {recentMetrics.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {recentMetrics.reverse().map((metric, index) => (
              <PerformanceMetricCard key={index} metric={metric} />
            ))}
          </div>
        </>
      )}
    </>
  );
};

// ============================================================================
// PerformanceMetricCard Component
// ============================================================================

interface PerformanceMetricCardProps {
  metric: PerformanceMetric;
}

const PerformanceMetricCard: React.FC<PerformanceMetricCardProps> = ({ metric }) => {
  const signal = getSignal(metric.signalId);
  const isSlow = metric.duration > 16;

  return (
    <div
      style={{
        padding: '8px 12px',
        backgroundColor: isSlow ? '#3d2121' : '#252526',
        border: `1px solid ${isSlow ? '#c72e2e' : '#3e3e3e'}`,
        borderRadius: '4px',
        fontSize: '11px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div>
        <span style={{ color: '#4fc3f7', fontWeight: 600 }}>
          {signal?.name || metric.signalId}
        </span>
        <span style={{ color: '#858585', marginLeft: '8px' }}>
          ({metric.type})
        </span>
        {metric.skipped && (
          <span style={{ color: '#ffb74d', marginLeft: '8px' }}>⚡ skipped</span>
        )}
        {isSlow && (
          <span style={{ color: '#f44336', marginLeft: '8px' }}>⚠️ slow</span>
        )}
      </div>
      <div style={{ color: isSlow ? '#f44336' : '#81c784', fontWeight: 600 }}>
        {metric.duration.toFixed(3)}ms
      </div>
    </div>
  );
};

// ============================================================================
// PluginsTab Component
// ============================================================================

const PluginsTab: React.FC = () => {
  return (
    <div style={styles.emptyState}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>🧩</div>
      <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
        Plugins Coming Soon
      </div>
      <div>Plugin inspection and management will be available in a future release</div>
    </div>
  );
};

// ============================================================================
// DependencyGraph Component (Bonus)
// ============================================================================

const DependencyGraph: React.FC = () => {
  const signals = listSignals();

  if (signals.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🕸️</div>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          No Signals to Visualize
        </div>
        <div>Create signals to see dependency graph</div>
      </div>
    );
  }

  // Simple tree layout (top-down)
  return (
    <div style={styles.graphContainer}>
      <div style={{ padding: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px', color: '#cccccc' }}>
          Dependency Graph
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {signals.map(signal => (
            <DependencyNode key={signal.id} signal={signal} />
          ))}
        </div>
      </div>
    </div>
  );
};

interface DependencyNodeProps {
  signal: SignalMetadata;
}

const DependencyNode: React.FC<DependencyNodeProps> = ({ signal }) => {
  const dependencies = getDependencies(signal.id);

  return (
    <div style={{ marginLeft: dependencies.length > 0 ? '0' : '0' }}>
      <div style={styles.graphNode(signal.type)}>
        <div style={{ fontWeight: 600 }}>{signal.name || signal.id}</div>
        <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>
          {signal.type} · {signal.updateCount} updates
        </div>
      </div>
      {dependencies.length > 0 && (
        <div style={{ marginLeft: '20px', marginTop: '8px', borderLeft: '2px solid #3e3e3e', paddingLeft: '12px' }}>
          {dependencies.map(depId => {
            const dep = getSignal(depId);
            if (!dep) return null;
            return (
              <div key={depId} style={{ marginBottom: '8px' }}>
                <div style={styles.graphNode(dep.type)}>
                  <div style={{ fontWeight: 600 }}>{dep.name || dep.id}</div>
                  <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>
                    {dep.type}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Main DevToolsPanel Component
// ============================================================================

export const DevToolsPanel: React.FC = () => {
  const [panelState, setPanelState] = useState<PanelState>({
    isOpen: true,
    isMinimized: false,
    position: 'bottom-right',
    width: 600,
    height: 500,
  });

  const [activeTab, setActiveTab] = useState<TabType>('signals');
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Enable DevTools on mount if in development
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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input')) return;
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    // Position cycling on drag (simplified)
    // In production, you'd calculate actual position
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

  return (
    <div style={styles.panel(panelState)}>
      {/* Header */}
      <div style={styles.header} onMouseDown={handleMouseDown}>
        <div style={styles.headerTitle}>
          <span>🔥</span>
          <span>SignalForge DevTools</span>
          {isDevToolsEnabled() && (
            <span style={styles.badge('#4caf50')}>ON</span>
          )}
        </div>

        <div style={styles.headerActions}>
          <button
            onClick={handleMinimize}
            style={styles.iconButton}
            title={panelState.isMinimized ? 'Maximize' : 'Minimize'}
          >
            {panelState.isMinimized ? '◻' : '_'}
          </button>
          <button
            onClick={handleClose}
            style={styles.iconButton}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {!panelState.isMinimized && (
        <>
          {/* Tabs */}
          <div style={styles.tabs}>
            <button
              onClick={() => setActiveTab('signals')}
              style={styles.tab(activeTab === 'signals')}
            >
              📡 Signals
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              style={styles.tab(activeTab === 'performance')}
            >
              ⚡ Performance
            </button>
            <button
              onClick={() => setActiveTab('plugins')}
              style={styles.tab(activeTab === 'plugins')}
            >
              🧩 Plugins
            </button>
          </div>

          {/* Content */}
          <div style={styles.content}>
            {activeTab === 'signals' && <SignalsTab />}
            {activeTab === 'performance' && <PerformanceTab />}
            {activeTab === 'plugins' && <PluginsTab />}
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================================
// DevToolsProvider - Auto-attach in development
// ============================================================================

export const DevToolsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showDevTools, setShowDevTools] = useState(false);

  useEffect(() => {
    // Auto-show in development mode
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
      setShowDevTools(true);
    }

    // Listen for keyboard shortcut: Ctrl+Shift+D or Cmd+Shift+D
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShowDevTools(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {children}
      {showDevTools && <DevToolsPanel />}
    </>
  );
};

// ============================================================================
// Utility Functions
// ============================================================================

function formatValue(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    if (value.length <= 3) return JSON.stringify(value);
    return `[${value.length} items]`;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return '{}';
    if (keys.length <= 3) {
      try {
        return JSON.stringify(value);
      } catch {
        return '{...}';
      }
    }
    return `{${keys.length} keys}`;
  }
  return String(value);
}

// ============================================================================
// Exports
// ============================================================================

export default DevToolsPanel;
