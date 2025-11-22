/**
 * Plugin System (Middleware Layer) for SignalForge
 * 
 * Provides a flexible plugin architecture similar to Redux middleware,
 * allowing developers to extend SignalForge with custom behaviors.
 * 
 * Features:
 * - Lifecycle hooks: onSignalCreate, onSignalUpdate, onSignalDestroy
 * - Value interception and modification before set()
 * - Multiple plugins with ordered execution
 * - Type-safe plugin API with TypeScript support
 * - Example plugins: logger, debugger, time-travel
 */

/**
 * Signal metadata passed to plugin hooks
 */
export interface SignalMetadata {
  id: string;
  type: 'signal' | 'computed' | 'effect';
  createdAt: number;
  label?: string;
}

/**
 * Context object passed to plugin hooks
 */
export interface PluginContext<T = any> {
  signal: SignalMetadata;
  oldValue?: T;
  newValue: T;
  timestamp: number;
  source?: 'set' | 'compute' | 'init';
}

/**
 * Plugin lifecycle hooks
 */
export interface Plugin {
  /**
   * Unique identifier for the plugin
   */
  name: string;
  
  /**
   * Plugin version (optional)
   */
  version?: string;
  
  /**
   * Called when a new signal is created
   */
  onSignalCreate?<T>(metadata: SignalMetadata, initialValue: T): void;
  
  /**
   * Called before a signal value is updated
   * Can intercept and modify the new value
   * Return the value to set, or undefined to cancel the update
   */
  onBeforeUpdate?<T>(context: PluginContext<T>): T | undefined;
  
  /**
   * Called after a signal value has been updated
   */
  onSignalUpdate?<T>(context: PluginContext<T>): void;
  
  /**
   * Called when a signal is destroyed
   */
  onSignalDestroy?(metadata: SignalMetadata): void;
  
  /**
   * Called when the plugin is registered
   */
  onRegister?(): void;
  
  /**
   * Called when the plugin is unregistered
   */
  onUnregister?(): void;
}

/**
 * Registered plugins storage
 */
const registeredPlugins: Plugin[] = [];

/**
 * Map of signal IDs to metadata
 */
const signalMetadataMap = new Map<string, SignalMetadata>();

/**
 * Counter for generating unique signal IDs
 */
let signalIdCounter = 0;

/**
 * Flag to enable/disable plugin system globally
 */
let pluginsEnabled = true;

/**
 * Generate a unique signal ID
 */
function generateSignalId(): string {
  return `signal_${++signalIdCounter}_${Date.now()}`;
}

/**
 * Register a plugin to the SignalForge system
 * 
 * Plugins are executed in the order they are registered.
 * 
 * @param plugin - The plugin to register
 * @throws {Error} If a plugin with the same name is already registered
 * 
 * @example
 * ```ts
 * const loggerPlugin: Plugin = {
 *   name: 'logger',
 *   onSignalUpdate: (context) => {
 *     console.log('Updated:', context);
 *   }
 * };
 * 
 * registerPlugin(loggerPlugin);
 * ```
 */
export function registerPlugin(plugin: Plugin): void {
  // Check for duplicate plugin names
  if (registeredPlugins.some(p => p.name === plugin.name)) {
    throw new Error(`Plugin "${plugin.name}" is already registered`);
  }
  
  registeredPlugins.push(plugin);
  
  // Call onRegister hook if provided
  if (plugin.onRegister) {
    try {
      plugin.onRegister();
    } catch (error) {
      console.error(`Error in plugin "${plugin.name}" onRegister:`, error);
    }
  }
  
  console.log(`✅ Plugin "${plugin.name}" registered`);
}

/**
 * Unregister a plugin from the SignalForge system
 * 
 * @param pluginNameOrInstance - Plugin name or plugin instance to unregister
 * @returns True if plugin was unregistered, false if not found
 * 
 * @example
 * ```ts
 * unregisterPlugin('logger');
 * // or
 * unregisterPlugin(loggerPlugin);
 * ```
 */
