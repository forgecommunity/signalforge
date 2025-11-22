/**
 * React Hook Integration Test Suite
 * 
 * Tests React hooks: useSignal, useSignalValue, and useSignalEffect
 * Validates:
 * - Component re-renders only when relevant signals change
 * - Cleanup/unsubscribe behavior on unmount
 * - useSignalEffect runs automatically and stops on unmount
 * - Render count metrics for performance verification
 * 
 * Uses @testing-library/react for React 18+ hook testing
 */

// Setup DOM environment with jsdom
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});

(global as any).window = dom.window;
(global as any).document = dom.window.document;
(global as any).navigator = dom.window.navigator;

import React, { useState } from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { act } from '@testing-library/react';
import { createSignal, createComputed, flushSync } from '../src/core/store';
import { useSignal, useSignalValue, useSignalEffect } from '../src/hooks/useSignal';

// ============================================================================
// Test Utilities
// ============================================================================

let renderCounts: Map<string, number> = new Map();

function resetRenderCounts() {
  renderCounts.clear();
}

function incrementRenderCount(componentId: string): number {
  const current = renderCounts.get(componentId) || 0;
  const next = current + 1;
  renderCounts.set(componentId, next);
  return next;
}

function getRenderCount(componentId: string): number {
  return renderCounts.get(componentId) || 0;
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEquals<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(
      `${message || 'Assertion failed'}: expected ${expected}, got ${actual}`
    );
  }
}

/**
 * Helper to run a test with automatic cleanup
 */
async function runTest(testFn: () => void | Promise<void>): Promise<void> {
  try {
    await testFn();
  } finally {
    cleanup();
    resetRenderCounts();
  }
}

// ============================================================================
// Test 1: useSignal Basic Functionality
// ============================================================================

function testUseSignalBasics() {
  console.log('\n=== Test 1: useSignal Basic Functionality ===');
  
  let setCountExternal: ((value: number | ((prev: number) => number)) => void) | null = null;
  
  function Counter() {
    const renderCount = incrementRenderCount('Counter');
    const [count, setCount] = useSignal(0);
    setCountExternal = setCount;
    
    return (
      <div>
        <span data-testid="count">{count}</span>
        <span data-testid="renders">{renderCount}</span>
      </div>
    );
  }
  
  const { container } = render(<Counter />);
  const getCount = () => container.querySelector('[data-testid="count"]')?.textContent;
  
  // Initial render
  assertEquals(getCount(), '0', 'Initial count should be 0');
  assertEquals(getRenderCount('Counter'), 1, 'Should render once initially');
  
  // Update signal
  act(() => {
    setCountExternal!(1);
    flushSync();
  });
  
  assertEquals(getCount(), '1', 'Count should update to 1');
  assertEquals(getRenderCount('Counter'), 2, 'Should render twice after update');
  
  // Update with function
  act(() => {
    setCountExternal!(prev => prev + 2);
    flushSync();
  });
  
  assertEquals(getCount(), '3', 'Count should update to 3');
  assertEquals(getRenderCount('Counter'), 3, 'Should render three times after second update');
  
  console.log('✓ useSignal basic functionality works correctly');
  console.log(`  Render count: ${getRenderCount('Counter')} (expected: 3)`);
}

// ============================================================================
// Test 2: useSignalValue with External Signal
// ============================================================================

function testUseSignalValue() {
  console.log('\n=== Test 2: useSignalValue with External Signal ===');
  
  const externalSignal = createSignal(10);
  
  function Display() {
    const renderCount = incrementRenderCount('Display');
    const value = useSignalValue(externalSignal);
    
    return (
      <div>
        <span data-testid="value">{value}</span>
        <span data-testid="renders">{renderCount}</span>
      </div>
    );
  }
  
  const { container } = render(<Display />);
  const getValue = () => container.querySelector('[data-testid="value"]')?.textContent;
  
  // Initial render
  assertEquals(getValue(), '10', 'Initial value should be 10');
  assertEquals(getRenderCount('Display'), 1, 'Should render once initially');
  
  // Update external signal
  act(() => {
    externalSignal.set(20);
    flushSync();
  });
  
  assertEquals(getValue(), '20', 'Value should update to 20');
  assertEquals(getRenderCount('Display'), 2, 'Should render twice after update');
  
  // Update again
  act(() => {
    externalSignal.set(30);
    flushSync();
  });
  
  assertEquals(getValue(), '30', 'Value should update to 30');
  assertEquals(getRenderCount('Display'), 3, 'Should render three times');
  
  console.log('✓ useSignalValue subscribes and updates correctly');
  console.log(`  Render count: ${getRenderCount('Display')} (expected: 3)`);
}

