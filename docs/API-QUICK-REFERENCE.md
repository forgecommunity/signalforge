# SignalForge API Quick Reference

Use this as the compact reference for the public API. The full API guide is in [API.md](./API.md).

## Entry Points

```ts
import { createSignal, createComputed, createEffect, batch, untrack } from 'signalforge/core';
import { useSignalValue, useSignal, useComputed, useStoreSelector } from 'signalforge/react';
import { registerPlugin } from 'signalforge/plugins';
import { DevToolsProvider } from 'signalforge/devtools';
```

The root package also exports the common core and React APIs for convenience, but docs and examples prefer subpath imports so bundlers can keep boundaries clear.

## Core Signals

```ts
import { createSignal, createComputed, createEffect, batch, untrack } from 'signalforge/core';

const count = createSignal(0);
const doubled = createComputed(() => count.get() * 2);

const stop = createEffect(() => {
  console.log('count changed', count.get());
});

batch(() => {
  count.set((value) => value + 1);
  count.set((value) => value + 1);
});

const snapshot = untrack(() => doubled.get());
stop();
```

### `createSignal<T>(initialValue: T)`

Creates a writable signal.

```ts
const user = createSignal({ name: 'Ada', role: 'admin' });

user.get();
user.set({ name: 'Grace', role: 'editor' });
user.set((previous) => ({ ...previous, role: 'owner' }));

const unsubscribe = user.subscribe((next, previous) => {
  console.log({ next, previous });
});

unsubscribe();
user.destroy();
```

Destroyed signals reject later reads, writes, and subscriptions. Treat `destroy()` as final cleanup.

### `createComputed<T>(compute: () => T)`

Creates a derived read-only signal. Dependencies are tracked from signal reads inside `compute`.

```ts
const firstName = createSignal('Ada');
const lastName = createSignal('Lovelace');
const fullName = createComputed(() => `${firstName.get()} ${lastName.get()}`);
```

SignalForge detects direct circular computed reads and throws instead of recursing forever.

### `createEffect(fn: () => void | (() => void))`

Runs side effects and re-runs when tracked dependencies change.

```ts
const dispose = createEffect(() => {
  const current = count.get();
  document.title = `Count: ${current}`;

  return () => {
    document.title = 'SignalForge';
  };
});
```

### `batch(fn)`

Groups multiple writes into one notification flush.

```ts
batch(() => {
  firstName.set('Grace');
  lastName.set('Hopper');
});
```

### `untrack(fn)`

Reads signals without registering dependencies.

```ts
const summary = createComputed(() => {
  const visible = count.get();
  const debugOnly = untrack(() => fullName.get());
  return `${visible}:${debugOnly}`;
});
```

## Store API

```ts
import { createStore, defineStore, shallowEqual } from 'signalforge/core';

const counter = createStore({
  count: 0,
  label: 'Counter',
});

counter.get();
counter.set({ count: 1, label: 'Counter' });
counter.update((state) => ({ ...state, count: state.count + 1 }));

const unsubscribe = counter.subscribe((next) => {
  console.log(next.count);
});

const countOnly = counter.select((state) => state.count);
```

`defineStore` is the same primitive with a name, useful for tooling and app-level stores.

```ts
const sessionStore = defineStore('session', {
  userId: null as string | null,
  roles: [] as string[],
});
```

Use `shallowEqual` with selectors that return small objects or arrays.

```ts
const viewModel = counter.select(
  (state) => ({ count: state.count, label: state.label }),
  shallowEqual,
);
```

## React

```tsx
import { createSignal } from 'signalforge/core';
import { useSignal, useSignalValue, useComputed, useStoreSelector } from 'signalforge/react';

const sharedCount = createSignal(0);

export function Counter() {
  const [localCount, setLocalCount] = useSignal(0);
  const shared = useSignalValue(sharedCount);
  const doubled = useComputed(() => sharedCount.get() * 2, []);

  return (
    <button onClick={() => setLocalCount((value) => value + 1)}>
      {localCount} / {shared} / {doubled}
    </button>
  );
}
```

`useSignalValue` and store selectors are implemented with `useSyncExternalStore`, so they are safe for React 18/19 concurrent rendering and SSR hydration.

### Store Selectors

```tsx
import { shallowEqual } from 'signalforge/core';
import { useStoreSelector } from 'signalforge/react';

function Header() {
  const session = useStoreSelector(
    sessionStore,
    (state) => ({ userId: state.userId, roles: state.roles }),
    [],
    shallowEqual,
  );

  return <span>{session.userId ?? 'Guest'}</span>;
}
```

## DevTools

```tsx
import { DevToolsProvider } from 'signalforge/devtools';

export function App() {
  return (
    <DevToolsProvider enabled={process.env.NODE_ENV !== 'production'}>
      <Routes />
    </DevToolsProvider>
  );
}
```

Runtime APIs:

```ts
import {
  getSignalGraph,
  getPerformanceMetrics,
  getRenderImpact,
  getActivePlugins,
  onProfilerEvent,
} from 'signalforge/devtools';
```

The embedded panel includes signal graph, timeline, render impact, and plugin diagnostics.

## Plugins

```ts
import { registerPlugin } from 'signalforge/plugins';

const unregister = registerPlugin({
  name: 'audit-log',
  version: '1.0.0',
  onSignalUpdate(signal, nextValue, previousValue) {
    console.log(signal.id, previousValue, nextValue);
  },
});

unregister();
```

Plugins are lazy on the core hot path. Only register them when you need instrumentation, persistence, or app-specific integration.

## Release Checks

Run the full local gate before publishing:

```bash
npm run test:all
npm run test:package
npm run test:package-contents
npm run size
npm audit
npm run build --prefix examples/react-store
```
