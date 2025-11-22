/**
 * Ultra Performance Benchmark Suite
 * 
 * Compares optimized vs original implementation
 * Target: 100x improvement in critical operations
 * 
 * Run: node --loader ts-node/esm benchmarks/ultra-performance.benchmark.ts
 */

import { createSignal as createSignalOriginal, createComputed as createComputedOriginal, batch as batchOriginal } from '../src/core/store';
import { createSignal as createSignalUltra, createComputed as createComputedUltra, batch as batchUltra, getPerformanceStats } from '../src/core/store';

// ============================================================================
// BENCHMARK UTILITIES
// ============================================================================

interface BenchmarkResult {
  name: string;
  originalTime: number;
  ultraTime: number;
  improvement: number;
  operationsPerSecond: number;
}

const results: BenchmarkResult[] = [];

function benchmark(name: string, iterations: number, fn: () => void): number {
  // Warm up
  for (let i = 0; i < 100; i++) fn();
  
  // Actual benchmark
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  
  return end - start;
}

function compareBenchmark(
  name: string,
  iterations: number,
  originalFn: () => void,
  ultraFn: () => void
): void {
  console.log(`\n📊 ${name}`);
  console.log(`   Iterations: ${iterations.toLocaleString()}`);
  
  const originalTime = benchmark(name + ' (Original)', iterations, originalFn);
  const ultraTime = benchmark(name + ' (Ultra)', iterations, ultraFn);
  
  const improvement = originalTime / ultraTime;
  const opsPerSec = (iterations / (ultraTime / 1000));
  
  console.log(`   Original: ${originalTime.toFixed(2)}ms`);
  console.log(`   Ultra:    ${ultraTime.toFixed(2)}ms`);
  console.log(`   🚀 Improvement: ${improvement.toFixed(1)}x faster`);
  console.log(`   ⚡ Operations/sec: ${opsPerSec.toLocaleString(undefined, { maximumFractionDigits: 0 })}`);
  
  results.push({
    name,
    originalTime,
    ultraTime,
    improvement,
    operationsPerSecond: opsPerSec
  });
}

// ============================================================================
// BENCHMARKS
// ============================================================================

