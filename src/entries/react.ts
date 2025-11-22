/**
 * SignalForge React Integration Entry Point
 * React hooks for signals
 * Target: < 3KB gzipped (core + react)
 */

export * from './core';

export {
  useSignal,
  useSignalValue,
  useSignalEffect,
} from '../hooks/useSignal';

export {
  useSignalEffect as useSignalEffectV2,
} from '../hooks/useSignalEffect';
