/**
 * Async Batching System for SignalForge
 * 
 * Implements a microtask-based batching scheduler that queues multiple signal updates
 * within the same tick and notifies all subscribers once after the microtask queue flushes.
 * 
 * Features:
 * - Microtask-based scheduling using queueMicrotask()
 * - Support for nested batches (batch inside batch)
 * - No missed updates with consistent state delivery
 * - Automatic flush when batch depth reaches zero
 */

import { 
  startBatchMeasurement, 
  endBatchMeasurement, 
  recordBatchOperation,
  isProfilerEnabled
} from '../devtools/performanceProfiler';
import { ERRORS, formatError, MAX_BATCH_DEPTH } from './constants';

type BatchCallback = () => void;

/**
 * Current batch depth for nested batch support
 */
let batchDepth = 0;

/**
 * Current batch ID for profiler tracking
 */
let currentBatchId = -1;

/**
 * Set of pending callbacks to execute after batch completes
 */
const pendingCallbacks = new Set<BatchCallback>();

/**
 * Flag to track if a flush is already scheduled
 */
let isFlushScheduled = false;

/**
 * Schedules a flush operation on the microtask queue
 */
function scheduleMicrotaskFlush(): void {
  if (isFlushScheduled) {
    return;
  }
  
  isFlushScheduled = true;
  
  // Use queueMicrotask for optimal performance
  // Falls back to Promise.resolve().then() if queueMicrotask is not available
  if (typeof queueMicrotask !== 'undefined') {
    queueMicrotask(performFlush);
  } else {
    Promise.resolve().then(performFlush);
  }
}

/**
 * Executes all pending callbacks and resets the flush state
 */
function performFlush(): void {
  isFlushScheduled = false;
  
  // Only flush if we're not in a batch
  if (batchDepth > 0) {
    return;
  }
  
  // Create a snapshot of callbacks to execute
  // This prevents infinite loops if callbacks trigger new batches
  const callbacks = Array.from(pendingCallbacks);
  pendingCallbacks.clear();
  
  // Execute all callbacks
  for (const callback of callbacks) {
    try {
      callback();
    } catch (error) {
      // Log error but continue processing other callbacks
      console.error('Error in batch callback:', error);
    }
  }
}

/**
 * Starts a new batch operation
 * 
 * Increments the batch depth counter. Updates queued during a batch
 * will not notify subscribers until the batch ends.
 * 
 * Supports nested batches - the flush only occurs when all batches are ended.
 * 
 * @throws {Error} If batch depth exceeds maximum safe depth
 * 
 * @example
 * ```ts
 * startBatch();
 * signal1.value = 'a'; // queued
 * signal2.value = 'b'; // queued
 * endBatch(); // both updates flush together
 * ```
 */
export function startBatch(): void {
  if (batchDepth >= MAX_BATCH_DEPTH) {
    throw new Error(formatError(ERRORS.MAX_BATCH_DEPTH));
  }
  
  batchDepth++;
  
  // Start profiler measurement for outermost batch
  if (batchDepth === 1 && isProfilerEnabled()) {
    currentBatchId = startBatchMeasurement(batchDepth);
  }
}

/**
 * Ends the current batch operation
 * 
 * Decrements the batch depth counter. When depth reaches zero,
 * schedules a microtask to flush all pending updates.
 * 
 * @throws {Error} If endBatch is called without a matching startBatch
 * 
 * @example
 * ```ts
 * startBatch();
 * // ... multiple signal updates
 * endBatch(); // flush scheduled
 * ```
 */
export function endBatch(): void {
  if (batchDepth <= 0) {
    throw new Error(formatError(ERRORS.BATCH_MISMATCH));
  }
  
  batchDepth--;
  
  // End profiler measurement when exiting outermost batch
  if (batchDepth === 0 && isProfilerEnabled() && currentBatchId !== -1) {
    endBatchMeasurement(currentBatchId);
    currentBatchId = -1;
  }
  
  // Schedule flush when we exit the outermost batch
  if (batchDepth === 0 && pendingCallbacks.size > 0) {
    scheduleMicrotaskFlush();
  }
}

/**
 * Adds a callback to be executed when the current batch completes
 * 
 * If not currently batching, schedules the callback to run in the next microtask.
 * If batching, queues the callback to run when the batch ends.
 * 
 * @param callback - Function to execute after batch completes
 * @param signalId - Optional signal ID for profiler tracking
 * 
 * @internal
 * 
 * @example
 * ```ts
 * queueBatchCallback(() => {
 *   console.log('Update complete');
 * });
 * ```
 */
export function queueBatchCallback(callback: BatchCallback, signalId?: string): void {
  pendingCallbacks.add(callback);
  
  // Track operation in profiler if batching
  if (batchDepth > 0 && isProfilerEnabled() && currentBatchId !== -1 && signalId) {
    recordBatchOperation(currentBatchId, signalId);
  }
  
  // If not batching, schedule immediate flush
  if (batchDepth === 0) {
    scheduleMicrotaskFlush();
  }
}

/**
 * Immediately flushes all pending batch callbacks
 * 
 * This forces synchronous execution of all queued updates,
 * bypassing the microtask queue. Use with caution as it can
 * affect performance and break expected async behavior.
 * 
 * Typically used in testing or when synchronous updates are required.
 * 
 * @example
 * ```ts
 * signal.value = 'new';
 * flushBatches(); // synchronously notify all subscribers
 * ```
 */
export function flushBatches(): void {
  // Cancel any scheduled flush
  isFlushScheduled = false;
  
  // Execute all pending callbacks immediately
  const callbacks = Array.from(pendingCallbacks);
  pendingCallbacks.clear();
  
  for (const callback of callbacks) {
    try {
      callback();
    } catch (error) {
      console.error('Error in batch callback:', error);
    }
  }
}

/**
 * Executes a function within a batch context
 * 
 * Automatically starts a batch before executing the function and ends it after.
 * This is a convenience wrapper around startBatch/endBatch.
 * 
 * @param fn - Function to execute in batch context
 * @returns The return value of the function
 * 
 * @example
 * ```ts
 * batch(() => {
 *   signal1.value = 'a';
 *   signal2.value = 'b';
 *   signal3.value = 'c';
 * }); // all three updates flush together
 * ```
 */
export function batch<T>(fn: () => T): T {
  startBatch();
  try {
    return fn();
  } finally {
    endBatch();
  }
}

/**
 * Gets the current batch depth
 * 
 * @internal
 * @returns Current nesting level of batches
 */
export function getBatchDepth(): number {
  return batchDepth;
}

/**
 * Gets the number of pending callbacks
 * 
 * @internal
 * @returns Count of queued callbacks
 */
export function getPendingCount(): number {
  return pendingCallbacks.size;
}

/**
 * Checks if currently batching
 * 
 * @internal
 * @returns True if inside a batch operation
 */
export function isBatching(): boolean {
  return batchDepth > 0;
}
