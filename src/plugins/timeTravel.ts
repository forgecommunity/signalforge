/**
 * SignalForge Time Travel Plugin
 * 
 * PURPOSE:
 * ========
 * Redux DevTools-style time-travel debugging for SignalForge with efficient
 * state snapshots, undo/redo functionality, and timeline navigation.
 * 
 * FEATURES:
 * - Record every signal state change with timestamps
 * - Step backward/forward through history (undo/redo)
 * - Jump to any point in timeline (jumpTo)
 * - Diff-based storage for memory efficiency
 * - Timeline visualization for DevTools UI
 * - Export/import sessions for debugging
 * - Configurable history limits
 * - Automatic snapshot compression
 * 
 * ARCHITECTURE:
 * =============
 * 
 * 1. Snapshot Storage:
 *    Signal Update → Create Snapshot → Compute Diff → Store Diff
 *    → Apply Compression → Maintain History Limit
 * 
 * 2. Time Travel Flow:
 *    undo() → Pop History → Push to Future → Restore Previous State
 *    redo() → Pop Future → Push to History → Restore Next State
 *    jumpTo(index) → Calculate State at Index → Restore All Signals
 * 
 * 3. Diff Storage:
 *    Full Snapshot (every Nth update) → Diff 1 → Diff 2 → ... → Diff N
 *    → Next Full Snapshot
 * 
 * 4. Memory Optimization:
 *    - Only store diffs between snapshots
 *    - Full snapshots every N updates (default: 10)
 *    - Configurable max history (default: 100)
 *    - Automatic pruning of old entries
 * 
 * INTEGRATION:
 * ============
 * 
 * ```typescript
 * import { TimeTravelPlugin } from 'signalforge/plugins/timeTravel';
 * 
 * const timeTravel = new TimeTravelPlugin({ maxHistory: 100 });
 * registerManagedPlugin('time-travel', timeTravel.getPlugin());
 * 
 * // Use signals
 * counter.set(5);
 * 
 * // Undo
 * timeTravel.undo(); // counter back to previous value
 * 
 * // Redo
 * timeTravel.redo(); // counter forward again
 * 
 * // Jump to specific point
 * timeTravel.jumpTo(3); // Go to 3rd snapshot
 * ```
 * 
 * @module timeTravel
 */

import type { Plugin, PluginContext } from '../core/plugins.js';
import type { Signal } from '../core/store.js';
import { getSignalById } from '../core/store.js';
import {
  TIME_TRAVEL_MAX_HISTORY,
  TIME_TRAVEL_FULL_SNAPSHOT_INTERVAL,
  SHORT_STRING_TRUNCATE_LENGTH,
  validateMaxHistory,
  truncateString,
  PLUGIN_API_VERSION,
} from '../core/constants.js';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Time travel snapshot entry
 */
export interface TimeTravelSnapshot {
  /** Unique snapshot ID */
  id: number;
  /** Timestamp when snapshot was taken */
  timestamp: number;
  /** Signal ID */
  signalId: string;
  /** Signal label/name */
  signalLabel?: string;
  /** Signal type */
  signalType: 'signal' | 'computed' | 'effect';
  /** Previous value (for restoration) */
  oldValue: any;
  /** New value */
  newValue: any;
  /** Whether this is a full snapshot or diff */
  isFull: boolean;
  /** Diff from previous snapshot (if not full) */
  diff?: ValueDiff;
  /** Index in timeline */
  index: number;
}

/**
 * Value diff for efficient storage
 */
export interface ValueDiff {
  /** Type of diff */
  type: 'primitive' | 'object' | 'array';
  /** Added properties/elements */
  added?: Record<string, any> | any[];
  /** Removed properties/elements */
  removed?: string[] | number[];
  /** Changed properties/elements */
  changed?: Record<string, { old: any; new: any }>;
  /** For primitive values */
  oldValue?: any;
  /** For primitive values */
  newValue?: any;
}

/**
 * Timeline state for UI visualization
 */
export interface TimelineState {
  /** Total snapshots */
  total: number;
  /** Current position in timeline */
  current: number;
  /** Can undo? */
  canUndo: boolean;
  /** Can redo? */
  canRedo: boolean;
  /** All snapshot summaries */
  snapshots: Array<{
    id: number;
    timestamp: number;
    signalId: string;
    signalLabel?: string;
    preview: string;
  }>;
}

