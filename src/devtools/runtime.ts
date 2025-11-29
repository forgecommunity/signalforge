/**
 * SignalForge DevTools Runtime - Enhanced Internal Inspector
 * 
 * INTERNAL DATA FLOW ARCHITECTURE:
 * ================================
 * 
 * 1. Signal Lifecycle Flow:
 *    Signal Created → registerSignal() → Registry Add → Emit "signal-created"
 *    Signal Updated → trackUpdate() → Metadata Update → Emit "signal-updated"  
 *    Signal Destroyed → unregisterSignal() → Registry Remove → Emit "signal-destroyed"
 * 
 * 2. Event Stream Flow:
 *    DevTools Event → EventEmitter → Listeners (UI, Logger, Flipper)
 *    Each event carries: { type, payload, timestamp }
 * 
 * 3. Dependency Tracking Flow:
 *    Computed reads Signal → trackDependency() → Update Bidirectional Graph
 *    → Forward refs (dependencies) + Backward refs (subscribers)
 * 
 * 4. Performance Monitoring Flow:
 *    Update Start → performance.now() → Execute Update → performance.now()
 *    → Calculate Duration → Store Metric → Check Thresholds → Emit if Slow
 * 
 * 5. Auto-Disable in Production:
 *    Check: process.env.NODE_ENV !== 'production' OR __DEV__ === true
 *    All operations become no-ops when disabled (zero overhead)
 */

import type { Signal, ComputedSignal } from '../core/store';
import { 
  startLatencyMeasurement, 
  endLatencyMeasurement,
  isProfilerEnabled
} from './performanceProfiler';

// ============================================================================
// Event System Types
// ============================================================================

/**
 * DevTools event types for real-time monitoring
 */
export type DevToolsEventType =
  | 'signal-created'
  | 'signal-updated'
  | 'signal-destroyed'
  | 'dependency-added'
  | 'dependency-removed'
  | 'performance-warning'
  | 'batch-started'
  | 'batch-ended';

/**
 * Base event structure for all DevTools events
 */
export interface DevToolsEvent<T = any> {
  /** Event type */
  type: DevToolsEventType;
  /** Event payload (event-specific data) */
  payload: T;
  /** Timestamp when event occurred */
  timestamp: number;
  /** Sequence number for ordering */
  sequence: number;
}

/**
 * Signal created event payload
 */

export interface SignalCreatedPayload {
  id: string;
  type: 'signal' | 'computed' | 'effect';
  initialValue: any;
  name?: string;
  creationStack?: string;
}

/**
 * Signal updated event payload
 */

export interface SignalUpdatedPayload {
  id: string;
  previousValue: any;
  newValue: any;
  duration: number;
  skipped: boolean;
}


/**
 * Signal destroyed event payload
 */

export interface SignalDestroyedPayload {
  id: string;
  type: 'signal' | 'computed' | 'effect';
  finalValue: any;
  lifetime: number; // milliseconds from creation to destruction
}

/**
 * Dependency tracking event payload
 */
export interface DependencyPayload {
  subscriberId: string;
  dependencyId: string;
}

/**
 * Performance warning event payload
 */
export interface PerformanceWarningPayload {
  signalId: string;
  type: 'signal' | 'computed' | 'effect';
  duration: number;
  threshold: number;
  message: string;
}

// ============================================================================
// Event Emitter Implementation
// ============================================================================

/**
 * Event listener function type
 */
type EventListener<T = any> = (event: DevToolsEvent<T>) => void;

/**
 * Simple EventEmitter for DevTools events
 * 
 * INTERNAL DATA FLOW:
 * 1. Listener Registration: on() → Store in listeners Map (keyed by event type)
 * 2. Event Emission: emit() → Lookup listeners → Invoke each with event data
 * 3. Listener Cleanup: off() → Remove from listeners Map
 * 4. Wildcard Support: '*' listeners receive all events
 */
