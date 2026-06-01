import { Signal } from '../core/store';
import type { SignalStore, StoreSelectorEquality } from '../core/storeApi';
export declare function useSignalValue<T>(signal: Signal<T>): T;
export declare function useComputed<T>(computeFn: () => T, deps?: any[]): T;
export declare function useStore<T extends Record<string, any>>(store: SignalStore<T>): T;
export declare function useStoreSelector<T extends Record<string, any>, R>(store: SignalStore<T>, selector: (state: T) => R, deps?: any[], equals?: StoreSelectorEquality<R>): R;
export declare function useSignal<T>(initialValue: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
//# sourceMappingURL=useSignal.d.ts.map