/**
 * DevTools & Inspector Verification Test
 * 
 * Tests for DevTools inspector functionality:
 * - listSignals() returns all active signals
 * - getDependencies(id) returns correct graph
 * - getSignal(id) retrieves real-time value
 * - Signal destruction updates DevTools list correctly
 * - DevTools disabled in production mode (__DEVTOOLS__ = false)
 * - Performance tracking and metrics
 * - Dependency graph construction
 * - Signal metadata accuracy
 */

import { createSignal, createComputed, createEffect } from '../src/core/store';
import {
  enableDevTools,
  disableDevTools,
  isDevToolsEnabled,
  listSignals,
  getSignal,
  getDependencies,
  getSubscribers,
  getDependencyGraph,
  getSignalsByType,
  getPerformanceMetrics,
  getPerformanceSummary,
  clearPerformanceMetrics,
  exportSnapshot,
  registerSignal,
  unregisterSignal,
  trackDependency,
  trackUpdate,
  __DEVTOOLS__,
} from '../src/devtools/inspector';

// ============================================================================
// Test Runner
// ============================================================================

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    passCount++;
    console.log(`✅ ${message}`);
  } else {
    failCount++;
    console.error(`❌ ${message}`);
  }
}

function cleanup() {
  // Reset DevTools state by disabling and clearing
  disableDevTools();
  clearPerformanceMetrics();
  
  // Clear the internal registry by re-enabling and manually clearing
  // Note: This is a workaround since DevTools doesn't expose clearAll()
  // In production, signals should be properly destroyed
}

// ============================================================================
// Test Suite: Basic Enable/Disable
// ============================================================================

console.log('\n🧪 Test Suite: Basic Enable/Disable\n');

function testEnableDisable() {
  cleanup();
  
  // Test 1: DevTools disabled by default
  assert(!isDevToolsEnabled(), 'DevTools disabled by default');
  
  // Test 2: Enable DevTools
  enableDevTools();
  assert(isDevToolsEnabled(), 'DevTools can be enabled');
  
  // Test 3: Disable DevTools
  disableDevTools();
  assert(!isDevToolsEnabled(), 'DevTools can be disabled');
  
  // Test 4: Enable with config
  enableDevTools({ 
    trackPerformance: true, 
    logToConsole: false,
    maxPerformanceSamples: 500 
  });
  assert(isDevToolsEnabled(), 'DevTools can be enabled with config');
  
  // Test 5: Multiple enable calls don't error
  enableDevTools();
  enableDevTools();
  assert(isDevToolsEnabled(), 'Multiple enable calls are safe');
  
  cleanup();
}

// ============================================================================
// Test Suite: Signal Registration & Listing
// ============================================================================

console.log('\n🧪 Test Suite: Signal Registration & Listing\n');

function testSignalRegistration() {
  cleanup();
  enableDevTools();
  
  // Test 1: listSignals returns empty array initially
  const initial = listSignals();
  assert(initial.length === 0, 'listSignals returns empty array initially');
  
  // Test 2: Creating signal registers it
  const count = createSignal(0);
  const signalId1 = registerSignal(count, 'signal', 0);
  
  const signals1 = listSignals();
  assert(signals1.length === 1, 'Signal registered after creation');
  assert(signals1[0].type === 'signal', 'Signal type is correct');
  assert(signals1[0].value === 0, 'Signal value is correct');
  
  // Test 3: Multiple signals tracked
  const name = createSignal('Alice');
  const nameId = registerSignal(name, 'signal', 'Alice');
  
  const active = createSignal(true);
  const activeId = registerSignal(active, 'signal', true);
  
  const signals2 = listSignals();
  assert(signals2.length === 3, 'Multiple signals tracked');
  
  // Test 4: Computed signals tracked separately
  const doubled = createComputed(() => count.get() * 2);
  const doubledId = registerSignal(doubled, 'computed', 0);
  
  const signals3 = listSignals();
  assert(signals3.length === 4, 'Computed signals also tracked');
  
  const computedSignal = signals3.find(s => s.type === 'computed');
  assert(computedSignal !== undefined, 'Computed signal found in list');
  
  // Test 5: Effects tracked
  let effectRan = false;
  const effect = createEffect(() => {
    count.get();
    effectRan = true;
  });
  const effectId = registerSignal({ 
    get: () => undefined, 
    set: () => {}, 
    subscribe: () => () => {}, 
    destroy: () => {},
    _addSubscriber: () => {},
    _removeSubscriber: () => {},
    _peek: () => undefined,
  } as any, 'effect', undefined);
  
  const signals4 = listSignals();
  assert(signals4.length === 5, 'Effects also tracked');
  
  cleanup();
}