class DevToolsEventEmitter {
  /** Map: event type -> array of listeners */
  private listeners = new Map<string, Set<EventListener>>();
  
  /** Event sequence counter for ordering */
  private sequence = 0;

  /**
   * Register an event listener
   * 
   * @param eventType - Event type to listen for (or '*' for all events)
   * @param listener - Callback function to invoke when event occurs
   * @returns Cleanup function to unregister listener
   */
  on<T = any>(eventType: DevToolsEventType | '*', listener: EventListener<T>): () => void {
    const key = eventType as string;
    
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    this.listeners.get(key)!.add(listener);
    
    // Return cleanup function
    return () => this.off(eventType, listener);
  }

  /**
   * Unregister an event listener
   */
  off<T = any>(eventType: DevToolsEventType | '*', listener: EventListener<T>): void {
    const key = eventType as string;
    const listenerSet = this.listeners.get(key);
    
    if (listenerSet) {
      listenerSet.delete(listener);
      
      // Cleanup empty sets to prevent memory leaks
      if (listenerSet.size === 0) {
        this.listeners.delete(key);
      }
    }
  }

  /**
   * Emit an event to all registered listeners
   * 
   * INTERNAL FLOW:
   * 1. Create event object with type, payload, timestamp, sequence
   * 2. Notify specific listeners (registered for this event type)
   * 3. Notify wildcard listeners (registered with '*')
   * 4. Errors in listeners are caught and logged (don't break other listeners)
   */
  emit<T = any>(eventType: DevToolsEventType, payload: T): void {
    const event: DevToolsEvent<T> = {
      type: eventType,
      payload,
      timestamp: Date.now(),
      sequence: ++this.sequence,
    };

    // Notify specific listeners
    const specificListeners = this.listeners.get(eventType);
    if (specificListeners) {
      for (const listener of specificListeners) {
        try {
          listener(event);
        } catch (error) {
          console.error(`[DevTools] Error in listener for ${eventType}:`, error);
        }
      }
    }

    // Notify wildcard listeners
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      for (const listener of wildcardListeners) {
        try {
          listener(event);
        } catch (error) {
          console.error('[DevTools] Error in wildcard listener:', error);
        }
      }
    }
  }

  /**
   * Remove all listeners (cleanup)
   */
  removeAllListeners(): void {
    this.listeners.clear();
    this.sequence = 0;
  }

  /**
   * Get count of listeners for debugging
   */
  getListenerCount(eventType?: DevToolsEventType | '*'): number {
    if (eventType) {
      return this.listeners.get(eventType as string)?.size || 0;
    }
    
    // Total count across all event types
    let total = 0;
    for (const listenerSet of this.listeners.values()) {
      total += listenerSet.size;
    }
    return total;
  }
}

// ============================================================================
// Global State & Configuration
// ============================================================================

/**
 * Global DevTools enable flag
 * Auto-disabled in production builds
 */
export let __DEVTOOLS__ = typeof process !== 'undefined' 
  ? process.env.NODE_ENV !== 'production'
  : true;

/**
 * DevTools configuration
 */
export interface DevToolsConfig {
  /** Enable the inspector */
  enabled: boolean;
  /** Track performance metrics */
  trackPerformance: boolean;
  /** Log events to console */
  logToConsole: boolean;
  /** Maximum number of performance samples to keep */
  maxPerformanceSamples: number;
  /** Slow update threshold in milliseconds */
  slowUpdateThreshold: number;
  /** Auto-emit performance warnings for slow updates */
  emitPerformanceWarnings: boolean;
}

const config: DevToolsConfig = {
  enabled: false,
  trackPerformance: true,
  logToConsole: false,
  maxPerformanceSamples: 1000,
  slowUpdateThreshold: 16, // 16ms = 1 frame at 60fps
  emitPerformanceWarnings: true,
};

/**
 * Signal metadata stored in registry
 */
