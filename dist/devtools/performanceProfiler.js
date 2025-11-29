let profilerEnabled = false;
let profilerStartTime = null;
let batchIdCounter = 0;
const latencySamples = new Map();
const batchRecords = [];
const activeLatencyMeasurements = new Map();
const activeBatchMeasurements = new Map();
let config = {
    maxSamplesPerSignal: 100,
    maxBatchRecords: 50,
    autoComputeStats: false,
    emitEvents: true,
};
export function enableProfiler(options) {
    if (profilerEnabled) {
        console.warn('[Profiler] Already enabled');
        return;
    }
    config = { ...config, ...options };
    profilerEnabled = true;
    profilerStartTime = performance.now();
    console.log('[Profiler] Enabled', config);
}
export function disableProfiler() {
    if (!profilerEnabled) {
        console.warn('[Profiler] Already disabled');
        return;
    }
    profilerEnabled = false;
    console.log('[Profiler] Disabled');
}
export function isProfilerEnabled() {
    return profilerEnabled;
}
export function resetProfiler() {
    latencySamples.clear();
    batchRecords.length = 0;
    activeLatencyMeasurements.clear();
    activeBatchMeasurements.clear();
    profilerStartTime = profilerEnabled ? performance.now() : null;
    batchIdCounter = 0;
    console.log('[Profiler] Reset');
}
export function configureProfiler(options) {
    config = { ...config, ...options };
    console.log('[Profiler] Configuration updated', config);
}
export function startLatencyMeasurement(signalId, subscriberCount) {
    if (!profilerEnabled) {
        return;
    }
    activeLatencyMeasurements.set(signalId, {
        startTime: performance.now(),
        subscriberCount,
    });
}
export function endLatencyMeasurement(signalId, type, skipped) {
    if (!profilerEnabled) {
        return;
    }
    const measurement = activeLatencyMeasurements.get(signalId);
    if (!measurement) {
        return;
    }
    const endTime = performance.now();
    const latency = endTime - measurement.startTime;
    const sample = {
        signalId,
        type,
        startTime: measurement.startTime,
        endTime,
        latency,
        subscriberCount: measurement.subscriberCount,
        skipped,
    };
    let samples = latencySamples.get(signalId);
    if (!samples) {
        samples = [];
        latencySamples.set(signalId, samples);
    }
    samples.push(sample);
    if (samples.length > config.maxSamplesPerSignal) {
        samples.shift();
    }
    activeLatencyMeasurements.delete(signalId);
    if (config.emitEvents) {
    }
}
export function startBatchMeasurement(depth) {
    if (!profilerEnabled) {
        return -1;
    }
    const batchId = ++batchIdCounter;
    activeBatchMeasurements.set(batchId, {
        startTime: performance.now(),
        operationCount: 0,
        affectedSignals: new Set(),
        depth,
    });
    return batchId;
}
export function recordBatchOperation(batchId, signalId) {
    if (!profilerEnabled || batchId === -1) {
        return;
    }
    const measurement = activeBatchMeasurements.get(batchId);
    if (!measurement) {
        return;
    }
    measurement.operationCount++;
    measurement.affectedSignals.add(signalId);
}
export function endBatchMeasurement(batchId) {
    if (!profilerEnabled || batchId === -1) {
        return;
    }
    const measurement = activeBatchMeasurements.get(batchId);
    if (!measurement) {
        return;
    }
    const endTime = performance.now();
    const duration = endTime - measurement.startTime;
    const record = {
        batchId,
        startTime: measurement.startTime,
        endTime,
        duration,
        operationCount: measurement.operationCount,
        affectedSignals: Array.from(measurement.affectedSignals),
        depth: measurement.depth,
    };
    batchRecords.push(record);
    if (batchRecords.length > config.maxBatchRecords) {
        batchRecords.shift();
    }
    activeBatchMeasurements.delete(batchId);
    if (config.emitEvents) {
    }
}
export function getProfilerData() {
    const now = performance.now();
    const duration = profilerStartTime ? now - profilerStartTime : 0;
    const signalStats = new Map();
    let totalSamples = 0;
    for (const [signalId, samples] of latencySamples.entries()) {
        if (samples.length === 0)
            continue;
        const stats = computeLatencyStats(signalId, samples);
        signalStats.set(signalId, stats);
        totalSamples += samples.length;
    }
    const batchStats = computeBatchStats(batchRecords);
    return {
        enabled: profilerEnabled,
        startedAt: profilerStartTime,
        duration,
        signalStats,
        batchRecords: [...batchRecords],
        batchStats,
        totalSamples,
        totalSignals: latencySamples.size,
    };
}
export function getSignalLatencyStats(signalId) {
    const samples = latencySamples.get(signalId);
    if (!samples || samples.length === 0) {
        return null;
    }
    return computeLatencyStats(signalId, samples);
}
export function getBatchStats() {
    return computeBatchStats(batchRecords);
}
export function getLatencySamples(signalId) {
    return latencySamples.get(signalId) || [];
}
export function getBatchRecords() {
    return [...batchRecords];
}
function computeLatencyStats(signalId, samples) {
    if (samples.length === 0) {
        return {
            signalId,
            type: 'signal',
            sampleCount: 0,
            min: 0,
            max: 0,
            mean: 0,
            median: 0,
            p95: 0,
            p99: 0,
            stdDev: 0,
            avgSubscribers: 0,
            skippedCount: 0,
        };
    }
    const type = samples[0].type;
    const latencies = samples.map(s => s.latency);
    const sortedLatencies = [...latencies].sort((a, b) => a - b);
    const min = sortedLatencies[0];
    const max = sortedLatencies[sortedLatencies.length - 1];
    const sum = latencies.reduce((acc, val) => acc + val, 0);
    const mean = sum / latencies.length;
    const mid = Math.floor(sortedLatencies.length / 2);
    const median = sortedLatencies.length % 2 === 0
        ? (sortedLatencies[mid - 1] + sortedLatencies[mid]) / 2
        : sortedLatencies[mid];
    const p95 = percentile(sortedLatencies, 0.95);
    const p99 = percentile(sortedLatencies, 0.99);
    const squaredDiffs = latencies.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / latencies.length;
    const stdDev = Math.sqrt(variance);
    const avgSubscribers = samples.reduce((acc, s) => acc + s.subscriberCount, 0) / samples.length;
    const skippedCount = samples.filter(s => s.skipped).length;
    return {
        signalId,
        type,
        sampleCount: samples.length,
        min,
        max,
        mean,
        median,
        p95,
        p99,
        stdDev,
        avgSubscribers,
        skippedCount,
    };
}
function computeBatchStats(records) {
    if (records.length === 0) {
        return {
            totalBatches: 0,
            avgDuration: 0,
            minDuration: 0,
            maxDuration: 0,
            avgOperationsPerBatch: 0,
            totalOperations: 0,
        };
    }
    const durations = records.map(r => r.duration);
    const operations = records.map(r => r.operationCount);
    const totalBatches = records.length;
    const avgDuration = durations.reduce((acc, val) => acc + val, 0) / totalBatches;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    const totalOperations = operations.reduce((acc, val) => acc + val, 0);
    const avgOperationsPerBatch = totalOperations / totalBatches;
    return {
        totalBatches,
        avgDuration,
        minDuration,
        maxDuration,
        avgOperationsPerBatch,
        totalOperations,
    };
}
function percentile(sortedArray, percentile) {
    if (sortedArray.length === 0)
        return 0;
    const index = percentile * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    if (lower === upper) {
        return sortedArray[lower];
    }
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
}
