import { createSignal, createEffect } from '../core/store';
export function detectEnvironment() {
    if (typeof window === 'undefined') {
        return 'node';
    }
    if (typeof global !== 'undefined') {
        const g = global;
        if (g.HermesInternal ||
            g.__fbBatchedBridgeConfig ||
            g.nativeModuleProxy) {
            return 'react-native';
        }
    }
    if (typeof navigator !== 'undefined' &&
        navigator.product === 'ReactNative') {
        return 'react-native';
    }
    if (typeof window !== 'undefined' &&
        typeof document !== 'undefined' &&
        typeof window.localStorage !== 'undefined') {
        return 'web';
    }
    return 'node';
}
export function safeStringify(value, devMode = false) {
    const seen = new WeakSet();
    try {
        return JSON.stringify(value, (key, val) => {
            if (val === undefined) {
                return '__undefined__';
            }
            if (val === null) {
                return null;
            }
            if (typeof val === 'function') {
                if (devMode) {
                    console.warn(`[StorageAdapter] Cannot serialize function at key "${key}". Skipping.`);
                }
                return '__function__';
            }
            if (val instanceof Date) {
                return { __type__: 'Date', value: val.toISOString() };
            }
            if (val instanceof RegExp) {
                return { __type__: 'RegExp', value: val.toString() };
            }
            if (typeof val === 'object' && val !== null) {
                if (seen.has(val)) {
                    if (devMode) {
                        console.warn(`[StorageAdapter] Circular reference detected at key "${key}". Replacing with null.`);
                    }
                    return '__circular__';
                }
                seen.add(val);
            }
            return val;
        });
    }
    catch (error) {
        if (devMode) {
            console.error('[StorageAdapter] Serialization error:', error);
        }
        try {
            return JSON.stringify(value);
        }
        catch {
            return '{}';
        }
    }
}
export function safeParse(json, devMode = false) {
    try {
        return JSON.parse(json, (key, val) => {
            if (val === '__undefined__') {
                return undefined;
            }
            if (val === '__function__') {
                return undefined;
            }
            if (val === '__circular__') {
                return null;
            }
            if (val && typeof val === 'object') {
                if (val.__type__ === 'Date') {
                    return new Date(val.value);
                }
                if (val.__type__ === 'RegExp') {
                    const match = val.value.match(/^\/(.+)\/([gimuy]*)$/);
                    if (match) {
                        return new RegExp(match[1], match[2]);
                    }
                }
            }
            return val;
        });
    }
    catch (error) {
        if (devMode) {
            console.error('[StorageAdapter] Deserialization error:', error);
        }
        return null;
    }
}
class WebStorageAdapter {
    constructor(options = {}) {
        this.prefix = options.prefix || 'signalforge_';
        this.devMode = options.devMode ?? isDev;
        this.serialize = options.serialize || ((v) => safeStringify(v, this.devMode));
        this.deserialize = options.deserialize || ((v) => safeParse(v, this.devMode));
    }
    getKey(key) {
        return `${this.prefix}${key}`;
    }
    async load(key) {
        try {
            const data = localStorage.getItem(this.getKey(key));
            if (data === null) {
                return null;
            }
            return this.deserialize(data);
        }
        catch (error) {
            if (this.devMode) {
                console.error(`[StorageAdapter] Failed to load "${key}":`, error);
            }
            return null;
        }
    }
    async save(key, value) {
        try {
            const serialized = this.serialize(value);
            localStorage.setItem(this.getKey(key), serialized);
        }
        catch (error) {
            if (this.devMode) {
                console.error(`[StorageAdapter] Failed to save "${key}":`, error);
            }
            throw error;
        }
    }
    async clear(key) {
        try {
            localStorage.removeItem(this.getKey(key));
        }
        catch (error) {
            if (this.devMode) {
                console.error(`[StorageAdapter] Failed to clear "${key}":`, error);
            }
            throw error;
        }
    }
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        }
        catch {
            return false;
        }
    }
    async getAllKeys() {
        try {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    keys.push(key.slice(this.prefix.length));
                }
            }
            return keys;
        }
        catch (error) {
            if (this.devMode) {
                console.error('[StorageAdapter] Failed to get all keys:', error);
            }
            return [];
        }
    }
    async clearAll() {
        try {
            const keys = await this.getAllKeys();
            for (const key of keys) {
                await this.clear(key);
            }
        }
        catch (error) {
            if (this.devMode) {
                console.error('[StorageAdapter] Failed to clear all:', error);
            }
            throw error;
        }
    }
}
class ReactNativeStorageAdapter {
    constructor(options = {}) {
        this.prefix = options.prefix || 'signalforge_';
        this.devMode = options.devMode ?? isDev;
        this.serialize = options.serialize || ((v) => safeStringify(v, this.devMode));
        this.deserialize = options.deserialize || ((v) => safeParse(v, this.devMode));
        try {
            this.AsyncStorage = require('@react-native-async-storage/async-storage').default;
        }
        catch {
            try {
                this.AsyncStorage = require('react-native').AsyncStorage;
            }
            catch (error) {
                if (this.devMode) {
                    console.error('[StorageAdapter] AsyncStorage not found. ' +
                        'Install @react-native-async-storage/async-storage');
                }
                this.AsyncStorage = null;
            }
        }
    }
    getKey(key) {
        return `${this.prefix}${key}`;
    }
    async load(key) {
        if (!this.AsyncStorage) {
            if (this.devMode) {
                console.warn('[StorageAdapter] AsyncStorage not available');
            }
            return null;
        }
        try {
            const data = await this.AsyncStorage.getItem(this.getKey(key));
            if (data === null) {
                return null;
            }
            return this.deserialize(data);
        }
        catch (error) {
            if (this.devMode) {
                console.error(`[StorageAdapter] Failed to load "${key}":`, error);
            }
            return null;
        }
    }
    async save(key, value) {
        if (!this.AsyncStorage) {
            if (this.devMode) {
                console.warn('[StorageAdapter] AsyncStorage not available');
            }
            return;
        }
        try {
            const serialized = this.serialize(value);
            await this.AsyncStorage.setItem(this.getKey(key), serialized);
        }
        catch (error) {
            if (this.devMode) {
                console.error(`[StorageAdapter] Failed to save "${key}":`, error);
            }
            throw error;
        }
    }
    async clear(key) {
        if (!this.AsyncStorage) {
            if (this.devMode) {
                console.warn('[StorageAdapter] AsyncStorage not available');
            }
            return;
        }
        try {
            await this.AsyncStorage.removeItem(this.getKey(key));
        }
        catch (error) {
            if (this.devMode) {
                console.error(`[StorageAdapter] Failed to clear "${key}":`, error);
            }
            throw error;
        }
    }
    isAvailable() {
        return this.AsyncStorage !== null;
    }
    async getAllKeys() {
        if (!this.AsyncStorage) {
            return [];
        }
        try {
            const allKeys = await this.AsyncStorage.getAllKeys();
            return allKeys
                .filter((key) => key.startsWith(this.prefix))
                .map((key) => key.slice(this.prefix.length));
        }
        catch (error) {
            if (this.devMode) {
                console.error('[StorageAdapter] Failed to get all keys:', error);
            }
            return [];
        }
    }
    async clearAll() {
        if (!this.AsyncStorage) {
            return;
        }
        try {
            const keys = await this.getAllKeys();
            const prefixedKeys = keys.map(k => this.getKey(k));
            await this.AsyncStorage.multiRemove(prefixedKeys);
        }
        catch (error) {
            if (this.devMode) {
                console.error('[StorageAdapter] Failed to clear all:', error);
            }
            throw error;
        }
    }
}
class MemoryStorageAdapter {
    constructor(options = {}) {
        this.storage = new Map();
        this.prefix = options.prefix || 'signalforge_';
        this.devMode = options.devMode ?? isDev;
        if (this.devMode) {
            console.warn('[StorageAdapter] Using in-memory storage. Data will not persist across restarts.');
        }
    }
    getKey(key) {
        return `${this.prefix}${key}`;
    }
    async load(key) {
        const data = this.storage.get(this.getKey(key));
        return data !== undefined ? data : null;
    }
    async save(key, value) {
        const cloned = JSON.parse(JSON.stringify(value));
        this.storage.set(this.getKey(key), cloned);
    }
    async clear(key) {
        this.storage.delete(this.getKey(key));
    }
    isAvailable() {
        return true;
    }
    async getAllKeys() {
        const keys = [];
        for (const key of this.storage.keys()) {
            if (key.startsWith(this.prefix)) {
                keys.push(key.slice(this.prefix.length));
            }
        }
        return keys;
    }
    async clearAll() {
        const keys = await this.getAllKeys();
        for (const key of keys) {
            this.storage.delete(this.getKey(key));
        }
    }
}
let globalAdapter = null;
export function getStorageAdapter(options = {}) {
    if (globalAdapter) {
        return globalAdapter;
    }
    const env = detectEnvironment();
    switch (env) {
        case 'web':
            globalAdapter = new WebStorageAdapter(options);
            break;
        case 'react-native':
            globalAdapter = new ReactNativeStorageAdapter(options);
            break;
        case 'node':
        case 'unknown':
        default:
            globalAdapter = new MemoryStorageAdapter(options);
            break;
    }
    return globalAdapter;
}
export function resetStorageAdapter() {
    globalAdapter = null;
}
export function createStorageAdapter(env = detectEnvironment(), options = {}) {
    switch (env) {
        case 'web':
            return new WebStorageAdapter(options);
        case 'react-native':
            return new ReactNativeStorageAdapter(options);
        case 'node':
        case 'unknown':
        default:
            return new MemoryStorageAdapter(options);
    }
}
export function persist(signal, options = {}) {
    const adapter = options.adapter || getStorageAdapter();
    const key = options.key || `signal_${Math.random().toString(36).slice(2)}`;
    const serialize = options.serialize || ((v) => v);
    const deserialize = options.deserialize || ((v) => v);
    adapter
        .load(key)
        .then((stored) => {
        if (stored !== null) {
            try {
                const deserialized = deserialize(stored);
                signal.set(deserialized);
            }
            catch (error) {
                if (options.onError) {
                    options.onError(error);
                }
            }
        }
    })
        .catch((error) => {
        if (options.onError) {
            options.onError(error);
        }
    });
    let saveTimer;
    const cleanup = createEffect(() => {
        const value = signal.get();
        const doSave = () => {
            try {
                const serialized = serialize(value);
                adapter.save(key, serialized).catch((error) => {
                    if (options.onError) {
                        options.onError(error);
                    }
                });
            }
            catch (error) {
                if (options.onError) {
                    options.onError(error);
                }
            }
        };
        if (options.debounce) {
            if (saveTimer !== undefined) {
                clearTimeout(saveTimer);
            }
            saveTimer = setTimeout(doSave, options.debounce);
        }
        else {
            doSave();
        }
    });
    return () => {
        cleanup();
        if (saveTimer !== undefined) {
            clearTimeout(saveTimer);
        }
    };
}
export function createPersistentSignal(key, initialValue, options = {}) {
    const signal = createSignal(initialValue);
    persist(signal, { ...options, key });
    return signal;
}
const isDev = typeof globalThis.__DEV__ !== 'undefined'
    ? globalThis.__DEV__
    : process.env.NODE_ENV !== 'production';
