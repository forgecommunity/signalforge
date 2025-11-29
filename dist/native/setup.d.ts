declare global {
    var installSignalForgeJSI: (() => boolean) | undefined;
}
export declare function installJSIBindings(): boolean;
export declare function isNativeAvailable(): boolean;
export declare function getRuntimeInfo(): {
    nativeAvailable: boolean;
    engine: "Hermes" | "JSC" | "V8" | "Unknown";
    platform: "Unknown" | "iOS" | "Android" | "Web";
    architecture: string;
};
export declare function runPerformanceBenchmark(): {
    nativeAvailable: boolean;
    operations: number;
    timeMs: number;
    opsPerSecond: number;
} | null;
export declare function printDiagnostics(): void;
declare const _default: {
    installJSIBindings: typeof installJSIBindings;
    isNativeAvailable: typeof isNativeAvailable;
    getRuntimeInfo: typeof getRuntimeInfo;
    runPerformanceBenchmark: typeof runPerformanceBenchmark;
    printDiagnostics: typeof printDiagnostics;
};
export default _default;
//# sourceMappingURL=setup.d.ts.map