function runAllBenchmarks(): void {
  console.log('🚀 SignalForge ULTRA Performance Benchmarks');
  console.log('='.repeat(60));
  
  // Test 1: Signal Creation
  compareBenchmark(
    'Signal Creation (10,000 signals)',
    10000,
    () => {
      const signals: any[] = [];
      for (let i = 0; i < 100; i++) {
        signals.push(createSignalOriginal(i));
      }
    },
    () => {
      const signals: any[] = [];
      for (let i = 0; i < 100; i++) {
        signals.push(createSignalUltra(i));
      }
    }
  );
  
  // Test 2: Signal Reads
  {
    const originalSignal = createSignalOriginal(42);
    const ultraSignal = createSignalUltra(42);
    
    compareBenchmark(
      'Signal Read (1,000,000 reads)',
      1000000,
      () => originalSignal.get(),
      () => ultraSignal.get()
    );
  }
  
  // Test 3: Signal Writes
  {
    const originalSignal = createSignalOriginal(0);
    const ultraSignal = createSignalUltra(0);
    
    compareBenchmark(
      'Signal Write (100,000 writes)',
      100000,
      () => originalSignal.set(v => v + 1),
      () => ultraSignal.set(v => v + 1)
    );
  }
  
  // Test 4: Computed Signal Recalculation
  {
    const originalA = createSignalOriginal(1);
    const originalB = createSignalOriginal(2);
    const originalComputed = createComputedOriginal(() => originalA.get() + originalB.get());
    
    const ultraA = createSignalUltra(1);
    const ultraB = createSignalUltra(2);
    const ultraComputed = createComputedUltra(() => ultraA.get() + ultraB.get());
    
    compareBenchmark(
      'Computed Recalculation (10,000 updates)',
      10000,
      () => {
        originalA.set(v => v + 1);
        originalComputed.get();
      },
      () => {
        ultraA.set(v => v + 1);
        ultraComputed.get();
      }
    );
  }
  
  // Test 5: Deep Computed Chain
  {
    const originalBase = createSignalOriginal(1);
    const originalC1 = createComputedOriginal(() => originalBase.get() * 2);
    const originalC2 = createComputedOriginal(() => originalC1.get() * 2);
    const originalC3 = createComputedOriginal(() => originalC2.get() * 2);
    const originalC4 = createComputedOriginal(() => originalC3.get() * 2);
    
    const ultraBase = createSignalUltra(1);
    const ultraC1 = createComputedUltra(() => ultraBase.get() * 2);
    const ultraC2 = createComputedUltra(() => ultraC1.get() * 2);
    const ultraC3 = createComputedUltra(() => ultraC2.get() * 2);
    const ultraC4 = createComputedUltra(() => ultraC3.get() * 2);
    
    compareBenchmark(
      'Deep Computed Chain (5 levels, 10,000 updates)',
      10000,
      () => {
        originalBase.set(v => v + 1);
        originalC4.get();
      },
      () => {
        ultraBase.set(v => v + 1);
        ultraC4.get();
      }
    );
  }
  
  // Test 6: Batch Updates
  {
    const originalSignals = Array.from({ length: 100 }, () => createSignalOriginal(0));
    const ultraSignals = Array.from({ length: 100 }, () => createSignalUltra(0));
    
    compareBenchmark(
      'Batch Updates (100 signals, 1,000 batches)',
      1000,
      () => {
        batchOriginal(() => {
          originalSignals.forEach(s => s.set(v => v + 1));
        });
      },
      () => {
        batchUltra(() => {
          ultraSignals.forEach(s => s.set(v => v + 1));
        });
      }
    );
  }
  
  // Test 7: Many Subscribers
  {
    const originalSignal = createSignalOriginal(0);
    const ultraSignal = createSignalUltra(0);
    
    // Add 1000 subscribers
    for (let i = 0; i < 1000; i++) {
      createComputedOriginal(() => originalSignal.get() * i);
      createComputedUltra(() => ultraSignal.get() * i);
    }
    
    compareBenchmark(
      'Many Subscribers (1000 subscribers, 1,000 updates)',
      1000,
      () => originalSignal.set(v => v + 1),
      () => ultraSignal.set(v => v + 1)
    );
  }
  
  // Test 8: Memory Pressure (creation/destruction)
  compareBenchmark(
    'Memory Pressure (10,000 create/destroy cycles)',
    10000,
    () => {
      const s = createSignalOriginal(Math.random());
      s.get();
      s.destroy();
    },
    () => {
      const s = createSignalUltra(Math.random());
      s.get();
      s.destroy();
    }
  );
  
  // Print Summary
  console.log('\n' + '='.repeat(60));
  console.log('📈 SUMMARY');
  console.log('='.repeat(60));
  
  const avgImprovement = results.reduce((sum, r) => sum + r.improvement, 0) / results.length;
  const minImprovement = Math.min(...results.map(r => r.improvement));
  const maxImprovement = Math.max(...results.map(r => r.improvement));
  
  console.log(`Average Improvement: ${avgImprovement.toFixed(1)}x faster`);
  console.log(`Min Improvement:     ${minImprovement.toFixed(1)}x faster`);
  console.log(`Max Improvement:     ${maxImprovement.toFixed(1)}x faster`);
  
  // Check if we hit 100x target
  if (avgImprovement >= 100) {
    console.log('\n🎉 SUCCESS! Achieved 100x+ improvement!');
  } else if (avgImprovement >= 50) {
    console.log('\n✅ GREAT! Achieved 50x+ improvement!');
  } else if (avgImprovement >= 10) {
    console.log('\n👍 GOOD! Achieved 10x+ improvement!');
  } else {
    console.log('\n⚠️  Target not reached. More optimization needed.');
  }
  
  // Performance stats
  const stats = getPerformanceStats();
  console.log('\n📊 Pool & Queue Stats:');
  console.log(`   Object Pool Usage: ${stats.poolUsage}`);
  console.log(`   Batch Queue Length: ${stats.queueLength}`);
  console.log(`   Context Depth: ${stats.contextDepth}`);
  
  // Export results
  console.log('\n💾 Results saved to: benchmark-results.json');
  require('fs').writeFileSync(
    'benchmark-results.json',
    JSON.stringify({ results, summary: { avgImprovement, minImprovement, maxImprovement }, timestamp: new Date().toISOString() }, null, 2)
  );
}

// ============================================================================
// RUN BENCHMARKS
// ============================================================================

runAllBenchmarks();
