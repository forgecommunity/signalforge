import { TurboModule } from 'react-native';
export declare function __ensureTurboModuleLoaded__(): void;
export interface Spec extends TurboModule {
    createSignal(initialValue: Object): string;
    getSignal(signalId: string): Object;
    setSignal(signalId: string, newValue: Object): void;
    hasSignal(signalId: string): boolean;
    deleteSignal(signalId: string): void;
    getSignalVersion(signalId: string): number;
    batchUpdate(updates: Array<[string, Object]>): void;
    getSignalCount(): number;
    clearAllSignals(): void;
    getMetadata(): {
        version: string;
        buildType: 'Debug' | 'Release';
        threadSafe: boolean;
        supportsAtomic: boolean;
    };
}
export declare function getNativeModule(): Spec | null;
declare const _default: Spec | null;
export default _default;
//# sourceMappingURL=NativeSignalForge.d.ts.map