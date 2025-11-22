/**
 * Plugin Manager for SignalForge
 * 
 * Official plugin ecosystem manager that allows registering, enabling, and disabling
 * plugins dynamically. Each plugin exposes lifecycle hooks: onCreate, onUpdate, onDestroy.
 * 
 * Features:
 * - Dynamic plugin registration and management
 * - Enable/disable plugins at runtime without unregistering
 * - Thread-safe plugin state management with locks
 * - Type-safe plugin API with full TypeScript support
 * - Integration with DevTools for plugin inspection
 * - Built-in sample plugins: LoggerPlugin, TimeTravelPlugin
 * 
 * API:
 * - registerPlugin(name, plugin) - Register a plugin
 * - enablePlugin(name) - Enable a disabled plugin
 * - disablePlugin(name) - Disable a plugin temporarily
 * - getPlugin(name) - Get plugin instance
 * - getAllPlugins() - Get all registered plugins
 * - isPluginEnabled(name) - Check if plugin is enabled
 */

import {
  Plugin,
  SignalMetadata,
  PluginContext,
  getRegisteredPlugins,
  registerPlugin as coreRegisterPlugin,
  unregisterPlugin as coreUnregisterPlugin,
} from './plugins';

// ============================================================================
// Plugin State Management
// ============================================================================

/**
 * Plugin state information
 */
interface PluginState {
  plugin: Plugin;
  enabled: boolean;
  registeredAt: number;
  enabledAt: number | null;
  disabledAt: number | null;
  metadata: {
    enableCount: number;
    disableCount: number;
    errorCount: number;
  };
}

/**
 * Registry of all managed plugins with their state
 */
const pluginRegistry = new Map<string, PluginState>();

/**
 * Lock for thread-safe operations
 * Prevents race conditions when multiple async operations modify plugin state
 */
let registryLock = false;

/**
 * Queue for operations waiting on the lock
 */
const operationQueue: Array<() => void> = [];

/**
 * Acquire lock for thread-safe operation
 */
async function acquireLock(): Promise<void> {
  return new Promise((resolve) => {
    if (!registryLock) {
      registryLock = true;
      resolve();
    } else {
      operationQueue.push(() => resolve());
    }
  });
}

/**
 * Release lock and process next queued operation
 */
function releaseLock(): void {
  const nextOperation = operationQueue.shift();
  if (nextOperation) {
    nextOperation();
  } else {
    registryLock = false;
  }
}

/**
 * Execute operation with lock
 */
async function withLock<T>(operation: () => T | Promise<T>): Promise<T> {
  await acquireLock();
  try {
    return await operation();
  } finally {
    releaseLock();
  }
}

// ============================================================================
// Plugin Wrapper for Enable/Disable Support
// ============================================================================

/**
 * Creates a wrapper plugin that respects enable/disable state
 */
function createManagedPlugin(name: string, originalPlugin: Plugin): Plugin {
  const getState = () => pluginRegistry.get(name);
  
  return {
    name: originalPlugin.name,
    version: originalPlugin.version,
    
    onRegister() {
      if (originalPlugin.onRegister) {
        try {
          originalPlugin.onRegister();
        } catch (error) {
          console.error(`[PluginManager] Error in "${name}" onRegister:`, error);
          const state = getState();
          if (state) state.metadata.errorCount++;
        }
      }
    },
    
    onUnregister() {
      if (originalPlugin.onUnregister) {
        try {
          originalPlugin.onUnregister();
        } catch (error) {
          console.error(`[PluginManager] Error in "${name}" onUnregister:`, error);
          const state = getState();
          if (state) state.metadata.errorCount++;
        }
      }
    },
    
    onSignalCreate(metadata, initialValue) {
      const state = getState();
      if (!state?.enabled) return;
      
      if (originalPlugin.onSignalCreate) {
        try {
          originalPlugin.onSignalCreate(metadata, initialValue);
        } catch (error) {
          console.error(`[PluginManager] Error in "${name}" onSignalCreate:`, error);
          state.metadata.errorCount++;
        }
      }
    },
    
    onBeforeUpdate(context) {
      const state = getState();
      if (!state?.enabled) return context.newValue;
      
      if (originalPlugin.onBeforeUpdate) {
        try {
          return originalPlugin.onBeforeUpdate(context);
        } catch (error) {
          console.error(`[PluginManager] Error in "${name}" onBeforeUpdate:`, error);
          state.metadata.errorCount++;
          return context.newValue;
        }
      }
      
      return context.newValue;
    },
    
    onSignalUpdate(context) {
      const state = getState();
      if (!state?.enabled) return;
      
      if (originalPlugin.onSignalUpdate) {
        try {
          originalPlugin.onSignalUpdate(context);
        } catch (error) {
          console.error(`[PluginManager] Error in "${name}" onSignalUpdate:`, error);
          state.metadata.errorCount++;
        }
      }
    },
    
    onSignalDestroy(metadata) {
      const state = getState();
      if (!state?.enabled) return;
      
      if (originalPlugin.onSignalDestroy) {
        try {
          originalPlugin.onSignalDestroy(metadata);
        } catch (error) {
          console.error(`[PluginManager] Error in "${name}" onSignalDestroy:`, error);
          state.metadata.errorCount++;
        }
      }
    },
  };
}

