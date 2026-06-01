# React Native Native Integration

This guide explains how SignalForge's optional native bridge fits into a React Native app. Most apps can start with the JavaScript implementation and add native bindings only after profiling shows a need.

## Architecture

```text
App code
  -> signalforge/core and signalforge/react
  -> optional signalforge native bridge
     -> JSI direct binding when installed
     -> TurboModule when available
     -> JavaScript fallback when native support is absent
```

The bridge is designed to fail open to JavaScript. Missing native modules should not block tests, SSR-like tooling, Expo previews, or unsupported development environments.

## Integration Steps

1. Install SignalForge in the React Native app.
2. Use the normal public APIs first:

```ts
import { createSignal } from 'signalforge/core';
import { useSignalValue } from 'signalforge/react';
```

3. Add native bindings only if the app needs them and you can test both Android and iOS builds.
4. Keep the JavaScript fallback path enabled for development and unsupported devices.

## Runtime Detection

Use the bridge diagnostics to confirm which path is active:

```ts
import { jsiBridge } from 'signalforge/native';

console.log(jsiBridge.isUsingNative() ? 'native' : 'javascript');
```

Do not assume native acceleration is active just because the app is running on React Native. The native module must be compiled, linked, and loaded by the app.

## Measurement

Measure the app workload that matters:

- screen interactions that update many values
- list filtering and sorting
- animation-adjacent state updates
- startup and hydration paths
- memory growth after repeated mount/unmount cycles

Record device model, OS, React Native version, JavaScript engine, build mode, and test workload with every benchmark result.

## Failure Handling

The bridge should behave safely when native support is unavailable:

- create and update signals through JavaScript
- avoid throwing during module import
- keep tests deterministic
- log useful diagnostics for native setup issues

## Launch Guidance

For public docs and release notes, describe native support as optional and measurable. Avoid fixed speedup claims unless they come from a published benchmark methodology and are scoped to that exact workload.
