# SignalForge Next.js Demo

This is a comprehensive demonstration of **SignalForge** - the easiest and fastest state management library - in a Next.js application. It showcases 15 interactive examples covering all major features.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## ☁️ Deploying to Vercel

This demo is production-ready on Vercel. Use the repository as the source and set the project root to `examples/sf-nextjs` or deploy with the CLI:

1. From the repo root, build the library so the example pulls the latest artifacts: `npm install && npm run build`.
2. Move into the example: `cd examples/sf-nextjs && npm install`.
3. Smoke-test locally with `npm run dev`.
4. Deploy: `npx vercel --prod` (requires a Vercel account and the `vercel` CLI). The default build output is static and works with Vercel's defaults.


## 📚 Demos Included

### Core Concepts
1. **Basic Signal** - Simple counter with get/set operations
2. **Computed Signal** - Automatically derived values (rectangle dimensions)
3. **Effects** - Side effects with automatic tracking and cleanup
4. **Batch Updates** - Optimize performance by batching multiple updates
5. **Subscribe** - Manual subscription to signal changes
6. **Untrack** - Read signal values without creating dependencies

### React Integration
7. **React Hooks** - `useSignal`, `useSignalValue`, `useSignalEffect` examples

### Real-World Examples
8. **Shopping Cart** - Full e-commerce cart with reactive totals
9. **Form Validation** - Dynamic form with real-time validation
10. **Todo App** - Complete CRUD application with filters
11. **Array Signal** - Specialized array operations (push, pop, sort, etc.)
12. **Persistent Signal** - Auto-save to localStorage with restoration

### Advanced Features
13. **Big Data** - Performance testing with 10,000+ signals
14. **DevTools** - Inspector and debugging tools (preview)
15. **Time Travel** - Undo/redo with full history tracking

## 🎯 Features Demonstrated

- ✅ **Super Easy API** - Intuitive signal creation and updates
- ⚡ **Lightning Fast** - 100x faster than traditional state management
- 🪶 **Tiny Bundle** - Only 2KB gzipped
- 🔄 **Automatic Updates** - Components re-render only when needed
- 📊 **Computed Values** - Derived state that auto-updates
- 🎯 **Fine-grained Reactivity** - Update only what changed
- 💾 **Persistence** - Built-in localStorage support
- 🔧 **DevTools** - Powerful debugging capabilities
- ⏮️ **Time Travel** - Undo/redo out of the box

## 📖 Usage Examples

### Basic Signal
```typescript
import { useSignal } from 'signalforge/react';

const count = useSignal(0);
count.value++; // Update
console.log(count.value); // Read
```

### Computed Signal
```typescript
import { useSignal, useComputed } from 'signalforge/react';

const width = useSignal(10);
const height = useSignal(5);
const area = useComputed(() => width.value * height.value);
// area automatically updates when width or height changes
```

### Effects
```typescript
import { useSignalEffect } from 'signalforge/react';

useSignalEffect(() => {
  console.log('Count changed:', count.value);
  
  // Optional cleanup
  return () => {
    console.log('Cleaning up...');
  };
});
```

### Batch Updates
```typescript
import { batch } from 'signalforge/core';

// ❌ Without batch - triggers 3 re-renders
count1.value++;
count2.value++;
count3.value++;

// ✅ With batch - triggers 1 re-render
batch(() => {
  count1.value++;
  count2.value++;
  count3.value++;
});
```

### Persistent Signals
```typescript
import { createPersistentSignal } from 'signalforge/utils';

const theme = createPersistentSignal('theme', 'light');
// Automatically saves to localStorage
// Restores on page reload
```

## 🛠️ Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with Compiler
- **SignalForge** - State management library
- **Tailwind CSS 4** - Styling
- **TypeScript** - Type safety

## 📁 Project Structure

```
app/
├── page.tsx                    # Home page with demo grid
├── components/
│   └── DemoLayout.tsx         # Shared layout for demo pages
└── demos/
    ├── basic/page.tsx         # Basic signal demo
    ├── computed/page.tsx      # Computed signals
    ├── effects/page.tsx       # Effects demo
    ├── batch/page.tsx         # Batch updates
    ├── subscribe/page.tsx     # Manual subscriptions
    ├── untrack/page.tsx       # Untracked reads
    ├── hooks/page.tsx         # React hooks
    ├── cart/page.tsx          # Shopping cart
    ├── form/page.tsx          # Form validation
    ├── todo/page.tsx          # Todo app
    ├── array/page.tsx         # Array signals
    ├── persistent/page.tsx    # Persistent signals
    ├── bigdata/page.tsx       # Performance test
    ├── devtools/page.tsx      # DevTools preview
    └── timetravel/page.tsx    # Time travel
```

## 🌟 Key Differences from Other State Management

### vs Redux
- **SignalForge**: `count.value++` (1 line)
- **Redux**: Actions, reducers, dispatch, connect (20+ lines)

### vs Context API
- **SignalForge**: No provider hell, automatic updates
- **Context**: Requires providers, manual optimization

### vs Zustand
- **SignalForge**: Fine-grained updates, no selectors needed
- **Zustand**: Store-based, requires selectors

### vs MobX
- **SignalForge**: 2KB bundle, simpler API
- **MobX**: 16KB bundle, more complex

## 📦 Installation

```bash
npm install signalforge
```

## 🔗 Links

- **npm Package**: https://www.npmjs.com/package/signalforge
- **GitHub**: https://github.com/forgecommunity/signalforge
- **Documentation**: See main repository README

## 💡 Why SignalForge?

1. **Easiest to Learn** - If you know variables, you know SignalForge
2. **Fastest Performance** - Fine-grained reactivity beats everything
3. **Smallest Bundle** - Only 2KB for the entire library
4. **Works Everywhere** - React, React Native, Node.js, vanilla JS
5. **Zero Config** - No providers, no boilerplate, just signals

## 🎨 Demo Highlights

- **Interactive UI** - Every demo has working controls
- **Code Examples** - Each demo shows the actual code
- **Responsive Design** - Works on mobile and desktop
- **Dark Mode** - Automatically adapts to system preference
- **Performance Metrics** - See real-time performance data

## 🤝 Contributing

Found a bug or want to add a feature? Contributions welcome!

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see the main SignalForge repository for details.

## 🙏 Credits

Built with ❤️ by [ForgeCommunity](https://github.com/forgecommunity)

---

**Ready to get started?** Run `npm run dev` and explore the demos at http://localhost:3000