// ============================================================================
// Core Plugin Manager API
// ============================================================================

/**
 * Register a plugin with the plugin manager
 * 
 * @param name - Unique identifier for the plugin
 * @param plugin - Plugin implementation
 * @param options - Registration options
 * @throws {Error} If plugin with same name already exists
 * 
 * @example
 * ```ts
 * const myPlugin: Plugin = {
 *   name: 'my-plugin',
 *   onSignalUpdate: (context) => console.log('Updated:', context),
 * };
 * 
 * registerPlugin('my-plugin', myPlugin);
 * ```
 */
export async function registerPlugin(
  name: string,
  plugin: Plugin,
  options: { enabled?: boolean } = {}
): Promise<void> {
  await withLock(() => {
    if (pluginRegistry.has(name)) {
      throw new Error(`[PluginManager] Plugin "${name}" is already registered`);
    }
    
    const enabled = options.enabled !== false; // Default to enabled
    const now = Date.now();
    
    // Create state entry
    const state: PluginState = {
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
    
    // Register with core plugin system
    const managedPlugin = createManagedPlugin(name, plugin);
    coreRegisterPlugin(managedPlugin);
    
    console.log(
      `✅ [PluginManager] Plugin "${name}" registered and ${enabled ? 'enabled' : 'disabled'}`
    );
  });
}

/**
 * Enable a disabled plugin
 * 
 * @param name - Plugin name to enable
 * @returns True if enabled, false if not found or already enabled
 * 
 * @example
 * ```ts
 * enablePlugin('my-plugin');
 * ```
 */
export async function enablePlugin(name: string): Promise<boolean> {
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

/**
 * Disable an enabled plugin
 * 
 * The plugin remains registered but its hooks will not be called.
 * This is useful for temporarily disabling plugins without losing their state.
 * 
 * @param name - Plugin name to disable
 * @returns True if disabled, false if not found or already disabled
 * 
 * @example
 * ```ts
 * disablePlugin('my-plugin');
 * ```
 */
export async function disablePlugin(name: string): Promise<boolean> {
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

/**
 * Unregister a plugin completely
 * 
 * Removes the plugin from the registry and core plugin system.
 * 
 * @param name - Plugin name to unregister
 * @returns True if unregistered, false if not found
 * 
 * @example
 * ```ts
 * unregisterPlugin('my-plugin');
 * ```
 */
export async function unregisterPlugin(name: string): Promise<boolean> {
  return withLock(() => {
    const state = pluginRegistry.get(name);
    
    if (!state) {
      console.warn(`[PluginManager] Plugin "${name}" not found`);
      return false;
    }
    
    // Unregister from core system
    coreUnregisterPlugin(state.plugin.name);
    
    // Remove from registry
    pluginRegistry.delete(name);
    
    console.log(`❌ [PluginManager] Plugin "${name}" unregistered`);
    return true;
  });
}

/**
 * Get a plugin by name
 * 
 * @param name - Plugin name
 * @returns Plugin instance or undefined if not found
 * 
 * @example
 * ```ts
 * const plugin = getPlugin('my-plugin');
 * if (plugin) {
 *   console.log('Found plugin:', plugin.name);
 * }
 * ```
 */
export function getPlugin(name: string): Plugin | undefined {
  return pluginRegistry.get(name)?.plugin;
}

/**
 * Check if a plugin is enabled
 * 
 * @param name - Plugin name
 * @returns True if enabled, false otherwise
 * 
 * @example
 * ```ts
 * if (isPluginEnabled('logger')) {
 *   console.log('Logger is active');
 * }
 * ```
 */
export function isPluginEnabled(name: string): boolean {
  return pluginRegistry.get(name)?.enabled ?? false;
}

/**
 * Get all registered plugins with their state
 * 
 * @returns Array of plugin information
 * 
 * @example
 * ```ts
 * const plugins = getAllPlugins();
 * plugins.forEach(p => {
 *   console.log(`${p.name}: ${p.enabled ? 'enabled' : 'disabled'}`);
 * });
 * ```
 */
export function getAllPlugins(): Array<{
  name: string;
  plugin: Plugin;
  enabled: boolean;
  registeredAt: number;
  enabledAt: number | null;
  disabledAt: number | null;
  metadata: {
    enableCount: number;
    disableCount: number;
    errorCount: number;
  };
}> {
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

/**
 * Get plugin statistics
 * 
 * @returns Statistics about all plugins
 * 
 * @example
 * ```ts
 * const stats = getPluginStats();
 * console.log(`Total: ${stats.total}, Enabled: ${stats.enabled}`);
 * ```
 */
export function getPluginStats(): {
  total: number;
  enabled: number;
  disabled: number;
  totalErrors: number;
} {
  let enabled = 0;
  let disabled = 0;
  let totalErrors = 0;
  
  for (const state of pluginRegistry.values()) {
    if (state.enabled) enabled++;
    else disabled++;
    totalErrors += state.metadata.errorCount;
  }
  
  return {
    total: pluginRegistry.size,
    enabled,
    disabled,
    totalErrors,
  };
}

/**
 * Clear all registered plugins
 * 
 * Removes all plugins from the registry and core plugin system.
 * Use with caution - this cannot be undone.
 * 
 * @example
 * ```ts
 * clearAllPlugins();
 * ```
 */
export async function clearAllPlugins(): Promise<void> {
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

/**
 * Print plugin status to console
 * 
 * @example
 * ```ts
 * printPluginStatus();
 * ```
 */
export function printPluginStatus(): void {
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

// ============================================================================
// Sample Plugins
// ============================================================================

/**
 * LoggerPlugin - Logs every signal update with timestamps and values
 * 
 * Features:
 * - Logs signal creation, updates, and destruction
 * - Includes timestamps for all operations
 * - Configurable verbosity
 * - Color-coded console output
 * 
 * @example
 * ```ts
 * const logger = new LoggerPlugin({ verbose: true });
 * await registerPlugin('logger', logger.getPlugin());
 * ```
 */
export class LoggerPlugin {
  private verbose: boolean;
  private logCreates: boolean;
  private logUpdates: boolean;
  private logDestroys: boolean;
  private startTime: number;
  
  constructor(options: {
    verbose?: boolean;
    logCreates?: boolean;
    logUpdates?: boolean;
    logDestroys?: boolean;
  } = {}) {
    this.verbose = options.verbose ?? false;
    this.logCreates = options.logCreates ?? true;
    this.logUpdates = options.logUpdates ?? true;
    this.logDestroys = options.logDestroys ?? true;
    this.startTime = Date.now();
  }
  
  /**
   * Get elapsed time since plugin creation
   */
  private getElapsedTime(): string {
    const elapsed = Date.now() - this.startTime;
    return `+${elapsed}ms`;
  }
  
  /**
   * Format timestamp
   */
  private formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toISOString();
  }
  
  /**
   * Get the plugin implementation
   */
  getPlugin(): Plugin {
    return {
      name: 'logger',
      version: '2.0.0',
      
      onRegister: () => {
        console.log(`📝 [Logger] Plugin activated at ${this.formatTimestamp(Date.now())}`);
        this.startTime = Date.now();
      },
      
      onSignalCreate: (metadata: SignalMetadata, initialValue: any) => {
        if (!this.logCreates) return;
        
        const label = metadata.label || metadata.id;
        console.log(
          `🆕 [Logger] ${this.getElapsedTime()} Created ${metadata.type} "${label}"`,
          this.verbose 
            ? { initialValue, metadata, timestamp: this.formatTimestamp(metadata.createdAt) }
            : `= ${JSON.stringify(initialValue)}`
        );
      },
      
      onSignalUpdate: (context: PluginContext) => {
        if (!this.logUpdates) return;
        
        const label = context.signal.label || context.signal.id;
        const source = context.source ? `[${context.source}]` : '';
        
        console.log(
          `🔄 [Logger] ${this.getElapsedTime()} Updated ${context.signal.type} "${label}" ${source}`,
          this.verbose
            ? { context, timestamp: this.formatTimestamp(context.timestamp) }
            : `${JSON.stringify(context.oldValue)} → ${JSON.stringify(context.newValue)}`
        );
      },
      
      onSignalDestroy: (metadata: SignalMetadata) => {
        if (!this.logDestroys) return;
        
        const label = metadata.label || metadata.id;
        console.log(
          `🗑️  [Logger] ${this.getElapsedTime()} Destroyed ${metadata.type} "${label}"`
        );
      },
      
      onUnregister: () => {
        console.log(`📝 [Logger] Plugin deactivated after ${this.getElapsedTime()}`);
      },
    };
  }
}

/**
 * TimeTravelPlugin - Records signal history and enables time-travel debugging
 * 
 * Features:
 * - Records all signal updates with full context
 * - Supports undo/redo operations
 * - Configurable history size
 * - Snapshot functionality for state restoration
 * - History query and filtering
 * 
 * @example
 * ```ts
 * const timeTravel = new TimeTravelPlugin({ maxHistory: 100 });
 * await registerPlugin('time-travel', timeTravel.getPlugin());
 * 
 * // Later...
 * timeTravel.undo();
 * timeTravel.redo();
 * console.log(timeTravel.getHistory());
 * ```
 */
export class TimeTravelPlugin {
  private maxHistory: number;
  private history: Array<PluginContext<any>> = [];
  private future: Array<PluginContext<any>> = [];
  private snapshots: Map<string, Array<PluginContext<any>>> = new Map();
  
  constructor(options: { maxHistory?: number } = {}) {
    this.maxHistory = options.maxHistory ?? 50;
  }
  
  /**
   * Get the plugin implementation
   */
  getPlugin(): Plugin {
    return {
      name: 'time-travel',
      version: '2.0.0',
      
      onRegister: () => {
        console.log(`⏱️  [TimeTravel] Plugin activated (max history: ${this.maxHistory})`);
      },
      
      onSignalUpdate: (context: PluginContext) => {
        // Record the update
        this.history.push({ ...context });
        
        // Clear future when new update happens
        this.future = [];
        
        // Limit history size
        if (this.history.length > this.maxHistory) {
          this.history.shift();
        }
      },
      
      onUnregister: () => {
        console.log(
          `⏱️  [TimeTravel] Plugin deactivated (recorded ${this.history.length} updates)`
        );
        this.clear();
      },
    };
  }
  
  /**
   * Undo the last signal update
   * 
   * Note: This only records the undo - actual signal restoration
   * would require keeping signal references.
   */
  undo(): boolean {
    if (this.history.length === 0) {
      console.warn('[TimeTravel] Nothing to undo');
      return false;
    }
    
    const entry = this.history.pop()!;
    this.future.push(entry);
    
    const label = entry.signal.label || entry.signal.id;
    console.log(
      `⏪ [TimeTravel] Undo: ${label} ${JSON.stringify(entry.newValue)} → ${JSON.stringify(entry.oldValue)}`
    );
    
    return true;
  }
  
  /**
   * Redo the last undone update
   */
  redo(): boolean {
    if (this.future.length === 0) {
      console.warn('[TimeTravel] Nothing to redo');
      return false;
    }
    
    const entry = this.future.pop()!;
    this.history.push(entry);
    
    const label = entry.signal.label || entry.signal.id;
    console.log(
      `⏩ [TimeTravel] Redo: ${label} ${JSON.stringify(entry.oldValue)} → ${JSON.stringify(entry.newValue)}`
    );
    
    return true;
  }
  
  /**
   * Get the full history of updates
   */
  getHistory(): ReadonlyArray<Readonly<PluginContext<any>>> {
    return this.history.map(entry => ({ ...entry }));
  }
  
  /**
   * Get updates for a specific signal
   */
  getHistoryForSignal(signalId: string): ReadonlyArray<Readonly<PluginContext<any>>> {
    return this.history
      .filter(entry => entry.signal.id === signalId)
      .map(entry => ({ ...entry }));
  }
  
  /**
   * Create a named snapshot of current history
   */
  createSnapshot(name: string): void {
    this.snapshots.set(name, [...this.history]);
    console.log(`📸 [TimeTravel] Snapshot "${name}" created with ${this.history.length} entries`);
  }
  
  /**
   * Restore history from a named snapshot
   */
  restoreSnapshot(name: string): boolean {
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
  
  /**
   * List all snapshots
   */
  listSnapshots(): string[] {
    return Array.from(this.snapshots.keys());
  }
  
  /**
   * Clear history and future
   */
  clear(): void {
    this.history = [];
    this.future = [];
    console.log('🧹 [TimeTravel] History cleared');
  }
  
  /**
   * Get statistics
   */
  getStats(): {
    historySize: number;
    futureSize: number;
    snapshotCount: number;
    maxHistory: number;
  } {
    return {
      historySize: this.history.length,
      futureSize: this.future.length,
      snapshotCount: this.snapshots.size,
      maxHistory: this.maxHistory,
    };
  }
  
  /**
   * Print history to console
   */
  printHistory(limit: number = 10): void {
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
        console.log(
          `  ${index + 1}. [${timestamp}] ${label}: ${JSON.stringify(entry.oldValue)} → ${JSON.stringify(entry.newValue)}`
        );
      });
    }
    
    console.log('='.repeat(60) + '\n');
  }
}

// ============================================================================
// DevTools Integration
// ============================================================================

/**
 * Get plugin information for DevTools
 * 
 * @internal
 * @returns Plugin information formatted for DevTools
 */
export function __getPluginInfoForDevTools(): Array<{
  name: string;
  version?: string;
  enabled: boolean;
  registeredAt: string;
  stats: {
    enableCount: number;
    disableCount: number;
    errorCount: number;
  };
}> {
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

// ============================================================================
// Exports
// ============================================================================

export type {
  Plugin,
  SignalMetadata,
  PluginContext,
} from './plugins';
