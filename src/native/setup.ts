/**
 * React Native Setup and Installation Script
 * 
 * This file provides setup instructions and installation helper for
 * integrating SignalForge's native JSI module into a React Native project.
 */

/**
 * Installation Instructions
 * =========================
 * 
 * For React Native 0.68+ with New Architecture:
 * 
 * 1. Install SignalForge:
 *    ```bash
 *    npm install signalforge
 *    # or
 *    yarn add signalforge
 *    ```
 * 
 * 2. Enable New Architecture (if not already enabled):
 *    
 *    Android (android/gradle.properties):
 *    ```properties
 *    newArchEnabled=true
 *    ```
 *    
 *    iOS (ios/Podfile):
 *    ```ruby
 *    ENV['RCT_NEW_ARCH_ENABLED'] = '1'
 *    ```
 * 
 * 3. Link native module:
 *    
 *    Android: Already auto-linked via Gradle
 *    iOS: Run pod install
 *    ```bash
 *    cd ios && pod install && cd ..
 *    ```
 * 
 * 4. Rebuild the app:
 *    ```bash
 *    # Android
 *    cd android && ./gradlew clean && cd ..
 *    npx react-native run-android
 *    
 *    # iOS
 *    cd ios && xcodebuild clean && cd ..
 *    npx react-native run-ios
 *    ```
 * 
 * For React Native < 0.68 (Old Architecture):
 * 
 * The JSI bindings will still work, but you'll need to manually install
 * the native module using the JSI installer function.
 * 
 * See: examples/react-native-legacy-setup.ts
 */

/**
 * Runtime Installation (Old Architecture)
 * 
 * For React Native projects not using the new architecture,
 * you can manually install the JSI bindings at runtime.
 */

// Type declaration for JSI installer (provided by native module)
declare global {
  var installSignalForgeJSI: (() => boolean) | undefined;
}

type NativeInstaller = (() => boolean) | undefined;

/**
 * Resolve the best available native installer.
 *
 * Priority order:
 * 1) A global injected installer (old architecture/manual install)
 * 2) The native module exported via React Native (new architecture default)
 */
function getNativeInstaller(): NativeInstaller {
  if (typeof global.installSignalForgeJSI === 'function') {
    return global.installSignalForgeJSI;
  }

  try {
    // Lazy-require so web/Node builds do not attempt to load react-native
    const { NativeModules } = require('react-native');
    const installer = NativeModules?.SignalForge?.install;
    if (typeof installer === 'function') {
      return installer;
    }
  } catch (error) {
    // Non-react-native environments will land here (expected)
  }

  return undefined;
}

/**
 * Install JSI bindings at runtime
 * 
 * Call this once during app initialization, before using any
 * signal operations. This installs the native JSI functions
 * into the global scope.
 * 
 * Returns true if installation succeeded, false otherwise.
 * 
 * Example:
 * ```typescript
 * import { installJSIBindings } from 'signalforge/native/setup';
 * 
 * // In your App.tsx or index.js:
 * if (installJSIBindings()) {
 *   console.log('SignalForge native JSI installed!');
 * } else {
 *   console.warn('SignalForge running in JS fallback mode');
 * }
 * ```
 */
export function installJSIBindings(): boolean {
  // Check if already installed
  if (typeof global.__signalForgeCreateSignal === 'function') {
    return true;
  }

  // Check if installer function is available
  const installer = getNativeInstaller();
  if (typeof installer === 'function') {
    try {
      const result = installer();
      if (result) {
        console.log('[SignalForge] JSI bindings installed successfully');
        return true;
      }
    } catch (error) {
      console.error('[SignalForge] Failed to install JSI bindings:', error);
    }
  }

  // Check if JSI module was loaded but not installed
  if (typeof global.__signalForgeCreateSignal === 'function') {
    console.log('[SignalForge] JSI bindings already available');
    return true;
  }

  console.warn('[SignalForge] Native module not available, using JavaScript fallback');
  return false;
}

/**
 * Check if native JSI bindings are available
 * 
 * Useful for conditional logic or diagnostics.
 */
export function isNativeAvailable(): boolean {
  return typeof global.__signalForgeCreateSignal === 'function';
}

/**
 * Get information about the current runtime
 */
