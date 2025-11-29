/**
 * Universal Storage Adapter for SignalForge
 * 
 * Provides a unified storage interface that works across environments:
 * - React Native: Uses AsyncStorage
 * - Web: Uses localStorage
 * - Node.js: Uses in-memory storage with warnings
 * 
 * Features:
 * - Automatic environment detection
 * - Safe JSON serialization with circular reference handling
 * - Error fallbacks with development warnings
 * - TypeScript support with full type safety
 * - Async/await API for consistency across platforms
 * 
 * @example
 * ```typescript
 * const adapter = getStorageAdapter();
 * 
 * // Save data
 * await adapter.save('user', { name: 'John', age: 30 });
 * 
 * // Load data
 * const user = await adapter.load('user');
 * 
 * // Clear data
 * await adapter.clear('user');
 * ```
 */

import { Signal, createSignal, createEffect } from '../core/store';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Storage adapter interface - consistent API across all platforms
 */
export interface StorageAdapter {
  /**
   * Load data from storage
   * @param key - Storage key
   * @returns Promise resolving to parsed data or null if not found
   */
  load<T = any>(key: string): Promise<T | null>;

  /**
   * Save data to storage
   * @param key - Storage key
   * @param value - Data to save (will be JSON serialized)
   * @returns Promise resolving when save completes
   */
  save<T = any>(key: string, value: T): Promise<void>;

  /**
   * Remove data from storage
   * @param key - Storage key
   * @returns Promise resolving when removal completes
   */
  clear(key: string): Promise<void>;

  /**
   * Check if storage is available
   * @returns Whether storage operations will succeed
   */
  isAvailable(): boolean;

  /**
   * Get all keys in storage
   * @returns Promise resolving to array of all storage keys
   */
  getAllKeys?(): Promise<string[]>;

  /**
   * Clear all data from storage
   * @returns Promise resolving when all data is cleared
   */
  clearAll?(): Promise<void>;
}

/**
 * Environment type detection
 */
export type Environment = 'react-native' | 'web' | 'node' | 'unknown';

/**
 * Options for storage adapter
 */
export interface StorageOptions {
  /** Prefix for all storage keys */
  prefix?: string;
  /** Enable development mode warnings */
  devMode?: boolean;
  /** Custom serializer (default: JSON.stringify with circular ref handling) */
  serialize?: (value: any) => string;
  /** Custom deserializer (default: JSON.parse) */
  deserialize?: (value: string) => any;
}

// ============================================================================
// Environment Detection
// ============================================================================

/**
 * Detect the current environment
 * FIXED: Improved SSR-safe and React Native detection
 */
export function detectEnvironment(): Environment {
  // SSR-safe check: ensure we're not on the server
  if (typeof window === 'undefined') {
    return 'node';
  }

  // Enhanced React Native detection
  if (typeof global !== 'undefined') {
    const g: any = global;
    // Check for Hermes engine or React Native bridge
    if (
      g.HermesInternal ||
      g.__fbBatchedBridgeConfig ||
      g.nativeModuleProxy
    ) {
      return 'react-native';
    }
  }

  // Check for React Native via navigator
  if (
    typeof navigator !== 'undefined' &&
    navigator.product === 'ReactNative'
  ) {
    return 'react-native';
  }

  // Check for web browser with localStorage
  if (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof window.localStorage !== 'undefined'
  ) {
    return 'web';
  }

  return 'node';
}

// ============================================================================
// Circular Reference Safe Serialization
// ============================================================================

/**
 * Safely serialize data with circular reference detection.
 * Falls back to simple JSON.stringify if circular refs are detected.
 */
export function safeStringify(value: any, devMode = false): string {
  const seen = new WeakSet();

  try {
    return JSON.stringify(value, (key, val) => {
      // Handle special types
      if (val === undefined) {
        return '__undefined__';
      }
      if (val === null) {
        return null;
      }
      if (typeof val === 'function') {
        if (devMode) {
          console.warn(
            `[StorageAdapter] Cannot serialize function at key "${key}". Skipping.`
          );
        }
        return '__function__';
      }
      if (val instanceof Date) {
        return { __type__: 'Date', value: val.toISOString() };
      }
      if (val instanceof RegExp) {
        return { __type__: 'RegExp', value: val.toString() };
      }

      // Circular reference detection
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) {
          if (devMode) {
            console.warn(
              `[StorageAdapter] Circular reference detected at key "${key}". Replacing with null.`
            );
          }
          return '__circular__';
        }
        seen.add(val);
      }

      return val;
    });
  } catch (error) {
    if (devMode) {
      console.error('[StorageAdapter] Serialization error:', error);
    }
    // Fallback: try without circular ref handling
    try {
      return JSON.stringify(value);
    } catch {
      // Last resort: return empty object
      return '{}';
    }
  }
}

