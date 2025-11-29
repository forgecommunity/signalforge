export { default as jsiBridge } from './jsiBridge';
export type { SignalRef } from './jsiBridge';
export { installJSIBindings, isNativeAvailable, getRuntimeInfo, runPerformanceBenchmark, printDiagnostics, } from './setup';
export { getNativeModule } from './NativeSignalForge';
export type { Spec as NativeSignalForgeSpec } from './NativeSignalForge';
import jsiBridge from './jsiBridge';
export declare const createSignal: <T = any>(initialValue: T) => import("./jsiBridge").SignalRef, getSignal: <T = any>(signalRef: import("./jsiBridge").SignalRef) => T, setSignal: <T = any>(signalRef: import("./jsiBridge").SignalRef, value: T) => void, hasSignal: (signalRef: import("./jsiBridge").SignalRef) => boolean, deleteSignal: (signalRef: import("./jsiBridge").SignalRef) => void, getSignalVersion: (signalRef: import("./jsiBridge").SignalRef) => number, batchUpdate: (updates: [import("./jsiBridge").SignalRef, any][]) => void, isUsingNative: () => boolean, getImplementationInfo: () => {
    native: boolean;
    engine: string;
    features: {
        directMemoryAccess: boolean;
        atomicOperations: boolean;
        threadSafe: boolean;
        sharedPtrManagement: boolean;
    };
};
export default jsiBridge;
//# sourceMappingURL=index.d.ts.map