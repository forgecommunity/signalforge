import { TurboModuleRegistry } from 'react-native';
export function __ensureTurboModuleLoaded__() {
    TurboModuleRegistry.get('NativeSignalForge');
}
const moduleName = 'NativeSignalForge';
const legacyModuleName = 'SignalForge';
export function getNativeModule() {
    try {
        const registry = global?.TurboModuleRegistry ?? TurboModuleRegistry;
        if (registry && typeof registry.get === 'function') {
            return (registry.get(moduleName) ??
                registry.get(legacyModuleName));
        }
        return null;
    }
    catch (e) {
        return null;
    }
}
export default getNativeModule();