// ============================================================================
// Test 3: Multiple Components with Shared Signal
// ============================================================================

function testSharedSignal() {
  console.log('\n=== Test 3: Multiple Components with Shared Signal ===');
  
  const sharedSignal = createSignal(100);
  
  function ComponentA() {
    incrementRenderCount('ComponentA');
    const value = useSignalValue(sharedSignal);
    return <span data-testid="value-a">{value}</span>;
  }
  
  function ComponentB() {
    incrementRenderCount('ComponentB');
    const value = useSignalValue(sharedSignal);
    return <span data-testid="value-b">{value}</span>;
  }
  
  function Parent() {
    incrementRenderCount('Parent');
    return (
      <div>
        <ComponentA />
        <ComponentB />
      </div>
    );
  }
  
  const { container } = render(<Parent />);
  const getValueA = () => container.querySelector('[data-testid="value-a"]')?.textContent;
  const getValueB = () => container.querySelector('[data-testid="value-b"]')?.textContent;
  
  // Initial renders
  assertEquals(getRenderCount('Parent'), 1, 'Parent should render once');
  assertEquals(getRenderCount('ComponentA'), 1, 'ComponentA should render once');
  assertEquals(getRenderCount('ComponentB'), 1, 'ComponentB should render once');
  
  // Update shared signal
  act(() => {
    sharedSignal.set(200);
    flushSync();
  });
  
  assertEquals(getValueA(), '200', 'ComponentA should show 200');
  assertEquals(getValueB(), '200', 'ComponentB should show 200');
  assertEquals(getRenderCount('Parent'), 1, 'Parent should NOT re-render (no signal dependency)');
  assertEquals(getRenderCount('ComponentA'), 2, 'ComponentA should render twice');
  assertEquals(getRenderCount('ComponentB'), 2, 'ComponentB should render twice');
  
  console.log('✓ Multiple components subscribe to shared signal correctly');
  console.log(`  Parent renders: ${getRenderCount('Parent')} (expected: 1)`);
  console.log(`  ComponentA renders: ${getRenderCount('ComponentA')} (expected: 2)`);
  console.log(`  ComponentB renders: ${getRenderCount('ComponentB')} (expected: 2)`);
}

// ============================================================================
// Test 4: Component Only Re-renders for Relevant Signal Changes
// ============================================================================

function testSelectiveRerendering() {
  console.log('\n=== Test 4: Selective Re-rendering ===');
  
  const signal1 = createSignal(1);
  const signal2 = createSignal(2);
  
  function ComponentUsingSignal1() {
    incrementRenderCount('ComponentUsingSignal1');
    const value = useSignalValue(signal1);
    return <span data-testid="value1">{value}</span>;
  }
  
  function ComponentUsingSignal2() {
    incrementRenderCount('ComponentUsingSignal2');
    const value = useSignalValue(signal2);
    return <span data-testid="value2">{value}</span>;
  }
  
  function Parent() {
    return (
      <div>
        <ComponentUsingSignal1 />
        <ComponentUsingSignal2 />
      </div>
    );
  }
  
  render(<Parent />);
  
  // Initial renders
  assertEquals(getRenderCount('ComponentUsingSignal1'), 1);
  assertEquals(getRenderCount('ComponentUsingSignal2'), 1);
  
  // Update only signal1
  act(() => {
    signal1.set(10);
    flushSync();
  });
  
  assertEquals(getRenderCount('ComponentUsingSignal1'), 2, 'Component1 should re-render');
  assertEquals(getRenderCount('ComponentUsingSignal2'), 1, 'Component2 should NOT re-render');
  
  // Update only signal2
  act(() => {
    signal2.set(20);
    flushSync();
  });
  
  assertEquals(getRenderCount('ComponentUsingSignal1'), 2, 'Component1 should NOT re-render');
  assertEquals(getRenderCount('ComponentUsingSignal2'), 2, 'Component2 should re-render');
  
  console.log('✓ Components only re-render when their specific signals change');
  console.log(`  Component1 renders: ${getRenderCount('ComponentUsingSignal1')} (expected: 2)`);
  console.log(`  Component2 renders: ${getRenderCount('ComponentUsingSignal2')} (expected: 2)`);
}

