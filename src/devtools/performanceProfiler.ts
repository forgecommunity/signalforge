/**
 * SignalForge Performance Profiler
 * 
 * PURPOSE:
 * ========
 * Lightweight profiling system for measuring signal update latencies and batch operation timings.
 * 
 * KEY FEATURES:
 * - Measure time between signal.set() and last subscriber notification
 * - Collect average latency per signal with min/max/mean/p95/p99
 * - Track batch operation timings (duration, operation count, signals affected)
 * - Real-time performance data streaming to DevTools [Performance] tab
 * - Minimal overhead when not actively profiling
 * - Automatic aggregation and statistical analysis
 * 
 * ARCHITECTURE:
 * =============
 * 
 * 1. Latency Tracking Flow:
 *    signal.set() → startLatencyMeasurement() → Record start time
 *    → Notify subscribers → All subscribers finish
 *    → endLatencyMeasurement() → Calculate latency → Store in buffer
 * 
 * 2. Batch Timing Flow:
 *    startBatch() → startBatchMeasurement() → Record batch start
 *    → Execute batched operations → Count signals
 *    → endBatch() → endBatchMeasurement() → Calculate duration → Store record
 * 
 * 3. Aggregation Flow:
 *    Raw latency samples → computeStatistics() → Calculate percentiles
 *    → Generate per-signal aggregated stats → Update ProfilerData
 * 
 * 4. Data Access Flow:
 *    getProfilerData() → Aggregate all stats → Return comprehensive snapshot
 *    resetProfiler() → Clear all buffers → Reset counters
 * 
 * INTEGRATION POINTS:
 * ===================
 * - Hooks into runtime.ts trackUpdate() for latency measurement
 * - Integrates with batcher.ts batch operations for timing
 * - Feeds data to DevTools UI via runtime event emitter
 * 
 * @module performanceProfiler
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Raw latency measurement for a single signal update
 */
export interface LatencySample {
  /** Signal ID */
  signalId: string;
  /** Signal type */
  type: 'signal' | 'computed' | 'effect';
  /** Start timestamp (performance.now()) */
  startTime: number;
  /** End timestamp (performance.now()) */
  endTime: number;
  /** Latency in milliseconds */
  latency: number;
  /** Number of subscribers notified */
  subscriberCount: number;
  /** Whether update was skipped (value unchanged) */
  skipped: boolean;
}

/**
 * Aggregated statistics for a single signal's latency
 */
export interface SignalLatencyStats {
  /** Signal ID */
  signalId: string;
  /** Signal type */
  type: 'signal' | 'computed' | 'effect';
  /** Total number of samples */
  sampleCount: number;
  /** Minimum latency (ms) */
  min: number;
  /** Maximum latency (ms) */
  max: number;
  /** Mean/average latency (ms) */
  mean: number;
  /** Median latency (ms) */
  median: number;
  /** 95th percentile (ms) */
  p95: number;
  /** 99th percentile (ms) */
  p99: number;
  /** Standard deviation */
  stdDev: number;
  /** Average subscriber count */
  avgSubscribers: number;
  /** Number of skipped updates */
  skippedCount: number;
}

/**
 * Batch operation timing record
 */
export interface BatchTimingRecord {
  /** Unique batch ID */
  batchId: number;
  /** Batch start timestamp */
  startTime: number;
  /** Batch end timestamp */
  endTime: number;
  /** Total batch duration (ms) */
  duration: number;
  /** Number of signal updates in batch */
  operationCount: number;
  /** IDs of signals affected */
  affectedSignals: string[];
  /** Batch nesting depth */
  depth: number;
}

/**
 * Aggregated batch statistics
 */
export interface BatchStats {
  /** Total number of batches executed */
  totalBatches: number;
  /** Average batch duration (ms) */
  avgDuration: number;
  /** Minimum batch duration (ms) */
  minDuration: number;
  /** Maximum batch duration (ms) */
  maxDuration: number;
  /** Average operations per batch */
  avgOperationsPerBatch: number;
  /** Total operations across all batches */
  totalOperations: number;
}

