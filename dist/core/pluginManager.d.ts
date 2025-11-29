import { Plugin, PluginContext } from './plugins';
export declare function registerPlugin(name: string, plugin: Plugin, options?: {
    enabled?: boolean;
}): Promise<void>;
export declare function enablePlugin(name: string): Promise<boolean>;
export declare function disablePlugin(name: string): Promise<boolean>;
export declare function unregisterPlugin(name: string): Promise<boolean>;
export declare function getPlugin(name: string): Plugin | undefined;
export declare function isPluginEnabled(name: string): boolean;
export declare function getAllPlugins(): Array<{
    name: string;
    plugin: Plugin;
    enabled: boolean;
    registeredAt: number;
    enabledAt: number | null;
    disabledAt: number | null;
    metadata: {
        enableCount: number;
        disableCount: number;
        errorCount: number;
    };
}>;
export declare function getPluginStats(): {
    total: number;
    enabled: number;
    disabled: number;
    totalErrors: number;
};
export declare function clearAllPlugins(): Promise<void>;
export declare function printPluginStatus(): void;
export declare class LoggerPlugin {
    private verbose;
    private logCreates;
    private logUpdates;
    private logDestroys;
    private startTime;
    constructor(options?: {
        verbose?: boolean;
        logCreates?: boolean;
        logUpdates?: boolean;
        logDestroys?: boolean;
    });
    private getElapsedTime;
    private formatTimestamp;
    getPlugin(): Plugin;
}
export declare class TimeTravelPlugin {
    private maxHistory;
    private history;
    private future;
    private snapshots;
    constructor(options?: {
        maxHistory?: number;
    });
    getPlugin(): Plugin;
    undo(): boolean;
    redo(): boolean;
    getHistory(): ReadonlyArray<Readonly<PluginContext<any>>>;
    getHistoryForSignal(signalId: string): ReadonlyArray<Readonly<PluginContext<any>>>;
    createSnapshot(name: string): void;
    restoreSnapshot(name: string): boolean;
    listSnapshots(): string[];
    clear(): void;
    getStats(): {
        historySize: number;
        futureSize: number;
        snapshotCount: number;
        maxHistory: number;
    };
    printHistory(limit?: number): void;
}
export declare function __getPluginInfoForDevTools(): Array<{
    name: string;
    version?: string;
    enabled: boolean;
    registeredAt: string;
    stats: {
        enableCount: number;
        disableCount: number;
        errorCount: number;
    };
}>;
export type { Plugin, SignalMetadata, PluginContext, } from './plugins';
//# sourceMappingURL=pluginManager.d.ts.map