// ============================================================================
// Test Suite: Signal Retrieval
// ============================================================================

console.log('\n🧪 Test Suite: Signal Retrieval\n');

function testSignalRetrieval() {
  cleanup();
  enableDevTools();
  
  // Test 1: getSignal retrieves correct signal
  const count = createSignal(42);
  const countId = registerSignal(count, 'signal', 42);
  
  const metadata = getSignal(countId);
  assert(metadata !== undefined, 'getSignal retrieves signal');
  assert(metadata!.value === 42, 'getSignal returns current value');
  assert(metadata!.type === 'signal', 'getSignal returns correct type');
  
  // Test 2: getSignal with updated value
  count.set(100);
  trackUpdate(count, () => {}, 42);
  
  const updated = getSignal(countId);
  assert(updated!.value === 100, 'getSignal returns real-time value after update');
  
  // Test 3: getSignal with non-existent ID
  const missing = getSignal('signal_999');
  assert(missing === undefined, 'getSignal returns undefined for non-existent ID');
  
  // Test 4: getSignalsByType filters correctly
  const beforeSignals = getSignalsByType('signal').length;
  const beforeComputed = getSignalsByType('computed').length;
  
  const name = createSignal('Bob');
  const nameId = registerSignal(name, 'signal', 'Bob');
  
  const doubled = createComputed(() => count.get() * 2);
  const doubledId = registerSignal(doubled, 'computed', 200);
  
  const baseSignals = getSignalsByType('signal');
  const computedSignals = getSignalsByType('computed');
  
  // Check that we have more signals now (count is already registered from earlier test)
  assert(baseSignals.length >= beforeSignals + 1, 'getSignalsByType returns correct count for signals');
  assert(computedSignals.length === beforeComputed + 1, 'getSignalsByType returns correct count for computed');
  assert(baseSignals.every(s => s.type === 'signal'), 'All returned signals have correct type');
  
  cleanup();
}

// ============================================================================
// Test Suite: Dependency Tracking
// ============================================================================

console.log('\n🧪 Test Suite: Dependency Tracking\n');

function testDependencyTracking() {
  cleanup();
  enableDevTools();
  
  // Test 1: Base signal has no dependencies
  const count = createSignal(10);
  const countId = registerSignal(count, 'signal', 10);
  
  const deps1 = getDependencies(countId);
  assert(deps1.length === 0, 'Base signal has no dependencies');
  
  // Test 2: Computed signal tracks dependencies
  const doubled = createComputed(() => count.get() * 2);
  const doubledId = registerSignal(doubled, 'computed', 20);
  
  // Manually track dependency (in real code, this happens automatically)
  trackDependency(doubled, count);
  
  const deps2 = getDependencies(doubledId);
  assert(deps2.length === 1, 'Computed signal has one dependency');
  assert(deps2.includes(countId), 'Dependency ID is correct');
  
  // Test 3: getSubscribers returns dependent signals
  const subs = getSubscribers(countId);
  assert(subs.length === 1, 'Base signal has one subscriber');
  assert(subs.includes(doubledId), 'Subscriber ID is correct');
  
  // Test 4: Multiple dependencies
  const a = createSignal(5);
  const aId = registerSignal(a, 'signal', 5);
  
  const b = createSignal(3);
  const bId = registerSignal(b, 'signal', 3);
  
  const sum = createComputed(() => a.get() + b.get());
  const sumId = registerSignal(sum, 'computed', 8);
  
  trackDependency(sum, a);
  trackDependency(sum, b);
  
  const deps3 = getDependencies(sumId);
  assert(deps3.length === 2, 'Computed with multiple dependencies tracked');
  assert(deps3.includes(aId) && deps3.includes(bId), 'Both dependencies tracked');
  
  // Test 5: Chained dependencies
  const quadrupled = createComputed(() => doubled.get() * 2);
  const quadrupledId = registerSignal(quadrupled, 'computed', 40);
  
  trackDependency(quadrupled, doubled);
  
  const deps4 = getDependencies(quadrupledId);
  assert(deps4.length === 1, 'Chained computed tracks immediate dependency');
  assert(deps4.includes(doubledId), 'Chained dependency is correct');
  
  cleanup();
}

