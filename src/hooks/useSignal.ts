/**
 * React integration for SignalForge
 * 
 * Provides hooks to use signals within React components.
 * Optional - only use if you're building a React application.
 * The core SignalForge system is framework-agnostic.
 */

import { Signal, createSignal, createEffect } from '../core/store';
import { useState, useEffect, useRef } from 'react';

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
    const init = typeof initialValue === 'function' 
      ? (initialValue as () => T)() 
      : initialValue;
    return createSignal(init);
  });
  
  // Track current value and trigger re-renders
  const [value, setValue] = useState(() => signal.get());
  
  // Subscribe to signal changes
  useEffect(() => {
    return signal.subscribe(setValue);
  }, [signal]);
  
  return [value, signal.set.bind(signal)];
}

/**
 * Hook to subscribe to a signal's value within a React component.
 * Automatically triggers re-render when the signal changes.
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
    // Subscribe and get initial value
    setValue(signal.get());
    return signal.subscribe(setValue);
  }, [signal]);
  
  return value;
}

/**
 * Hook to create an effect that runs when signal dependencies change.
 * Similar to useEffect but with automatic dependency tracking.
 * Note: This is a simpler version. For the full implementation, see useSignalEffect.ts
 * 
 * @param effectFn - Effect function to run
 * @param deps - Optional React dependency array
 * 
 * @example
 * ```tsx
 * function Logger() {
 *   const count = createSignal(0);
 *   
 *   useSignalEffect(() => {
 *     console.log('Count changed:', count.get());
 *   });
 *   
 *   return <button onClick={() => count.set(c => c + 1)}>Increment</button>;
 * }
 * ```
 */
export function useSignalEffect(
  effectFn: () => void | (() => void),
  deps?: any[]
): void {
  const cleanupRef = useRef(undefined) as any;
  
  useEffect(() => {
    // Run user's effect and capture cleanup
    const wrappedEffect = () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      cleanupRef.current = effectFn();
    };
    
    // Create SignalForge effect
    const dispose = createEffect(wrappedEffect);
    
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      dispose();
    };
  }, deps ?? []);
}

/**
 * Example of full React integration (commented out to avoid React dependency)
 * 
 * Uncomment and install React types to enable:
 * 
 * ```ts
 * import { useState, useEffect } from 'react';
 * 
 * export function useSignal<T>(
 *   initialValue: T | (() => T)
 * ): [T, (value: T | ((prev: T) => T)) => void] {
 *   const [signal] = useState(() => {
 *     const init = typeof initialValue === 'function' 
 *       ? (initialValue as () => T)() 
 *       : initialValue;
 *     return createSignal(init);
 *   });
 *   
 *   const [value, setValue] = useState(() => signal.get());
 *   
 *   useEffect(() => {
 *     return signal.subscribe(setValue);
 *   }, [signal]);
 *   
 *   return [value, signal.set.bind(signal)];
 * }
 * 
 * export function useSignalValue<T>(signal: Signal<T>): T {
 *   const [value, setValue] = useState(() => signal.get());
 *   
 *   useEffect(() => {
 *     return signal.subscribe(setValue);
 *   }, [signal]);
 *   
 *   return value;
 * }
 * 
 * export function useSignalEffect(
 *   effectFn: () => void | (() => void),
 *   deps?: any[]
 * ): void {
 *   useEffect(() => {
 *     return createEffect(effectFn);
 *   }, deps ?? []);
 * }
 * ```
 */
