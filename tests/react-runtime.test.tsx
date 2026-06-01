import { JSDOM } from 'jsdom';
import React, { StrictMode, act, startTransition } from 'react';
import { renderToString } from 'react-dom/server';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';

import { createSignal, flushSync, type Signal } from '../src/core/store';
import { createStore } from '../src/core/storeApi';
import { useSignalValue, useStoreSelector } from '../src/hooks/useSignal';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});

(global as any).window = dom.window;
(global as any).document = dom.window.document;
(global as any).navigator = dom.window.navigator;
(global as any).IS_REACT_ACT_ENVIRONMENT = true;

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

function createContainer(html = ''): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container;
}

function cleanupRoot(root: Root, container: HTMLElement): void {
  act(() => {
    root.unmount();
  });
  container.remove();
}

function withSubscriptionTracking<T>(signal: Signal<T>) {
  let activeSubscriptions = 0;
  let totalSubscriptions = 0;

  return {
    get activeSubscriptions() {
      return activeSubscriptions;
    },
    get totalSubscriptions() {
      return totalSubscriptions;
    },
    signal: {
      ...signal,
      subscribe(listener: (value: T) => void) {
        activeSubscriptions++;
        totalSubscriptions++;
        const unsubscribe = signal.subscribe(listener);
        let active = true;

        return () => {
          if (!active) {
            return;
          }
          active = false;
          activeSubscriptions--;
          unsubscribe();
        };
      },
    } as Signal<T>,
  };
}

console.log('\n=== React Runtime Tests ===');

function testStrictModeSubscriptionCleanup(): void {
  const source = createSignal(1);
  const tracked = withSubscriptionTracking(source);
  const container = createContainer();

  function App() {
    const value = useSignalValue(tracked.signal);
    return <span data-testid="value">{value}</span>;
  }

  const root = createRoot(container);
  act(() => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  });

  assertEquals(container.textContent, '1', 'StrictMode should render initial signal value');
  assertEquals(tracked.activeSubscriptions, 1, 'StrictMode should leave exactly one active subscription');
  assert(
    tracked.totalSubscriptions >= 1,
    'StrictMode should subscribe through useSyncExternalStore'
  );

  cleanupRoot(root, container);
  assertEquals(tracked.activeSubscriptions, 0, 'StrictMode unmount should clean all subscriptions');
  source.destroy();
  console.log('✓ StrictMode subscription cleanup');
}

async function testHydrationMatchesServerSnapshot(): Promise<void> {
  const count = createSignal(7);
  const store = createStore({ label: 'orders' });

  function App() {
    const value = useSignalValue(count);
    const label = useStoreSelector(store, (state) => state.label);
    return <span>count:{value}:{label}</span>;
  }

  const serverHtml = renderToString(<App />);
  const container = createContainer(serverHtml);
  const recoverableErrors: Error[] = [];

  let root!: ReturnType<typeof hydrateRoot>;
  await act(async () => {
    root = hydrateRoot(container, <App />, {
      onRecoverableError(error) {
        recoverableErrors.push(error as Error);
      },
    });
  });

  assertEquals(
    container.textContent,
    'count:7:orders',
    'Hydration should preserve server-rendered signal snapshot'
  );
  assertEquals(recoverableErrors.length, 0, 'Hydration should not report recoverable mismatches');

  act(() => {
    count.set(8);
    store.set({ label: 'invoices' });
    flushSync();
  });

  assertEquals(container.textContent, 'count:8:invoices', 'Hydrated app should receive later updates');
  cleanupRoot(root, container);
  count.destroy();
  store.destroy();
  console.log('✓ Hydration snapshot parity and post-hydration updates');
}

async function testConcurrentUpdatesStayConsistent(): Promise<void> {
  const count = createSignal(0);
  const container = createContainer();
  const snapshots: string[] = [];

  function Reader({ id }: { id: string }) {
    const value = useSignalValue(count);
    return <span data-testid={id}>{value}</span>;
  }

  function App() {
    const left = useSignalValue(count);
    const right = useSignalValue(count);
    snapshots.push(`${left}:${right}`);

    return (
      <div>
        <Reader id="reader-a" />
        <Reader id="reader-b" />
      </div>
    );
  }

  const root = createRoot(container);
  await act(async () => {
    root.render(<App />);
  });

  await act(async () => {
    startTransition(() => {
      count.set(1);
      count.set(2);
      count.set(3);
      flushSync();
    });
  });

  const readerValues = Array.from(container.querySelectorAll('span')).map((node) => node.textContent);
  assertEquals(readerValues.join(','), '3,3', 'Concurrent transition should commit one consistent final snapshot');
  assert(
    snapshots.every((snapshot) => {
      const [left, right] = snapshot.split(':');
      return left === right;
    }),
    `Components should never observe torn snapshots: ${snapshots.join(', ')}`
  );

  cleanupRoot(root, container);
  count.destroy();
  console.log('✓ Concurrent updates stay consistent');
}

async function run(): Promise<void> {
  testStrictModeSubscriptionCleanup();
  await testHydrationMatchesServerSnapshot();
  await testConcurrentUpdatesStayConsistent();
  console.log('All React runtime tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
