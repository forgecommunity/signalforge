export interface BenchmarkResult {
    name: string;
    iterations: number;
    totalTime: number;
    averageTime: number;
    opsPerSecond: number;
    metadata?: Record<string, any>;
}
export declare function benchmarkSignalUpdates(count: number): BenchmarkResult;
export declare function benchmarkBatchedUpdates(count: number): BenchmarkResult;
export declare function compareWithRedux(count?: number): BenchmarkResult;
export declare function compareWithZustand(count?: number): BenchmarkResult;
export declare function benchmarkMemoryUsage(count: number): BenchmarkResult;
export declare function runBenchmarkSuite(iterations?: number): BenchmarkResult[];
export declare function logResults(): void;
export declare function getResults(): BenchmarkResult[];
export declare function clearResults(): void;
export declare function exportResults(): string;
export declare function customBenchmark(name: string, fn: () => void, iterations?: number): BenchmarkResult;
//# sourceMappingURL=benchmark.d.ts.map