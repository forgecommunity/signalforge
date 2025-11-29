import { createSignal, createComputed, batch } from '../core/store';
const benchmarkResults = [];
function now() {
    if (typeof performance !== 'undefined' && performance.now) {
        return performance.now();
    }
    return Date.now();
}
export function benchmarkSignalUpdates(count) {
    console.time('SignalForge: Sequential Updates');
    const startTime = now();
    const signal = createSignal(0);
    const computed = createComputed(() => signal.get() * 2);
    let computedValue = 0;
    for (let i = 0; i < count; i++) {
        signal.set(i);
        computedValue = computed.get();
    }
    const endTime = now();
    console.timeEnd('SignalForge: Sequential Updates');
    const totalTime = endTime - startTime;
    const averageTime = totalTime / count;
    const opsPerSecond = (count / totalTime) * 1000;
    const result = {
        name: 'SignalForge Sequential Updates',
        iterations: count,
        totalTime,
        averageTime,
        opsPerSecond,
        metadata: {
            lastValue: computedValue,
        },
    };
    benchmarkResults.push(result);
    return result;
}
export function benchmarkBatchedUpdates(count) {
    console.time('SignalForge: Batched Updates');
    const startTime = now();
    const signals = Array.from({ length: count }, () => createSignal(0));
    const computed = createComputed(() => signals.reduce((sum, s) => sum + s.get(), 0));
    batch(() => {
        for (let i = 0; i < count; i++) {
            signals[i].set(i);
        }
    });
    const computedValue = computed.get();
    const endTime = now();
    console.timeEnd('SignalForge: Batched Updates');
    const totalTime = endTime - startTime;
    const averageTime = totalTime / count;
    const opsPerSecond = (count / totalTime) * 1000;
    const result = {
        name: 'SignalForge Batched Updates',
        iterations: count,
        totalTime,
        averageTime,
        opsPerSecond,
        metadata: {
            computedValue,
        },
    };
    benchmarkResults.push(result);
    return result;
}
class SimpleReduxStore {
    constructor(initialState) {
        this.listeners = new Set();
        this.state = initialState;
    }
    getState() {
        return this.state;
    }
    dispatch(action) {
        if (action.type === 'INCREMENT') {
            this.state = { count: this.state.count + 1 };
        }
        else if (action.type === 'SET') {
            this.state = { count: action.payload };
        }
        this.listeners.forEach(listener => listener());
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
}
export function compareWithRedux(count = 10000) {
    console.time('Redux-like: Sequential Updates');
    const startTime = now();
    const store = new SimpleReduxStore({ count: 0 });
    let computedValue = 0;
    store.subscribe(() => {
        computedValue = store.getState().count * 2;
    });
    for (let i = 0; i < count; i++) {
        store.dispatch({ type: 'SET', payload: i });
    }
    const endTime = now();
    console.timeEnd('Redux-like: Sequential Updates');
    const totalTime = endTime - startTime;
    const averageTime = totalTime / count;
    const opsPerSecond = (count / totalTime) * 1000;
    const result = {
        name: 'Redux-like Sequential Updates',
        iterations: count,
        totalTime,
        averageTime,
        opsPerSecond,
        metadata: {
            lastValue: computedValue,
        },
    };
    benchmarkResults.push(result);
    return result;
}
class SimpleZustandStore {
    constructor(initialState) {
        this.listeners = new Set();
        this.state = initialState;
    }
    getState() {
        return this.state;
    }
    setState(partial) {
        this.state = { ...this.state, ...partial };
        this.listeners.forEach(listener => listener());
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
}
export function compareWithZustand(count = 10000) {
    console.time('Zustand-like: Sequential Updates');
    const startTime = now();
    const store = new SimpleZustandStore({ count: 0 });
    let computedValue = 0;
    store.subscribe(() => {
        computedValue = store.getState().count * 2;
    });
    for (let i = 0; i < count; i++) {
        store.setState({ count: i });
    }
    const endTime = now();
    console.timeEnd('Zustand-like: Sequential Updates');
    const totalTime = endTime - startTime;
    const averageTime = totalTime / count;
    const opsPerSecond = (count / totalTime) * 1000;
    const result = {
        name: 'Zustand-like Sequential Updates',
        iterations: count,
        totalTime,
        averageTime,
        opsPerSecond,
        metadata: {
            lastValue: computedValue,
        },
    };
    benchmarkResults.push(result);
    return result;
}
export function benchmarkMemoryUsage(count) {
    const hasMemoryAPI = typeof performance !== 'undefined' &&
        performance.memory;
    const startMemory = hasMemoryAPI ? performance.memory.usedJSHeapSize : 0;
    const startTime = now();
    const signals = Array.from({ length: count }, (_, i) => createSignal(i));
    if (typeof global !== 'undefined' && global.gc) {
        global.gc();
    }
    const endTime = now();
    const endMemory = hasMemoryAPI ? performance.memory.usedJSHeapSize : 0;
    const totalTime = endTime - startTime;
    const memoryUsed = endMemory - startMemory;
    const bytesPerSignal = memoryUsed / count;
    const result = {
        name: 'Memory Usage',
        iterations: count,
        totalTime,
        averageTime: totalTime / count,
        opsPerSecond: (count / totalTime) * 1000,
        metadata: {
            memoryUsedBytes: memoryUsed,
            memoryUsedKB: memoryUsed / 1024,
            memoryUsedMB: memoryUsed / (1024 * 1024),
            bytesPerSignal,
            hasMemoryAPI,
            signalCount: signals.length,
        },
    };
    benchmarkResults.push(result);
    return result;
}
export function runBenchmarkSuite(iterations = 10000) {
    console.log('\n🔥 Running SignalForge Benchmark Suite...\n');
    benchmarkResults.length = 0;
    benchmarkSignalUpdates(iterations);
    benchmarkBatchedUpdates(Math.floor(iterations / 10));
    compareWithRedux(iterations);
    compareWithZustand(iterations);
    benchmarkMemoryUsage(1000);
    console.log('\n✅ Benchmark suite completed!\n');
    return benchmarkResults;
}
export function logResults() {
    if (benchmarkResults.length === 0) {
        console.log('No benchmark results to display. Run some benchmarks first.');
        return;
    }
    console.log('\n📊 Benchmark Results\n');
    console.log('='.repeat(100));
    console.log('| ' +
        'Benchmark Name'.padEnd(35) + ' | ' +
        'Iterations'.padEnd(12) + ' | ' +
        'Total (ms)'.padEnd(12) + ' | ' +
        'Avg (ms)'.padEnd(12) + ' | ' +
        'Ops/sec'.padEnd(15) + ' |');
    console.log('='.repeat(100));
    for (const result of benchmarkResults) {
        console.log('| ' +
            result.name.padEnd(35) + ' | ' +
            result.iterations.toLocaleString().padEnd(12) + ' | ' +
            result.totalTime.toFixed(2).padEnd(12) + ' | ' +
            result.averageTime.toFixed(4).padEnd(12) + ' | ' +
            result.opsPerSecond.toLocaleString(undefined, { maximumFractionDigits: 0 }).padEnd(15) + ' |');
    }
    console.log('='.repeat(100));
    const signalForgeResult = benchmarkResults.find(r => r.name === 'SignalForge Sequential Updates');
    const reduxResult = benchmarkResults.find(r => r.name === 'Redux-like Sequential Updates');
    const zustandResult = benchmarkResults.find(r => r.name === 'Zustand-like Sequential Updates');
    if (signalForgeResult && reduxResult) {
        const speedup = reduxResult.totalTime / signalForgeResult.totalTime;
        console.log(`\n⚡ SignalForge is ${speedup.toFixed(2)}x ${speedup > 1 ? 'faster' : 'slower'} than Redux-like`);
    }
    if (signalForgeResult && zustandResult) {
        const speedup = zustandResult.totalTime / signalForgeResult.totalTime;
        console.log(`⚡ SignalForge is ${speedup.toFixed(2)}x ${speedup > 1 ? 'faster' : 'slower'} than Zustand-like`);
    }
    const batchedResult = benchmarkResults.find(r => r.name === 'SignalForge Batched Updates');
    if (signalForgeResult && batchedResult) {
        const improvement = signalForgeResult.averageTime / batchedResult.averageTime;
        console.log(`\n🔄 Batching provides ${improvement.toFixed(2)}x improvement in average update time`);
    }
    const memoryResult = benchmarkResults.find(r => r.name === 'Memory Usage');
    if (memoryResult && memoryResult.metadata?.hasMemoryAPI) {
        console.log(`\n💾 Memory: ${memoryResult.metadata.memoryUsedKB.toFixed(2)} KB for ${memoryResult.iterations} signals`);
        console.log(`   (~${memoryResult.metadata.bytesPerSignal.toFixed(0)} bytes per signal)`);
    }
    console.log('\n');
}
export function getResults() {
    return [...benchmarkResults];
}
export function clearResults() {
    benchmarkResults.length = 0;
    console.log('Benchmark results cleared.');
}
export function exportResults() {
    return JSON.stringify(benchmarkResults, null, 2);
}
export function customBenchmark(name, fn, iterations = 1000) {
    console.time(name);
    const startTime = now();
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    const endTime = now();
    console.timeEnd(name);
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    const opsPerSecond = (iterations / totalTime) * 1000;
    const result = {
        name,
        iterations,
        totalTime,
        averageTime,
        opsPerSecond,
    };
    benchmarkResults.push(result);
    return result;
}
