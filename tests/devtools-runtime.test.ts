/**
 * SignalForge DevTools Runtime Tests
 * 
 * Comprehensive test suite for the event-streaming DevTools runtime
 * 
 * Test Categories:
 * 1. Configuration & Lifecycle
 * 2. Signal Registration & Tracking
 * 3. Event Stream System
 * 4. Dependency Tracking
 * 5. Performance Monitoring
 * 6. Production Mode Safety
 * 7. Edge Cases & Error Handling
 */

import { createSignal, createComputed } from '../src/core/store';
import {
  // Configuration
  enableDevTools,
  disableDevTools,
  isDevToolsEnabled,
  getDevToolsConfig,
  
  // Registration
  registerSignal,
  unregisterSignal,
  trackUpdate,
  
  // Dependency tracking
  trackDependency,
  untrackDependency,
  
  // Query API
  listSignals,
  getSignal,
  getDependencies,
  getSubscribers,
  
  // Event API
  onDevToolsEvent,
  offDevToolsEvent,
  getEventListenerCount,
  clearEventListeners,
  
  // Performance
  getPerformanceMetrics,
  clearPerformanceMetrics,
  
  // Types
  type DevToolsEvent,
  type SignalCreatedPayload,
  type SignalUpdatedPayload,
  type SignalDestroyedPayload,
  type DependencyPayload,
  type PerformanceWarningPayload,
} from '../src/devtools/runtime';

// ============================================================================
// Test Utilities
// ============================================================================

