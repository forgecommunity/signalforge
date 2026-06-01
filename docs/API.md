# API Reference

## Core

### `createSignal<T>(initialValue: T): Signal<T>`

Creates a mutable signal.

```ts
const count = createSignal(0);
count.get();
count.set(1);
count.set((value) => value + 1);
```

### `createComputed<T>(computeFn: () => T): ComputedSignal<T>`

Creates a derived read-only signal. Dependencies are tracked automatically when signals are read inside `computeFn`.

```ts
const count = createSignal(2);
const doubled = createComputed(() => count.get() * 2);
```

Circular computed recursion throws a `Circular dependency` error.

### `createEffect(effectFn: () => void): () => void`

Runs an effect immediately and again when tracked dependencies change. Returns a cleanup function that removes the effect from the graph.

### `batch<T>(fn: () => T): T`

Runs multiple updates and flushes dirty computed/effect work once at the end.

### `untrack<T>(fn: () => T): T`

Reads signals without registering dependencies.

### `flushSync(): void`

Forces queued dirty work to run synchronously.

## Signal Interface

```ts
interface Signal<T> {
  get(): T;
  set(value: T | ((prev: T) => T)): void;
  subscribe(listener: (value: T) => void): () => void;
  destroy(): void;
}
```

After `destroy()`, reads, writes, and new subscriptions throw. Destroyed nodes clear subscribers and retained internal references.

## React

```ts
import { useSignal, useSignalValue, useSignalEffect } from "signalforge/react";
```

### `useSignal<T>(initialValue: T | (() => T))`

Creates a component-local signal and returns `[value, setValue]`.

### `useSignalValue<T>(signal: Signal<T>)`

Subscribes a component to an external signal using `useSyncExternalStore`.

### `useSignalEffect(effectFn, deps?)`

Runs a React lifecycle-managed SignalForge effect.

### `useComputed<T>(computeFn, deps?): T`

Creates a component-local computed signal and subscribes to its value.

### `useStore<T>(store): T`

Subscribes to the whole store state.

### `useStoreSelector<T, R>(store, selector, deps?, equals?): R`

Subscribes to a computed selection from a store. Use this for narrow React re-renders.

## Store API

```ts
const store = createStore({
  count: 0,
  label: "items",
});

store.set({ count: 1 });
store.set((state) => ({ ...state, label: "products" }));

const countLabel = store.select((state) => `${state.count} ${state.label}`);

const visibleItems = store.select(
  (state) => state.items.filter((item) => item.visible),
  shallowEqual
);
```

### `createStore<T extends object>(initialState: T): SignalStore<T>`

Creates an object-shaped store backed by a signal.

`store.select(selector, equals?)` creates a computed selection. `equals` defaults to `Object.is`. Pass a custom equality function when the selector returns fresh object or array instances that should not notify subscribers unless their meaningful contents changed.

### `shallowEqual<T>(previous: T, next: T): boolean`

Compares arrays and plain object values one level deep with `Object.is`. Use it with store selectors when a selector returns a new object or array wrapper around stable values.

### `defineStore<T>(factory: () => T): T`

Runs a store factory and returns its result. This is a small convention helper for grouping signals, computed values, and actions.

## Plugins

```ts
interface Plugin {
  name: string;
  version?: string;
  onSignalCreate?(metadata, initialValue): void;
  onBeforeUpdate?(context): unknown | undefined;
  onSignalUpdate?(context): void;
  onSignalDestroy?(metadata): void;
  onRegister?(): void;
  onUnregister?(): void;
}
```

Returning `undefined` from `onBeforeUpdate` cancels the update. Returning any other value replaces the incoming value.

## DevTools And Profiler

Development-only inspection APIs are available from `signalforge/devtools`.

```ts
import {
  DevToolsProvider,
  enableDevTools,
  enableProfiler,
  getActivePlugins,
  onProfilerEvent,
} from "signalforge/devtools";

enableDevTools();
enableProfiler();

const stop = onProfilerEvent((event) => {
  if (event.type === "profiler-latency-sample") {
    console.log(event.payload.signalId, event.payload.latency);
  }
});

stop();
```

`DevToolsProvider` mounts the embedded panel in React apps. The panel includes signal inspection, a visual dependency graph, event timeline, render-impact ranking, performance metrics, and plugin hook debugging.

`getActivePlugins()` returns the registered plugin debug snapshot used by the panel.

`onProfilerEvent(listener)` subscribes to profiler latency and batch timing records. It returns an unsubscribe function and does not depend on a browser UI.

## Native Bridge

`src/native/jsiBridge` uses native JSI functions when installed. In JavaScript-only environments it falls back to the core signal store.
