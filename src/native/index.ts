/**
 * SignalForge Native Module - Entry Point
 * 
 * This file serves as the main entry point for the native JSI module.
 * It exports all public APIs and provides convenience functions for
 * React Native integration.
 */

// Export the main JSI bridge (primary API)
export { default as jsiBridge } from './jsiBridge';
export type { SignalRef } from './jsiBridge';

// Export setup and diagnostic utilities
export {
  installJSIBindings,
  isNativeAvailable,
  getRuntimeInfo,
  runPerformanceBenchmark,
  printDiagnostics,
} from './setup';

// Export TurboModule spec (for new architecture)
export { getNativeModule } from './NativeSignalForge';
export type { Spec as NativeSignalForgeSpec } from './NativeSignalForge';

/**
 * Convenience re-exports for common operations
 */
import jsiBridge from './jsiBridge';

export const {
  createSignal,
  getSignal,
  setSignal,
  hasSignal,
  deleteSignal,
  getSignalVersion,
  batchUpdate,
  isUsingNative,
  getImplementationInfo,
} = jsiBridge;

/**
 * Default export is the JSI bridge
 */
export default jsiBridge;
