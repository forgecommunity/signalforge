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
const NATIVE_AVAILABLE = isNativeAvailable();
let jsStore = null;
const getJsStore = () => {
    if (!jsStore) {
        throw new Error('JavaScript fallback store not initialized. Native JSI bindings required.');
    }
    return jsStore;
};
export const createSignal = (initialValue) => {
    if (NATIVE_AVAILABLE) {
        const id = global.__signalForgeCreateSignal(initialValue);
        return { id };
    }
    const store = getJsStore();
    const signal = store.createSignal(initialValue);
    return { id: signal.__id || String(Math.random()) };
};
export const getSignal = (signalRef) => {
    if (NATIVE_AVAILABLE) {
        return global.__signalForgeGetSignal(signalRef.id);
    }
    const store = getJsStore();
    throw new Error('JavaScript fallback for getSignal not fully implemented');
};
export const setSignal = (signalRef, value) => {
    if (NATIVE_AVAILABLE) {
        global.__signalForgeSetSignal(signalRef.id, value);
        return;
    }
    const store = getJsStore();
    throw new Error('JavaScript fallback for setSignal not fully implemented');
};
export const hasSignal = (signalRef) => {
    if (NATIVE_AVAILABLE) {
        return global.__signalForgeHasSignal(signalRef.id);
    }
    return false;
};
export const deleteSignal = (signalRef) => {
    if (NATIVE_AVAILABLE) {
        global.__signalForgeDeleteSignal(signalRef.id);
        return;
    }
};
export const getSignalVersion = (signalRef) => {
    if (NATIVE_AVAILABLE) {
        return global.__signalForgeGetVersion(signalRef.id);
    }
    return 0;
};
export const batchUpdate = (updates) => {
    if (NATIVE_AVAILABLE) {
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
    return NATIVE_AVAILABLE;
};
export const getImplementationInfo = () => {
    return {
        native: NATIVE_AVAILABLE,
        engine: NATIVE_AVAILABLE
            ? (typeof HermesInternal !== 'undefined' ? 'Hermes' : 'JSC')
            : 'JavaScript',
        features: {
            directMemoryAccess: NATIVE_AVAILABLE,
            atomicOperations: NATIVE_AVAILABLE,
            threadSafe: NATIVE_AVAILABLE,
            sharedPtrManagement: NATIVE_AVAILABLE,
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