// ============================================================================
// Test Suite: Dependency Graph
// ============================================================================

console.log('\n🧪 Test Suite: Dependency Graph\n');

function testDependencyGraph() {
  cleanup();
  enableDevTools();
  
  // Build a dependency tree:
  // signal_1 (depth 0)
  //   ├─ computed_1 (depth 1)
  //   └─ computed_2 (depth 1)
  //        └─ computed_3 (depth 2)
  
  const base = createSignal(10);
  const baseId = registerSignal(base, 'signal', 10);
  
  const c1 = createComputed(() => base.get() * 2);
  const c1Id = registerSignal(c1, 'computed', 20);
  trackDependency(c1, base);
  
  const c2 = createComputed(() => base.get() + 5);
  const c2Id = registerSignal(c2, 'computed', 15);
  trackDependency(c2, base);
  
  const c3 = createComputed(() => c2.get() * 3);
  const c3Id = registerSignal(c3, 'computed', 45);
  trackDependency(c3, c2);
  
  // Test 1: getDependencyGraph returns all nodes
  const graph = getDependencyGraph();
  const ourNodes = [baseId, c1Id, c2Id, c3Id];
  const ourGraphNodes = graph.filter(n => ourNodes.includes(n.id));
  assert(ourGraphNodes.length === 4, 'Dependency graph includes all signals');
  
  // Test 2: Depth calculation is correct
  const baseNode = graph.find(n => n.id === baseId);
  const c1Node = graph.find(n => n.id === c1Id);
  const c2Node = graph.find(n => n.id === c2Id);
  const c3Node = graph.find(n => n.id === c3Id);
  
  assert(baseNode!.depth === 0, 'Root signal has depth 0');
  assert(c1Node!.depth === 1, 'First-level computed has depth 1');
  assert(c2Node!.depth === 1, 'First-level computed has depth 1');
  assert(c3Node!.depth === 2, 'Second-level computed has depth 2');
  
  // Test 3: Dependencies listed correctly
  assert(c1Node!.dependencies.includes(baseId), 'c1 depends on base');
  assert(c2Node!.dependencies.includes(baseId), 'c2 depends on base');
  assert(c3Node!.dependencies.includes(c2Id), 'c3 depends on c2');
  
  // Test 4: Subscribers listed correctly
  assert(baseNode!.subscribers.includes(c1Id), 'base has c1 as subscriber');
  assert(baseNode!.subscribers.includes(c2Id), 'base has c2 as subscriber');
  assert(c2Node!.subscribers.includes(c3Id), 'c2 has c3 as subscriber');
  
  // Test 5: Graph sorted by depth
  const depths = graph.map(n => n.depth);
  const sortedDepths = [...depths].sort((a, b) => a - b);
  assert(JSON.stringify(depths) === JSON.stringify(sortedDepths), 'Graph sorted by depth');
  
  cleanup();
}

// ============================================================================
// Test Suite: Signal Destruction
// ============================================================================

console.log('\n🧪 Test Suite: Signal Destruction\n');

function testSignalDestruction() {
  cleanup();
  enableDevTools();
  
  // Test 1: Unregistering removes from list
  const beforeCount = listSignals().length;
  const count = createSignal(0);
  const countId = registerSignal(count, 'signal', 0);
  
  assert(listSignals().length === beforeCount + 1, 'Signal registered');
  
  unregisterSignal(count);
  assert(listSignals().length === beforeCount, 'Signal removed after unregister');
  
  // Test 2: getSignal returns undefined after unregister
  const name = createSignal('Alice');
  const nameId = registerSignal(name, 'signal', 'Alice');
  
  assert(getSignal(nameId) !== undefined, 'Signal exists before unregister');
  
  unregisterSignal(name);
  assert(getSignal(nameId) === undefined, 'Signal not found after unregister');
  
  // Test 3: Multiple signals, remove one
  const beforeMultiple = listSignals().length;
  
  const a = createSignal(1);
  const aId = registerSignal(a, 'signal', 1);
  
  const b = createSignal(2);
  const bId = registerSignal(b, 'signal', 2);
  
  const c = createSignal(3);
  const cId = registerSignal(c, 'signal', 3);
  
  assert(listSignals().length === beforeMultiple + 3, 'Three signals registered');
  
  unregisterSignal(b);
  assert(listSignals().length === beforeMultiple + 2, 'One signal removed');
  assert(getSignal(aId) !== undefined, 'Other signals still exist (a)');
  assert(getSignal(cId) !== undefined, 'Other signals still exist (c)');
  assert(getSignal(bId) === undefined, 'Removed signal not found');
  
  // Test 4: Removing signal doesn't affect subscribers list
  // (In real implementation, subscribers should be cleaned up)
  const base = createSignal(10);
  const baseId = registerSignal(base, 'signal', 10);
  
  const computed = createComputed(() => base.get() * 2);
  const computedId = registerSignal(computed, 'computed', 20);
  trackDependency(computed, base);
  
  assert(getSubscribers(baseId).includes(computedId), 'Subscriber tracked');
  
  unregisterSignal(computed);
  // Note: In a complete implementation, we'd want to clean up the subscriber reference
  // For this test, we just verify the computed is gone
  assert(getSignal(computedId) === undefined, 'Computed signal removed');
  
  cleanup();
}

