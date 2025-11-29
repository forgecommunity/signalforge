import { createSignal } from '../core/store';
import { useState, useEffect } from 'react';
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
export function useSignalValue(signal) {
    const [value, setValue] = useState(() => signal.get());
    useEffect(() => {
        setValue(signal.get());
        return signal.subscribe(() => setValue(signal.get()));
    }, [signal]);
    return value;
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
