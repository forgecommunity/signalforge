# Migration Guide

This guide helps teams evaluate whether moving state to SignalForge is worth it.

## From Local React State

Keep `useState` when state is local to one component and has no derived graph. Move to SignalForge when multiple components need the same state, derived values are duplicated, or updates should avoid parent re-renders.

```tsx
import { createSignal } from "signalforge/core";
import { useSignalValue } from "signalforge/react";

const count = createSignal(0);

function Counter() {
  const value = useSignalValue(count);
  return <button onClick={() => count.set((n) => n + 1)}>{value}</button>;
}
```

## From Zustand

Use `createStore` for object-shaped state and selectors. Use `shallowEqual` for object or array selector output.

```ts
import { createStore, shallowEqual } from "signalforge/core";

const store = createStore({
  user: { id: "1", name: "Ada" },
  theme: "dark",
});

const userView = store.select(
  (state) => ({ id: state.user.id, name: state.user.name }),
  shallowEqual
);
```

## From Redux Toolkit

Keep Redux when middleware, action replay, established team patterns, or ecosystem integrations are the main requirement. Use SignalForge when the state is UI-heavy, derived values are frequent, and fine-grained subscriptions matter more than an action log.

```ts
import { createStore } from "signalforge/core";

const counter = createStore({ value: 0 });

export const increment = () => {
  counter.set((state) => ({ value: state.value + 1 }));
};
```

## Migration Checklist

- Start with one isolated feature.
- Replace broad object subscriptions with narrow selectors.
- Keep server cache state in a server-cache library.
- Add tests around derived values before replacing existing state.
- Run `npm run test:all` and app-level integration tests before expanding the migration.
