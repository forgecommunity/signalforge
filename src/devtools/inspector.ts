/**
 * SignalForge DevTools Inspector
 * 
 * Internal developer tools for inspecting and debugging reactive signals.
 * Provides tracking, dependency graph visualization, and performance monitoring.
 * 
 * Features:
 * - Track all active signals with unique IDs
 * - Monitor dependency graphs (computed relationships)
 * - Performance logging for each signal update
 * - Integration hooks for React Native Flipper and web console
 * - Development-only mode via __DEVTOOLS__ flag
 * 
 * @example
 * ```ts
 * import { enableDevTools, listSignals, getSignal } from 'signalforge/devtools';
 * 
 * // Enable in development
 * if (__DEV__) {
 *   enableDevTools();
 * }
 * 
 * // Inspect signals
 * console.log(listSignals());
 * console.log(getSignal('signal_1'));
 * ```
 */

import type { Signal, ComputedSignal } from '../core/store';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * DevTools configuration
 */
export interface DevToolsConfig {
  /** Enable the inspector */
  enabled: boolean;
  /** Track performance metrics */
  trackPerformance: boolean;
  /** Log updates to console */
  logToConsole: boolean;
  /** Maximum number of performance samples to keep */
  maxPerformanceSamples: number;
  /** Flipper plugin integration */
  flipperEnabled: boolean;
}

/**
 * Signal metadata tracked by inspector
 */
export interface SignalMetadata {
  /** Unique signal identifier */
  id: string;
  /** Signal type: 'signal' | 'computed' | 'effect' */
  type: 'signal' | 'computed' | 'effect';
  /** Current value (JSON-safe) */
  value: any;
  /** Number of active subscribers */
  subscriberCount: number;
  /** IDs of signals this one depends on (for computed) */
  dependencies: string[];
  /** IDs of signals that depend on this one */
  subscribers: string[];
  /** Creation timestamp */
  createdAt: number;
  /** Last update timestamp */
  updatedAt: number;
  /** Number of times this signal has been updated */
  updateCount: number;
  /** Stack trace of where signal was created (if available) */
  creationStack?: string;
}

/**
 * Performance measurement for a signal update
 */
export interface PerformanceMetric {
  /** Signal ID */
  signalId: string;
  /** Signal type */
  type: 'signal' | 'computed' | 'effect';
  /** Timestamp of update start */
  timestamp: number;
  /** Execution time in milliseconds */
  duration: number;
  /** Whether this was a cached/skipped update */
  skipped: boolean;
  /** Previous value (for debugging) */
  previousValue?: any;
  /** New value (for debugging) */
  newValue?: any;
}

/**
 * Dependency graph node
 */
export interface DependencyNode {
  /** Signal ID */
  id: string;
  /** Signal type */
  type: 'signal' | 'computed' | 'effect';
  /** Direct dependencies */
  dependencies: string[];
  /** Direct subscribers */
  subscribers: string[];
  /** Depth in dependency tree (0 = root signal) */
  depth: number;
}

// ============================================================================
// Global State
// ============================================================================

/**
 * Global flag to enable/disable DevTools
 * Set via environment or manually with enableDevTools()
 */
export let __DEVTOOLS__ = false;

/**
 * DevTools configuration
 */
const config: DevToolsConfig = {
  enabled: false,
  trackPerformance: true,
  logToConsole: false,
  maxPerformanceSamples: 1000,
  flipperEnabled: false,
};

/**
 * Registry of all tracked signals
 * Map: signalId -> SignalMetadata
 */
const signalRegistry = new Map<string, SignalMetadata>();

/**
 * Map: Signal object -> signalId
 * Allows reverse lookup from signal instance to ID
 */
const signalToIdMap = new WeakMap<Signal<any>, string>();

/**
 * Performance metrics circular buffer
 */
const performanceMetrics: PerformanceMetric[] = [];

/**
 * Counter for generating unique signal IDs
 */
let signalIdCounter = 0;

/**
 * Flipper connection (if available)
 */
let flipperConnection: any = null;

// ============================================================================
// Core API
// ============================================================================

/**
 * Enable DevTools inspector with optional configuration
 */
export function enableDevTools(options: Partial<DevToolsConfig> = {}): void {
  __DEVTOOLS__ = true;
  Object.assign(config, options);
  config.enabled = true;
  
  if (config.logToConsole) {
    console.log('[SignalForge DevTools] Enabled', config);
  }
  
  // Try to connect to Flipper if enabled
  if (config.flipperEnabled) {
    connectToFlipper();
  }
}

/**
 * Disable DevTools inspector
 */