export function unregisterPlugin(pluginNameOrInstance: string | Plugin): boolean {
  const pluginName = typeof pluginNameOrInstance === 'string' 
    ? pluginNameOrInstance 
    : pluginNameOrInstance.name;
  
  const index = registeredPlugins.findIndex(p => p.name === pluginName);
  
  if (index === -1) {
    return false;
  }
  
  const plugin = registeredPlugins[index];
  
  // Call onUnregister hook if provided
  if (plugin.onUnregister) {
    try {
      plugin.onUnregister();
    } catch (error) {
      console.error(`Error in plugin "${plugin.name}" onUnregister:`, error);
    }
  }
  
  registeredPlugins.splice(index, 1);
  console.log(`❌ Plugin "${plugin.name}" unregistered`);
  
  return true;
}

/**
 * Get all registered plugins
 * 
 * @returns Array of registered plugins
 */
export function getRegisteredPlugins(): readonly Plugin[] {
  return [...registeredPlugins];
}

/**
 * Clear all registered plugins
 */
export function clearPlugins(): void {
  const pluginNames = registeredPlugins.map(p => p.name);
  
  // Call onUnregister for all plugins
  registeredPlugins.forEach(plugin => {
    if (plugin.onUnregister) {
      try {
        plugin.onUnregister();
      } catch (error) {
        console.error(`Error in plugin "${plugin.name}" onUnregister:`, error);
      }
    }
  });
  
  registeredPlugins.length = 0;
  console.log(`🧹 Cleared ${pluginNames.length} plugins:`, pluginNames);
}

/**
 * Enable the plugin system globally
 */
export function enablePlugins(): void {
  pluginsEnabled = true;
  console.log('✅ Plugin system enabled');
}

/**
 * Disable the plugin system globally
 */
export function disablePlugins(): void {
  pluginsEnabled = false;
  console.log('⏸️  Plugin system disabled');
}

/**
 * Check if plugins are enabled
 */
export function arePluginsEnabled(): boolean {
  return pluginsEnabled;
}

/**
 * Register a signal with the plugin system
 * This should be called when a signal is created
 * 
 * @internal
 * @param type - Type of signal
 * @param initialValue - Initial value of the signal
 * @param label - Optional label for debugging
 * @returns Signal metadata object
 */
export function __registerSignal<T>(
  type: 'signal' | 'computed' | 'effect',
  initialValue: T,
  label?: string
): SignalMetadata {
  const metadata: SignalMetadata = {
    id: generateSignalId(),
    type,
    createdAt: Date.now(),
    label,
  };
  
  signalMetadataMap.set(metadata.id, metadata);
  
  // Call onSignalCreate hooks
  if (pluginsEnabled) {
    for (const plugin of registeredPlugins) {
      if (plugin.onSignalCreate) {
        try {
          plugin.onSignalCreate(metadata, initialValue);
        } catch (error) {
          console.error(`Error in plugin "${plugin.name}" onSignalCreate:`, error);
        }
      }
    }
  }
  
  return metadata;
}

/**
 * Notify plugins before a signal update
 * Allows plugins to intercept and modify the value
 * 
 * @internal
 * @param signalId - ID of the signal being updated
 * @param oldValue - Current value before update
 * @param newValue - New value to be set
 * @param source - Source of the update
 * @returns Modified value or undefined to cancel update
 */
export function __notifyBeforeUpdate<T>(
  signalId: string,
  oldValue: T,
  newValue: T,
  source: 'set' | 'compute' | 'init' = 'set'
): T | undefined {
  if (!pluginsEnabled) {
    return newValue;
  }
  
  const metadata = signalMetadataMap.get(signalId);
  if (!metadata) {
    return newValue;
  }
  
  let modifiedValue = newValue;
  
  // Execute onBeforeUpdate hooks in order
  for (const plugin of registeredPlugins) {
    if (plugin.onBeforeUpdate) {
      try {
        const context: PluginContext<T> = {
          signal: metadata,
          oldValue,
          newValue: modifiedValue,
          timestamp: Date.now(),
          source,
        };
        
        const result = plugin.onBeforeUpdate(context);
        
        // If plugin returns undefined, cancel the update
        if (result === undefined) {
          return undefined;
        }
        
        modifiedValue = result;
      } catch (error) {
        console.error(`Error in plugin "${plugin.name}" onBeforeUpdate:`, error);
      }
    }
  }
  
  return modifiedValue;
}

