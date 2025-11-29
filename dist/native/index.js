export { default as jsiBridge } from './jsiBridge';
export { installJSIBindings, isNativeAvailable, getRuntimeInfo, runPerformanceBenchmark, printDiagnostics, } from './setup';
export { getNativeModule } from './NativeSignalForge';
import jsiBridge from './jsiBridge';
export const { createSignal, getSignal, setSignal, hasSignal, deleteSignal, getSignalVersion, batchUpdate, isUsingNative, getImplementationInfo, } = jsiBridge;
export default jsiBridge;