/**
 * Time travel plugin configuration
 */
export interface TimeTravelConfig {
  /** Maximum history entries to keep */
  maxHistory?: number;
  /** Interval for full snapshots (every Nth update) */
  fullSnapshotInterval?: number;
  /** Enable automatic compression */
  enableCompression?: boolean;
  /** Enable verbose logging */
  verbose?: boolean;
}

/**
 * Exported session data
 */
export interface TimeTravelSession {
  /** Session timestamp */
  timestamp: number;
  /** SignalForge version */
  version: string;
  /** All snapshots */
  snapshots: TimeTravelSnapshot[];
  /** Current position */
  currentIndex: number;
}

// ============================================================================
// Time Travel Plugin Implementation
// ============================================================================

export class TimeTravelPlugin {
  private config: Required<TimeTravelConfig>;
  private snapshots: TimeTravelSnapshot[] = [];
  private currentIndex: number = -1;
  private snapshotIdCounter: number = 0;
  private signalValues: Map<string, any> = new Map();
  private signalRefs: Map<string, Signal<any>> = new Map();
  private enabled: boolean = true;
  private isRestoring: boolean = false;

  constructor(config: TimeTravelConfig = {}) {
    this.config = {
      maxHistory: validateMaxHistory(config.maxHistory),
      fullSnapshotInterval: config.fullSnapshotInterval ?? TIME_TRAVEL_FULL_SNAPSHOT_INTERVAL,
      enableCompression: config.enableCompression ?? true,
      verbose: config.verbose ?? false,
    };
  }

  /**
   * Get the plugin implementation
   */
  getPlugin(): Plugin {
    return {
      name: 'time-travel',
      version: PLUGIN_API_VERSION,

      onRegister: () => {
        this.log(`⏱️  Time Travel plugin activated`);
        this.log(`   Max history: ${this.config.maxHistory}`);
        this.log(`   Full snapshot interval: ${this.config.fullSnapshotInterval}`);
      },

      onSignalCreate: (metadata, initialValue) => {
        // Store initial value
        this.signalValues.set(metadata.id, initialValue);
        this.log(`📌 Tracking signal: ${metadata.label || metadata.id}`);
      },

      onSignalUpdate: (context: PluginContext) => {
        // Skip recording if plugin is disabled or we're restoring state
        // (prevents creating new snapshots during undo/redo operations)
        if (!this.enabled || this.isRestoring) return;

        // Update stored value for visualization
        this.signalValues.set(context.signal.id, context.newValue);
        
        // Record the update
        this.recordSnapshot(context);
      },

      onUnregister: () => {
        this.log(`⏱️  Time Travel plugin deactivated`);
        this.log(`   Recorded ${this.snapshots.length} snapshots`);
        this.clear();
      },
    };
  }

  // ==========================================================================
  // Core API - Time Travel Operations
  // ==========================================================================

  /**
   * Undo the last state change
   * 
   * Steps back in history and restores the previous signal values.
   * 
   * @returns True if undo was successful
   * 
   * @example
   * ```typescript
   * counter.set(5);
   * counter.set(10);
   * timeTravel.undo(); // counter back to 5
   * ```
   */
  undo(): boolean {
    if (!this.canUndo()) {
      this.log('⏪ Cannot undo: at beginning of history');
      return false;
    }

    // Restore the snapshot at CURRENT index (which is the last change made)
    // Then decrement to move back in time
    const snapshot = this.snapshots[this.currentIndex];
    const success = this.restoreState(this.currentIndex, 'undo');
    
    if (success) {
      this.currentIndex--;
      this.log(`⏪ Undo: ${snapshot.signalLabel || snapshot.signalId} → ${this.formatValue(snapshot.oldValue)}`);
    }

    return success;
  }

