# Getting Started

SignalForge is a small fine-grained reactive state library. The stable core is framework-agnostic and can be used directly in JavaScript, React, React Native, and server-side code.

Launch documentation:

- Guides: https://signalforge-fogecommunity.vercel.app/docs
- API: https://signalforge-fogecommunity.vercel.app/docs/api
- Examples: https://signalforge-fogecommunity.vercel.app/docs/examples
- Benchmarks: https://signalforge-fogecommunity.vercel.app/docs/benchmarks
- Migration: https://signalforge-fogecommunity.vercel.app/docs/migration

## Install

```bash
npm install signalforge
```

## Core Signals

```ts
import { createSignal, createComputed, createEffect } from "signalforge/core";

const count = createSignal(0);
const doubled = createComputed(() => count.get() * 2);

const stop = createEffect(() => {
  console.log("count", count.get(), "doubled", doubled.get());
});

count.set(1);
stop();
```

## React

```tsx
import { useSignal } from "signalforge/react";

function Counter() {
  const [count, setCount] = useSignal(0);

  return (
    <button onClick={() => setCount((value) => value + 1)}>
      {count}
    </button>
  );
}
```

React subscriptions use `useSyncExternalStore`, so the hook follows React 18's external-store contract.

## Store API

Use `createStore` for object-shaped application state.

```tsx
import { createStore } from "signalforge/core";
import { useStoreSelector } from "signalforge/react";

const cart = createStore({
  items: [
    { id: 1, name: "Signal Plan", quantity: 1 },
  ],
  coupon: "",
});

function CartBadge() {
  const count = useStoreSelector(cart, (state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );

  return <span>{count}</span>;
}
```

`store.set({ key: value })` patches state. `store.set((state) => nextState)` replaces state from a function. `store.select(selector, equals?)` creates a computed signal from store state. Use `shallowEqual` or a custom equality function for object or array selectors that should preserve identity when the selected value is equivalent.

## Entrypoints

Prefer subpath imports:

| Import | Use |
| --- | --- |
| `signalforge/core` | Core reactive primitives |
| `signalforge/react` | React hooks plus core |
| `signalforge/utils` | Persistence and utility helpers |
| `signalforge/plugins` | Stable simple plugin API |
| `signalforge/devtools` | Development-only inspection and profiling |
| `signalforge/minimal` | Tiny function-call signal API |

The current size check reports about 1.7 KB gzipped for `signalforge/core`, about 2.5 KB gzipped for `signalforge/react`, and keeps the focused root toolkit export under 12 KB gzipped.

## Batching

```ts
import { batch, createComputed, createSignal } from "signalforge/core";

const first = createSignal("Ada");
const last = createSignal("Lovelace");
const fullName = createComputed(() => `${first.get()} ${last.get()}`);

batch(() => {
  first.set("Grace");
  last.set("Hopper");
});

console.log(fullName.get());
```

Batching coalesces dirty computed/effect recomputation. External subscribers still receive updates for each direct signal write.

## Persistence

```ts
import { createPersistentSignal } from "signalforge/utils";

const theme = createPersistentSignal("theme", "light");
theme.set("dark");
```

The storage adapter supports browser `localStorage`, React Native AsyncStorage when installed, and an in-memory fallback for Node.js/test environments.

## Plugins

```ts
import { createSignal } from "signalforge/core";
import { registerPlugin, clearPlugins } from "signalforge/plugins";

registerPlugin({
  name: "positive-only",
  onBeforeUpdate(context) {
    return typeof context.newValue === "number" && context.newValue < 0
      ? undefined
      : context.newValue;
  },
});

const count = createSignal(1);
count.set(-1); // cancelled by plugin

clearPlugins();
```

The stable plugin API supports creation, before-update interception, after-update notifications, and destroy notifications.

## Embedded DevTools

```tsx
import { DevToolsProvider } from "signalforge/devtools";

export function App() {
  return (
    <DevToolsProvider>
      <Routes />
    </DevToolsProvider>
  );
}
```

The development panel provides signal search, graph visualization, update timeline, render-impact ranking, performance metrics, and plugin hook debugging.

## React Native

The JavaScript implementation works in React Native. Optional native JSI bindings can be installed for native-backed storage. When native bindings are unavailable, the bridge uses the JavaScript fallback store.

## Development

```bash
npm run build
npm run test:all
npm run size
```
