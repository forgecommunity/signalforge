# SignalForge React Native Example

This app exercises SignalForge in React Native with real screens for signals, computed values, effects, batching, persistence, shared app state, and DevTools-style inspection.

The example is for integration testing and learning. It avoids hardcoded performance ratios because React Native results depend on device, engine, build type, and native module availability.

## Prerequisites

- Node.js 20+
- React Native development environment
- Android Studio for Android
- macOS, Xcode, and CocoaPods for iOS

## Run

From the repository root:

```bash
npm install
npm run build
npm install --prefix examples/sfReactNative
npm test --prefix examples/sfReactNative
```

Then run one platform:

```bash
cd examples/sfReactNative
npm run android
# or, on macOS:
npm run ios
```

## Demo Screens

| Screen | Purpose |
| --- | --- |
| Basic Signal | Create, read, update, and subscribe to a signal |
| Computed Signal | Derive values from other signals |
| Effects | Run cleanup-aware side effects |
| Batch Updates | Coalesce related writes into one flush |
| Subscribe | Use manual subscriptions outside React |
| Untrack | Read without dependency tracking |
| React Hooks | Use `useSignal`, `useSignalValue`, and `useSignalEffect` |
| Shopping Cart | Shared state with computed totals |
| Form Validation | Reactive validation and field errors |
| Todo App | CRUD state and filtered counts |
| Persistent Signal | AsyncStorage-backed persistence |
| Time Travel | Example-level undo and redo |
| DevTools | Runtime signal inspection patterns |
| Big Data | Large list update behavior |

## Import Pattern

```tsx
import { createSignal, createComputed, batch } from 'signalforge/core';
import { useSignalValue } from 'signalforge/react';
```

Use `signalforge/core` for framework-agnostic primitives and `signalforge/react` for hooks and React helpers.

## Persistence Pattern

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSignal } from 'signalforge/core';

const theme = createSignal<'light' | 'dark'>('light');

theme.subscribe((value) => {
  void AsyncStorage.setItem('theme', value);
});
```

Persistence is intentionally explicit so apps can choose AsyncStorage, SecureStore, SQLite, or their own storage layer.

## Verification Notes

`npm test` validates the React Native test harness. Full Android and iOS builds require local SDK setup and are not part of the root package CI.
