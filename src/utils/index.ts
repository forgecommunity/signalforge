/**
 * Utility functions for SignalForge reactive system
 * Helper functions for common reactive patterns
 */

import { Signal, ComputedSignal, createSignal, createComputed, createEffect } from '../core/store';

// ============================================================================
// Derived Signals (Computed with Multiple Sources)
// ============================================================================

/**
 * Create a computed signal from multiple source signals.
 * Convenient wrapper for createComputed with explicit dependencies.
 * 
 * @param sources - Array of signals to derive from
 * @param deriveFn - Function that takes all source values
 * @returns Computed signal
 */
export function derive<T extends any[], R>(
  sources: { [K in keyof T]: Signal<T[K]> },
  deriveFn: (...values: T) => R
): ComputedSignal<R> {
  return createComputed(() => {
    const values = sources.map(s => s.get()) as T;
    return deriveFn(...values);
  });
}

// ============================================================================
// Signal Combinators
// ============================================================================

/**
 * Combine multiple signals into a single signal containing an array of values.
 * Updates when any source signal changes.
 * 
 * @param signals - Array of signals to combine
 * @returns Computed signal with array of values
 */
export function combine<T extends any[]>(
  signals: { [K in keyof T]: Signal<T[K]> }
): ComputedSignal<T> {
  return createComputed(() => signals.map(s => s.get()) as T);
}

/**
 * Map a signal's value through a transformation function.
 * 
 * @param signal - Source signal
 * @param mapFn - Transformation function
 * @returns Computed signal with transformed value
 */
export function map<T, R>(signal: Signal<T>, mapFn: (value: T) => R): ComputedSignal<R> {
  return createComputed(() => mapFn(signal.get()));
}

/**
 * Filter signal updates based on a predicate.
 * Only propagates updates when predicate returns true.
 * 
 * @param signal - Source signal
 * @param predicate - Filter function
 * @param defaultValue - Value to use when predicate fails
 * @returns Computed signal with filtered updates
 */
export function filter<T>(
  signal: Signal<T>,
  predicate: (value: T) => boolean,
  defaultValue: T
): ComputedSignal<T> {
  return createComputed(() => {
    const value = signal.get();
    return predicate(value) ? value : defaultValue;
  });
}

// ============================================================================
// Memoization & Optimization
// ============================================================================

/**
 * Create a signal that only updates when the value changes based on
 * a custom equality function. Prevents unnecessary updates for
 * objects that are structurally equal but different references.
 * 
 * @param signal - Source signal
 * @param equals - Custom equality function
 * @returns Computed signal with custom equality checking
 */
export function memo<T>(
  signal: Signal<T>,
  equals: (a: T, b: T) => boolean = Object.is
): ComputedSignal<T> {
  let lastValue = (signal._peek ? signal._peek() : signal.get());
  
  return createComputed(() => {
    const current = signal.get();
    if (!equals(current, lastValue)) {
      lastValue = current;
    }
    return lastValue;
  });
}

// ============================================================================
// Async Utilities
// ============================================================================

/**
 * Resource state for async operations
 */
export type ResourceState<T> =
  | { status: 'pending'; data: undefined; error: undefined }
  | { status: 'success'; data: T; error: undefined }
  | { status: 'error'; data: undefined; error: Error };

/**
 * Create a signal that tracks the state of an async operation.
 * Updates automatically when the promise resolves or rejects.
 * 
 * @param fetcher - Async function to fetch data
 * @returns Signal containing resource state
 */
export function createResource<T>(
  fetcher: () => Promise<T>
): Signal<ResourceState<T>> {
  const state = createSignal<ResourceState<T>>({
    status: 'pending',
    data: undefined,
    error: undefined,
  });

  fetcher()
    .then(data => {
      state.set({ status: 'success', data, error: undefined });
    })
    .catch(error => {
      state.set({ status: 'error', data: undefined, error });
    });

  return state;
}

/**
 * Debounce a signal's updates. Only propagates after the signal
 * stops changing for the specified delay.
 * 
 * @param signal - Source signal
 * @param delayMs - Delay in milliseconds
 * @returns Debounced signal
 */
export function debounce<T>(signal: Signal<T>, delayMs: number): Signal<T> {
  const debounced = createSignal((signal._peek ? signal._peek() : signal.get()));
  let timeoutId: NodeJS.Timeout | number | undefined;

  createEffect(() => {
    const value = signal.get();
    
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId as any);
    }
    
    timeoutId = setTimeout(() => {
      debounced.set(value);
    }, delayMs);
  });

  return debounced;
}

/**
 * Throttle a signal's updates. Limits update frequency to at most
 * once per interval.
 * 
 * @param signal - Source signal
 * @param intervalMs - Minimum interval between updates in milliseconds
 * @returns Throttled signal
 */
export function throttle<T>(signal: Signal<T>, intervalMs: number): Signal<T> {
  const throttled = createSignal((signal._peek ? signal._peek() : signal.get()));
  let lastUpdate = 0;
  let pending: T | undefined;
  let timeoutId: NodeJS.Timeout | number | undefined;

  createEffect(() => {
    const value = signal.get();
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdate;

    if (timeSinceLastUpdate >= intervalMs) {
      throttled.set(value);
      lastUpdate = now;
      pending = undefined;
    } else {
      pending = value;
      
      if (timeoutId === undefined) {
        timeoutId = setTimeout(() => {
          if (pending !== undefined) {
            throttled.set(pending);
            lastUpdate = Date.now();
            pending = undefined;
          }
          timeoutId = undefined;
        }, intervalMs - timeSinceLastUpdate);
      }
    }
  });

  return throttled;
}