/**
 * Notify plugins after a signal update
 * 
 * @internal
 * @param signalId - ID of the signal that was updated
 * @param oldValue - Previous value
 * @param newValue - New value that was set
 * @param source - Source of the update
 */
export function __notifyAfterUpdate<T>(
  signalId: string,
  oldValue: T,
  newValue: T,
  source: 'set' | 'compute' | 'init' = 'set'
): void {
  if (!pluginsEnabled) {
    return;
  }
  
  const metadata = signalMetadataMap.get(signalId);
  if (!metadata) {
    return;
  }
  
  const context: PluginContext<T> = {
    signal: metadata,
    oldValue,
    newValue,
    timestamp: Date.now(),
    source,
  };
  
  // Execute onSignalUpdate hooks in order
  for (const plugin of registeredPlugins) {
    if (plugin.onSignalUpdate) {
      try {
        plugin.onSignalUpdate(context);
      } catch (error) {
        console.error(`Error in plugin "${plugin.name}" onSignalUpdate:`, error);
      }
    }
  }
}

/**
 * Notify plugins when a signal is destroyed
 * 
 * @internal
 * @param signalId - ID of the signal being destroyed
 */
export function __notifySignalDestroy(signalId: string): void {
  if (!pluginsEnabled) {
    return;
  }
  
  const metadata = signalMetadataMap.get(signalId);
  if (!metadata) {
    return;
  }
  
  // Execute onSignalDestroy hooks in order
  for (const plugin of registeredPlugins) {
    if (plugin.onSignalDestroy) {
      try {
        plugin.onSignalDestroy(metadata);
      } catch (error) {
        console.error(`Error in plugin "${plugin.name}" onSignalDestroy:`, error);
      }
    }
  }
  
  // Clean up metadata
  signalMetadataMap.delete(signalId);
}

/**
 * Get metadata for a signal
 * 
 * @internal
 * @param signalId - ID of the signal
 * @returns Signal metadata or undefined
 */
export function __getSignalMetadata(signalId: string): SignalMetadata | undefined {
  return signalMetadataMap.get(signalId);
}

// ============================================================================
// Built-in Example Plugins
// ============================================================================

/**
 * Logger plugin - logs all signal operations to console
 * 
 * @param options - Logger options
 * @returns Logger plugin instance
 * 
 * @example
 * ```ts
 * registerPlugin(createLoggerPlugin({ verbose: true }));
 * ```
 */
