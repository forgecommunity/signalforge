# SignalForge

Fine-grained reactive state management for JavaScript, React, and React Native.

[![npm version](https://img.shields.io/npm/v/signalforge.svg)](https://www.npmjs.com/package/signalforge)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)

Documentation and package links:

- Docs site: https://signalforge-fogecommunity.vercel.app/docs
- API reference: https://signalforge-fogecommunity.vercel.app/docs/api
- Examples: https://signalforge-fogecommunity.vercel.app/docs/examples
- Benchmarks: https://signalforge-fogecommunity.vercel.app/docs/benchmarks
- Migration guide: https://signalforge-fogecommunity.vercel.app/docs/migration
- npm package: https://www.npmjs.com/package/signalforge

SignalForge gives you small reactive primitives:

```ts
import { createSignal, createComputed } from "signalforge/core";

const count = createSignal(0);
const doubled = createComputed(() => count.get() * 2);

count.set(5);
console.log(doubled.get()); // 10
```

## Install

```bash
npm install signalforge
```

## React

```tsx
import { useSignal } from "signalforge/react";

function Counter() {
  const [count, setCount] = useSignal(0);

  return (
    <button onClick={() => setCount((value) => value + 1)}>
      Clicked {count} times
    </button>
  );
}
```

## Entrypoints

Prefer subpath imports so apps only bundle what they use.

| Import | Purpose |
| --- | --- |
| `signalforge/core` | Signals, computed values, effects, batching |
| `signalforge/react` | Core plus React hooks |
| `signalforge/utils` | Persistence, collections, async helpers, benchmarks |
| `signalforge/plugins` | Logger, validation, time-travel helpers |
| `signalforge/devtools` | Development-only inspection and profiling |
| `signalforge/minimal` | Function-call style minimal core |

Current gzipped bundle sizes are checked with `npm run size`. The core entrypoint is about 1.7 KB gzipped; the React entrypoint is about 2.5 KB gzipped; the root entrypoint stays focused on core/store/React essentials and is kept well under 12 KB gzipped.

The root `signalforge` export is intentionally small. Import utilities, plugins, and devtools from their subpaths instead of relying on root re-exports.

## Core API

```ts
createSignal(value)
createComputed(() => value)
createEffect(() => cleanup?)
batch(() => updates)
untrack(() => readWithoutDependency)
createStore(object)
```

## Store Pattern

```ts
import { createStore, shallowEqual } from "signalforge/core";
import { useStoreSelector } from "signalforge/react";

const cart = createStore({
  items: [],
  coupon: "",
});

function CartCount() {
  const count = useStoreSelector(cart, (state) => state.items.length);
  return <span>{count}</span>;
}

const visibleItems = cart.select(
  (state) => state.items.filter((item) => item.visible),
  shallowEqual
);
```

Use `createStore` for object-shaped app state and `useStoreSelector` to subscribe React components to the smallest value they need. `store.select(selector, equals?)` accepts an optional equality function for object and array selections that should preserve identity when their meaningful value did not change. Use `shallowEqual` for the common case.

## Persistence

```ts
import { createPersistentSignal } from "signalforge/utils";

const theme = createPersistentSignal("theme", "light");
theme.set("dark");
```

Storage support includes browser `localStorage`, React Native AsyncStorage when installed, and an in-memory Node.js fallback for tests and server-side code.

## DevTools

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

The embedded DevTools panel includes signal inspection, a visual dependency graph, event timeline, render-impact ranking, performance metrics, and plugin hook debugging. Keep this import development-only in production applications.

## React Native

The JavaScript implementation works in React Native. Optional native JSI bindings are included for apps that want native-backed signal storage. If native bindings are unavailable, the native bridge falls back to the JavaScript signal store.

See:

- [React Native guide](./docs/react-native-guide.md)
- [SSR and Next.js](./docs/ssr-nextjs.md)
- [Migration guide](./docs/migration-guide.md)
- [Benchmark methodology](./docs/benchmark-methodology.md)
- [Native overview](./docs/native-overview.md)
- [Android integration](./docs/android-integration.md)
- [iOS integration](./docs/ios-integration.md)

## Development

```bash
npm install
npm run build
npm run test:all
npm run test:package
npm run audit:high
npm run size
npm run benchmark
npm run benchmark:compare
```

`npm run test:package` packs the library and installs it into temporary React 18 and React 19 consumer projects. It verifies ESM, CommonJS, subpath exports, and TypeScript resolution.

## Benchmarks

Use benchmarks for local regression tracking, not universal marketing claims. JavaScript state-library performance depends on the runtime, framework version, workload shape, and bundler.

```bash
npm run benchmark
npm run benchmark:compare
```

`benchmark:compare` currently compares SignalForge with Zustand vanilla and Redux Toolkit for primitive updates, selector reads, and subscribed updates. Add a competitor only when the benchmark can use its documented public API and the scenario is equivalent.

## When Not To Use SignalForge

Use a simpler tool when your state is mostly local React state, a server cache, or form state already handled well by your framework. Use an established ecosystem library when you need mature middleware, large community integrations, or a battle-tested devtools workflow more than fine-grained reactive primitives.

## Project Status

SignalForge is built around a small reactive core with optional React, persistence, devtools, plugin, and React Native layers. Production hardening focuses on correctness, honest tests, small entrypoints, and clear runtime behavior.

## License

MIT (c) ForgeCommunity
