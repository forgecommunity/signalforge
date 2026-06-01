# Changelog

All notable changes to SignalForge should be documented here before publishing.

## Unreleased

- Narrowed the root `signalforge` export to core, store, and React essentials.
- Added store APIs: `createStore`, `defineStore`, `useStore`, and `useStoreSelector`.
- Added equality-aware store selectors and a built-in `shallowEqual` helper for object and array selections.
- Removed duplicate computed evaluation during computed signal construction.
- Optimized clean signal/computed reads by keeping the untracked hot path inline.
- Moved React subscriptions to `useSyncExternalStore` and added SSR, hydration, StrictMode, and concurrent update tests.
- Added package smoke tests for React 18 and React 19 consumers across ESM, CommonJS, subpath exports, and TypeScript resolution.
- Added package contents verification for npm tarballs.
- Added CI, release workflow, audit gates, size gates, and prepublish checks.
- Added honest comparison benchmarks for SignalForge, Zustand vanilla, and Redux Toolkit.
- Added benchmark methodology and migration guidance.
- Added embedded DevTools panel exports with graph, timeline, render-impact, performance, and plugin debugging surfaces.
- Cleaned documentation claims and added guidance on when not to use SignalForge.
- Optimized the no-plugin signal hot path while preserving lazy plugin interception for existing signals.

## 1.0.2

- Current development version.
