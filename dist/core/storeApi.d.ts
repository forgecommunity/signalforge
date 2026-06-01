import { type ComputedSignal, type Signal } from './store';
export type StoreUpdater<T> = Partial<T> | ((previous: T) => T);
export type StoreSelectorEquality<T> = (previous: T, next: T) => boolean;
export declare function shallowEqual<T>(previous: T, next: T): boolean;
export interface SignalStore<T extends Record<string, any>> {
    readonly signal: Signal<T>;
    get(): T;
    set(update: StoreUpdater<T>): void;
    select<R>(selector: (state: T) => R, equals?: StoreSelectorEquality<R>): ComputedSignal<R>;
    subscribe(listener: (state: T) => void): () => void;
    destroy(): void;
}
export declare function createStore<T extends Record<string, any>>(initialState: T): SignalStore<T>;
export declare function defineStore<TStore>(factory: () => TStore): TStore;
//# sourceMappingURL=storeApi.d.ts.map