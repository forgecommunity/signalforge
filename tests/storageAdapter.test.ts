/**
 * Tests for Storage Adapter
 * 
 * Note: These tests demonstrate expected behavior.
 * To run them, install test dependencies:
 * npm install --save-dev @jest/globals
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
  getStorageAdapter,
  createStorageAdapter,
  detectEnvironment,
  safeStringify,
  safeParse,
  persist,
  createPersistentSignal,
  resetStorageAdapter,
} from '../src/utils/storageAdapter';
import { createSignal } from '../src/core/store';

describe('Environment Detection', () => {
  test('detects environment correctly', () => {
    const env = detectEnvironment();
    expect(['web', 'react-native', 'node', 'unknown']).toContain(env);
  });
});

describe('Safe Serialization', () => {
  test('serializes simple values', () => {
    expect(safeParse(safeStringify(42))).toBe(42);
    expect(safeParse(safeStringify('hello'))).toBe('hello');
    expect(safeParse(safeStringify(true))).toBe(true);
    expect(safeParse(safeStringify(null))).toBe(null);
  });

  test('serializes objects', () => {
    const obj = { name: 'John', age: 30 };
    expect(safeParse(safeStringify(obj))).toEqual(obj);
  });

  test('serializes arrays', () => {
    const arr = [1, 2, 3, 'four', { five: 5 }];
    expect(safeParse(safeStringify(arr))).toEqual(arr);
  });

  test('handles undefined', () => {
    const obj = { a: 1, b: undefined, c: 3 };
    const serialized = safeStringify(obj);
    const parsed = safeParse(serialized);
    expect(parsed.b).toBeUndefined();
  });

  test('handles Date objects', () => {
    const date = new Date('2025-01-01');
    const serialized = safeStringify(date);
    const parsed = safeParse(serialized);
    expect(parsed).toBeInstanceOf(Date);
    expect(parsed.getTime()).toBe(date.getTime());
  });

  test('handles RegExp objects', () => {
    const regex = /test/gi;
    const serialized = safeStringify(regex);
    const parsed = safeParse(serialized);
    expect(parsed).toBeInstanceOf(RegExp);
    expect(parsed.source).toBe(regex.source);
    expect(parsed.flags).toBe(regex.flags);
  });

  test('handles circular references', () => {
    const obj: any = { name: 'circular' };
    obj.self = obj;
    
    const serialized = safeStringify(obj);
    const parsed = safeParse(serialized);
    
    expect(parsed.name).toBe('circular');
    expect(parsed.self).toBeNull(); // Circular ref becomes null
  });

  test('handles functions', () => {
    const obj = { fn: () => 'test', value: 42 };
    const serialized = safeStringify(obj);
    const parsed = safeParse(serialized);
    
    expect(parsed.value).toBe(42);
    expect(parsed.fn).toBeUndefined(); // Functions can't be serialized
  });

  test('handles nested objects', () => {
    const nested = {
      level1: {
        level2: {
          level3: {
            value: 'deep'
          }
        }
      }
    };
    
    expect(safeParse(safeStringify(nested))).toEqual(nested);
  });
});

describe('Web Storage Adapter', () => {
  let adapter: ReturnType<typeof createStorageAdapter>;

  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    global.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
      key: (index: number) => Object.keys(store)[index] || null,
      length: Object.keys(store).length,
    } as Storage;

    adapter = createStorageAdapter('web', { prefix: 'test_' });
  });

  test('saves and loads data', async () => {
    await adapter.save('key1', { value: 42 });
    const loaded = await adapter.load('key1');
    expect(loaded).toEqual({ value: 42 });
  });

  test('returns null for non-existent keys', async () => {
    const loaded = await adapter.load('nonexistent');
    expect(loaded).toBeNull();
  });

  test('clears data', async () => {
    await adapter.save('key1', 'value');
    await adapter.clear('key1');
    const loaded = await adapter.load('key1');
    expect(loaded).toBeNull();
  });

  test('gets all keys', async () => {
    await adapter.save('key1', 'value1');
    await adapter.save('key2', 'value2');
    const keys = await adapter.getAllKeys?.();
    expect(keys).toContain('key1');
    expect(keys).toContain('key2');
  });

  test('clears all data', async () => {
    await adapter.save('key1', 'value1');
    await adapter.save('key2', 'value2');
    await adapter.clearAll?.();
    
    const keys = await adapter.getAllKeys?.();
    expect(keys?.length).toBe(0);
  });

  test('checks availability', () => {
    expect(adapter.isAvailable()).toBe(true);
  });

  test('handles complex data types', async () => {
    const data = {
      string: 'hello',
      number: 42,
      boolean: true,
      null: null,
      array: [1, 2, 3],
      nested: { deep: { value: 'test' } },
      date: new Date('2025-01-01'),
    };

    await adapter.save('complex', data);
    const loaded = await adapter.load('complex');
    
    expect(loaded.string).toBe(data.string);
    expect(loaded.number).toBe(data.number);
    expect(loaded.boolean).toBe(data.boolean);
    expect(loaded.array).toEqual(data.array);
    expect(loaded.nested).toEqual(data.nested);
    expect(loaded.date).toBeInstanceOf(Date);
  });
});

describe('Memory Storage Adapter', () => {
  let adapter: ReturnType<typeof createStorageAdapter>;

  beforeEach(() => {
    adapter = createStorageAdapter('node', { prefix: 'test_' });
  });

  test('saves and loads data in memory', async () => {
    await adapter.save('key1', { value: 42 });
    const loaded = await adapter.load('key1');
    expect(loaded).toEqual({ value: 42 });
  });

  test('data is isolated per adapter instance', async () => {
    const adapter1 = createStorageAdapter('node', { prefix: 'a_' });
    const adapter2 = createStorageAdapter('node', { prefix: 'b_' });

    await adapter1.save('key', 'value1');
    await adapter2.save('key', 'value2');

    expect(await adapter1.load('key')).toBe('value1');
    expect(await adapter2.load('key')).toBe('value2');
  });

  test('clears data correctly', async () => {
    await adapter.save('key1', 'value');
    await adapter.clear('key1');
    const loaded = await adapter.load('key1');
    expect(loaded).toBeNull();
  });

  test('is always available', () => {
    expect(adapter.isAvailable()).toBe(true);
  });
});

describe('Global Adapter', () => {
  beforeEach(() => {
    resetStorageAdapter();
  });

  test('creates singleton instance', () => {
    const adapter1 = getStorageAdapter();
    const adapter2 = getStorageAdapter();
    expect(adapter1).toBe(adapter2);
  });

  test('resets global adapter', () => {
    const adapter1 = getStorageAdapter();
    resetStorageAdapter();
    const adapter2 = getStorageAdapter();
    expect(adapter1).not.toBe(adapter2);
  });
});

describe('Signal Persistence', () => {
  let adapter: ReturnType<typeof createStorageAdapter>;

  beforeEach(() => {
    resetStorageAdapter();
    
    // Mock localStorage
    const store: Record<string, string> = {};
    global.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
      key: (index: number) => Object.keys(store)[index] || null,
      length: Object.keys(store).length,
    } as Storage;

    adapter = createStorageAdapter('web', { prefix: 'test_' });
  });

  test('persists signal changes', async () => {
    const signal = createSignal(0);
    const cleanup = persist(signal, { key: 'counter', adapter });

    signal.set(42);
    
    // Wait for async save
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const loaded = await adapter.load('counter');
    expect(loaded).toBe(42);
    
    cleanup();
  });

  test('loads initial value from storage', async () => {
    // Pre-populate storage
    await adapter.save('counter', 99);
    
    const signal = createSignal(0);
    const cleanup = persist(signal, { key: 'counter', adapter });
    
    // Wait for async load
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(signal.get()).toBe(99);
    
    cleanup();
  });

  test('debounces save operations', async () => {
    const signal = createSignal(0);
    const cleanup = persist(signal, { 
      key: 'counter', 
      adapter,
      debounce: 100 
    });

    // Rapid updates
    signal.set(1);
    signal.set(2);
    signal.set(3);
    
    // Should only save once after debounce
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const loaded = await adapter.load('counter');
    expect(loaded).toBe(3);
    
    cleanup();
  });

  test('handles custom serialization', async () => {
    const signal = createSignal({ x: 10, y: 20 });
    
    const cleanup = persist(signal, {
      key: 'point',
      adapter,
      serialize: (value) => `${value.x},${value.y}`,
      deserialize: (value) => {
        const [x, y] = value.split(',').map(Number);
        return { x, y };
      },
    });

    signal.set({ x: 30, y: 40 });
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const raw = await adapter.load('point');
    expect(raw).toBe('30,40');
    
    cleanup();
  });

  test('calls error callback on failures', async () => {
    const errors: Error[] = [];
    
    const signal = createSignal({ circular: null as any });
    signal.get().circular = signal.get(); // Create circular ref
    
    const cleanup = persist(signal, {
      key: 'test',
      adapter,
      onError: (error) => errors.push(error),
    });
    
    // Trigger save with problematic data
    signal.set(signal.get());
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    cleanup();
  });
});

describe('Persistent Signal Creation', () => {
  let adapter: ReturnType<typeof createStorageAdapter>;

  beforeEach(() => {
    resetStorageAdapter();
    
    const store: Record<string, string> = {};
    global.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
      key: (index: number) => Object.keys(store)[index] || null,
      length: Object.keys(store).length,
    } as Storage;

    adapter = createStorageAdapter('web', { prefix: 'test_' });
  });

  test('creates persistent signal', async () => {
    const theme = createPersistentSignal('app_theme', 'light', { adapter });
    
    theme.set('dark');
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const loaded = await adapter.load('app_theme');
    expect(loaded).toBe('dark');
  });

  test('uses default value when storage is empty', async () => {
    const theme = createPersistentSignal('new_key', 'default', { adapter });
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(theme.get()).toBe('default');
  });
});

describe('Storage Options', () => {
  test('uses custom prefix', async () => {
    const store: Record<string, string> = {};
    global.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
      key: (index: number) => Object.keys(store)[index] || null,
      length: Object.keys(store).length,
    } as Storage;

    const adapter = createStorageAdapter('web', { prefix: 'myapp_' });
    
    await adapter.save('key', 'value');
    
    expect(store['myapp_key']).toBe('"value"');
  });

  test('uses custom serializer', async () => {
    const store: Record<string, string> = {};
    global.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
      key: (index: number) => Object.keys(store)[index] || null,
      length: Object.keys(store).length,
    } as Storage;

    const adapter = createStorageAdapter('web', {
      serialize: (value) => `CUSTOM:${JSON.stringify(value)}`,
      deserialize: (value) => JSON.parse(value.replace('CUSTOM:', '')),
    });

    await adapter.save('key', { value: 42 });
    const loaded = await adapter.load('key');
    
    expect(loaded).toEqual({ value: 42 });
    expect(store['signalforge_key']).toContain('CUSTOM:');
  });
});
