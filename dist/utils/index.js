import { createSignal, createComputed, createEffect } from '../core/store';
export function derive(sources, deriveFn) {
    return createComputed(() => {
        const values = sources.map(s => s.get());
        return deriveFn(...values);
    });
}
export function combine(signals) {
    return createComputed(() => signals.map(s => s.get()));
}
export function map(signal, mapFn) {
    return createComputed(() => mapFn(signal.get()));
}
export function filter(signal, predicate, defaultValue) {
    return createComputed(() => {
        const value = signal.get();
        return predicate(value) ? value : defaultValue;
    });
}
export function memo(signal, equals = Object.is) {
    let lastValue = (signal._peek ? signal._peek() : signal.get());
    return createComputed(() => {
        const current = signal.get();
        if (!equals(current, lastValue)) {
            lastValue = current;
        }
        return lastValue;
    });
}
export function createResource(fetcher) {
    const state = createSignal({
        status: 'pending',
        data: undefined,
        error: undefined,
    });
    fetcher()
        .then(data => {
        state.set({ status: 'success', data, error: undefined });
    })
        .catch(error => {
        state.set({ status: 'error', data: undefined, error });
    });
    return state;
}
export function debounce(signal, delayMs) {
    const debounced = createSignal((signal._peek ? signal._peek() : signal.get()));
    let timeoutId;
    createEffect(() => {
        const value = signal.get();
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            debounced.set(value);
        }, delayMs);
    });
    return debounced;
}
export function throttle(signal, intervalMs) {
    const throttled = createSignal((signal._peek ? signal._peek() : signal.get()));
    let lastUpdate = 0;
    let pending;
    let timeoutId;
    createEffect(() => {
        const value = signal.get();
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdate;
        if (timeSinceLastUpdate >= intervalMs) {
            throttled.set(value);
            lastUpdate = now;
            pending = undefined;
        }
        else {
            pending = value;
            if (timeoutId === undefined) {
                timeoutId = setTimeout(() => {
                    if (pending !== undefined) {
                        throttled.set(pending);
                        lastUpdate = Date.now();
                        pending = undefined;
                    }
                    timeoutId = undefined;
                }, intervalMs - timeSinceLastUpdate);
            }
        }
    });
    return throttled;
}
export function createArraySignal(initialArray = []) {
    const signal = createSignal(initialArray);
    return {
        ...signal,
        push(...items) {
            signal.set(prev => [...prev, ...items]);
        },
        pop() {
            let popped;
            signal.set(prev => {
                const next = [...prev];
                popped = next.pop();
                return next;
            });
            return popped;
        },
        filter(predicate) {
            signal.set(prev => prev.filter(predicate));
        },
        map(mapFn) {
            return signal.get().map(mapFn);
        },
        find(predicate) {
            return signal.get().find(predicate);
        },
        remove(item) {
            signal.set(prev => prev.filter(i => i !== item));
        },
        clear() {
            signal.set([]);
        },
        get length() {
            return signal.get().length;
        },
    };
}
export function createRecordSignal(initialRecord = {}) {
    const signal = createSignal(initialRecord);
    return {
        ...signal,
        setKey(key, value) {
            signal.set(prev => ({ ...prev, [key]: value }));
        },
        deleteKey(key) {
            signal.set(prev => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        },
        hasKey(key) {
            return key in signal.get();
        },
        getKey(key) {
            return signal.get()[key];
        },
        keys() {
            return Object.keys(signal.get());
        },
        values() {
            return Object.values(signal.get());
        },
        entries() {
            return Object.entries(signal.get());
        },
        clear() {
            signal.set({});
        },
    };
}
export function monitor(signal, label) {
    let readCount = 0;
    let writeCount = 0;
    let totalReadTime = 0;
    let totalWriteTime = 0;
    return {
        get() {
            const start = performance.now();
            const value = signal.get();
            const duration = performance.now() - start;
            readCount++;
            totalReadTime += duration;
            if (readCount % 100 === 0) {
                console.log(`[${label}] Reads: ${readCount}, Avg: ${(totalReadTime / readCount).toFixed(3)}ms`);
            }
            return value;
        },
        set(value) {
            const start = performance.now();
            signal.set(value);
            const duration = performance.now() - start;
            writeCount++;
            totalWriteTime += duration;
            console.log(`[${label}] Write #${writeCount}: ${duration.toFixed(3)}ms`);
        },
        subscribe: signal.subscribe.bind(signal),
        destroy: signal.destroy.bind(signal),
        _node: signal._node,
        _addSubscriber: signal._addSubscriber ? signal._addSubscriber.bind(signal) : undefined,
        _removeSubscriber: signal._removeSubscriber ? signal._removeSubscriber.bind(signal) : undefined,
        _peek: signal._peek ? signal._peek.bind(signal) : undefined,
    };
}
export { createSignal, createComputed, createEffect, batch, untrack, flushSync, } from '../core/store';
export { getStorageAdapter, resetStorageAdapter, createStorageAdapter, detectEnvironment, safeStringify, safeParse, persist, createPersistentSignal, } from './storageAdapter';
export { benchmarkSignalUpdates, benchmarkBatchedUpdates, compareWithRedux, compareWithZustand, benchmarkMemoryUsage, runBenchmarkSuite, logResults, getResults, clearResults, exportResults, customBenchmark, } from './benchmark';