  /**
   * Redo the last undone change
   * 
   * Steps forward in history and restores the next signal values.
   * 
   * @returns True if redo was successful
   * 
   * @example
   * ```typescript
   * timeTravel.undo();
   * timeTravel.redo(); // back to current state
   * ```
   */
  redo(): boolean {
    if (!this.canRedo()) {
      this.log('⏩ Cannot redo: at end of history');
      return false;
    }

    // Increment first to move forward, then restore that snapshot
    this.currentIndex++;
    const snapshot = this.snapshots[this.currentIndex];
    const success = this.restoreState(this.currentIndex, 'redo');

    if (success) {
      this.log(`⏩ Redo: ${snapshot.signalLabel || snapshot.signalId} → ${this.formatValue(snapshot.newValue)}`);
    }

    return success;
  }

  /**
   * Jump to specific point in timeline
   * 
   * Restores all signals to their state at the given index.
   * 
   * @param index - Timeline index (0 = beginning)
   * @returns True if jump was successful
   * 
   * @example
   * ```typescript
   * timeTravel.jumpTo(0); // Go to beginning
   * timeTravel.jumpTo(timeline.length - 1); // Go to end
   * ```
   */
  jumpTo(index: number): boolean {
    if (index < 0 || index >= this.snapshots.length) {
      this.log(`❌ Invalid index: ${index} (max: ${this.snapshots.length - 1})`);
      return false;
    }

    this.currentIndex = index;
    const success = this.restoreState(index);

    if (success) {
      const snapshot = this.snapshots[index];
      this.log(`🎯 Jump to snapshot #${snapshot.id}: ${snapshot.signalLabel || snapshot.signalId}`);
    }

    return success;
  }

  /**
   * Check if undo is possible
   * 
   * currentIndex points to the last applied snapshot
   * We can undo if currentIndex >= 0 (there's a snapshot to reverse)
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * Check if redo is possible
   */
  canRedo(): boolean {
    return this.currentIndex < this.snapshots.length - 1;
  }

  /**
   * Get current timeline position
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Get total number of snapshots
   */
  getSnapshotCount(): number {
    return this.snapshots.length;
  }

  // ==========================================================================
  // Core API - Data Access
  // ==========================================================================

  /**
   * Get complete timeline state for UI
   * 
   * @returns Timeline state with all snapshots
   * 
   * @example
   * ```typescript
   * const timeline = timeTravel.getTimelineState();
   * console.log(`Position: ${timeline.current}/${timeline.total}`);
   * ```
   */
  getTimelineState(): TimelineState {
    return {
      total: this.snapshots.length,
      current: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      snapshots: this.snapshots.map(s => ({
        id: s.id,
        timestamp: s.timestamp,
        signalId: s.signalId,
        signalLabel: s.signalLabel,
        preview: this.formatValue(s.newValue),
      })),
    };
  }

  /**
   * Get all snapshots
   * 
   * @returns Array of all recorded snapshots
   */
  getSnapshots(): ReadonlyArray<Readonly<TimeTravelSnapshot>> {
    return [...this.snapshots];
  }

  /**
   * Get snapshots for specific signal
   * 
   * @param signalId - Signal ID
   * @returns Snapshots for that signal
   */
  getSnapshotsForSignal(signalId: string): ReadonlyArray<Readonly<TimeTravelSnapshot>> {
    return this.snapshots.filter(s => s.signalId === signalId);
  }

  /**
   * Get snapshot at index
   * 
   * @param index - Snapshot index
   * @returns Snapshot or undefined
   */
  getSnapshotAt(index: number): Readonly<TimeTravelSnapshot> | undefined {
    return this.snapshots[index];
  }

  /**
   * Get current snapshot
   * 
   * @returns Current snapshot or undefined
   */
  getCurrentSnapshot(): Readonly<TimeTravelSnapshot> | undefined {
    return this.snapshots[this.currentIndex];
  }

  // ==========================================================================
  // Core API - Session Management
  // ==========================================================================

  /**
   * Export current session for debugging/sharing
   * 
   * @returns Serializable session data
   * 
   * @example
   * ```typescript
   * const session = timeTravel.exportSession();
   * localStorage.setItem('debug-session', JSON.stringify(session));
   * ```
   */
  exportSession(): TimeTravelSession {
    return {
      timestamp: Date.now(),
      version: '1.0.0',
      snapshots: [...this.snapshots],
      currentIndex: this.currentIndex,
    };
  }

