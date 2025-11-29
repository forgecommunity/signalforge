import { startBatchMeasurement, endBatchMeasurement, recordBatchOperation, isProfilerEnabled } from '../devtools/performanceProfiler';
import { ERRORS, formatError, MAX_BATCH_DEPTH } from './constants';
let batchDepth = 0;
let currentBatchId = -1;
const pendingCallbacks = new Set();
let isFlushScheduled = false;
function scheduleMicrotaskFlush() {
    if (isFlushScheduled) {
        return;
    }
    isFlushScheduled = true;
    if (typeof queueMicrotask !== 'undefined') {
        queueMicrotask(performFlush);
    }
    else {
        Promise.resolve().then(performFlush);
    }
}
function performFlush() {
    isFlushScheduled = false;
    if (batchDepth > 0) {
        return;
    }
    const callbacks = Array.from(pendingCallbacks);
    pendingCallbacks.clear();
    for (const callback of callbacks) {
        try {
            callback();
        }
        catch (error) {
            console.error('Error in batch callback:', error);
        }
    }
}
export function startBatch() {
    if (batchDepth >= MAX_BATCH_DEPTH) {
        throw new Error(formatError(ERRORS.MAX_BATCH_DEPTH));
    }
    batchDepth++;
    if (batchDepth === 1 && isProfilerEnabled()) {
        currentBatchId = startBatchMeasurement(batchDepth);
    }
}
export function endBatch() {
    if (batchDepth <= 0) {
        throw new Error(formatError(ERRORS.BATCH_MISMATCH));
    }
    batchDepth--;
    if (batchDepth === 0 && isProfilerEnabled() && currentBatchId !== -1) {
        endBatchMeasurement(currentBatchId);
        currentBatchId = -1;
    }
    if (batchDepth === 0 && pendingCallbacks.size > 0) {
        scheduleMicrotaskFlush();
    }
}
export function queueBatchCallback(callback, signalId) {
    pendingCallbacks.add(callback);
    if (batchDepth > 0 && isProfilerEnabled() && currentBatchId !== -1 && signalId) {
        recordBatchOperation(currentBatchId, signalId);
    }
    if (batchDepth === 0) {
        scheduleMicrotaskFlush();
    }
}
export function flushBatches() {
    isFlushScheduled = false;
    const callbacks = Array.from(pendingCallbacks);
    pendingCallbacks.clear();
    for (const callback of callbacks) {
        try {
            callback();
        }
        catch (error) {
            console.error('Error in batch callback:', error);
        }
    }
}
export function batch(fn) {
    startBatch();
    try {
        return fn();
    }
    finally {
        endBatch();
    }
}
export function getBatchDepth() {
    return batchDepth;
}
export function getPendingCount() {
    return pendingCallbacks.size;
}
export function isBatching() {
    return batchDepth > 0;
}
