const registeredPlugins = [];
const signalMetadataMap = new Map();
let signalIdCounter = 0;
let pluginsEnabled = true;
function generateSignalId() {
    return `signal_${++signalIdCounter}_${Date.now()}`;
}
export function registerPlugin(plugin) {
    if (registeredPlugins.some(p => p.name === plugin.name)) {
        throw new Error(`Plugin "${plugin.name}" is already registered`);
    }
    registeredPlugins.push(plugin);
    if (plugin.onRegister) {
        try {
            plugin.onRegister();
        }
        catch (error) {
            console.error(`Error in plugin "${plugin.name}" onRegister:`, error);
        }
    }
    console.log(`✅ Plugin "${plugin.name}" registered`);
}
export function unregisterPlugin(pluginNameOrInstance) {
    const pluginName = typeof pluginNameOrInstance === 'string'
        ? pluginNameOrInstance
        : pluginNameOrInstance.name;
    const index = registeredPlugins.findIndex(p => p.name === pluginName);
    if (index === -1) {
        return false;
    }
    const plugin = registeredPlugins[index];
    if (plugin.onUnregister) {
        try {
            plugin.onUnregister();
        }
        catch (error) {
            console.error(`Error in plugin "${plugin.name}" onUnregister:`, error);
        }
    }
    registeredPlugins.splice(index, 1);
    console.log(`❌ Plugin "${plugin.name}" unregistered`);
    return true;
}
export function getRegisteredPlugins() {
    return [...registeredPlugins];
}
export function clearPlugins() {
    const pluginNames = registeredPlugins.map(p => p.name);
    registeredPlugins.forEach(plugin => {
        if (plugin.onUnregister) {
            try {
                plugin.onUnregister();
            }
            catch (error) {
                console.error(`Error in plugin "${plugin.name}" onUnregister:`, error);
            }
        }
    });
    registeredPlugins.length = 0;
    console.log(`🧹 Cleared ${pluginNames.length} plugins:`, pluginNames);
}
export function enablePlugins() {
    pluginsEnabled = true;
    console.log('✅ Plugin system enabled');
}
export function disablePlugins() {
    pluginsEnabled = false;
    console.log('⏸️  Plugin system disabled');
}
export function arePluginsEnabled() {
    return pluginsEnabled;
}
export function __registerSignal(type, initialValue, label) {
    const metadata = {
        id: generateSignalId(),
        type,
        createdAt: Date.now(),
        label,
    };
    signalMetadataMap.set(metadata.id, metadata);
    if (pluginsEnabled) {
        for (const plugin of registeredPlugins) {
            if (plugin.onSignalCreate) {
                try {
                    plugin.onSignalCreate(metadata, initialValue);
                }
                catch (error) {
                    console.error(`Error in plugin "${plugin.name}" onSignalCreate:`, error);
                }
            }
        }
    }
    return metadata;
}
export function __notifyBeforeUpdate(signalId, oldValue, newValue, source = 'set') {
    if (!pluginsEnabled) {
        return newValue;
    }
    const metadata = signalMetadataMap.get(signalId);
    if (!metadata) {
        return newValue;
    }
    let modifiedValue = newValue;
    for (const plugin of registeredPlugins) {
        if (plugin.onBeforeUpdate) {
            try {
                const context = {
                    signal: metadata,
                    oldValue,
                    newValue: modifiedValue,
                    timestamp: Date.now(),
                    source,
                };
                const result = plugin.onBeforeUpdate(context);
                if (result === undefined) {
                    return undefined;
                }
                modifiedValue = result;
            }
            catch (error) {
                console.error(`Error in plugin "${plugin.name}" onBeforeUpdate:`, error);
            }
        }
    }
    return modifiedValue;
}
export function __notifyAfterUpdate(signalId, oldValue, newValue, source = 'set') {
    if (!pluginsEnabled) {
        return;
    }
    const metadata = signalMetadataMap.get(signalId);
    if (!metadata) {
        return;
    }
    const context = {
        signal: metadata,
        oldValue,
        newValue,
        timestamp: Date.now(),
        source,
    };
    for (const plugin of registeredPlugins) {
        if (plugin.onSignalUpdate) {
            try {
                plugin.onSignalUpdate(context);
            }
            catch (error) {
                console.error(`Error in plugin "${plugin.name}" onSignalUpdate:`, error);
            }
        }
    }
}
export function __notifySignalDestroy(signalId) {
    if (!pluginsEnabled) {
        return;
    }
    const metadata = signalMetadataMap.get(signalId);
    if (!metadata) {
        return;
    }
    for (const plugin of registeredPlugins) {
        if (plugin.onSignalDestroy) {
            try {
                plugin.onSignalDestroy(metadata);
            }
            catch (error) {
                console.error(`Error in plugin "${plugin.name}" onSignalDestroy:`, error);
            }
        }
    }
    signalMetadataMap.delete(signalId);
}
export function __getSignalMetadata(signalId) {
    return signalMetadataMap.get(signalId);
}
export function createLoggerPlugin(options = {}) {
    const { verbose = false, logCreates = true, logUpdates = true, logDestroys = true, } = options;
    return {
        name: 'logger',
        version: '1.0.0',
        onRegister() {
            console.log('📝 Logger plugin activated');
        },
        onSignalCreate(metadata, initialValue) {
            if (logCreates) {
                console.log(`[Logger] 🆕 Created ${metadata.type} "${metadata.label || metadata.id}"`, verbose ? { initialValue, metadata } : '');
            }
        },
        onSignalUpdate(context) {
            if (logUpdates) {
                console.log(`[Logger] 🔄 Updated ${context.signal.type} "${context.signal.label || context.signal.id}"`, verbose ? context : `${context.oldValue} → ${context.newValue}`);
            }
        },
        onSignalDestroy(metadata) {
            if (logDestroys) {
                console.log(`[Logger] 🗑️  Destroyed ${metadata.type} "${metadata.label || metadata.id}"`);
            }
        },
        onUnregister() {
            console.log('📝 Logger plugin deactivated');
        },
    };
}
export function createTimeTravelPlugin(options = {}) {
    const { maxHistory = 50 } = options;
    const history = [];
    const future = [];
    const plugin = {
        name: 'time-travel',
        version: '1.0.0',
        onRegister() {
            console.log('⏱️  Time-travel plugin activated');
        },
        onSignalUpdate(context) {
            history.push({
                signalId: context.signal.id,
                oldValue: context.oldValue,
                newValue: context.newValue,
                timestamp: context.timestamp,
            });
            future.length = 0;
            if (history.length > maxHistory) {
                history.shift();
            }
        },
        onUnregister() {
            console.log('⏱️  Time-travel plugin deactivated');
            history.length = 0;
            future.length = 0;
        },
    };
    return {
        plugin,
        undo() {
            if (history.length === 0) {
                console.warn('Nothing to undo');
                return false;
            }
            const entry = history.pop();
            future.push(entry);
            console.log(`⏪ Undo: ${entry.newValue} → ${entry.oldValue}`);
            return true;
        },
        redo() {
            if (future.length === 0) {
                console.warn('Nothing to redo');
                return false;
            }
            const entry = future.pop();
            history.push(entry);
            console.log(`⏩ Redo: ${entry.oldValue} → ${entry.newValue}`);
            return true;
        },
        getHistory() {
            return [...history];
        },
        clear() {
            history.length = 0;
            future.length = 0;
            console.log('🧹 Time-travel history cleared');
        },
        get historySize() {
            return history.length;
        },
        get futureSize() {
            return future.length;
        },
    };
}
export function createPerformancePlugin() {
    const metrics = {
        totalUpdates: 0,
        updatesBySignal: new Map(),
        averageUpdateTime: 0,
        slowestUpdate: null,
    };
    let totalDuration = 0;
    const updateStartTimes = new Map();
    const plugin = {
        name: 'performance',
        version: '1.0.0',
        onRegister() {
            console.log('⚡ Performance monitoring plugin activated');
        },
        onBeforeUpdate(context) {
            updateStartTimes.set(context.signal.id, performance.now());
            return context.newValue;
        },
        onSignalUpdate(context) {
            const startTime = updateStartTimes.get(context.signal.id);
            if (startTime !== undefined) {
                const duration = performance.now() - startTime;
                totalDuration += duration;
                updateStartTimes.delete(context.signal.id);
                metrics.totalUpdates++;
                metrics.updatesBySignal.set(context.signal.id, (metrics.updatesBySignal.get(context.signal.id) || 0) + 1);
                metrics.averageUpdateTime = totalDuration / metrics.totalUpdates;
                if (!metrics.slowestUpdate || duration > metrics.slowestUpdate.duration) {
                    metrics.slowestUpdate = {
                        signalId: context.signal.label || context.signal.id,
                        duration,
                    };
                }
            }
        },
        onUnregister() {
            console.log('⚡ Performance monitoring plugin deactivated');
        },
    };
    return {
        plugin,
        getMetrics() {
            return { ...metrics, updatesBySignal: new Map(metrics.updatesBySignal) };
        },
        reset() {
            metrics.totalUpdates = 0;
            metrics.updatesBySignal.clear();
            metrics.averageUpdateTime = 0;
            metrics.slowestUpdate = null;
            totalDuration = 0;
            console.log('🧹 Performance metrics reset');
        },
        printMetrics() {
            console.log('\n📊 Performance Metrics');
            console.log('='.repeat(50));
            console.log(`Total Updates: ${metrics.totalUpdates}`);
            console.log(`Average Update Time: ${metrics.averageUpdateTime.toFixed(3)}ms`);
            if (metrics.slowestUpdate) {
                console.log(`Slowest Update: ${metrics.slowestUpdate.signalId} (${metrics.slowestUpdate.duration.toFixed(3)}ms)`);
            }
            console.log(`\nUpdates by Signal:`);
            metrics.updatesBySignal.forEach((count, signalId) => {
                console.log(`  ${signalId}: ${count} updates`);
            });
            console.log('='.repeat(50) + '\n');
        },
    };
}
export function createValidationPlugin(validators) {
    return {
        name: 'validation',
        version: '1.0.0',
        onRegister() {
            console.log('✅ Validation plugin activated');
        },
        onBeforeUpdate(context) {
            const label = context.signal.label;
            if (label && validators[label]) {
                const isValid = validators[label](context.newValue);
                if (!isValid) {
                    console.error(`[Validation] ❌ Invalid value for signal "${label}":`, context.newValue);
                    return undefined;
                }
            }
            return context.newValue;
        },
        onUnregister() {
            console.log('✅ Validation plugin deactivated');
        },
    };
}
