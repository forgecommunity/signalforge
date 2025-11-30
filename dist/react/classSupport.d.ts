import type { ComponentType } from 'react';
import type { Signal } from '../core/store';
export type SignalValues<Signals extends Record<string, Signal<any>>> = {
    [K in keyof Signals]: Signals[K] extends Signal<infer T> ? T : never;
};
export declare function withSignals<P extends object, Signals extends Record<string, Signal<any>>>(WrappedComponent: ComponentType<P & SignalValues<Signals>>, signals: Signals, options?: {
    displayName?: string;
}): ComponentType<P>;
export declare function withSignalValue<P extends object, T>(WrappedComponent: ComponentType<P & {
    value: T;
}>, signal: Signal<T>, options?: {
    displayName?: string;
}): ComponentType<P>;
//# sourceMappingURL=classSupport.d.ts.map