/**
 * Complete profiler data snapshot
 */
export interface ProfilerData {
  /** Whether profiler is currently enabled */
  enabled: boolean;
  /** Timestamp when profiler was started */
  startedAt: number | null;
  /** Duration since profiler started (ms) */
  duration: number;
  /** Per-signal latency statistics */
  signalStats: Map<string, SignalLatencyStats>;
  /** Recent batch timing records */
  batchRecords: BatchTimingRecord[];
  /** Aggregated batch statistics */
  batchStats: BatchStats;
  /** Total number of latency samples collected */
  totalSamples: number;
  /** Total number of signals profiled */
  totalSignals: number;
}

/**
 * Configuration options for profiler
 */
export interface ProfilerConfig {
  /** Maximum latency samples to store per signal */
  maxSamplesPerSignal: number;
  /** Maximum batch records to store */
  maxBatchRecords: number;
  /** Whether to auto-compute stats on every update (can be expensive) */
  autoComputeStats: boolean;
  /** Emit profiler events to DevTools */
  emitEvents: boolean;
}

// ============================================================================
// Internal State
// ============================================================================

/**
 * Global profiler state
 */
let profilerEnabled = false;
let profilerStartTime: number | null = null;
let batchIdCounter = 0;

/**
 * Latency sample storage: Map<signalId, samples[]>
 * Circular buffer per signal (max maxSamplesPerSignal)
 */
const latencySamples = new Map<string, LatencySample[]>();

/**
 * Batch timing records (circular buffer)
 */
const batchRecords: BatchTimingRecord[] = [];

/**
 * Active latency measurements: Map<signalId, startTime>
 * Tracks in-progress measurements
 */
const activeLatencyMeasurements = new Map<string, { startTime: number; subscriberCount: number }>();

/**
 * Active batch measurements: Map<batchId, { startTime, operations, signals }>
 * Tracks in-progress batch operations
 */
const activeBatchMeasurements = new Map<number, { 
  startTime: number; 
  operationCount: number; 
  affectedSignals: Set<string>;
  depth: number;
}>();

/**
 * Profiler configuration (with defaults)
 */
let config: ProfilerConfig = {
  maxSamplesPerSignal: 100,
  maxBatchRecords: 50,
  autoComputeStats: false,
  emitEvents: true,
};

// ============================================================================
// Core API - Profiler Control
// ============================================================================

/**
 * Enable the performance profiler
 * 
 * Starts collecting latency and batch timing data. Call this before
 * running operations you want to profile.
 * 
 * @param options - Configuration options
 * 
 * @example
 * ```ts
 * enableProfiler({ maxSamplesPerSignal: 200 });
 * // ... run your signal operations
 * const data = getProfilerData();
 * console.log('Average latency:', data.signalStats.get('mySignal')?.mean);
 * ```
 */
export function enableProfiler(options?: Partial<ProfilerConfig>): void {
  if (profilerEnabled) {
    console.warn('[Profiler] Already enabled');
    return;
  }
  
  // Merge user options with defaults
  config = { ...config, ...options };
  
  profilerEnabled = true;
  profilerStartTime = performance.now();
  
  console.log('[Profiler] Enabled', config);
}

/**
 * Disable the performance profiler
 * 
 * Stops collecting new data. Existing data is preserved until resetProfiler() is called.
 * 
 * @example
 * ```ts
 * disableProfiler();
 * // No more profiling, but data still available
 * const data = getProfilerData();
 * ```
 */
export function disableProfiler(): void {
  if (!profilerEnabled) {
    console.warn('[Profiler] Already disabled');
    return;
  }
  
  profilerEnabled = false;
  console.log('[Profiler] Disabled');
}

/**
 * Check if profiler is currently enabled
 * 
 * @returns True if profiler is enabled
 */
export function isProfilerEnabled(): boolean {
  return profilerEnabled;
}