export function disableDevTools(): void {
  __DEVTOOLS__ = false;
  config.enabled = false;
  
  if (flipperConnection) {
    disconnectFromFlipper();
  }
}

/**
 * Check if DevTools is currently enabled
 */
export function isDevToolsEnabled(): boolean {
  return __DEVTOOLS__ && config.enabled;
}

/**
 * Register a signal with the inspector.
 * Called automatically when signals are created if DevTools is enabled.
 */
export function registerSignal<T>(
  signal: Signal<T>,
  type: 'signal' | 'computed' | 'effect',
  initialValue?: T
): string {
  if (!isDevToolsEnabled()) {
    return '';
  }
  
  const id = `${type}_${++signalIdCounter}`;
  
  // Capture creation stack trace
  let creationStack: string | undefined;
  if (typeof Error !== 'undefined') {
    try {
      throw new Error();
    } catch (e: any) {
      creationStack = e.stack?.split('\n').slice(2, 6).join('\n');
    }
  }
  
  const metadata: SignalMetadata = {
    id,
    type,
    value: safeSerialize(initialValue),
    subscriberCount: 0,
    dependencies: [],
    subscribers: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    updateCount: 0,
    creationStack,
  };
  
  signalRegistry.set(id, metadata);
  signalToIdMap.set(signal, id);
  
  if (config.logToConsole) {
    console.log(`[SignalForge] Registered ${type} "${id}"`, metadata);
  }
  
  sendToFlipper('signalRegistered', metadata);
  
  return id;
}

/**
 * Unregister a signal from the inspector.
 * Called when a signal is destroyed.
 */
export function unregisterSignal<T>(signal: Signal<T>): void {
  if (!isDevToolsEnabled()) {
    return;
  }
  
  const id = signalToIdMap.get(signal);
  if (id) {
    signalRegistry.delete(id);
    signalToIdMap.delete(signal);
    
    if (config.logToConsole) {
      console.log(`[SignalForge] Unregistered signal "${id}"`);
    }
    
    sendToFlipper('signalUnregistered', { id });
  }
}

/**
 * Track a signal update (value change or recomputation).
 * Measures execution time and logs performance metrics.
 */
export function trackUpdate<T>(
  signal: Signal<T>,
  updateFn: () => void,
  previousValue?: T
): void {
  if (!isDevToolsEnabled()) {
    updateFn();
    return;
  }
  
  const id = signalToIdMap.get(signal);
  if (!id) {
    updateFn();
    return;
  }
  
  const metadata = signalRegistry.get(id);
  if (!metadata) {
    updateFn();
    return;
  }
  
  const startTime = performance.now();
  let skipped = false;
  let newValue: T | undefined;
  
  try {
    updateFn();
    newValue = (signal._peek ? signal._peek() : signal.get());
    
    // Check if value actually changed
    skipped = Object.is(previousValue, newValue);
  } catch (error) {
    console.error(`[SignalForge] Error updating signal "${id}"`, error);
    throw error;
  } finally {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Update metadata
    metadata.value = safeSerialize(newValue);
    metadata.updatedAt = Date.now();
    if (!skipped) {
      metadata.updateCount++;
    }
    
    // Track performance
    if (config.trackPerformance) {
      const metric: PerformanceMetric = {
        signalId: id,
        type: metadata.type,
        timestamp: startTime,
        duration,
        skipped,
        previousValue: safeSerialize(previousValue),
        newValue: safeSerialize(newValue),
      };
      
      addPerformanceMetric(metric);
      
      if (config.logToConsole && duration > 16) {
        console.warn(
          `[SignalForge] Slow update detected: "${id}" took ${duration.toFixed(2)}ms`,
          metric
        );
      }
    }
    
    sendToFlipper('signalUpdated', {
      id,
      value: metadata.value,
      duration,
      skipped,
    });
  }
}

/**
 * Track a dependency relationship between signals.
 * Called when a computed signal reads from another signal.
 */
export function trackDependency(
  subscriber: Signal<any>,
  dependency: Signal<any>
): void {
  if (!isDevToolsEnabled()) {
    return;
  }
  
  const subscriberId = signalToIdMap.get(subscriber);
  const dependencyId = signalToIdMap.get(dependency);
  
  if (!subscriberId || !dependencyId) {
    return;
  }
  
  const subscriberMeta = signalRegistry.get(subscriberId);
  const dependencyMeta = signalRegistry.get(dependencyId);
  
  if (!subscriberMeta || !dependencyMeta) {
    return;
  }
  
  // Add to dependency lists if not already present
  if (!subscriberMeta.dependencies.includes(dependencyId)) {
    subscriberMeta.dependencies.push(dependencyId);
  }
  
  if (!dependencyMeta.subscribers.includes(subscriberId)) {
    dependencyMeta.subscribers.push(subscriberId);
  }
  
  dependencyMeta.subscriberCount = dependencyMeta.subscribers.length;
}