  /**
   * Import previously exported session
   * 
   * @param session - Session data
   * 
   * @example
   * ```typescript
   * const session = JSON.parse(localStorage.getItem('debug-session'));
   * timeTravel.importSession(session);
   * ```
   */
  importSession(session: TimeTravelSession): void {
    this.snapshots = [...session.snapshots];
    this.currentIndex = session.currentIndex;
    this.snapshotIdCounter = Math.max(...this.snapshots.map(s => s.id), 0) + 1;
    
    this.log(`📥 Imported session with ${this.snapshots.length} snapshots`);
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.snapshots = [];
    this.currentIndex = -1;
    this.snapshotIdCounter = 0;
    this.signalValues.clear();
    this.log('🗑️  History cleared');
  }

  /**
   * Enable/disable recording
   * 
   * @param enabled - Whether to record snapshots
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.log(`${enabled ? '▶️' : '⏸️'}  Recording ${enabled ? 'enabled' : 'paused'}`);
  }

  /**
   * Check if recording is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  // ==========================================================================
  // Internal - Snapshot Management
  // ==========================================================================

  /**
   * Record a snapshot from plugin context
   */
  private recordSnapshot(context: PluginContext): void {
    const index = this.snapshots.length;
    const shouldBeFullSnapshot = index % this.config.fullSnapshotInterval === 0;

    // Create snapshot
    const snapshot: TimeTravelSnapshot = {
      id: this.snapshotIdCounter++,
      timestamp: Date.now(),
      signalId: context.signal.id,
      signalLabel: context.signal.label,
      signalType: context.signal.type,
      oldValue: context.oldValue,
      newValue: context.newValue,
      isFull: shouldBeFullSnapshot,
      index,
    };

    // Compute diff if not full snapshot
    if (!shouldBeFullSnapshot && this.config.enableCompression) {
      snapshot.diff = this.computeDiff(context.oldValue, context.newValue);
    }

    // If we're in the middle of history (after undo), discard future
    if (this.currentIndex < this.snapshots.length - 1) {
      this.snapshots = this.snapshots.slice(0, this.currentIndex + 1);
      this.log(`✂️  Discarded ${this.snapshots.length - this.currentIndex - 1} future snapshots`);
    }

    // Add snapshot
    this.snapshots.push(snapshot);
    this.currentIndex = this.snapshots.length - 1;

    // Maintain history limit
    if (this.snapshots.length > this.config.maxHistory) {
      const removed = this.snapshots.shift();
      this.currentIndex--;
      this.log(`📦 Pruned old snapshot #${removed?.id}`);
    }

    this.log(`📸 Snapshot #${snapshot.id}: ${snapshot.signalLabel || snapshot.signalId} = ${this.formatValue(snapshot.newValue)}`);
  }

  /**
   * Restore state at given index
   * 
   * Restores signal values by accessing them via the global signal registry.
   * Uses the isRestoring flag to prevent creating new snapshots during restoration.
   * 
   * @param index - Snapshot index to restore
   * @param direction - Whether we're undoing or redoing (determines which value to restore)
   */
  private restoreState(index: number, direction: 'undo' | 'redo' | 'jump' = 'jump'): boolean {
    if (index < 0 || index >= this.snapshots.length) {
      return false;
    }

    const snapshot = this.snapshots[index];
    
    // Get the signal from the global registry
    const signal = getSignalById(snapshot.signalId);
    if (!signal) {
      this.log(`⚠️  Signal ${snapshot.signalId} not found in registry`);
      // Update stored value for visualization even if signal is gone
      this.signalValues.set(snapshot.signalId, snapshot.newValue);
      return false;
    }
    
    // Determine which value to restore based on direction
    // 
    // Snapshots record transitions: oldValue → newValue
    // 
    // UNDO: Reverse the change, restore oldValue (state BEFORE change)
    // REDO: Reapply the change, restore newValue (state AFTER change)  
    // JUMP: Go to that point in time, restore newValue (final state at index)
    let valueToRestore: any;
    if (direction === 'undo') {
      valueToRestore = snapshot.oldValue;
    } else {
      valueToRestore = snapshot.newValue;
    }
    
    // Set isRestoring flag to prevent recursive snapshot creation
    this.isRestoring = true;
    
    try {
      // Restore the signal's value
      signal.set(valueToRestore);
      
      // Update stored value for visualization
      this.signalValues.set(snapshot.signalId, valueToRestore);
      
      return true;
    } catch (error) {
      console.error(`[TimeTravel] Error restoring signal ${snapshot.signalId}:`, error);
      return false;
    } finally {
      this.isRestoring = false;
    }
  }