export function getRuntimeInfo() {
  return {
    nativeAvailable: isNativeAvailable(),
    engine: getJavaScriptEngine(),
    platform: getPlatform(),
    architecture: getArchitecture(),
  };
}

/**
 * Detect which JavaScript engine is running
 */
function getJavaScriptEngine(): 'Hermes' | 'JSC' | 'V8' | 'Unknown' {
  // Check for Hermes
  if (typeof (global as any).HermesInternal !== 'undefined') {
    return 'Hermes';
  }

  // Check for V8 (Chrome DevTools, Android)
  if (typeof (global as any).__v8 !== 'undefined') {
    return 'V8';
  }

  // Check for JSC (iOS default)
  if (typeof (global as any).nativePerformanceNow !== 'undefined') {
    return 'JSC';
  }

  return 'Unknown';
}

/**
 * Detect the platform
 */
function getPlatform(): 'iOS' | 'Android' | 'Web' | 'Unknown' {
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent || '';
    if (/android/i.test(userAgent)) return 'Android';
    if (/iPad|iPhone|iPod/.test(userAgent)) return 'iOS';
    if (typeof window !== 'undefined') return 'Web';
  }

  // In React Native, Platform module would be better
  // but we avoid the import to keep this file standalone
  return 'Unknown';
}

/**
 * Detect architecture (for debugging)
 */
function getArchitecture(): string {
  // This is approximate - actual arch detection needs native module
  if (typeof (global as any).__ARCH__ === 'string') {
    return (global as any).__ARCH__;
  }
  return 'Unknown';
}

/**
 * Performance testing utility
 * 
 * Run a benchmark comparing native vs JS performance.
 * Only available in development builds.
 */
export function runPerformanceBenchmark(): {
  nativeAvailable: boolean;
  operations: number;
  timeMs: number;
  opsPerSecond: number;
} | null {
  if (!isNativeAvailable()) {
    console.warn('[SignalForge] Native module not available, cannot run benchmark');
    return null;
  }

  const operations = 100000;
  const signalIds: string[] = [];

  console.log(`[SignalForge] Running benchmark (${operations} operations)...`);

  const startTime = Date.now();

  // Create signals
  for (let i = 0; i < 100; i++) {
    const id = global.__signalForgeCreateSignal!(i);
    signalIds.push(id);
  }

  // Read/write operations
  for (let i = 0; i < operations; i++) {
    const idx = i % signalIds.length;
    const signalId = signalIds[idx];

    // Read
    global.__signalForgeGetSignal!(signalId);

    // Write
    global.__signalForgeSetSignal!(signalId, i);

    // Check version
    global.__signalForgeGetVersion!(signalId);
  }

  // Cleanup
  for (const id of signalIds) {
    global.__signalForgeDeleteSignal!(id);
  }

  const endTime = Date.now();
  const timeMs = endTime - startTime;
  const opsPerSecond = Math.round((operations / timeMs) * 1000);

  const result = {
    nativeAvailable: true,
    operations,
    timeMs,
    opsPerSecond,
  };

  console.log(`[SignalForge] Benchmark complete:`, result);

  return result;
}

/**
 * Diagnostic utility - print all available information
 */
export function printDiagnostics(): void {
  console.log('=== SignalForge Native Diagnostics ===');
  
  const runtimeInfo = getRuntimeInfo();
  console.log('Runtime Info:', JSON.stringify(runtimeInfo, null, 2));

  console.log('\nGlobal JSI Functions:');
  console.log('  __signalForgeCreateSignal:', typeof global.__signalForgeCreateSignal);
  console.log('  __signalForgeGetSignal:', typeof global.__signalForgeGetSignal);
  console.log('  __signalForgeSetSignal:', typeof global.__signalForgeSetSignal);
  console.log('  __signalForgeHasSignal:', typeof global.__signalForgeHasSignal);
  console.log('  __signalForgeDeleteSignal:', typeof global.__signalForgeDeleteSignal);
  console.log('  __signalForgeGetVersion:', typeof global.__signalForgeGetVersion);
  console.log('  __signalForgeBatchUpdate:', typeof global.__signalForgeBatchUpdate);

  console.log('\n=====================================');
}

/**
 * Default export for convenience
 */
export default {
  installJSIBindings,
  isNativeAvailable,
  getRuntimeInfo,
  runPerformanceBenchmark,
  printDiagnostics,
};
