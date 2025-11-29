export interface SignalMetadata {
    id: string;
    type: 'signal' | 'computed' | 'effect';
    createdAt: number;
    label?: string;
}
export interface PluginContext<T = any> {
    signal: SignalMetadata;
    oldValue?: T;
    newValue: T;
    timestamp: number;
    source?: 'set' | 'compute' | 'init';
}
export interface Plugin {
    name: string;
    version?: string;
    onSignalCreate?<T>(metadata: SignalMetadata, initialValue: T): void;
    onBeforeUpdate?<T>(context: PluginContext<T>): T | undefined;
    onSignalUpdate?<T>(context: PluginContext<T>): void;
    onSignalDestroy?(metadata: SignalMetadata): void;
    onRegister?(): void;
    onUnregister?(): void;
}
export declare function registerPlugin(plugin: Plugin): void;
export declare function unregisterPlugin(pluginNameOrInstance: string | Plugin): boolean;
export declare function getRegisteredPlugins(): readonly Plugin[];
export declare function clearPlugins(): void;
export declare function enablePlugins(): void;
export declare function disablePlugins(): void;
export declare function arePluginsEnabled(): boolean;
export declare function __registerSignal<T>(type: 'signal' | 'computed' | 'effect', initialValue: T, label?: string): SignalMetadata;
export declare function __notifyBeforeUpdate<T>(signalId: string, oldValue: T, newValue: T, source?: 'set' | 'compute' | 'init'): T | undefined;
export declare function __notifyAfterUpdate<T>(signalId: string, oldValue: T, newValue: T, source?: 'set' | 'compute' | 'init'): void;
export declare function __notifySignalDestroy(signalId: string): void;
export declare function __getSignalMetadata(signalId: string): SignalMetadata | undefined;
export declare function createLoggerPlugin(options?: {
    verbose?: boolean;
    logCreates?: boolean;
    logUpdates?: boolean;
    logDestroys?: boolean;
}): Plugin;
export interface HistoryEntry {
    signalId: string;
    oldValue: any;
    newValue: any;
    timestamp: number;
}
export declare function createTimeTravelPlugin(options?: {
    maxHistory?: number;
}): {
    plugin: Plugin;
    undo(): boolean;
    redo(): boolean;
    getHistory(): readonly HistoryEntry[];
    clear(): void;
    readonly historySize: number;
    readonly futureSize: number;
};
export interface PerformanceMetrics {
    totalUpdates: number;
    updatesBySignal: Map<string, number>;
    averageUpdateTime: number;
    slowestUpdate: {
        signalId: string;
        duration: number;
    } | null;
}
export declare function createPerformancePlugin(): {
    plugin: Plugin;
    getMetrics(): Readonly<PerformanceMetrics>;
    reset(): void;
    printMetrics(): void;
};
export declare function createValidationPlugin(validators: Record<string, (value: any) => boolean>): Plugin;
//# sourceMappingURL=plugins.d.ts.map