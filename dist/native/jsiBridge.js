import { createSignal as createJsSignal } from '../core/store';
const isNativeAvailable = () => {
    return (typeof global !== 'undefined' &&
        typeof global.__signalForgeCreateSignal === 'function' &&
        typeof global.__signalForgeGetSignal === 'function' &&
        typeof global.__signalForgeSetSignal === 'function' &&
        typeof global.__signalForgeHasSignal === 'function' &&
        typeof global.__signalForgeDeleteSignal === 'function' &&
        typeof global.__signalForgeGetVersion === 'function' &&
        typeof global.__signalForgeBatchUpdate === 'function');
};
const NATIVE_PRESENT_AT_LOAD = isNativeAvailable();
try {
    if (!NATIVE_PRESENT_AT_LOAD) {
        const { installJSIBindings } = require('./setup');
        installJSIBindings();
    }
}
catch (error) {
}
const NATIVE_READY = isNativeAvailable();
let jsStore = null;
const getJsStore = () => {
    if (!jsStore) {
        let nextId = 0;
        const signals = new Map();
        jsStore = {
            createSignal(value) {
                const id = `js_${++nextId}`;
                signals.set(id, { signal: createJsSignal(value), version: 0 });
                return { __id: id };
            },
            getSignal(id) {
                const entry = signals.get(id);
                if (!entry) {
                    throw new Error(`Signal "${id}" does not exist`);
                }
                return entry.signal.get();
            },
            setSignal(id, value) {
                const entry = signals.get(id);
                if (!entry) {
                    throw new Error(`Signal "${id}" does not exist`);
                }
                const previous = entry.signal.get();
                entry.signal.set(value);
                if (!Object.is(previous, entry.signal.get())) {
                    entry.version++;
                }
            },
            hasSignal(id) {
                return signals.has(id);
            },
            deleteSignal(id) {
                const entry = signals.get(id);
                if (entry) {
                    entry.signal.destroy();
                    signals.delete(id);
                }
            },
            getSignalVersion(id) {
                return signals.get(id)?.version ?? 0;
            },
        };
    }
    return jsStore;
};
export const createSignal = (initialValue) => {
    if (NATIVE_READY) {
        const id = global.__signalForgeCreateSignal(initialValue);
        return { id };
    }
    const store = getJsStore();
    const signal = store.createSignal(initialValue);
    return { id: signal.__id || String(Math.random()) };
};
export const getSignal = (signalRef) => {
    if (NATIVE_READY) {
        return global.__signalForgeGetSignal(signalRef.id);
    }
    const store = getJsStore();
    return store.getSignal(signalRef.id);
};
export const setSignal = (signalRef, value) => {
    if (NATIVE_READY) {
        global.__signalForgeSetSignal(signalRef.id, value);
        return;
    }
    const store = getJsStore();
    store.setSignal(signalRef.id, value);
};
export const hasSignal = (signalRef) => {
    if (NATIVE_READY) {
        return global.__signalForgeHasSignal(signalRef.id);
    }
    const store = getJsStore();
    return store.hasSignal(signalRef.id);
};
export const deleteSignal = (signalRef) => {
    if (NATIVE_READY) {
        global.__signalForgeDeleteSignal(signalRef.id);
        return;
    }
    const store = getJsStore();
    store.deleteSignal(signalRef.id);
};
export const getSignalVersion = (signalRef) => {
    if (NATIVE_READY) {
        return global.__signalForgeGetVersion(signalRef.id);
    }
    const store = getJsStore();
    return store.getSignalVersion(signalRef.id);
};
export const batchUpdate = (updates) => {
    if (NATIVE_READY) {
        const nativeUpdates = updates.map(([ref, value]) => [
            ref.id,
            value,
        ]);
        global.__signalForgeBatchUpdate(nativeUpdates);
        return;
    }
    for (const [ref, value] of updates) {
        setSignal(ref, value);
    }
};
export const isUsingNative = () => {
    return NATIVE_READY;
};
export const getImplementationInfo = () => {
    return {
        native: NATIVE_READY,
        engine: NATIVE_READY
            ? (typeof HermesInternal !== 'undefined' ? 'Hermes' : 'JSC')
            : 'JavaScript',
        features: {
            directMemoryAccess: NATIVE_READY,
            atomicOperations: NATIVE_READY,
            threadSafe: NATIVE_READY,
            sharedPtrManagement: NATIVE_READY,
        },
    };
};
export default {
    createSignal,
    getSignal,
    setSignal,
    hasSignal,
    deleteSignal,
    getSignalVersion,
    batchUpdate,
    isUsingNative,
    getImplementationInfo,
};
