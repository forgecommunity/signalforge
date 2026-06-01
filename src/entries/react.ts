/**
 * SignalForge React Integration Entry Point
 * React hooks for signals
 * Target: < 3KB gzipped (core + react)
 */

// Export only core primitives needed for React usage
export {
  createSignal,
  createComputed,
  createEffect,
  batch,
  untrack,
  flushSync,
  type Signal,
  type ComputedSignal,
} from '../core/store';

export {
  createStore,
  defineStore,
  shallowEqual,
  type SignalStore,
  type StoreUpdater,
  type StoreSelectorEquality,
} from '../core/storeApi';

// Export React-specific hooks
export {
  useSignal,
  useSignalValue,
  useComputed,
  useStore,
  useStoreSelector,
} from '../hooks/useSignal';

export {
  useSignalEffect,
} from '../hooks/useSignalEffect';

// Class component integration helpers
export {
  withSignals,
  withSignalValue,
} from '../react/classSupport';
