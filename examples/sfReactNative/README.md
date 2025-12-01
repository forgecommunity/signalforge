# ⚡ SignalForge React Native Demo App

<div align="center">

**The Ultimate Interactive Guide to SignalForge**

[![React Native](https://img.shields.io/badge/React%20Native-0.82-blue.svg)](https://reactnative.dev/)
[![SignalForge](https://img.shields.io/badge/SignalForge-1.0.1-purple.svg)](https://github.com/forgecommunity/signalforge)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](../../LICENSE)

[Features](#-features) • [Quick Start](#-quick-start) • [Demos](#-demo-screens) • [Documentation](#-documentation)

</div>

---

## 🎯 What is This?

This is a **comprehensive, interactive demo app** that teaches you everything about SignalForge through **16 hands-on examples**. Each screen demonstrates a different feature with real, working code that you can see, touch, and learn from!

> 💡 **Perfect for**: Developers learning SignalForge, teams evaluating state management solutions, or anyone who wants to see reactive programming in action.

## ✨ Features

- 🎓 **16 Interactive Tutorials** - From basics to advanced patterns
- 📱 **Production-Ready Code** - Copy-paste into your own apps
- 🎨 **Beautiful UI** - Clean, modern design with visual feedback
- 📊 **Performance Metrics** - See the speed difference yourself
- 💾 **Real Persistence** - Data survives app restarts
- 🔄 **Time Travel** - Undo/redo state changes
- 🛠️ **DevTools** - Signal monitoring and debugging
- 📖 **Code Snippets** - Every screen shows how it works

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- React Native development environment ([Setup Guide](https://reactnative.dev/docs/environment-setup))
- iOS: macOS with Xcode + CocoaPods
- Android: Android Studio + JDK

### Installation (5 Minutes)

```bash
# 1️⃣ Build SignalForge library (from repo root)
cd ../../
npm install
npm run build

# 2️⃣ Install example dependencies
cd examples/sfReactNative
npm install

# 3️⃣ iOS only: Install pods
cd ios && pod install && cd ..

# 4️⃣ Start Metro bundler
npm start

# 5️⃣ Run the app (in a new terminal)
npm run ios     # macOS only
# OR
npm run android # Windows/macOS/Linux

```

### First Time Setup Issues?

See the troubleshooting section in [**QUICK_START.md**](./QUICK_START.md) if you encounter issues!

## 📱 Demo Screens

### 🎓 Core Concepts (Learn the Basics)

| Screen | What You'll Learn | Difficulty |
|--------|------------------|------------|
| **1. Basic Signal** | Create, read, update signals | ⭐ |
| **2. Computed Signal** | Auto-calculating derived values | ⭐ |
| **3. Effects** | Side effects and cleanup | ⭐⭐ |
| **4. Batch Updates** | 33x faster multi-signal updates | ⭐⭐ |
| **5. Subscribe** | Manual subscription handling | ⭐⭐ |
| **6. Untrack** | Break dependency tracking | ⭐⭐⭐ |

### ⚛️ React Integration

| Screen | What You'll Learn | Key APIs |
|--------|------------------|----------|
| **7. React Hooks** | `useSignal`, `useSignalValue`, `useSignalEffect` | 3 hooks |
| **15. Class Components** | `withSignals` HOC for legacy code | HOC pattern |

### 💼 Real-World Examples

| Screen | Use Case | What It Demonstrates |
|--------|----------|---------------------|
| **8. Shopping Cart** 🛒 | E-commerce | Computed totals, tax calculation |
| **9. Form Validation** 📝 | User input | Real-time validation, error handling |
| **10. Todo App** ✅ | Task management | CRUD operations, filtering, counts |
| **11. Array Signal** 📋 | List manipulation | Array helpers (push, pop, filter) |
| **12. Persistent Signal** 💾 | User preferences | AsyncStorage integration |
| **13. Time Travel** ⏱️ | Debugging | Undo/redo state changes |
| **14. DevTools** 🛠️ | Monitoring | Signal inspection, performance |
| **16. Big Data** 📊 | Performance | Handle 1000-5000 items efficiently |

## 🎬 How to Use This Demo

### 1️⃣ Start with the Basics
Begin at **Screen 1 (Basic Signal)** and work your way up. Each screen builds on previous concepts.

### 2️⃣ Interact with Everything
Every button, input, and control is functional. Try them all!

### 3️⃣ Read the Code Snippets
Each screen shows the actual code that makes it work. These are copy-pasteable!

### 4️⃣ Watch the Performance
Notice how fast updates are, especially in the Big Data and Batch Updates screens.

### 5️⃣ Test Persistence
On Screen 12, change values, close the app completely, reopen → your data is still there! 🎉

## 💻 Code Examples

### Basic Signal (Screen 1)
```typescript
import { createSignal } from 'signalforge';
import { useSignalValue } from 'signalforge/react';

const count = createSignal(0);

function Counter() {
  const value = useSignalValue(count);
  return (
    <Button onPress={() => count.set(count.get() + 1)}>
      Count: {value}
    </Button>
  );
}
```

### Computed Signal (Screen 2)
```typescript
import { createSignal, createComputed } from 'signalforge';

const price = createSignal(100);
const quantity = createSignal(2);
const total = createComputed(() => price.get() * quantity.get());

// Change price or quantity → total updates automatically! ✨
```

### Persistent Signal (Screen 12)
```typescript
import { createSignal } from 'signalforge';
import { persist } from 'signalforge/utils';

const theme = createSignal('light');
persist(theme, { key: 'app_theme' });

// Changes are auto-saved to AsyncStorage!
theme.set('dark'); // ← Survives app restart 🎉
```

## 📖 Documentation

- 📘 [**DEMO_GUIDE.md**](./DEMO_GUIDE.md) - Detailed guide to all 16 screens
- ⚡ [**QUICK_START.md**](./QUICK_START.md) - Get running in 5 minutes (includes troubleshooting)
- 📖 [**FEATURES.md**](./FEATURES.md) - Complete feature reference
- 🗂️ [**DOCUMENTATION_INDEX.md**](./DOCUMENTATION_INDEX.md) - Master documentation index

## 🎓 Learning Path

### Beginner (Start Here!)
1. Basic Signal → Learn get/set
2. Computed Signal → See auto-calculation
3. React Hooks → Integrate with React
4. Shopping Cart → First real example

### Intermediate
5. Effects → Side effect management
6. Todo App → Complete CRUD example
7. Batch Updates → Performance optimization
8. Array Signal → Collection helpers

### Advanced
9. Untrack → Fine-grained control
10. Persistent Signal → Data persistence
11. Time Travel → State debugging
12. Big Data → Performance at scale
13. DevTools → Production debugging

## 🏗️ Project Structure

```
sfReactNative/
├── App.tsx                      # Main navigation
├── screens/
│   ├── BasicSignalScreen.tsx    # Screen 1: Fundamentals
│   ├── ComputedSignalScreen.tsx # Screen 2: Derived values
│   ├── EffectsScreen.tsx        # Screen 3: Side effects
│   ├── BatchUpdatesScreen.tsx   # Screen 4: Performance
│   ├── SubscribeScreen.tsx      # Screen 5: Manual subs
│   ├── UntrackScreen.tsx        # Screen 6: Break deps
│   ├── ReactHooksScreen.tsx     # Screen 7: React APIs
│   ├── ShoppingCartScreen.tsx   # Screen 8: E-commerce
│   ├── FormValidationScreen.tsx # Screen 9: Validation
│   ├── TodoAppScreen.tsx        # Screen 10: CRUD
│   ├── ArraySignalScreen.tsx    # Screen 11: Arrays
│   ├── PersistentSignalScreen.tsx # Screen 12: Storage
│   ├── TimeTravelScreen.tsx     # Screen 13: Undo/redo
│   ├── DevToolsScreen.tsx       # Screen 14: Debugging
│   ├── ClassComponentScreen.tsx # Screen 15: Classes
│   └── BigDataScreen.tsx        # Screen 16: Scale
├── ios/                         # iOS native code
├── android/                     # Android native code
└── package.json                 # Dependencies
```

## 🎨 What Makes This Demo Special

✅ **Every screen is self-contained** - Copy any screen into your project

✅ **Real production patterns** - Not toy examples, actual useful code

✅ **Visual feedback** - See exactly what's happening

✅ **Performance metrics** - Measure the speed yourself

✅ **Progressive complexity** - Start simple, build up gradually

✅ **Modern React Native** - Uses latest best practices (0.82.1)

## 🤝 Contributing

Found a bug or want to add a demo screen? PRs welcome!

## 📄 License

MIT - See [LICENSE](../../LICENSE) for details

## 🔗 Links

- 📦 [SignalForge on npm](https://www.npmjs.com/package/signalforge)
- 🐙 [GitHub Repository](https://github.com/forgecommunity/signalforge)
- 📚 [Full Documentation](../../docs/getting-started.md)
- 💬 [Issues & Support](https://github.com/forgecommunity/signalforge/issues)

---

<div align="center">

**Built with ❤️ by the ForgeCommunity**

⭐ Star us on [GitHub](https://github.com/forgecommunity/signalforge) if this helped you!

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