export function createLoggerPlugin(options: {
  verbose?: boolean;
  logCreates?: boolean;
  logUpdates?: boolean;
  logDestroys?: boolean;
} = {}): Plugin {
  const {
    verbose = false,
    logCreates = true,
    logUpdates = true,
    logDestroys = true,
  } = options;
  
  return {
    name: 'logger',
    version: '1.0.0',
    
    onRegister() {
      console.log('📝 Logger plugin activated');
    },
    
    onSignalCreate(metadata, initialValue) {
      if (logCreates) {
        console.log(`[Logger] 🆕 Created ${metadata.type} "${metadata.label || metadata.id}"`, 
          verbose ? { initialValue, metadata } : '');
      }
    },
    
    onSignalUpdate(context) {
      if (logUpdates) {
        console.log(
          `[Logger] 🔄 Updated ${context.signal.type} "${context.signal.label || context.signal.id}"`,
          verbose ? context : `${context.oldValue} → ${context.newValue}`
        );
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

/**
 * History entry for time-travel plugin
 */
export interface HistoryEntry {
  signalId: string;
  oldValue: any;
  newValue: any;
  timestamp: number;
}

/**
 * Time-travel debugger plugin
 * Records signal history and allows replay
 * 
 * @param options - Time-travel options
 * @returns Time-travel plugin instance with history controls
 * 
 * @example
 * ```ts
 * const timeTravel = createTimeTravelPlugin({ maxHistory: 100 });
 * registerPlugin(timeTravel.plugin);
 * 
 * // Later...
 * timeTravel.undo();
 * timeTravel.redo();
 * ```
 */
export function createTimeTravelPlugin(options: {
  maxHistory?: number;
} = {}) {
  const { maxHistory = 50 } = options;
  
  const history: HistoryEntry[] = [];
  const future: HistoryEntry[] = [];
  
  const plugin: Plugin = {
    name: 'time-travel',
    version: '1.0.0',
    
    onRegister() {
      console.log('⏱️  Time-travel plugin activated');
    },
    
    onSignalUpdate(context) {
      // Record the update
      history.push({
        signalId: context.signal.id,
        oldValue: context.oldValue,
        newValue: context.newValue,
        timestamp: context.timestamp,
      });
      
      // Clear future when new update happens
      future.length = 0;
      
      // Limit history size
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
    
    /**
     * Undo the last signal update
     */
    undo(): boolean {
      if (history.length === 0) {
        console.warn('Nothing to undo');
        return false;
      }
      
      const entry = history.pop()!;
      future.push(entry);
      
      console.log(`⏪ Undo: ${entry.newValue} → ${entry.oldValue}`);
      // Note: Actual signal restoration would require signal reference
      return true;
    },
    
    /**
     * Redo the last undone update
     */
    redo(): boolean {
      if (future.length === 0) {
        console.warn('Nothing to redo');
        return false;
      }
      
      const entry = future.pop()!;
      history.push(entry);
      
      console.log(`⏩ Redo: ${entry.oldValue} → ${entry.newValue}`);
      return true;
    },
    
    /**
     * Get the history of updates
     */
    getHistory(): readonly HistoryEntry[] {
      return [...history];
    },
    
    /**
     * Clear history and future
     */
    clear(): void {
      history.length = 0;
      future.length = 0;
      console.log('🧹 Time-travel history cleared');
    },
    
    /**
     * Get the number of items in history
     */
    get historySize(): number {
      return history.length;
    },
    
    /**
     * Get the number of items in future (redo stack)
     */
    get futureSize(): number {
      return future.length;
    },
  };
}

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  totalUpdates: number;
  updatesBySignal: Map<string, number>;
  averageUpdateTime: number;
  slowestUpdate: { signalId: string; duration: number } | null;
}

/**
 * Performance monitoring plugin
 * Tracks update frequency and performance metrics
 * 
 * @returns Performance plugin instance with metrics
 * 
 * @example
 * ```ts
 * const perfMonitor = createPerformancePlugin();
 * registerPlugin(perfMonitor.plugin);
 * 
 * // Later...
 * console.log(perfMonitor.getMetrics());
 * ```
 */
export function createPerformancePlugin() {
  
  const metrics: PerformanceMetrics = {
    totalUpdates: 0,
    updatesBySignal: new Map(),
    averageUpdateTime: 0,
    slowestUpdate: null,
  };
  
  let totalDuration = 0;
  const updateStartTimes = new Map<string, number>();
  
  const plugin: Plugin = {
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
        
        // Track metrics
        metrics.totalUpdates++;
        metrics.updatesBySignal.set(
          context.signal.id,
          (metrics.updatesBySignal.get(context.signal.id) || 0) + 1
        );
        
        metrics.averageUpdateTime = totalDuration / metrics.totalUpdates;
        
        // Track slowest update
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
    
    /**
     * Get performance metrics
     */
    getMetrics(): Readonly<PerformanceMetrics> {
      return { ...metrics, updatesBySignal: new Map(metrics.updatesBySignal) };
    },
    
    /**
     * Reset metrics
     */
    reset(): void {
      metrics.totalUpdates = 0;
      metrics.updatesBySignal.clear();
      metrics.averageUpdateTime = 0;
      metrics.slowestUpdate = null;
      totalDuration = 0;
      console.log('🧹 Performance metrics reset');
    },
    
    /**
     * Print metrics to console
     */
    printMetrics(): void {
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

/**
 * Validation plugin
 * Validates signal values before updates
 * 
 * @param validators - Map of signal labels to validation functions
 * @returns Validation plugin instance
 * 
 * @example
 * ```ts
 * const validationPlugin = createValidationPlugin({
 *   'age': (value) => value >= 0 && value <= 150,
 *   'email': (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
 * });
 * 
 * registerPlugin(validationPlugin);
 * ```
 */
export function createValidationPlugin(
  validators: Record<string, (value: any) => boolean>
): Plugin {
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
          console.error(
            `[Validation] ❌ Invalid value for signal "${label}":`,
            context.newValue
          );
          // Return undefined to cancel the update
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