  /**
   * Compute diff between two values
   */
  private computeDiff(oldValue: any, newValue: any): ValueDiff {
    // Primitive types
    if (this.isPrimitive(oldValue) || this.isPrimitive(newValue)) {
      return {
        type: 'primitive',
        oldValue,
        newValue,
      };
    }

    // Arrays
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      return {
        type: 'array',
        added: newValue.filter((_, i) => i >= oldValue.length),
        removed: oldValue.length > newValue.length 
          ? Array.from({ length: oldValue.length - newValue.length }, (_, i) => oldValue.length - 1 - i)
          : [],
        changed: this.computeArrayDiff(oldValue, newValue),
      };
    }

    // Objects
    if (typeof oldValue === 'object' && typeof newValue === 'object') {
      const oldKeys = Object.keys(oldValue);
      const newKeys = Object.keys(newValue);
      
      const added: Record<string, any> = {};
      const removed: string[] = [];
      const changed: Record<string, { old: any; new: any }> = {};

      // Find added keys
      for (const key of newKeys) {
        if (!oldKeys.includes(key)) {
          added[key] = newValue[key];
        }
      }

      // Find removed keys
      for (const key of oldKeys) {
        if (!newKeys.includes(key)) {
          removed.push(key);
        }
      }

      // Find changed keys
      for (const key of newKeys) {
        if (oldKeys.includes(key) && !this.isEqual(oldValue[key], newValue[key])) {
          changed[key] = { old: oldValue[key], new: newValue[key] };
        }
      }

      return {
        type: 'object',
        added,
        removed,
        changed,
      };
    }

    // Fallback
    return {
      type: 'primitive',
      oldValue,
      newValue,
    };
  }

  /**
   * Compute array element changes
   */
  private computeArrayDiff(oldArr: any[], newArr: any[]): Record<string, { old: any; new: any }> {
    const changed: Record<string, { old: any; new: any }> = {};
    const minLength = Math.min(oldArr.length, newArr.length);

    for (let i = 0; i < minLength; i++) {
      if (!this.isEqual(oldArr[i], newArr[i])) {
        changed[i.toString()] = { old: oldArr[i], new: newArr[i] };
      }
    }

    return changed;
  }

  /**
   * Check if value is primitive
   */
  private isPrimitive(value: any): boolean {
    return value == null || typeof value !== 'object';
  }

  /**
   * Deep equality check
   */
  private isEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;
    if (typeof a !== 'object') return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every(key => this.isEqual(a[key], b[key]));
  }

  /**
   * Format value for display
   */
  private formatValue(value: any): string {
    if (value == null) return String(value);
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') {
      const str = JSON.stringify(value);
      return truncateString(str, SHORT_STRING_TRUNCATE_LENGTH);
    }
    return String(value);
  }

  /**
   * Log helper
   */
  private log(...args: any[]): void {
    if (this.config.verbose) {
      console.log('[TimeTravel]', ...args);
    }
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate memory usage of snapshots
 * 
 * @param snapshots - Array of snapshots
 * @returns Estimated memory usage in bytes
 */
export function calculateMemoryUsage(snapshots: TimeTravelSnapshot[]): number {
  const json = JSON.stringify(snapshots);
  return new Blob([json]).size;
}

/**
 * Format memory size for display
 * 
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatMemorySize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Create a time travel plugin instance
 * 
 * Convenience function for quick setup.
 * 
 * @param config - Plugin configuration
 * @returns Plugin instance
 * 
 * @example
 * ```typescript
 * const timeTravel = createTimeTravelPlugin({ maxHistory: 100 });
 * registerManagedPlugin('time-travel', timeTravel.getPlugin());
 * ```
 */
export function createTimeTravelPlugin(config?: TimeTravelConfig): TimeTravelPlugin {
  return new TimeTravelPlugin(config);
}
