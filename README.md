# SignalForge

![SignalForge logo](https://github.com/forgecommunity/signalforge/blob/master/docs/assets/signalforge.png?raw=1)

SignalForge is a reactive data engine and state-management library for React and React Native. It keeps UI, business logic, and persistence in sync with a minimal API and zero reducer/Context boilerplate. Signals feel like smart variables: they update instantly, stay deterministic under load, and ship with built-in observability and persistence.

## Highlights
- **Ergonomic API:** `createSignal`, `createComputed`, and `createEffect` cover the common cases without reducers, actions, or middleware.
- **React-first hooks:** `useSignal`, `useSignalValue`, `useSignalEffect`, and `withSignals` keep components in sync with no extra providers.
- **Persistence included:** `createPersistentSignal` and `persist` work in browsers (localStorage) and React Native (AsyncStorage) with the same code.
- **Native-ready:** Optional C++ JSI bridge on React Native for lower latency with automatic JavaScript fallback.
- **Production tooling:** Built-in logging and time travel so you can replay mutations without third-party devtools.
- **Tiny footprint:** ~2KB gzipped React entry, ~0.5KB core, plus benchmarked single-digit nanosecond reads/writes.

### What you can build quickly
- **Dashboards:** React + Next.js pages that share global signals across routes while streaming updates from effects.
- **Offline-friendly mobile UIs:** Persisted signals in React Native that replay updates after reconnecting.
- **Data-heavy widgets:** Tables, charts, or maps that recompute derived signals once per batch instead of per field change.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Concepts at a Glance](#concepts-at-a-glance)
3. [React Usage](#react-usage)
4. [React Native Notes](#react-native-notes)
5. [Full Examples](#full-examples)
6. [Performance](#performance)
7. [Support](#support)

---

## Quick Start

Install from npm:

```bash
npm install signalforge
```

Create a signal and read/write it:

```javascript
import { createSignal } from 'signalforge';

const count = createSignal(0);
count.get();      // 0
count.set(5);     // updates subscribers
count.set(c => c + 1);
```

Use it inside React:

```jsx
import { useSignal } from 'signalforge/react';

function Counter() {
  const [count, setCount] = useSignal(0);
  return (
    <button onClick={() => setCount(count + 1)}>Count: {count}</button>
  );
}
```

Persist state with one line:

```javascript
import { createPersistentSignal } from 'signalforge/utils';

const theme = createPersistentSignal('theme', 'dark');
theme.set('light'); // stored to localStorage/AsyncStorage
```

---

## Concepts at a Glance

```javascript
import { createSignal, createComputed, createEffect, batch, untrack } from 'signalforge';

const price = createSignal(100);
const qty = createSignal(2);
const total = createComputed(() => price.get() * qty.get());

createEffect(() => console.log('Total', total.get()));

batch(() => {
  price.set(125);
  qty.set(3);      // total recalculates once
});

const debug = createSignal(true);
const doubled = createComputed(() => {
  if (untrack(() => debug.get())) console.log('Debugging');
  return total.get() * 2;
});
```

- **Signals:** Hold values and notify subscribers via `get`, `set`, and `subscribe`.
- **Computed signals:** Derive values automatically from other signals.
- **Effects:** Run side effects when dependencies change; return cleanup functions as needed.
- **Batching:** Group updates so dependents recompute once.
- **Untrack:** Read a signal inside a computed/effect without creating a dependency.

More helpers (debounce, throttle, derive, memo, map/filter, async `createResource`, etc.) live under `signalforge/utils`.

---

## React Usage

Choose the hook that matches your component style:

```jsx
import { createSignal } from 'signalforge';
import { useSignal, useSignalValue, useSignalEffect, withSignals } from 'signalforge/react';

const globalCount = createSignal(0);

function Display() {
  const value = useSignalValue(globalCount);
  return <p>Global: {value}</p>;
}

function Controls() {
  const [local, setLocal] = useSignal(0);
  useSignalEffect(() => console.log('Global changed:', globalCount.get()));
  return (
    <>
      <button onClick={() => setLocal(local + 1)}>Local {local}</button>
      <button onClick={() => globalCount.set(c => c + 1)}>Global +1</button>
    </>
  );
}

class CounterPanel extends React.Component { /* ... */ }
export default withSignals(CounterPanel, { count: globalCount });
```

`withSignals` subscribes on mount, unsubscribes on unmount, and injects the latest values as props—handy for existing class components.

---

## React Native Notes

- Install normally, plus AsyncStorage for persistence:

  ```bash
  npm install signalforge @react-native-async-storage/async-storage
  cd ios && pod install  # iOS only
  ```

- The optional C++ JSI bridge is auto-linked on the new architecture; when unavailable, the library falls back to JavaScript.
- Use `persist` inside `useEffect` to ensure AsyncStorage is ready:

  ```tsx
  import { createSignal } from 'signalforge';
  import { persist } from 'signalforge/utils';
  import { useEffect } from 'react';

  const counter = createSignal(0);
  useEffect(() => persist(counter, { key: 'counter' }), []);
  ```

  - A full React Native example is in [`examples/sfReactNative`](examples/sfReactNative) and the snippets below are taken directly from that app.
  - Run it against the workspace build so you are using your local SignalForge changes:

  ```bash
  npm install
  npm run build
  cd examples/sfReactNative && npm install && npm start
  ```

### Copy/paste examples from the React Native demo

All of these are lifted directly from the working [`examples/sfReactNative`](examples/sfReactNative) screens so you can copy them
as-is.

**Basic signal** ([`screens/BasicSignalScreen.tsx`](examples/sfReactNative/screens/BasicSignalScreen.tsx))

```tsx
import { Text, TouchableOpacity, View } from 'react-native';
import { createSignal } from 'signalforge';
import { useSignalValue } from 'signalforge/react';

const age = createSignal(25);

export default function BasicSignalScreen() {
  const currentAge = useSignalValue(age);

  return (
    <View>
      <Text>Current Age: {currentAge}</Text>
      <TouchableOpacity onPress={() => age.set(age.get() + 1)}><Text>Increment</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => age.set(age.get() - 1)}><Text>Decrement</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => age.set(25)}><Text>Reset</Text></TouchableOpacity>
    </View>
  );
}
```

**Computed totals** ([`screens/ComputedSignalScreen.tsx`](examples/sfReactNative/screens/ComputedSignalScreen.tsx))

```tsx
import { Text, TouchableOpacity, View } from 'react-native';
import { createComputed, createSignal } from 'signalforge';
import { useSignalValue } from 'signalforge/react';

const price = createSignal(100);
const quantity = createSignal(2);
const total = createComputed(() => price.get() * quantity.get());

export default function ComputedSignalScreen() {
  const currentPrice = useSignalValue(price);
  const currentQuantity = useSignalValue(quantity);
  const currentTotal = useSignalValue(total);

  return (
    <View>
      <Text>Total: ${currentTotal}</Text>
      <TouchableOpacity onPress={() => price.set(Math.max(0, currentPrice - 10))}><Text>-10</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => price.set(currentPrice + 10)}><Text>+10</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => quantity.set(Math.max(1, currentQuantity - 1))}><Text>-1 Qty</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => quantity.set(currentQuantity + 1)}><Text>+1 Qty</Text></TouchableOpacity>
    </View>
  );
}
```

**Auto-tracked effects** ([`screens/EffectsScreen.tsx`](examples/sfReactNative/screens/EffectsScreen.tsx))

```tsx
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { createEffect, createSignal } from 'signalforge';
import { useSignalValue } from 'signalforge/react';

const userName = createSignal('John');
const messageCount = createSignal(0);

export default function EffectsScreen() {
  const currentUserName = useSignalValue(userName);
  const currentMessageCount = useSignalValue(messageCount);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const cleanupName = createEffect(() => {
      const name = userName.get();
      setLogs(prev => [...prev, `👋 Hello, ${name}!`]);
    });

    const cleanupCount = createEffect(() => {
      const count = messageCount.get();
      setLogs(prev => [...prev, `📬 You have ${count} message${count !== 1 ? 's' : ''}`]);
    });

    return () => { cleanupName(); cleanupCount(); };
  }, []);

  return (
    <View>
      <TouchableOpacity onPress={() => userName.set('Jane')}><Text>Change name</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => messageCount.set(messageCount.get() + 1)}><Text>Add message</Text></TouchableOpacity>
      {logs.map((log, i) => <Text key={i}>{log}</Text>)}
      <Text>Current: {currentUserName} / {currentMessageCount}</Text>
    </View>
  );
}
```

**Persisted settings** ([`screens/PersistentSignalScreen.tsx`](examples/sfReactNative/screens/PersistentSignalScreen.tsx))

```tsx
import { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createSignal } from 'signalforge';
import { persist } from 'signalforge/utils';
import { useSignalValue } from 'signalforge/react';

const username = createSignal('Guest');
const theme = createSignal('light');
const counter = createSignal(0);
let persistInitialized = false;

export default function PersistentSignalScreen() {
  useEffect(() => {
    if (!persistInitialized) {
      persistInitialized = true;
      persist(username, { key: 'demo_username' });
      persist(theme, { key: 'demo_theme' });
      persist(counter, { key: 'demo_counter' });
    }
  }, []);

  const currentUsername = useSignalValue(username);
  const currentTheme = useSignalValue(theme);
  const currentCounter = useSignalValue(counter);
  const [nameInput, setNameInput] = useState('');

  return (
    <View>
      <Text>Current: {currentUsername} ({currentTheme})</Text>
      <TextInput value={nameInput} onChangeText={setNameInput} placeholder="Enter username" />
      <TouchableOpacity onPress={() => theme.set(theme.get() === 'light' ? 'dark' : 'light')}><Text>Toggle Theme</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => counter.set(counter.get() + 1)}><Text>Increment</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => username.set(nameInput || 'Guest')}><Text>Save Username</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => { username.set('Guest'); theme.set('light'); counter.set(0); }}><Text>Reset All</Text></TouchableOpacity>
    </View>
  );
}
```

---

## Full Examples

SignalForge ships with runnable examples that mirror common production setups. Each example uses the published package names, so you can copy/paste code into your own app.

### Next.js dashboard (`examples/sf-nextjs`)

- Shows server-side rendering, client-side hydration, optimistic updates, and persisted theme + auth signals.
- Try it locally:

  ```bash
  npm install
  npm run build
  cd examples/sf-nextjs && npm install && npm run dev
  ```

- Key files to inspect:
  - `components/counter.tsx`: global signals shared across routes.
  - `lib/session.ts`: persisted signals for auth/session data.
  - `utils/performance.ts`: measuring signal update speed inside React.

### React Native starter (`examples/sfReactNative`)

- Demonstrates the AsyncStorage persistence adapter, offline-ready counters, and the optional JSI bridge fallback.
- Run it against the workspace build so the example picks up your local changes:

  ```bash
  npm install
  npm run build
  cd examples/sfReactNative && npm install && npm start
  ```

- Key files:
  - `App.tsx`: screen switcher that mounts every demo in the app.
  - `screens/BasicSignalScreen.tsx`: create/read/update a signal with React bindings.
  - `screens/ComputedSignalScreen.tsx`: derived totals that recalc automatically.
  - `screens/EffectsScreen.tsx`: `createEffect` subscriptions with cleanup.
  - `screens/PersistentSignalScreen.tsx`: AsyncStorage-backed signals for offline-ready state.

### Additional resources

- **Playground:** [`signalforge-fogecommunity.vercel.app`](https://signalforge-fogecommunity.vercel.app/) mirrors the Next.js demo.
- **API Reference:** See `src/` exports and inline JSDoc; utilities live under `signalforge/utils`.
- **Benchmarks & bundles:** `npm run bench` and `npm run size` generate the numbers quoted above. Outputs appear in `benchmarks/results`.

---

## Performance

SignalForge is tuned for production: nanosecond-level read/write benchmarks, small memory use, and minimal reactivity overhead even when thousands of signals update concurrently. React bundles gzip to ~2KB and the core to ~0.5KB. See `benchmarks/` for scripts and comparison details.

---

## Community & Contributing

**[ForgeCommunity](https://github.com/forgecommunity)** is a collective of developers creating high-performance, open-source tools. We welcome contributions—open an issue to discuss ideas or send a PR on our [GitHub repository](https://github.com/forgecommunity/signalforge).

---

## Support

- Open an issue on GitHub with a repro or failing test.
- For commercial support, reach out via the repository contact email.
- If you like SignalForge, please star the repo, share feedback, report bugs, suggest features, or help us improve the docs.

