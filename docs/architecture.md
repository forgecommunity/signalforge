# Architecture

SignalForge is built around a fine-grained reactive graph.

## Nodes

- Signals are mutable source nodes.
- Computed signals are derived nodes.
- Effects are sink nodes for side effects.

When a signal is read inside a computed signal or effect, SignalForge records the current reactive context as a subscriber. When the source signal changes, dependents are marked dirty and recomputed on flush or read.

## Dependency Tracking

SignalForge uses a context stack:

1. A computed/effect starts running.
2. It becomes the current tracking context.
3. Any `signal.get()` call registers a dependency.
4. The context is restored after execution.

Dependencies are cleared and rebuilt on every recomputation, which supports conditional dependencies.

## Batching

Dirty computed/effect nodes are placed in a queue and deduplicated with a scheduled flag. `batch()` runs user updates, then calls `flushSync()` so derived state is consistent when the batch returns.

External signal subscribers are notified for direct writes. Batching is primarily for derived graph recomputation.

## Safety Rules

- Computed recursion throws a circular dependency error.
- Destroyed signals reject reads, writes, and new subscriptions.
- Destroyed nodes clear subscribers, listeners, dependencies, values, and compute functions.
- Plugin `onBeforeUpdate` hooks can replace or cancel writes before a value is committed.
- Plugin errors are caught and logged so one plugin does not break the graph.

## Public Surface

Stable entrypoints:

- `signalforge/core`
- `signalforge/react`
- `signalforge/utils`
- `signalforge/plugins`
- `signalforge/devtools`
- `signalforge/minimal`

The root `signalforge` export is a convenience toolkit. Applications that care about bundle size should prefer subpath imports.

## React

React signal reads use `useSyncExternalStore` through `useSignalValue`, which follows the React 18 external-store contract.

## React Native

The native bridge uses JSI bindings when available and a JavaScript signal-store fallback otherwise. Native acceleration is optional; the JavaScript core remains the compatibility baseline.
