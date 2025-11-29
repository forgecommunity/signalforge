const IS_DIRTY_FLAG = 1 << 0;
const IS_SCHEDULED_FLAG = 1 << 1;
const IS_COMPUTING_FLAG = 1 << 2;
const HAS_LISTENERS_FLAG = 1 << 3;
const IS_COMPUTED_FLAG = 1 << 4;
const POOL_SIZE = 10000;
const nodePool = new Array(POOL_SIZE);
let poolIndex = 0;
function acquireNodeFromPool() {
    if (poolIndex > 0) {
        return nodePool[--poolIndex];
    }
    return {};
}
function releaseNodeToPool(node) {
    if (poolIndex < POOL_SIZE) {
        node.value = undefined;
        node.subscribers = null;
        node.listeners = null;
        node.dependencies = null;
        node.computeFn = null;
        node.flags = 0;
        nodePool[poolIndex++] = node;
    }
}
import { __registerSignal, __notifyAfterUpdate, __notifySignalDestroy } from './plugins';
const pluginSignalIdMap = new WeakMap();
const signalRegistry = new Map();
export function getSignalById(id) {
    return signalRegistry.get(id);
}
export function getAllSignalIds() {
    return Array.from(signalRegistry.keys());
}
export function getSignalId(signal) {
    return pluginSignalIdMap.get(signal);
}
const BATCH_QUEUE_SIZE = 10000;
const batchQueue = new Array(BATCH_QUEUE_SIZE);
let queueHeadIndex = 0;
let queueTailIndex = 0;
let isFlushing = false;
function enqueueForBatchUpdate(node) {
    if (node.flags & IS_SCHEDULED_FLAG)
        return;
    const nextTail = (queueTailIndex + 1) % BATCH_QUEUE_SIZE;
    if (nextTail === queueHeadIndex) {
        console.error('[SignalForge] Batch queue overflow → forcing flush');
        flushBatchUpdates();
    }
    node.flags |= IS_SCHEDULED_FLAG;
    batchQueue[queueTailIndex] = node;
    queueTailIndex = nextTail;
    if (!isFlushing) {
        isFlushing = true;
        queueMicrotask(flushBatchUpdates);
    }
}
function flushBatchUpdates() {
    isFlushing = false;
    while (queueHeadIndex !== queueTailIndex) {
        const node = batchQueue[queueHeadIndex];
        queueHeadIndex = (queueHeadIndex + 1) % BATCH_QUEUE_SIZE;
        node.flags &= ~IS_SCHEDULED_FLAG;
        if (node.flags & IS_DIRTY_FLAG) {
            recomputeNode(node);
        }
    }
}
const contextStack = new Array(100);
let contextDepth = 0;
let currentContext = null;
function pushContext(node) {
    contextStack[contextDepth++] = currentContext;
    currentContext = node;
}
function popContext() {
    currentContext = contextStack[--contextDepth];
}
const signalCache = new WeakMap();
const computedCache = new WeakMap();
const sharedPeek = function () { return this._node.value; };
const sharedAddSubscriber = function (subscriber) {
    if (!this._node.subscribers)
        this._node.subscribers = new Set();
    this._node.subscribers.add(subscriber);
};
const sharedRemoveSubscriber = function (subscriber) {
    if (this._node.subscribers)
        this._node.subscribers.delete(subscriber);
};
function createNode(initialValue, computeFn = null) {
    const node = poolIndex > 0
        ? nodePool[--poolIndex]
        : {
            value: undefined,
            subscribers: null,
            listeners: null,
            dependencies: null,
            computeFn: null,
            flags: 0
        };
    node.value = initialValue;
    node.computeFn = computeFn;
    node.flags = computeFn ? IS_COMPUTED_FLAG | IS_DIRTY_FLAG : 0;
    if (computeFn) {
        recomputeNode(node);
    }
    return node;
}
function getValue(node, signalWrapper) {
    if (!currentContext) {
        if ((node.flags & IS_DIRTY_FLAG) && node.computeFn) {
            recomputeNode(node);
        }
        return node.value;
    }
    if (currentContext !== node) {
        addSubscriber(node, currentContext);
        addDependency(currentContext, signalWrapper);
    }
    if ((node.flags & IS_DIRTY_FLAG) && node.computeFn) {
        recomputeNode(node);
    }
    return node.value;
}
function setValue(node, signal, newValue) {
    if (node.flags & IS_COMPUTED_FLAG) {
        throw new Error('Cannot set computed signal');
    }
    if (typeof newValue === 'function') {
        newValue = newValue(node.value);
    }
    if (Object.is(newValue, node.value)) {
        return;
    }
    const oldValue = node.value;
    node.value = newValue;
    const pluginId = pluginSignalIdMap.get(signal);
    if (pluginId) {
        __notifyAfterUpdate(pluginId, oldValue, newValue, 'set');
    }
    notifySubscribers(node);
}
function addSubscriber(node, subscriber) {
    if (!node.subscribers) {
        node.subscribers = new Set();
    }
    node.subscribers.add(subscriber);
}
function removeSubscriber(node, subscriber) {
    if (node.subscribers) {
        node.subscribers.delete(subscriber);
    }
}
function addDependency(node, signal) {
    if (!node.dependencies) {
        node.dependencies = new Set();
    }
    if (!node.dependencies.has(signal)) {
        node.dependencies.add(signal);
        addSubscriber(signal._node, node);
    }
}
function clearDependencies(node) {
    if (node.dependencies) {
        for (const dep of node.dependencies) {
            removeSubscriber(dep._node, node);
        }
        node.dependencies.clear();
    }
}
function markDirty(node) {
    if (node.flags & IS_DIRTY_FLAG)
        return;
    node.flags |= IS_DIRTY_FLAG;
    enqueueForBatchUpdate(node);
    if (node.subscribers) {
        for (const subscriber of node.subscribers) {
            markDirty(subscriber);
        }
    }
}
function recomputeNode(node) {
    if (!node.computeFn)
        return;
    if (node.flags & IS_COMPUTING_FLAG)
        return;
    node.flags |= IS_COMPUTING_FLAG;
    clearDependencies(node);
    pushContext(node);
    try {
        const newValue = node.computeFn();
        node.flags &= ~IS_DIRTY_FLAG;
        node.flags &= ~IS_COMPUTING_FLAG;
        if (!Object.is(newValue, node.value)) {
            node.value = newValue;
            notifySubscribers(node);
        }
    }
    finally {
        popContext();
    }
}
function notifySubscribers(node) {
    if (node.subscribers) {
        for (const subscriber of node.subscribers) {
            markDirty(subscriber);
        }
    }
    if (node.flags & HAS_LISTENERS_FLAG && node.listeners) {
        for (const listener of node.listeners) {
            listener(node.value);
        }
    }
}
function subscribe(node, listener) {
    if (!node.listeners) {
        node.listeners = new Set();
    }
    node.listeners.add(listener);
    node.flags |= HAS_LISTENERS_FLAG;
    return () => {
        node.listeners.delete(listener);
        if (node.listeners.size === 0) {
            node.flags &= ~HAS_LISTENERS_FLAG;
        }
    };
}
function destroyNode(node) {
    clearDependencies(node);
    if (node.subscribers) {
        node.subscribers.clear();
    }
    if (node.listeners) {
        node.listeners.clear();
    }
    releaseNodeToPool(node);
}
export function createSignal(initialValue) {
    const node = createNode(initialValue, null);
    const signal = {
        get: () => getValue(node, signal),
        set: (value) => setValue(node, signal, value),
        subscribe: (listener) => subscribe(node, listener),
        destroy: () => {
            const pluginId = pluginSignalIdMap.get(signal);
            if (pluginId) {
                __notifySignalDestroy(pluginId);
                signalRegistry.delete(pluginId);
                pluginSignalIdMap.delete(signal);
            }
            destroyNode(node);
        },
        _node: node,
        _peek: sharedPeek,
        _addSubscriber: sharedAddSubscriber,
        _removeSubscriber: sharedRemoveSubscriber,
    };
    const metadata = __registerSignal('signal', initialValue);
    pluginSignalIdMap.set(signal, metadata.id);
    signalRegistry.set(metadata.id, signal);
    return signal;
}
export function createComputed(computeFn) {
    let initialValue;
    const savedContext = currentContext;
    currentContext = null;
    try {
        initialValue = computeFn();
    }
    finally {
        currentContext = savedContext;
    }
    const node = createNode(initialValue, computeFn);
    const signal = {
        get: () => getValue(node, signal),
        set: (() => {
            throw new Error('Cannot set computed signal');
        }),
        subscribe: (listener) => subscribe(node, listener),
        destroy: () => destroyNode(node),
        _node: node,
        _peek: () => node.value,
        _addSubscriber: (subscriber) => {
            if (!node.subscribers)
                node.subscribers = new Set();
            node.subscribers.add(subscriber);
        },
        _removeSubscriber: (subscriber) => {
            if (node.subscribers)
                node.subscribers.delete(subscriber);
        },
        _markDirty: () => markDirty(node),
        _recompute: () => recomputeNode(node),
    };
    return signal;
}
export function createEffect(effectFn) {
    const node = createNode(undefined, effectFn);
    return () => destroyNode(node);
}
export function batch(fn) {
    const result = fn();
    flushBatchSync();
    return result;
}
export function flushBatchSync() {
    if (queueHeadIndex !== queueTailIndex) {
        flushBatchUpdates();
    }
}
export function untrack(fn) {
    const saved = currentContext;
    currentContext = null;
    try {
        return fn();
    }
    finally {
        currentContext = saved;
    }
}
export function getPerformanceStats() {
    return {
        poolUsage: poolIndex,
        queueLength: queueTailIndex >= queueHeadIndex ? queueTailIndex - queueHeadIndex : BATCH_QUEUE_SIZE - queueHeadIndex + queueTailIndex,
        contextDepth,
    };
}
export const flushSync = flushBatchSync;
export function resetPerformanceState() {
    poolIndex = 0;
    queueHeadIndex = 0;
    queueTailIndex = 0;
    contextDepth = 0;
    currentContext = null;
    isFlushing = false;
}
