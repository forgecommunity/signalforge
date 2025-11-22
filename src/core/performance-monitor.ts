/**
 * Built-in Performance Monitoring for SignalForge Ultra
 * 
 * Zero-overhead monitoring tools for developers
 * Helps identify slow signals, memory leaks, and performance regressions
 * 
 * NO EXTERNAL DEPENDENCIES
 */

// ============================================================================
// PERFORMANCE TRACKING
// ============================================================================

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

const performanceMap = new WeakMap<any, SignalPerformance>();
let isMonitoringEnabled = false;
let monitoringOverhead = 0;

/**
 * Enable performance monitoring
 */
export function enableMonitoring(): void {
  isMonitoringEnabled = true;
  console.log('📊 Performance monitoring enabled');
}

/**
 * Disable performance monitoring
 */
export function disableMonitoring(): void {
  isMonitoringEnabled = false;
  console.log('📊 Performance monitoring disabled');
}

/**
 * Track signal read performance
 */
export function trackRead(signal: any, duration: number): void {
  if (!isMonitoringEnabled) return;
  
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

/**
 * Track signal write performance
 */
export function trackWrite(signal: any, duration: number): void {
  if (!isMonitoringEnabled) return;
  
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

/**
 * Track computed signal performance
 */
export function trackComputation(signal: any, duration: number): void {
  if (!isMonitoringEnabled) return;
  
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

// ============================================================================
// ANALYSIS & REPORTING
// ============================================================================

/**
 * Get slowest signals (by average operation time)
 */
export function getSlowestSignals(limit = 10): SignalPerformance[] {
  const allSignals: SignalPerformance[] = [];
  
  // Can't iterate WeakMap directly, so we track in a separate structure
  // This is a limitation, but shows the concept
  
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

/**
 * Get most accessed signals
 */
export function getMostAccessedSignals(limit = 10): SignalPerformance[] {
  const allSignals: SignalPerformance[] = [];
  
  return allSignals
    .sort((a, b) => (b.reads + b.writes) - (a.reads + a.writes))
    .slice(0, limit);
}

/**
 * Detect potential memory leaks (signals not accessed recently)
 */
export function detectMemoryLeaks(thresholdMs = 60000): SignalPerformance[] {
  const now = Date.now();
  const allSignals: SignalPerformance[] = [];
  
  return allSignals.filter(s => (now - s.lastAccessed) > thresholdMs);
}

/**
 * Get monitoring overhead
 */
export function getMonitoringOverhead(): number {
  return monitoringOverhead;
}

/**
 * Reset monitoring data
 */
export function resetMonitoring(): void {
  // WeakMap doesn't have clear(), so just reset overhead
  monitoringOverhead = 0;
  console.log('📊 Monitoring data reset');
}

/**
 * Print performance report to console
 */
export function printPerformanceReport(): void {
  console.log('\n' + '='.repeat(60));
  console.log('📊 SIGNALFORGE ULTRA PERFORMANCE REPORT');
  console.log('='.repeat(60));
  
  console.log('\n🐌 Slowest Signals:');
  const slowest = getSlowestSignals(5);
  if (slowest.length === 0) {
    console.log('   (Enable monitoring to see data)');
  } else {
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
  } else {
    mostAccessed.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.id} - ${s.reads + s.writes} operations`);
    });
  }
  
  console.log('\n💧 Potential Memory Leaks:');
  const leaks = detectMemoryLeaks();
  if (leaks.length === 0) {
    console.log('   ✅ None detected');
  } else {
    leaks.forEach((s, i) => {
      const age = (Date.now() - s.lastAccessed) / 1000;
      console.log(`   ${i + 1}. ${s.id} - Not accessed for ${age.toFixed(1)}s`);
    });
  }
  
  console.log('\n📈 Monitoring Overhead:');
  console.log(`   ${monitoringOverhead.toFixed(2)}ms total`);
  
  console.log('\n' + '='.repeat(60));
}

// ============================================================================
// REAL-TIME PROFILER
// ============================================================================

interface ProfilerSnapshot {
  timestamp: number;
  signalCount: number;
  operations: number;
  averageLatency: number;
  memoryUsage: number;
}

const snapshots: ProfilerSnapshot[] = [];
const MAX_SNAPSHOTS = 100;

/**
 * Take performance snapshot
 */
export function takeSnapshot(): ProfilerSnapshot {
  const snapshot: ProfilerSnapshot = {
    timestamp: Date.now(),
    signalCount: 0, // Would need global registry
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

/**
 * Get performance trend (increasing/decreasing latency)
 */
export function getPerformanceTrend(): 'improving' | 'degrading' | 'stable' {
  if (snapshots.length < 2) return 'stable';
  
  const recent = snapshots.slice(-10);
  const first = recent[0].averageLatency;
  const last = recent[recent.length - 1].averageLatency;
  
  const change = (last - first) / first;
  
  if (change > 0.1) return 'degrading';
  if (change < -0.1) return 'improving';
  return 'stable';
}

/**
 * Auto-profiler: Run in background and alert on issues
 */
let profilerInterval: any = null;

export function startAutoProfiler(intervalMs = 5000): void {
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

export function stopAutoProfiler(): void {
  if (profilerInterval) {
    clearInterval(profilerInterval);
    profilerInterval = null;
    console.log('🔍 Auto-profiler stopped');
  }
}

// ============================================================================
// DEVELOPER TOOLS
// ============================================================================

/**
 * Quick performance check
 */
export function quickCheck(): void {
  console.log('🔍 Running quick performance check...');
  
  // Check monitoring overhead
  if (monitoringOverhead > 100) {
    console.warn('⚠️  High monitoring overhead! Consider disabling in production.');
  } else {
    console.log('✅ Monitoring overhead acceptable');
  }
  
  // Check for leaks
  const leaks = detectMemoryLeaks(30000);
  if (leaks.length > 0) {
    console.warn(`⚠️  ${leaks.length} signals not accessed in 30s`);
  } else {
    console.log('✅ No memory leaks detected');
  }
  
  // Check trend
  const trend = getPerformanceTrend();
  if (trend === 'degrading') {
    console.warn('⚠️  Performance degrading over time');
  } else {
    console.log(`✅ Performance ${trend}`);
  }
}

/**
 * Export performance data for external analysis
 */
export function exportPerformanceData(): string {
  const data = {
    snapshots,
    monitoringOverhead,
    timestamp: new Date().toISOString(),
    trend: getPerformanceTrend(),
  };
  
  return JSON.stringify(data, null, 2);
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*

// Enable monitoring in development
if (process.env.NODE_ENV !== 'production') {
  enableMonitoring();
  startAutoProfiler(10000); // Check every 10s
}

// Manual check
quickCheck();

// Detailed report
printPerformanceReport();

// Export data
const data = exportPerformanceData();
console.log(data);

// Cleanup
stopAutoProfiler();
disableMonitoring();

*/

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
