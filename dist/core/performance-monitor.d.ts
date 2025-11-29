interface SignalPerformance {
    id: string;
    reads: number;
    writes: number;
    computations: number;
    totalReadTime: number;
    totalWriteTime: number;
    totalComputeTime: number;
    subscriberCount: number;
    lastAccessed: number;
    createdAt: number;
}
export declare function enableMonitoring(): void;
export declare function disableMonitoring(): void;
export declare function trackRead(signal: any, duration: number): void;
export declare function trackWrite(signal: any, duration: number): void;
export declare function trackComputation(signal: any, duration: number): void;
export declare function getSlowestSignals(limit?: number): SignalPerformance[];
export declare function getMostAccessedSignals(limit?: number): SignalPerformance[];
export declare function detectMemoryLeaks(thresholdMs?: number): SignalPerformance[];
export declare function getMonitoringOverhead(): number;
export declare function resetMonitoring(): void;
export declare function printPerformanceReport(): void;
interface ProfilerSnapshot {
    timestamp: number;
    signalCount: number;
    operations: number;
    averageLatency: number;
    memoryUsage: number;
}
export declare function takeSnapshot(): ProfilerSnapshot;
export declare function getPerformanceTrend(): 'improving' | 'degrading' | 'stable';
export declare function startAutoProfiler(intervalMs?: number): void;
export declare function stopAutoProfiler(): void;
export declare function quickCheck(): void;
export declare function exportPerformanceData(): string;
declare const _default: {
    enableMonitoring: typeof enableMonitoring;
    disableMonitoring: typeof disableMonitoring;
    printPerformanceReport: typeof printPerformanceReport;
    quickCheck: typeof quickCheck;
    startAutoProfiler: typeof startAutoProfiler;
    stopAutoProfiler: typeof stopAutoProfiler;
    exportPerformanceData: typeof exportPerformanceData;
    trackRead: typeof trackRead;
    trackWrite: typeof trackWrite;
    trackComputation: typeof trackComputation;
    getSlowestSignals: typeof getSlowestSignals;
    getMostAccessedSignals: typeof getMostAccessedSignals;
    detectMemoryLeaks: typeof detectMemoryLeaks;
    getPerformanceTrend: typeof getPerformanceTrend;
    resetMonitoring: typeof resetMonitoring;
};
export default _default;
//# sourceMappingURL=performance-monitor.d.ts.map