/**
 * Reset all profiler data and counters
 * 
 * Clears all collected samples, batch records, and computed statistics.
 * Profiler remains enabled/disabled as before.
 * 
 * @example
 * ```ts
 * resetProfiler();
 * // Fresh start, all data cleared
 * ```
 */
export function resetProfiler(): void {
  latencySamples.clear();
  batchRecords.length = 0;
  activeLatencyMeasurements.clear();
  activeBatchMeasurements.clear();
  profilerStartTime = profilerEnabled ? performance.now() : null;
  batchIdCounter = 0;
  
  console.log('[Profiler] Reset');
}

/**
 * Update profiler configuration
 * 
 * @param options - Configuration options to update
 */
export function configureProfiler(options: Partial<ProfilerConfig>): void {
  config = { ...config, ...options };
  console.log('[Profiler] Configuration updated', config);
}

// ============================================================================
// Core API - Latency Measurement
// ============================================================================

/**
 * Start measuring latency for a signal update
 * 
 * INTERNAL: Called by runtime.ts when signal.set() is invoked
 * 
 * @param signalId - Signal ID
 * @param subscriberCount - Number of subscribers to notify
 */
export function startLatencyMeasurement(signalId: string, subscriberCount: number): void {
  if (!profilerEnabled) {
    return;
  }
  
  activeLatencyMeasurements.set(signalId, {
    startTime: performance.now(),
    subscriberCount,
  });
}

/**
 * End latency measurement and record sample
 * 
 * INTERNAL: Called by runtime.ts after all subscribers have been notified
 * 
 * @param signalId - Signal ID
 * @param type - Signal type
 * @param skipped - Whether update was skipped
 */
export function endLatencyMeasurement(
  signalId: string,
  type: 'signal' | 'computed' | 'effect',
  skipped: boolean
): void {
  if (!profilerEnabled) {
    return;
  }
  
  const measurement = activeLatencyMeasurements.get(signalId);
  if (!measurement) {
    return; // No active measurement
  }
  
  const endTime = performance.now();
  const latency = endTime - measurement.startTime;
  
  // Create sample
  const sample: LatencySample = {
    signalId,
    type,
    startTime: measurement.startTime,
    endTime,
    latency,
    subscriberCount: measurement.subscriberCount,
    skipped,
  };
  
  // Store sample (circular buffer per signal)
  let samples = latencySamples.get(signalId);
  if (!samples) {
    samples = [];
    latencySamples.set(signalId, samples);
  }
  
  samples.push(sample);
  
  // Maintain max buffer size
  if (samples.length > config.maxSamplesPerSignal) {
    samples.shift();
  }
  
  // Clean up active measurement
  activeLatencyMeasurements.delete(signalId);
  
  // Emit event if configured
  if (config.emitEvents) {
    // TODO: Emit to DevTools event emitter
    // eventEmitter.emit('profiler-latency-sample', sample);
  }
}

// ============================================================================
// Core API - Batch Timing
// ============================================================================

/**
 * Start measuring a batch operation
 * 
 * INTERNAL: Called by batcher.ts when startBatch() is invoked
 * 
 * @param depth - Current batch nesting depth
 * @returns Batch ID for tracking
 */
export function startBatchMeasurement(depth: number): number {
  if (!profilerEnabled) {
    return -1; // No-op ID
  }
  
  const batchId = ++batchIdCounter;
  
  activeBatchMeasurements.set(batchId, {
    startTime: performance.now(),
    operationCount: 0,
    affectedSignals: new Set<string>(),
    depth,
  });
  
  return batchId;
}

/**
 * Record a signal operation within a batch
 * 
 * INTERNAL: Called by batcher.ts when a signal is updated in a batch
 * 
 * @param batchId - Batch ID from startBatchMeasurement
 * @param signalId - Signal being updated
 */
export function recordBatchOperation(batchId: number, signalId: string): void {
  if (!profilerEnabled || batchId === -1) {
    return;
  }
  
  const measurement = activeBatchMeasurements.get(batchId);
  if (!measurement) {
    return;
  }
  
  measurement.operationCount++;
  measurement.affectedSignals.add(signalId);
}