/**
 * Remove a dependency relationship between signals.
 */
export function untrackDependency(
  subscriber: Signal<any>,
  dependency: Signal<any>
): void {
  if (!isDevToolsEnabled()) {
    return;
  }
  
  const subscriberId = signalToIdMap.get(subscriber);
  const dependencyId = signalToIdMap.get(dependency);
  
  if (!subscriberId || !dependencyId) {
    return;
  }
  
  const subscriberMeta = signalRegistry.get(subscriberId);
  const dependencyMeta = signalRegistry.get(dependencyId);
  
  if (!subscriberMeta || !dependencyMeta) {
    return;
  }
  
  subscriberMeta.dependencies = subscriberMeta.dependencies.filter(
    id => id !== dependencyId
  );
  
  dependencyMeta.subscribers = dependencyMeta.subscribers.filter(
    id => id !== subscriberId
  );
  
  dependencyMeta.subscriberCount = dependencyMeta.subscribers.length;
}

// ============================================================================
// Query API
// ============================================================================

/**
 * List all registered signals.
 * Returns array of signal metadata sorted by creation time.
 */
export function listSignals(): SignalMetadata[] {
  if (!isDevToolsEnabled()) {
    console.warn('[SignalForge] DevTools is not enabled');
    return [];
  }
  
  return Array.from(signalRegistry.values()).sort(
    (a, b) => a.createdAt - b.createdAt
  );
}

/**
 * Get metadata for a specific signal by ID.
 */
export function getSignal(id: string): SignalMetadata | undefined {
  if (!isDevToolsEnabled()) {
    console.warn('[SignalForge] DevTools is not enabled');
    return undefined;
  }
  
  return signalRegistry.get(id);
}

/**
 * Get all dependencies for a signal (signals it reads from).
 * Returns array of signal IDs.
 */
export function getDependencies(id: string): string[] {
  if (!isDevToolsEnabled()) {
    console.warn('[SignalForge] DevTools is not enabled');
    return [];
  }
  
  const metadata = signalRegistry.get(id);
  return metadata?.dependencies || [];
}

/**
 * Get all subscribers for a signal (signals that depend on it).
 * Returns array of signal IDs.
 */
export function getSubscribers(id: string): string[] {
  if (!isDevToolsEnabled()) {
    console.warn('[SignalForge] DevTools is not enabled');
    return [];
  }
  
  const metadata = signalRegistry.get(id);
  return metadata?.subscribers || [];
}

/**
 * Get the full dependency graph as a tree structure.
 * Useful for visualization in DevTools UI.
 */
export function getDependencyGraph(): DependencyNode[] {
  if (!isDevToolsEnabled()) {
    console.warn('[SignalForge] DevTools is not enabled');
    return [];
  }
  
  const nodes: DependencyNode[] = [];
  const depthMap = new Map<string, number>();
  
  // Calculate depth for each node (BFS from root signals)
  const calculateDepth = (id: string, currentDepth: number = 0): number => {
    const existing = depthMap.get(id);
    if (existing !== undefined) {
      return Math.max(existing, currentDepth);
    }
    
    depthMap.set(id, currentDepth);
    
    const metadata = signalRegistry.get(id);
    if (metadata) {
      for (const subscriberId of metadata.subscribers) {
        calculateDepth(subscriberId, currentDepth + 1);
      }
    }
    
    return currentDepth;
  };
  
  // Start from root signals (those with no dependencies)
  for (const [id, metadata] of signalRegistry) {
    if (metadata.dependencies.length === 0) {
      calculateDepth(id, 0);
    }
  }
  
  // Build node list
  for (const [id, metadata] of signalRegistry) {
    nodes.push({
      id,
      type: metadata.type,
      dependencies: metadata.dependencies,
      subscribers: metadata.subscribers,
      depth: depthMap.get(id) || 0,
    });
  }
  
  return nodes.sort((a, b) => a.depth - b.depth);
}

/**
 * Get all signals of a specific type.
 */
export function getSignalsByType(
  type: 'signal' | 'computed' | 'effect'
): SignalMetadata[] {
  if (!isDevToolsEnabled()) {
    console.warn('[SignalForge] DevTools is not enabled');
    return [];
  }
  
  return Array.from(signalRegistry.values()).filter(
    signal => signal.type === type
  );
}

// ============================================================================
// Performance API
// ============================================================================

