const performanceMap = new WeakMap();
let isMonitoringEnabled = false;
let monitoringOverhead = 0;
export function enableMonitoring() {
    isMonitoringEnabled = true;
    console.log('📊 Performance monitoring enabled');
}
export function disableMonitoring() {
    isMonitoringEnabled = false;
    console.log('📊 Performance monitoring disabled');
}
export function trackRead(signal, duration) {
    if (!isMonitoringEnabled)
        return;
    const start = performance.now();
    let perf = performanceMap.get(signal);
    if (!perf) {
        perf = {
            id: `signal_${Math.random().toString(36).slice(2, 9)}`,
            reads: 0,
            writes: 0,
            computations: 0,
            totalReadTime: 0,
            totalWriteTime: 0,
            totalComputeTime: 0,
            subscriberCount: 0,
            lastAccessed: Date.now(),
            createdAt: Date.now(),
        };
        performanceMap.set(signal, perf);
    }
    perf.reads++;
    perf.totalReadTime += duration;
    perf.lastAccessed = Date.now();
    monitoringOverhead += (performance.now() - start);
}
export function trackWrite(signal, duration) {
    if (!isMonitoringEnabled)
        return;
    const start = performance.now();
    let perf = performanceMap.get(signal);
    if (!perf) {
        perf = {
            id: `signal_${Math.random().toString(36).slice(2, 9)}`,
            reads: 0,
            writes: 0,
            computations: 0,
            totalReadTime: 0,
            totalWriteTime: 0,
            totalComputeTime: 0,
            subscriberCount: 0,
            lastAccessed: Date.now(),
            createdAt: Date.now(),
        };
        performanceMap.set(signal, perf);
    }
    perf.writes++;
    perf.totalWriteTime += duration;
    perf.lastAccessed = Date.now();
    monitoringOverhead += (performance.now() - start);
}
export function trackComputation(signal, duration) {
    if (!isMonitoringEnabled)
        return;
    const start = performance.now();
    let perf = performanceMap.get(signal);
    if (!perf) {
        perf = {
            id: `computed_${Math.random().toString(36).slice(2, 9)}`,
            reads: 0,
            writes: 0,
            computations: 0,
            totalReadTime: 0,
            totalWriteTime: 0,
            totalComputeTime: 0,
            subscriberCount: 0,
            lastAccessed: Date.now(),
            createdAt: Date.now(),
        };
        performanceMap.set(signal, perf);
    }
    perf.computations++;
    perf.totalComputeTime += duration;
    perf.lastAccessed = Date.now();
    monitoringOverhead += (performance.now() - start);
}
export function getSlowestSignals(limit = 10) {
    const allSignals = [];
    return allSignals
        .sort((a, b) => {
        const avgA = (a.totalReadTime + a.totalWriteTime + a.totalComputeTime) /
            (a.reads + a.writes + a.computations);
        const avgB = (b.totalReadTime + b.totalWriteTime + b.totalComputeTime) /
            (b.reads + b.writes + b.computations);
        return avgB - avgA;
    })
        .slice(0, limit);
}
export function getMostAccessedSignals(limit = 10) {
    const allSignals = [];
    return allSignals
        .sort((a, b) => (b.reads + b.writes) - (a.reads + a.writes))
        .slice(0, limit);
}
export function detectMemoryLeaks(thresholdMs = 60000) {
    const now = Date.now();
    const allSignals = [];
    return allSignals.filter(s => (now - s.lastAccessed) > thresholdMs);
}
export function getMonitoringOverhead() {
    return monitoringOverhead;
}
export function resetMonitoring() {
    monitoringOverhead = 0;
    console.log('📊 Monitoring data reset');
}
export function printPerformanceReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 SIGNALFORGE ULTRA PERFORMANCE REPORT');
    console.log('='.repeat(60));
    console.log('\n🐌 Slowest Signals:');
    const slowest = getSlowestSignals(5);
    if (slowest.length === 0) {
        console.log('   (Enable monitoring to see data)');
    }
    else {
        slowest.forEach((s, i) => {
            const avgTime = (s.totalReadTime + s.totalWriteTime + s.totalComputeTime) /
                (s.reads + s.writes + s.computations);
            console.log(`   ${i + 1}. ${s.id} - ${avgTime.toFixed(3)}ms avg`);
        });
    }
    console.log('\n🔥 Most Accessed Signals:');
    const mostAccessed = getMostAccessedSignals(5);
    if (mostAccessed.length === 0) {
        console.log('   (Enable monitoring to see data)');
    }
    else {
        mostAccessed.forEach((s, i) => {
            console.log(`   ${i + 1}. ${s.id} - ${s.reads + s.writes} operations`);
        });
    }
    console.log('\n💧 Potential Memory Leaks:');
    const leaks = detectMemoryLeaks();
    if (leaks.length === 0) {
        console.log('   ✅ None detected');
    }
    else {
        leaks.forEach((s, i) => {
            const age = (Date.now() - s.lastAccessed) / 1000;
            console.log(`   ${i + 1}. ${s.id} - Not accessed for ${age.toFixed(1)}s`);
        });
    }
    console.log('\n📈 Monitoring Overhead:');
    console.log(`   ${monitoringOverhead.toFixed(2)}ms total`);
    console.log('\n' + '='.repeat(60));
}
const snapshots = [];
const MAX_SNAPSHOTS = 100;
export function takeSnapshot() {
    const snapshot = {
        timestamp: Date.now(),
        signalCount: 0,
        operations: 0,
        averageLatency: 0,
        memoryUsage: 0,
    };
    snapshots.push(snapshot);
    if (snapshots.length > MAX_SNAPSHOTS) {
        snapshots.shift();
    }
    return snapshot;
}
export function getPerformanceTrend() {
    if (snapshots.length < 2)
        return 'stable';
    const recent = snapshots.slice(-10);
    const first = recent[0].averageLatency;
    const last = recent[recent.length - 1].averageLatency;
    const change = (last - first) / first;
    if (change > 0.1)
        return 'degrading';
    if (change < -0.1)
        return 'improving';
    return 'stable';
}
let profilerInterval = null;
export function startAutoProfiler(intervalMs = 5000) {
    if (profilerInterval) {
        console.warn('Auto-profiler already running');
        return;
    }
    console.log('🔍 Auto-profiler started');
    profilerInterval = setInterval(() => {
        takeSnapshot();
        const trend = getPerformanceTrend();
        if (trend === 'degrading') {
            console.warn('⚠️  Performance degrading! Check for memory leaks.');
            printPerformanceReport();
        }
        const leaks = detectMemoryLeaks();
        if (leaks.length > 10) {
            console.warn(`⚠️  ${leaks.length} potential memory leaks detected!`);
        }
    }, intervalMs);
}
export function stopAutoProfiler() {
    if (profilerInterval) {
        clearInterval(profilerInterval);
        profilerInterval = null;
        console.log('🔍 Auto-profiler stopped');
    }
}
export function quickCheck() {
    console.log('🔍 Running quick performance check...');
    if (monitoringOverhead > 100) {
        console.warn('⚠️  High monitoring overhead! Consider disabling in production.');
    }
    else {
        console.log('✅ Monitoring overhead acceptable');
    }
    const leaks = detectMemoryLeaks(30000);
    if (leaks.length > 0) {
        console.warn(`⚠️  ${leaks.length} signals not accessed in 30s`);
    }
    else {
        console.log('✅ No memory leaks detected');
    }
    const trend = getPerformanceTrend();
    if (trend === 'degrading') {
        console.warn('⚠️  Performance degrading over time');
    }
    else {
        console.log(`✅ Performance ${trend}`);
    }
}
export function exportPerformanceData() {
    const data = {
        snapshots,
        monitoringOverhead,
        timestamp: new Date().toISOString(),
        trend: getPerformanceTrend(),
    };
    return JSON.stringify(data, null, 2);
}
export default {
    enableMonitoring,
    disableMonitoring,
    printPerformanceReport,
    quickCheck,
    startAutoProfiler,
    stopAutoProfiler,
    exportPerformanceData,
    trackRead,
    trackWrite,
    trackComputation,
    getSlowestSignals,
    getMostAccessedSignals,
    detectMemoryLeaks,
    getPerformanceTrend,
    resetMonitoring,
};
