# SignalForge

<div align="center">

![SignalForge logo](https://github.com/forgecommunity/signalforge/blob/master/docs/assets/signalforge.png?raw=1)

**Fine-Grained Reactive State Management for Modern JavaScript**

[![npm version](https://img.shields.io/npm/v/signalforge.svg)](https://www.npmjs.com/package/signalforge)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Bundle Size](https://img.shields.io/badge/gzip-2KB-blue.svg)](https://bundlephobia.com/package/signalforge)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)

[Quick Start](#-quick-start) • [Examples](#-full-examples) • [Docs](./docs/getting-started.md) • [API Reference](./docs/API.md)

</div>

---

## What is SignalForge?

A **simple state management library** for React and React Native. Your UI automatically updates when data changes. No Redux complexity, no boilerplate.

**Think of it as smart variables:**

```typescript
const count = createSignal(0);         // Create a signal
count.set(5);                          // Update it
count.get();                           // Read it: 5

// Computed values update automatically
const doubled = createComputed(() => count.get() * 2);
console.log(doubled.get());            // 10
```

## Why SignalForge?

### Easy to Learn
Only 3 functions to master:
```typescript
createSignal(value)              // Store data
createComputed(() => ...)        // Auto-calculate from other signals
createEffect(() => ...)          // Run code when signals change
```

### Works Everywhere
- React (hooks + class components)
- React Native (iOS + Android)
- Next.js (SSR ready)
- Plain JavaScript

### Actually Fast
- **2KB** total bundle size
- Updates 33x faster than individual changes
- Handles thousands of signals smoothly

### Batteries Included
- **Auto-save to storage** (localStorage/AsyncStorage)
- **DevTools** for debugging
- **Time travel** (undo/redo)
- **No dependencies**



---

## Quick Start

### 1. Install

```bash
npm install signalforge
```

### 2. Use in React

```jsx
import { useSignal } from 'signalforge/react';

function Counter() {
  const [count, setCount] = useSignal(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```

**That's it!** No providers, no context, no configuration needed.

### 3. Share State Between Components

Create signals outside components for global state:

```jsx
import { createSignal } from 'signalforge';
import { useSignalValue } from 'signalforge/react';

// Global signal - accessible anywhere
const userPoints = createSignal(0);

function Header() {
  const points = useSignalValue(userPoints);
  return <div>Points: {points}</div>;
}

function AddPointsButton() {
  return (
    <button onClick={() => userPoints.set(userPoints.get() + 10)}>
      Add Points
    </button>
  );
}

// Both components stay in sync automatically!
```

### 4. Auto-Calculated Values

```javascript
import { createSignal, createComputed } from 'signalforge';

const price = createSignal(100);
const quantity = createSignal(2);

// Total updates automatically when price or quantity changes
const total = createComputed(() => price.get() * quantity.get());

price.set(150);
console.log(total.get());  // 300 (auto-updated!)
```

---

## Core Concepts

### Signals - Store Data

```javascript
import { createSignal } from 'signalforge';

const count = createSignal(0);

count.get();                    // Read: 0
count.set(5);                   // Write: 5
count.set(c => c + 1);          // Update: 6
```

### Computed - Auto-Calculate

```javascript
import { createComputed } from 'signalforge';

const firstName = createSignal('John');
const lastName = createSignal('Doe');

// Recalculates automatically when firstName or lastName changes
const fullName = createComputed(() => 
  `${firstName.get()} ${lastName.get()}`
);

firstName.set('Jane');
console.log(fullName.get());    // "Jane Doe"
```

### Effects - Run Side Effects

```javascript
import { createEffect } from 'signalforge';

const username = createSignal('guest');

// Runs automatically when username changes
createEffect(() => {
  console.log('User:', username.get());
  // Save to analytics, update title, etc.
});
```

### Batch Updates - Better Performance

```javascript
import { batch } from 'signalforge';

// Updates UI only once instead of 3 times
batch(() => {
  signal1.set('a');
  signal2.set('b');
  signal3.set('c');
});
```

### Persist to Storage

```javascript
import { persist } from 'signalforge/utils';

const theme = createSignal('light');
persist(theme, { key: 'app-theme' });

// Value automatically saved and restored on app restart
```

---

## React Hooks

### `useSignal` - Local Component State

```jsx
import { useSignal } from 'signalforge/react';

function TodoApp() {
  const [task, setTask] = useSignal('');
  const [todos, setTodos] = useSignal([]);
  
  const addTodo = () => {
    setTodos([...todos, task]);
    setTask('');
  };
  
  return (
    <div>
      <input value={task} onChange={e => setTask(e.target.value)} />
      <button onClick={addTodo}>Add</button>
      {todos.map(todo => <div key={todo}>{todo}</div>)}
    </div>
  );
}
```

### `useSignalValue` - Subscribe to Global Signals

```jsx
import { createSignal } from 'signalforge';
import { useSignalValue } from 'signalforge/react';

// Create global signal
const currentUser = createSignal({ name: 'Guest', points: 0 });

// Use in any component
function UserProfile() {
  const user = useSignalValue(currentUser);
  return <div>{user.name} has {user.points} points</div>;
}

function AnotherComponent() {
  const user = useSignalValue(currentUser);
  // Both components update when currentUser changes!
  return <button onClick={() => currentUser.set({...user, points: user.points + 10})}>
    Add Points
  </button>;
}

function Logger() {
  const [count] = useSignal(0);
  
  useSignalEffect(() => {
    console.log('Count changed:', count);
    // Auto-tracks count dependency!
  });
  
  return <div>Count: {count}</div>;
}
```

### Class Component Support

Use `withSignals` HOC to inject signal values as props:

```jsx
import { withSignals } from 'signalforge/react';

class CounterPanel extends React.Component {
  render() {
    return <div>Count: {this.props.count}</div>;
  }
}

export default withSignals(CounterPanel, { 
  count: globalCount 
});
```

### Complete React Example

```jsx
import { createSignal, createComputed } from 'signalforge';
import { useSignalValue } from 'signalforge/react';

// Global signals
const items = createSignal([
  { id: 1, name: 'Apple', price: 1.5, qty: 2 },
  { id: 2, name: 'Bread', price: 2.0, qty: 1 }
]);

const total = createComputed(() => 
  items.get().reduce((sum, item) => 
    sum + (item.price * item.qty), 0
  )
);

function ShoppingCart() {
  const cartItems = useSignalValue(items);
  const cartTotal = useSignalValue(total);
  
  const addItem = (id) => {
    items.set(current => 
      current.map(item => 
        item.id === id 
          ? { ...item, qty: item.qty + 1 }
          : item
      )
    );
  };
  
  return (
    <div>
      <h2>Shopping Cart</h2>
      {cartItems.map(item => (
        <div key={item.id}>
          {item.name} - ${item.price} x {item.qty}
          <button onClick={() => addItem(item.id)}>+</button>
        </div>
      ))}
      <h3>Total: ${cartTotal.toFixed(2)}</h3>
    </div>
  );
}
```

---

## React Native

### Installation

```bash
npm install signalforge @react-native-async-storage/async-storage
cd ios && pod install && cd ..  # iOS only
```

### Usage

Same API as React - just import and use:

```tsx
import { useSignal } from 'signalforge/react';
import { View, Button, Text } from 'react-native';

function Counter() {
  const [count, setCount] = useSignal(0);
  
  return (
    <View>
      <Text>Count: {count}</Text>
      <Button title="+1" onPress={() => setCount(count + 1)} />
    </View>
  );
}
```

### Save to AsyncStorage

```tsx
import { createSignal } from 'signalforge';
import { persist } from 'signalforge/utils';
import { useEffect } from 'react';

const settings = createSignal({ theme: 'dark', notifications: true });

function App() {
  useEffect(() => {
    persist(settings, { key: 'app_settings' });
  }, []);
  // Settings now auto-save and restore!
}
```

### Try the Demo App

Complete working example with 19 screens:

```bash
git clone https://github.com/forgecommunity/signalforge.git
cd signalforge && npm install && npm run build
cd examples/sfReactNative && npm install
npm start

# In another terminal:
npm run android  # or npm run ios
```

**Includes:** Shopping cart, forms, persistence, cross-screen communication, and more.

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

## Cross-Screen Communication

Signals created outside components work as global state. Multiple screens can read and write the same data:

```tsx
// shared/userState.ts - Global signals accessible anywhere
import { createSignal, createComputed } from 'signalforge';

export const currentUser = createSignal({ name: 'Guest', points: 0 });
export const cartItems = createSignal([]);
export const totalPoints = createComputed(() => currentUser.get().points);

// screens/ProfileScreen.tsx - Read and write user data
import { useSignalValue } from 'signalforge/react';
import { currentUser } from '../shared/userState';

function ProfileScreen() {
  const user = useSignalValue(currentUser);
  
  const updateName = (newName: string) => {
    currentUser.set({ ...currentUser.get(), name: newName });
  };
  
  return (
    <View>
      <Text>Welcome, {user.name}!</Text>
      <Text>Points: {user.points}</Text>
      <Button title="Add Points" onPress={() => 
        currentUser.set({ ...user, points: user.points + 10 })
      } />
    </View>
  );
}

// screens/CartScreen.tsx - Reads same user, updates when ProfileScreen changes it
import { useSignalValue } from 'signalforge/react';
import { currentUser, cartItems } from '../shared/userState';

function CartScreen() {
  const user = useSignalValue(currentUser);  // Auto-updates when changed elsewhere!
  const items = useSignalValue(cartItems);
  
  return (
    <View>
      <Text>{user.name}'s Cart</Text>
      <Text>You have {user.points} points</Text>
      <Text>{items.length} items in cart</Text>
    </View>
  );
}

// screens/CheckoutScreen.tsx - Also sees live updates
import { useSignalValue } from 'signalforge/react';
import { currentUser, cartItems } from '../shared/userState';

function CheckoutScreen() {
  const user = useSignalValue(currentUser);
  const items = useSignalValue(cartItems);
  
  const completeOrder = () => {
    // Deduct points, clear cart - all screens update automatically!
    currentUser.set({ ...user, points: user.points - 50 });
    cartItems.set([]);
  };
  
  return (
    <View>
      <Text>Checkout for {user.name}</Text>
      <Text>Using {Math.min(50, user.points)} points</Text>
      <Button title="Complete Order" onPress={completeOrder} />
    </View>
  );
}
```

**Why this works:**
- No prop drilling needed
- All screens update automatically
- TypeScript ensures type safety
- Easy to test
- Simple to understand

---

## Examples

Working example apps you can run and learn from:

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

### Size
- **2KB** gzipped (React entry)
- **0.5KB** core only
- Zero dependencies

### Speed
- Signal reads: < 1 nanosecond
- Batch updates: 33x faster than individual
- Handles 1000s of signals smoothly

### Run Benchmarks

```bash
npm run benchmark
```

---

## Try It Live

### React Native Demo

```bash
git clone https://github.com/forgecommunity/signalforge.git
cd signalforge && npm install && npm run build
cd examples/sfReactNative && npm install && npm start
```

19 interactive screens showing real-world examples.

### Web Demo

[signalforge-fogecommunity.vercel.app](https://signalforge-fogecommunity.vercel.app/)

---

## Documentation

- [Getting Started Guide](./docs/getting-started.md)
- [API Reference](./docs/API.md)
- [API Cheat Sheet](./docs/API-QUICK-REFERENCE.md)
- [React Native Guide](./docs/react-native-guide.md)
- [Example Apps](./examples/)

---

## Get Help

- [Documentation](./docs/getting-started.md)
- [GitHub Issues](https://github.com/forgecommunity/signalforge/issues)
- [Discussions](https://github.com/forgecommunity/signalforge/discussions)

## Contributing

```bash
git clone https://github.com/forgecommunity/signalforge.git
cd signalforge && npm install && npm run build
npm run test:all
```

Pull requests welcome!

## License

MIT

---

<div align="center">

**Built by [ForgeCommunity](https://github.com/forgecommunity)**

[GitHub](https://github.com/forgecommunity/signalforge) • [npm](https://www.npmjs.com/package/signalforge) • [Documentation](./docs/getting-started.md)

</div>