/**
 * Safely deserialize data with special type handling
 */
export function safeParse(json: string, devMode = false): any {
  try {
    return JSON.parse(json, (key, val) => {
      // Handle special markers
      if (val === '__undefined__') {
        return undefined;
      }
      if (val === '__function__') {
        return undefined; // Functions can't be restored
      }
      if (val === '__circular__') {
        return null; // Circular refs become null
      }

      // Restore special types
      if (val && typeof val === 'object') {
        if (val.__type__ === 'Date') {
          return new Date(val.value);
        }
        if (val.__type__ === 'RegExp') {
          const match = val.value.match(/^\/(.+)\/([gimuy]*)$/);
          if (match) {
            return new RegExp(match[1], match[2]);
          }
        }
      }

      return val;
    });
  } catch (error) {
    if (devMode) {
      console.error('[StorageAdapter] Deserialization error:', error);
    }
    return null;
  }
}

// ============================================================================
// Web Storage Adapter (localStorage)
// ============================================================================

/**
 * Storage adapter for web browsers using localStorage
 */
class WebStorageAdapter implements StorageAdapter {
  private prefix: string;
  private devMode: boolean;
  private serialize: (value: any) => string;
  private deserialize: (value: string) => any;

  constructor(options: StorageOptions = {}) {
    this.prefix = options.prefix || 'signalforge_';
    this.devMode = options.devMode ?? isDev;
    this.serialize = options.serialize || ((v) => safeStringify(v, this.devMode));
    this.deserialize = options.deserialize || ((v) => safeParse(v, this.devMode));
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async load<T = any>(key: string): Promise<T | null> {
    try {
      const data = localStorage.getItem(this.getKey(key));
      if (data === null) {
        return null;
      }
      return this.deserialize(data) as T;
    } catch (error) {
      if (this.devMode) {
        console.error(`[StorageAdapter] Failed to load "${key}":`, error);
      }
      return null;
    }
  }

  async save<T = any>(key: string, value: T): Promise<void> {
    try {
      const serialized = this.serialize(value);
      localStorage.setItem(this.getKey(key), serialized);
    } catch (error) {
      if (this.devMode) {
        console.error(`[StorageAdapter] Failed to save "${key}":`, error);
      }
      throw error;
    }
  }

  async clear(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      if (this.devMode) {
        console.error(`[StorageAdapter] Failed to clear "${key}":`, error);
      }
      throw error;
    }
  }

  isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.slice(this.prefix.length));
        }
      }
      return keys;
    } catch (error) {
      if (this.devMode) {
        console.error('[StorageAdapter] Failed to get all keys:', error);
      }
      return [];
    }
  }

  async clearAll(): Promise<void> {
    try {
      const keys = await this.getAllKeys();
      for (const key of keys) {
        await this.clear(key);
      }
    } catch (error) {
      if (this.devMode) {
        console.error('[StorageAdapter] Failed to clear all:', error);
      }
      throw error;
    }
  }
}

// ============================================================================
// React Native Storage Adapter (AsyncStorage)
// ============================================================================

/**
 * Storage adapter for React Native using AsyncStorage
 */
class ReactNativeStorageAdapter implements StorageAdapter {
  private prefix: string;
  private devMode: boolean;
  private serialize: (value: any) => string;
  private deserialize: (value: string) => any;
  private AsyncStorage: any;

