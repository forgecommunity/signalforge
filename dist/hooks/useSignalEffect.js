import { useEffect, useRef } from "react";
import { createEffect } from "../core/store";
const executingEffects = new WeakMap();
export function useSignalEffect(effectFn, deps = []) {
    const hookId = useRef({});
    const userCleanup = useRef(null);
    const signalCleanup = useRef(null);
    useEffect(() => {
        const wrapped = () => {
            if (executingEffects.get(hookId.current)) {
                return;
            }
            executingEffects.set(hookId.current, true);
            try {
                if (userCleanup.current) {
                    userCleanup.current();
                    userCleanup.current = null;
                }
                const cleanup = effectFn();
                if (typeof cleanup === "function") {
                    userCleanup.current = cleanup;
                }
            }
            finally {
                executingEffects.set(hookId.current, false);
            }
        };
        signalCleanup.current = createEffect(wrapped);
        return () => {
            if (userCleanup.current) {
                userCleanup.current();
            }
            if (signalCleanup.current) {
                signalCleanup.current();
            }
            executingEffects.delete(hookId.current);
        };
    }, deps);
}
