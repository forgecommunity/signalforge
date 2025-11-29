import { Signal, ComputedSignal } from '../core/store';
export declare function derive<T extends any[], R>(sources: {
    [K in keyof T]: Signal<T[K]>;
}, deriveFn: (...values: T) => R): ComputedSignal<R>;
export declare function combine<T extends any[]>(signals: {
    [K in keyof T]: Signal<T[K]>;
}): ComputedSignal<T>;
export declare function map<T, R>(signal: Signal<T>, mapFn: (value: T) => R): ComputedSignal<R>;
export declare function filter<T>(signal: Signal<T>, predicate: (value: T) => boolean, defaultValue: T): ComputedSignal<T>;
export declare function memo<T>(signal: Signal<T>, equals?: (a: T, b: T) => boolean): ComputedSignal<T>;
export type ResourceState<T> = {
    status: 'pending';
    data: undefined;
    error: undefined;
} | {
    status: 'success';
    data: T;
    error: undefined;
} | {
    status: 'error';
    data: undefined;
    error: Error;
};
export declare function createResource<T>(fetcher: () => Promise<T>): Signal<ResourceState<T>>;
export declare function debounce<T>(signal: Signal<T>, delayMs: number): Signal<T>;
export declare function throttle<T>(signal: Signal<T>, intervalMs: number): Signal<T>;
export interface ArraySignal<T> extends Signal<T[]> {
    push(...items: T[]): void;
    pop(): T | undefined;
    filter(predicate: (value: T, index: number) => boolean): void;
    map<R>(mapFn: (value: T, index: number) => R): R[];
    find(predicate: (value: T, index: number) => boolean): T | undefined;
    remove(item: T): void;
    clear(): void;
    readonly length: number;
}
export declare function createArraySignal<T>(initialArray?: T[]): ArraySignal<T>;
export interface RecordSignal<T> extends Signal<Record<string, T>> {
    setKey(key: string, value: T): void;
    deleteKey(key: string): void;
    hasKey(key: string): boolean;
    getKey(key: string): T | undefined;
    keys(): string[];
    values(): T[];
    entries(): [string, T][];
    clear(): void;
}
export declare function createRecordSignal<T>(initialRecord?: Record<string, T>): RecordSignal<T>;
export declare function monitor<T>(signal: Signal<T>, label: string): Signal<T>;
export { createSignal, createComputed, createEffect, batch, untrack, flushSync, } from '../core/store';
export { getStorageAdapter, resetStorageAdapter, createStorageAdapter, detectEnvironment, safeStringify, safeParse, persist, createPersistentSignal, type StorageAdapter, type StorageOptions, type PersistOptions, type Environment, } from './storageAdapter';
export { benchmarkSignalUpdates, benchmarkBatchedUpdates, compareWithRedux, compareWithZustand, benchmarkMemoryUsage, runBenchmarkSuite, logResults, getResults, clearResults, exportResults, customBenchmark, type BenchmarkResult, } from './benchmark';
//# sourceMappingURL=index.d.ts.map