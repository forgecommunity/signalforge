import { registerPlugin as coreRegisterPlugin, unregisterPlugin as coreUnregisterPlugin, } from './plugins';
const pluginRegistry = new Map();
let registryLock = false;
const operationQueue = [];
async function acquireLock() {
    return new Promise((resolve) => {
        if (!registryLock) {
            registryLock = true;
            resolve();
        }
        else {
            operationQueue.push(() => resolve());
        }
    });
}
function releaseLock() {
    const nextOperation = operationQueue.shift();
    if (nextOperation) {
        nextOperation();
    }
    else {
        registryLock = false;
    }
}
async function withLock(operation) {
    await acquireLock();
    try {
        return await operation();
    }
    finally {
        releaseLock();
    }
}
function createManagedPlugin(name, originalPlugin) {
    const getState = () => pluginRegistry.get(name);
    return {
        name: originalPlugin.name,
        version: originalPlugin.version,
        onRegister() {
            if (originalPlugin.onRegister) {
                try {
                    originalPlugin.onRegister();
                }
                catch (error) {
                    console.error(`[PluginManager] Error in "${name}" onRegister:`, error);
                    const state = getState();
                    if (state)
                        state.metadata.errorCount++;
                }
            }
        },
        onUnregister() {
            if (originalPlugin.onUnregister) {
                try {
                    originalPlugin.onUnregister();
                }
                catch (error) {
                    console.error(`[PluginManager] Error in "${name}" onUnregister:`, error);
                    const state = getState();
                    if (state)
                        state.metadata.errorCount++;
                }
            }
        },
        onSignalCreate(metadata, initialValue) {
            const state = getState();
            if (!state?.enabled)
                return;
            if (originalPlugin.onSignalCreate) {
                try {
                    originalPlugin.onSignalCreate(metadata, initialValue);
                }
                catch (error) {
                    console.error(`[PluginManager] Error in "${name}" onSignalCreate:`, error);
                    state.metadata.errorCount++;
                }
            }
        },
        onBeforeUpdate(context) {
            const state = getState();
            if (!state?.enabled)
                return context.newValue;
            if (originalPlugin.onBeforeUpdate) {
                try {
                    return originalPlugin.onBeforeUpdate(context);
                }
                catch (error) {
                    console.error(`[PluginManager] Error in "${name}" onBeforeUpdate:`, error);
                    state.metadata.errorCount++;
                    return context.newValue;
                }
            }
            return context.newValue;
        },
        onSignalUpdate(context) {
            const state = getState();
            if (!state?.enabled)
                return;
            if (originalPlugin.onSignalUpdate) {
                try {
                    originalPlugin.onSignalUpdate(context);
                }
                catch (error) {
                    console.error(`[PluginManager] Error in "${name}" onSignalUpdate:`, error);
                    state.metadata.errorCount++;
                }
            }
        },
        onSignalDestroy(metadata) {
            const state = getState();
            if (!state?.enabled)
                return;
            if (originalPlugin.onSignalDestroy) {
                try {
                    originalPlugin.onSignalDestroy(metadata);
                }
                catch (error) {
                    console.error(`[PluginManager] Error in "${name}" onSignalDestroy:`, error);
                    state.metadata.errorCount++;
                }
            }
        },
    };
}
export async function registerPlugin(name, plugin, options = {}) {
    await withLock(() => {
        if (pluginRegistry.has(name)) {
            throw new Error(`[PluginManager] Plugin "${name}" is already registered`);
        }
        const enabled = options.enabled !== false;
        const now = Date.now();
        const state = {
            plugin,
            enabled,
            registeredAt: now,
            enabledAt: enabled ? now : null,
            disabledAt: enabled ? null : now,
            metadata: {
                enableCount: enabled ? 1 : 0,
                disableCount: enabled ? 0 : 1,
                errorCount: 0,
            },
        };
        pluginRegistry.set(name, state);
        const managedPlugin = createManagedPlugin(name, plugin);
        coreRegisterPlugin(managedPlugin);
        console.log(`✅ [PluginManager] Plugin "${name}" registered and ${enabled ? 'enabled' : 'disabled'}`);
    });
}
export async function enablePlugin(name) {
    return withLock(() => {
        const state = pluginRegistry.get(name);
        if (!state) {
            console.warn(`[PluginManager] Plugin "${name}" not found`);
            return false;
        }
        if (state.enabled) {
            console.log(`[PluginManager] Plugin "${name}" is already enabled`);
            return false;
        }
        state.enabled = true;
        state.enabledAt = Date.now();
        state.metadata.enableCount++;
        console.log(`✅ [PluginManager] Plugin "${name}" enabled`);
        return true;
    });
}
export async function disablePlugin(name) {
    return withLock(() => {
        const state = pluginRegistry.get(name);
        if (!state) {
            console.warn(`[PluginManager] Plugin "${name}" not found`);
            return false;
        }
        if (!state.enabled) {
            console.log(`[PluginManager] Plugin "${name}" is already disabled`);
            return false;
        }
        state.enabled = false;
        state.disabledAt = Date.now();
        state.metadata.disableCount++;
        console.log(`⏸️  [PluginManager] Plugin "${name}" disabled`);
        return true;
    });
}
export async function unregisterPlugin(name) {
    return withLock(() => {
        const state = pluginRegistry.get(name);
        if (!state) {
            console.warn(`[PluginManager] Plugin "${name}" not found`);
            return false;
        }
        coreUnregisterPlugin(state.plugin.name);
        pluginRegistry.delete(name);
        console.log(`❌ [PluginManager] Plugin "${name}" unregistered`);
        return true;
    });
}
export function getPlugin(name) {
    return pluginRegistry.get(name)?.plugin;
}
export function isPluginEnabled(name) {
    return pluginRegistry.get(name)?.enabled ?? false;
}
export function getAllPlugins() {
    return Array.from(pluginRegistry.entries()).map(([name, state]) => ({
        name,
        plugin: state.plugin,
        enabled: state.enabled,
        registeredAt: state.registeredAt,
        enabledAt: state.enabledAt,
        disabledAt: state.disabledAt,
        metadata: { ...state.metadata },
    }));
}
export function getPluginStats() {
    let enabled = 0;
    let disabled = 0;
    let totalErrors = 0;
    for (const state of pluginRegistry.values()) {
        if (state.enabled)
            enabled++;
        else
            disabled++;
        totalErrors += state.metadata.errorCount;
    }
    return {
        total: pluginRegistry.size,
        enabled,
        disabled,
        totalErrors,
    };
}
export async function clearAllPlugins() {
    await withLock(() => {
        const pluginNames = Array.from(pluginRegistry.keys());
        for (const name of pluginNames) {
            const state = pluginRegistry.get(name);
            if (state) {
                coreUnregisterPlugin(state.plugin.name);
            }
        }
        pluginRegistry.clear();
        console.log(`🧹 [PluginManager] Cleared ${pluginNames.length} plugins`);
    });
}
export function printPluginStatus() {
    console.log('\n📊 Plugin Manager Status');
    console.log('='.repeat(60));
    const stats = getPluginStats();
    console.log(`Total Plugins: ${stats.total}`);
    console.log(`Enabled: ${stats.enabled}`);
    console.log(`Disabled: ${stats.disabled}`);
    console.log(`Total Errors: ${stats.totalErrors}`);
    if (pluginRegistry.size > 0) {
        console.log('\n📋 Registered Plugins:');
        for (const [name, state] of pluginRegistry.entries()) {
            const status = state.enabled ? '✅ Enabled' : '⏸️  Disabled';
            const version = state.plugin.version ? ` v${state.plugin.version}` : '';
            const errors = state.metadata.errorCount > 0
                ? ` (${state.metadata.errorCount} errors)`
                : '';
            console.log(`  ${status} - ${name}${version}${errors}`);
        }
    }
    console.log('='.repeat(60) + '\n');
}
export class LoggerPlugin {
    constructor(options = {}) {
        this.verbose = options.verbose ?? false;
        this.logCreates = options.logCreates ?? true;
        this.logUpdates = options.logUpdates ?? true;
        this.logDestroys = options.logDestroys ?? true;
        this.startTime = Date.now();
    }
    getElapsedTime() {
        const elapsed = Date.now() - this.startTime;
        return `+${elapsed}ms`;
    }
    formatTimestamp(timestamp) {
        return new Date(timestamp).toISOString();
    }
    getPlugin() {
        return {
            name: 'logger',
            version: '2.0.0',
            onRegister: () => {
                console.log(`📝 [Logger] Plugin activated at ${this.formatTimestamp(Date.now())}`);
                this.startTime = Date.now();
            },
            onSignalCreate: (metadata, initialValue) => {
                if (!this.logCreates)
                    return;
                const label = metadata.label || metadata.id;
                console.log(`🆕 [Logger] ${this.getElapsedTime()} Created ${metadata.type} "${label}"`, this.verbose
                    ? { initialValue, metadata, timestamp: this.formatTimestamp(metadata.createdAt) }
                    : `= ${JSON.stringify(initialValue)}`);
            },
            onSignalUpdate: (context) => {
                if (!this.logUpdates)
                    return;
                const label = context.signal.label || context.signal.id;
                const source = context.source ? `[${context.source}]` : '';
                console.log(`🔄 [Logger] ${this.getElapsedTime()} Updated ${context.signal.type} "${label}" ${source}`, this.verbose
                    ? { context, timestamp: this.formatTimestamp(context.timestamp) }
                    : `${JSON.stringify(context.oldValue)} → ${JSON.stringify(context.newValue)}`);
            },
            onSignalDestroy: (metadata) => {
                if (!this.logDestroys)
                    return;
                const label = metadata.label || metadata.id;
                console.log(`🗑️  [Logger] ${this.getElapsedTime()} Destroyed ${metadata.type} "${label}"`);
            },
            onUnregister: () => {
                console.log(`📝 [Logger] Plugin deactivated after ${this.getElapsedTime()}`);
            },
        };
    }
}
export class TimeTravelPlugin {
    constructor(options = {}) {
        this.history = [];
        this.future = [];
        this.snapshots = new Map();
        this.maxHistory = options.maxHistory ?? 50;
    }
    getPlugin() {
        return {
            name: 'time-travel',
            version: '2.0.0',
            onRegister: () => {
                console.log(`⏱️  [TimeTravel] Plugin activated (max history: ${this.maxHistory})`);
            },
            onSignalUpdate: (context) => {
                this.history.push({ ...context });
                this.future = [];
                if (this.history.length > this.maxHistory) {
                    this.history.shift();
                }
            },
            onUnregister: () => {
                console.log(`⏱️  [TimeTravel] Plugin deactivated (recorded ${this.history.length} updates)`);
                this.clear();
            },
        };
    }
    undo() {
        if (this.history.length === 0) {
            console.warn('[TimeTravel] Nothing to undo');
            return false;
        }
        const entry = this.history.pop();
        this.future.push(entry);
        const label = entry.signal.label || entry.signal.id;
        console.log(`⏪ [TimeTravel] Undo: ${label} ${JSON.stringify(entry.newValue)} → ${JSON.stringify(entry.oldValue)}`);
        return true;
    }
    redo() {
        if (this.future.length === 0) {
            console.warn('[TimeTravel] Nothing to redo');
            return false;
        }
        const entry = this.future.pop();
        this.history.push(entry);
        const label = entry.signal.label || entry.signal.id;
        console.log(`⏩ [TimeTravel] Redo: ${label} ${JSON.stringify(entry.oldValue)} → ${JSON.stringify(entry.newValue)}`);
        return true;
    }
    getHistory() {
        return this.history.map(entry => ({ ...entry }));
    }
    getHistoryForSignal(signalId) {
        return this.history
            .filter(entry => entry.signal.id === signalId)
            .map(entry => ({ ...entry }));
    }
    createSnapshot(name) {
        this.snapshots.set(name, [...this.history]);
        console.log(`📸 [TimeTravel] Snapshot "${name}" created with ${this.history.length} entries`);
    }
    restoreSnapshot(name) {
        const snapshot = this.snapshots.get(name);
        if (!snapshot) {
            console.warn(`[TimeTravel] Snapshot "${name}" not found`);
            return false;
        }
        this.history = [...snapshot];
        this.future = [];
        console.log(`📸 [TimeTravel] Restored snapshot "${name}"`);
        return true;
    }
    listSnapshots() {
        return Array.from(this.snapshots.keys());
    }
    clear() {
        this.history = [];
        this.future = [];
        console.log('🧹 [TimeTravel] History cleared');
    }
    getStats() {
        return {
            historySize: this.history.length,
            futureSize: this.future.length,
            snapshotCount: this.snapshots.size,
            maxHistory: this.maxHistory,
        };
    }
    printHistory(limit = 10) {
        console.log('\n📜 Time-Travel History');
        console.log('='.repeat(60));
        const stats = this.getStats();
        console.log(`History: ${stats.historySize}/${stats.maxHistory}`);
        console.log(`Future: ${stats.futureSize}`);
        console.log(`Snapshots: ${stats.snapshotCount}`);
        if (this.history.length > 0) {
            console.log(`\nRecent Updates (showing last ${Math.min(limit, this.history.length)}):`);
            const recent = this.history.slice(-limit);
            recent.forEach((entry, index) => {
                const label = entry.signal.label || entry.signal.id;
                const timestamp = new Date(entry.timestamp).toISOString();
                console.log(`  ${index + 1}. [${timestamp}] ${label}: ${JSON.stringify(entry.oldValue)} → ${JSON.stringify(entry.newValue)}`);
            });
        }
        console.log('='.repeat(60) + '\n');
    }
}
export function __getPluginInfoForDevTools() {
    return Array.from(pluginRegistry.entries()).map(([name, state]) => ({
        name,
        version: state.plugin.version,
        enabled: state.enabled,
        registeredAt: new Date(state.registeredAt).toISOString(),
        stats: {
            enableCount: state.metadata.enableCount,
            disableCount: state.metadata.disableCount,
            errorCount: state.metadata.errorCount,
        },
    }));
}