  constructor(options: StorageOptions = {}) {
    this.prefix = options.prefix || 'signalforge_';
    this.devMode = options.devMode ?? isDev;
    this.serialize = options.serialize || ((v) => safeStringify(v, this.devMode));
    this.deserialize = options.deserialize || ((v) => safeParse(v, this.devMode));

    // Try to import AsyncStorage
    try {
      // Try @react-native-async-storage/async-storage first (recommended)
      this.AsyncStorage = require('@react-native-async-storage/async-storage').default;
    } catch {
      try {
        // Fallback to legacy react-native AsyncStorage
        this.AsyncStorage = require('react-native').AsyncStorage;
      } catch (error) {
        if (this.devMode) {
          console.error(
            '[StorageAdapter] AsyncStorage not found. ' +
            'Install @react-native-async-storage/async-storage'
          );
        }
        this.AsyncStorage = null;
      }
    }
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async load<T = any>(key: string): Promise<T | null> {
    if (!this.AsyncStorage) {
      if (this.devMode) {
        console.warn('[StorageAdapter] AsyncStorage not available');
      }
      return null;
    }

    try {
      const data = await this.AsyncStorage.getItem(this.getKey(key));
      if (data === null) {
        return null;
      }
      return this.deserialize(data) as T;
    } catch (error) {
      if (this.devMode) {
        console.error(`[StorageAdapter] Failed to load "${key}":`, error);
      }
      return null;
    }
  }

  async save<T = any>(key: string, value: T): Promise<void> {
    if (!this.AsyncStorage) {
      if (this.devMode) {
        console.warn('[StorageAdapter] AsyncStorage not available');
      }
      return;
    }

    try {
      const serialized = this.serialize(value);
      await this.AsyncStorage.setItem(this.getKey(key), serialized);
    } catch (error) {
      if (this.devMode) {
        console.error(`[StorageAdapter] Failed to save "${key}":`, error);
      }
      throw error;
    }
  }

  async clear(key: string): Promise<void> {
    if (!this.AsyncStorage) {
      if (this.devMode) {
        console.warn('[StorageAdapter] AsyncStorage not available');
      }
      return;
    }

    try {
      await this.AsyncStorage.removeItem(this.getKey(key));
    } catch (error) {
      if (this.devMode) {
        console.error(`[StorageAdapter] Failed to clear "${key}":`, error);
      }
      throw error;
    }
  }

  isAvailable(): boolean {
    return this.AsyncStorage !== null;
  }

  async getAllKeys(): Promise<string[]> {
    if (!this.AsyncStorage) {
      return [];
    }

    try {
      const allKeys = await this.AsyncStorage.getAllKeys();
      return allKeys
        .filter((key: string) => key.startsWith(this.prefix))
        .map((key: string) => key.slice(this.prefix.length));
    } catch (error) {
      if (this.devMode) {
        console.error('[StorageAdapter] Failed to get all keys:', error);
      }
      return [];
    }
  }

  async clearAll(): Promise<void> {
    if (!this.AsyncStorage) {
      return;
    }

    try {
      const keys = await this.getAllKeys();
      const prefixedKeys = keys.map(k => this.getKey(k));
      await this.AsyncStorage.multiRemove(prefixedKeys);
    } catch (error) {
      if (this.devMode) {
        console.error('[StorageAdapter] Failed to clear all:', error);
      }
      throw error;
    }
  }
}

// ============================================================================
// Memory Storage Adapter (Fallback for Node.js)
// ============================================================================

/**
 * In-memory storage adapter for Node.js or when no storage is available
 */
class MemoryStorageAdapter implements StorageAdapter {
  private storage = new Map<string, any>();
  private prefix: string;
  private devMode: boolean;

