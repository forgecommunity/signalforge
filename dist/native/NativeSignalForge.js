import { TurboModuleRegistry } from 'react-native';
export function __ensureTurboModuleLoaded__() {
    TurboModuleRegistry.get('NativeSignalForge');
}
const moduleName = 'NativeSignalForge';
const turboModuleProxy = TurboModuleRegistry.get(moduleName) ?? null;
export function getNativeModule() {
    try {
        const module = turboModuleProxy;
        if (module) {
            return module;
        }
        const registry = global?.TurboModuleRegistry;
        if (registry && typeof registry.get === 'function') {
            return registry.get(moduleName) ?? null;
        }
        return null;
    }
    catch (e) {
        return null;
    }
}
export default getNativeModule();
