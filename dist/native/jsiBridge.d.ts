export interface SignalRef {
    id: string;
}
declare global {
    var __signalForgeCreateSignal: ((initialValue: any) => string) | undefined;
    var __signalForgeGetSignal: ((signalId: string) => any) | undefined;
    var __signalForgeSetSignal: ((signalId: string, value: any) => void) | undefined;
    var __signalForgeHasSignal: ((signalId: string) => boolean) | undefined;
    var __signalForgeDeleteSignal: ((signalId: string) => void) | undefined;
    var __signalForgeGetVersion: ((signalId: string) => number) | undefined;
    var __signalForgeBatchUpdate: ((updates: [string, any][]) => void) | undefined;
}
export declare const createSignal: <T = any>(initialValue: T) => SignalRef;
export declare const getSignal: <T = any>(signalRef: SignalRef) => T;
export declare const setSignal: <T = any>(signalRef: SignalRef, value: T) => void;
export declare const hasSignal: (signalRef: SignalRef) => boolean;
export declare const deleteSignal: (signalRef: SignalRef) => void;
export declare const getSignalVersion: (signalRef: SignalRef) => number;
export declare const batchUpdate: (updates: [SignalRef, any][]) => void;
export declare const isUsingNative: () => boolean;
export declare const getImplementationInfo: () => {
    native: boolean;
    engine: string;
    features: {
        directMemoryAccess: boolean;
        atomicOperations: boolean;
        threadSafe: boolean;
        sharedPtrManagement: boolean;
    };
};
declare const _default: {
    createSignal: <T = any>(initialValue: T) => SignalRef;
    getSignal: <T = any>(signalRef: SignalRef) => T;
    setSignal: <T = any>(signalRef: SignalRef, value: T) => void;
    hasSignal: (signalRef: SignalRef) => boolean;
    deleteSignal: (signalRef: SignalRef) => void;
    getSignalVersion: (signalRef: SignalRef) => number;
    batchUpdate: (updates: [SignalRef, any][]) => void;
    isUsingNative: () => boolean;
    getImplementationInfo: () => {
        native: boolean;
        engine: string;
        features: {
            directMemoryAccess: boolean;
            atomicOperations: boolean;
            threadSafe: boolean;
            sharedPtrManagement: boolean;
        };
    };
};
export default _default;
//# sourceMappingURL=jsiBridge.d.ts.map