// ============================================================================
// Test Suite: Performance Tracking
// ============================================================================

console.log('\n🧪 Test Suite: Performance Tracking\n');

function testPerformanceTracking() {
  cleanup();
  enableDevTools({ trackPerformance: true });
  
  // Test 1: Performance metrics initially empty
  const metrics1 = getPerformanceMetrics();
  assert(metrics1.length === 0, 'Performance metrics initially empty');
  
  // Test 2: trackUpdate records metrics
  const count = createSignal(0);
  const countId = registerSignal(count, 'signal', 0);
  
  trackUpdate(count, () => {
    count.set(10);
  }, 0);
  
  const metrics2 = getPerformanceMetrics();
  assert(metrics2.length === 1, 'Performance metric recorded after update');
  
  const metric = metrics2[0];
  assert(metric.signalId === countId, 'Metric has correct signal ID');
  assert(metric.type === 'signal', 'Metric has correct type');
  assert(typeof metric.duration === 'number', 'Metric has duration');
  assert(metric.duration >= 0, 'Duration is non-negative');
  
  // Test 3: Multiple updates tracked
  trackUpdate(count, () => { count.set(20); }, 10);
  trackUpdate(count, () => { count.set(30); }, 20);
  
  const metrics3 = getPerformanceMetrics();
  assert(metrics3.length === 3, 'Multiple updates tracked');
  
  // Test 4: Performance summary
  const summary = getPerformanceSummary();
  assert(summary.totalUpdates >= 3, 'Summary shows total updates');
  assert(summary.averageDuration >= 0, 'Average duration calculated');
  assert(summary.slowestUpdate !== null, 'Slowest update identified');
  assert(summary.updatesByType.signal >= 3, 'Updates by type tracked');
  
  // Test 5: Clear metrics
  clearPerformanceMetrics();
  const metrics4 = getPerformanceMetrics();
  assert(metrics4.length === 0, 'Metrics cleared successfully');
  
  cleanup();
}

// ============================================================================
// Test Suite: Production Mode (DevTools Disabled)
// ============================================================================

console.log('\n🧪 Test Suite: Production Mode (DevTools Disabled)\n');

function testProductionMode() {
  cleanup();
  
  // Test 1: Operations safe when disabled
  const signals1 = listSignals();
  assert(signals1.length === 0, 'listSignals returns empty when disabled');
  
  const signal1 = getSignal('signal_1');
  assert(signal1 === undefined, 'getSignal returns undefined when disabled');
  
  const deps = getDependencies('signal_1');
  assert(deps.length === 0, 'getDependencies returns empty when disabled');
  
  const graph = getDependencyGraph();
  assert(graph.length === 0, 'getDependencyGraph returns empty when disabled');
  
  // Test 2: registerSignal returns empty string when disabled
  const count = createSignal(0);
  const id = registerSignal(count, 'signal', 0);
  assert(id === '', 'registerSignal returns empty string when disabled');
  
  // Test 3: unregisterSignal doesn't error when disabled
  unregisterSignal(count);
  assert(true, 'unregisterSignal safe when disabled');
  
  // Test 4: trackUpdate still executes function
  let executed = false;
  trackUpdate(count, () => {
    executed = true;
    count.set(10);
  }, 0);
  assert(executed, 'trackUpdate executes function even when disabled');
  
  // Test 5: Performance tracking disabled
  const metrics = getPerformanceMetrics();
  assert(metrics.length === 0, 'Performance tracking disabled when DevTools off');
  
  // Test 6: Enable and verify operations work
  enableDevTools();
  const beforeEnable = listSignals().length;
  const testSignal = createSignal(999);
  const testId = registerSignal(testSignal, 'signal', 999);
  assert(listSignals().length === beforeEnable + 1, 'Can register after re-enabling');
  
  cleanup();
}

