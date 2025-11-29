import type { Signal } from '../core/store';
export interface DevToolsConfig {
    enabled: boolean;
    trackPerformance: boolean;
    logToConsole: boolean;
    maxPerformanceSamples: number;
    flipperEnabled: boolean;
}
export interface SignalMetadata {
    id: string;
    type: 'signal' | 'computed' | 'effect';
    value: any;
    subscriberCount: number;
    dependencies: string[];
    subscribers: string[];
    createdAt: number;
    updatedAt: number;
    updateCount: number;
    creationStack?: string;
}
export interface PerformanceMetric {
    signalId: string;
    type: 'signal' | 'computed' | 'effect';
    timestamp: number;
    duration: number;
    skipped: boolean;
    previousValue?: any;
    newValue?: any;
}
export interface DependencyNode {
    id: string;
    type: 'signal' | 'computed' | 'effect';
    dependencies: string[];
    subscribers: string[];
    depth: number;
}
export declare let __DEVTOOLS__: boolean;
export declare function enableDevTools(options?: Partial<DevToolsConfig>): void;
export declare function disableDevTools(): void;
export declare function isDevToolsEnabled(): boolean;
export declare function registerSignal<T>(signal: Signal<T>, type: 'signal' | 'computed' | 'effect', initialValue?: T): string;
export declare function unregisterSignal<T>(signal: Signal<T>): void;
export declare function trackUpdate<T>(signal: Signal<T>, updateFn: () => void, previousValue?: T): void;
export declare function trackDependency(subscriber: Signal<any>, dependency: Signal<any>): void;
export declare function untrackDependency(subscriber: Signal<any>, dependency: Signal<any>): void;
export declare function listSignals(): SignalMetadata[];
export declare function getSignal(id: string): SignalMetadata | undefined;
export declare function getDependencies(id: string): string[];
export declare function getSubscribers(id: string): string[];
export declare function getDependencyGraph(): DependencyNode[];
export declare function getSignalsByType(type: 'signal' | 'computed' | 'effect'): SignalMetadata[];
export declare function getPerformanceMetrics(limit?: number): PerformanceMetric[];
export declare function getPerformanceSummary(): {
    totalUpdates: number;
    totalDuration: number;
    averageDuration: number;
    slowestUpdate: PerformanceMetric | null;
    updatesByType: Record<string, number>;
};
export declare function clearPerformanceMetrics(): void;
export declare function createConsoleOverlay(): {
    show: () => void;
    hide: () => void;
    destroy: () => void;
};
export declare function exportSnapshot(): {
    timestamp: number;
    config: DevToolsConfig;
    signals: SignalMetadata[];
    graph: DependencyNode[];
    performance: {
        metrics: PerformanceMetric[];
        summary: ReturnType<typeof getPerformanceSummary>;
    };
};
export declare function printDependencyGraph(): void;
//# sourceMappingURL=inspector.d.ts.map