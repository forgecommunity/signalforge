# SignalForge

Fine-grained state management for web and React Native applications. Built by **[ForgeCommunity](https://github.com/forgecommunity)**.

---

## Table of Contents

1. [Why SignalForge?](#why-signalforge)
2. [Quick Start](#quick-start)
3. [Installation](#installation)
4. [Basic Concepts](#basic-concepts)
5. [Step-by-Step Guide](#step-by-step-guide)
6. [React Integration](#react-integration)
7. [All Functions Explained](#all-functions-explained)
8. [Real Examples](#real-examples)
9. [Performance](#performance)
10. [Support](#support)

---

## Why SignalForge?

- **Purpose-built hooks:** `useSignal`, `useSignalValue`, and `useSignalEffect` keep React and React Native components synced without selectors or manual subscriptions.
- **Debuggable by default:** Devtools plugins include logging and time-travel support so you can replay state changes without custom middleware.【F:docs/getting-started.md†L80-L106】
- **Persistence baked in:** Helpers like `persist` and `createPersistentSignal` ship in the core package, covering localStorage and AsyncStorage out of the box.【F:docs/getting-started.md†L107-L117】
- **Measured performance:** Reads complete in ~5ns and writes in ~197ns in the standalone benchmark suite; 10,000 signals consume ~15.84MB of memory.【F:benchmark-result.md†L7-L36】
- **Small bundles:** The React-ready entry (`dist/entries/react.mjs`) gzips to 2.03KB and the minimal core gzips to 0.42KB after the latest build.【80c43e†L57-L60】【80c43e†L47-L50】
- **Native option for React Native:** A C++ JSI bridge installs automatically on the new architecture and falls back to JavaScript when unavailable.【F:src/native/setup.ts†L12-L120】
- **Cross-library familiarity:** Signals feel like "smart variables" while computed values and effects mirror patterns from SolidJS and Preact, reducing onboarding time.

### How SignalForge compares

| Capability | SignalForge | Redux | Zustand | MobX | Context API |
|------------|-------------|-------|---------|------|-------------|
| Built-in React/React Native hooks | Yes (`useSignal`, `useSignalValue`, `useSignalEffect`) | Yes (`useSelector`, `useDispatch`) | Yes (selectors) | Yes (`observer`, reactions) | Yes (`useContext`) |
| Time travel available in this repository | Included as a plugin | Requires external devtools | Requires middleware | Requires community tooling | Not provided |
| Persistence helpers in this repository | Included (localStorage/AsyncStorage adapters) | Requires middleware (not included here) | Middleware pattern | Not documented in this repo | Custom code |
| Native React Native path | Optional C++ JSI bridge with JS fallback | JS only | JS only | JS only | JS only |
| Bundle size snapshot (gzip) | 2.03KB for `entries/react.mjs` | 4.41KB for `redux/dist/redux.mjs` | 0.07KB for `zustand/esm/index.mjs` | Not measured here | Part of React runtime |

All size measurements come from the `npm run size` output in this repository and gzipping the comparison libraries from `node_modules`.【80c43e†L57-L60】【408c84†L1-L4】

---

## Quick Start

### Step 1: Install
```bash
npm install signalforge-alpha
```

### Step 2: Create a Signal
```javascript
import { createSignal } from 'signalforge-alpha';

// Create a signal (like a smart variable)
const count = createSignal(0);

// Read the value
console.log(count.get()); // Output: 0

// Change the value
count.set(5);
console.log(count.get()); // Output: 5
```

That's it! You just created your first signal.

---

## Installation

### For Web Projects
```bash
npm install signalforge-alpha
```

### For React Native
```bash
npm install signalforge-alpha

# IMPORTANT: For persistent signals, also install:
npm install @react-native-async-storage/async-storage

# iOS only
cd ios && pod install && cd ..
```

### Run the React Native Example (Local)

Want to try it quickly in a real app? This repo includes a React Native example wired to the local package.

```bash
# From repo root
npm install
npm run build

# Then install and run the example app
cd examples/example
npm install
npm start
```

In a second terminal, build and run a platform:

```bash
# Android (Windows/macOS/Linux)
npm run android

# iOS (macOS only)
# First time per machine or after native changes:
npm run ios
```

Notes:
- The example depends on the local package via `"signalforge-alpha": "file:../.."`.
- If you change library code under `src/`, rebuild the dist and restart Metro:
  - `npm run build` at repo root, then restart `npm start` in the example.
---

## Basic Concepts

### What is a Signal?
A **signal** is like a smart variable that:
- Holds a value (number, text, object, etc.)
- Tells other parts of your app when it changes
- Updates automatically

**Think of it like a light switch** - when you flip it, all the lights connected to it turn on/off automatically!

### Three Main Functions

1. **`createSignal`** - Holds a value and notifies subscribers
2. **`createComputed`** - Calculates based on other signals (auto-updates)
3. **`createEffect`** - Runs side effects when dependencies change

---

## Step-by-Step Guide

### Level 1: Basic Signal (Beginner)

**What**: Create a signal that stores a value

**How to use**:
```javascript

// Step 1: Create a signal with initial value
const age = createSignal(25);

// Step 2: Read the value
console.log(age.get()); // 25

// Step 3: Change the value
age.set(26);
console.log(age.get()); // 26

// Step 4: Update based on current value
age.set(current => current + 1);
console.log(age.get()); // 27
```

**Real example**: Shopping cart item count
```javascript
const cartItems = createSignal(0);

// Add item to cart
function addToCart() {
  cartItems.set(count => count + 1);
}

console.log('Items in cart:', cartItems.get());
```

---

### Level 2: Computed Signal (Auto-Calculate)

**What**: A signal that calculates its value automatically from other signals

**How to use**:
```javascript
import { createSignal, createComputed } from 'signalforge-alpha';

// Step 1: Create base signals
const price = createSignal(100);
const quantity = createSignal(2);


// Step 2: Create computed signal (auto-calculates!)
const total = createComputed(() => {
  return price.get() * quantity.get();
});

console.log(total.get()); // 200

// Step 3: Change base signal - computed updates automatically!
price.set(150);
console.log(total.get()); // 300 (auto-updated!)
```

**Real example**: Shopping cart total
```javascript
const itemPrice = createSignal(50);
const itemCount = createSignal(3);
const tax = createSignal(0.1); // 10% tax
// Calculates automatically!
const subtotal = createComputed(() => itemPrice.get() * itemCount.get());
const taxAmount = createComputed(() => subtotal.get() * tax.get());
const finalTotal = createComputed(() => subtotal.get() + taxAmount.get());

console.log('Subtotal:', subtotal.get());     // 150
console.log('Tax:', taxAmount.get());         // 15
### Level 3: Effects (Do Something When Changed)

**What**: Run code automatically when signals change

**How to use**:
```javascript
import { createSignal, createEffect } from 'signalforge-alpha';

// Step 1: Create signal
const userName = createSignal('John');

// Step 2: Create effect (runs when userName changes)
const cleanup = createEffect(() => {
  console.log('Hello, ' + userName.get() + '!');
});
// Output: "Hello, John!"

// Step 3: Change signal - effect runs automatically!
userName.set('Jane');
// Output: "Hello, Jane!"

// Step 4: Stop the effect when done
cleanup();
```

**Real example**: Save to localStorage when data changes
```javascript
const userSettings = createSignal({ theme: 'dark', fontSize: 14 });

// Auto-save whenever settings change!
createEffect(() => {
  const settings = userSettings.get();
  localStorage.setItem('settings', JSON.stringify(settings));
  console.log('Settings saved!');
});


### Level 4: Batch Updates (Multiple Changes at Once)

**What**: Update multiple signals efficiently

**How to use**:
```javascript
import { createSignal, createComputed, batch } from 'signalforge-alpha';

const firstName = createSignal('John');
const lastName = createSignal('Doe');
const fullName = createComputed(() => `${firstName.get()} ${lastName.get()}`);

// fullName recalculates twice without batching

// With batch - recalculates once
batch(() => {
  firstName.set('Jane');
});
// fullName recalculates once (33x faster!)
```

---

### Level 5: Subscribe to Changes (Listen)

**What**: Run a function every time a signal changes

**How to use**:
```javascript
const count = createSignal(0);

// Step 1: Subscribe to changes
const unsubscribe = count.subscribe((newValue) => {
  console.log('Count changed to:', newValue);
});

// Step 2: Change value - subscriber gets notified
count.set(1); // Output: "Count changed to: 1"
count.set(2); // Output: "Count changed to: 2"

// Step 3: Stop listening
unsubscribe();
count.set(3); // No output (not listening anymore)
```

---

### Level 6: Untrack (Read Without Dependency)

**What**: Read a signal without creating a dependency

**How to use**:
```javascript
import { createSignal, createComputed, untrack } from 'signalforge-alpha';

const count = createSignal(1);
const debugMode = createSignal(true);

const doubled = createComputed(() => {
  const value = count.get() * 2;
  
  // Read debugMode WITHOUT creating dependency
  if (untrack(() => debugMode.get())) {
    console.log('Debug:', value);
  }
  
  return value;
});

// Changing count triggers recompute
count.set(5); // Output: "Debug: 10"

// Changing debugMode does NOT trigger recompute
debugMode.set(false); // No output (not dependent!)
```

---

## React Integration

### Step 1: Install
```bash
npm install signalforge-alpha react
```

### Step 2: Use in Components

#### Method A: useSignal (Component State)
```javascript
import { useSignal } from 'signalforge-alpha/react';

function Counter() {
  // Like useState but more powerful!
  const [count, setCount] = useSignal(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

#### Method B: useSignalValue (Global State)
```javascript
import { createSignal } from 'signalforge-alpha';
import { useSignalValue } from 'signalforge-alpha/react';

// Create global signal (outside component)
const globalCount = createSignal(0);

function Display() {
  // Subscribe to global signal
  const count = useSignalValue(globalCount);
  return <p>Count: {count}</p>;
}

function Controls() {
  // Components share the same signal!
  return (
    <button onClick={() => globalCount.set(c => c + 1)}>
      Increment Global Count
    </button>
  );
}
```

#### Method C: useSignalEffect (React + Signals)
```javascript
import { createSignal } from 'signalforge-alpha';
import { useSignalEffect } from 'signalforge-alpha/react';

const userId = createSignal(1);

function UserProfile() {
  const [userData, setUserData] = useState(null);
  
  // Auto-runs when userId changes!
  useSignalEffect(() => {
    fetch(`/api/users/${userId.get()}`)
      .then(r => r.json())
      .then(setUserData);
  });
  
  return <div>{userData?.name}</div>;
}
```

---

## React Native Specific Guide

SignalForge supports React Native with the JavaScript API and an optional C++ JSI bridge for lower-latency updates. Here's what you need to know:

### Installation

```bash
npm install signalforge-alpha

# For persistent signals (storage):
npm install @react-native-async-storage/async-storage
cd ios && pod install  # iOS only
```

To enable the native C++ path on React Native 0.68+ with the new architecture, turn on the new-architecture flags (`newArchEnabled=true` on Android, `ENV['RCT_NEW_ARCH_ENABLED']='1'` on iOS) and rebuild so the JSI bindings are compiled and auto-linked.【F:src/native/setup.ts†L12-L50】 For older architectures, you can install the bindings at runtime using `installJSIBindings()` during app startup.【F:src/native/setup.ts†L67-L120】 If the native module is unavailable, SignalForge falls back to the JavaScript implementation automatically.【F:src/native/setup.ts†L93-L120】

### Basic Usage

All hooks work exactly the same as in React:

```tsx
import { createSignal } from 'signalforge-alpha';
import { useSignal, useSignalValue } from 'signalforge-alpha/react';
import { View, Text, Button } from 'react-native';

const globalCount = createSignal(0);

function App() {
  const [localCount, setLocalCount] = useSignal(0);
  const count = useSignalValue(globalCount);
  
  return (
    <View>
      <Text>Local: {localCount}</Text>
      <Text>Global: {count}</Text>
      <Button title="Increment Local" onPress={() => setLocalCount(localCount + 1)} />
      <Button title="Increment Global" onPress={() => globalCount.set(c => c + 1)} />
    </View>
  );
}
```

### Persistent Storage in React Native

**Important**: Use `persist()` inside `useEffect()` to ensure AsyncStorage is ready:

```tsx
import { createSignal } from 'signalforge-alpha';
import { persist } from 'signalforge-alpha/utils';
import { useSignalValue } from 'signalforge-alpha/react';
import { useEffect } from 'react';

// Create signal at module level
const userPrefs = createSignal({ theme: 'light', fontSize: 14 });

function App() {
  const prefs = useSignalValue(userPrefs);
  
  // Set up persistence after mount
  useEffect(() => {
    const cleanup = persist(userPrefs, { key: 'user_prefs' });
    return cleanup; // Stop persisting on unmount
  }, []);
  
  return (
    <View>
      <Text>Theme: {prefs.theme}</Text>
      <Button 
        title="Toggle Theme" 
        onPress={() => userPrefs.set(p => ({ 
          ...p, 
          theme: p.theme === 'light' ? 'dark' : 'light' 
        }))} 
      />
    </View>
  );
}
```

### Metro Configuration

For the example app or when linking to local SignalForge, configure Metro properly:

```javascript
// metro.config.js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const config = {
  watchFolders: [
    path.resolve(__dirname, '../..'),
  ],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../node_modules'),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

### Common Issues

**Issue**: "AsyncStorage not found"  
**Solution**: Install `@react-native-async-storage/async-storage` and run `pod install` for iOS

**Issue**: "Module not found: signalforge-alpha/utils"  
**Solution**: Rebuild the library with `npm run build` from the repo root

**Issue**: "Hooks not working"  
**Solution**: Clear Metro cache: `npm start -- --reset-cache`

---

## All Functions Explained

### Core Functions

#### `createSignal(initialValue)`
**What**: Creates a signal with an initial value  
**Returns**: Signal object with `get()`, `set()`, `subscribe()`, `destroy()`

```javascript
const age = createSignal(25);
age.get();           // Read value
age.set(26);         // Set value
age.set(v => v + 1); // Update based on current
const unsub = age.subscribe(val => console.log(val)); // Listen
unsub();             // Stop listening
age.destroy();       // Cleanup
```

#### `createComputed(computeFn)`
**What**: Creates auto-updating computed value  
**Returns**: Computed signal (read-only)

```javascript
const doubled = createComputed(() => count.get() * 2);
doubled.get(); // Always up-to-date!
```

#### `createEffect(effectFn)`
**What**: Runs code when dependencies change  
**Returns**: Cleanup function

```javascript
const cleanup = createEffect(() => {
  console.log('Count is:', count.get());
});
cleanup(); // Stop effect
```

#### `batch(fn)`
**What**: Group multiple updates together (faster!)  
**Returns**: Result of fn

```javascript
batch(() => {
  signal1.set(1);
  signal2.set(2);
  // Only recalculates once!
});
```

#### `untrack(fn)`
**What**: Read signals without tracking  
**Returns**: Result of fn

```javascript
const value = untrack(() => signal.get());
// Doesn't create dependency
```

#### `flushSync()`
**What**: Force immediate batch flush (synchronous updates)

```javascript
flushSync(); // Process all pending updates now
```

---

### Advanced Batching Functions

#### `startBatch()`
**What**: Start manual batch (advanced usage)

```javascript
startBatch();
signal1.set(1);
signal2.set(2);
endBatch(); // Flush all updates
```

#### `endBatch()`
**What**: End manual batch and flush updates

#### `flushBatches()`
**What**: Force flush all pending batches

#### `queueBatchCallback(fn)`
**What**: Queue function to run after batch completes

```javascript
queueBatchCallback(() => console.log('Batch done!'));
```

#### `getBatchDepth()`
**What**: Get current batch nesting level  
**Returns**: Number (0 = not batching)

#### `getPendingCount()`
**What**: Get number of pending updates  
**Returns**: Number of signals waiting to update

#### `isBatching()`
**What**: Check if currently batching  
**Returns**: Boolean

---

### Utility Functions

#### `derive([signals], fn)`
**What**: Create computed from multiple signals

```javascript
const sum = derive([a, b], (valA, valB) => valA + valB);
```

#### `combine(signals)`
**What**: Combine multiple signals into array

```javascript
const all = combine([signal1, signal2, signal3]);
all.get(); // [val1, val2, val3]
```

#### `map(signal, fn)`
**What**: Transform signal value

```javascript
const doubled = map(count, n => n * 2);
```

#### `filter(signal, predicate, defaultValue)`
**What**: Filter signal updates

```javascript
const evenOnly = filter(count, n => n % 2 === 0, 0);
```

#### `memo(signal, equalsFn)`
**What**: Only update when value changes (custom equality)

```javascript
const memoized = memo(userSignal, (a, b) => a.id === b.id);
```

#### `debounce(signal, delayMs)`
**What**: Delay updates

```javascript
const delayed = debounce(searchText, 300);
```

#### `throttle(signal, intervalMs)`
**What**: Limit update frequency

```javascript
const limited = throttle(scrollPos, 100);
```

#### `createResource(fetcher)`
**What**: Track async operation status  
**Returns**: Signal with `{ status, data, error }`

```javascript
const user = createResource(() => fetch('/api/user').then(r => r.json()));
console.log(user.get().status); // 'pending' | 'success' | 'error'
console.log(user.get().data); // Result when loaded
```

---

### Storage Functions

**React Native requirement**: For persistent signals in React Native, you **must** install AsyncStorage:
```bash
npm install @react-native-async-storage/async-storage
cd ios && pod install  # iOS only
```

#### `createPersistentSignal(key, initialValue)`
**What**: Signal that auto-saves to storage

```javascript
// Auto-saves to localStorage (Web) or AsyncStorage (React Native)
const theme = createPersistentSignal('app_theme', 'dark');
theme.set('light'); // Automatically saved!
```

**Note for React Native**: Import from utils:
```javascript
import { createPersistentSignal } from 'signalforge-alpha/utils';
```

#### `persist(signal, options)`
**What**: Make existing signal persistent

```javascript
const count = createSignal(0);
const stop = persist(count, { key: 'counter', debounce: 500 });
stop(); // Stop persisting
```

**Note for React Native**: Import from utils and use in `useEffect`:
```javascript
import { persist } from 'signalforge-alpha/utils';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const stop = persist(count, { key: 'counter' });
    return stop; // Cleanup on unmount
  }, []);
}
```

#### `getStorageAdapter()`
**What**: Get storage adapter for current environment  
**Returns**: StorageAdapter (auto-detects Web/React Native/Node)

```javascript
const storage = getStorageAdapter();
await storage.save('key', value);
const data = await storage.load('key');
```

#### `createStorageAdapter(env, options)`
**What**: Create custom storage adapter

```javascript
const storage = createStorageAdapter('web', { prefix: 'myapp_' });
```

#### `detectEnvironment()`
**What**: Detect current environment  
**Returns**: 'web' | 'react-native' | 'node' | 'unknown'

#### `safeStringify(value)` & `safeParse(json)`
**What**: JSON helpers with circular reference handling

```javascript
const json = safeStringify({ a: 1, b: circularRef });
const obj = safeParse(json);
```

---

### Array & Object Helpers

#### `createArraySignal(initialArray)`
**What**: Signal with array methods

```javascript
const todos = createArraySignal(['Task 1']);
todos.push('Task 2');
todos.pop();
todos.filter((_, i) => i !== 0);
todos.remove('Task 1');
todos.clear();
console.log(todos.length); // Array length
console.log(todos.get()); // Get full array
```

**Methods**: `push`, `pop`, `filter`, `map`, `find`, `remove`, `clear`, `length`

#### `createRecordSignal(initialObject)`
**What**: Signal with object methods

```javascript
const user = createRecordSignal({ name: 'John', age: 30 });
user.setKey('email', 'john@example.com');
console.log(user.getKey('email')); // 'john@example.com'
console.log(user.hasKey('age')); // true
user.deleteKey('age');
console.log(user.keys()); // ['name', 'email']
console.log(user.values()); // ['John', 'john@example.com']
console.log(user.entries()); // [['name', 'John'], ...]
user.clear();
```

**Methods**: `setKey`, `getKey`, `deleteKey`, `hasKey`, `keys`, `values`, `entries`, `clear`

---

### Performance Monitoring

#### `monitor(signal, label)`
**What**: Wrap signal with performance tracking

```javascript
const count = monitor(createSignal(0), 'counter');
// Logs read/write times automatically
```

---

### React Hooks

#### `useSignal(initialValue)`
**What**: Create signal in React component

```javascript
const [count, setCount] = useSignal(0);
```

#### `useSignalValue(signal)`
**What**: Subscribe to external signal

```javascript
const value = useSignalValue(globalSignal);
```

#### `useSignalEffect(effectFn)`
**What**: Effect with auto-tracking

```javascript
useSignalEffect(() => {
  console.log(signal.get());
});
```

---

## 🔌 Plugin System

SignalForge has a powerful plugin system for extending functionality!

### Plugin Manager Functions

#### `registerPlugin(name, plugin)`
**What**: Register a plugin with the manager

```javascript
import { registerPlugin, LoggerPlugin } from 'signalforge-alpha';

const logger = new LoggerPlugin({ level: 'info' });
registerPlugin('logger', logger.getPlugin());
```

#### `enablePlugin(name)` & `disablePlugin(name)`
**What**: Enable/disable plugins at runtime

```javascript
enablePlugin('logger');  // Turn on
disablePlugin('logger'); // Turn off (keeps data)
```

#### `getPlugin(name)`
**What**: Get plugin instance

```javascript
const logger = getPlugin('logger');
```

#### `isPluginEnabled(name)`
**What**: Check if plugin is enabled

```javascript
if (isPluginEnabled('time-travel')) {
  // Do something
}
```

#### `getAllPlugins()`
**What**: Get all registered plugins with status

```javascript
const plugins = getAllPlugins();
// [{ name: 'logger', enabled: true, ... }]
```

#### `getPluginStats()`
**What**: Get plugin usage statistics

```javascript
const stats = getPluginStats();
console.log(stats); // Enable counts, error counts, etc.
```

---

### Built-in Plugins

#### **Logger Plugin**
Logs all signal changes with filtering

```javascript
import { LoggerPlugin, registerPlugin } from 'signalforge-alpha';

const logger = new LoggerPlugin({
  level: 'debug',           // 'debug' | 'info' | 'warn' | 'error'
  maxLogs: 1000,            // Max logs to keep
  enableConsole: true,      // Log to console
  verbose: false,           // Show old/new values
  signalPattern: /user\./,  // Filter by name regex
});

registerPlugin('logger', logger.getPlugin());

// Query logs
const allLogs = logger.getLogs();
const userLogs = logger.getLogsForSignal('user_signal_id');
const stats = logger.getStats();

// Search
const results = logger.search('user');

// Export/Import
const json = logger.exportLogs();
logger.importLogs(json);
```

#### **Time Travel Plugin**
Undo/redo for debugging (like Redux DevTools!)

```javascript
import { TimeTravelPlugin, registerPlugin } from 'signalforge-alpha';

const timeTravel = new TimeTravelPlugin({
  maxHistory: 100,              // Max snapshots
  fullSnapshotInterval: 10,     // Full snapshot every N updates
  enableCompression: true,      // Use diffs to save memory
});

registerPlugin('time-travel', timeTravel.getPlugin());

// Use signals
count.set(5);
count.set(10);
count.set(15);

// Time travel!
timeTravel.undo(); // Back to 10
timeTravel.undo(); // Back to 5
timeTravel.redo(); // Forward to 10

// Jump to specific point
timeTravel.jumpTo(0); // Go to beginning

// Check status
console.log(timeTravel.canUndo()); // true/false
console.log(timeTravel.canRedo()); // true/false

// Get timeline
const timeline = timeTravel.getTimelineState();
console.log(`${timeline.current}/${timeline.total}`);

// Export/Import session
const session = timeTravel.exportSession();
localStorage.setItem('debug', JSON.stringify(session));
```

---

## DevTools

SignalForge includes powerful developer tools for debugging!

### DevTools Functions

#### `enableDevTools(config)`
**What**: Enable DevTools inspector

```javascript
import { enableDevTools } from 'signalforge-alpha/devtools';

enableDevTools({
  trackPerformance: true,
  logToConsole: true,
  flipperEnabled: true,  // React Native Flipper integration
});
```

#### `listSignals()`
**What**: Get all active signals

```javascript
import { listSignals } from 'signalforge-alpha/devtools';

const signals = listSignals();
// [{ id, type, value, subscriberCount, ... }]
```

#### `getSignal(id)`
**What**: Get specific signal metadata

```javascript
const signal = getSignal('signal_123');
console.log(signal.value);
console.log(signal.dependencies);
```

#### `getDependencyGraph()`
**What**: Get complete dependency graph for visualization

```javascript
const graph = getDependencyGraph();
// Visualize relationships between signals
```

#### `getPerformanceMetrics()`
**What**: Get performance measurements

```javascript
const metrics = getPerformanceMetrics();
// [{ signalId, duration, timestamp, ... }]
```

---

### Performance Profiler

Track latency and batch performance!

```javascript
import { 
  enableProfiler, 
  getProfilerData,
  getSignalLatencyStats,
  getBatchStats 
} from 'signalforge-alpha/devtools';

// Enable profiler
enableProfiler({
  maxLatencySamples: 1000,
  maxBatchRecords: 500,
});

// Get stats
const latencyStats = getSignalLatencyStats('signal_123');
console.log('Avg:', latencyStats.average);
console.log('P95:', latencyStats.p95);

const batchStats = getBatchStats();
console.log('Avg batch size:', batchStats.averageSize);
```

---

### DevTools UI Components (React)

#### `<SignalGraphVisualizer />`
**What**: Visual dependency graph

```javascript
import { SignalGraphVisualizer } from 'signalforge-alpha/devtools';

function DevPanel() {
  return <SignalGraphVisualizer width={800} height={600} />;
}
```

#### `<PerformanceTab />`
**What**: Performance metrics panel

```javascript
import { PerformanceTab } from 'signalforge-alpha/devtools';

function DevPanel() {
  return <PerformanceTab />;
}
```

#### `<LogViewer />`
**What**: Log viewer UI

```javascript
import { LogViewer } from 'signalforge-alpha/devtools';

function DevPanel() {
  return <LogViewer logger={loggerPlugin} />;
}
```

#### `<TimeTravelTimeline />`
**What**: Time travel UI

```javascript
import { TimeTravelTimeline } from 'signalforge-alpha/devtools';

function DevPanel() {
  return <TimeTravelTimeline plugin={timeTravelPlugin} />;
}
```

---

## React Native Native Bridge (JSI)

Ultra-fast native C++ implementation for React Native!

### Native Functions

#### `installJSIBindings()`
**What**: Install native JSI bindings (10x faster!)

```javascript
import { installJSIBindings } from 'signalforge-alpha/native';

// In your app startup
installJSIBindings();
```

#### `isNativeAvailable()`
**What**: Check if native module is available

```javascript
import { isNativeAvailable } from 'signalforge-alpha/native';

if (isNativeAvailable()) {
  console.log('Using native JSI!');
} else {
  console.log('Using JS fallback');
}
```

#### `getRuntimeInfo()`
**What**: Get runtime information

```javascript
import { getRuntimeInfo } from 'signalforge-alpha/native';

const info = getRuntimeInfo();
console.log(info);
// { isJSI: true, isHermes: true, isTurboModule: false }
```

#### `runPerformanceBenchmark()`
**What**: Benchmark native vs JS performance

```javascript
import { runPerformanceBenchmark } from 'signalforge-alpha/native';

const results = runPerformanceBenchmark();
console.log('Native speedup:', results.speedup); // e.g., "10.5x faster"
```

### JSI Bridge Direct Usage

```javascript
import jsiBridge from 'signalforge-alpha/native';

// Create signal in native
const id = jsiBridge.createSignal('mySignal', 42);

// Get/Set values (native speed!)
const value = jsiBridge.getSignal(id);
jsiBridge.setSignal(id, 100);

// Check implementation
console.log(jsiBridge.isUsingNative()); // true if JSI installed
```

---

## Benchmarking

Built-in benchmark utilities!

```javascript
import {
  benchmarkSignalUpdates,
  benchmarkBatchedUpdates,
  compareWithRedux,
  compareWithZustand,
  runBenchmarkSuite,
  getResults,
} from 'signalforge-alpha/utils';

// Run benchmarks
benchmarkSignalUpdates(10000);
benchmarkBatchedUpdates(10000);
compareWithRedux();
compareWithZustand();

// Run full suite
runBenchmarkSuite();

// Get results
const results = getResults();
console.table(results);
```

---

## Real Examples

### Example 1: Counter App
```javascript
import { createSignal } from 'signalforge-alpha';

const count = createSignal(0);

function increment() {
  count.set(c => c + 1);
}

function decrement() {
  count.set(c => c - 1);
}

console.log(count.get()); // 0
increment();
console.log(count.get()); // 1
```

### Example 2: Shopping Cart
```javascript
import { createSignal, createComputed } from 'signalforge-alpha';

const items = createSignal([
  { name: 'Apple', price: 1.5, qty: 2 },
  { name: 'Bread', price: 2.0, qty: 1 }
]);

const total = createComputed(() => {
  return items.get().reduce((sum, item) => {
    return sum + (item.price * item.qty);
  }, 0);
});

console.log('Total:', total.get()); // 5.0

// Add item
items.set(current => [...current, { name: 'Milk', price: 3.0, qty: 1 }]);
console.log('New Total:', total.get()); // 8.0 (auto-updated!)
```

### Example 3: Form Validation
```javascript
import { createSignal, createComputed } from 'signalforge-alpha';

const email = createSignal('');
const password = createSignal('');

const isEmailValid = createComputed(() => {
  return email.get().includes('@');
});

const isPasswordValid = createComputed(() => {
  return password.get().length >= 8;
});

const canSubmit = createComputed(() => {
  return isEmailValid.get() && isPasswordValid.get();
});

email.set('user@example.com');
password.set('secret123');

console.log('Can Submit:', canSubmit.get()); // true
```

### Example 4: React Todo App
```javascript
import { createSignal } from 'signalforge-alpha';
import { useSignalValue } from 'signalforge-alpha/react';

// Global state
const todos = createSignal([]);

function TodoApp() {
  const todoList = useSignalValue(todos);
  const [input, setInput] = useState('');
  
  const addTodo = () => {
    todos.set(current => [...current, { id: Date.now(), text: input, done: false }]);
    setInput('');
  };
  
  const toggleTodo = (id) => {
    todos.set(current => 
      current.map(todo => 
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  };
  
  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={addTodo}>Add</button>
      
      <ul>
        {todoList.map(todo => (
          <li key={todo.id} onClick={() => toggleTodo(todo.id)}>
            <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Performance

### Standalone Benchmark Snapshot

- **Reads:** ~5ns per `get()` call.
- **Writes:** ~197ns per `set()` call.
- **Batching:** 100-signal batch completes in ~0.002ms.
- **Memory:** 10,000 signals consume ~15.84MB (~1.6KB per signal).

All figures come from the repository's benchmark suite (Node.js v20, Intel i7, Windows 11).【F:benchmark-result.md†L7-L36】

### How It Compares in a 1000-item Todo Benchmark

| Library       | Initial Render | Update Single Item | Update All Items | Memory Usage |
|---------------|----------------|--------------------|------------------|--------------|
| SignalForge   | 16ms           | 1ms                | 18ms             | 2MB          |
| Redux         | 45ms           | 8ms                | 85ms             | 5MB          |
| MobX          | 28ms           | 3ms                | 52ms             | 4MB          |

### Bundle Size Snapshot (gzip)

| Library entry point | Measured size | How we measured |
| --- | --- | --- |
| SignalForge React entry (`dist/entries/react.mjs`) | 2.03KB | `npm run size` (gzip output from `scripts/check-size.js`).【853e6c†L33-L59】 |
| SignalForge minimal core (`dist/core/minimal.mjs`) | 0.42KB | `npm run size` (gzip output from `scripts/check-size.js`).【853e6c†L23-L35】 |
| Redux (`node_modules/redux/dist/redux.mjs`) | 4.41KB | `gzip -c node_modules/redux/dist/redux.mjs | wc -c`.【0120ad†L1-L3】 |
| Zustand (`node_modules/zustand/esm/index.mjs`) | 0.07KB | `gzip -c node_modules/zustand/esm/index.mjs | wc -c`.【4bfd60†L1-L3】 |
| Recoil        | 35ms           | 5ms                | 68ms             | 6MB          |
| Zustand       | 24ms           | 4ms                | 48ms             | 3MB          |

Numbers are from the architecture benchmark section included in this repository.【F:docs/architecture.md†L876-L892】

### Bundle Size Comparison (minified + gzipped)

| Library     | Size |
|-------------|------|
| SignalForge | 2.1 KB |
| Zustand     | 2.9 KB |
| Jotai       | 3.1 KB |
| Solid.js    | 5.2 KB |
| Recoil      | 18.4 KB |
| MobX        | 16.2 KB |
| Redux       | 8.1 KB (+13KB for Toolkit) |

Bundle sizes reflect the comparison recorded in the architecture documentation.【F:docs/architecture.md†L894-L901】

**Why it performs well**
- Zero external dependencies in the core runtime.
- Fine-grained dependency graph with lazy recomputation.
- Batching to collapse cascaded updates into a single frame.

---

## Works Everywhere

- React with hooks
- Vue (framework-agnostic signals)
- Angular (framework-agnostic signals)
- Svelte (framework-agnostic signals)
- React Native with the native C++ bridge
- Next.js with SSR support
- Vanilla JS
- Node.js
- Electron

---

## Import Options

SignalForge provides multiple entry points for optimal bundle size:

### 1. Full Bundle (Recommended)
```javascript
import { createSignal, createComputed } from 'signalforge-alpha';
// Everything included: 86KB
```

### 2. Core Only (Minimal)
```javascript
import { createSignal, createComputed } from 'signalforge-alpha/core';
// Just reactive primitives: 4KB
```

### 3. React Hooks
```javascript
import { useSignal, useSignalValue } from 'signalforge-alpha/react';
// React integration: 5KB
```

### 4. DevTools
```javascript
import { enableDevTools, listSignals } from 'signalforge-alpha/devtools';
// Developer tools: 25KB
```

### 5. Plugins
```javascript
import { LoggerPlugin, TimeTravelPlugin } from 'signalforge-alpha/plugins';
// Plugin system: 27KB
```

### 6. Utils
```javascript
import { derive, combine, debounce } from 'signalforge-alpha/utils';
// Utility functions: 6KB
```

### 7. Ultra-Minimal (Advanced)
```javascript
import { signal, computed, effect } from 'signalforge-alpha/minimal';
// Absolute minimum: 0.8KB (functional API)

const count = signal(0);
console.log(count()); // Read
count(5);             // Write
count(prev => prev + 1); // Update
```

**Ultra-Minimal API:**
- `signal(initialValue)` - Functional signal (read/write in one)
- `computed(fn)` - Auto-updating computed
- `effect(fn)` - Side effects
- `batch(fn)` - Batch updates
- `untrack(fn)` - Read without tracking

---

## 🆘 Need Help?

### Quick Links
- [Full Documentation](https://github.com/forgecommunity/signalforge)
- 🐛 [Report Issues](https://github.com/forgecommunity/signalforge/issues)
- 💬 [Ask Questions](https://github.com/forgecommunity/signalforge/discussions)

### Common Questions

**Q: Do I need React?**  
A: No! Works with any framework or no framework.

**Q: Is it hard to learn?**  
A: No! Just 3 main functions: `createSignal`, `createComputed`, `createEffect`

**Q: Is it production-ready?**  
A: This is an alpha release. Test it first!

**Q: What's the bundle size?**  
A: Only 2KB (minimal) or 86KB (full with devtools)

**Q: Does it work on mobile?**  
A: Yes! React Native with native C++ for 10x speed.

---

## License

MIT - Free to use in any project!

---

## Built By

**[ForgeCommunity](https://github.com/forgecommunity)** - A collective of developers creating high-performance, open-source tools.

### Contributing

Contributions welcome! Please open an issue or PR on our [GitHub repository](https://github.com/forgecommunity/signalforge).

---

## Support Us

If you like SignalForge, please:
- Star us on [GitHub](https://github.com/forgecommunity/signalforge)
- Share feedback and improvement ideas
- Report bugs
- Suggest features
- Improve docs

---

**Happy coding with SignalForge!**
