export interface Signal<T> {
    (): T;
    (value: T | ((prev: T) => T)): void;
    peek(): T;
    subscribe(fn: (value: T) => void): () => void;
}
export interface Computed<T> {
    (): T;
    peek(): T;
}
export declare function signal<T>(initial: T): Signal<T>;
export declare function computed<T>(fn: () => T): Computed<T>;
export declare function effect(fn: () => void | (() => void)): () => void;
export declare function batch<T>(fn: () => T): T;
export declare function untrack<T>(fn: () => T): T;
//# sourceMappingURL=minimal.d.ts.map