/**
 * Get recent performance metrics.
 */
export function getPerformanceMetrics(limit?: number): PerformanceMetric[] {
  if (!isDevToolsEnabled()) {
    console.warn('[SignalForge] DevTools is not enabled');
    return [];
  }
  
  const metrics = [...performanceMetrics];
  return limit ? metrics.slice(-limit) : metrics;
}

/**
 * Get performance summary statistics.
 */
export function getPerformanceSummary(): {
  totalUpdates: number;
  totalDuration: number;
  averageDuration: number;
  slowestUpdate: PerformanceMetric | null;
  updatesByType: Record<string, number>;
} {
  if (!isDevToolsEnabled()) {
    console.warn('[SignalForge] DevTools is not enabled');
    return {
      totalUpdates: 0,
      totalDuration: 0,
      averageDuration: 0,
      slowestUpdate: null,
      updatesByType: {},
    };
  }
  
  let totalDuration = 0;
  let slowestUpdate: PerformanceMetric | null = null;
  const updatesByType: Record<string, number> = {
    signal: 0,
    computed: 0,
    effect: 0,
  };
  
  for (const metric of performanceMetrics) {
    if (!metric.skipped) {
      totalDuration += metric.duration;
      updatesByType[metric.type]++;
      
      if (!slowestUpdate || metric.duration > slowestUpdate.duration) {
        slowestUpdate = metric;
      }
    }
  }
  
  const totalUpdates = performanceMetrics.filter(m => !m.skipped).length;
  const averageDuration = totalUpdates > 0 ? totalDuration / totalUpdates : 0;
  
  return {
    totalUpdates,
    totalDuration,
    averageDuration,
    slowestUpdate,
    updatesByType,
  };
}

/**
 * Clear all performance metrics.
 */
export function clearPerformanceMetrics(): void {
  performanceMetrics.length = 0;
}

// ============================================================================
// Integration Helpers
// ============================================================================

/**
 * Connect to React Native Flipper plugin (if available).
 * This allows viewing signal state in Flipper DevTools.
 */
function connectToFlipper(): void {
  try {
    // Check if we're in React Native environment
    if (typeof global !== 'undefined' && (global as any).__FLIPPER__) {
      const flipper = (global as any).__FLIPPER__;
      
      flipperConnection = flipper.addPlugin({
        getId: () => 'signalforge-inspector',
        onConnect: (connection: any) => {
          console.log('[SignalForge] Connected to Flipper');
          
          // Send initial state
          connection.send('initialState', {
            signals: listSignals(),
            graph: getDependencyGraph(),
            config,
          });
          
          // Handle requests from Flipper
          connection.receive('getSignals', () => {
            connection.send('signals', listSignals());
          });
          
          connection.receive('getGraph', () => {
            connection.send('graph', getDependencyGraph());
          });
          
          connection.receive('getPerformance', () => {
            connection.send('performance', {
              metrics: getPerformanceMetrics(100),
              summary: getPerformanceSummary(),
            });
          });
        },
        onDisconnect: () => {
          console.log('[SignalForge] Disconnected from Flipper');
          flipperConnection = null;
        },
      });
    }
  } catch (error) {
    console.warn('[SignalForge] Failed to connect to Flipper:', error);
  }
}

/**
 * Disconnect from Flipper plugin.
 */
function disconnectFromFlipper(): void {
  if (flipperConnection) {
    try {
      flipperConnection.disconnect();
    } catch (error) {
      console.warn('[SignalForge] Error disconnecting from Flipper:', error);
    }
    flipperConnection = null;
  }
}

/**
 * Send event to Flipper connection (if active).
 */
function sendToFlipper(event: string, data: any): void {
  if (flipperConnection && config.flipperEnabled) {
    try {
      flipperConnection.send(event, data);
    } catch (error) {
      // Silently fail if Flipper is not available
    }
  }
}

/**
 * Create a web console overlay for signal inspection.
 * Useful for debugging in web browsers.
 */
