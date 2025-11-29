import { startLatencyMeasurement, endLatencyMeasurement, isProfilerEnabled } from './performanceProfiler';
class DevToolsEventEmitter {
    constructor() {
        this.listeners = new Map();
        this.sequence = 0;
    }
    on(eventType, listener) {
        const key = eventType;
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(listener);
        return () => this.off(eventType, listener);
    }
    off(eventType, listener) {
        const key = eventType;
        const listenerSet = this.listeners.get(key);
        if (listenerSet) {
            listenerSet.delete(listener);
            if (listenerSet.size === 0) {
                this.listeners.delete(key);
            }
        }
    }
    emit(eventType, payload) {
        const event = {
            type: eventType,
            payload,
            timestamp: Date.now(),
            sequence: ++this.sequence,
        };
        const specificListeners = this.listeners.get(eventType);
        if (specificListeners) {
            for (const listener of specificListeners) {
                try {
                    listener(event);
                }
                catch (error) {
                    console.error(`[DevTools] Error in listener for ${eventType}:`, error);
                }
            }
        }
        const wildcardListeners = this.listeners.get('*');
        if (wildcardListeners) {
            for (const listener of wildcardListeners) {
                try {
                    listener(event);
                }
                catch (error) {
                    console.error('[DevTools] Error in wildcard listener:', error);
                }
            }
        }
    }
    removeAllListeners() {
        this.listeners.clear();
        this.sequence = 0;
    }
    getListenerCount(eventType) {
        if (eventType) {
            return this.listeners.get(eventType)?.size || 0;
        }
        let total = 0;
        for (const listenerSet of this.listeners.values()) {
            total += listenerSet.size;
        }
        return total;
    }
}
export let __DEVTOOLS__ = typeof process !== 'undefined'
    ? process.env.NODE_ENV !== 'production'
    : true;
