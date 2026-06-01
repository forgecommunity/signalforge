import { createComputed, createSignal, } from './store';
export function shallowEqual(previous, next) {
    if (Object.is(previous, next)) {
        return true;
    }
    if (previous === null ||
        next === null ||
        typeof previous !== 'object' ||
        typeof next !== 'object') {
        return false;
    }
    if (Array.isArray(previous) || Array.isArray(next)) {
        if (!Array.isArray(previous) || !Array.isArray(next)) {
            return false;
        }
        if (previous.length !== next.length) {
            return false;
        }
        for (let i = 0; i < previous.length; i++) {
            if (!Object.is(previous[i], next[i])) {
                return false;
            }
        }
        return true;
    }
    const previousKeys = Object.keys(previous);
    const nextKeys = Object.keys(next);
    if (previousKeys.length !== nextKeys.length) {
        return false;
    }
    for (const key of previousKeys) {
        if (!Object.prototype.hasOwnProperty.call(next, key) ||
            !Object.is(previous[key], next[key])) {
            return false;
        }
    }
    return true;
}
export function createStore(initialState) {
    const signal = createSignal(initialState);
    return {
        signal,
        get() {
            return signal.get();
        },
        set(update) {
            if (typeof update === 'function') {
                signal.set(update);
                return;
            }
            signal.set((previous) => ({ ...previous, ...update }));
        },
        select(selector, equals = Object.is) {
            let hasSelection = false;
            let previousSelection;
            return createComputed(() => {
                const nextSelection = selector(signal.get());
                if (hasSelection && equals(previousSelection, nextSelection)) {
                    return previousSelection;
                }
                hasSelection = true;
                previousSelection = nextSelection;
                return nextSelection;
            });
        },
        subscribe(listener) {
            return signal.subscribe(listener);
        },
        destroy() {
            signal.destroy();
        },
    };
}
export function defineStore(factory) {
    return factory();
}