  constructor(options: StorageOptions = {}) {
    this.prefix = options.prefix || 'signalforge_';
    this.devMode = options.devMode ?? isDev;

    if (this.devMode) {
      console.warn(
        '[StorageAdapter] Using in-memory storage. Data will not persist across restarts.'
      );
    }
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async load<T = any>(key: string): Promise<T | null> {
    const data = this.storage.get(this.getKey(key));
    return data !== undefined ? data : null;
  }

  async save<T = any>(key: string, value: T): Promise<void> {
    // Deep clone to avoid reference issues
    const cloned = JSON.parse(JSON.stringify(value));
    this.storage.set(this.getKey(key), cloned);
  }

  async clear(key: string): Promise<void> {
    this.storage.delete(this.getKey(key));
  }

  isAvailable(): boolean {
    return true; // Memory storage is always available
  }

  async getAllKeys(): Promise<string[]> {
    const keys: string[] = [];
    for (const key of this.storage.keys()) {
      if (key.startsWith(this.prefix)) {
        keys.push(key.slice(this.prefix.length));
      }
    }
    return keys;
  }

  async clearAll(): Promise<void> {
    const keys = await this.getAllKeys();
    for (const key of keys) {
      this.storage.delete(this.getKey(key));
    }
  }
}

// ============================================================================
// Factory & Global Instance
// ============================================================================

let globalAdapter: StorageAdapter | null = null;

/**
 * Get the appropriate storage adapter for the current environment.
 * Creates a singleton instance on first call.
 * 
 * @param options - Storage options (only used on first call)
 * @returns Storage adapter instance
 */
export function getStorageAdapter(options: StorageOptions = {}): StorageAdapter {
  if (globalAdapter) {
    return globalAdapter;
  }

  const env = detectEnvironment();

  switch (env) {
    case 'web':
      globalAdapter = new WebStorageAdapter(options);
      break;
    case 'react-native':
      globalAdapter = new ReactNativeStorageAdapter(options);
      break;
    case 'node':
    case 'unknown':
    default:
      globalAdapter = new MemoryStorageAdapter(options);
      break;
  }

  return globalAdapter;
}

/**
 * Reset the global adapter (useful for testing)
 */
export function resetStorageAdapter(): void {
  globalAdapter = null;
}

/**
 * Create a custom storage adapter instance (doesn't use global)
 * 
 * @param env - Target environment
 * @param options - Storage options
 * @returns Storage adapter instance
 */
export function createStorageAdapter(
  env: Environment = detectEnvironment(),
  options: StorageOptions = {}
): StorageAdapter {
  switch (env) {
    case 'web':
      return new WebStorageAdapter(options);
    case 'react-native':
      return new ReactNativeStorageAdapter(options);
    case 'node':
    case 'unknown':
    default:
      return new MemoryStorageAdapter(options);
  }
}

// ============================================================================
// Signal Persistence Utility
// ============================================================================

/**
 * Options for signal persistence
 */
export interface PersistOptions<T> {
  /** Storage key (defaults to generated key) */
  key?: string;
  /** Storage adapter (defaults to global adapter) */
  adapter?: StorageAdapter;
  /** Debounce save operations (ms) */
  debounce?: number;
  /** Custom serializer */
  serialize?: (value: T) => any;
  /** Custom deserializer */
  deserialize?: (value: any) => T;
  /** Callback when persistence fails */
  onError?: (error: Error) => void;
}

/**
 * Make a signal persistent across sessions.
 * Automatically loads initial value from storage and saves on changes.
 * 
 * @param signal - Signal to persist
 * @param options - Persistence options
 * @returns Cleanup function to stop persistence
 * 
 * @example
 * ```typescript
 * const theme = createSignal('light');
 * const cleanup = persist(theme, { key: 'app_theme' });
 * 
 * // Theme is automatically loaded from storage on start
 * // and saved whenever it changes
 * 
 * // Stop persistence
 * cleanup();
 * ```
 */
export function persist<T>(
  signal: Signal<T>,
  options: PersistOptions<T> = {}
): () => void {
  const adapter = options.adapter || getStorageAdapter();
  const key = options.key || `signal_${Math.random().toString(36).slice(2)}`;
  const serialize = options.serialize || ((v: T) => v);
  const deserialize = options.deserialize || ((v: any) => v as T);

  // Load initial value from storage
  adapter
    .load<T>(key)
    .then((stored) => {
      if (stored !== null) {
        try {
          const deserialized = deserialize(stored);
          signal.set(deserialized);
        } catch (error) {
          if (options.onError) {
            options.onError(error as Error);
          }
        }
      }
    })
    .catch((error) => {
      if (options.onError) {
        options.onError(error);
      }
    });

  // Save on changes
  let saveTimer: NodeJS.Timeout | number | undefined;
  const cleanup = createEffect(() => {
    const value = signal.get();

    const doSave = () => {
      try {
        const serialized = serialize(value);
        adapter.save(key, serialized).catch((error) => {
          if (options.onError) {
            options.onError(error);
          }
        });
      } catch (error) {
        if (options.onError) {
          options.onError(error as Error);
        }
      }
    };

    if (options.debounce) {
      if (saveTimer !== undefined) {
        clearTimeout(saveTimer as any);
      }
      saveTimer = setTimeout(doSave, options.debounce);
    } else {
      doSave();
    }
  });

  // Return cleanup function
  return () => {
    cleanup();
    if (saveTimer !== undefined) {
      clearTimeout(saveTimer as any);
    }
  };
}

/**
 * Create a persistent signal that automatically loads/saves to storage.
 * 
 * @param key - Storage key
 * @param initialValue - Default value if nothing in storage
 * @param options - Additional persistence options
 * @returns Persistent signal
 * 
 * @example
 * ```typescript
 * const theme = createPersistentSignal('app_theme', 'light');
 * 
 * theme.set('dark'); // Automatically saved to storage
 * ```
 */
export function createPersistentSignal<T>(
  key: string,
  initialValue: T,
  options: Omit<PersistOptions<T>, 'key'> = {}
): Signal<T> {
  const signal = createSignal(initialValue);
  persist(signal, { ...options, key });
  return signal;
}

// ============================================================================
// Development Helpers
// ============================================================================

// Check if __DEV__ is defined, use it or fallback to NODE_ENV
const isDev = typeof (globalThis as any).__DEV__ !== 'undefined' 
  ? (globalThis as any).__DEV__ 
  : process.env.NODE_ENV !== 'production';
