# SignalForge API Quick Reference

## 🎯 Core Concepts

### Two Ways to Use Signals in React Components

```typescript
// Method 1: Local component state (like useState)
function Counter() {
  const [count, setCount] = useSignal(0);
  return <Button onPress={() => setCount(count + 1)}>Count: {count}</Button>;
}

// Method 2: Shared global state
const globalCount = createSignal(0);  // Outside component

function Counter() {
  const count = useSignalValue(globalCount);  // Read external signal
  return <Button onPress={() => globalCount.set(globalCount.get() + 1)}>Count: {count}</Button>;
}
```

---

## 📦 Installation

npm install signalforge
```

---

## 🔥 Core APIs

### From `'signalforge'`

#### `createSignal<T>(initialValue: T): Signal<T>`

Create a reactive signal (shared state).

```typescript
const count = createSignal(0);
const user = createSignal({ name: 'John', age: 30 });

// Read
const value = count.get();

// Write
count.set(prev => prev + 1);

// Subscribe to changes
const unsubscribe = count.subscribe(value => console.log(value));

// Cleanup
unsubscribe();

#### `createComputed<T>(fn: () => T): ComputedSignal<T>`

Create derived value that auto-updates.

```typescript
const count = createSignal(0);
const doubled = createComputed(() => count.get() * 2);

console.log(doubled.get());  // 0
count.set(5);
console.log(doubled.get());  // 10 (auto-updated!)
```

#### `createEffect(fn: () => void): () => void`

Run side effects when signals change.

```typescript
const count = createSignal(0);

const cleanup = createEffect(() => {
  console.log('Count is:', count.get());
});

count.set(1);  // Logs: "Count is: 1"
count.set(2);  // Logs: "Count is: 2"

cleanup();  // Stop effect
```

#### `batch<T>(fn: () => T): T`

Batch multiple updates into one.

```typescript
const a = createSignal(1);
const b = createSignal(2);
const sum = createComputed(() => a.get() + b.get());

// Without batch: sum recomputes twice
a.set(10);
b.set(20);

// With batch: sum recomputes once
batch(() => {
  a.set(10);
  b.set(20);
});

```

#### `untrack<T>(fn: () => T): T`

Read signals without creating dependencies.

```typescript
const a = createSignal(1);
const b = createSignal(2);

const computed = createComputed(() => {
  const valA = a.get();                // Tracked
  const valB = untrack(() => b.get()); // NOT tracked
  return valA + valB;
});

a.set(10);  // Triggers recomputation
b.set(20);  // Does NOT trigger recomputation
```

---

## ⚛️ React Hooks

### From `'signalforge/react'`

#### `useSignal<T>(initialValue: T): [T, (value: T | ((prev: T) => T)) => void]`

Create a local signal within a component (like `useState`).

```typescript
function Counter() {
  const [count, setCount] = useSignal(0);
  
  return (
    <View>
      <Text>{count}</Text>
      <Button onPress={() => setCount(count + 1)}>Increment</Button>
      <Button onPress={() => setCount(c => c + 1)}>Increment (functional)</Button>
    </View>
  );
}
```

**When to use:** Local component state that doesn't need to be shared.

#### `useSignalValue<T>(signal: Signal<T>): T`

Read an external signal and re-render when it changes.

```typescript
// Outside component - shared state
const globalCount = createSignal(0);

function Counter() {
  const count = useSignalValue(globalCount);  // Subscribe to external signal
  
  return (
    <View>
      <Text>{count}</Text>
      <Button onPress={() => globalCount.set(globalCount.get() + 1)}>
        Increment
      </Button>
    </View>
  );
}
```

**When to use:** Reading signals created outside the component (shared state).

#### `useSignalEffect(effectFn: () => void | (() => void), deps?: any[]): void`

Run effects that automatically track signal dependencies.

```typescript
function Logger() {
  const count = createSignal(0);
  
  useSignalEffect(() => {
    console.log('Count changed:', count.get());
    // Automatically re-runs when count changes!
  });
  
  // With cleanup
  useSignalEffect(() => {
    const timer = setInterval(() => console.log(count.get()), 1000);
    return () => clearInterval(timer);  // Cleanup
  });
  
  return <Button onPress={() => count.set(count.get() + 1)}>Increment</Button>;
}
```

**Features:**
- ✅ Auto-tracks signal dependencies
- ✅ No manual dependency array needed
- ✅ Cleanup support
- ✅ Prevents infinite loops

---

## 🔌 Plugins

### From `'signalforge/plugins'`

#### Logger Plugin

Log all signal changes automatically.

```typescript
import { registerPlugin } from 'signalforge/plugins';
if (__DEV__) {
  const logger = new LoggerPlugin({ 
    verbose: true,
}

// Now all signal changes are logged!

Undo/redo functionality.

const timeTravel = new TimeTravelPlugin({ 
});
registerPlugin('timeTravel', timeTravel);

// Use anywhere
timeTravel.undo();  // Go back
timeTravel.redo();  // Go forward
timeTravel.canUndo();  // Check if can undo
timeTravel.canRedo();  // Check if can redo
```

#### Persistence

Auto-save signals to AsyncStorage (React Native) or localStorage (Web).

```typescript
import { persist, createPersistentSignal } from 'signalforge/plugins';

// Method 1: Make existing signal persistent
const count = createSignal(0);
persist(count, { 
  key: 'counter',
  debounce: 500  // Save at most once per 500ms
});

// Method 2: Create persistent signal
const theme = createPersistentSignal('app-theme', 'light');
theme.set('dark');  // Automatically saved!
```

