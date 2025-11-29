import { Signal } from '../core/store';
export interface StorageAdapter {
    load<T = any>(key: string): Promise<T | null>;
    save<T = any>(key: string, value: T): Promise<void>;
    clear(key: string): Promise<void>;
    isAvailable(): boolean;
    getAllKeys?(): Promise<string[]>;
    clearAll?(): Promise<void>;
}
export type Environment = 'react-native' | 'web' | 'node' | 'unknown';
export interface StorageOptions {
    prefix?: string;
    devMode?: boolean;
    serialize?: (value: any) => string;
    deserialize?: (value: string) => any;
}
export declare function detectEnvironment(): Environment;
export declare function safeStringify(value: any, devMode?: boolean): string;
export declare function safeParse(json: string, devMode?: boolean): any;
export declare function getStorageAdapter(options?: StorageOptions): StorageAdapter;
export declare function resetStorageAdapter(): void;
export declare function createStorageAdapter(env?: Environment, options?: StorageOptions): StorageAdapter;
export interface PersistOptions<T> {
    key?: string;
    adapter?: StorageAdapter;
    debounce?: number;
    serialize?: (value: T) => any;
    deserialize?: (value: any) => T;
    onError?: (error: Error) => void;
}
export declare function persist<T>(signal: Signal<T>, options?: PersistOptions<T>): () => void;
export declare function createPersistentSignal<T>(key: string, initialValue: T, options?: Omit<PersistOptions<T>, 'key'>): Signal<T>;
//# sourceMappingURL=storageAdapter.d.ts.map