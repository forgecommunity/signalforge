/**
 * React integration - useSignalEffect hook
 * 
 * FIXED VERSION - React 18 Compliant
 * - Direct React imports (no dynamic loading)
 * - Proper hook call structure
 * - Fixed dispatcher is null error
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

import { useEffect, useRef } from "react";
import { createEffect } from "../core/store";

/**
 * WeakMap to prevent infinite loops by tracking currently executing effects.
 * This prevents an effect from triggering itself recursively.
 * 
 * Key: Symbol-based hook ID
 * Value: whether it's currently executing
 */
const executingEffects = new WeakMap<any, boolean>();

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
  deps: any[] = []
): void {
  // Create stable hook ID for this instance
  const hookId = useRef(Symbol("useSignalEffectId"));
  
  // Store cleanup function from user's effect
  const userCleanup = useRef<null | (() => void)>(null);
  
  // Store SignalForge effect cleanup
  const signalCleanup = useRef<null | (() => void)>(null);

  useEffect(() => {
    // Wrap user's effect to handle cleanup and prevent infinite loops
    const wrapped = () => {
      // Check if this effect is already executing
      if (executingEffects.get(hookId.current)) {
        return;
      }

      // Mark as executing
      executingEffects.set(hookId.current, true);

      try {
        // Clean up previous user cleanup if it exists
        if (userCleanup.current) {
          userCleanup.current();
          userCleanup.current = null;
        }

        // Run user's effect and capture cleanup
        const cleanup = effectFn();
        if (typeof cleanup === "function") {
          userCleanup.current = cleanup;
        }
      } finally {
        // Mark as not executing
        executingEffects.set(hookId.current, false);
      }
    };

    // Create SignalForge effect - this automatically tracks dependencies
    signalCleanup.current = createEffect(wrapped);

    // Cleanup function for React
    return () => {
      // Clean up user's effect
      if (userCleanup.current) {
        userCleanup.current();
      }
      
      // Clean up SignalForge effect (stops tracking)
      if (signalCleanup.current) {
        signalCleanup.current();
      }
      
      // Remove from executing map
      executingEffects.delete(hookId.current);
    };
  }, deps);
}