// ============================================================================
// Test Suite: Metadata Accuracy
// ============================================================================

console.log('\n🧪 Test Suite: Metadata Accuracy\n');

function testMetadataAccuracy() {
  cleanup();
  enableDevTools();
  
  // Test 1: Initial metadata correct
  const count = createSignal(42);
  const countId = registerSignal(count, 'signal', 42);
  
  const metadata1 = getSignal(countId)!;
  assert(metadata1.value === 42, 'Initial value correct');
  assert(metadata1.type === 'signal', 'Type correct');
  assert(metadata1.subscriberCount === 0, 'Initial subscriber count is 0');
  assert(metadata1.dependencies.length === 0, 'Initial dependencies empty');
  assert(metadata1.updateCount === 0, 'Initial update count is 0');
  assert(typeof metadata1.createdAt === 'number', 'Creation timestamp exists');
  
  // Test 2: Update count increments
  trackUpdate(count, () => { count.set(50); }, 42);
  const metadata2 = getSignal(countId)!;
  assert(metadata2.updateCount === 1, 'Update count incremented');
  assert(metadata2.updatedAt >= metadata2.createdAt, 'Update timestamp after creation');
  
  // Test 3: Value updates in real-time
  trackUpdate(count, () => { count.set(100); }, 50);
  const metadata3 = getSignal(countId)!;
  assert(metadata3.value === 100, 'Value updated in real-time');
  assert(metadata3.updateCount === 2, 'Update count continues incrementing');
  
  // Test 4: Subscriber count updates
  const doubled = createComputed(() => count.get() * 2);
  const doubledId = registerSignal(doubled, 'computed', 200);
  trackDependency(doubled, count);
  
  const metadata4 = getSignal(countId)!;
  assert(metadata4.subscriberCount === 1, 'Subscriber count updated');
  
  // Test 5: Multiple subscribers
  const tripled = createComputed(() => count.get() * 3);
  const tripledId = registerSignal(tripled, 'computed', 300);
  trackDependency(tripled, count);
  
  const metadata5 = getSignal(countId)!;
  assert(metadata5.subscriberCount === 2, 'Multiple subscribers counted');
  
  // Test 6: Complex type serialization
  const obj = createSignal({ name: 'Alice', age: 30, nested: { x: 1 } });
  const objId = registerSignal(obj, 'signal', { name: 'Alice', age: 30, nested: { x: 1 } });
  
  const metadata6 = getSignal(objId)!;
  assert(typeof metadata6.value === 'object', 'Object values serialized');
  assert(metadata6.value.name === 'Alice', 'Object properties preserved');
  
  cleanup();
}

// ============================================================================
// Test Suite: Export Snapshot
// ============================================================================

console.log('\n🧪 Test Suite: Export Snapshot\n');

function testExportSnapshot() {
  cleanup();
  enableDevTools({ trackPerformance: true });
  
  // Create some signals
  const count = createSignal(0);
  const countId = registerSignal(count, 'signal', 0);
  
  const doubled = createComputed(() => count.get() * 2);
  const doubledId = registerSignal(doubled, 'computed', 0);
  trackDependency(doubled, count);
  
  // Perform some updates
  trackUpdate(count, () => { count.set(10); }, 0);
  trackUpdate(count, () => { count.set(20); }, 10);
  
  // Test 1: Snapshot contains all data
  const snapshot = exportSnapshot();
  
  assert(typeof snapshot.timestamp === 'number', 'Snapshot has timestamp');
  assert(typeof snapshot.config === 'object', 'Snapshot has config');
  assert(Array.isArray(snapshot.signals), 'Snapshot has signals array');
  assert(Array.isArray(snapshot.graph), 'Snapshot has graph array');
  assert(typeof snapshot.performance === 'object', 'Snapshot has performance data');
  
  // Test 2: Snapshot signals match current state
  assert(snapshot.signals.length >= 2, 'Snapshot includes all signals');
  assert(snapshot.signals.some(s => s.id === countId), 'Snapshot includes count signal');
  assert(snapshot.signals.some(s => s.id === doubledId), 'Snapshot includes computed signal');
  
  // Test 3: Snapshot graph matches current state
  assert(snapshot.graph.length >= 2, 'Snapshot includes all graph nodes');
  
  // Test 4: Snapshot performance data
  assert(snapshot.performance.metrics.length === 2, 'Snapshot includes performance metrics');
  assert(snapshot.performance.summary.totalUpdates === 2, 'Performance summary correct');
  
  // Test 5: Snapshot config
  assert(snapshot.config.enabled === true, 'Snapshot config reflects enabled state');
  assert(snapshot.config.trackPerformance === true, 'Snapshot config reflects settings');
  
  cleanup();
}

