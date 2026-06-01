# React Native Guide

SignalForge works in React Native through the same core APIs used on the web. The optional native JSI path can be added later for lower overhead in very hot update paths, but the JavaScript fallback is the supported default and is what most apps should start with.

## Install

```bash
npm install signalforge
```

For the repository example app:

```bash
npm install
npm run build
npm install --prefix examples/sfReactNative
```

The example app depends on the workspace package, so build the library before running Metro.

## Core Usage

Create shared signals outside components and subscribe from React components.

```tsx
import { createSignal, createComputed, batch } from 'signalforge/core';
import { useSignalValue } from 'signalforge/react';
import { Button, Text, View } from 'react-native';

const firstName = createSignal('Ada');
const lastName = createSignal('Lovelace');
const fullName = createComputed(() => `${firstName.get()} ${lastName.get()}`);

export function ProfileName() {
  const name = useSignalValue(fullName);

  return (
    <View>
      <Text>{name}</Text>
      <Button
        title="Use Grace Hopper"
        onPress={() => {
          batch(() => {
            firstName.set('Grace');
            lastName.set('Hopper');
          });
        }}
      />
    </View>
  );
}
```

## Local Component State

Use `useSignal` when state belongs to one component.

```tsx
import { useSignal } from 'signalforge/react';
import { Button, Text, View } from 'react-native';

export function Counter() {
  const [count, setCount] = useSignal(0);

  return (
    <View>
      <Text>{count}</Text>
      <Button title="Increment" onPress={() => setCount((value) => value + 1)} />
    </View>
  );
}
```

## App Stores

Use the store API for feature state with multiple fields.

```ts
import { defineStore } from 'signalforge/core';

export const cartStore = defineStore('cart', {
  items: [] as Array<{ id: string; title: string; quantity: number }>,
});

export function addItem(id: string, title: string) {
  cartStore.update((state) => {
    const existing = state.items.find((item) => item.id === id);

    if (existing) {
      return {
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      };
    }

    return {
      items: [...state.items, { id, title, quantity: 1 }],
    };
  });
}
```

Read selected store state from components:

```tsx
import { useStoreSelector } from 'signalforge/react';

export function CartBadge() {
  const count = useStoreSelector(cartStore, (state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  return <Text>{count}</Text>;
}
```

## Persistence

SignalForge keeps persistence separate from the core. In React Native, wire AsyncStorage explicitly so the storage lifecycle is obvious.

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSignal } from 'signalforge/core';

export const theme = createSignal<'light' | 'dark'>('light');

export async function hydrateTheme() {
  const stored = await AsyncStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') {
    theme.set(stored);
  }
}

theme.subscribe((value) => {
  void AsyncStorage.setItem('theme', value);
});
```

Hydrate once during app startup before rendering screens that depend on persisted values.

## Optional Native JSI Path

The native integration is optional. Use it only after profiling shows signal updates are part of a real bottleneck.

1. Keep the JavaScript API unchanged.
2. Add the Android/iOS native module files from this repository.
3. Build the app with the platform toolchain.
4. Verify the fallback still works when the native module is unavailable.

Platform-specific details:

- [Android integration](./android-integration.md)
- [iOS integration](./ios-integration.md)
- [Native overview](./native-overview.md)

## Example App

```bash
npm run build
cd examples/sfReactNative
npm install
npm test
npm run android
```

`npm run ios` requires macOS and CocoaPods.

## Production Guidance

Prefer:

- Feature-level stores for app state.
- `useSignalValue` for shared signals.
- `useStoreSelector` for object state slices.
- `batch` when one user action writes several signals.
- Explicit persistence adapters for AsyncStorage, SecureStore, or SQLite.

Avoid:

- Creating shared signals inside render.
- Registering debug plugins in production unless they are required.
- Destroying signals that are still referenced by mounted components.
- Publishing benchmark ratios without the exact benchmark script, device, and runtime.

## Troubleshooting

If a component does not update, confirm it reads the signal through `useSignalValue`, `useComputed`, or `useStoreSelector`.

If Metro cannot resolve `signalforge`, run `npm run build` in the repository root, then reinstall the example dependencies.

If native initialization fails, confirm the JavaScript fallback works first. The fallback is part of the public behavior and should remain reliable.
