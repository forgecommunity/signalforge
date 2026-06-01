import { configureStore, createSlice } from '@reduxjs/toolkit';
import { createStore as createZustandStore } from 'zustand/vanilla';

import { createSignal, createStore as createSignalStore, flushSync } from '../src/index';

type Result = {
  name: string;
  totalMs: number;
  opsPerSecond: number;
};

const ITERATIONS = 50_000;
const WARMUP = 5_000;

function measure(name: string, fn: () => void): Result {
  for (let i = 0; i < WARMUP; i++) {
    fn();
  }

  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    fn();
  }
  const totalMs = performance.now() - start;

  return {
    name,
    totalMs,
    opsPerSecond: ITERATIONS / (totalMs / 1000),
  };
}

function printResults(title: string, results: Result[]): void {
  console.log(`\n${title}`);
  console.log('-'.repeat(72));

  for (const result of results.sort((a, b) => b.opsPerSecond - a.opsPerSecond)) {
    console.log(
      `${result.name.padEnd(24)} ${result.totalMs.toFixed(2).padStart(10)}ms  ${Math.round(result.opsPerSecond)
        .toString()
        .padStart(12)} ops/s`
    );
  }
}

function benchmarkPrimitiveUpdates(): Result[] {
  const signal = createSignal(0);

  const zustand = createZustandStore<{ count: number; setCount: (count: number) => void }>((set) => ({
    count: 0,
    setCount: (count) => set({ count }),
  }));

  const slice = createSlice({
    name: 'counter',
    initialState: { count: 0 },
    reducers: {
      setCount(state, action: { payload: number }) {
        state.count = action.payload;
      },
    },
  });
  const redux = configureStore({ reducer: slice.reducer });

  return [
    measure('SignalForge signal', () => {
      signal.set(signal.get() + 1);
    }),
    measure('Zustand vanilla', () => {
      zustand.getState().setCount(zustand.getState().count + 1);
    }),
    measure('Redux Toolkit', () => {
      redux.dispatch(slice.actions.setCount(redux.getState().count + 1));
    }),
  ];
}

function benchmarkSelectorReads(): Result[] {
  const signalStore = createSignalStore({ count: 1, label: 'items' });
  const signalSelected = signalStore.select((state) => state.count * 2);

  const zustand = createZustandStore<{ count: number; label: string }>(() => ({
    count: 1,
    label: 'items',
  }));

  const slice = createSlice({
    name: 'selector',
    initialState: { count: 1, label: 'items' },
    reducers: {},
  });
  const redux = configureStore({ reducer: slice.reducer });

  return [
    measure('SignalForge selector', () => {
      signalSelected.get();
    }),
    measure('Zustand selector', () => {
      zustand.getState().count * 2;
    }),
    measure('Redux selector', () => {
      redux.getState().count * 2;
    }),
  ];
}

function benchmarkSubscribedUpdates(): Result[] {
  let sink = 0;

  const signal = createSignal(0);
  const unsubscribeSignal = signal.subscribe((value) => {
    sink = value;
  });

  const zustand = createZustandStore<{ count: number; setCount: (count: number) => void }>((set) => ({
    count: 0,
    setCount: (count) => set({ count }),
  }));
  const unsubscribeZustand = zustand.subscribe((state) => {
    sink = state.count;
  });

  const slice = createSlice({
    name: 'subscribed',
    initialState: { count: 0 },
    reducers: {
      setCount(state, action: { payload: number }) {
        state.count = action.payload;
      },
    },
  });
  const redux = configureStore({ reducer: slice.reducer });
  const unsubscribeRedux = redux.subscribe(() => {
    sink = redux.getState().count;
  });

  const results = [
    measure('SignalForge subscribed', () => {
      signal.set(signal.get() + 1);
    }),
    measure('Zustand subscribed', () => {
      zustand.getState().setCount(zustand.getState().count + 1);
    }),
    measure('Redux subscribed', () => {
      redux.dispatch(slice.actions.setCount(redux.getState().count + 1));
    }),
  ];

  flushSync();
  unsubscribeSignal();
  unsubscribeZustand();
  unsubscribeRedux();
  signal.destroy();
  if (sink === Number.MIN_SAFE_INTEGER) {
    throw new Error('Unreachable sink guard');
  }

  return results;
}

console.log('\nSignalForge Comparison Benchmarks');
console.log(`Iterations per test: ${ITERATIONS.toLocaleString()}`);
console.log('Results are local machine measurements. Use them for regression tracking, not universal claims.');

printResults('Primitive updates', benchmarkPrimitiveUpdates());
printResults('Selector reads', benchmarkSelectorReads());
printResults('Subscribed updates', benchmarkSubscribedUpdates());
