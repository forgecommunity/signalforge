# SSR And Next.js

SignalForge's React hooks use `useSyncExternalStore`, so server rendering and hydration use the same snapshot contract React expects.

## Server Rendering

For SSR, create request-scoped signals or stores. Avoid module-level mutable state for per-user data.

```tsx
import { createStore } from "signalforge/core";
import { useStoreSelector } from "signalforge/react";

function createCartStore() {
  return createStore({
    items: [],
    coupon: "",
  });
}

export function CartSummary({ store = createCartStore() }) {
  const count = useStoreSelector(store, (state) => state.items.length);
  return <span>{count}</span>;
}
```

## Next.js App Router

Use SignalForge hooks in client components.

```tsx
"use client";

import { createStore } from "signalforge/core";
import { useStoreSelector } from "signalforge/react";

const counter = createStore({ count: 0 });

export function Counter() {
  const count = useStoreSelector(counter, (state) => state.count);

  return (
    <button onClick={() => counter.set((state) => ({ count: state.count + 1 }))}>
      {count}
    </button>
  );
}
```

## Validation

The repository includes:

- `tests/ssr.test.tsx` for server-rendered snapshots.
- `tests/react-runtime.test.tsx` for hydration parity, StrictMode cleanup, and concurrent update consistency.
- `scripts/package-smoke-test.mjs` for real packaged React 18 and React 19 consumers.

Run:

```bash
npm run test:ssr
npm run test:react-runtime
npm run test:package
```