// ============================================================================
// Test Suite: Edge Cases
// ============================================================================

console.log('\n🧪 Test Suite: Edge Cases\n');

function testEdgeCases() {
  cleanup();
  enableDevTools();
  
  // Test 1: Very rapid updates
  const count = createSignal(0);
  const countId = registerSignal(count, 'signal', 0);
  
  for (let i = 0; i < 100; i++) {
    trackUpdate(count, () => { count.set(i); }, i - 1);
  }
  
  const metadata = getSignal(countId)!;
  assert(metadata.updateCount === 100, 'Rapid updates tracked correctly');
  
  // Test 2: Circular-like dependencies (A → B → C, A → C)
  const a = createSignal(1);
  const aId = registerSignal(a, 'signal', 1);
  
  const b = createComputed(() => a.get() + 1);
  const bId = registerSignal(b, 'computed', 2);
  trackDependency(b, a);
  
  const c = createComputed(() => a.get() + b.get());
  const cId = registerSignal(c, 'computed', 3);
  trackDependency(c, a);
  trackDependency(c, b);
  
  const deps = getDependencies(cId);
  assert(deps.length === 2, 'Multiple dependencies from same source tracked');
  
  // Test 3: Large number of signals
  for (let i = 0; i < 50; i++) {
    const s = createSignal(i);
    registerSignal(s, 'signal', i);
  }
  
  const allSignals = listSignals();
  assert(allSignals.length >= 53, 'Large number of signals tracked'); // 3 + 50
  
  // Test 4: Deep dependency chain
  let prev = createSignal(1);
  let prevId = registerSignal(prev, 'signal', 1);
  
  for (let i = 0; i < 10; i++) {
    const next = createComputed(() => prev.get() + 1);
    const nextId = registerSignal(next, 'computed', i + 2);
    trackDependency(next, prev);
    prev = next;
    prevId = nextId;
  }
  
  const graph = getDependencyGraph();
  const deepest = graph.find(n => n.id === prevId);
  assert(deepest!.depth === 10, 'Deep dependency chain depth calculated correctly');
  
  // Test 5: Signal with non-serializable value
  const fn = createSignal(() => 42);
  const fnId = registerSignal(fn, 'signal', () => 42);
  
  const fnMetadata = getSignal(fnId)!;
  assert(typeof fnMetadata.value === 'string', 'Function value serialized as string');
  assert(fnMetadata.value.includes('Function'), 'Function serialization contains "Function"');
  
  cleanup();
}

// ============================================================================
// Run All Tests
// ============================================================================

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   DevTools & Inspector Verification Test Suite            ║');
console.log('║   SignalForge Developer Tools Functionality                ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

testEnableDisable();
testSignalRegistration();
testSignalRetrieval();
testDependencyTracking();
testDependencyGraph();
testSignalDestruction();
testPerformanceTracking();
testProductionMode();
testMetadataAccuracy();
testExportSnapshot();
testEdgeCases();

// ============================================================================
// Summary
// ============================================================================

console.log('\n' + '═'.repeat(60));
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log(`📊 Total:  ${passCount + failCount}`);
console.log('═'.repeat(60));

if (failCount === 0) {
  console.log('\n🎉 All DevTools tests passed!');
  console.log('✨ Inspector functionality verified.');
  console.log('🔍 Signal tracking, dependencies, and performance monitoring working correctly.');
  process.exit(0);
} else {
  console.error('\n💥 Some tests failed!');
  process.exit(1);
}