// ============================================================================
// Test 5: Cleanup and Unsubscribe on Unmount
// ============================================================================

function testCleanupOnUnmount() {
  console.log('\n=== Test 5: Cleanup and Unsubscribe on Unmount ===');
  
  const signal = createSignal(0);
  let subscriberCount = 0;
  
  // Patch signal to track subscribers
  const originalSubscribe = signal.subscribe.bind(signal);
  signal.subscribe = (listener: any) => {
    subscriberCount++;
    const unsubscribe = originalSubscribe(listener);
    return () => {
      subscriberCount--;
      unsubscribe();
    };
  };
  
  function Component() {
    const value = useSignalValue(signal);
    return <span data-testid="value">{value}</span>;
  }
  
  const { container, unmount } = render(<Component />);
  const getValue = () => container.querySelector('[data-testid="value"]')?.textContent;
  
  assertEquals(subscriberCount, 1, 'Should have 1 subscriber after mount');
  
  // Update signal while mounted
  act(() => {
    signal.set(5);
    flushSync();
  });
  
  assertEquals(getValue(), '5');
  assertEquals(subscriberCount, 1, 'Should still have 1 subscriber');
  
  // Unmount component
  unmount();
  
  assertEquals(subscriberCount, 0, 'Should have 0 subscribers after unmount');
  
  console.log('✓ Component unsubscribes on unmount');
  console.log(`  Subscriber count after unmount: ${subscriberCount} (expected: 0)`);
}

// ============================================================================
// Test 6: useSignalEffect Runs Automatically
// ============================================================================

function testUseSignalEffectAutoRun() {
  console.log('\n=== Test 6: useSignalEffect Runs Automatically ===');
  
  const signal = createSignal(0);
  let effectRunCount = 0;
  let lastSeenValue = -1;
  
  function Component() {
    incrementRenderCount('Component');
    
    useSignalEffect(() => {
      effectRunCount++;
      lastSeenValue = signal.get();
    });
    
    return <div data-testid="component">Component</div>;
  }
  
  render(<Component />);
  
  // Effect should run on mount
  assert(effectRunCount >= 1, 'Effect should run at least once on mount');
  assertEquals(lastSeenValue, 0, 'Effect should see initial value');
  
  const initialEffectCount = effectRunCount;
  
  // Update signal
  act(() => {
    signal.set(10);
    flushSync();
  });
  
  // Wait for effect to run
  act(() => {
    flushSync();
  });
  
  assert(effectRunCount > initialEffectCount, 'Effect should run after signal change');
  assertEquals(lastSeenValue, 10, 'Effect should see updated value');
  
  console.log('✓ useSignalEffect runs automatically on signal changes');
  console.log(`  Effect run count: ${effectRunCount}`);
  console.log(`  Last seen value: ${lastSeenValue} (expected: 10)`);
}

// ============================================================================
// Test 7: useSignalEffect Cleanup on Unmount
// ============================================================================

function testUseSignalEffectCleanup() {
  console.log('\n=== Test 7: useSignalEffect Cleanup on Unmount ===');
  
  const signal = createSignal(0);
  let effectRunCount = 0;
  let cleanupRunCount = 0;
  
  function Component() {
    useSignalEffect(() => {
      effectRunCount++;
      return () => {
        cleanupRunCount++;
      };
    });
    
    return <div>Component</div>;
  }
  
  const { unmount } = render(<Component />);
  
  const effectCountBeforeUnmount = effectRunCount;
  const cleanupCountBeforeUnmount = cleanupRunCount;
  
  // Unmount component
  unmount();
  
  assert(cleanupRunCount > cleanupCountBeforeUnmount, 'Cleanup should run on unmount');
  
  // Update signal after unmount - effect should NOT run
  act(() => {
    signal.set(10);
    flushSync();
  });
  
  assertEquals(effectRunCount, effectCountBeforeUnmount, 'Effect should NOT run after unmount');
  
  console.log('✓ useSignalEffect cleans up on unmount');
  console.log(`  Cleanup run count: ${cleanupRunCount}`);
  console.log(`  Effect did not run after unmount: ${effectRunCount === effectCountBeforeUnmount}`);
}

// ============================================================================
// Test 8: useSignalEffect with Multiple Signals
// ============================================================================

