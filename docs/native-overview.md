# Native Bridge Overview

SignalForge includes an optional React Native native bridge surface. The JavaScript implementation remains the default compatibility path, and native acceleration is used only when the host app installs the required native bindings.

## Runtime Shape

```text
React Native app
  -> signalforge/native jsiBridge
     -> JSI globals when installed
     -> TurboModule when available
     -> JavaScript fallback otherwise
```

The fallback path is intentional. Apps can adopt SignalForge without native setup, then add native integration later if their measured workload needs it.

## Components

- `src/native/jsiBridge.ts`: TypeScript runtime bridge and JavaScript fallback.
- `src/native/NativeSignalForge.ts`: TurboModule type surface.
- `src/types/react-native.d.ts`: React Native module declarations used by TypeScript.
- `docs/android-integration.md`: Android native setup notes.
- `docs/ios-integration.md`: iOS native setup notes.
- `docs/react-native-guide.md`: application-level usage guide.

## Behavior

- Detects native bridge availability at runtime.
- Falls back to JavaScript when native bindings are unavailable.
- Exposes create, read, write, delete, version, and batch operations through one wrapper.
- Keeps native support optional so Expo, tests, and unsupported environments do not crash.

## When To Use Native

Start with the JavaScript path unless profiling shows a real bottleneck in a React Native app. Native integration is most relevant when an app performs many state reads or writes inside high-frequency interactions.

Before promoting native acceleration in release notes, measure on the target devices, engine, app shape, and build mode. Micro-benchmarks are useful for regression tracking, but they are not universal proof for every application.

## Production Checklist

- Verify JavaScript fallback works in tests.
- Verify Hermes and JavaScriptCore behavior for the target app.
- Build Android and iOS release variants in CI or release automation.
- Measure native and fallback paths on representative devices.
- Document any app-specific native setup required by consumers.

## Current Position

Native support is an optional advanced path. The public package should describe it as available with fallback, not as a required setup step or as a guaranteed speed multiplier.
