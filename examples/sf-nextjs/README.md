# SignalForge Next.js Example

This is a local Next.js example app for validating SignalForge with React Server Components, client components, route metadata, and interactive demos.

It is intentionally an example, not a benchmark claim page. Performance claims should come from the repository benchmark suite and include the exact environment used.

## Run Locally

From the repository root:

```bash
npm install
npm run build
npm install --prefix examples/sf-nextjs
npm run dev --prefix examples/sf-nextjs
```

Open `http://localhost:3000`.

## What It Covers

- Basic signals and local React state.
- Computed values.
- Effects and cleanup.
- Batched updates.
- Store-like shared state patterns.
- Forms, todos, carts, and large-list examples.
- SSR-safe React integration through `useSyncExternalStore`.
- DevTools embedding examples.

## Import Pattern

Prefer subpath imports in examples:

```tsx
import { createSignal, createComputed, batch } from 'signalforge/core';
import { useSignal, useSignalValue } from 'signalforge/react';
```

The root package keeps common exports for convenience, but subpaths make example intent clearer.

## Verification

```bash
npm run build --prefix examples/sf-nextjs
npm run lint --prefix examples/sf-nextjs
```

If you edit the library and the example in the same pass, rebuild the library first so the local file dependency resolves the current dist files.

## Release Notes

Before using this app in launch material:

- Remove unmeasured ratio claims.
- Keep bundle-size claims tied to `npm run size`.
- Link benchmarks to `docs/benchmark-methodology.md`.
- Verify route metadata and Open Graph copy do not contain stale version numbers.