/**
 * End batch measurement and record timing
 * 
 * INTERNAL: Called by batcher.ts when endBatch() is invoked
 * 
 * @param batchId - Batch ID from startBatchMeasurement
 */
export function endBatchMeasurement(batchId: number): void {
  if (!profilerEnabled || batchId === -1) {
    return;
  }
  
  const measurement = activeBatchMeasurements.get(batchId);
  if (!measurement) {
    return;
  }
  
  const endTime = performance.now();
  const duration = endTime - measurement.startTime;
  
  // Create batch record
  const record: BatchTimingRecord = {
    batchId,
    startTime: measurement.startTime,
    endTime,
    duration,
    operationCount: measurement.operationCount,
    affectedSignals: Array.from(measurement.affectedSignals),
    depth: measurement.depth,
  };
  
  // Store record (circular buffer)
  batchRecords.push(record);
  
  // Maintain max buffer size
  if (batchRecords.length > config.maxBatchRecords) {
    batchRecords.shift();
  }
  
  // Clean up active measurement
  activeBatchMeasurements.delete(batchId);
  
  // Emit event if configured
  if (config.emitEvents) {
    // TODO: Emit to DevTools event emitter
    // eventEmitter.emit('profiler-batch-timing', record);
  }
}

// ============================================================================
// Core API - Data Access
// ============================================================================

/**
 * Get complete profiler data snapshot
 * 
 * Returns aggregated statistics for all signals and batches.
 * This function computes statistics on-demand unless autoComputeStats is enabled.
 * 
 * @returns Complete profiler data with statistics
 * 
 * @example
 * ```ts
 * const data = getProfilerData();
 * 
 * // Per-signal stats
 * data.signalStats.forEach((stats, signalId) => {
 *   console.log(`${signalId}: avg=${stats.mean}ms, p95=${stats.p95}ms`);
 * });
 * 
 * // Batch stats
 * console.log(`Batches: ${data.batchStats.totalBatches}, avg=${data.batchStats.avgDuration}ms`);
 * ```
 */
export function getProfilerData(): ProfilerData {
  const now = performance.now();
  const duration = profilerStartTime ? now - profilerStartTime : 0;
  
  // Compute per-signal statistics
  const signalStats = new Map<string, SignalLatencyStats>();
  let totalSamples = 0;
  
  for (const [signalId, samples] of latencySamples.entries()) {
    if (samples.length === 0) continue;
    
    const stats = computeLatencyStats(signalId, samples);
    signalStats.set(signalId, stats);
    totalSamples += samples.length;
  }
  
  // Compute batch statistics
  const batchStats = computeBatchStats(batchRecords);
  
  return {
    enabled: profilerEnabled,
    startedAt: profilerStartTime,
    duration,
    signalStats,
    batchRecords: [...batchRecords], // Copy array
    batchStats,
    totalSamples,
    totalSignals: latencySamples.size,
  };
}

/**
 * Get latency statistics for a specific signal
 * 
 * @param signalId - Signal ID
 * @returns Latency statistics or null if no data
 * 
 * @example
 * ```ts
 * const stats = getSignalLatencyStats('user-count');
 * console.log(`Latency: ${stats?.mean}ms (p95: ${stats?.p95}ms)`);
 * ```
 */
export function getSignalLatencyStats(signalId: string): SignalLatencyStats | null {
  const samples = latencySamples.get(signalId);
  if (!samples || samples.length === 0) {
    return null;
  }
  
  return computeLatencyStats(signalId, samples);
}

/**
 * Get batch timing statistics
 * 
 * @returns Aggregated batch statistics
 * 
 * @example
 * ```ts
 * const stats = getBatchStats();
 * console.log(`Average batch: ${stats.avgDuration}ms with ${stats.avgOperationsPerBatch} ops`);
 * ```
 */
export function getBatchStats(): BatchStats {
  return computeBatchStats(batchRecords);
}

/**
 * Get raw latency samples for a signal
 * 
 * @param signalId - Signal ID
 * @returns Array of latency samples
 */
