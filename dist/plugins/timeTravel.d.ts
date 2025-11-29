import type { Plugin } from '../core/plugins.js';
export interface TimeTravelSnapshot {
    id: number;
    timestamp: number;
    signalId: string;
    signalLabel?: string;
    signalType: 'signal' | 'computed' | 'effect';
    oldValue: any;
    newValue: any;
    isFull: boolean;
    diff?: ValueDiff;
    index: number;
}
export interface ValueDiff {
    type: 'primitive' | 'object' | 'array';
    added?: Record<string, any> | any[];
    removed?: string[] | number[];
    changed?: Record<string, {
        old: any;
        new: any;
    }>;
    oldValue?: any;
    newValue?: any;
}
export interface TimelineState {
    total: number;
    current: number;
    canUndo: boolean;
    canRedo: boolean;
    snapshots: Array<{
        id: number;
        timestamp: number;
        signalId: string;
        signalLabel?: string;
        preview: string;
    }>;
}
export interface TimeTravelConfig {
    maxHistory?: number;
    fullSnapshotInterval?: number;
    enableCompression?: boolean;
    verbose?: boolean;
}
export interface TimeTravelSession {
    timestamp: number;
    version: string;
    snapshots: TimeTravelSnapshot[];
    currentIndex: number;
}
export declare class TimeTravelPlugin {
    private config;
    private snapshots;
    private currentIndex;
    private snapshotIdCounter;
    private signalValues;
    private signalRefs;
    private enabled;
    private isRestoring;
    constructor(config?: TimeTravelConfig);
    getPlugin(): Plugin;
    undo(): boolean;
    redo(): boolean;
    jumpTo(index: number): boolean;
    canUndo(): boolean;
    canRedo(): boolean;
    getCurrentIndex(): number;
    getSnapshotCount(): number;
    getTimelineState(): TimelineState;
    getSnapshots(): ReadonlyArray<Readonly<TimeTravelSnapshot>>;
    getSnapshotsForSignal(signalId: string): ReadonlyArray<Readonly<TimeTravelSnapshot>>;
    getSnapshotAt(index: number): Readonly<TimeTravelSnapshot> | undefined;
    getCurrentSnapshot(): Readonly<TimeTravelSnapshot> | undefined;
    exportSession(): TimeTravelSession;
    importSession(session: TimeTravelSession): void;
    clear(): void;
    setEnabled(enabled: boolean): void;
    isEnabled(): boolean;
    private recordSnapshot;
    private restoreState;
    private computeDiff;
    private computeArrayDiff;
    private isPrimitive;
    private isEqual;
    private formatValue;
    private log;
}
export declare function calculateMemoryUsage(snapshots: TimeTravelSnapshot[]): number;
export declare function formatMemorySize(bytes: number): string;
export declare function createTimeTravelPlugin(config?: TimeTravelConfig): TimeTravelPlugin;
//# sourceMappingURL=timeTravel.d.ts.map