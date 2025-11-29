export interface LatencySample {
    signalId: string;
    type: 'signal' | 'computed' | 'effect';
    startTime: number;
    endTime: number;
    latency: number;
    subscriberCount: number;
    skipped: boolean;
}
export interface SignalLatencyStats {
    signalId: string;
    type: 'signal' | 'computed' | 'effect';
    sampleCount: number;
    min: number;
    max: number;
    mean: number;
    median: number;
    p95: number;
    p99: number;
    stdDev: number;
    avgSubscribers: number;
    skippedCount: number;
}
export interface BatchTimingRecord {
    batchId: number;
    startTime: number;
    endTime: number;
    duration: number;
    operationCount: number;
    affectedSignals: string[];
    depth: number;
}
export interface BatchStats {
    totalBatches: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    avgOperationsPerBatch: number;
    totalOperations: number;
}
export interface ProfilerData {
    enabled: boolean;
    startedAt: number | null;
    duration: number;
    signalStats: Map<string, SignalLatencyStats>;
    batchRecords: BatchTimingRecord[];
    batchStats: BatchStats;
    totalSamples: number;
    totalSignals: number;
}
export interface ProfilerConfig {
    maxSamplesPerSignal: number;
    maxBatchRecords: number;
    autoComputeStats: boolean;
    emitEvents: boolean;
}
export declare function enableProfiler(options?: Partial<ProfilerConfig>): void;
export declare function disableProfiler(): void;
export declare function isProfilerEnabled(): boolean;
export declare function resetProfiler(): void;
export declare function configureProfiler(options: Partial<ProfilerConfig>): void;
export declare function startLatencyMeasurement(signalId: string, subscriberCount: number): void;
export declare function endLatencyMeasurement(signalId: string, type: 'signal' | 'computed' | 'effect', skipped: boolean): void;
export declare function startBatchMeasurement(depth: number): number;
export declare function recordBatchOperation(batchId: number, signalId: string): void;
export declare function endBatchMeasurement(batchId: number): void;
export declare function getProfilerData(): ProfilerData;
export declare function getSignalLatencyStats(signalId: string): SignalLatencyStats | null;
export declare function getBatchStats(): BatchStats;
export declare function getLatencySamples(signalId: string): LatencySample[];
export declare function getBatchRecords(): BatchTimingRecord[];
//# sourceMappingURL=performanceProfiler.d.ts.map