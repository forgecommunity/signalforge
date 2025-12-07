# SignalForge

![SignalForge logo](https://github.com/forgecommunity/signalforge/blob/master/docs/assets/signalforge.png?raw=1)

### Fine-Grained Reactive State Management for Modern JavaScript

[![npm version](https://img.shields.io/npm/v/signalforge.svg)](https://www.npmjs.com/package/signalforge)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Bundle Size](https://img.shields.io/badge/gzip-2KB-blue.svg)](https://bundlephobia.com/package/signalforge)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)

**[🚀 Quick Start](#-quick-start) • [🌐 Live Demo](https://signalforge-fogecommunity.vercel.app/) • [📖 Docs](./docs/getting-started.md) • [📱 Examples](#-live-examples)**

</div>

---

## 🎯 What is SignalForge?

> **The simplest state management library** for React and React Native.  
> Your UI automatically updates when data changes. **Zero Redux complexity. Zero boilerplate.**

### 💡 Think of it as Smart Variables

```typescript
const count = createSignal(0);         // ✨ Create a signal
count.set(5);                          // 🔄 Update it
count.get();                           // 📖 Read it: 5

// 🧮 Computed values update automatically
const doubled = createComputed(() => count.get() * 2);
console.log(doubled.get());            // 10
```

---

## ✨ Why Developers Love SignalForge

<table>
<tr>
<td width="50%">

### 🎓 **Easy to Learn**
Only **3 core functions**:

```typescript
createSignal(value)         // 📦 Store data
createComputed(() => ...)   // 🧮 Auto-calculate  
createEffect(() => ...)     // ⚡ React to changes
```

</td>
<td width="50%">

### 🌍 **Works Everywhere**
- ✅ React (hooks + classes)
- ✅ React Native (iOS + Android)  
- ✅ Next.js (SSR ready)
- ✅ Plain JavaScript

</td>
</tr>
<tr>
<td width="50%">

### 🚀 **Blazing Fast**
- 🪶 **2KB** total bundle
- ⚡ **33x faster** batched updates
- 📊 Handles **10,000+** signals

</td>
<td width="50%">

### 🔋 **Batteries Included**
- 💾 Auto-save to storage
- 🛠️ DevTools for debugging
- ⏱️ Time travel (undo/redo)
- 📦 Zero dependencies

</td>
</tr>
</table>



---

## 🚀 Quick Start

### Installation

```bash
npm install signalforge
```

### Your First Signal

```jsx
import { useSignal } from 'signalforge/react';

function Counter() {
  const [count, setCount] = useSignal(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      🎉 Clicked {count} times
    </button>
  );
}
```

> **That's it!** 🎯 No providers, no context, no configuration needed.

---

## 🌟 Live Examples

<div align="center">

### Try It Right Now!

</div>

<table>
<tr>
<td width="50%" align="center">

### 🌐 **Web Demo**

[![Web Demo](https://img.shields.io/badge/🌐_Live_Demo-Try_Now-blue?style=for-the-badge)](https://signalforge-fogecommunity.vercel.app/)

**19 Interactive Demos**
- 🔥 Compare with Redux/Zustand
- ⚡ Real-time performance metrics
- 📊 Side-by-side code examples
- 🎯 Shopping cart, forms & more

[**→ Open Live Demo**](https://signalforge-fogecommunity.vercel.app/)

> **Note:** Source code for web demos is not included in the repository. Try the live demo to see SignalForge in action!

</td>
<td width="50%" align="center">

### 📱 **React Native Demo**

[![React Native](https://img.shields.io/badge/📱_React_Native-19_Screens-green?style=for-the-badge)](./examples/sfReactNative)

**19 Interactive Screens**
- 🛒 Shopping cart with persistence
- 📝 Forms with validation
- 🔄 Cross-screen state sync
- 💾 AsyncStorage integration

[**→ Clone & Run**](#-react-native-quick-run)

</td>
</tr>
</table>

### 📱 React Native Quick Run

```bash
git clone https://github.com/forgecommunity/signalforge.git
cd signalforge && npm install && npm run build
cd examples/sfReactNative && npm install && npm start

# In another terminal:
npm run android  # or npm run ios
```

---

## 📊 Performance Benchmarks

<div align="center">

### 🏆 Built for Speed & Size

</div>

<table>
<tr>
<td width="33%" align="center">

### 🪶 **Tiny Bundle**
**2KB** gzipped  
**0.5KB** core only  
**0** dependencies

</td>
<td width="33%" align="center">

### ⚡ **Lightning Fast**
**< 1ns** signal reads  
**~10ns** signal writes  
**33x faster** batched updates

</td>
<td width="33%" align="center">

### 📈 **Scales Up**
**10,000+** signals  
**< 100ns** computed overhead  
**Minimal** memory footprint

</td>
</tr>
</table>

### 🥊 Head-to-Head Comparison

| Library | Bundle Size | Update Speed | Boilerplate | Learning Curve |
|---------|-------------|--------------|-------------|----------------|
| **SignalForge** 🏆 | **2KB** | **33x faster** ⚡ | **3 lines** ✨ | 🟢 Easy |
| Redux | 12.2KB | Baseline | 50+ lines | 🔴 Hard |
| Zustand | 3.2KB | Similar | 10-15 lines | 🟡 Medium |
| Recoil | 21KB | Slower | 20+ lines | 🔴 Hard |
| MobX | 16KB | Fast | 15+ lines | 🟡 Medium |

### 🔬 Run Benchmarks Yourself

```bash
npm install
npm run benchmark
# 📁 Results saved to benchmarks/results/
```

> **Try the live benchmark** in our [web demo](https://signalforge-fogecommunity.vercel.app/demos/benchmark) to see the difference! 🎯

---

## 📚 Documentation

<table>
<tr>
<td width="50%">

### 🎓 **Learning Resources**
- 📖 [Getting Started Guide](./docs/getting-started.md)
- 🔍 [API Reference](./docs/API.md)  
- ⚡ [API Cheat Sheet](./docs/API-QUICK-REFERENCE.md)
- 📱 [React Native Guide](./docs/react-native-guide.md)

</td>
<td width="50%">

### 💻 **Example Projects**
- 🌐 [Web Demo (Live)](https://signalforge-fogecommunity.vercel.app/)
- 📱 [React Native App (Source Code)](./examples/sfReactNative)
- 📖 [Getting Started Guide](./docs/getting-started.md)

</td>
</tr>
</table>

---

## 🤝 Get Help & Contribute

<div align="center">

### 💬 **Need Help?**

[![Documentation](https://img.shields.io/badge/📖_Documentation-Read_Docs-blue?style=for-the-badge)](./docs/getting-started.md)
[![Issues](https://img.shields.io/badge/🐛_Issues-Report_Bug-red?style=for-the-badge)](https://github.com/forgecommunity/signalforge/issues)
[![Discussions](https://img.shields.io/badge/💡_Discussions-Ask_Question-green?style=for-the-badge)](https://github.com/forgecommunity/signalforge/discussions)

### 🚀 **Want to Contribute?**

[![Contributors](https://img.shields.io/github/contributors/forgecommunity/signalforge?style=for-the-badge)](https://github.com/forgecommunity/signalforge/graphs/contributors)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](https://github.com/forgecommunity/signalforge/pulls)

</div>

---

## 📄 License

MIT © [ForgeCommunity](https://github.com/forgecommunity)

---

<div align="center">

### ⭐ **Star us on GitHub!**

[![GitHub stars](https://img.shields.io/github/stars/forgecommunity/signalforge?style=social)](https://github.com/forgecommunity/signalforge)

**Built by [ForgeCommunity](https://github.com/forgecommunity)**

[🌐 Website](https://signalforge-fogecommunity.vercel.app/) • [📦 npm](https://www.npmjs.com/package/signalforge) • [💻 GitHub](https://github.com/forgecommunity/signalforge) • [📖 Docs](./docs/getting-started.md)

</div>

