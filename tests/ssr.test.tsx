import React from 'react';
import { renderToString } from 'react-dom/server';

import { createSignal } from '../src/core/store';
import { createStore } from '../src/core/storeApi';
import {
  useComputed,
  useSignal,
  useSignalValue,
  useStoreSelector,
} from '../src/hooks/useSignal';

function assertIncludes(value: string, expected: string, message: string): void {
  const normalized = value.replace(/<!-- -->/g, '');
  if (!normalized.includes(expected)) {
    throw new Error(`${message}: expected rendered output to include "${expected}", got "${value}"`);
  }
}

console.log('\n=== SSR React Tests ===');

function testUseSignalValueSSR(): void {
  const count = createSignal(7);

  function App() {
    const value = useSignalValue(count);
    return <span>count:{value}</span>;
  }

  const html = renderToString(<App />);
  assertIncludes(html, 'count:7', 'useSignalValue should render snapshot on server');
  count.destroy();
  console.log('✓ useSignalValue SSR snapshot');
}

function testUseSignalSSR(): void {
  function App() {
    const [value] = useSignal('server');
    return <span>{value}</span>;
  }

  const html = renderToString(<App />);
  assertIncludes(html, 'server', 'useSignal should render initial value on server');
  console.log('✓ useSignal SSR initial value');
}

function testUseComputedSSR(): void {
  const first = createSignal('Ada');
  const last = createSignal('Lovelace');

  function App() {
    const fullName = useComputed(() => `${first.get()} ${last.get()}`);
    return <span>{fullName}</span>;
  }

  const html = renderToString(<App />);
  assertIncludes(html, 'Ada Lovelace', 'useComputed should render computed value on server');
  first.destroy();
  last.destroy();
  console.log('✓ useComputed SSR value');
}

function testUseStoreSelectorSSR(): void {
  const store = createStore({
    count: 3,
    label: 'orders',
  });

  function App() {
    const count = useStoreSelector(store, (state) => state.count);
    const label = useStoreSelector(store, (state) => state.label);
    return <span>{count} {label}</span>;
  }

  const html = renderToString(<App />);
  assertIncludes(html, '3 orders', 'useStoreSelector should render selected values on server');
  store.destroy();
  console.log('✓ useStoreSelector SSR value');
}

testUseSignalValueSSR();
testUseSignalSSR();
testUseComputedSSR();
testUseStoreSelectorSSR();

console.log('All SSR tests passed');