---

## 🛠️ Utilities

### From `'signalforge/utils'`

#### `derive<T, R>(signals: Signal<T>[], deriveFn: (...values: T[]) => R): ComputedSignal<R>`

Combine multiple signals.

```typescript
const x = createSignal(2);
const y = createSignal(3);
const sum = derive([x, y], (a, b) => a + b);

console.log(sum.get());  // 5
```

#### `map<T, R>(signal: Signal<T>, mapFn: (value: T) => R): ComputedSignal<R>`

Transform a signal's value.

```typescript
const count = createSignal(5);
const doubled = map(count, n => n * 2);

console.log(doubled.get());  // 10
```

#### `filter<T>(signal: Signal<T>, predicate: (value: T) => boolean, defaultValue: T): ComputedSignal<T>`

Filter signal updates.

```typescript
const num = createSignal(5);
const evenOnly = filter(num, n => n % 2 === 0, 0);

console.log(evenOnly.get());  // 0 (5 is odd)
num.set(8);
console.log(evenOnly.get());  // 8 (8 is even)
```

#### `debounce<T>(signal: Signal<T>, delayMs: number): Signal<T>`

Debounce signal updates.

```typescript
const search = createSignal('');
const debouncedSearch = debounce(search, 300);

// Typing fast...
search.set('a');
search.set('ap');
search.set('app');
// debouncedSearch only updates once after 300ms!
```

#### `throttle<T>(signal: Signal<T>, intervalMs: number): Signal<T>`

Throttle signal updates.

```typescript
const scroll = createSignal(0);
const throttledScroll = throttle(scroll, 100);

// Scrolling fast...
// throttledScroll updates at most once per 100ms
```

#### `createArraySignal<T>(initialArray: T[]): ArraySignal<T>`

Array with helper methods.

```typescript
const todos = createArraySignal(['Buy milk', 'Walk dog']);

todos.push('Read book');
todos.filter((_, i) => i !== 1);  // Remove index 1
console.log(todos.get());  // ['Buy milk', 'Read book']
console.log(todos.length);  // 2
```

#### `createRecordSignal<T>(initialRecord: Record<string, T>): RecordSignal<T>`

Object with helper methods.

```typescript
const user = createRecordSignal({ name: 'John', age: 30 });

user.setKey('email', '[email protected]');
console.log(user.getKey('email'));  // '[email protected]'
console.log(user.keys());  // ['name', 'age', 'email']
```

---

## 📊 Common Patterns

### Pattern 1: Global Store

```typescript
// store/userStore.ts
import { createSignal, createComputed } from 'signalforge';

export const currentUser = createSignal(null);
export const isLoggedIn = createComputed(() => currentUser.get() !== null);

export const login = (user) => currentUser.set(user);
export const logout = () => currentUser.set(null);
```

```typescript
// screens/HomeScreen.tsx
import { useSignalValue } from 'signalforge/react';
import { currentUser, login, logout, isLoggedIn } from '../store/userStore';

function HomeScreen() {
  const user = useSignalValue(currentUser);
  const loggedIn = useSignalValue(isLoggedIn);
  
  return (
    <View>
      {loggedIn ? (
        <>
          <Text>Welcome, {user.name}!</Text>
          <Button onPress={logout}>Logout</Button>
        </>
      ) : (
        <Button onPress={() => login({ name: 'John' })}>Login</Button>
      )}
    </View>
  );
}
```

### Pattern 2: Form State

```typescript
function LoginForm() {
  const [email, setEmail] = useSignal('');
  const [password, setPassword] = useSignal('');
  
  const isValid = email.includes('@') && password.length >= 8;
  
  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button disabled={!isValid} onPress={handleSubmit}>Login</Button>
    </View>
  );
}
```

### Pattern 3: Real-time Search

```typescript
const allProducts = createSignal([...]);
const searchQuery = createSignal('');

const filteredProducts = createComputed(() => {
  const query = searchQuery.get().toLowerCase();
  return allProducts.get().filter(p => 
    p.name.toLowerCase().includes(query)
  );
});

function SearchScreen() {
  const products = useSignalValue(filteredProducts);
  
  return (
    <View>
      <TextInput onChangeText={text => searchQuery.set(text)} />
      <FlatList data={products} ... />
    </View>
  );
}
```

---

## ❓ FAQ

**Q: `useSignal` vs `useSignalValue` - which to use?**

- Use `useSignal(initialValue)` for **local component state** (like `useState`)
- Use `useSignalValue(signal)` for **shared/global state** (reading external signals)

**Q: Do I need to specify dependencies for `useSignalEffect`?**

No! It automatically tracks which signals you access.

**Q: Can I use SignalForge without React?**

Yes! The core (`createSignal`, `createComputed`, etc.) is framework-agnostic.

**Q: How do I persist state across app restarts?**

Use `persist()` or `createPersistentSignal()` from the plugins package.

**Q: Is SignalForge production-ready?**

Yes! It's battle-tested, fully typed, and zero runtime dependencies.

---

## 🚀 Next Steps

1. Read the [Getting Started Guide](./getting-started.md)
2. Check out [Examples](../examples/)
3. Read the [Full API Documentation](./API.md)
4. Join our [Discord Community](https://discord.gg/signalforge)

---

**Last Updated:** November 22, 2025
