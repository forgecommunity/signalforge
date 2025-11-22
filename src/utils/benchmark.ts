/**
 * Performance Benchmark Utilities for SignalForge
 * 
 * Provides tools to measure and compare performance of SignalForge
 * against other state management libraries like Redux and Zustand.
 * 
 * Uses high-resolution performance.now() for accurate measurements.
 */

import { createSignal, createComputed, batch } from '../core/store';

/**
 * Benchmark results interface
 */
export interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  opsPerSecond: number;
  metadata?: Record<string, any>;
}

/**
 * Collection of benchmark results for comparison
 */
const benchmarkResults: BenchmarkResult[] = [];

/**
 * Get high-resolution timestamp in milliseconds
 */
function now(): number {
  if (typeof performance !== 'undefined' && performance.now) {
    return performance.now();
  }
  return Date.now();
}

/**
 * Benchmarks sequential signal updates in SignalForge
 * 
 * Measures the time to create and update N signals sequentially,
 * including computed signals that react to changes.
 * 
 * @param count - Number of signal updates to perform
 * @returns Benchmark result with timing information
 * 
 * @example
 * ```ts
 * const result = benchmarkSignalUpdates(10000);
 * console.log(`Average: ${result.averageTime}ms per update`);
 * ```
 */
export function benchmarkSignalUpdates(count: number): BenchmarkResult {
  console.time('SignalForge: Sequential Updates');
  
  const startTime = now();
  
  // Create a signal and computed signal
  const signal = createSignal(0);
  const computed = createComputed(() => signal.get() * 2);
  
  let computedValue = 0;
  
  // Perform sequential updates
  for (let i = 0; i < count; i++) {
    signal.set(i);
    computedValue = computed.get();
  }
  
  const endTime = now();
  console.timeEnd('SignalForge: Sequential Updates');
  
  const totalTime = endTime - startTime;
  const averageTime = totalTime / count;
  const opsPerSecond = (count / totalTime) * 1000;
  
  const result: BenchmarkResult = {
    name: 'SignalForge Sequential Updates',
    iterations: count,
    totalTime,
    averageTime,
    opsPerSecond,
    metadata: {
      lastValue: computedValue,
    },
  };
  
  benchmarkResults.push(result);
  return result;
}

/**
 * Benchmarks batched signal updates in SignalForge
 * 
 * Measures the time to update multiple signals within a batch,
 * demonstrating the performance benefit of batching.
 * 
 * @param count - Number of signals to update in batch
 * @returns Benchmark result with timing information
 * 
 * @example
 * ```ts
 * const result = benchmarkBatchedUpdates(10000);
 * ```
 */
export function benchmarkBatchedUpdates(count: number): BenchmarkResult {
  console.time('SignalForge: Batched Updates');
  
  const startTime = now();
  
  // Create multiple signals
  const signals = Array.from({ length: count }, () => createSignal(0));
  const computed = createComputed(() => 
    signals.reduce((sum, s) => sum + s.get(), 0)
  );
  
  // Update all signals in a batch
  batch(() => {
    for (let i = 0; i < count; i++) {
      signals[i].set(i);
    }
  });
  
  const computedValue = computed.get();
  
  const endTime = now();
  console.timeEnd('SignalForge: Batched Updates');
  
  const totalTime = endTime - startTime;
  const averageTime = totalTime / count;
  const opsPerSecond = (count / totalTime) * 1000;
  
  const result: BenchmarkResult = {
    name: 'SignalForge Batched Updates',
    iterations: count,
    totalTime,
    averageTime,
    opsPerSecond,
    metadata: {
      computedValue,
    },
  };
  
  benchmarkResults.push(result);
  return result;
}

/**
 * Simple Redux-like store implementation for comparison
 */
class SimpleReduxStore {
  private state: any;
  private listeners: Set<() => void> = new Set();
  
  constructor(initialState: any) {
    this.state = initialState;
  }
  
  getState() {
    return this.state;
  }
  
  dispatch(action: any) {
    // Simple reducer
    if (action.type === 'INCREMENT') {
      this.state = { count: this.state.count + 1 };
    } else if (action.type === 'SET') {
      this.state = { count: action.payload };
    }
    
    // Notify all listeners
    this.listeners.forEach(listener => listener());
  }
  
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

/**
 * Benchmarks a simple Redux-like store implementation
 * 
 * Creates a basic Redux store and measures update performance
 * to compare with SignalForge.
 * 
 * @param count - Number of updates to perform
 * @returns Benchmark result with timing information
 * 
 * @example
 * ```ts
 * const result = compareWithRedux(10000);
 * ```
 */
export function compareWithRedux(count: number = 10000): BenchmarkResult {
  console.time('Redux-like: Sequential Updates');
  
  const startTime = now();
  
  // Create a simple Redux-like store
  const store = new SimpleReduxStore({ count: 0 });
  
  // Add a subscriber that computes derived state
  let computedValue = 0;
  store.subscribe(() => {
    computedValue = store.getState().count * 2;
  });
  
  // Perform sequential updates
  for (let i = 0; i < count; i++) {
    store.dispatch({ type: 'SET', payload: i });
  }
  
  const endTime = now();
  console.timeEnd('Redux-like: Sequential Updates');
  
  const totalTime = endTime - startTime;
  const averageTime = totalTime / count;
  const opsPerSecond = (count / totalTime) * 1000;
  
  const result: BenchmarkResult = {
    name: 'Redux-like Sequential Updates',
    iterations: count,
    totalTime,
    averageTime,
    opsPerSecond,
    metadata: {
      lastValue: computedValue,
    },
  };
  
  benchmarkResults.push(result);
  return result;
}

/**
 * Simple Zustand-like store implementation for comparison
 */
class SimpleZustandStore {
  private state: any;
  private listeners: Set<() => void> = new Set();
  
