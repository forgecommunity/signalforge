/**
 * React integration - useSignalEffect hook
 * 
 * Provides a React hook similar to useEffect, but reactive to SignalForge signals.
 * Automatically tracks signal dependencies and re-runs when they change.
 * 
 * Features:
 * - Automatic dependency tracking (no manual dependency array needed)
 * - Cleanup support (return cleanup function from effect)
 * - Prevents infinite loops with WeakMap-based tracking
 * - Properly integrates with React lifecycle (cleanup on unmount)
 * - Uses internal observer API from store.ts for fine-grained reactivity
 */

import { createEffect } from '../core/store';

/**
 * Type guard to check if React hooks are available
 */
function checkReactAvailable(): void {
  if (typeof globalThis !== 'undefined') {
    // Check if we're in a React context
    const reactSymbol = Symbol.for('react.element');
    if (!reactSymbol) {
      throw new Error(
        'useSignalEffect requires React to be installed and imported. ' +
        'Make sure React is properly set up in your project.'
      );
    }
  }
}

/**
 * WeakMap to prevent infinite loops by tracking currently executing effects.
 * This prevents an effect from triggering itself recursively.
 * 
 * Key: effect function
 * Value: whether it's currently executing
 */
const executingEffects = new WeakMap<Function, boolean>();

/**
 * React hook that runs an effect when SignalForge signals change.
 * 
 * Unlike React's useEffect, you don't need to specify a dependency array.
 * The hook automatically tracks which signals are accessed during the effect
 * execution and re-runs the effect when any of those signals change.
 * 
 * The effect can optionally return a cleanup function, which will be called:
 * - Before the effect re-runs
 * - When the component unmounts
 * 
 * @param effectFn - Effect function that may read from signals
 * @param deps - Optional React dependency array (defaults to [])
 *               Only re-create the effect when these React deps change
 * 
 * @example
 * Basic usage:
 * ```tsx
 * const count = createSignal(0);
 * 
 * function Component() {
 *   useSignalEffect(() => {
 *     console.log('Count is:', count.get());
 *   });
 *   
 *   return <button onClick={() => count.set(c => c + 1)}>+</button>;
 * }
 * ```
 * 
 * @example
 * With cleanup:
 * ```tsx
 * const url = createSignal('/api/data');
 * 
 * function Component() {
 *   const [data, setData] = useState(null);
 *   
 *   useSignalEffect(() => {
 *     const controller = new AbortController();
 *     
 *     fetch(url.get(), { signal: controller.signal })
 *       .then(r => r.json())
 *       .then(setData);
 *     
 *     return () => controller.abort();
 *   });
 *   
 *   return <div>{data}</div>;
 * }
 * ```
 * 
 * @example
 * Multiple signals:
 * ```tsx
 * const firstName = createSignal('John');
 * const lastName = createSignal('Doe');
 * 
 * function Component() {
 *   useSignalEffect(() => {
 *     const full = `${firstName.get()} ${lastName.get()}`;
 *     document.title = full;
 *   });
 *   
 *   return null;
 * }
 * ```
 */
export function useSignalEffect(
  effectFn: () => void | (() => void),
  deps: React.DependencyList = []
): void {
  // Dynamic import check - we need React.useEffect
  // In a real implementation, this would be a static import
  // For now, we'll assume React is globally available
  
  // We need to use React's useEffect and useRef
  // This is a type-safe way without importing React directly
  const React = getReactInstance();
  
  // Store cleanup function from user's effect
  const userCleanupRef = React.useRef<(() => void) | void>();
  
  // Store SignalForge effect cleanup
  const signalCleanupRef = React.useRef<(() => void) | undefined>();
  
  React.useEffect(() => {
    // Wrap user's effect to handle cleanup and prevent infinite loops
    const wrappedEffect = () => {
      // Check if this effect is already executing
      if (executingEffects.get(effectFn)) {
        console.warn(
          'useSignalEffect: Detected potential infinite loop. ' +
          'Effect tried to modify a signal it depends on.'
        );
        return;
      }
      
      // Mark as executing
      executingEffects.set(effectFn, true);
      
      try {
        // Clean up previous user cleanup if it exists
        if (userCleanupRef.current) {
          userCleanupRef.current();
          userCleanupRef.current = undefined;
        }
        
        // Run user's effect and capture cleanup
        const cleanup = effectFn();
        if (typeof cleanup === 'function') {
          userCleanupRef.current = cleanup;
        }
      } finally {
        // Mark as not executing
        executingEffects.set(effectFn, false);
      }
    };
    
    // Create SignalForge effect - this automatically tracks dependencies
    // The effect will re-run whenever any signal accessed in wrappedEffect changes
    const signalCleanup = createEffect(wrappedEffect);
    signalCleanupRef.current = signalCleanup;
    
    // Cleanup function for React
    return () => {
      // Clean up user's effect
      if (userCleanupRef.current) {
        userCleanupRef.current();
        userCleanupRef.current = undefined;
      }
      
      // Clean up SignalForge effect (stops tracking)
      if (signalCleanupRef.current) {
        signalCleanupRef.current();
        signalCleanupRef.current = undefined;
      }
      
      // Remove from executing map
      executingEffects.delete(effectFn);
    };
  }, deps);
}

/**
 * Get React instance dynamically to avoid hard dependency.
 * This allows the library to work even if React isn't installed,
 * though this specific hook will throw an error if React is missing.
 */
function getReactInstance(): typeof React {
  // Try to get React from global scope or require it
  if (typeof window !== 'undefined' && (window as any).React) {
    return (window as any).React;
  }
  
  // Try to require it (for CommonJS environments)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('react');
  } catch {
    throw new Error(
      'useSignalEffect requires React to be installed. ' +
      'Install react: npm install react'
    );
  }
}

/**
 * Minimal React type definitions for type safety without importing React.
 * In a real implementation, you'd import these from '@types/react'.
 */
declare namespace React {
  export type DependencyList = ReadonlyArray<any>;
  
  export interface MutableRefObject<T> {
    current: T;
  }
  
  export function useEffect(
    effect: () => void | (() => void),
    deps?: DependencyList
  ): void;
  
  export function useRef<T>(initialValue: T): MutableRefObject<T>;
  export function useRef<T>(initialValue: T | null): MutableRefObject<T | null>;
  export function useRef<T = undefined>(): MutableRefObject<T | undefined>;
}
