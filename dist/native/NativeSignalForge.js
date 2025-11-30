import { TurboModuleRegistry } from 'react-native';
const turboModuleProxy = TurboModuleRegistry.get('NativeSignalForge') ??
    TurboModuleRegistry.get('SignalForge');
export function getNativeModule() {
    try {
        const module = turboModuleProxy;
        if (module) {
            return module;
        }
        const registry = global?.TurboModuleRegistry;
        if (registry && typeof registry.get === 'function') {
            return (registry.get('NativeSignalForge') ??
                registry.get('SignalForge'));
        }
        return null;
    }
    catch (e) {
        return null;
    }
}
export default getNativeModule();
