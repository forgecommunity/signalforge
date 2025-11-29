export function getNativeModule() {
    try {
        const registry = global?.TurboModuleRegistry;
        if (registry && typeof registry.get === 'function') {
            return registry.get('SignalForge');
        }
        return null;
    }
    catch (e) {
        return null;
    }
}
export default getNativeModule();