export interface SignalMetadata {
  /** Unique signal identifier */
  id: string;
  /** Optional human-readable name */
  name?: string;
  /** Signal type */
  type: 'signal' | 'computed' | 'effect';
  /** Current value (JSON-safe serialized) */
  value: any;
  /** Number of active subscribers */
  subscriberCount: number;
  /** IDs of signals this one depends on */
  dependencies: string[];
  /** IDs of signals that depend on this one */
  subscribers: string[];
  /** Creation timestamp */
  createdAt: number;
  /** Last update timestamp */
  updatedAt: number;
  /** Total update count */
  updateCount: number;
  /** Stack trace at creation (if captured) */
  creationStack?: string;
}

/**
 * Performance metric entry
 */
export interface PerformanceMetric {
  signalId: string;
  type: 'signal' | 'computed' | 'effect';
  timestamp: number;
  duration: number;
  skipped: boolean;
  previousValue?: any;
  newValue?: any;
}

// ============================================================================
// Internal State
// ============================================================================

/**
 * INTERNAL DATA STRUCTURE: Signal Registry
 * 
 * Purpose: Centralized storage for all signal metadata
 * Structure: Map<signalId, SignalMetadata>
 * 
 * Operations:
 * - Add: registerSignal() → set(id, metadata)
 * - Read: getSignal() → get(id)
 * - Update: trackUpdate() → get(id) → modify → set(id, metadata)
 * - Remove: unregisterSignal() → delete(id)
 * 
 * Thread Safety: Single-threaded JavaScript (no locks needed)
 * Memory Management: WeakMap for signal-to-ID mapping (auto GC)
 */
const signalRegistry = new Map<string, SignalMetadata>();

/**
 * INTERNAL DATA STRUCTURE: Signal-to-ID Reverse Mapping
 * 
 * Purpose: Fast lookup from signal object to its ID
 * Structure: WeakMap<Signal, string>
 * 
 * Why WeakMap:
 * - Automatically garbage collected when signal is destroyed
 * - Doesn't prevent signal objects from being GC'd
 * - O(1) lookup time
 */
const signalToIdMap = new WeakMap<Signal<any>, string>();

/**
 * INTERNAL DATA STRUCTURE: Performance Metrics Buffer
 * 
 * Purpose: Circular buffer for recent performance measurements
 * Structure: Array<PerformanceMetric> (max size: config.maxPerformanceSamples)
 * 
 * Behavior:
 * - Push new metrics to end
 * - When full, remove oldest (shift)
 * - Enables trend analysis and performance regression detection
 */
const performanceMetrics: PerformanceMetric[] = [];

/**
 * Signal ID counter for generating unique IDs
 * Incremented on each registerSignal() call
 */
let signalIdCounter = 0;

/**
 * Event emitter instance for real-time event streaming
 */
const eventEmitter = new DevToolsEventEmitter();

// ============================================================================
// Core API - Configuration
// ============================================================================

/**
 * Enable DevTools inspector
 * 
 * INTERNAL FLOW:
 * 1. Set __DEVTOOLS__ global flag to true
 * 2. Merge user options with default config
 * 3. Set config.enabled = true
 * 4. Emit configuration event (if listeners exist)
 * 5. Log to console if requested
 * 
 * @param options - Configuration options
 */
export function enableDevTools(options: Partial<DevToolsConfig> = {}): void {
  __DEVTOOLS__ = true;
  Object.assign(config, options);
  config.enabled = true;
  
  if (config.logToConsole) {
    console.log('[SignalForge DevTools] Enabled', config);
  }
}

/**
 * Disable DevTools inspector
 * 
 * INTERNAL FLOW:
 * 1. Set __DEVTOOLS__ global flag to false
 * 2. Set config.enabled = false
 * 3. All subsequent operations become no-ops
 * 4. Existing data remains (for inspection), but no new tracking
 */
