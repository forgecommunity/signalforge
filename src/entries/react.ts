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

// Export React-specific hooks
export {
  useSignal,
  useSignalValue,
} from '../hooks/useSignal';

export {
  useSignalEffect,
} from '../hooks/useSignalEffect';