// ============================================================================
// Collection Utilities
// ============================================================================

/**
 * Array signal interface with helper methods
 */
export interface ArraySignal<T> extends Signal<T[]> {
  push(...items: T[]): void;
  pop(): T | undefined;
  filter(predicate: (value: T, index: number) => boolean): void;
  map<R>(mapFn: (value: T, index: number) => R): R[];
  find(predicate: (value: T, index: number) => boolean): T | undefined;
  remove(item: T): void;
  clear(): void;
  readonly length: number;
}

/**
 * Create a signal for array operations with helper methods.
 * Provides convenient array manipulation while maintaining reactivity.
 * 
 * @param initialArray - Initial array value
 * @returns Signal with array helper methods
 */
export function createArraySignal<T>(initialArray: T[] = []): ArraySignal<T> {
  const signal = createSignal(initialArray);

  return {
    ...signal,
    
    push(...items: T[]): void {
      signal.set(prev => [...prev, ...items]);
    },
    
    pop(): T | undefined {
      let popped: T | undefined;
      signal.set(prev => {
        const next = [...prev];
        popped = next.pop();
        return next;
      });
      return popped;
    },
    
    filter(predicate: (value: T, index: number) => boolean): void {
      signal.set(prev => prev.filter(predicate));
    },
    
    map<R>(mapFn: (value: T, index: number) => R): R[] {
      return signal.get().map(mapFn);
    },
    
    find(predicate: (value: T, index: number) => boolean): T | undefined {
      return signal.get().find(predicate);
    },
    
    remove(item: T): void {
      signal.set(prev => prev.filter(i => i !== item));
    },
    
    clear(): void {
      signal.set([]);
    },
    
    get length(): number {
      return signal.get().length;
    },
  };
}

/**
 * Record signal interface with helper methods
 */
export interface RecordSignal<T> extends Signal<Record<string, T>> {
  setKey(key: string, value: T): void;
  deleteKey(key: string): void;
  hasKey(key: string): boolean;
  getKey(key: string): T | undefined;
  keys(): string[];
  values(): T[];
  entries(): [string, T][];
  clear(): void;
}

/**
 * Create a signal for object/map operations with helper methods.
 * Provides convenient object manipulation while maintaining reactivity.
 * 
 * @param initialRecord - Initial record/object value
 * @returns Signal with record helper methods
 */
export function createRecordSignal<T>(initialRecord: Record<string, T> = {}): RecordSignal<T> {
  const signal = createSignal(initialRecord);

  return {
    ...signal,
    
    setKey(key: string, value: T): void {
      signal.set(prev => ({ ...prev, [key]: value }));
    },
    
    deleteKey(key: string): void {
      signal.set(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    
    hasKey(key: string): boolean {
      return key in signal.get();
    },
    
    getKey(key: string): T | undefined {
      return signal.get()[key];
    },
    
    keys(): string[] {
      return Object.keys(signal.get());
    },
    
    values(): T[] {
      return Object.values(signal.get());
    },
    
    entries(): [string, T][] {
      return Object.entries(signal.get());
    },
    
    clear(): void {
      signal.set({});
    },
  };
}

// ============================================================================
// Performance Monitoring
// ============================================================================

/**
 * Wrap a signal with performance monitoring.
 * Logs read/write times and update frequency.
 * 
 * @param signal - Signal to monitor
 * @param label - Label for logging
 * @returns Wrapped signal with same interface
 */
export function monitor<T>(signal: Signal<T>, label: string): Signal<T> {
  let readCount = 0;
  let writeCount = 0;
  let totalReadTime = 0;
  let totalWriteTime = 0;

  return {
    get(): T {
      const start = performance.now();
      const value = signal.get();
      const duration = performance.now() - start;
      
      readCount++;
      totalReadTime += duration;
      
      if (readCount % 100 === 0) {
        console.log(`[${label}] Reads: ${readCount}, Avg: ${(totalReadTime / readCount).toFixed(3)}ms`);
      }
      
      return value;
    },
    
    set(value: T | ((prev: T) => T)): void {
      const start = performance.now();
      signal.set(value);
      const duration = performance.now() - start;
      
      writeCount++;
      totalWriteTime += duration;
      
      console.log(`[${label}] Write #${writeCount}: ${duration.toFixed(3)}ms`);
    },
    
    subscribe: signal.subscribe.bind(signal),
    destroy: signal.destroy.bind(signal),
    _node: signal._node,
    _addSubscriber: signal._addSubscriber ? signal._addSubscriber.bind(signal) : undefined,
    _removeSubscriber: signal._removeSubscriber ? signal._removeSubscriber.bind(signal) : undefined,
    _peek: signal._peek ? signal._peek.bind(signal) : undefined,
  };
}

// Re-export core functions for convenience
export {
  createSignal,
  createComputed,
  createEffect,
  batch,
  untrack,
  flushSync,
} from '../core/store';

// Export storage adapter utilities
export {
  getStorageAdapter,
  resetStorageAdapter,
  createStorageAdapter,
  detectEnvironment,
  safeStringify,
  safeParse,
  persist,
  createPersistentSignal,
  type StorageAdapter,
  type StorageOptions,
  type PersistOptions,
  type Environment,
} from './storageAdapter';

// Export benchmark utilities
export {
  benchmarkSignalUpdates,
  benchmarkBatchedUpdates,
  compareWithRedux,
  compareWithZustand,
  benchmarkMemoryUsage,
  runBenchmarkSuite,
  logResults,
  getResults,
  clearResults,
  exportResults,
  customBenchmark,
  type BenchmarkResult,
} from './benchmark';