let testCount = 0;
let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string): void {
  testCount++;
  
  if (condition) {
    passCount++;
    console.log(`✓ Test ${testCount}: ${message}`);
  } else {
    failCount++;
    console.error(`✗ Test ${testCount}: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEquals(actual: any, expected: any, message: string): void {
  const isEqual = JSON.stringify(actual) === JSON.stringify(expected);
  assert(isEqual, `${message} (expected: ${JSON.stringify(expected)}, got: ${JSON.stringify(actual)})`);
}

function assertGreaterThan(actual: number, expected: number, message: string): void {
  assert(actual > expected, `${message} (expected > ${expected}, got ${actual})`);
}

function assertContains<T>(array: T[], value: T, message: string): void {
  assert(array.includes(value), `${message} (array: ${JSON.stringify(array)}, value: ${JSON.stringify(value)})`);
}

// ============================================================================
// Test Setup & Teardown
// ============================================================================

function setup(): void {
  // Enable DevTools with test configuration
  enableDevTools({
    enabled: true,
    trackPerformance: true,
    logToConsole: false,
    maxPerformanceSamples: 100,
    slowUpdateThreshold: 1, // 1ms for testing
    emitPerformanceWarnings: true,
  });
  
  // Clear all state
  clearEventListeners();
  clearPerformanceMetrics();
}

function teardown(): void {
  clearEventListeners();
  disableDevTools();
}

// ============================================================================
// Test Suite 1: Configuration & Lifecycle
// ============================================================================

console.log('\n=== Test Suite 1: Configuration & Lifecycle ===\n');

setup();

// Test 1: DevTools can be enabled
assert(isDevToolsEnabled(), 'DevTools is enabled after enableDevTools()');

// Test 2: Configuration is set correctly
const config = getDevToolsConfig();
assert(config.enabled === true, 'Config has enabled=true');
assert(config.trackPerformance === true, 'Config has trackPerformance=true');
assert(config.slowUpdateThreshold === 1, 'Config has slowUpdateThreshold=1');

// Test 3: DevTools can be disabled
disableDevTools();
assert(!isDevToolsEnabled(), 'DevTools is disabled after disableDevTools()');

// Test 4: Re-enable DevTools
enableDevTools();
assert(isDevToolsEnabled(), 'DevTools can be re-enabled');

teardown();

// ============================================================================
// Test Suite 2: Signal Registration & Tracking
// ============================================================================

console.log('\n=== Test Suite 2: Signal Registration & Tracking ===\n');

setup();

// Test 5: Signal registration returns unique IDs
const signal1 = createSignal(10);
const id1 = registerSignal(signal1, 'signal', 10, 'counter');
const signal2 = createSignal('hello');
const id2 = registerSignal(signal2, 'signal', 'hello', 'message');

assert(id1 !== '', 'First signal ID is not empty');
assert(id2 !== '', 'Second signal ID is not empty');
assert(id1 !== id2, 'Signal IDs are unique');

// Test 6: Signal appears in listSignals()
const signals = listSignals();
assert(signals.length === 2, 'listSignals() returns 2 signals');
assert(signals[0].id === id1, 'First signal has correct ID');
assert(signals[1].id === id2, 'Second signal has correct ID');

// Test 7: Signal metadata is correct
const metadata1 = getSignal(id1);
assert(metadata1 !== undefined, 'getSignal() returns metadata');
assert(metadata1!.type === 'signal', 'Signal type is "signal"');
assert(metadata1!.value === 10, 'Signal value is 10');
assert(metadata1!.name === 'counter', 'Signal name is "counter"');
assert(metadata1!.subscriberCount === 0, 'Initial subscriberCount is 0');
assert(metadata1!.updateCount === 0, 'Initial updateCount is 0');

// Test 8: Signal unregistration
unregisterSignal(signal1);
const signalsAfter = listSignals();
assert(signalsAfter.length === 1, 'listSignals() returns 1 signal after unregistration');
assert(getSignal(id1) === undefined, 'Unregistered signal returns undefined');

teardown();

// ============================================================================
// Test Suite 3: Event Stream System
// ============================================================================

console.log('\n=== Test Suite 3: Event Stream System ===\n');

setup();

// Test 9: Event listeners can be registered
const events: DevToolsEvent[] = [];
const cleanup = onDevToolsEvent('*', (event) => {
  events.push(event);
});

assert(getEventListenerCount('*') === 1, 'Wildcard listener is registered');
assert(getEventListenerCount('signal-created') === 0, 'No specific listeners yet');

// Test 10: signal-created event is emitted
const signal3 = createSignal(100);
registerSignal(signal3, 'signal', 100, 'test');

assert(events.length === 1, 'One event was emitted');
assert(events[0].type === 'signal-created', 'Event type is signal-created');

const createdPayload = events[0].payload as SignalCreatedPayload;
assert(createdPayload.type === 'signal', 'Payload type is signal');
assert(createdPayload.initialValue === 100, 'Payload has correct initial value');
assert(createdPayload.name === 'test', 'Payload has correct name');

// Test 11: signal-updated event is emitted
events.length = 0; // Clear events

trackUpdate(signal3, () => {
  signal3.set(200);
}, 100);

assert(events.length === 1, 'Update event was emitted');
assert(events[0].type === 'signal-updated', 'Event type is signal-updated');

const updatedPayload = events[0].payload as SignalUpdatedPayload;
assert(updatedPayload.previousValue === 100, 'Payload has correct previous value');
assert(updatedPayload.newValue === 200, 'Payload has correct new value');
assert(updatedPayload.skipped === false, 'Update was not skipped');

// Test 12: signal-destroyed event is emitted
events.length = 0;

unregisterSignal(signal3);

assert(events.length === 1, 'Destroy event was emitted');
assert(events[0].type === 'signal-destroyed', 'Event type is signal-destroyed');

const destroyedPayload = events[0].payload as SignalDestroyedPayload;
assert(destroyedPayload.type === 'signal', 'Payload type is signal');
assert(destroyedPayload.finalValue === 200, 'Payload has correct final value');
assertGreaterThan(destroyedPayload.lifetime, 0, 'Lifetime is greater than 0');

// Test 13: Multiple listeners can be registered
events.length = 0;
const specificEvents: DevToolsEvent[] = [];

const cleanup2 = onDevToolsEvent('signal-created', (event) => {
  specificEvents.push(event);
});

assert(getEventListenerCount('*') === 1, 'Still 1 wildcard listener');
assert(getEventListenerCount('signal-created') === 1, 'Now 1 specific listener');

const signal4 = createSignal(42);
registerSignal(signal4, 'signal', 42);

assert(events.length === 1, 'Wildcard listener received event');
assert(specificEvents.length === 1, 'Specific listener received event');

// Test 14: Listeners can be unregistered
cleanup();
cleanup2();

assert(getEventListenerCount('*') === 0, 'Wildcard listener removed');
assert(getEventListenerCount('signal-created') === 0, 'Specific listener removed');

teardown();

// ============================================================================
// Test Suite 4: Dependency Tracking
// ============================================================================

console.log('\n=== Test Suite 4: Dependency Tracking ===\n');

setup();

// Test 15: Dependency tracking creates relationships
const source = createSignal(5);
const sourceId = registerSignal(source, 'signal', 5, 'source');

const computed1 = createComputed(() => source.get() * 2);
const computedId = registerSignal(computed1, 'computed', 10, 'doubled');

trackDependency(computed1, source);

// Test 16: getDependencies returns correct IDs
const dependencies = getDependencies(computedId);
assertContains(dependencies, sourceId, 'Computed has source as dependency');

// Test 17: getSubscribers returns correct IDs
const subscribers = getSubscribers(sourceId);
assertContains(subscribers, computedId, 'Source has computed as subscriber');

// Test 18: Metadata reflects dependency counts
const sourceMeta = getSignal(sourceId);
assert(sourceMeta!.subscriberCount === 1, 'Source has 1 subscriber');
assert(sourceMeta!.subscribers.length === 1, 'Source subscribers array has 1 entry');

const computedMeta = getSignal(computedId);
assert(computedMeta!.dependencies.length === 1, 'Computed has 1 dependency');

// Test 19: dependency-added event is emitted
const depEvents: DevToolsEvent[] = [];
const depCleanup = onDevToolsEvent('dependency-added', (event) => {
  depEvents.push(event);
});

const computed2 = createComputed(() => source.get() * 3);
const computed2Id = registerSignal(computed2, 'computed', 15, 'tripled');
trackDependency(computed2, source);

assert(depEvents.length === 1, 'dependency-added event was emitted');
const depPayload = depEvents[0].payload as DependencyPayload;
assert(depPayload.subscriberId === computed2Id, 'Payload has correct subscriberId');
assert(depPayload.dependencyId === sourceId, 'Payload has correct dependencyId');

// Test 20: Dependency removal works
untrackDependency(computed1, source);

const depsAfter = getDependencies(computedId);
assert(!depsAfter.includes(sourceId), 'Dependency was removed');

const subsAfter = getSubscribers(sourceId);
assert(!subsAfter.includes(computedId), 'Subscriber was removed');

depCleanup();
teardown();

// ============================================================================
// Test Suite 5: Performance Monitoring
// ============================================================================

console.log('\n=== Test Suite 5: Performance Monitoring ===\n');

setup();

// Test 21: trackUpdate captures performance metrics
const perfSignal = createSignal(0);
const perfId = registerSignal(perfSignal, 'signal', 0, 'perf');

trackUpdate(perfSignal, () => {
  perfSignal.set(1);
}, 0);

const metrics = getPerformanceMetrics();
assert(metrics.length === 1, 'One performance metric was captured');
assert(metrics[0].signalId === perfId, 'Metric has correct signalId');
assert(metrics[0].type === 'signal', 'Metric has correct type');
assertGreaterThan(metrics[0].duration, -1, 'Duration is >= 0');

// Test 22: Slow updates emit performance warnings
const perfWarnings: DevToolsEvent[] = [];
const perfCleanup = onDevToolsEvent('performance-warning', (event) => {
  perfWarnings.push(event);
});

trackUpdate(perfSignal, () => {
  // Simulate slow operation
  const start = Date.now();
  while (Date.now() - start < 5) {
    // Busy wait for 5ms
  }
  perfSignal.set(2);
}, 1);

assert(perfWarnings.length === 1, 'Performance warning was emitted');
const perfPayload = perfWarnings[0].payload as PerformanceWarningPayload;
assert(perfPayload.signalId === perfId, 'Warning has correct signalId');
assertGreaterThan(perfPayload.duration, 1, 'Warning duration > threshold');

// Test 23: Performance metrics can be cleared
clearPerformanceMetrics();
const metricsAfter = getPerformanceMetrics();
assert(metricsAfter.length === 0, 'Performance metrics were cleared');

perfCleanup();
teardown();

// ============================================================================
// Test Suite 6: Production Mode Safety
// ============================================================================

console.log('\n=== Test Suite 6: Production Mode Safety ===\n');

// Test 24: Operations are no-ops when DevTools disabled
disableDevTools();

const prodSignal = createSignal(999);
const prodId = registerSignal(prodSignal, 'signal', 999, 'prod');

assert(prodId === '', 'registerSignal returns empty string when disabled');
assert(listSignals().length === 0, 'listSignals returns empty array when disabled');
assert(getSignal('any') === undefined, 'getSignal returns undefined when disabled');

// Test 25: trackUpdate still executes updateFn when disabled
let updateExecuted = false;
trackUpdate(prodSignal, () => {
  updateExecuted = true;
  prodSignal.set(1000);
});

assert(updateExecuted, 'trackUpdate executes updateFn even when disabled');
assert(prodSignal.get() === 1000, 'Signal value was updated');

// Test 26: No events are emitted when disabled
const prodEvents: DevToolsEvent[] = [];
onDevToolsEvent('*', (event) => {
  prodEvents.push(event);
});

const prodSignal2 = createSignal(42);
registerSignal(prodSignal2, 'signal', 42);

assert(prodEvents.length === 0, 'No events emitted when DevTools disabled');

// ============================================================================
// Test Suite 7: Edge Cases & Error Handling
// ============================================================================

console.log('\n=== Test Suite 7: Edge Cases & Error Handling ===\n');

setup();

// Test 27: Registering same signal twice
const edgeSignal = createSignal(1);
const edgeId1 = registerSignal(edgeSignal, 'signal', 1);
const edgeId2 = registerSignal(edgeSignal, 'signal', 1);

assert(edgeId1 !== edgeId2, 'Each registration gets unique ID (warning: signals should only be registered once)');

// Test 28: Unregistering non-existent signal is safe
const neverRegistered = createSignal(123);
unregisterSignal(neverRegistered); // Should not throw
assert(true, 'Unregistering non-existent signal is safe');

// Test 29: Tracking dependencies for non-registered signals is safe
const nonReg1 = createSignal(1);
const nonReg2 = createSignal(2);
trackDependency(nonReg1, nonReg2); // Should not throw
assert(true, 'trackDependency on non-registered signals is safe');

// Test 30: Getting non-existent signal returns undefined
const nonExistent = getSignal('signal_99999');
assert(nonExistent === undefined, 'getSignal returns undefined for non-existent ID');

// Test 31: Event listener errors don't break other listeners
const errorListener = () => {
  throw new Error('Listener error');
};
const workingListener = onDevToolsEvent('signal-created', errorListener);

const goodEvents: DevToolsEvent[] = [];
const goodListener = onDevToolsEvent('signal-created', (event) => {
  goodEvents.push(event);
});

const errorSignal = createSignal(42);
registerSignal(errorSignal, 'signal', 42);

assert(goodEvents.length === 1, 'Working listener received event despite error in other listener');

workingListener();
goodListener();
teardown();

// ============================================================================
// Test Suite 8: Complex Scenarios
// ============================================================================

console.log('\n=== Test Suite 8: Complex Scenarios ===\n');

setup();

// Test 32: Multiple dependency chains
const a = createSignal(1);
const aId = registerSignal(a, 'signal', 1, 'a');

const b = createComputed(() => a.get() * 2);
const bId = registerSignal(b, 'computed', 2, 'b');
trackDependency(b, a);

const c = createComputed(() => b.get() * 2);
const cId = registerSignal(c, 'computed', 4, 'c');
trackDependency(c, b);

// a -> b -> c chain
const bDeps = getDependencies(bId);
assertContains(bDeps, aId, 'b depends on a');

const cDeps = getDependencies(cId);
assertContains(cDeps, bId, 'c depends on b');

const aSubs = getSubscribers(aId);
assertContains(aSubs, bId, 'a has b as subscriber');

// Test 33: Event sequence numbers are monotonically increasing
const seqEvents: DevToolsEvent[] = [];
onDevToolsEvent('*', (event) => {
  seqEvents.push(event);
});

const s1 = createSignal(1);
registerSignal(s1, 'signal', 1);

const s2 = createSignal(2);
registerSignal(s2, 'signal', 2);

assert(seqEvents[0].sequence < seqEvents[1].sequence, 'Event sequence numbers are increasing');

// Test 34: Skipped updates are tracked correctly
const skipSignal = createSignal(100);
const skipId = registerSignal(skipSignal, 'signal', 100);

const skipEvents: DevToolsEvent[] = [];
onDevToolsEvent('signal-updated', (event) => {
  skipEvents.push(event);
});

// Update with same value (should be skipped)
trackUpdate(skipSignal, () => {
  skipSignal.set(100);
}, 100);

assert(skipEvents.length === 1, 'Update event emitted even for skipped update');
const skipPayload = skipEvents[0].payload as SignalUpdatedPayload;
assert(skipPayload.skipped === true, 'Skipped flag is true for same-value update');

// Test 35: Metadata timestamps are accurate
const timeSignal = createSignal(0);
const timeId = registerSignal(timeSignal, 'signal', 0);

const timeMeta = getSignal(timeId)!;
const createdAt = timeMeta.createdAt;

// Small delay to ensure different timestamp
const delayStart = Date.now();
while (Date.now() - delayStart < 2) {
  // Busy wait
}

trackUpdate(timeSignal, () => {
  timeSignal.set(1);
}, 0);

const timeMetaAfter = getSignal(timeId)!;
assertGreaterThan(timeMetaAfter.updatedAt, createdAt, 'updatedAt is greater than createdAt');
assertEquals(timeMetaAfter.updateCount, 1, 'updateCount is 1 after one update');

teardown();

// ============================================================================
// Test Results Summary
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('TEST RESULTS SUMMARY');
console.log('='.repeat(60));
console.log(`Total Tests: ${testCount}`);
console.log(`✓ Passed: ${passCount}`);
console.log(`✗ Failed: ${failCount}`);
console.log(`Success Rate: ${((passCount / testCount) * 100).toFixed(1)}%`);
console.log('='.repeat(60));

if (failCount === 0) {
  console.log('\n🎉 ALL TESTS PASSED! 🎉\n');
  process.exit(0);
} else {
  console.error('\n❌ SOME TESTS FAILED ❌\n');
  process.exit(1);
}