export function disableDevTools(): void {
  __DEVTOOLS__ = false;
  config.enabled = false;
  
  if (config.logToConsole) {
    console.log('[SignalForge DevTools] Disabled');
  }
}

/**
 * Check if DevTools is currently enabled
 */
export function isDevToolsEnabled(): boolean {
  return __DEVTOOLS__ && config.enabled;
}

/**
 * Get current DevTools configuration
 */
export function getDevToolsConfig(): Readonly<DevToolsConfig> {
  return { ...config };
}

// ============================================================================
// Core API - Signal Registration
// ============================================================================

/**
 * Register a signal with DevTools
 * 
 * INTERNAL DATA FLOW:
 * 1. Early exit if DevTools disabled (no-op for performance)
 * 2. Generate unique ID: `${type}_${++counter}`
 * 3. Capture creation stack trace (if available)
 * 4. Serialize initial value safely (handle circular refs)
 * 5. Create metadata object
 * 6. Store in registry: signalRegistry.set(id, metadata)
 * 7. Store reverse mapping: signalToIdMap.set(signal, id)
 * 8. Emit 'signal-created' event with metadata
 * 9. Log to console if configured
 * 10. Return signal ID for external tracking
 * 
 * @param signal - Signal object to register
 * @param type - Signal type ('signal', 'computed', or 'effect')
 * @param initialValue - Initial value of the signal
 * @param name - Optional human-readable name
 * @returns Signal ID (or empty string if DevTools disabled)
 */