const config = {
    enabled: false,
    trackPerformance: true,
    logToConsole: false,
    maxPerformanceSamples: 1000,
    slowUpdateThreshold: 16,
    emitPerformanceWarnings: true,
};
const signalRegistry = new Map();
const signalToIdMap = new WeakMap();
const performanceMetrics = [];
let signalIdCounter = 0;
const eventEmitter = new DevToolsEventEmitter();
export function enableDevTools(options = {}) {
    __DEVTOOLS__ = true;
    Object.assign(config, options);
    config.enabled = true;
    if (config.logToConsole) {
        console.log('[SignalForge DevTools] Enabled', config);
    }
}
export function disableDevTools() {
    __DEVTOOLS__ = false;
    config.enabled = false;
    if (config.logToConsole) {
        console.log('[SignalForge DevTools] Disabled');
    }
}
export function isDevToolsEnabled() {
    return __DEVTOOLS__ && config.enabled;
}
export function getDevToolsConfig() {
    return { ...config };
}
export function registerSignal(signal, type, initialValue, name) {
    if (!isDevToolsEnabled()) {
        return '';
    }
    const id = `${type}_${++signalIdCounter}`;
    let creationStack;
    if (typeof Error !== 'undefined') {
        try {
            throw new Error();
        }
        catch (e) {
            creationStack = e.stack
                ?.split('\n')
                .slice(2, 6)
                .join('\n');
        }
    }
    const metadata = {
        id,
        name,
        type,
        value: safeSerialize(initialValue),
        subscriberCount: 0,
        dependencies: [],
        subscribers: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        updateCount: 0,
        creationStack,
    };
    signalRegistry.set(id, metadata);
    signalToIdMap.set(signal, id);
    eventEmitter.emit('signal-created', {
        id,
        type,
        initialValue: metadata.value,
        name,
        creationStack,
    });
    if (config.logToConsole) {
        console.log(`[SignalForge] Created ${type} "${id}"`, metadata);
    }
    return id;
}
export function unregisterSignal(signal) {
    if (!isDevToolsEnabled()) {
        return;
    }
    const id = signalToIdMap.get(signal);
    if (!id) {
        return;
    }
    const metadata = signalRegistry.get(id);
    if (metadata) {
        const lifetime = Date.now() - metadata.createdAt;
        eventEmitter.emit('signal-destroyed', {
            id,
            type: metadata.type,
            finalValue: metadata.value,
            lifetime,
        });
    }
    signalRegistry.delete(id);
    signalToIdMap.delete(signal);
    if (config.logToConsole) {
        console.log(`[SignalForge] Destroyed signal "${id}"`);
    }
}
export function trackUpdate(signal, updateFn, previousValue) {
    if (!isDevToolsEnabled()) {
        updateFn();
        return;
    }
    const id = signalToIdMap.get(signal);
    if (!id) {
        updateFn();
        return;
    }
    const metadata = signalRegistry.get(id);
    if (!metadata) {
        updateFn();
        return;
    }
    const startTime = performance.now();
    let skipped = false;
    let newValue;
    if (isProfilerEnabled()) {
        startLatencyMeasurement(id, metadata.subscribers.length);
    }
    try {
        updateFn();
        newValue = (signal._peek ? signal._peek() : signal.get());
        skipped = Object.is(previousValue, newValue);
    }
    catch (error) {
        console.error(`[SignalForge] Error updating signal "${id}"`, error);
        throw error;
    }
    finally {
        const endTime = performance.now();
        const duration = endTime - startTime;
        if (isProfilerEnabled()) {
            endLatencyMeasurement(id, metadata.type, skipped);
        }
        metadata.value = safeSerialize(newValue);
        metadata.updatedAt = Date.now();
        if (!skipped) {
            metadata.updateCount++;
        }
        if (config.trackPerformance) {
            const metric = {
                signalId: id,
                type: metadata.type,
                timestamp: startTime,
                duration,
                skipped,
                previousValue: safeSerialize(previousValue),
                newValue: safeSerialize(newValue),
            };
            addPerformanceMetric(metric);
            if (config.emitPerformanceWarnings && duration > config.slowUpdateThreshold) {
                eventEmitter.emit('performance-warning', {
                    signalId: id,
                    type: metadata.type,
                    duration,
                    threshold: config.slowUpdateThreshold,
                    message: `Slow update detected: ${duration.toFixed(2)}ms (threshold: ${config.slowUpdateThreshold}ms)`,
                });
            }
            if (config.logToConsole && duration > config.slowUpdateThreshold) {
                console.warn(`[SignalForge] Slow update: "${id}" took ${duration.toFixed(2)}ms`, metric);
            }
        }
        eventEmitter.emit('signal-updated', {
            id,
            previousValue: safeSerialize(previousValue),
            newValue: safeSerialize(newValue),
            duration,
            skipped,
        });
    }
}
export function trackDependency(subscriber, dependency) {
    if (!isDevToolsEnabled()) {
        return;
    }
    const subscriberId = signalToIdMap.get(subscriber);
    const dependencyId = signalToIdMap.get(dependency);
    if (!subscriberId || !dependencyId) {
        return;
    }
    const subscriberMeta = signalRegistry.get(subscriberId);
    const dependencyMeta = signalRegistry.get(dependencyId);
    if (!subscriberMeta || !dependencyMeta) {
        return;
    }
    if (!subscriberMeta.dependencies.includes(dependencyId)) {
        subscriberMeta.dependencies.push(dependencyId);
    }
    if (!dependencyMeta.subscribers.includes(subscriberId)) {
        dependencyMeta.subscribers.push(subscriberId);
    }
    dependencyMeta.subscriberCount = dependencyMeta.subscribers.length;
    eventEmitter.emit('dependency-added', {
        subscriberId,
        dependencyId,
    });
}
export function untrackDependency(subscriber, dependency) {
    if (!isDevToolsEnabled()) {
        return;
    }
    const subscriberId = signalToIdMap.get(subscriber);
    const dependencyId = signalToIdMap.get(dependency);
    if (!subscriberId || !dependencyId) {
        return;
    }
    const subscriberMeta = signalRegistry.get(subscriberId);
    const dependencyMeta = signalRegistry.get(dependencyId);
    if (!subscriberMeta || !dependencyMeta) {
        return;
    }
    subscriberMeta.dependencies = subscriberMeta.dependencies.filter(id => id !== dependencyId);
    dependencyMeta.subscribers = dependencyMeta.subscribers.filter(id => id !== subscriberId);
    dependencyMeta.subscriberCount = dependencyMeta.subscribers.length;
    eventEmitter.emit('dependency-removed', {
        subscriberId,
        dependencyId,
    });
}
export function listSignals() {
    if (!isDevToolsEnabled()) {
        console.warn('[SignalForge] DevTools is not enabled');
        return [];
    }
    return Array.from(signalRegistry.values()).sort((a, b) => a.createdAt - b.createdAt);
}
export function getActivePlugins() {
    if (!isDevToolsEnabled()) {
        return [];
    }
    try {
        const pluginManager = require('../core/pluginManager');
        if (pluginManager && pluginManager.__getPluginInfoForDevTools) {
            return pluginManager.__getPluginInfoForDevTools();
        }
    }
    catch (error) {
        console.debug('[DevTools] Plugin manager not available');
    }
    return [];
}
export function getSignal(id) {
    if (!isDevToolsEnabled()) {
        console.warn('[SignalForge] DevTools is not enabled');
        return undefined;
    }
    return signalRegistry.get(id);
}
export function getDependencies(id) {
    if (!isDevToolsEnabled()) {
        console.warn('[SignalForge] DevTools is not enabled');
        return [];
    }
    const metadata = signalRegistry.get(id);
    return metadata?.dependencies || [];
}
export function getSubscribers(id) {
    if (!isDevToolsEnabled()) {
        console.warn('[SignalForge] DevTools is not enabled');
        return [];
    }
    const metadata = signalRegistry.get(id);
    return metadata?.subscribers || [];
}
export function onDevToolsEvent(eventType, listener) {
    return eventEmitter.on(eventType, listener);
}
export function offDevToolsEvent(eventType, listener) {
    eventEmitter.off(eventType, listener);
}
export function getEventListenerCount(eventType) {
    return eventEmitter.getListenerCount(eventType);
}
export function clearEventListeners() {
    eventEmitter.removeAllListeners();
}
export function getPerformanceMetrics(limit) {
    if (!isDevToolsEnabled()) {
        console.warn('[SignalForge] DevTools is not enabled');
        return [];
    }
    const metrics = [...performanceMetrics];
    return limit ? metrics.slice(-limit) : metrics;
}
export function clearPerformanceMetrics() {
    performanceMetrics.length = 0;
}
function safeSerialize(value) {
    try {
        if (value === null ||
            typeof value === 'undefined' ||
            typeof value === 'boolean' ||
            typeof value === 'number' ||
            typeof value === 'string') {
            return value;
        }
        if (typeof value === 'function') {
            return `[Function: ${value.name || 'anonymous'}]`;
        }
        if (value instanceof Date) {
            return value.toISOString();
        }
        if (Array.isArray(value)) {
            return value.slice(0, 10).map(safeSerialize);
        }
        if (typeof value === 'object') {
            const keys = Object.keys(value).slice(0, 10);
            const result = {};
            for (const key of keys) {
                result[key] = safeSerialize(value[key]);
            }
            return result;
        }
        return String(value);
    }
    catch (error) {
        return '[Unserializable]';
    }
}
function addPerformanceMetric(metric) {
    performanceMetrics.push(metric);
    if (performanceMetrics.length > config.maxPerformanceSamples) {
        performanceMetrics.shift();
    }
}
