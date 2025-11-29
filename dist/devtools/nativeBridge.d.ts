import { type SignalMetadata, type PerformanceMetric } from './runtime';
import { type DependencyNode } from './inspector';
import { type ProfilerData } from './performanceProfiler';
export type TransportType = 'flipper' | 'websocket' | 'mock';
export interface BridgeConfig {
    transport?: TransportType;
    preferFlipper?: boolean;
    websocketUrl?: string;
    autoEnable?: boolean;
    batchInterval?: number;
    maxQueueSize?: number;
    verbose?: boolean;
}
export type MessageType = 'signal-created' | 'signal-updated' | 'signal-destroyed' | 'dependency-added' | 'dependency-removed' | 'performance-metric' | 'profiler-data' | 'snapshot' | 'command' | 'response' | 'error';
export interface BridgeMessage {
    type: MessageType;
    payload: any;
    timestamp: number;
    id: string;
    seq: number;
}
export interface CommandMessage extends BridgeMessage {
    type: 'command';
    payload: {
        command: string;
        args: any[];
    };
}
export interface ResponseMessage extends BridgeMessage {
    type: 'response';
    payload: {
        commandId: string;
        success: boolean;
        data?: any;
        error?: string;
    };
}
export interface SnapshotMessage extends BridgeMessage {
    type: 'snapshot';
    payload: {
        signals: SignalMetadata[];
        dependencies: DependencyNode[];
        performance: PerformanceMetric[];
        profiler: ProfilerData | null;
    };
}
export interface Transport {
    readonly type: TransportType;
    isConnected(): boolean;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    send(message: BridgeMessage): Promise<void>;
    onMessage(handler: (message: BridgeMessage) => void): void;
}
export declare function initializeDevToolsBridge(options?: BridgeConfig): Promise<void>;
export declare function shutdownDevToolsBridge(): Promise<void>;
export declare function isBridgeConnected(): boolean;
export declare function getBridgeConfig(): Readonly<Required<BridgeConfig>>;
export declare function notifySignalCreated(signalId: string, metadata: SignalMetadata): Promise<void>;
export declare function notifySignalUpdated(signalId: string, previousValue: any, newValue: any): Promise<void>;
export declare function notifyPerformanceMetric(metric: PerformanceMetric): Promise<void>;
//# sourceMappingURL=nativeBridge.d.ts.map