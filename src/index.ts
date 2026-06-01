/**
 * SignalForge - Fine-grained reactive state management
 * 
 * A lightweight, framework-agnostic reactive system with automatic
 * dependency tracking, computed signals, and efficient batched updates.
 * 
 * @example
 * ```ts
 * import { createSignal, createComputed } from 'signalforge';
 * 
 * const count = createSignal(0);
 * const doubled = createComputed(() => count.get() * 2);
 * 
 * count.set(5);
 * console.log(doubled.get()); // 10
 * ```
 */

// Core reactive primitives
export {
  createSignal,
  createComputed,
  createEffect,
  batch,
  untrack,
  flushSync,
  type Signal,
  type ComputedSignal,
} from './core/store';

export {
  createStore,
  defineStore,
  shallowEqual,
  type SignalStore,
  type StoreUpdater,
  type StoreSelectorEquality,
} from './core/storeApi';

// React hooks (optional - requires React)
export {
  useSignal,
  useSignalValue,
  useComputed,
  useStore,
  useStoreSelector,
} from './hooks/useSignal';

export {
  useSignalEffect,
} from './hooks/useSignalEffect';
