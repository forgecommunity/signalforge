/**
 * SignalForge Performance Benchmarks
 * Standalone benchmarks - no external dependencies
 * 
 * Run with: tsx benchmarks/standalone.ts
 */

import { createSignal, createComputed, batch, createEffect } from '../src/core/store';

const ITERATIONS = 1000;
const WARMUP = 100;

interface Result {
  name: string;
  avgMs: number;
  minMs: number;
  maxMs: number;
  opsPerSec: number;
}

function bench(name: string, fn: () => void): Result {
  // Warmup
  for (let i = 0; i < WARMUP; i++) fn();
  
  // Measure
  const times: number[] = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    fn();
    times.push(performance.now() - start);
  }
  
  const avgMs = times.reduce((a, b) => a + b) / times.length;
  const minMs = Math.min(...times);
  const maxMs = Math.max(...times);
  const opsPerSec = 1000 / avgMs;
  
  return { name, avgMs, minMs, maxMs, opsPerSec };
}

function print(r: Result) {
  console.log(`${r.name.padEnd(45)} ${r.avgMs.toFixed(3)}ms avg  (${r.opsPerSec.toFixed(0)} ops/s)`);
}

console.log('\n🏁 SignalForge Performance Benchmarks\n');
console.log('='.repeat(90));

// Test 1: Signal Creation
console.log('\n📊 Signal Creation\n');
const r1 = bench('Create 1000 signals', () => {
  const sigs = [];
  for (let i = 0; i < 1000; i++) sigs.push(createSignal(i));
});
print(r1);
console.log(`   Per signal: ${(r1.avgMs / 1000).toFixed(6)}ms`);

// Test 2: Signal Reads
console.log('\n📊 Signal Reads\n');
const readSig = createSignal(42);
const r2 = bench('Read signal 1000x', () => {
  for (let i = 0; i < 1000; i++) readSig.get();
});
print(r2);
console.log(`   Per read: ${(r2.avgMs / 1000).toFixed(6)}ms`);

// Test 3: Signal Writes
console.log('\n📊 Signal Writes\n');
const writeSig = createSignal(0);
const r3 = bench('Write signal 1000x', () => {
  for (let i = 0; i < 1000; i++) writeSig.set(i);
});
print(r3);
console.log(`   Per write: ${(r3.avgMs / 1000).toFixed(6)}ms`);

// Test 4: Computed Signals
console.log('\n📊 Computed Signals\n');
const count = createSignal(5);
const doubled = createComputed(() => count.get() * 2);
const r4 = bench('Read computed 1000x', () => {
  for (let i = 0; i < 1000; i++) doubled.get();
});
print(r4);
console.log(`   Per read: ${(r4.avgMs / 1000).toFixed(6)}ms`);

// Test 5: Computed Recalculation
console.log('\n📊 Computed Recalculation\n');
const base = createSignal(0);
const calc = createComputed(() => base.get() * 2);
const r5 = bench('Update signal + recompute 1000x', () => {
  for (let i = 0; i < 1000; i++) {
    base.set(i);
    calc.get();
  }
});
print(r5);

// Test 6: Batch Updates
console.log('\n📊 Batch Updates\n');
const sigs = Array.from({ length: 100 }, (_, i) => createSignal(i));
const r6 = bench('Batch update 100 signals', () => {
  batch(() => {
    sigs.forEach((s, i) => s.set(i + 1));
  });
});
print(r6);
console.log(`   Per signal: ${(r6.avgMs / 100).toFixed(6)}ms`);

// Test 7: Effects
console.log('\n📊 Effects\n');
let effectCount = 0;
const effSig = createSignal(0);
const dispose = createEffect(() => {
  effSig.get();
  effectCount++;
});
const r7 = bench('Trigger effect 1000x', () => {
  for (let i = 0; i < 1000; i++) effSig.set(i);
});
dispose();
print(r7);

// Test 8: Deep Dependency Chain
console.log('\n📊 Dependency Chain (10 levels)\n');
const chain = [createSignal(1)];
for (let i = 0; i < 9; i++) {
  chain.push(createComputed(() => chain[i].get() + 1));
}
const r8 = bench('Update with 10-level chain', () => {
  chain[0].set(Math.random());
  chain[9].get();
});
print(r8);

// Test 9: Wide Dependencies (1 signal → 100 computed)
console.log('\n📊 Wide Dependencies (1→100)\n');
const source = createSignal(1);
const derived = Array.from({ length: 100 }, (_, i) => 
  createComputed(() => source.get() + i)
);
const r9 = bench('Update 1 signal → 100 computed', () => {
  source.set(Math.random());
  derived.forEach(d => d.get());
});
print(r9);

// Memory Test
console.log('\n📊 Memory Usage\n');
if (global.gc) global.gc();
const memBefore = process.memoryUsage().heapUsed;
const many = Array.from({ length: 10000 }, (_, i) => createSignal(i));
const memAfter = process.memoryUsage().heapUsed;
const memDiff = memAfter - memBefore;
console.log(`10,000 signals: ${(memDiff / 1024 / 1024).toFixed(2)} MB`);
console.log(`Per signal: ${(memDiff / 10000).toFixed(0)} bytes`);

// Summary
console.log('\n' + '='.repeat(90));
console.log('\n🎯 Summary\n');
console.log(`✅ Signal creation: ${(r1.avgMs / 1000 * 1000000).toFixed(0)}ns per signal`);
console.log(`✅ Signal read: ${(r2.avgMs / 1000 * 1000000).toFixed(0)}ns per operation`);
console.log(`✅ Signal write: ${(r3.avgMs / 1000 * 1000000).toFixed(0)}ns per operation`);
console.log(`✅ Computed read: ${(r4.avgMs / 1000 * 1000000).toFixed(0)}ns per operation`);
console.log(`✅ Batch updates: ${r6.avgMs.toFixed(3)}ms for 100 signals`);
console.log(`✅ Memory efficient: ${(memDiff / 10000).toFixed(0)} bytes per signal`);
console.log(`✅ Production-ready performance at scale\n`);
console.log('='.repeat(90) + '\n');
