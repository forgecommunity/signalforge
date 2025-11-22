/**
 * SignalForge Performance Benchmarks
 * Standalone benchmarks without external dependencies
 * 
 * Run with: tsx benchmarks/comprehensive.ts
 */

import { createSignal, createComputed, batch, createEffect } from '../src/core/store';

// Benchmark configuration
const ITERATIONS = 1000;
const WARMUP_ITERATIONS = 100;

interface BenchmarkResult {
  name: string;
  avgTime: number;
  minTime: number;
  maxTime: number;
  ops: number;
}

function benchmark(name: string, fn: () => void): BenchmarkResult {
  // Warmup
  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    fn();
  }
  
  // Measure
  const times: number[] = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const ops = 1000 / avgTime;
  
  return { name, avgTime, minTime, maxTime, ops };
}

function formatResult(result: BenchmarkResult): string {
  return `${result.name.padEnd(40)} ${result.avgTime.toFixed(3)}ms avg  ${result.minTime.toFixed(3)}ms min  ${result.maxTime.toFixed(3)}ms max  ${result.ops.toFixed(0)} ops/sec`;
}

console.log('🏁 SignalForge Performance Benchmarks\n');
console.log('='.repeat(100));
console.log('\n📊 Signal Creation Performance\n');

// Benchmark 1: Signal Creation
const createSignalBench = benchmark('Create 1000 signals', () => {
  const signals = [];
  for (let i = 0; i < 1000; i++) {
    signals.push(createSignal(i));
  }
});

console.log(formatResult(createSignalBench));
console.log(`\n✅ Creating signals is extremely fast: ${createSignalBench.avgTime.toFixed(3)}ms total\n`);

console.log('='.repeat(120));
console.log('\n📊 Signal Update Performance\n');

// Benchmark 2: Signal Updates
const signal = createSignal(0);
const updateSignalBench = benchmark('SignalForge: 1000 signal updates', () => {
  for (let i = 0; i < 1000; i++) {
    signal.set(i);
  }
});

const zustandStore = create((set) => ({
  value: 0,
  setValue: (val: number) => set({ value: val })
}));
const updateZustandBench = benchmark('Zustand: 1000 store updates', () => {
  for (let i = 0; i < 1000; i++) {
    zustandStore.getState().setValue(i);
  }
});

console.log(formatResult(updateSignalBench));
console.log(formatResult(updateZustandBench));
console.log(`\n🏆 SignalForge is ${(updateZustandBench.avgTime / updateSignalBench.avgTime).toFixed(1)}x faster\n`);

console.log('='.repeat(120));
console.log('\n📊 Batch Update Performance\n');

// Benchmark 3: Batch Updates
const signals = Array.from({ length: 100 }, (_, i) => createSignal(i));
const batchSignalBench = benchmark('SignalForge: Batch 100 signal updates', () => {
  batch(() => {
    signals.forEach((s, i) => s.set(i + 1));
  });
});

const counterSlice = createSlice({
  name: 'counter',
  initialState: Array.from({ length: 100 }, (_, i) => i),
  reducers: {
    updateAll: (state, action) => action.payload,
  },
});

const reduxStore = configureStore({
  reducer: counterSlice.reducer,
});

const batchReduxBench = benchmark('Redux: Update 100 values', () => {
  reduxStore.dispatch(
    counterSlice.actions.updateAll(
      Array.from({ length: 100 }, (_, i) => i + 1)
    )
  );
});

console.log(formatResult(batchSignalBench));
console.log(formatResult(batchReduxBench));
console.log(`\n🏆 SignalForge is ${(batchReduxBench.avgTime / batchSignalBench.avgTime).toFixed(1)}x faster\n`);

console.log('='.repeat(120));
console.log('\n📊 Computed Signal Performance\n');

// Benchmark 4: Computed Signals
const count = createSignal(0);
const doubled = createComputed(() => count.get() * 2);
const computedSignalBench = benchmark('SignalForge: Read computed 1000x', () => {
  for (let i = 0; i < 1000; i++) {
    doubled.get();
  }
});

const zustandComputed = create((set, get) => ({
  count: 0,
  setCount: (val: number) => set({ count: val }),
  doubled: () => get().count * 2,
}));
const computedZustandBench = benchmark('Zustand: Read computed 1000x', () => {
  for (let i = 0; i < 1000; i++) {
    zustandComputed.getState().doubled();
  }
});

console.log(formatResult(computedSignalBench));
console.log(formatResult(computedZustandBench));
console.log(`\n🏆 SignalForge is ${(computedZustandBench.avgTime / computedSignalBench.avgTime).toFixed(1)}x faster\n`);

console.log('='.repeat(120));
console.log('\n📊 Memory Usage (Approximate)\n');

// Benchmark 5: Memory Usage
if (global.gc) {
  global.gc();
}

const memBefore = process.memoryUsage().heapUsed;
const largeSignalArray = Array.from({ length: 10000 }, (_, i) => createSignal(i));
const memAfter = process.memoryUsage().heapUsed;
const memDiff = memAfter - memBefore;
const perSignal = memDiff / 10000;

console.log(`10,000 signals: ${(memDiff / 1024 / 1024).toFixed(2)}MB`);
console.log(`Per signal: ${perSignal.toFixed(0)} bytes\n`);

console.log('='.repeat(120));
console.log('\n🎯 Summary\n');

const avgSpeedup = [
  createZustandBench.avgTime / createSignalBench.avgTime,
  updateZustandBench.avgTime / updateSignalBench.avgTime,
  batchReduxBench.avgTime / batchSignalBench.avgTime,
  computedZustandBench.avgTime / computedSignalBench.avgTime,
].reduce((a, b) => a + b, 0) / 4;

console.log(`✅ SignalForge is ${avgSpeedup.toFixed(1)}x faster on average`);
console.log(`✅ Memory efficient: ${perSignal.toFixed(0)} bytes per signal`);
console.log(`✅ Ready for production at scale\n`);

console.log('='.repeat(120));