export function registerSignal<T>(
  signal: Signal<T>,
  type: 'signal' | 'computed' | 'effect',
  initialValue?: T,
  name?: string
): string {
  // EARLY EXIT: No-op if DevTools disabled (zero overhead)
  if (!isDevToolsEnabled()) {
    return '';
  }
  
  // STEP 1: Generate unique ID
  const id = `${type}_${++signalIdCounter}`;
  
  // STEP 2: Capture creation stack trace (for debugging)
  let creationStack: string | undefined;
  if (typeof Error !== 'undefined') {
    try {
      throw new Error();
    } catch (e: any) {
      // Extract relevant stack frames (skip internal DevTools frames)
      creationStack = e.stack
        ?.split('\n')
        .slice(2, 6) // Skip Error() and registerSignal() frames
        .join('\n');
    }
  }
  
  // STEP 3: Create metadata object
  const metadata: SignalMetadata = {
    id,
    name,
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
  
  // STEP 4: Store in registry (O(1) insertion)
  signalRegistry.set(id, metadata);
  signalToIdMap.set(signal, id);
  
  // STEP 5: Emit event for real-time monitoring
  eventEmitter.emit<SignalCreatedPayload>('signal-created', {
    id,
    type,
    initialValue: metadata.value,
    name,
    creationStack,
  });
  
  // STEP 6: Optional console logging
  if (config.logToConsole) {
    console.log(`[SignalForge] Created ${type} "${id}"`, metadata);
  }
  
  return id;
}

/**
 * Unregister a signal from DevTools
 * 
 * INTERNAL DATA FLOW:
 * 1. Early exit if DevTools disabled
 * 2. Lookup signal ID from WeakMap
 * 3. Retrieve metadata from registry
 * 4. Calculate lifetime (destroyed - created)
 * 5. Emit 'signal-destroyed' event
 * 6. Remove from registry: signalRegistry.delete(id)
 * 7. Remove from WeakMap: signalToIdMap.delete(signal)
 * 8. Cleanup dependencies/subscribers in other signals
 * 9. Log to console if configured
 * 
 * @param signal - Signal object to unregister
 */
export function unregisterSignal<T>(signal: Signal<T>): void {
  if (!isDevToolsEnabled()) {
    return;
  }
  
  // STEP 1: Lookup ID from reverse mapping
  const id = signalToIdMap.get(signal);
  if (!id) {
    return; // Signal was never registered
  }
  
  // STEP 2: Retrieve metadata before deletion
  const metadata = signalRegistry.get(id);
  if (metadata) {
    // Calculate lifetime in milliseconds
    const lifetime = Date.now() - metadata.createdAt;
    
    // Emit destruction event
    eventEmitter.emit<SignalDestroyedPayload>('signal-destroyed', {
      id,
      type: metadata.type,
      finalValue: metadata.value,
      lifetime,
    });
  }
  
  // STEP 3: Remove from registry
  signalRegistry.delete(id);
  signalToIdMap.delete(signal);
  
  // STEP 4: Log to console
  if (config.logToConsole) {
    console.log(`[SignalForge] Destroyed signal "${id}"`);
  }
}

// ============================================================================
// Core API - Update Tracking
// ============================================================================

/**
 * Track a signal update with performance monitoring
 * 
 * INTERNAL DATA FLOW:
 * 1. Early exit if DevTools disabled → Just execute updateFn
 * 2. Lookup signal ID from WeakMap
 * 3. Lookup metadata from registry
 * 4. Capture start time: performance.now()
 * 5. Execute update function (actual signal update)
 * 6. Capture end time: performance.now()
 * 7. Calculate duration: end - start
 * 8. Check if value actually changed (skipped update?)
 * 9. Update metadata: value, updatedAt, updateCount
 * 10. Store performance metric if tracking enabled
 * 11. Emit 'signal-updated' event
 * 12. Emit 'performance-warning' if duration > threshold
 * 13. Log slow updates to console
 * 
 * @param signal - Signal being updated
 * @param updateFn - Function that performs the update
 * @param previousValue - Value before update (optional)
 */
export function trackUpdate<T>(
  signal: Signal<T>,
  updateFn: () => void,
  previousValue?: T
): void {
  // OPTIMIZATION: Fast path if DevTools disabled
  if (!isDevToolsEnabled()) {
    updateFn();
    return;
  }
  
  // STEP 1: Lookup signal metadata
  const id = signalToIdMap.get(signal);
  if (!id) {
    updateFn(); // Not tracked, just execute
    return;
  }
  
  const metadata = signalRegistry.get(id);
  if (!metadata) {
    updateFn();
    return;
  }
  
  // STEP 2: Capture performance metrics
  const startTime = performance.now();
  let skipped = false;
  let newValue: T | undefined;
  
  // STEP 2a: Start profiler latency measurement
  if (isProfilerEnabled()) {
    startLatencyMeasurement(id, metadata.subscribers.length);
  }
  
  try {
    // STEP 3: Execute the actual update
    updateFn();
    newValue = (signal._peek ? signal._peek() : signal.get());
    
    // STEP 4: Check if value actually changed (optimization detection)
    skipped = Object.is(previousValue, newValue);
  } catch (error) {
    console.error(`[SignalForge] Error updating signal "${id}"`, error);
    throw error; // Re-throw to preserve error handling
  } finally {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // STEP 4a: End profiler latency measurement
    if (isProfilerEnabled()) {
      endLatencyMeasurement(id, metadata.type, skipped);
    }
    
    // STEP 5: Update metadata
    metadata.value = safeSerialize(newValue);
    metadata.updatedAt = Date.now();
    if (!skipped) {
      metadata.updateCount++;
    }
    
    // STEP 6: Track performance if enabled
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
      
      // STEP 7: Emit performance warning if slow
      if (config.emitPerformanceWarnings && duration > config.slowUpdateThreshold) {
        eventEmitter.emit<PerformanceWarningPayload>('performance-warning', {
          signalId: id,
          type: metadata.type,
          duration,
          threshold: config.slowUpdateThreshold,
          message: `Slow update detected: ${duration.toFixed(2)}ms (threshold: ${config.slowUpdateThreshold}ms)`,
        });
      }
      
      // STEP 8: Console warning for slow updates
      if (config.logToConsole && duration > config.slowUpdateThreshold) {
        console.warn(
          `[SignalForge] Slow update: "${id}" took ${duration.toFixed(2)}ms`,
          metric
        );
      }
    }
    
    // STEP 9: Emit update event
    eventEmitter.emit<SignalUpdatedPayload>('signal-updated', {
      id,
      previousValue: safeSerialize(previousValue),
      newValue: safeSerialize(newValue),
      duration,
      skipped,
    });
  }
}

