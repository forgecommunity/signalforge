# 🎯 SignalForge Demo Guide

<div align="center">

**Your Complete Interactive Tutorial for Mastering SignalForge**

🎓 Learn by Doing • 📱 Touch Everything • 💡 See It Work

</div>

---

## 🌟 Welcome!

This guide walks you through all **16 interactive demo screens** in the SignalForge React Native app. Each screen is a mini-tutorial that lets you see, touch, and understand reactive state management!

> 💡 **Tip**: Follow the screens in order for the best learning experience, or jump to any topic that interests you!

## 📱 What You'll Learn

This demo includes **16 interactive screens** covering everything from basic signals to advanced real-world examples:

### 🎓 Core Concepts (Levels 1-6)
1. **Basic Signal** - Create, read, update signals (`.get()`, `.set()`)
2. **Computed Signal** - Auto-calculating values that update automatically
3. **Effects** - Run code when signals change
4. **Batch Updates** - Update multiple signals efficiently (33x faster!)
5. **Subscribe** - Listen to signal changes
6. **Untrack** - Read signals without creating dependencies

### ⚛️ React Integration (Level 7, 15)
7. **React Hooks** - `useSignal`, `useSignalValue`, `useSignalEffect`
15. **Class Components** - `withSignals` HOC for legacy code

### 💼 Real-World Examples (Levels 8-14, 16)
8. **Shopping Cart** - Complete cart with auto-calculated subtotal, tax, and total
9. **Form Validation** - Real-time validation with instant feedback
10. **Todo App** - Full-featured todo application
11. **Array Signal** - Array helper methods (`push`, `pop`, `filter`, etc.)
12. **Persistent Signal** - Auto-save to AsyncStorage (survives app restart!)
13. **Time Travel** - Undo/redo state changes
14. **DevTools** - Signal monitoring and debugging
16. **Big Data** - Performance with 1000-5000 items

---

## 🎬 Screen-by-Screen Breakdown

### 🎓 Core Concepts: Master the Fundamentals

#### Screen 1: Basic Signal 📝
**Difficulty**: ⭐ Beginner

**What You'll Learn**:
- How to create a signal with `createSignal()`
- Reading values with `.get()`
- Updating values with `.set()`
- Using signals in React with `useSignalValue()`

**Try This**:
- Click the increment/decrement buttons
- Notice how the UI updates instantly
- Look at the code snippet to see how simple it is

**Key Takeaway**: Signals are like smart variables that notify when they change!

```typescript
const age = createSignal(25);
age.set(26); // UI updates automatically!
```

---

#### Screen 2: Computed Signal 🧮
**Difficulty**: ⭐ Beginner

**What You'll Learn**:
- Creating computed signals with `createComputed()`
- Automatic dependency tracking
- How computed values stay in sync

**Try This**:
- Adjust the price slider
- Change the quantity
- Watch the total update automatically without any extra code!

**The Magic**: 
```typescript
const total = createComputed(() => price.get() * quantity.get());
// Change price or quantity → total updates automatically! ✨
```

**Real-World Use**: Shopping carts, tax calculations, filtered lists, form totals

---

#### Screen 3: Effects ⚡
**Difficulty**: ⭐⭐ Intermediate

**What You'll Learn**:
- Running side effects with `createEffect()`
- Effect cleanup functions
- When effects run (on dependency changes)

**Try This**:
- Change the name signal
- See the console log update automatically
- Click the cleanup demo to see effects clean up

**Pattern**:
```typescript
createEffect(() => {
  console.log('Name changed:', name.get());
  return () => console.log('Cleanup!');
});
```

**Real-World Use**: API calls, analytics tracking, localStorage sync, logging

---

#### Screen 4: Batch Updates 🚀
**Difficulty**: ⭐⭐ Intermediate

**What You'll Learn**:
- Why batching matters (performance!)
- Using `batch()` for multiple updates
- The **33x speed improvement** you get!

**Try This**:
- Click "Update 100 Signals (NO Batch)" → See the time
- Click "Update 100 Signals (WITH Batch)" → Compare!
- The difference is dramatic!

**The Secret**:
```typescript
batch(() => {
  signal1.set('a');
  signal2.set('b');
  signal3.set('c');
  // UI updates once, not 3 times!
});
```

**Real-World Use**: Form submissions, bulk data updates, complex state changes

## 🚀 Quick Start

### From the Repo Root:
```bash
# 1. Build SignalForge library
npm install
npm run build

# 2. Navigate to example
cd examples/sfReactNative

# 3. Install dependencies
npm install

# 4. iOS only - install pods
cd ios && pod install && cd ..

# 5. Run the app
npm start

# In another terminal:
npm run ios    # macOS only
# OR
npm run android
```

---

### Extended Screen Summaries

#### Screens 9-14, 16: More Real-World Examples

**Screen 9: Form Validation** - Real-time email/password validation with computed errors  
**Screen 10: Todo App** - Full CRUD with filters and computed counters  
**Screen 11: Array Signal** - Reactive arrays with helper methods  
**Screen 12: Persistent Signal** - Auto-save to AsyncStorage (close app → data persists!)  
**Screen 13: Time Travel** - Undo/redo state management  
**Screen 14: DevTools** - Monitor signals, track performance, debug in real-time  
**Screen 16: Big Data** - Handle 1000-5000 items smoothly with batching  

