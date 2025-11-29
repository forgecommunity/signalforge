export function installJSIBindings() {
    if (typeof global.__signalForgeCreateSignal === 'function') {
        return true;
    }
    if (typeof global.installSignalForgeJSI === 'function') {
        try {
            const result = global.installSignalForgeJSI();
            if (result) {
                console.log('[SignalForge] JSI bindings installed successfully');
                return true;
            }
        }
        catch (error) {
            console.error('[SignalForge] Failed to install JSI bindings:', error);
        }
    }
    if (typeof global.__signalForgeCreateSignal === 'function') {
        console.log('[SignalForge] JSI bindings already available');
        return true;
    }
    console.warn('[SignalForge] Native module not available, using JavaScript fallback');
    return false;
}
export function isNativeAvailable() {
    return typeof global.__signalForgeCreateSignal === 'function';
}
export function getRuntimeInfo() {
    return {
        nativeAvailable: isNativeAvailable(),
        engine: getJavaScriptEngine(),
        platform: getPlatform(),
        architecture: getArchitecture(),
    };
}
function getJavaScriptEngine() {
    if (typeof global.HermesInternal !== 'undefined') {
        return 'Hermes';
    }
    if (typeof global.__v8 !== 'undefined') {
        return 'V8';
    }
    if (typeof global.nativePerformanceNow !== 'undefined') {
        return 'JSC';
    }
    return 'Unknown';
}
function getPlatform() {
    if (typeof navigator !== 'undefined') {
        const userAgent = navigator.userAgent || '';
        if (/android/i.test(userAgent))
            return 'Android';
        if (/iPad|iPhone|iPod/.test(userAgent))
            return 'iOS';
        if (typeof window !== 'undefined')
            return 'Web';
    }
    return 'Unknown';
}
function getArchitecture() {
    if (typeof global.__ARCH__ === 'string') {
        return global.__ARCH__;
    }
    return 'Unknown';
}
export function runPerformanceBenchmark() {
    if (!isNativeAvailable()) {
        console.warn('[SignalForge] Native module not available, cannot run benchmark');
        return null;
    }
    const operations = 100000;
    const signalIds = [];
    console.log(`[SignalForge] Running benchmark (${operations} operations)...`);
    const startTime = Date.now();
    for (let i = 0; i < 100; i++) {
        const id = global.__signalForgeCreateSignal(i);
        signalIds.push(id);
    }
    for (let i = 0; i < operations; i++) {
        const idx = i % signalIds.length;
        const signalId = signalIds[idx];
        global.__signalForgeGetSignal(signalId);
        global.__signalForgeSetSignal(signalId, i);
        global.__signalForgeGetVersion(signalId);
    }
    for (const id of signalIds) {
        global.__signalForgeDeleteSignal(id);
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
export function printDiagnostics() {
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
export default {
    installJSIBindings,
    isNativeAvailable,
    getRuntimeInfo,
    runPerformanceBenchmark,
    printDiagnostics,
};
