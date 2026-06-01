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
  getActivePlugins,
  getPerformanceMetrics,
  clearPerformanceMetrics,
  type SignalMetadata,
  type PerformanceMetric,
  type DevToolsEvent,
} from '../runtime';

// ============================================================================
// Types
// ============================================================================

type TabType = 'signals' | 'graph' | 'timeline' | 'impact' | 'performance' | 'plugins';

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

  tableRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(120px, 1.2fr) 80px 80px 80px minmax(120px, 1fr)',
    gap: '8px',
    alignItems: 'center',
    padding: '8px 10px',
    borderBottom: '1px solid #333',
  },

  timelineItem: (type: string): React.CSSProperties => ({
    padding: '10px 12px',
    backgroundColor: '#252526',
    borderLeft: `3px solid ${type === 'performance-warning' ? '#f44336' : type === 'signal-updated' ? '#4fc3f7' : '#81c784'}`,
    borderRadius: '4px',
    borderTop: '1px solid #3e3e3e',
    borderRight: '1px solid #3e3e3e',
    borderBottom: '1px solid #3e3e3e',
  }),

  pill: (color: string): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 6px',
    borderRadius: '10px',
    backgroundColor: color,
    color: '#fff',
    fontSize: '10px',
    fontWeight: 600,
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
  const [plugins, setPlugins] = useState<ReturnType<typeof getActivePlugins>>([]);

  useEffect(() => {
    if (!isDevToolsEnabled()) return;
    const refresh = () => setPlugins(getActivePlugins());
    refresh();
    const intervalId = window.setInterval(refresh, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  if (!isDevToolsEnabled()) {
    return <div style={styles.emptyState}>Enable DevTools to inspect plugins.</div>;
  }

  if (plugins.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          No registered plugins
        </div>
        <div>Register logger, validation, time-travel, or custom plugins to inspect their hooks.</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {plugins.map((plugin) => (
        <div key={plugin.name} style={styles.metricCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ color: '#4fc3f7' }}>{plugin.name}</strong>
              {plugin.version && <span style={{ color: '#858585', marginLeft: 8 }}>v{plugin.version}</span>}
            </div>
            <span style={styles.pill(plugin.enabled ? '#2d5a2d' : '#5a2d2d')}>{plugin.enabled ? 'enabled' : 'disabled'}</span>
          </div>
          <div style={{ marginTop: 10, color: '#858585' }}>
            Hooks: {plugin.hookCount} | Tracked plugin signals: {plugin.signalCount}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {Object.entries(plugin.stats).map(([hook, enabled]) => (
              <span key={hook} style={styles.pill(enabled ? '#0e639c' : '#3e3e3e')}>{hook}</span>
            ))}
          </div>
        </div>
      ))}
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

const GraphTab: React.FC = () => {
  const [signals, setSignals] = useState<SignalMetadata[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | SignalMetadata['type']>('all');

  useEffect(() => {
    if (!isDevToolsEnabled()) return;
    setSignals(listSignals());
    return onDevToolsEvent('*', () => setSignals(listSignals()));
  }, []);

  const filteredSignals = useMemo(() => filterGraphSignals(signals, query, typeFilter), [signals, query, typeFilter]);
  const layout = useMemo(() => buildGraphLayout(filteredSignals), [filteredSignals]);
  const selected = selectedId ? signals.find((signal) => signal.id === selectedId) : null;

  if (!isDevToolsEnabled() || signals.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>No graph data</div>
        <div>Create signals and computed values to see dependency edges.</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 8 }}>
        <input
          type="text"
          placeholder="Filter graph by name or ID..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          style={{ ...styles.searchInput, marginBottom: 0 }}
        />
        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value as 'all' | SignalMetadata['type'])}
          style={{ ...styles.searchInput, marginBottom: 0 }}
        >
          <option value="all">All types</option>
          <option value="signal">Signals</option>
          <option value="computed">Computed</option>
          <option value="effect">Effects</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '12px', minHeight: 420 }}>
      <div style={{ ...styles.graphContainer, height: 420, overflow: 'hidden' }}>
        <svg width="100%" height="420" viewBox={`0 0 ${layout.width} ${layout.height}`} role="img" aria-label="Signal dependency graph">
          <defs>
            <marker id="signalforge-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L7,3 z" fill="#5f6b73" />
            </marker>
          </defs>
          {layout.edges.map((edge) => (
            <line key={`${edge.from}-${edge.to}`} x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2} stroke="#5f6b73" strokeWidth="1.5" markerEnd="url(#signalforge-arrow)" />
          ))}
          {layout.nodes.map((node) => (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`} onClick={() => setSelectedId(node.id)} style={{ cursor: 'pointer' }}>
              <rect width="150" height="58" rx="6" fill={nodeColor(node.type)} stroke={selectedId === node.id ? '#ffffff' : '#3e3e3e'} strokeWidth={selectedId === node.id ? 2 : 1} />
              <text x="10" y="22" fill="#ffffff" fontSize="11" fontWeight="600">{shortLabel(node.label)}</text>
              <text x="10" y="40" fill="#d4d4d4" fontSize="10">{node.type} | {node.updateCount} updates</text>
            </g>
          ))}
        </svg>
      </div>

      <aside style={{ ...styles.metricCard, minHeight: 420 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: '13px', fontWeight: 600 }}>Inspect</div>
          <span style={{ color: '#858585', fontSize: 11 }}>{filteredSignals.length}/{signals.length}</span>
        </div>
        {selected ? (
          <>
            <div style={styles.signalName}>{selected.name || selected.id}</div>
            <div style={{ marginTop: 8 }}><span style={styles.signalType(selected.type)}>{selected.type}</span></div>
            <div style={{ marginTop: 12, color: '#858585' }}>Dependencies: {selected.dependencies.length}</div>
            <div style={{ marginTop: 4, color: '#858585' }}>Subscribers: {selected.subscribers.length}</div>
            <div style={{ marginTop: 4, color: '#858585' }}>Updates: {selected.updateCount}</div>
            <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap', color: '#ce9178', fontSize: 11 }}>{formatValue(selected.value)}</pre>
          </>
        ) : (
          <div style={{ color: '#858585' }}>Select a node to inspect dependencies, subscribers, and current value.</div>
        )}
      </aside>
      </div>
    </div>
  );
};

const TimelineTab: React.FC<{ events: DevToolsEvent[] }> = ({ events }) => {
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
    return (
      <div style={styles.emptyState}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>No timeline events</div>
        <div>Create or update signals to stream lifecycle events here.</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} style={{ ...styles.searchInput, marginBottom: 0 }}>
          <option value="all">All events</option>
          {eventTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#cccccc' }}>
          <input type="checkbox" checked={grouped} onChange={(event) => setGrouped(event.target.checked)} />
          Group
        </label>
      </div>

      {grouped ? groups.map((group) => (
        <section key={group.key} style={{ display: 'grid', gap: 6 }}>
          <div style={{ color: '#858585', fontSize: 11, fontWeight: 600 }}>{group.label} | {group.events.length} events</div>
          {group.events.map((event) => <TimelineEventRow key={event.sequence} event={event} />)}
        </section>
      )) : visibleEvents.map((event) => <TimelineEventRow key={event.sequence} event={event} />)}
    </div>
  );
};

const TimelineEventRow: React.FC<{ event: DevToolsEvent }> = ({ event }) => (
  <div style={styles.timelineItem(event.type)}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <strong style={{ color: '#cccccc' }}>{event.type}</strong>
      <span style={{ color: '#858585' }}>{new Date(event.timestamp).toLocaleTimeString()}</span>
    </div>
    <div style={{ marginTop: 6, color: '#858585' }}>{formatTimelinePayload(event)}</div>
  </div>
);

const RenderImpactTab: React.FC = () => {
  const [signals, setSignals] = useState<SignalMetadata[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    if (!isDevToolsEnabled()) return;
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
    return (
      <div style={styles.emptyState}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>No render impact data</div>
        <div>Update tracked signals to identify high fan-out or slow nodes.</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ ...styles.tableRow, color: '#858585', fontWeight: 600 }}>
        <span>Signal</span><span>Type</span><span>Fan-out</span><span>Updates</span><span>Impact</span>
      </div>
      {rows.map(({ signal, fanout, maxDuration, impactScore }) => (
        <div key={signal.id} style={styles.tableRow}>
          <span style={{ color: '#4fc3f7', overflow: 'hidden', textOverflow: 'ellipsis' }}>{signal.name || signal.id}</span>
          <span style={styles.signalType(signal.type)}>{signal.type}</span>
          <span>{fanout}</span>
          <span>{signal.updateCount}</span>
          <span>
            <span style={styles.pill(impactScore > 50 || maxDuration > 16 ? '#c72e2e' : impactScore > 10 ? '#9c6b0e' : '#2d5a2d')}>{impactScore}</span>
            <span style={{ marginLeft: 8, color: '#858585' }}>max {maxDuration.toFixed(3)}ms</span>
          </span>
        </div>
      ))}
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
  const [timelineEvents, setTimelineEvents] = useState<DevToolsEvent[]>([]);
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

  useEffect(() => {
    if (!isDevToolsEnabled()) return;
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
              onClick={() => setActiveTab('graph')}
              style={styles.tab(activeTab === 'graph')}
            >
              Graph
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              style={styles.tab(activeTab === 'timeline')}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('impact')}
              style={styles.tab(activeTab === 'impact')}
            >
              Impact
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
            {activeTab === 'graph' && <GraphTab />}
            {activeTab === 'timeline' && <TimelineTab events={timelineEvents} />}
            {activeTab === 'impact' && <RenderImpactTab />}
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

interface GraphLayoutNode {
  id: string;
  label: string;
  type: SignalMetadata['type'];
  updateCount: number;
  x: number;
  y: number;
}

export function buildGraphLayout(signals: SignalMetadata[]): {
  width: number;
  height: number;
  nodes: GraphLayoutNode[];
  edges: Array<{ from: string; to: string; x1: number; y1: number; x2: number; y2: number }>;
} {
  const depthById = new Map<string, number>();
  const signalById = new Map(signals.map((signal) => [signal.id, signal]));

  const getDepth = (signal: SignalMetadata, seen = new Set<string>()): number => {
    if (depthById.has(signal.id)) return depthById.get(signal.id)!;
    if (seen.has(signal.id) || signal.dependencies.length === 0) {
      depthById.set(signal.id, 0);
      return 0;
    }

    seen.add(signal.id);
    const depth = 1 + Math.max(
      0,
      ...signal.dependencies
        .map((id) => signalById.get(id))
        .filter((dependency): dependency is SignalMetadata => Boolean(dependency))
        .map((dependency) => getDepth(dependency, seen))
    );
    depthById.set(signal.id, depth);
    return depth;
  };

  for (const signal of signals) getDepth(signal);

  const columns = new Map<number, SignalMetadata[]>();
  for (const signal of signals) {
    const depth = depthById.get(signal.id) || 0;
    const column = columns.get(depth) || [];
    column.push(signal);
    columns.set(depth, column);
  }

  const nodes: GraphLayoutNode[] = [];
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
    if (!target) return [];

    return signal.dependencies
      .map((dependencyId) => {
        const source = nodeById.get(dependencyId);
        if (!source) return null;
        return {
          from: dependencyId,
          to: signal.id,
          x1: source.x + 150,
          y1: source.y + 29,
          x2: target.x,
          y2: target.y + 29,
        };
      })
      .filter((edge): edge is { from: string; to: string; x1: number; y1: number; x2: number; y2: number } => Boolean(edge));
  });

  const maxX = Math.max(600, ...nodes.map((node) => node.x + 190));
  const maxY = Math.max(420, ...nodes.map((node) => node.y + 90));

  return { width: maxX, height: maxY, nodes, edges };
}

export function filterGraphSignals(
  signals: SignalMetadata[],
  query: string,
  typeFilter: 'all' | SignalMetadata['type'],
): SignalMetadata[] {
  const normalized = query.trim().toLowerCase();
  const directMatches = new Set<string>();

  for (const signal of signals) {
    const typeMatches = typeFilter === 'all' || signal.type === typeFilter;
    const queryMatches = !normalized
      || signal.id.toLowerCase().includes(normalized)
      || signal.name?.toLowerCase().includes(normalized);

    if (typeMatches && queryMatches) {
      directMatches.add(signal.id);
    }
  }

  if (!normalized && typeFilter === 'all') return signals;

  const idsToKeep = new Set(directMatches);
  const signalById = new Map(signals.map((signal) => [signal.id, signal]));

  for (const id of directMatches) {
    const signal = signalById.get(id);
    if (!signal) continue;

    for (const dependency of signal.dependencies) idsToKeep.add(dependency);
    for (const subscriber of signal.subscribers) idsToKeep.add(subscriber);
  }

  return signals.filter((signal) => idsToKeep.has(signal.id));
}

function nodeColor(type: SignalMetadata['type']): string {
  if (type === 'computed') return '#5a4d2d';
  if (type === 'effect') return '#4d2d5a';
  return '#2d5a2d';
}

function shortLabel(label: string): string {
  return label.length > 18 ? `${label.slice(0, 15)}...` : label;
}

function formatTimelinePayload(event: DevToolsEvent): string {
  const payload: any = event.payload || {};
  if (payload.id) return payload.id;
  if (payload.signalId) return `${payload.signalId} ${payload.duration ? `${payload.duration.toFixed(3)}ms` : ''}`;
  if (payload.subscriberId && payload.dependencyId) {
    return `${payload.subscriberId} -> ${payload.dependencyId}`;
  }
  return JSON.stringify(payload).slice(0, 160);
}

export function groupTimelineEvents(events: DevToolsEvent[]): Array<{
  key: string;
  label: string;
  events: DevToolsEvent[];
}> {
  const groups = new Map<string, DevToolsEvent[]>();

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

// ============================================================================
// Exports
// ============================================================================

export default DevToolsPanel;
