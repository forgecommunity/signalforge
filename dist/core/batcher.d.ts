type BatchCallback = () => void;
export declare function startBatch(): void;
export declare function endBatch(): void;
export declare function queueBatchCallback(callback: BatchCallback, signalId?: string): void;
export declare function flushBatches(): void;
export declare function batch<T>(fn: () => T): T;
export declare function getBatchDepth(): number;
export declare function getPendingCount(): number;
export declare function isBatching(): boolean;
export {};
//# sourceMappingURL=batcher.d.ts.map