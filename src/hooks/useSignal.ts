/**
 * React integration for SignalForge
 * 
 * Simple, stable implementation for React and React Native.
 * Works with React 16.8+ and React Native 0.60+
 * 
 * Provides hooks to use signals within React components.
 * Optional - only use if you're building a React application.
 * The core SignalForge system is framework-agnostic.
 */

import { Signal, createSignal } from '../core/store';
import { useState, useEffect } from 'react';

// Runtime guard to surface duplicate React or missing hook dispatcher early
function assertReactHooksAvailable() {
  if (typeof useState !== 'function' || typeof useEffect !== 'function') {
    throw new Error('[SignalForge] React hooks unavailable. Possible duplicate React instance or invalid bundler resolution.\n' +
      'Troubleshooting:\n' +
      '  1. Ensure only one react copy: node_modules/react (no nested copy under library).\n' +
      '  2. Clear Metro cache: npx react-native start --reset-cache.\n' +
      '  3. Verify metro.config.js extraNodeModules maps react to example app node_modules.');
  }
}
assertReactHooksAvailable();

/**
 * Hook to subscribe to a signal's value within a React component.
 * Automatically triggers re-render when the signal changes.
 * 
 * Simple implementation using useState and useEffect.
 * 
 * @param signal - Signal to subscribe to
 * @returns Current signal value
 * 
 * @example
 * ```tsx
 * const count = createSignal(0);
 * 
 * function Display() {
 *   const value = useSignalValue(count);
 *   return <div>Count: {value}</div>;
 * }
 * ```
 */
export function useSignalValue<T>(signal: Signal<T>): T {
  const [value, setValue] = useState(() => signal.get());
  
  useEffect(() => {
    setValue(signal.get()); // Update to current value
    return signal.subscribe(() => setValue(signal.get()));
  }, [signal]);
  
  return value;
}

/**
 * Hook to create a signal within a React component.
 * The signal persists across re-renders via useState-like semantics.
 * 
 * @param initialValue - Initial signal value
 * @returns Tuple of [value, setValue] similar to useState
 * 
 * @example
 * ```tsx
 * function Counter() {
 *   const [count, setCount] = useSignal(0);
 *   return (
 *     <button onClick={() => setCount(count + 1)}>
 *       Count: {count}
 *     </button>
 *   );
 * }
 * ```
 */
export function useSignal<T>(
  initialValue: T | (() => T)
): [T, (value: T | ((prev: T) => T)) => void] {
  // Create signal once on mount
  const [signal] = useState(() => {
    const value = typeof initialValue === 'function' 
      ? (initialValue as any)() 
      : initialValue;
    return createSignal(value);
  });

  // Subscribe to signal updates
  const value = useSignalValue(signal);

  return [value, signal.set.bind(signal)];
}

/**
 * Note: For useSignalEffect, please import from './useSignalEffect'
 * This file only contains useSignal and useSignalValue hooks.
 */
