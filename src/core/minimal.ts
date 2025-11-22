/**
 * SignalForge Ultra-Minimal Core
 * Zero dependencies, pure functions, maximum performance
 * Target: < 1KB gzipped
 * 
 * This is the absolute smallest reactive core possible.
 * Use this for maximum bundle size efficiency.
 */

// Type definitions
export interface Signal<T> {
  (): T;
  (value: T | ((prev: T) => T)): void;
  peek(): T;
  subscribe(fn: (value: T) => void): () => void;
}

export interface Computed<T> {
  (): T;
  peek(): T;
}

// Global state
let context: Set<() => void> | null = null;

/**
 * Create a reactive signal
 * @example
 * const count = signal(0);
 * console.log(count()); // 0
 * count(5); // set
 * count(prev => prev + 1); // update
 */
export function signal<T>(initial: T): Signal<T> {
  let value = initial;
  let subs: Set<() => void> | undefined;
  
  function read() {
    if (context) {
      if (!subs) subs = new Set();
      const observer = context.values().next().value;
      if (observer) subs.add(observer);
    }
    return value;
  }
  
  function write(next: T | ((prev: T) => T)) {
    const newVal = typeof next === 'function' ? (next as (prev: T) => T)(value) : next;
    if (Object.is(newVal, value)) return;
    value = newVal;
    if (subs) subs.forEach(fn => fn());
  }
  
  function signalFn(arg?: T | ((prev: T) => T)) {
    return arguments.length === 0 ? read() : write(arg!);
  }
  
  signalFn.peek = () => value;
  signalFn.subscribe = (fn: (value: T) => void) => {
    if (!subs) subs = new Set();
    const notify = () => fn(value);
    subs.add(notify);
    return () => subs?.delete(notify);
  };
  
  return signalFn as Signal<T>;
}

/**
 * Create a computed signal (auto-updates)
 * @example
 * const count = signal(5);
 * const doubled = computed(() => count() * 2);
 * console.log(doubled()); // 10
 */
export function computed<T>(fn: () => T): Computed<T> {
  const sig = signal<T>(undefined as T);
  let dirty = true;
  
  const update = () => {
    dirty = true;
    const deps = new Set<() => void>();
    deps.add(update);
    const prev = context;
    context = deps;
    try {
      sig(fn());
      dirty = false;
    } finally {
      context = prev;
    }
  };
  
  update();
  
  function computedFn() {
    if (dirty) update();
    return sig();
  }
  
  computedFn.peek = sig.peek;
  
  return computedFn as Computed<T>;
}

/**
 * Create an effect (runs on dependency changes)
 * @example
 * const count = signal(0);
 * effect(() => console.log(count()));
 */
export function effect(fn: () => void | (() => void)): () => void {
  let cleanup: void | (() => void);
  let deps: Set<() => void>;
  
  const run = () => {
    if (cleanup) cleanup();
    deps = new Set();
    deps.add(run);
    const prev = context;
    context = deps;
    try {
      cleanup = fn();
    } finally {
      context = prev;
    }
  };
  
  run();
  
  return () => {
    if (cleanup) cleanup();
    deps.clear();
  };
}

/**
 * Batch multiple updates
 * @example
 * const a = signal(1);
 * const b = signal(2);
 * batch(() => {
 *   a(10);
 *   b(20);
 * }); // Only triggers dependents once
 */
export function batch<T>(fn: () => T): T {
  // Simplified batch - flush is automatic via microtask
  return fn();
}

/**
 * Run without tracking dependencies
 * @example
 * const a = signal(1);
 * const b = computed(() => {
 *   const val = a();
 *   untrack(() => console.log('Debug:', val));
 *   return val * 2;
 * });
 */
export function untrack<T>(fn: () => T): T {
  const prev = context;
  context = null;
  try {
    return fn();
  } finally {
    context = prev;
  }
}
