export declare function getSignalById<T = any>(id: string): Signal<T> | undefined;
export declare function getAllSignalIds(): string[];
export declare function getSignalId<T>(signal: Signal<T>): string | undefined;
export interface Signal<T> {
    get(): T;
    set(value: T | ((prev: T) => T)): void;
    subscribe(listener: (value: T) => void): () => void;
    destroy(): void;
    _node: any;
    _peek?: () => T;
    _addSubscriber?: (subscriber: any) => void;
    _removeSubscriber?: (subscriber: any) => void;
}
export interface ComputedSignal<T> extends Signal<T> {
    set(value: never): never;
    _markDirty?: () => void;
    _recompute?: () => void;
}
export declare function createSignal<T>(initialValue: T): Signal<T>;
export declare function createComputed<T>(computeFn: () => T): ComputedSignal<T>;
export declare function createEffect(effectFn: () => void): () => void;
export declare function batch<T>(fn: () => T): T;
export declare function flushBatchSync(): void;
export declare function untrack<T>(fn: () => T): T;
export declare function getPerformanceStats(): {
    poolUsage: number;
    queueLength: number;
    contextDepth: number;
};
export declare const flushSync: typeof flushBatchSync;
export declare function resetPerformanceState(): void;
//# sourceMappingURL=store.d.ts.map