  constructor(initialState: any) {
    this.state = initialState;
  }
  
  getState() {
    return this.state;
  }
  
  setState(partial: any) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach(listener => listener());
  }
  
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

/**
 * Benchmarks a simple Zustand-like store implementation
 * 
 * Creates a basic Zustand store and measures update performance
 * to compare with SignalForge.
 * 
 * @param count - Number of updates to perform
 * @returns Benchmark result with timing information
 * 
 * @example
 * ```ts
 * const result = compareWithZustand(10000);
 * ```
 */
export function compareWithZustand(count: number = 10000): BenchmarkResult {
  console.time('Zustand-like: Sequential Updates');
  
  const startTime = now();
  
  // Create a simple Zustand-like store
  const store = new SimpleZustandStore({ count: 0 });
  
  // Add a subscriber that computes derived state
  let computedValue = 0;
  store.subscribe(() => {
    computedValue = store.getState().count * 2;
  });
  
  // Perform sequential updates
  for (let i = 0; i < count; i++) {
    store.setState({ count: i });
  }
  
  const endTime = now();
  console.timeEnd('Zustand-like: Sequential Updates');
  
  const totalTime = endTime - startTime;
  const averageTime = totalTime / count;
  const opsPerSecond = (count / totalTime) * 1000;
  
  const result: BenchmarkResult = {
    name: 'Zustand-like Sequential Updates',
    iterations: count,
    totalTime,
    averageTime,
    opsPerSecond,
    metadata: {
      lastValue: computedValue,
    },
  };
  
  benchmarkResults.push(result);
  return result;
}

/**
 * Benchmarks memory usage for signal creation
 * 
 * Measures memory consumption when creating many signals.
 * Note: Only works in environments with performance.memory API.
 * 
 * @param count - Number of signals to create
 * @returns Benchmark result with memory information
 */
export function benchmarkMemoryUsage(count: number): BenchmarkResult {
  const hasMemoryAPI = typeof performance !== 'undefined' && 
                       (performance as any).memory;
  
  const startMemory = hasMemoryAPI ? (performance as any).memory.usedJSHeapSize : 0;
  const startTime = now();
  
  // Create many signals
  const signals = Array.from({ length: count }, (_, i) => createSignal(i));
  
  // Force garbage collection if possible (only in dev/test)
  if (typeof global !== 'undefined' && (global as any).gc) {
    (global as any).gc();
  }
  
  const endTime = now();
  const endMemory = hasMemoryAPI ? (performance as any).memory.usedJSHeapSize : 0;
  
  const totalTime = endTime - startTime;
  const memoryUsed = endMemory - startMemory;
  const bytesPerSignal = memoryUsed / count;
  
  const result: BenchmarkResult = {
    name: 'Memory Usage',
    iterations: count,
    totalTime,
    averageTime: totalTime / count,
    opsPerSecond: (count / totalTime) * 1000,
    metadata: {
      memoryUsedBytes: memoryUsed,
      memoryUsedKB: memoryUsed / 1024,
      memoryUsedMB: memoryUsed / (1024 * 1024),
      bytesPerSignal,
      hasMemoryAPI,
      signalCount: signals.length,
    },
  };
  
  benchmarkResults.push(result);
  return result;
}

/**
 * Runs a comprehensive benchmark suite comparing all implementations
 * 
 * @param iterations - Number of iterations for each benchmark
 * @returns Array of all benchmark results
 * 
 * @example
 * ```ts
 * runBenchmarkSuite(10000);
 * logResults();
 * ```
 */
export function runBenchmarkSuite(iterations: number = 10000): BenchmarkResult[] {
  console.log('\n🔥 Running SignalForge Benchmark Suite...\n');
  
  // Clear previous results
  benchmarkResults.length = 0;
  
  // Run all benchmarks
  benchmarkSignalUpdates(iterations);
  benchmarkBatchedUpdates(Math.floor(iterations / 10));
  compareWithRedux(iterations);
  compareWithZustand(iterations);
  benchmarkMemoryUsage(1000);
  
  console.log('\n✅ Benchmark suite completed!\n');
  
  return benchmarkResults;
}

/**
 * Logs all benchmark results in a formatted table
 * 
 * Displays timing information, operations per second, and performance
 * comparisons between different implementations.
 * 
 * @example
 * ```ts
 * benchmarkSignalUpdates(10000);
 * compareWithRedux(10000);
 * logResults();
 * ```
 */
export function logResults(): void {
  if (benchmarkResults.length === 0) {
    console.log('No benchmark results to display. Run some benchmarks first.');
    return;
  }
  
  console.log('\n📊 Benchmark Results\n');
  console.log('='.repeat(100));
  
  // Table header
  console.log(
    '| ' +
    'Benchmark Name'.padEnd(35) + ' | ' +
    'Iterations'.padEnd(12) + ' | ' +
    'Total (ms)'.padEnd(12) + ' | ' +
    'Avg (ms)'.padEnd(12) + ' | ' +
    'Ops/sec'.padEnd(15) + ' |'
  );
  console.log('='.repeat(100));
  
  // Table rows
  for (const result of benchmarkResults) {
    console.log(
      '| ' +
      result.name.padEnd(35) + ' | ' +
      result.iterations.toLocaleString().padEnd(12) + ' | ' +
      result.totalTime.toFixed(2).padEnd(12) + ' | ' +
      result.averageTime.toFixed(4).padEnd(12) + ' | ' +
      result.opsPerSecond.toLocaleString(undefined, { maximumFractionDigits: 0 }).padEnd(15) + ' |'
    );
  }
  
  console.log('='.repeat(100));
  
  // Performance comparison
  const signalForgeResult = benchmarkResults.find(r => r.name === 'SignalForge Sequential Updates');
  const reduxResult = benchmarkResults.find(r => r.name === 'Redux-like Sequential Updates');
  const zustandResult = benchmarkResults.find(r => r.name === 'Zustand-like Sequential Updates');
  
  if (signalForgeResult && reduxResult) {
    const speedup = reduxResult.totalTime / signalForgeResult.totalTime;
    console.log(`\n⚡ SignalForge is ${speedup.toFixed(2)}x ${speedup > 1 ? 'faster' : 'slower'} than Redux-like`);
  }
  
  if (signalForgeResult && zustandResult) {
    const speedup = zustandResult.totalTime / signalForgeResult.totalTime;
    console.log(`⚡ SignalForge is ${speedup.toFixed(2)}x ${speedup > 1 ? 'faster' : 'slower'} than Zustand-like`);
  }
  
  // Batching improvement
  const batchedResult = benchmarkResults.find(r => r.name === 'SignalForge Batched Updates');
  if (signalForgeResult && batchedResult) {
    const improvement = signalForgeResult.averageTime / batchedResult.averageTime;
    console.log(`\n🔄 Batching provides ${improvement.toFixed(2)}x improvement in average update time`);
  }
  
  // Memory info
  const memoryResult = benchmarkResults.find(r => r.name === 'Memory Usage');
  if (memoryResult && memoryResult.metadata?.hasMemoryAPI) {
    console.log(`\n💾 Memory: ${memoryResult.metadata.memoryUsedKB.toFixed(2)} KB for ${memoryResult.iterations} signals`);
    console.log(`   (~${memoryResult.metadata.bytesPerSignal.toFixed(0)} bytes per signal)`);
  }
  
  console.log('\n');
}

/**
 * Gets all benchmark results
 * 
 * @returns Array of all recorded benchmark results
 */
export function getResults(): BenchmarkResult[] {
  return [...benchmarkResults];
}

/**
 * Clears all benchmark results
 */
export function clearResults(): void {
  benchmarkResults.length = 0;
  console.log('Benchmark results cleared.');
}

/**
 * Exports benchmark results as JSON
 * 
 * @returns JSON string of all results
 */
export function exportResults(): string {
  return JSON.stringify(benchmarkResults, null, 2);
}

/**
 * Custom benchmark runner for user-defined tests
 * 
 * @param name - Name of the benchmark
 * @param fn - Function to benchmark
 * @param iterations - Number of times to run the function
 * @returns Benchmark result
 * 
 * @example
 * ```ts
 * customBenchmark('My Test', () => {
 *   const s = createSignal(0);
 *   s.set(42);
 * }, 10000);
 * ```
 */
export function customBenchmark(
  name: string,
  fn: () => void,
  iterations: number = 1000
): BenchmarkResult {
  console.time(name);
  
  const startTime = now();
  
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  
  const endTime = now();
  console.timeEnd(name);
  
  const totalTime = endTime - startTime;
  const averageTime = totalTime / iterations;
  const opsPerSecond = (iterations / totalTime) * 1000;
  
  const result: BenchmarkResult = {
    name,
    iterations,
    totalTime,
    averageTime,
    opsPerSecond,
  };
  
  benchmarkResults.push(result);
  return result;
}