export function createConsoleOverlay(): {
  show: () => void;
  hide: () => void;
  destroy: () => void;
} {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.warn('[SignalForge] Console overlay only available in browser');
    return { show: () => {}, hide: () => {}, destroy: () => {} };
  }
  
  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'signalforge-devtools-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    height: 100vh;
    background: rgba(0, 0, 0, 0.95);
    color: #fff;
    font-family: monospace;
    font-size: 12px;
    padding: 16px;
    overflow-y: auto;
    z-index: 999999;
    display: none;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.5);
  `;
  
  document.body.appendChild(overlay);
  
  // Update overlay content
  const update = () => {
    const signals = listSignals();
    const summary = getPerformanceSummary();
    
    overlay.innerHTML = `
      <h2 style="margin: 0 0 16px 0; color: #61dafb;">SignalForge DevTools</h2>
      
      <div style="margin-bottom: 16px;">
        <h3 style="margin: 0 0 8px 0;">Performance</h3>
        <div>Total Updates: ${summary.totalUpdates}</div>
        <div>Avg Duration: ${summary.averageDuration.toFixed(2)}ms</div>
        <div>Total Time: ${summary.totalDuration.toFixed(2)}ms</div>
      </div>
      
      <div style="margin-bottom: 16px;">
        <h3 style="margin: 0 0 8px 0;">Signals (${signals.length})</h3>
        ${signals.map(s => `
          <div style="margin-bottom: 8px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 4px;">
            <div style="color: #61dafb;">${s.id}</div>
            <div style="color: #999; font-size: 10px;">${s.type}</div>
            <div>Value: ${JSON.stringify(s.value)}</div>
            <div style="font-size: 10px; color: #999;">
              Deps: ${s.dependencies.length} | Subs: ${s.subscriberCount} | Updates: ${s.updateCount}
            </div>
          </div>
        `).join('')}
      </div>
      
      <button
        onclick="document.getElementById('signalforge-devtools-overlay').style.display='none'"
        style="padding: 8px 16px; background: #61dafb; color: #000; border: none; border-radius: 4px; cursor: pointer;"
      >
        Close
      </button>
    `;
  };
  
  // Update every second
  let intervalId: any;
  
  return {
    show: () => {
      overlay.style.display = 'block';
      update();
      intervalId = setInterval(update, 1000);
    },
    hide: () => {
      overlay.style.display = 'none';
      if (intervalId) {
        clearInterval(intervalId);
      }
    },
    destroy: () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      overlay.remove();
    },
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Safely serialize a value for DevTools display.
 * Handles circular references and non-serializable values.
 */
function safeSerialize(value: any): any {
  try {
    // Handle primitives
    if (
      value === null ||
      typeof value === 'undefined' ||
      typeof value === 'boolean' ||
      typeof value === 'number' ||
      typeof value === 'string'
    ) {
      return value;
    }
    
    // Handle functions
    if (typeof value === 'function') {
      return `[Function: ${value.name || 'anonymous'}]`;
    }
    
    // Handle dates
    if (value instanceof Date) {
      return value.toISOString();
    }
    
    // Handle arrays (limit to first 10 items)
    if (Array.isArray(value)) {
      return value.slice(0, 10).map(safeSerialize);
    }
    
    // Handle objects (limit to first 10 keys)
    if (typeof value === 'object') {
      const keys = Object.keys(value).slice(0, 10);
      const result: any = {};
      for (const key of keys) {
        result[key] = safeSerialize(value[key]);
      }
      return result;
    }
    
    return String(value);
  } catch (error) {
    return '[Unserializable]';
  }
}

/**
 * Add a performance metric to the circular buffer.
 */
function addPerformanceMetric(metric: PerformanceMetric): void {
  performanceMetrics.push(metric);
  
  // Keep buffer size under limit
  if (performanceMetrics.length > config.maxPerformanceSamples) {
    performanceMetrics.shift();
  }
}

/**
 * Export snapshot of current DevTools state (for debugging/testing).
 */
export function exportSnapshot(): {
  timestamp: number;
  config: DevToolsConfig;
  signals: SignalMetadata[];
  graph: DependencyNode[];
  performance: {
    metrics: PerformanceMetric[];
    summary: ReturnType<typeof getPerformanceSummary>;
  };
} {
  return {
    timestamp: Date.now(),
    config: { ...config },
    signals: listSignals(),
    graph: getDependencyGraph(),
    performance: {
      metrics: getPerformanceMetrics(),
      summary: getPerformanceSummary(),
    },
  };
}

/**
 * Pretty print the dependency graph to console.
 */
export function printDependencyGraph(): void {
  if (!isDevToolsEnabled()) {
    console.warn('[SignalForge] DevTools is not enabled');
    return;
  }
  
  const graph = getDependencyGraph();
  
  console.group('SignalForge Dependency Graph');
  
  for (const node of graph) {
    const indent = '  '.repeat(node.depth);
    const deps = node.dependencies.length > 0 
      ? ` ← [${node.dependencies.join(', ')}]`
      : '';
    const subs = node.subscribers.length > 0
      ? ` → [${node.subscribers.join(', ')}]`
      : '';
    
    console.log(`${indent}${node.id} (${node.type})${deps}${subs}`);
  }
  
  console.groupEnd();
}