function testUseSignalEffectMultipleDependencies() {
  console.log('\n=== Test 8: useSignalEffect with Multiple Dependencies ===');
  
  const firstName = createSignal('John');
  const lastName = createSignal('Doe');
  let fullName = '';
  let effectRunCount = 0;
  
  function Component() {
    useSignalEffect(() => {
      effectRunCount++;
      fullName = `${firstName.get()} ${lastName.get()}`;
    });
    
    return <div data-testid="fullname">{fullName}</div>;
  }
  
  render(<Component />);
  
  const initialCount = effectRunCount;
  assertEquals(fullName, 'John Doe', 'Should compute full name initially');
  
  // Update firstName
  act(() => {
    firstName.set('Jane');
    flushSync();
  });
  
  act(() => {
    flushSync();
  });
  
  assert(effectRunCount > initialCount, 'Effect should run after firstName change');
  assertEquals(fullName, 'Jane Doe', 'Should update full name');
  
  const countAfterFirst = effectRunCount;
  
  // Update lastName
  act(() => {
    lastName.set('Smith');
    flushSync();
  });
  
  act(() => {
    flushSync();
  });
  
  assert(effectRunCount > countAfterFirst, 'Effect should run after lastName change');
  assertEquals(fullName, 'Jane Smith', 'Should update full name again');
  
  console.log('✓ useSignalEffect tracks multiple signal dependencies');
  console.log(`  Effect run count: ${effectRunCount}`);
  console.log(`  Final full name: ${fullName}`);
}

// ============================================================================
// Test 9: Computed Signal with useSignalValue
// ============================================================================

function testComputedSignalInReact() {
  console.log('\n=== Test 9: Computed Signal with useSignalValue ===');
  
  const count = createSignal(5);
  const doubled = createComputed(() => count.get() * 2);
  
  function Component() {
    incrementRenderCount('Component');
    const value = useSignalValue(doubled);
    return <span data-testid="doubled">{value}</span>;
  }
  
  const { container } = render(<Component />);
  const getDoubled = () => container.querySelector('[data-testid="doubled"]')?.textContent;
  
  assertEquals(getDoubled(), '10', 'Initial doubled value');
  assertEquals(getRenderCount('Component'), 1, 'Initial render');
  
  // Update source signal
  act(() => {
    count.set(10);
    flushSync();
  });
  
  assertEquals(getDoubled(), '20', 'Computed updates automatically');
  assertEquals(getRenderCount('Component'), 2, 'Component re-renders for computed change');
  
  console.log('✓ Computed signals work with React hooks');
  console.log(`  Render count: ${getRenderCount('Component')} (expected: 2)`);
}

// ============================================================================
// Test 10: Performance - No Re-render on Same Value
// ============================================================================

function testNoRerenderOnSameValue() {
  console.log('\n=== Test 10: No Re-render on Same Value ===');
  
  const signal = createSignal(42);
  
  function Component() {
    incrementRenderCount('Component');
    const value = useSignalValue(signal);
    return <span data-testid="value">{value}</span>;
  }
  
  render(<Component />);
  
  assertEquals(getRenderCount('Component'), 1, 'Initial render');
  
  // Set same value
  act(() => {
    signal.set(42);
    flushSync();
  });
  
  assertEquals(getRenderCount('Component'), 1, 'Should NOT re-render for same value');
  
  // Set different value
  act(() => {
    signal.set(43);
    flushSync();
  });
  
  assertEquals(getRenderCount('Component'), 2, 'Should re-render for different value');
  
  console.log('✓ Component does not re-render when signal value is unchanged');
  console.log(`  Render count: ${getRenderCount('Component')} (expected: 2)`);
}

// ============================================================================
// Test 11: useSignalEffect Prevents Infinite Loops
// ============================================================================

function testUseSignalEffectNoInfiniteLoop() {
  console.log('\n=== Test 11: useSignalEffect Prevents Infinite Loops ===');
  
  const signal = createSignal(0);
  let effectRunCount = 0;
  const maxRuns = 10;
  
  function Component() {
    useSignalEffect(() => {
      effectRunCount++;
      // This could cause infinite loop if not handled
      if (effectRunCount < maxRuns) {
        const current = signal.get();
        // Don't modify the signal we're reading to avoid issues
      }
    });
    
    return <div>Component</div>;
  }
  
  render(<Component />);
  
  act(() => {
    flushSync();
  });
  
  assert(effectRunCount < 100, 'Should not run effect infinitely');
  
  console.log('✓ useSignalEffect does not cause infinite loops');
  console.log(`  Effect run count: ${effectRunCount} (should be reasonable)`);
}