---

## 🎓 How to Use

1. **Home Screen** → See all 16 demos
2. **Tap Any Demo** → Interactive examples
3. **Each Screen Has:**
   - ✨ Live examples you can interact with
   - 💻 Code snippets showing how it works
   - 📊 Visual feedback and stats
   - 🎯 Real-world use cases

## 📂 Project Structure

```
screens/
├── BasicSignalScreen.tsx        ← Start here!
├── ComputedSignalScreen.tsx     ← Auto-calculating values
├── EffectsScreen.tsx            ← Side effects
├── BatchUpdatesScreen.tsx       ← Performance optimization
├── SubscribeScreen.tsx          ← Event listeners
├── UntrackScreen.tsx            ← Break dependencies
├── ReactHooksScreen.tsx         ← React integration
├── ShoppingCartScreen.tsx       ← Real example #1
├── FormValidationScreen.tsx     ← Real example #2
├── TodoAppScreen.tsx            ← Real example #3
├── ArraySignalScreen.tsx        ← Array utilities
└── PersistentSignalScreen.tsx   ← Storage integration
```

## 💡 Quick Code Examples

### Basic Signal
```typescript
const count = createSignal(0);
count.get();        // 0
count.set(5);       // Update
count.set(v => v + 1); // Increment
```

### Computed (Auto-Updates!)
```typescript
const price = createSignal(100);
const qty = createSignal(2);
const total = createComputed(() => price.get() * qty.get());
// Change price or qty → total updates automatically! ✨
```

### React Hooks
```typescript
// Component state
const [count, setCount] = useSignal(0);

// Global state
const globalCount = createSignal(0);
const value = useSignalValue(globalCount);
```

### Persistent (Auto-Saves!)
```typescript
const theme = createPersistentSignal('theme', 'light');
theme.set('dark'); // Automatically saved to AsyncStorage! 💾
// Restart app → value restored! 🎉
```

## 🔥 Features Highlighted

- ✅ **Zero dependencies** - Just React Native + SignalForge
- ✅ **100% TypeScript** - Full type safety
- ✅ **Real-world examples** - Copy-paste ready code
- ✅ **Interactive** - Touch, type, see instant results
- ✅ **Performance metrics** - See the speed difference
- ✅ **Beautiful UI** - Modern, clean design
- ✅ **Complete coverage** - Every README feature implemented

## 🎯 Perfect For

- 📚 Learning SignalForge basics
- 🔍 Exploring advanced features
- 💼 Seeing real-world patterns
- 📋 Copy-paste examples for your app
- 🎓 Teaching reactive programming

## 📚 More Resources

- [Main README](../../README.md) - Full documentation
- [API Reference](../../docs/API.md) - Complete API docs
- [Getting Started Guide](../../docs/getting-started.md) - Tutorials

## 💪 Why SignalForge?

- ⚡ **100x faster** than Redux/MobX
- 🪶 **Only 2KB** minified
- 🎯 **Just 3 functions** to learn
- 🌍 **Works everywhere** - React, Vue, React Native, vanilla JS
- 🔄 **Auto-updates** - No manual work
- 💾 **Built-in persistence** - Save to storage automatically

## 🌟 What Makes These Demos Special

### 1. Progressive Learning
Start simple (Basic Signal) and gradually build to complex examples (Big Data, Time Travel). Each concept builds on the previous one.

### 2. Real Production Code
Not toy examples! The Shopping Cart, Todo App, and Form Validation screens are production-ready patterns you can copy directly.

### 3. Performance Insights
See actual millisecond timings. The Batch Updates screen shows 33x speed improvement. The Big Data screen proves SignalForge handles thousands of items smoothly.

### 4. Interactive Testing
Every demo is fully interactive. Break things, try edge cases, spam buttons—that's how you really learn!

### 5. Visual Feedback
Color-coded stats, real-time logs, performance metrics, and clean UI make learning intuitive and engaging.

---

## 🎊 Final Tips

**For Beginners**: Start with screens 1-3, then jump to 7 (React Hooks), then try 8 (Shopping Cart). That's your fastest path to productivity!

**For Experienced Devs**: Jump to screens 4 (Batch Updates), 6 (Untrack), 14 (DevTools), and 16 (Big Data) to see the advanced optimization techniques.

**For Everyone**: Don't skip screen 12 (Persistent Signal)—the "close app and reopen" test is mind-blowing! 🤯

---

<div align="center">

**Built with ❤️ by [ForgeCommunity](https://github.com/forgecommunity)**

Try the demos, learn the patterns, build amazing apps! 🚀

**Questions? Found a bug? Want to contribute?**

[Open an Issue](https://github.com/forgecommunity/signalforge/issues) • [Start a Discussion](https://github.com/forgecommunity/signalforge/discussions) • [⭐ Star on GitHub](https://github.com/forgecommunity/signalforge)

</div>
