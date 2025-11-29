import { Signal } from '../core/store';
export declare function useSignalValue<T>(signal: Signal<T>): T;
export declare function useSignal<T>(initialValue: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
//# sourceMappingURL=useSignal.d.ts.map