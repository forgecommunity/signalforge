# 🚀 SignalForge Live Demo

**Experience SignalForge in action** - the simplest state management for React. 19 interactive examples showing exactly **WHAT you're doing, WHY you need it, and HOW to use it**.

## 🌐 View Live Demo

**[👉 Open Live Demo Site](https://signalforge-fogecommunity.vercel.app/)**

The demo site includes:
- ✅ **15+ Interactive Examples** - Shopping carts, forms, benchmarks, and more
- ✅ **Side-by-Side Comparisons** - SignalForge vs Redux/Zustand
- ✅ **Real-Time Performance Metrics** - See the speed difference
- ✅ **Live Code Examples** - Copy and use immediately
- ✅ **DevTools Integration** - Debug and inspect signals

> 📱 **React Native Users:** SignalForge works exactly the same in React Native! Just replace web components (`<div>`, `<button>`) with React Native components (`<View>`, `<TouchableOpacity>`, `<Text>`). Check out [`/examples/sfReactNative`](../sfReactNative/) for native examples.

---

## The Problem with Other Libraries

### Redux ❌ **50+ Lines of Boilerplate**
```typescript
// Actions
const INCREMENT = 'INCREMENT';

// Reducer
const counterReducer = (state = 0, action) => {
  if (action.type === INCREMENT) return state + 1;
  return state;
};

// Store
const store = createStore(counterReducer);

// Component
const dispatch = useDispatch();
const count = useSelector(s => s.count);
```
**Issues:**
- 50+ lines for a simple counter
- Manual action creators
- Manual selectors
- Complex DevTools setup
- Steep learning curve
- Boilerplate heavy

### Context API ❌ **30+ Lines, Multiple Files**
```typescript
// 1. Create context
const CountContext = createContext();

// 2. Create provider
const CountProvider = ({ children }) => {
  const [count, setCount] = useState(0);
  return (
    <CountContext.Provider value={{ count, setCount }}>
      {children}
    </CountContext.Provider>
  );
};

// 3. Wrap app
<CountProvider>
  <App />
</CountProvider>

// 4. Use in component
const { count, setCount } = useContext(CountContext);
```
**Issues:**
- Requires wrapping entire app
- Multiple files (context, provider, consumer)
- Re-renders all consumers on any change
- Hard to share complex state
- No built-in computed values
- Manual performance optimization needed

### Zustand ⚠️ **Requires Manual Selectors**
```typescript
// Create store
const useStore = create(set => ({
  count: 0,
  increment: () => set(s => ({ count: s.count + 1 }))
}));

// Component - needs manual selector
function Counter() {
  const count = useStore(s => s.count);  // ⚠️ Manual selector!
  return <button>{count}</button>;
}

// Optimization required
const count = useStore(s => s.count, (a, b) => a === b);  // ❌ Verbose
```
**Issues:**
- Manual selectors required
- No automatic dependency tracking
- Manual memoization with custom hooks
- Derived values require extra setup
- Performance optimization is manual

### Recoil ⚠️ **Atoms Everywhere, Context Required**
```typescript
// Create atoms
const countAtom = atom({
  key: 'count',
  default: 0,
});

// Wrap app
<RecoilRoot>
  <App />
</RecoilRoot>

// Use in component
const [count, setCount] = useRecoilState(countAtom);
```
**Issues:**
- Requires global RecoilRoot wrapper
- Atom keys can clash
- Learning curve for atoms/selectors
- Slower than alternatives
- Requires unique keys for all atoms

---

## The SignalForge Solution ✅ **3 Lines, No Setup**

```typescript
// That's it! No boilerplate, no context, no selectors!
const count = createSignal(0);

function Counter() {
  const value = useSignalValue(count);  // Auto-subscribes!
  return (
    <button onClick={() => count.set(count.get() + 1)}>
      Count: {value}
    </button>
  );
}
```

**Why SignalForge Wins:**
- ✅ **3 lines** instead of 50+
- ✅ **No wrapper components** needed
- ✅ **No manual selectors** required
- ✅ **Automatic dependency tracking**
- ✅ **Built-in computed values**
- ✅ **2KB bundle** (vs 4.4KB Redux)
- ✅ **0 configuration** needed
- ✅ **Gentle learning curve**

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 and explore 15 interactive examples!
```

---

## 📱 Web vs React Native - Same Logic, Different UI

SignalForge code is **identical** in web and React Native. Only the UI components differ:

### Web (Next.js)
```tsx
import { useSignal } from 'signalforge/react';

function Counter() {
  const [count, setCount] = useSignal(0);
  
  return (
    <div className="container">
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

### React Native (Same SignalForge code!)
```tsx
import { useSignal } from 'signalforge/react';
import { View, Text, TouchableOpacity } from 'react-native';

function Counter() {
  const [count, setCount] = useSignal(0);  // ← Identical!
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Count: {count}</Text>
      <TouchableOpacity onPress={() => setCount(count + 1)}>
        <Text>Increment</Text>
      </TouchableOpacity>
    </View>
  );
}
```

**Key Differences:**
- `<div>` → `<View>`
- `<button>` → `<TouchableOpacity>` or `<Pressable>`
- `<span>/<p>/<h1>` → `<Text>`
- `className` → `style` prop with StyleSheet
- `onClick` → `onPress`

**SignalForge stays the same!** Learn once, use everywhere. 🎯

---

## The 15 Demos Explained

Each demo shows **WHAT, WHY, and HOW** with interactive examples:

### Foundation (Start Here!)

#### 1️⃣ **Basic Signal** - Reactive State
**What:** Create a variable that triggers re-renders when updated
**Why:** Simpler than `useState` + no context wrapper needed
**How:**
```typescript
const [count, setCount] = useSignal(0);
setCount(count + 1);  // Auto re-render!
```
**Main Issue in Alternatives:**
- Redux: Needs 50 lines of boilerplate
- Context: Requires wrapping entire app
- **SignalForge: Just 1 hook!**

---

#### 2️⃣ **Computed Signal** - Auto-Calculated Values
**What:** A value that automatically updates when dependencies change
**Why:** No manual `useMemo()` or manual recalculation
**How:**
```typescript
const width = createSignal(10);
const height = createSignal(5);
const area = createComputed(() => width.get() * height.get());
// area auto-updates when width OR height change!
```
**Main Issue in Alternatives:**
- Redux: Manual selectors + memoization
- Zustand: No auto-tracking, need custom hooks
- Context: No computed values built-in
- **SignalForge: Fully automatic!**

---

#### 3️⃣ **Effects** - Run Code When Data Changes
**What:** Execute side effects when signals change
**Why:** Cleaner than `useEffect` - no dependency array needed!
**How:**
```typescript
useSignalEffect(() => {
  console.log('Count changed:', count.get());
  return () => console.log('Cleanup');
});
```
**Main Issue in Alternatives:**
- Redux: Need to dispatch actions + watchers
- Context: Complex useEffect dependency arrays
- Zustand: Manual subscription management
- **SignalForge: Auto-tracks dependencies!**

---

#### 4️⃣ **React Hooks** - Easy Integration
**What:** Three essential hooks for React integration
**Why:** Works naturally with React components
**How:**
```typescript
const [count, setCount] = useSignal(0);          // Create
const global = useSignalValue(globalSignal);    // Subscribe
useSignalEffect(() => { /* react to changes */ }); // Effect
```

---

### Optimization

#### 5️⃣ **Batch Updates** - 33x Faster Performance
**What:** Update multiple signals at once in one re-render
**Why:** Prevents 3 re-renders when updating 3 signals
**How:**
```typescript
// Without batch: 3 re-renders
count.set(1);
name.set('John');
email.set('john@x.com');

// With batch: 1 re-render (33x faster!)
batch(() => {
  count.set(1);
  name.set('John');
  email.set('john@x.com');
});
```
**Performance Impact:**
- Redux: Still multiple renders per dispatch
- Zustand: Manual memoization needed
- Context: All consumers re-render
- **SignalForge: 33x faster with batch!**

---

#### 6️⃣ **Subscribe** - Listen Outside React
**What:** Monitor signal changes outside components
**Why:** For logging, analytics, cross-tab communication
**How:**
```typescript
const unsub = signal.subscribe((newValue) => {
  console.log('Changed to:', newValue);
  analytics.track('value_updated', newValue);
});
unsub();  // Stop listening
```

---

#### 7️⃣ **Untrack** - Advanced Optimization
**What:** Read a signal without creating a dependency
**Why:** Prevent unnecessary re-computations
**How:**
```typescript
const result = createComputed(() => {
  return count.get() + untrack(() => threshold.get());
  // Only depends on count, not threshold
});
```

---

### Real-World Apps

#### 8️⃣ **Shopping Cart** - E-Commerce State
Complete cart system showing:
- Adding/removing items
- Quantity management
- Auto-calculating totals
- Real-world state patterns

```typescript
const cart = createSignal<CartItem[]>([]);
const total = createComputed(() =>
  cart.get().reduce((sum, item) => sum + item.price * item.quantity, 0)
);
// Totals auto-update when cart changes!
```

---

#### 9️⃣ **Form Validation** - Real-Time Validation
Complete form showing:
- Field validation
- Error messages
- Form submission
- Complex validation rules

```typescript
const emailError = createComputed(() => {
  const email = form.get().email;
  if (!email) return '';
  if (!email.includes('@')) return 'Invalid email';
  return '';
});
// Validates as user types!
```

**Main Issue in Alternatives:**
- Redux: Validation in actions/reducers (complex)
- Context: Manual onChange handlers everywhere
- Zustand: No built-in validation patterns
- **SignalForge: Computed signals do it automatically!**

---

#### 🔟 **Todo App** - Full CRUD + Filtering
Complete todo system showing:
- Create todos
- Update todos
- Delete todos
- Filter by status
- Real-time counts

```typescript
const todos = createSignal([]);
const completed = createComputed(() =>
  todos.get().filter(t => t.done)
);
const active = createComputed(() =>
  todos.get().filter(t => !t.done)
);
// All update automatically!
```

---

#### 1️⃣1️⃣ **Array Signals** - Reactive Collections
Array with built-in reactive methods:
```typescript
const items = createArraySignal([1, 2, 3]);
items.push(4);          // Auto re-render
items.filter(x => x > 2);  // Auto re-render
items.sort();           // Auto re-render
```

---

#### 1️⃣2️⃣ **Persistent Signals** - Auto-Save to Storage
Signals that auto-save to localStorage:
```typescript
const theme = createPersistentSignal('app-theme', 'light');
theme.set('dark');  // Automatically saved!
// On reload: theme is still 'dark'
```

---

### Advanced

#### 1️⃣3️⃣ **Big Data** - 10,000+ Signals
Performance test showing SignalForge scales:
- 10,000 signals created instantly
- Updates stay blazing fast
- Memory efficient

---

#### 1️⃣4️⃣ **DevTools** - Inspect Your State
Visual debugging showing:
- Signal dependency graph
- Current values
- Performance metrics

---

#### 1️⃣5️⃣ **Time Travel** - Undo/Redo
Full history tracking showing:
- Record all state changes
- Undo/redo functionality
- Jump to any point in history

```typescript
timeTravel.undo();   // Go back
timeTravel.redo();   // Go forward
timeTravel.jump(5);  // Jump to point 5
```

---

## Comparison Table

| Feature | Redux | Context | Zustand | SignalForge |
|---------|-------|---------|---------|------------|
| **Setup** | 50+ lines | 30+ lines | 10 lines | 1 line ✅ |
| **Bundle** | 4.4KB | Built-in | 0.07KB | 2KB ✅ |
| **Boilerplate** | Actions + Reducers | Provider wrapper | Store setup | None ✅ |
| **Computed** | Selectors + memoization | Manual | Manual | Automatic ✅ |
| **Dependencies** | Manual action types | Manual list | Manual selectors | Automatic ✅ |
| **Performance** | Good | Medium | Good | Better ✅ |
| **Learning** | Hard | Medium | Easy | Very Easy ✅ |
| **DevTools** | Extension needed | Custom | Basic | Built-in ✅ |
| **Global State** | Best | OK | Good | Best ✅ |
| **Local State** | Overkill | Complex | Good | Perfect ✅ |

---

## Why Choose SignalForge?

### ✅ Simplicity
No action creators, reducers, or complex setups. Just signals.

### ✅ Performance
Fine-grained reactivity means only components that changed re-render.

### ✅ Tiny Bundle
Only 2KB gzipped - smaller than Redux, Zustand, and most alternatives.

### ✅ Automatic Tracking
Dependencies tracked automatically - no arrays, no manual setup.

### ✅ No Providers
Don't wrap your app. Signals work anywhere.

### ✅ Built-In Features
Computed values, effects, persistence, time travel all included.

### ✅ Learning Curve
If you know React hooks, you know SignalForge.

---

## Core API at a Glance

### Create a Signal
```typescript
const count = createSignal(0);
const user = createSignal({ name: 'John', age: 30 });
```

### Read & Update
```typescript
count.get();              // Read: 0
count.set(5);             // Update to 5
count.set(prev => prev + 1); // Update based on previous: 6
```

### Subscribe to Changes
```typescript
const unsubscribe = count.subscribe(value => {
  console.log('New value:', value);
});
unsubscribe();  // Stop listening
```

### Computed Values (Auto-Update)
```typescript
const doubled = createComputed(() => count.get() * 2);
count.set(5);
doubled.get();  // 10 - automatically updated!
```

### Side Effects
```typescript
createEffect(() => {
  console.log('Count changed:', count.get());
  return () => console.log('Cleanup');
});
```

### Batch Updates (Fast!)
```typescript
batch(() => {
  count.set(5);
  name.set('Alice');
  email.set('alice@x.com');
});
```

### React Hooks
```typescript
const [count, setCount] = useSignal(0);
const value = useSignalValue(globalSignal);
useSignalEffect(() => { /* code */ });
```

---

## Deployment

### Vercel (Recommended)
```bash
# From repo root
npm install && npm run build
cd examples/sf-nextjs && npm install
npm run dev  # Test locally
npx vercel --prod  # Deploy
```

---

## File Structure

```
app/
├── page.tsx              # Home page
├── layout.tsx            # App layout
## Featured Demos

### 🔥 **Comparison Demo**
Side-by-side comparison of SignalForge vs Redux/Zustand showing 90% less code for the same shopping cart functionality.

### ⚡ **Performance Benchmark**
Real-time performance metrics showing SignalForge is 33x faster with batched updates.

### 🛒 **Shopping Cart**
Complete e-commerce cart with add/remove items, quantity updates, and automatic total calculations.

### 📝 **Form Handling**
Form validation, submission, and state management with zero boilerplate.

### 👥 **Fine-Grained Reactivity**
Real-time collaboration demo showing how only edited cells re-render, not the entire grid.

### 🔗 **Computed Chains**
Complex nested calculations with visual dependency tree and automatic updates.

...and 13+ more interactive examples!

---

## Next Steps

1. **Try the Live Demo**: [signalforge-fogecommunity.vercel.app](https://signalforge-fogecommunity.vercel.app/)
2. **Read the Docs**: Check [getting-started.md](../../docs/getting-started.md)
3. **Install SignalForge**: `npm install signalforge`
4. **Build Your App**: Use these patterns in your projects
5. **Share Your Experience**: Let us know what you built!

---

## Resources

- 📖 **Main Docs**: `/docs` in main repo
- 🔗 **API Reference**: `docs/API.md`
- 🏗️ **Architecture**: `docs/architecture.md`
- 📱 **React Native Guide**: `REACT_NATIVE_GUIDE.md` (this folder)
- 💬 **GitHub**: https://github.com/forgecommunity/signalforge

---

**Happy signaling! 🚀**
