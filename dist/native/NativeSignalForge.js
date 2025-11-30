import { TurboModuleRegistry } from 'react-native';
export function __ensureTurboModuleLoaded__() {
    TurboModuleRegistry.get('NativeSignalForge');
}
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
const moduleName = 'NativeSignalForge';
const turboModuleProxy = TurboModuleRegistry.get(moduleName) ?? null;
=======
const turboModuleProxy = (() => {
    try {
        return TurboModuleRegistry.get(MODULE_NAME) ?? null;
    }
    catch {
        return null;
    }
})();
>>>>>>> theirs
=======
const turboModuleProxy = TurboModuleRegistry.get('NativeSignalForge') ??
    TurboModuleRegistry.get('SignalForge');
>>>>>>> theirs
=======
const turboModuleProxy = TurboModuleRegistry.get('NativeSignalForge') ??
    TurboModuleRegistry.get('SignalForge');
>>>>>>> theirs
export function getNativeModule() {
    try {
        const module = turboModuleProxy;
        if (module) {
            return module;
        }
        const registry = global?.TurboModuleRegistry;
        if (registry && typeof registry.get === 'function') {
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
            return registry.get(moduleName) ?? null;
=======
            const getModule = registry.get.bind(registry);
            return (getModule(MODULE_NAME) ??
                getModule(LEGACY_MODULE_NAME));
>>>>>>> theirs
=======
            return (registry.get('NativeSignalForge') ??
                registry.get('SignalForge'));
>>>>>>> theirs
=======
            return (registry.get('NativeSignalForge') ??
                registry.get('SignalForge'));
>>>>>>> theirs
        }
        return null;
    }
    catch (e) {
        return null;
    }
}
export default getNativeModule();
