import { createComputed, createSignal } from '../core/store';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
function assertReactHooksAvailable() {
    if (typeof useState !== 'function' ||
        typeof useEffect !== 'function' ||
        typeof useMemo !== 'function' ||
        typeof useSyncExternalStore !== 'function') {
        throw new Error('[SignalForge] React hooks unavailable. Possible duplicate React instance or invalid bundler resolution.\n' +
            'Troubleshooting:\n' +
            '  1. Ensure only one react copy: node_modules/react (no nested copy under library).\n' +
            '  2. Clear Metro cache: npx react-native start --reset-cache.\n' +
            '  3. Verify metro.config.js extraNodeModules maps react to example app node_modules.');
    }
}
assertReactHooksAvailable();
export function useSignalValue(signal) {
    return useSyncExternalStore((notify) => signal.subscribe(notify), () => signal.get(), () => signal.get());
}
export function useComputed(computeFn, deps = []) {
    const computed = useMemo(() => createComputed(computeFn), deps);
    useEffect(() => () => computed.destroy(), [computed]);
    return useSignalValue(computed);
}
export function useStore(store) {
    return useSignalValue(store.signal);
}
export function useStoreSelector(store, selector, deps = [], equals) {
    const selected = useMemo(() => store.select(selector, equals), [store, equals, ...deps]);
    useEffect(() => () => selected.destroy(), [selected]);
    return useSignalValue(selected);
}
export function useSignal(initialValue) {
    const [signal] = useState(() => {
        const value = typeof initialValue === 'function'
            ? initialValue()
            : initialValue;
        return createSignal(value);
    });
    const value = useSignalValue(signal);
    return [value, signal.set.bind(signal)];
}
