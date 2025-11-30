import { TurboModuleRegistry } from 'react-native';
export function __ensureTurboModuleLoaded__() {
    TurboModuleRegistry.get('NativeSignalForge');
}
const moduleName = 'NativeSignalForge';
const legacyModuleName = 'SignalForge';
const turboModuleProxy = TurboModuleRegistry.get(moduleName) ??
    TurboModuleRegistry.get(legacyModuleName);
export function getNativeModule() {
    try {
        const module = turboModuleProxy;
        if (module) {
            return module;
        }
        const registry = global?.TurboModuleRegistry;
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
