import type { Plugin, SignalMetadata } from '../core/plugins';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'off';
export type LogType = 'create' | 'update' | 'destroy';
export interface LogEntry {
    id: string;
    timestamp: number;
    type: LogType;
    level: LogLevel;
    signalId: string;
    signalLabel?: string;
    metadata?: SignalMetadata;
    oldValue?: any;
    newValue?: any;
    message?: string;
    stack?: string;
}
export interface LoggerOptions {
    level?: LogLevel;
    maxLogs?: number;
    enableConsole?: boolean;
    filter?: (log: LogEntry) => boolean;
    signalPattern?: RegExp;
    signalIds?: string[];
    includeStackTrace?: boolean;
    verbose?: boolean;
    formatter?: (log: LogEntry) => string;
}
export interface LogStats {
    total: number;
    byType: Record<LogType, number>;
    byLevel: Record<LogLevel, number>;
    bySignal: Record<string, number>;
    oldestTimestamp?: number;
    newestTimestamp?: number;
}
export declare class LoggerPlugin {
    private options;
    private logs;
    private logCounter;
    private signalRegistry;
    constructor(options?: LoggerOptions);
    getPlugin(): Plugin;
    private createLogEntry;
    private addLog;
    private shouldLog;
    private isLevelEnabled;
    private logInternal;
    private logToConsole;
    private defaultFormatter;
    private getLogIcon;
    private formatValue;
    getLogs(): LogEntry[];
    getLogsFiltered(filter: {
        type?: LogType;
        level?: LogLevel;
        signalId?: string;
        signalPattern?: RegExp;
        startTime?: number;
        endTime?: number;
    }): LogEntry[];
    getLogById(id: string): LogEntry | undefined;
    getLogsForSignal(signalId: string): LogEntry[];
    getStats(): LogStats;
    getSignalIds(): string[];
    getSignalLabels(): string[];
    setOptions(options: Partial<LoggerOptions>): void;
    setLevel(level: LogLevel): void;
    setSignalPattern(pattern: RegExp): void;
    setSignalIds(ids: string[]): void;
    setConsoleEnabled(enabled: boolean): void;
    setVerbose(verbose: boolean): void;
    clear(): void;
    exportLogs(): string;
    importLogs(json: string): void;
    search(query: string): LogEntry[];
}
export declare function createLogger(options?: LoggerOptions): LoggerPlugin;
export declare function createMinimalLogger(): LoggerPlugin;
export declare function createDebugLogger(): LoggerPlugin;
export declare function createFilteredLogger(signalPattern: RegExp, options?: LoggerOptions): LoggerPlugin;
//# sourceMappingURL=logger.d.ts.map