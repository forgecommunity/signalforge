import { TurboModule } from 'react-native';
export declare function __ensureTurboModuleLoaded__(): void;
export interface Spec extends TurboModule {
    createSignal(initialValue: any): string;
    getSignal(signalId: string): any;
    setSignal(signalId: string, newValue: any): void;
    hasSignal(signalId: string): boolean;
    deleteSignal(signalId: string): void;
    getSignalVersion(signalId: string): number;
    batchUpdate(updates: Array<[string, any]>): void;
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