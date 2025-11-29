export let __DEVTOOLS__ = false;
const config = {
    enabled: false,
    trackPerformance: true,
    logToConsole: false,
    maxPerformanceSamples: 1000,
    flipperEnabled: false,
};
const signalRegistry = new Map();
const signalToIdMap = new WeakMap();
const performanceMetrics = [];
let signalIdCounter = 0;
let flipperConnection = null;
export function enableDevTools(options = {}) {
    __DEVTOOLS__ = true;
    Object.assign(config, options);
    config.enabled = true;
    if (config.logToConsole) {
        console.log('[SignalForge DevTools] Enabled', config);
    }
    if (config.flipperEnabled) {
        connectToFlipper();
    }
}
export function disableDevTools() {
    __DEVTOOLS__ = false;
    config.enabled = false;
    if (flipperConnection) {
        disconnectFromFlipper();
    }
}
export function isDevToolsEnabled() {
    return __DEVTOOLS__ && config.enabled;
}
export function registerSignal(signal, type, initialValue) {
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
            creationStack = e.stack?.split('\n').slice(2, 6).join('\n');
        }
    }
    const metadata = {
        id,
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
    if (config.logToConsole) {
        console.log(`[SignalForge] Registered ${type} "${id}"`, metadata);
    }
    sendToFlipper('signalRegistered', metadata);
    return id;
}
export function unregisterSignal(signal) {
    if (!isDevToolsEnabled()) {
        return;
    }
    const id = signalToIdMap.get(signal);
    if (id) {
        signalRegistry.delete(id);
        signalToIdMap.delete(signal);
        if (config.logToConsole) {
            console.log(`[SignalForge] Unregistered signal "${id}"`);
        }
        sendToFlipper('signalUnregistered', { id });
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
            if (config.logToConsole && duration > 16) {
                console.warn(`[SignalForge] Slow update detected: "${id}" took ${duration.toFixed(2)}ms`, metric);
            }
        }
        sendToFlipper('signalUpdated', {
            id,
            value: metadata.value,
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
}
export function listSignals() {
    if (!isDevToolsEnabled()) {
        console.warn('[SignalForge] DevTools is not enabled');
        return [];
    }
    return Array.from(signalRegistry.values()).sort((a, b) => a.createdAt - b.createdAt);
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
export function getDependencyGraph() {
    if (!isDevToolsEnabled()) {
        console.warn('[SignalForge] DevTools is not enabled');
        return [];
    }
    const nodes = [];
    const depthMap = new Map();
    const calculateDepth = (id, currentDepth = 0) => {
        const existing = depthMap.get(id);
        if (existing !== undefined) {
            return Math.max(existing, currentDepth);
        }
        depthMap.set(id, currentDepth);
        const metadata = signalRegistry.get(id);
        if (metadata) {
            for (const subscriberId of metadata.subscribers) {
                calculateDepth(subscriberId, currentDepth + 1);
            }
        }
        return currentDepth;
    };
    for (const [id, metadata] of signalRegistry) {
        if (metadata.dependencies.length === 0) {
            calculateDepth(id, 0);
        }
    }
    for (const [id, metadata] of signalRegistry) {
        nodes.push({
            id,
            type: metadata.type,
            dependencies: metadata.dependencies,
            subscribers: metadata.subscribers,
            depth: depthMap.get(id) || 0,
        });
    }
    return nodes.sort((a, b) => a.depth - b.depth);
}
export function getSignalsByType(type) {
    if (!isDevToolsEnabled()) {
        console.warn('[SignalForge] DevTools is not enabled');
        return [];
    }
    return Array.from(signalRegistry.values()).filter(signal => signal.type === type);
}
export function getPerformanceMetrics(limit) {
    if (!isDevToolsEnabled()) {
        console.warn('[SignalForge] DevTools is not enabled');
        return [];
    }
    const metrics = [...performanceMetrics];
    return limit ? metrics.slice(-limit) : metrics;
}
export function getPerformanceSummary() {
    if (!isDevToolsEnabled()) {
        console.warn('[SignalForge] DevTools is not enabled');
        return {
            totalUpdates: 0,
            totalDuration: 0,
            averageDuration: 0,
            slowestUpdate: null,
            updatesByType: {},
        };
    }
    let totalDuration = 0;
    let slowestUpdate = null;
    const updatesByType = {
        signal: 0,
        computed: 0,
        effect: 0,
    };
    for (const metric of performanceMetrics) {
        if (!metric.skipped) {
            totalDuration += metric.duration;
            updatesByType[metric.type]++;
            if (!slowestUpdate || metric.duration > slowestUpdate.duration) {
                slowestUpdate = metric;
            }
        }
    }
    const totalUpdates = performanceMetrics.filter(m => !m.skipped).length;
    const averageDuration = totalUpdates > 0 ? totalDuration / totalUpdates : 0;
    return {
        totalUpdates,
        totalDuration,
        averageDuration,
        slowestUpdate,
        updatesByType,
    };
}
export function clearPerformanceMetrics() {
    performanceMetrics.length = 0;
}
function connectToFlipper() {
    try {
        if (typeof global !== 'undefined' && global.__FLIPPER__) {
            const flipper = global.__FLIPPER__;
            flipperConnection = flipper.addPlugin({
                getId: () => 'signalforge-inspector',
                onConnect: (connection) => {
                    console.log('[SignalForge] Connected to Flipper');
                    connection.send('initialState', {
                        signals: listSignals(),
                        graph: getDependencyGraph(),
                        config,
                    });
                    connection.receive('getSignals', () => {
                        connection.send('signals', listSignals());
                    });
                    connection.receive('getGraph', () => {
                        connection.send('graph', getDependencyGraph());
                    });
                    connection.receive('getPerformance', () => {
                        connection.send('performance', {
                            metrics: getPerformanceMetrics(100),
                            summary: getPerformanceSummary(),
                        });
                    });
                },
                onDisconnect: () => {
                    console.log('[SignalForge] Disconnected from Flipper');
                    flipperConnection = null;
                },
            });
        }
    }
    catch (error) {
        console.warn('[SignalForge] Failed to connect to Flipper:', error);
    }
}
function disconnectFromFlipper() {
    if (flipperConnection) {
        try {
            flipperConnection.disconnect();
        }
        catch (error) {
            console.warn('[SignalForge] Error disconnecting from Flipper:', error);
        }
        flipperConnection = null;
    }
}
function sendToFlipper(event, data) {
    if (flipperConnection && config.flipperEnabled) {
        try {
            flipperConnection.send(event, data);
        }
        catch (error) {
        }
    }
}
export function createConsoleOverlay() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        console.warn('[SignalForge] Console overlay only available in browser');
        return { show: () => { }, hide: () => { }, destroy: () => { } };
    }
    const overlay = document.createElement('div');
    overlay.id = 'signalforge-devtools-overlay';
    overlay.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    height: 100vh;
    background: rgba(0, 0, 0, 0.95);
    color: #fff;
    font-family: monospace;
    font-size: 12px;
    padding: 16px;
    overflow-y: auto;
    z-index: 999999;
    display: none;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.5);
  `;
    document.body.appendChild(overlay);
    const update = () => {
        const signals = listSignals();
        const summary = getPerformanceSummary();
        overlay.innerHTML = `
      <h2 style="margin: 0 0 16px 0; color: #61dafb;">SignalForge DevTools</h2>
      
      <div style="margin-bottom: 16px;">
        <h3 style="margin: 0 0 8px 0;">Performance</h3>
        <div>Total Updates: ${summary.totalUpdates}</div>
        <div>Avg Duration: ${summary.averageDuration.toFixed(2)}ms</div>
        <div>Total Time: ${summary.totalDuration.toFixed(2)}ms</div>
      </div>
      
      <div style="margin-bottom: 16px;">
        <h3 style="margin: 0 0 8px 0;">Signals (${signals.length})</h3>
        ${signals.map(s => `
          <div style="margin-bottom: 8px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 4px;">
            <div style="color: #61dafb;">${s.id}</div>
            <div style="color: #999; font-size: 10px;">${s.type}</div>
            <div>Value: ${JSON.stringify(s.value)}</div>
            <div style="font-size: 10px; color: #999;">
              Deps: ${s.dependencies.length} | Subs: ${s.subscriberCount} | Updates: ${s.updateCount}
            </div>
          </div>
        `).join('')}
      </div>
      
      <button
        onclick="document.getElementById('signalforge-devtools-overlay').style.display='none'"
        style="padding: 8px 16px; background: #61dafb; color: #000; border: none; border-radius: 4px; cursor: pointer;"
      >
        Close
      </button>
    `;
    };
    let intervalId;
    return {
        show: () => {
            overlay.style.display = 'block';
            update();
            intervalId = setInterval(update, 1000);
        },
        hide: () => {
            overlay.style.display = 'none';
            if (intervalId) {
                clearInterval(intervalId);
            }
        },
        destroy: () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
            overlay.remove();
        },
    };
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
export function exportSnapshot() {
    return {
        timestamp: Date.now(),
        config: { ...config },
        signals: listSignals(),
        graph: getDependencyGraph(),
        performance: {
            metrics: getPerformanceMetrics(),
            summary: getPerformanceSummary(),
        },
    };
}
export function printDependencyGraph() {
    if (!isDevToolsEnabled()) {
        console.warn('[SignalForge] DevTools is not enabled');
        return;
    }
    const graph = getDependencyGraph();
    console.group('SignalForge Dependency Graph');
    for (const node of graph) {
        const indent = '  '.repeat(node.depth);
        const deps = node.dependencies.length > 0
            ? ` ← [${node.dependencies.join(', ')}]`
            : '';
        const subs = node.subscribers.length > 0
            ? ` → [${node.subscribers.join(', ')}]`
            : '';
        console.log(`${indent}${node.id} (${node.type})${deps}${subs}`);
    }
    console.groupEnd();
}