export function getLatencySamples(signalId: string): LatencySample[] {
  return latencySamples.get(signalId) || [];
}

/**
 * Get all batch timing records
 * 
 * @returns Array of batch records
 */
export function getBatchRecords(): BatchTimingRecord[] {
  return [...batchRecords];
}

// ============================================================================
// Internal Utilities - Statistics Computation
// ============================================================================

/**
 * Compute latency statistics for a signal
 * 
 * ALGORITHM:
 * 1. Extract latency values from samples
 * 2. Sort for percentile calculation
 * 3. Calculate min, max, mean, median
 * 4. Calculate percentiles (p95, p99)
 * 5. Calculate standard deviation
 * 6. Count skipped updates
 * 
 * @param signalId - Signal ID
 * @param samples - Array of latency samples
 * @returns Computed statistics
 */
function computeLatencyStats(signalId: string, samples: LatencySample[]): SignalLatencyStats {
  if (samples.length === 0) {
    return {
      signalId,
      type: 'signal',
      sampleCount: 0,
      min: 0,
      max: 0,
      mean: 0,
      median: 0,
      p95: 0,
      p99: 0,
      stdDev: 0,
      avgSubscribers: 0,
      skippedCount: 0,
    };
  }
  
  const type = samples[0].type;
  const latencies = samples.map(s => s.latency);
  const sortedLatencies = [...latencies].sort((a, b) => a - b);
  
  // Basic stats
  const min = sortedLatencies[0];
  const max = sortedLatencies[sortedLatencies.length - 1];
  const sum = latencies.reduce((acc, val) => acc + val, 0);
  const mean = sum / latencies.length;
  
  // Median
  const mid = Math.floor(sortedLatencies.length / 2);
  const median = sortedLatencies.length % 2 === 0
    ? (sortedLatencies[mid - 1] + sortedLatencies[mid]) / 2
    : sortedLatencies[mid];
  
  // Percentiles
  const p95 = percentile(sortedLatencies, 0.95);
  const p99 = percentile(sortedLatencies, 0.99);
  
  // Standard deviation
  const squaredDiffs = latencies.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / latencies.length;
  const stdDev = Math.sqrt(variance);
  
  // Subscriber stats
  const avgSubscribers = samples.reduce((acc, s) => acc + s.subscriberCount, 0) / samples.length;
  const skippedCount = samples.filter(s => s.skipped).length;
  
  return {
    signalId,
    type,
    sampleCount: samples.length,
    min,
    max,
    mean,
    median,
    p95,
    p99,
    stdDev,
    avgSubscribers,
    skippedCount,
  };
}

/**
 * Compute batch statistics from records
 * 
 * @param records - Array of batch timing records
 * @returns Aggregated batch statistics
 */
function computeBatchStats(records: BatchTimingRecord[]): BatchStats {
  if (records.length === 0) {
    return {
      totalBatches: 0,
      avgDuration: 0,
      minDuration: 0,
      maxDuration: 0,
      avgOperationsPerBatch: 0,
      totalOperations: 0,
    };
  }
  
  const durations = records.map(r => r.duration);
  const operations = records.map(r => r.operationCount);
  
  const totalBatches = records.length;
  const avgDuration = durations.reduce((acc, val) => acc + val, 0) / totalBatches;
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  const totalOperations = operations.reduce((acc, val) => acc + val, 0);
  const avgOperationsPerBatch = totalOperations / totalBatches;
  
  return {
    totalBatches,
    avgDuration,
    minDuration,
    maxDuration,
    avgOperationsPerBatch,
    totalOperations,
  };
}

/**
 * Calculate percentile value from sorted array
 * 
 * @param sortedArray - Sorted numeric array
 * @param percentile - Percentile (0.0 to 1.0)
 * @returns Percentile value
 */
function percentile(sortedArray: number[], percentile: number): number {
  if (sortedArray.length === 0) return 0;
  
  const index = percentile * (sortedArray.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  if (lower === upper) {
    return sortedArray[lower];
  }
  
  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
}