// ============================================================================
// Core API - Dependency Tracking
// ============================================================================

/**
 * Track a dependency relationship between signals
 * 
 * INTERNAL DATA FLOW:
 * 1. Early exit if DevTools disabled
 * 2. Lookup IDs for both subscriber and dependency
 * 3. Retrieve metadata for both signals
 * 4. Add to forward ref: subscriber.dependencies.push(dependencyId)
 * 5. Add to backward ref: dependency.subscribers.push(subscriberId)
 * 6. Update subscriberCount for dependency
 * 7. Emit 'dependency-added' event
 * 8. Update is idempotent (checks if already exists)
 * 
 * @param subscriber - Signal that depends on another (computed/effect)
 * @param dependency - Signal being depended upon (source signal)
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
    return; // One or both signals not tracked
  }
  
  const subscriberMeta = signalRegistry.get(subscriberId);
  const dependencyMeta = signalRegistry.get(dependencyId);
  
  if (!subscriberMeta || !dependencyMeta) {
    return;
  }
  
  // IDEMPOTENCY: Add only if not already present
  if (!subscriberMeta.dependencies.includes(dependencyId)) {
    subscriberMeta.dependencies.push(dependencyId);
  }
  
  if (!dependencyMeta.subscribers.includes(subscriberId)) {
    dependencyMeta.subscribers.push(subscriberId);
  }
  
  // Update subscriber count
  dependencyMeta.subscriberCount = dependencyMeta.subscribers.length;
  
  // Emit event
  eventEmitter.emit<DependencyPayload>('dependency-added', {
    subscriberId,
    dependencyId,
  });
}

/**
 * Remove a dependency relationship
 * 
 * INTERNAL DATA FLOW (reverse of trackDependency):
 * 1. Remove from forward ref: subscriber.dependencies.filter()
 * 2. Remove from backward ref: dependency.subscribers.filter()
 * 3. Update subscriberCount
 * 4. Emit 'dependency-removed' event
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
  
  // Remove from both sides
  subscriberMeta.dependencies = subscriberMeta.dependencies.filter(
    id => id !== dependencyId
  );
  
  dependencyMeta.subscribers = dependencyMeta.subscribers.filter(
    id => id !== subscriberId
  );
  
  // Update count
  dependencyMeta.subscriberCount = dependencyMeta.subscribers.length;
  
  // Emit event
  eventEmitter.emit<DependencyPayload>('dependency-removed', {
    subscriberId,
    dependencyId,
  });
}

// ============================================================================
// Query API - Signal Inspection
// ============================================================================

/**
 * List all registered signals
 * 
 * @returns Array of signal metadata, sorted by creation time
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
 * Get active plugins from plugin manager for DevTools display
 * 
 * @returns Array of active plugin information
 */
export function getActivePlugins(): Array<{
  name: string;
  version?: string;
  enabled: boolean;
  registeredAt: string;
  stats: {
    enableCount: number;
    disableCount: number;
    errorCount: number;
  };
}> {
  if (!isDevToolsEnabled()) {
    return [];
  }
  
  try {
    // Dynamically import plugin manager to avoid circular dependencies
    const pluginManager = require('../core/pluginManager');
    if (pluginManager && pluginManager.__getPluginInfoForDevTools) {
      return pluginManager.__getPluginInfoForDevTools();
    }
  } catch (error) {
    // Plugin manager not available or not loaded
    console.debug('[DevTools] Plugin manager not available');
  }
  
  return [];
}

