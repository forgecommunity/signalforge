import {
  createSignal,
  createComputed,
  createStore,
  flushSync,
  shallowEqual,
} from '../src/index';
import {
  clearPlugins,
  enablePlugins,
  registerPlugin,
} from '../src/core/plugins';

import jsiBridge from '../src/native/jsiBridge';
import {
  disableProfiler,
  enableProfiler,
  endLatencyMeasurement,
  onProfilerEvent,
  resetProfiler,
  startLatencyMeasurement,
} from '../src/devtools/performanceProfiler';
import {
  disableDevTools as disableRuntimeDevTools,
  enableDevTools as enableRuntimeDevTools,
  getActivePlugins,
} from '../src/devtools/runtime';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEquals<T>(actual: T, expected: T, message: string): void {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function assertThrows(fn: () => void, expectedMessage: string): void {
  try {
    fn();
  } catch (error: any) {
    assert(
      error.message.includes(expectedMessage),
      `Expected error containing "${expectedMessage}", got "${error.message}"`
    );
    return;
  }

  throw new Error(`Expected function to throw "${expectedMessage}"`);
}

console.log('\n=== Regression Tests ===');

function testPluginBeforeUpdate(): void {
  clearPlugins();
  enablePlugins();

  const value = createSignal(1);

  registerPlugin({
    name: 'regression-before-update',
    onBeforeUpdate(context) {
      if (context.newValue === 2) return 20;
      if (context.newValue === 3) return undefined;
      return context.newValue;
    },
  });

  value.set(2);
  assertEquals(value.get(), 20, 'onBeforeUpdate should replace the update value');

  value.set(3);
  assertEquals(value.get(), 20, 'onBeforeUpdate should cancel undefined updates');

  clearPlugins();
  console.log('✓ Plugin before-update interception');
}

function testDestroyedSignalsThrowAndCleanup(): void {
  const value = createSignal(1);
  let calls = 0;
  value.subscribe(() => calls++);

  value.set(2);
  assertEquals(calls, 1, 'subscriber should run before destroy');

  value.destroy();

  assertThrows(() => value.get(), 'destroyed signal');
  assertThrows(() => value.set(3), 'destroyed signal');
  assertThrows(() => value.subscribe(() => undefined), 'destroyed signal');
  console.log('✓ Destroyed signals reject reads, writes, and subscriptions');
}

function testCircularComputedThrows(): void {
  let circular: ReturnType<typeof createComputed<number>>;
  circular = createComputed(() => circular ? circular.get() + 1 : 1);

  try {
    circular._markDirty?.();
    assertThrows(() => circular.get(), 'Circular dependency');
  } finally {
    circular.destroy();
    flushSync();
  }

  console.log('✓ Circular computed recursion throws');
}

function testComputedRunsOnceOnCreate(): void {
  let runs = 0;
  const value = createSignal(2);
  const doubled = createComputed(() => {
    runs++;
    return value.get() * 2;
  });

  assertEquals(runs, 1, 'computed should run once during construction');
  assertEquals(doubled.get(), 4, 'computed should expose initial value');
  assertEquals(runs, 1, 'clean computed read should not recompute');

  value.set(3);
  flushSync();
  assertEquals(doubled.get(), 6, 'computed should update after dependency change');
  assertEquals(runs, 2, 'computed should run once per dependency change');

  doubled.destroy();
  value.destroy();
  console.log('Computed construction runs exactly once');
}

function testNativeBridgeJsFallback(): void {
  assert(!jsiBridge.isUsingNative(), 'test environment should use JavaScript fallback');

  const signal = jsiBridge.createSignal(1);
  assert(jsiBridge.hasSignal(signal), 'fallback signal should exist');
  assertEquals(jsiBridge.getSignal(signal), 1, 'fallback signal should return initial value');
  assertEquals(jsiBridge.getSignalVersion(signal), 0, 'initial fallback version should be 0');

  jsiBridge.setSignal(signal, 2);
  assertEquals(jsiBridge.getSignal(signal), 2, 'fallback signal should update');
  assertEquals(jsiBridge.getSignalVersion(signal), 1, 'fallback version should increment');

  jsiBridge.deleteSignal(signal);
  assert(!jsiBridge.hasSignal(signal), 'fallback signal should be deleted');
  console.log('✓ Native bridge JavaScript fallback');
}

testPluginBeforeUpdate();
testDestroyedSignalsThrowAndCleanup();
testCircularComputedThrows();
testComputedRunsOnceOnCreate();
testNativeBridgeJsFallback();

function testStoreApi(): void {
  const store = createStore({
    count: 1,
    label: 'items',
  });

  const doubled = store.select((state) => state.count * 2);

  assertEquals(doubled.get(), 2, 'store selector should compute initial value');
  store.set({ count: 2 });
  flushSync();
  assertEquals(store.get().count, 2, 'store patch should update state');
  assertEquals(doubled.get(), 4, 'store selector should update after patch');

  store.set((state) => ({ ...state, label: 'products' }));
  assertEquals(store.get().label, 'products', 'store function update should replace state');

  doubled.destroy();
  store.destroy();
  console.log('✓ Store API patch, function update, and selectors');
}

testStoreApi();

function testStoreSelectorEquality(): void {
  const store = createStore({
    count: 1,
    label: 'items',
  });

  const selected = store.select(
    (state) => ({ label: state.label }),
    (previous, next) => previous.label === next.label
  );

  let calls = 0;
  const unsubscribe = selected.subscribe(() => {
    calls++;
  });

  const firstSelection = selected.get();

  store.set({ count: 2 });
  flushSync();
  assertEquals(calls, 0, 'equal selector output should not notify subscribers');
  assert(
    selected.get() === firstSelection,
    'equal selector output should preserve previous reference'
  );

  store.set({ label: 'products' });
  flushSync();
  assertEquals(calls, 1, 'changed selector output should notify subscribers');
  assertEquals(selected.get().label, 'products', 'selector should expose changed value');

  unsubscribe();
  selected.destroy();
  store.destroy();
  console.log('Store selectors support custom equality');
}

testStoreSelectorEquality();

function testShallowEqual(): void {
  assert(shallowEqual({ count: 1 }, { count: 1 }), 'equal shallow objects should match');
  assert(!shallowEqual({ count: 1 }, { count: 2 }), 'different object values should not match');
  assert(shallowEqual([1, 'a'], [1, 'a']), 'equal shallow arrays should match');
  assert(!shallowEqual([1, 'a'], [1, 'b']), 'different array values should not match');
  assert(!shallowEqual({ nested: { a: 1 } }, { nested: { a: 1 } }), 'nested objects compare by reference');

  const store = createStore({
    count: 1,
    label: 'items',
  });
  const selected = store.select(
    (state) => ({ label: state.label }),
    shallowEqual
  );

  let calls = 0;
  selected.subscribe(() => {
    calls++;
  });

  const firstSelection = selected.get();
  store.set({ count: 2 });
  flushSync();

  assertEquals(calls, 0, 'shallowEqual selector should suppress equal object output');
  assert(selected.get() === firstSelection, 'shallowEqual selector should preserve reference');

  selected.destroy();
  store.destroy();
  console.log('shallowEqual supports selector ergonomics');
}

testShallowEqual();

function testDevToolsPluginDebugSnapshot(): void {
  clearPlugins();
  enablePlugins();
  enableRuntimeDevTools({ enabled: true, logToConsole: false });

  registerPlugin({
    name: 'debug-snapshot-plugin',
    version: '1.2.3',
    onBeforeUpdate(context) {
      return context.newValue;
    },
    onSignalUpdate() {
      return undefined;
    },
  });

  const plugins = getActivePlugins();
  const plugin = plugins.find((item) => item.name === 'debug-snapshot-plugin');

  assert(plugin !== undefined, 'DevTools should expose registered plugins');
  assertEquals(plugin!.version, '1.2.3', 'DevTools should expose plugin version');
  assert(plugin!.enabled, 'DevTools should expose plugin enabled state');
  assert(plugin!.stats.onBeforeUpdate, 'DevTools should expose before-update hook');
  assert(plugin!.stats.onSignalUpdate, 'DevTools should expose update hook');

  disableRuntimeDevTools();
  clearPlugins();
  console.log('DevTools plugin debug snapshot');
}

testDevToolsPluginDebugSnapshot();

function testProfilerEvents(): void {
  resetProfiler();
  enableProfiler({ emitEvents: true });

  const events: string[] = [];
  const unsubscribe = onProfilerEvent((event) => {
    events.push(event.type);
  });

  startLatencyMeasurement('profiled-signal', 1);
  endLatencyMeasurement('profiled-signal', 'signal', false);

  unsubscribe();
  disableProfiler();
  resetProfiler();

  assert(
    events.includes('profiler-latency-sample'),
    'profiler should emit latency samples to subscribers'
  );
  console.log('✓ Profiler event subscription');
}

testProfilerEvents();

console.log('All regression tests passed');
