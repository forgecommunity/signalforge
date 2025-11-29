# 🎯 SignalForge Complete Demo App

This React Native app demonstrates **ALL** SignalForge features from the README in an easy, screen-by-screen interactive format! 🚀

## 📱 What You'll Learn

This demo includes **12 interactive screens** covering everything from basic signals to advanced real-world examples:

### 📚 Core Concepts (Levels 1-6)
1. **Basic Signal** - Create, read, update signals (`.get()`, `.set()`)
2. **Computed Signal** - Auto-calculating values that update automatically
3. **Effects** - Run code when signals change
4. **Batch Updates** - Update multiple signals efficiently (33x faster!)
5. **Subscribe** - Listen to signal changes
6. **Untrack** - Read signals without creating dependencies

### ⚛️ React Integration (Level 7)
7. **React Hooks** - `useSignal`, `useSignalValue`, `useSignalEffect`

### 💼 Real-World Examples
8. **Shopping Cart** - Complete cart with auto-calculated subtotal, tax, and total
9. **Form Validation** - Real-time validation with instant feedback
10. **Todo App** - Full-featured todo application
11. **Array Signal** - Array helper methods (`push`, `pop`, `filter`, etc.)
12. **Persistent Signal** - Auto-save to AsyncStorage (survives app restart!)

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

## 🎓 How to Use

1. **Home Screen** → See all 12 demos
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

---

**Built with ❤️ by [ForgeCommunity](https://github.com/forgecommunity)**

Try the demos, learn the patterns, build amazing apps! 🚀