/**
 * Get metadata for a specific signal by ID
 * 
 * @param id - Signal ID
 * @returns Signal metadata or undefined if not found
 */
export function getSignal(id: string): SignalMetadata | undefined {
  if (!isDevToolsEnabled()) {
    console.warn('[SignalForge] DevTools is not enabled');
    return undefined;
  }
  
  return signalRegistry.get(id);
}

/**
 * Get all dependencies for a signal (signals it reads from)
 * 
 * @param id - Signal ID
 * @returns Array of dependency signal IDs
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
 * Get all subscribers for a signal (signals that depend on it)
 * 
 * @param id - Signal ID
 * @returns Array of subscriber signal IDs
 */
export function getSubscribers(id: string): string[] {
  if (!isDevToolsEnabled()) {
    console.warn('[SignalForge] DevTools is not enabled');
    return [];
  }
  
  const metadata = signalRegistry.get(id);
  return metadata?.subscribers || [];
}

// ============================================================================
// Event Stream API
// ============================================================================

/**
 * Subscribe to DevTools events
 * 
 * USAGE EXAMPLES:
 * 
 * 1. Listen to all events:
 *    onDevToolsEvent('*', (event) => console.log(event));
 * 
 * 2. Listen to specific event:
 *    onDevToolsEvent('signal-created', (event) => {
 *      console.log('New signal:', event.payload.id);
 *    });
 * 
 * 3. Multiple listeners:
 *    const cleanup1 = onDevToolsEvent('signal-updated', handleUpdate);
 *    const cleanup2 = onDevToolsEvent('performance-warning', handleWarning);
 *    // Later: cleanup1(); cleanup2();
 * 
 * @param eventType - Event type to listen for (or '*' for all)
 * @param listener - Callback function
 * @returns Cleanup function to unsubscribe
 */
export function onDevToolsEvent<T = any>(
  eventType: DevToolsEventType | '*',
  listener: EventListener<T>
): () => void {
  return eventEmitter.on(eventType, listener);
}

/**
 * Unsubscribe from DevTools events
 * 
 * @param eventType - Event type
 * @param listener - Callback function to remove
 */
export function offDevToolsEvent<T = any>(
  eventType: DevToolsEventType | '*',
  listener: EventListener<T>
): void {
  eventEmitter.off(eventType, listener);
}

/**
 * Get count of active event listeners (for debugging)
 * 
 * @param eventType - Optional: count for specific event type
 * @returns Number of listeners
 */
export function getEventListenerCount(eventType?: DevToolsEventType | '*'): number {
  return eventEmitter.getListenerCount(eventType);
}

/**
 * Remove all event listeners (cleanup)
 */
export function clearEventListeners(): void {
  eventEmitter.removeAllListeners();
}

// ============================================================================
// Performance API
// ============================================================================

/**
 * Get recent performance metrics
 * 
 * @param limit - Maximum number of metrics to return (default: all)
 * @returns Array of performance metrics
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
 * Clear all performance metrics
 */
export function clearPerformanceMetrics(): void {
  performanceMetrics.length = 0;
}

// ============================================================================
// Internal Utilities
// ============================================================================

/**
 * Safely serialize a value for storage/display
 * Handles circular references, functions, and non-serializable values
 * 
 * @param value - Value to serialize
 * @returns JSON-safe representation
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
 * Add a performance metric to the circular buffer
 * 
 * @param metric - Performance metric to add
 */
function addPerformanceMetric(metric: PerformanceMetric): void {
  performanceMetrics.push(metric);
  
  // Maintain max buffer size (circular buffer behavior)
  if (performanceMetrics.length > config.maxPerformanceSamples) {
    performanceMetrics.shift();
  }
}

// ============================================================================
// Types are already exported above - no need to re-export
// ============================================================================
