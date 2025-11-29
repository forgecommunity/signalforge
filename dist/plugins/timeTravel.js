import { getSignalById } from '../core/store.js';
import { TIME_TRAVEL_FULL_SNAPSHOT_INTERVAL, SHORT_STRING_TRUNCATE_LENGTH, validateMaxHistory, truncateString, PLUGIN_API_VERSION, } from '../core/constants.js';
export class TimeTravelPlugin {
    constructor(config = {}) {
        this.snapshots = [];
        this.currentIndex = -1;
        this.snapshotIdCounter = 0;
        this.signalValues = new Map();
        this.signalRefs = new Map();
        this.enabled = true;
        this.isRestoring = false;
        this.config = {
            maxHistory: validateMaxHistory(config.maxHistory),
            fullSnapshotInterval: config.fullSnapshotInterval ?? TIME_TRAVEL_FULL_SNAPSHOT_INTERVAL,
            enableCompression: config.enableCompression ?? true,
            verbose: config.verbose ?? false,
        };
    }
    getPlugin() {
        return {
            name: 'time-travel',
            version: PLUGIN_API_VERSION,
            onRegister: () => {
                this.log(`⏱️  Time Travel plugin activated`);
                this.log(`   Max history: ${this.config.maxHistory}`);
                this.log(`   Full snapshot interval: ${this.config.fullSnapshotInterval}`);
            },
            onSignalCreate: (metadata, initialValue) => {
                this.signalValues.set(metadata.id, initialValue);
                this.log(`📌 Tracking signal: ${metadata.label || metadata.id}`);
            },
            onSignalUpdate: (context) => {
                if (!this.enabled || this.isRestoring)
                    return;
                this.signalValues.set(context.signal.id, context.newValue);
                this.recordSnapshot(context);
            },
            onUnregister: () => {
                this.log(`⏱️  Time Travel plugin deactivated`);
                this.log(`   Recorded ${this.snapshots.length} snapshots`);
                this.clear();
            },
        };
    }
    undo() {
        if (!this.canUndo()) {
            this.log('⏪ Cannot undo: at beginning of history');
            return false;
        }
        const snapshot = this.snapshots[this.currentIndex];
        const success = this.restoreState(this.currentIndex, 'undo');
        if (success) {
            this.currentIndex--;
            this.log(`⏪ Undo: ${snapshot.signalLabel || snapshot.signalId} → ${this.formatValue(snapshot.oldValue)}`);
        }
        return success;
    }
    redo() {
        if (!this.canRedo()) {
            this.log('⏩ Cannot redo: at end of history');
            return false;
        }
        this.currentIndex++;
        const snapshot = this.snapshots[this.currentIndex];
        const success = this.restoreState(this.currentIndex, 'redo');
        if (success) {
            this.log(`⏩ Redo: ${snapshot.signalLabel || snapshot.signalId} → ${this.formatValue(snapshot.newValue)}`);
        }
        return success;
    }
    jumpTo(index) {
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
    canUndo() {
        return this.currentIndex >= 0;
    }
    canRedo() {
        return this.currentIndex < this.snapshots.length - 1;
    }
    getCurrentIndex() {
        return this.currentIndex;
    }
    getSnapshotCount() {
        return this.snapshots.length;
    }
    getTimelineState() {
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
    getSnapshots() {
        return [...this.snapshots];
    }
    getSnapshotsForSignal(signalId) {
        return this.snapshots.filter(s => s.signalId === signalId);
    }
    getSnapshotAt(index) {
        return this.snapshots[index];
    }
    getCurrentSnapshot() {
        return this.snapshots[this.currentIndex];
    }
    exportSession() {
        return {
            timestamp: Date.now(),
            version: '1.0.0',
            snapshots: [...this.snapshots],
            currentIndex: this.currentIndex,
        };
    }
    importSession(session) {
        this.snapshots = [...session.snapshots];
        this.currentIndex = session.currentIndex;
        this.snapshotIdCounter = Math.max(...this.snapshots.map(s => s.id), 0) + 1;
        this.log(`📥 Imported session with ${this.snapshots.length} snapshots`);
    }
    clear() {
        this.snapshots = [];
        this.currentIndex = -1;
        this.snapshotIdCounter = 0;
        this.signalValues.clear();
        this.log('🗑️  History cleared');
    }
    setEnabled(enabled) {
        this.enabled = enabled;
        this.log(`${enabled ? '▶️' : '⏸️'}  Recording ${enabled ? 'enabled' : 'paused'}`);
    }
    isEnabled() {
        return this.enabled;
    }
    recordSnapshot(context) {
        const index = this.snapshots.length;
        const shouldBeFullSnapshot = index % this.config.fullSnapshotInterval === 0;
        const snapshot = {
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
        if (!shouldBeFullSnapshot && this.config.enableCompression) {
            snapshot.diff = this.computeDiff(context.oldValue, context.newValue);
        }
        if (this.currentIndex < this.snapshots.length - 1) {
            this.snapshots = this.snapshots.slice(0, this.currentIndex + 1);
            this.log(`✂️  Discarded ${this.snapshots.length - this.currentIndex - 1} future snapshots`);
        }
        this.snapshots.push(snapshot);
        this.currentIndex = this.snapshots.length - 1;
        if (this.snapshots.length > this.config.maxHistory) {
            const removed = this.snapshots.shift();
            this.currentIndex--;
            this.log(`📦 Pruned old snapshot #${removed?.id}`);
        }
        this.log(`📸 Snapshot #${snapshot.id}: ${snapshot.signalLabel || snapshot.signalId} = ${this.formatValue(snapshot.newValue)}`);
    }
    restoreState(index, direction = 'jump') {
        if (index < 0 || index >= this.snapshots.length) {
            return false;
        }
        const snapshot = this.snapshots[index];
        const signal = getSignalById(snapshot.signalId);
        if (!signal) {
            this.log(`⚠️  Signal ${snapshot.signalId} not found in registry`);
            this.signalValues.set(snapshot.signalId, snapshot.newValue);
            return false;
        }
        let valueToRestore;
        if (direction === 'undo') {
            valueToRestore = snapshot.oldValue;
        }
        else {
            valueToRestore = snapshot.newValue;
        }
        this.isRestoring = true;
        try {
            signal.set(valueToRestore);
            this.signalValues.set(snapshot.signalId, valueToRestore);
            return true;
        }
        catch (error) {
            console.error(`[TimeTravel] Error restoring signal ${snapshot.signalId}:`, error);
            return false;
        }
        finally {
            this.isRestoring = false;
        }
    }
    computeDiff(oldValue, newValue) {
        if (this.isPrimitive(oldValue) || this.isPrimitive(newValue)) {
            return {
                type: 'primitive',
                oldValue,
                newValue,
            };
        }
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
        if (typeof oldValue === 'object' && typeof newValue === 'object') {
            const oldKeys = Object.keys(oldValue);
            const newKeys = Object.keys(newValue);
            const added = {};
            const removed = [];
            const changed = {};
            for (const key of newKeys) {
                if (!oldKeys.includes(key)) {
                    added[key] = newValue[key];
                }
            }
            for (const key of oldKeys) {
                if (!newKeys.includes(key)) {
                    removed.push(key);
                }
            }
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
        return {
            type: 'primitive',
            oldValue,
            newValue,
        };
    }
    computeArrayDiff(oldArr, newArr) {
        const changed = {};
        const minLength = Math.min(oldArr.length, newArr.length);
        for (let i = 0; i < minLength; i++) {
            if (!this.isEqual(oldArr[i], newArr[i])) {
                changed[i.toString()] = { old: oldArr[i], new: newArr[i] };
            }
        }
        return changed;
    }
    isPrimitive(value) {
        return value == null || typeof value !== 'object';
    }
    isEqual(a, b) {
        if (a === b)
            return true;
        if (a == null || b == null)
            return false;
        if (typeof a !== typeof b)
            return false;
        if (typeof a !== 'object')
            return false;
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length)
            return false;
        return keysA.every(key => this.isEqual(a[key], b[key]));
    }
    formatValue(value) {
        if (value == null)
            return String(value);
        if (typeof value === 'string')
            return `"${value}"`;
        if (typeof value === 'object') {
            const str = JSON.stringify(value);
            return truncateString(str, SHORT_STRING_TRUNCATE_LENGTH);
        }
        return String(value);
    }
    log(...args) {
        if (this.config.verbose) {
            console.log('[TimeTravel]', ...args);
        }
    }
}
export function calculateMemoryUsage(snapshots) {
    const json = JSON.stringify(snapshots);
    return new Blob([json]).size;
}
export function formatMemorySize(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
export function createTimeTravelPlugin(config) {
    return new TimeTravelPlugin(config);
}
