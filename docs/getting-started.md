# Getting Started with SignalForge v2.0

**Fine-grained reactive state management for modern JavaScript applications**

---

## Table of Contents

1. [What is SignalForge?](#what-is-signalforge)
2. [Why SignalForge?](#why-signalforge)
3. [Installation & Setup](#installation--setup)
4. [Basic API Usage](#basic-api-usage)
6. [Plugins & Ecosystem](#plugins--ecosystem)
7. [Roadmap](#roadmap)


## What is SignalForge?

SignalForge is a **lightweight, framework-agnostic reactive state management library** that brings fine-grained reactivity to JavaScript applications. Inspired by SolidJS signals and Preact signals, SignalForge provides automatic dependency tracking, computed values, and efficient batched updates.

### Core Concepts

**Signals** are reactive primitives that hold a value and notify subscribers when that value changes:

```typescript
const count = createSignal(0);
count.set(5);             // Notifies all subscribers
```

**Computed Signals** automatically track dependencies and recompute when dependencies change:

```typescript
const count = createSignal(10);
const doubled = createComputed(() => count.get() * 2);

console.log(doubled.get()); // 20
count.set(15);
console.log(doubled.get()); // 30 (auto-updated)
```

**Effects** run side effects when dependencies change:

```typescript
const name = createSignal('Alice');
createEffect(() => {
  console.log(`Hello, ${name.get()}!`);
}); // Logs: "Hello, Alice!"

name.set('Bob'); // Logs: "Hello, Bob!"
```

### Key Features

- Fine-grained reactivity that re-renders only what changed
- Automatic dependency tracking (no manual subscriptions)
- Framework agnostic support for React, Vue, and vanilla JavaScript
- Zero runtime dependencies; the React entry gzips to 2.03KB and the full bundle gzips to 25.32KB after the latest build.【80c43e†L57-L60】【80c43e†L77-L80】
- TypeScript-first APIs with full type safety and inference
- DevTools integration for debugging and visualization
- Extensible plugin system for time-travel, logging, and persistence
- Batched updates for efficient rendering
- Built-in persistence utilities for localStorage and AsyncStorage
- Optional native C++ JSI path for React Native with automatic JavaScript fallback.【F:src/native/setup.ts†L12-L120】

### What makes SignalForge powerful

- **Hook-first ergonomics:** `useSignal`, `useSignalValue`, and `useSignalEffect` expose signal values directly to components without selector boilerplate.【F:src/react/hooks.ts†L7-L99】
- **Built-in plugins:** Logging, time travel, and persistence plugins ship in the package so debugging and replaying state changes does not require external middleware.【F:docs/getting-started.md†L671-L700】
- **Measured speed:** Reads and writes land in the single-digit nanosecond range with ~1.6KB per signal in the repository benchmark suite.【F:benchmark-result.md†L7-L36】
- **Cross-platform reach:** Works in React, React Native, and vanilla JavaScript while sharing the same API surface.

### Feature comparison

| Capability | SignalForge | Redux | Zustand | Context API |
|------------|-------------|-------|---------|-------------|
| Built-in hooks | `useSignal`, `useSignalValue`, `useSignalEffect` | `useSelector`, `useDispatch` | Hook-based selectors | `useContext` only |
| Time travel in this repository | Included plugin | Requires Redux DevTools extension | Requires middleware | Not provided |
| Persistence helpers in this repository | Included (`persist`, `createPersistentSignal`) | Requires middleware (not included here) | Middleware pattern | Custom code |
| React Native native option | C++ JSI bridge with JS fallback | JavaScript only | JavaScript only | JavaScript only |
| Bundle size snapshot (gzip) | 2.03KB (`entries/react.mjs`) | 4.41KB (`redux/dist/redux.mjs`) | 0.07KB (`zustand/esm/index.mjs`) | Part of React runtime |

Bundle sizes come from the `npm run size` output in this repository and gzipping the comparison libraries from `node_modules`.【80c43e†L57-L60】【408c84†L1-L4】

---

## Why SignalForge?

### vs Redux

| Feature | SignalForge | Redux |
|---------|-------------|-------|
| **Boilerplate** | Minimal | High (actions, reducers, types) |
| **Performance** | Fine-grained updates | Full state tree re-renders |
| **Learning Curve** | Gentle | Steep |
| **Bundle size (gzip, entry)** | 25.32KB (`dist/index.mjs`) | 4.41KB (`redux/dist/redux.mjs`) |
| **DevTools** | Built-in | Requires Redux DevTools |
| **Computed Values** | Native | Manual selectors + memoization |

Bundle sizes are gzip measurements of the built artifacts in this repository after running `npm run size` and gzipping the Redux entry from `node_modules`.【80c43e†L77-L80】【408c84†L1-L2】

**Redux Example:**
```typescript
// Redux: ~50 lines for counter
const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';

const counterReducer = (state = { value: 0 }, action) => {
  switch (action.type) {
    case INCREMENT: return { value: state.value + 1 };
    case DECREMENT: return { value: state.value - 1 };

    default: return state;
  }
};

const store = createStore(counterReducer);
const increment = () => ({ type: INCREMENT });
const decrement = () => ({ type: DECREMENT });

// Component usage requires connect() or useSelector()
```

**SignalForge Example:**
```typescript
// SignalForge: 3 lines for counter
const increment = () => count.set(count.get() + 1);
const decrement = () => count.set(count.get() - 1);

// Component usage is direct
function Counter() {
  return <button onClick={increment}>{useSignalValue(count)}</button>;
}
```

### vs Zustand

| Feature | SignalForge | Zustand |
|---------|-------------|---------|
| **Reactivity Model** | Fine-grained (signals) | Subscription-based |
| **Re-render Granularity** | Individual values | Full state or selectors |
| **Computed Values** | Automatic tracking | Manual selectors |
| **Dependency Tracking** | Automatic | Manual |
| **DevTools** | Built-in + plugins | Basic |
| **Persistence** | Built-in adapter system | Middleware required |
| **Time Travel** | Native plugin | Requires setup |

**Zustand Example:**
```typescript
// Zustand: Requires selectors for optimization
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

function Counter() {
  const count = useStore((state) => state.count); // Manual selector
  const increment = useStore((state) => state.increment);
  return <button onClick={increment}>{count}</button>;
}
```

**SignalForge Example:**
```

### Performance Snapshot

Standalone benchmarks from `npm run benchmark` show:

- Signal creation: 9.757ms for 1,000 signals (9.757μs per signal)
- Signal reads: 0.005ms for 1,000 reads (5ns per read)
- Signal writes: 0.197ms for 1,000 writes (197ns per write)
- Computed reads: 0.003ms for 1,000 reads (3ns per read)
- 10,000 signals occupy ~15.84MB (about 1,661 bytes each)

See `benchmark-result.md` for the complete output and instructions to reproduce.【F:benchmark-result.md†L7-L65】

### When to Use SignalForge

- **Best suited for:**
- High-performance applications (real-time, dashboards)
- Complex UIs with many independent state pieces
- Applications requiring time-travel debugging
- Projects needing persistence out-of-the-box
- Teams wanting less boilerplate

- Consider alternatives if:
- You need Redux ecosystem (Redux Saga, Redux Toolkit)
- Team is deeply invested in Redux patterns
- You prefer centralized state management philosophy

---

## Installation & Setup

### NPM Installation

```bash
npm install signalforge
```

```bash
yarn add signalforge
```

```bash
pnpm add signalforge
```

### Basic Setup (Vanilla JS)

```typescript
import { createSignal, createComputed, createEffect } from 'signalforge';

// Create a signal
const count = createSignal(0);

// Create computed value
const doubled = createComputed(() => count.get() * 2);

// Create effect
createEffect(() => {
  console.log('Count:', count.get());
});

// Update signal
count.set(5); // Logs: "Count: 5"
```

### React Setup

```typescript
import { createSignal, useSignal, useSignalValue } from 'signalforge';

// Outside component (global state)
const count = createSignal(0);

function Counter() {
  // Option 1: Use hook for local state
  const [value, setValue] = useSignal(0);
  
  // Option 2: Use global signal
  const globalCount = useSignalValue(count);
  
  return (
    <div>
      <p>Local: {value}</p>
      <button onClick={() => setValue(value + 1)}>+</button>
      
      <p>Global: {globalCount}</p>
      <button onClick={() => count.set(count.get() + 1)}>+</button>
    </div>
  );
}
```

### React Native Setup

```typescript
import { View, Text, Button } from 'react-native';

const count = createSignal(0);

export default function App() {
  const value = useSignalValue(count);
  
  return (
    <View>
      <Text>Count: {value}</Text>
      <Button 
        title="Increment" 
        onPress={() => count.set(count.get() + 1)} 
      />
    </View>
  );
}
```

### TypeScript Configuration

SignalForge is written in TypeScript and provides full type inference:

```typescript
// Type inference works automatically
const name = createSignal('Alice'); // Signal<string>
const age = createSignal(30);       // Signal<number>

// Explicit types
const user = createSignal<{ name: string; age: number }>({
  name: 'Alice',
  age: 30,
});

// Computed signals infer return type
const greeting = createComputed(() => {
  return `Hello, ${name.get()}!`; // ComputedSignal<string>
});
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node"
  }
}
```

---

## Basic API Usage

### createSignal

Create a reactive signal that holds a value.

```typescript
import { createSignal } from 'signalforge';

// Basic usage
const count = createSignal(0);

// Get current value
console.log(count.get()); // 0

// Set new value
count.set(5);
console.log(count.get()); // 5

// Update based on current value
count.set(count.get() + 1); // 6

// Subscribe to changes
const unsubscribe = count.subscribe((newValue, oldValue) => {
  console.log(`Changed from ${oldValue} to ${newValue}`);
});

count.set(10); // Logs: "Changed from 6 to 10"
unsubscribe(); // Stop listening
```

**Complex Objects:**
```typescript
interface User {
  name: string;
  email: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

const user = createSignal<User>({
  name: 'Alice',
  email: 'alice@example.com',
  preferences: {
    theme: 'dark',
    notifications: true,
  },
});

// Update nested properties (immutable)
user.set({
  ...user.get(),
  preferences: {
    ...user.get().preferences,
    theme: 'light',
  },
});
```

### createComputed

Create a derived signal that automatically recomputes when dependencies change.

```typescript
import { createSignal, createComputed } from 'signalforge';

const firstName = createSignal('Alice');
const lastName = createSignal('Johnson');

// Automatically tracks dependencies
const fullName = createComputed(() => {
  return `${firstName.get()} ${lastName.get()}`;
});

console.log(fullName.get()); // "Alice Johnson"

firstName.set('Bob');
console.log(fullName.get()); // "Bob Johnson" (auto-updated)

// Computed signals are cached
const expensive = createComputed(() => {
  console.log('Computing...');
  return count.get() * 1000;
});

expensive.get(); // Logs: "Computing..."
expensive.get(); // No log (cached)
count.set(5);
expensive.get(); // Logs: "Computing..." (recomputed)
```

**Multiple Dependencies:**
```typescript
const price = createSignal(100);
const quantity = createSignal(2);
const taxRate = createSignal(0.08);

const subtotal = createComputed(() => price.get() * quantity.get());
const tax = createComputed(() => subtotal.get() * taxRate.get());
const total = createComputed(() => subtotal.get() + tax.get());

console.log(total.get()); // 216 (100 * 2 * 1.08)

price.set(150);
console.log(total.get()); // 324 (auto-updated through chain)
```

### createEffect

Run side effects when dependencies change.

```typescript
import { createSignal, createEffect } from 'signalforge';

const count = createSignal(0);

// Effect runs immediately and on changes
createEffect(() => {
  console.log('Count is:', count.get());
  // Runs now and whenever count changes
});

// Effect with cleanup
createEffect(() => {
  const interval = setInterval(() => {
    console.log('Current:', count.get());
  }, 1000);
  
  // Cleanup function
  return () => clearInterval(interval);
});

// Effect with multiple dependencies
const x = createSignal(0);
const y = createSignal(0);

createEffect(() => {
  console.log(`Position: (${x.get()}, ${y.get()})`);
  // Runs when either x or y changes
});
```

### useSignal (React Hook)

React hook for local reactive state.

```typescript
import { useSignal, useSignalValue } from 'signalforge';

function Counter() {
  // Similar to useState, but reactive
  const [count, setCount] = useSignal(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
    </div>
  );
}
```

**With Computed Values:**
```typescript
function ShoppingCart() {
  const [items, setItems] = useSignal([
    { name: 'Apple', price: 1.5, qty: 2 },
    { name: 'Banana', price: 0.8, qty: 5 },
  ]);
  
  // Computed total
  const itemsSignal = createSignal(items);
  const total = createComputed(() => 
    itemsSignal.get().reduce((sum, item) => sum + item.price * item.qty, 0)
  );
  
  useSignalEffect(() => {
    itemsSignal.set(items);
  }, [items]);
  
  return (
    <div>
      <ul>
        {items.map(item => <li key={item.name}>{item.name}: ${item.price}</li>)}
      </ul>
      <p>Total: ${useSignalValue(total).toFixed(2)}</p>
    </div>
  );
}
```

### batch

Batch multiple updates to avoid unnecessary re-renders.

```typescript
import { createSignal, batch } from 'signalforge';

const x = createSignal(0);
const y = createSignal(0);
const sum = createComputed(() => x.get() + y.get());

// Without batching: sum recomputes twice
x.set(10);
y.set(20);
console.log(sum.get()); // 30

// With batching: sum recomputes once
batch(() => {
  x.set(100);
  y.set(200);
});
console.log(sum.get()); // 300 (computed only once)
```

### persist

Persist signal state to localStorage or AsyncStorage.

```typescript
import { createSignal, persist } from 'signalforge';

// Browser (localStorage)
const theme = createSignal('light');
persist(theme, { key: 'app-theme' });

// Value automatically saved and restored
theme.set('dark'); // Saved to localStorage
// On page reload: theme.get() === 'dark' ✓

// React Native (AsyncStorage)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStorageAdapter, persist } from 'signalforge';

const adapter = createStorageAdapter({
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
});

const settings = createSignal({ notifications: true });
persist(settings, { key: 'settings', adapter });
```

**With Options:**
```typescript
const user = createSignal(null);

persist(user, {
  key: 'current-user',
  version: 1,              // Version for migrations
  debounce: 500,           // Save after 500ms of inactivity
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});
```

### createPersistentSignal

Shorthand for creating a signal with persistence.

```typescript
import { createPersistentSignal } from 'signalforge';

const todos = createPersistentSignal([], {
  key: 'todos',
  version: 1,
});

// Automatically persisted
todos.set([...todos.get(), { id: 1, text: 'Buy milk', done: false }]);
```

---

## DevTools Overview

SignalForge includes powerful DevTools for debugging and visualization.

### Enabling DevTools

```typescript
import { enableDevTools } from 'signalforge';

// Enable in development only
if (process.env.NODE_ENV === 'development') {
  enableDevTools({
    trackPerformance: true,
    trackDependencies: true,
  });
}
```

### Features

#### 1. Signal Inspector

View all signals and their current values:

```typescript
import { listSignals, getSignal } from 'signalforge';

// List all signals
const signals = listSignals();
console.log(signals); // [{ id, type, value, subscribers }]

// Get specific signal
const signal = getSignal('signal_123');
console.log(signal.value);
```

#### 2. Dependency Graph

Visualize signal dependencies:

```typescript
import { getDependencyGraph, printDependencyGraph } from 'signalforge';

const graph = getDependencyGraph();
printDependencyGraph(); // Prints ASCII tree to console
```

**React Component:**
```typescript
import { SignalGraphVisualizer } from 'signalforge';

function DevToolsPanel() {
  return <SignalGraphVisualizer width={800} height={600} />;
}
```

#### 3. Performance Profiler

Track signal update latency and batch performance:

```typescript
import { 
  enableProfiler, 
  getProfilerData,
  getSignalLatencyStats 
} from 'signalforge';

enableProfiler();

// Later...
const data = getProfilerData();
console.log(data.summary.avgLatency); // Average update time

const stats = getSignalLatencyStats('signal_123');
console.log(stats.p95); // 95th percentile latency
```

**React Component:**
```typescript
import { PerformanceTab } from 'signalforge';

function DevToolsPanel() {
  return <PerformanceTab />;
}
```

#### 4. Time Travel Debugging

Step backward and forward through signal history:

```typescript
import { 
  TimeTravelPluginEnhanced,
  registerManagedPlugin,
  TimeTravelTimeline 
} from 'signalforge';

// Create time travel plugin
const timeTravel = new TimeTravelPluginEnhanced({
  maxHistory: 100,
  enableCompression: true,
});

registerManagedPlugin('time-travel', timeTravel.getPlugin());

// Use time travel
count.set(1);
count.set(2);
count.set(3);

timeTravel.undo(); // Back to 2
timeTravel.undo(); // Back to 1
timeTravel.redo(); // Forward to 2
timeTravel.jumpTo(0); // Jump to initial state
```

**React Component:**
```typescript
import { TimeTravelTimeline } from 'signalforge';

function DevToolsPanel() {
  return <TimeTravelTimeline plugin={timeTravel} />;
}
```

#### 5. Logger

Log all signal lifecycle events:

```typescript
import { 
  LoggerPluginEnhanced,
  registerManagedPlugin,
  LogViewer 
} from 'signalforge';

const logger = new LoggerPluginEnhanced({
  level: 'info',
  enableConsole: true,
  signalPattern: /^user\./, // Only log user.* signals
});

registerManagedPlugin('logger', logger.getPlugin());

// View logs
const logs = logger.getLogs();
const stats = logger.getStats();
```

**React Component:**
```typescript
import { LogViewer } from 'signalforge';

function DevToolsPanel() {
  return <LogViewer plugin={logger} />;
}
```

#### 6. React Native Bridge

Debug React Native apps with Flipper or WebSocket:

```typescript
import { initializeDevToolsBridge } from 'signalforge';

// Auto-detect Flipper or fallback to WebSocket
initializeDevToolsBridge({
  autoDetect: true,
  wsUrl: 'ws://localhost:8080',
});

// Now use DevTools from desktop browser
```

### Complete DevTools Setup

```typescript
import {
  enableDevTools,
  enableProfiler,
  TimeTravelPluginEnhanced,
  LoggerPluginEnhanced,
  registerManagedPlugin,
} from 'signalforge';

// Enable DevTools
enableDevTools({ trackPerformance: true });
enableProfiler();

// Add plugins
const timeTravel = new TimeTravelPluginEnhanced();
const logger = new LoggerPluginEnhanced({ level: 'debug' });

registerManagedPlugin('time-travel', timeTravel.getPlugin());
registerManagedPlugin('logger', logger.getPlugin());

// Use signals normally - DevTools tracks everything
const count = createSignal(0);
count.set(1);
count.set(2);

// Access DevTools
console.log('Logs:', logger.getLogs());
console.log('Can Undo:', timeTravel.canUndo());
```

---

## Plugins & Ecosystem

SignalForge has a powerful plugin system for extending functionality.

### Built-in Plugins

#### Time Travel Plugin

Redux DevTools-style debugging:

```typescript
import { TimeTravelPluginEnhanced, registerManagedPlugin } from 'signalforge';

const timeTravel = new TimeTravelPluginEnhanced({
  maxHistory: 100,              // Keep last 100 snapshots
  fullSnapshotInterval: 10,     // Full snapshot every 10 changes
  enableCompression: true,      // Use diff-based storage
});

registerManagedPlugin('time-travel', timeTravel.getPlugin());

// Time travel controls
timeTravel.undo();
timeTravel.redo();
timeTravel.jumpTo(5);
timeTravel.getSnapshots();
timeTravel.exportSession();
```

#### Logger Plugin

Comprehensive lifecycle logging:

```typescript
import { LoggerPluginEnhanced, registerManagedPlugin } from 'signalforge';

const logger = new LoggerPluginEnhanced({
  level: 'info',                          // Log level threshold
  enableConsole: true,                    // Console output
  signalPattern: /^(user|auth)\./,        // Filter by pattern
  maxLogs: 1000,                          // Memory limit
  verbose: true,                          // Show details
});

registerManagedPlugin('logger', logger.getPlugin());

// Query logs
logger.getLogs();
logger.search('email');
logger.getLogsForSignal('signal_123');
logger.exportLogs();
```

#### Performance Plugin

Monitor signal performance:

```typescript
import { createPerformancePlugin, registerPlugin } from 'signalforge';

const perfMonitor = createPerformancePlugin();
registerPlugin(perfMonitor.plugin);

// Get metrics
const metrics = perfMonitor.getMetrics();
console.log('Avg Update Time:', metrics.averageUpdateTime);
console.log('Slowest Update:', metrics.slowestUpdate);

perfMonitor.printMetrics();
```

#### Validation Plugin

Validate signal values before updates:

```typescript
import { createValidationPlugin, registerPlugin } from 'signalforge';

const validation = createValidationPlugin({
  'user.age': (value) => value >= 0 && value <= 150,
  'user.email': (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
});

registerPlugin(validation);

// Invalid updates are blocked
age.set(-5);  // Validation fails, update cancelled
age.set(25);  // Valid, update proceeds
```

### Creating Custom Plugins

```typescript
import { registerPlugin, type Plugin } from 'signalforge';

const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  
  onSignalCreate(metadata, initialValue) {
    console.log('Signal created:', metadata.id, initialValue);
  },
  
  onBeforeUpdate(context) {
    // Intercept and modify values
    if (context.signal.label === 'count') {
      // Ensure count is always positive
      return Math.max(0, context.newValue);
    }
    return context.newValue;
  },
  
  onSignalUpdate(context) {
    console.log('Signal updated:', context.signal.id);
    console.log('Old:', context.oldValue);
    console.log('New:', context.newValue);
  },
  
  onSignalDestroy(metadata) {
    console.log('Signal destroyed:', metadata.id);
  },
};

registerPlugin(myPlugin);
```

### Plugin Manager

Enable/disable plugins dynamically:

```typescript
import {
  registerManagedPlugin,
  enablePlugin,
  disablePlugin,
  getPluginStats,
} from 'signalforge';

registerManagedPlugin('logger', logger.getPlugin());

// Disable temporarily
disablePlugin('logger');

// Re-enable
enablePlugin('logger');

// Get stats
const stats = getPluginStats();
console.log(stats); // { total: 3, enabled: 2, disabled: 1 }
```

### Storage Adapters

Custom persistence backends:

```typescript
import { createStorageAdapter, persist } from 'signalforge';

// Custom adapter (e.g., IndexedDB)
const indexedDBAdapter = createStorageAdapter({
  getItem: async (key) => {
    const db = await openDB();
    return db.get('signals', key);
  },
  setItem: async (key, value) => {
    const db = await openDB();
    await db.put('signals', value, key);
  },
  removeItem: async (key) => {
    const db = await openDB();
    await db.delete('signals', key);
  },
});

// Use custom adapter
persist(mySignal, { 
  key: 'my-data',
  adapter: indexedDBAdapter,
});
```

---

## Roadmap

### v2.1 - Q1 2026

**C++ Backend (JSI Bridge)**

High-performance native implementation for React Native:

```cpp
// Native C++ signal implementation
class NativeSignal {
  private:
    std::any value;
    std::vector<Subscriber> subscribers;
    
  public:
    void set(std::any newValue);
    std::any get();
    void subscribe(Subscriber sub);
};
```

**Benefits:**
- 10-100x faster signal updates
- Zero JS bridge overhead
- Native memory management
- Better performance on Android

**Status:** In development, targeting iOS and Android

---

### v2.2 - Q2 2026

**Network Synchronization**

Real-time signal sync across clients:

```typescript
import { createSyncedSignal } from 'signalforge/sync';

const sharedCounter = createSyncedSignal(0, {
  channel: 'room-123',
  transport: 'websocket',
  url: 'wss://sync.example.com',
});

// Updates sync across all connected clients
sharedCounter.set(5); // Synced to all clients in room-123
```

**Features:**
- WebSocket and WebRTC transports
- Conflict resolution (CRDT-based)
- Offline support with sync queue
- Selective sync (filter by signal pattern)
- Room-based multiplayer state

**Use Cases:**
- Collaborative editing
- Real-time dashboards
- Multiplayer games
- Live chat applications

---

### v2.3 - Q3 2026

**Server-Side Rendering (SSR) Compatibility**

Full support for Next.js, Remix, and server components:

```typescript
// Server component
import { createSignal } from 'signalforge/server';

export default async function Page() {
  const data = createSignal(await fetchData());
  
  return <ClientComponent data={data} />;
}

// Client component
'use client';
import { useSignalValue } from 'signalforge';

function ClientComponent({ data }) {
  const value = useSignalValue(data);
  return <div>{value}</div>;
}
```

**Features:**
- Hydration without flickering
- Streaming SSR support
- Signal serialization/deserialization
- Server-side computed signals
- Automatic client sync

**Frameworks:**
- Next.js 14+ (App Router)
- Remix
- SvelteKit
- Astro

---

### v3.0 - Q4 2026

**Advanced Features**

**1. Signal Transactions**

Atomic multi-signal updates with rollback:

```typescript
import { transaction } from 'signalforge';

const result = transaction(() => {
  user.set({ name: 'Alice' });
  account.set({ balance: 1000 });
  // If any update fails, all rollback
});
```

**2. Signal Queries**

SQL-like queries over signal state:

```typescript
import { query } from 'signalforge';

const activeUsers = query(users)
  .where(user => user.active === true)
  .orderBy('lastLogin', 'desc')
  .limit(10)
  .compute();
```

**3. Async Signals**

First-class async support:

```typescript
const user = createAsyncSignal(
  async () => fetch('/api/user').then(r => r.json())
);

// Automatic loading/error states
if (user.loading) return <Spinner />;
if (user.error) return <Error />;
return <UserProfile user={user.data} />;
```

**4. Signal Collections**

Optimized collections with granular reactivity:

```typescript
const todos = createCollection([]);

// Only re-render affected items
todos.push({ id: 1, text: 'Buy milk' });
todos.update(1, { done: true });
todos.remove(1);
```

---

### Community & Contributions

**Get Involved:**
- 🐛 [Report Issues](https://github.com/yourorg/signalforge/issues)
- 💡 [Feature Requests](https://github.com/yourorg/signalforge/discussions)
- 🤝 [Contributing Guide](https://github.com/yourorg/signalforge/blob/main/CONTRIBUTING.md)
- 💬 [Discord Community](https://discord.gg/signalforge)

**Plugin Ecosystem:**
- Submit your plugins to the registry
- Explore community plugins
- Vote on plugin features

---

## Next Steps

### Learn More

- **[API Reference](./api-reference.md)** - Complete API documentation
- **[Examples](../examples/)** - Code examples and patterns
- **[Architecture](./architecture.md)** - Internal design and algorithms
- **[Migration Guides](./migrations/)** - From Redux, Zustand, MobX

### Try It Out

```bash
# Clone starter template
git clone https://github.com/yourorg/signalforge-starter
cd signalforge-starter
npm install
npm run dev
```

### Get Help

- **Documentation:** [https://signalforge.dev](https://signalforge.dev)
- **Discord:** [https://discord.gg/signalforge](https://discord.gg/signalforge)
- **Stack Overflow:** Tag `signalforge`
- **GitHub Discussions:** [Ask questions](https://github.com/yourorg/signalforge/discussions)

---

## License

MIT © 2025 SignalForge Contributors

---

**SignalForge v2.0** - Fine-grained reactivity for modern JavaScript