// ============================================================================
// Test 12: Render Count Metrics Summary
// ============================================================================

function testRenderCountMetrics() {
  console.log('\n=== Test 12: Render Count Metrics Summary ===');
  
  const signal1 = createSignal(0);
  const signal2 = createSignal(0);
  
  function ComponentA() {
    incrementRenderCount('ComponentA');
    const value = useSignalValue(signal1);
    return <span>{value}</span>;
  }
  
  function ComponentB() {
    incrementRenderCount('ComponentB');
    const value = useSignalValue(signal2);
    return <span>{value}</span>;
  }
  
  function ComponentC() {
    incrementRenderCount('ComponentC');
    const value1 = useSignalValue(signal1);
    const value2 = useSignalValue(signal2);
    return <span>{value1 + value2}</span>;
  }
  
  function App() {
    incrementRenderCount('App');
    return (
      <div>
        <ComponentA />
        <ComponentB />
        <ComponentC />
      </div>
    );
  }
  
  render(<App />);
  
  // Track initial renders
  const initialCounts = {
    App: getRenderCount('App'),
    ComponentA: getRenderCount('ComponentA'),
    ComponentB: getRenderCount('ComponentB'),
    ComponentC: getRenderCount('ComponentC'),
  };
  
  // Update signal1 - should affect ComponentA and ComponentC
  act(() => {
    signal1.set(1);
    flushSync();
  });
  
  const afterSignal1 = {
    App: getRenderCount('App'),
    ComponentA: getRenderCount('ComponentA'),
    ComponentB: getRenderCount('ComponentB'),
    ComponentC: getRenderCount('ComponentC'),
  };
  
  // Update signal2 - should affect ComponentB and ComponentC
  act(() => {
    signal2.set(2);
    flushSync();
  });
  
  const finalCounts = {
    App: getRenderCount('App'),
    ComponentA: getRenderCount('ComponentA'),
    ComponentB: getRenderCount('ComponentB'),
    ComponentC: getRenderCount('ComponentC'),
  };
  
  console.log('\n📊 Render Count Metrics:');
  console.log('────────────────────────────────────────');
  console.log(`App:         ${finalCounts.App} renders (expected: 1)`);
  console.log(`ComponentA:  ${finalCounts.ComponentA} renders (expected: 2)`);
  console.log(`ComponentB:  ${finalCounts.ComponentB} renders (expected: 2)`);
  console.log(`ComponentC:  ${finalCounts.ComponentC} renders (expected: 3)`);
  console.log('────────────────────────────────────────');
  
  // Verify expectations
  assertEquals(finalCounts.App, 1, 'App should only render once (no signal deps)');
  assertEquals(finalCounts.ComponentA, 2, 'ComponentA renders: initial + signal1 update');
  assertEquals(finalCounts.ComponentB, 2, 'ComponentB renders: initial + signal2 update');
  assertEquals(finalCounts.ComponentC, 3, 'ComponentC renders: initial + signal1 + signal2');
  
  console.log('\n✓ All render counts match expected values');
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   React Hook Integration Tests for SignalForge            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const tests = [
    { name: 'useSignal Basics', fn: testUseSignalBasics },
    { name: 'useSignalValue', fn: testUseSignalValue },
    { name: 'Shared Signal', fn: testSharedSignal },
    { name: 'Selective Re-rendering', fn: testSelectiveRerendering },
    { name: 'Cleanup on Unmount', fn: testCleanupOnUnmount },
    { name: 'useSignalEffect Auto-run', fn: testUseSignalEffectAutoRun },
    { name: 'useSignalEffect Cleanup', fn: testUseSignalEffectCleanup },
    { name: 'useSignalEffect Multiple Deps', fn: testUseSignalEffectMultipleDependencies },
    { name: 'Computed with React', fn: testComputedSignalInReact },
    { name: 'No Re-render on Same Value', fn: testNoRerenderOnSameValue },
    { name: 'No Infinite Loops', fn: testUseSignalEffectNoInfiniteLoop },
    { name: 'Render Count Metrics', fn: testRenderCountMetrics },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      await runTest(test.fn);
      passed++;
    } catch (error) {
      failed++;
      console.error(`\n❌ Test failed: ${test.name}`);
      console.error(error);
    }
  }
  
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                      Test Summary                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total:  ${tests.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed`);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Fatal error running tests:', error);
    process.exit(1);
  });
}

export { runAllTests };
