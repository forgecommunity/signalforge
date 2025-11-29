import type { Signal } from '../core/store';
export type DevToolsEventType = 'signal-created' | 'signal-updated' | 'signal-destroyed' | 'dependency-added' | 'dependency-removed' | 'performance-warning' | 'batch-started' | 'batch-ended';
export interface DevToolsEvent<T = any> {
    type: DevToolsEventType;
    payload: T;
    timestamp: number;
    sequence: number;
}
export interface SignalCreatedPayload {
    id: string;
    type: 'signal' | 'computed' | 'effect';
    initialValue: any;
    name?: string;
    creationStack?: string;
}
export interface SignalUpdatedPayload {
    id: string;
    previousValue: any;
    newValue: any;
    duration: number;
    skipped: boolean;
}
export interface SignalDestroyedPayload {
    id: string;
    type: 'signal' | 'computed' | 'effect';
    finalValue: any;
    lifetime: number;
}
export interface DependencyPayload {
    subscriberId: string;
    dependencyId: string;
}
export interface PerformanceWarningPayload {
    signalId: string;
    type: 'signal' | 'computed' | 'effect';
    duration: number;
    threshold: number;
    message: string;
}
type EventListener<T = any> = (event: DevToolsEvent<T>) => void;
export declare let __DEVTOOLS__: boolean;
export interface DevToolsConfig {
    enabled: boolean;
    trackPerformance: boolean;
    logToConsole: boolean;
    maxPerformanceSamples: number;
    slowUpdateThreshold: number;
    emitPerformanceWarnings: boolean;
}
export interface SignalMetadata {
    id: string;
    name?: string;
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
export declare function enableDevTools(options?: Partial<DevToolsConfig>): void;
export declare function disableDevTools(): void;
export declare function isDevToolsEnabled(): boolean;
export declare function getDevToolsConfig(): Readonly<DevToolsConfig>;
export declare function registerSignal<T>(signal: Signal<T>, type: 'signal' | 'computed' | 'effect', initialValue?: T, name?: string): string;
export declare function unregisterSignal<T>(signal: Signal<T>): void;
export declare function trackUpdate<T>(signal: Signal<T>, updateFn: () => void, previousValue?: T): void;
export declare function trackDependency(subscriber: Signal<any>, dependency: Signal<any>): void;
export declare function untrackDependency(subscriber: Signal<any>, dependency: Signal<any>): void;
export declare function listSignals(): SignalMetadata[];
export declare function getActivePlugins(): Array<{
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
export declare function getSignal(id: string): SignalMetadata | undefined;
export declare function getDependencies(id: string): string[];
export declare function getSubscribers(id: string): string[];
export declare function onDevToolsEvent<T = any>(eventType: DevToolsEventType | '*', listener: EventListener<T>): () => void;
export declare function offDevToolsEvent<T = any>(eventType: DevToolsEventType | '*', listener: EventListener<T>): void;
export declare function getEventListenerCount(eventType?: DevToolsEventType | '*'): number;
export declare function clearEventListeners(): void;
export declare function getPerformanceMetrics(limit?: number): PerformanceMetric[];
export declare function clearPerformanceMetrics(): void;
export {};
//# sourceMappingURL=runtime.d.ts.map