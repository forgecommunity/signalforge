/**
 * Logger Plugin for SignalForge
 * 
 * Logs every signal lifecycle event (creation, update, destruction) with:
 * - Timestamps
 * - Signal names and IDs
 * - Old and new values
 * - Filtering by signal name or type
 * - Console output with configurable levels
 * - In-memory storage for DevTools access
 * 
 * Lightweight and non-blocking implementation.
 * 
 * @example
 * ```typescript
 * const logger = new LoggerPlugin({
 *   level: 'info',
 *   filter: (log) => log.signalLabel?.startsWith('user.'),
 *   maxLogs: 1000,
 * });
 * 
 * registerManagedPlugin('logger', logger.getPlugin());
 * ```
 */

import type { Plugin, PluginContext, SignalMetadata } from '../core/plugins';
import {
  LOGGER_MAX_LOGS,
  SHORT_STRING_TRUNCATE_LENGTH,
  validateMaxLogs,
  truncateString,
  PLUGIN_API_VERSION,
} from '../core/constants';

// ============================================================================
// Types
// ============================================================================

/**
 * Log level for filtering output
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'off';

/**
 * Type of log entry
 */
export type LogType = 'create' | 'update' | 'destroy';

/**
 * Single log entry
 */
export interface LogEntry {
  /** Unique log ID */
  id: string;
  
  /** Timestamp in milliseconds */
  timestamp: number;
  
  /** Log type */
  type: LogType;
  
  /** Log level */
  level: LogLevel;
  
  /** Signal ID */
  signalId: string;
  
  /** Signal label (if available) */
  signalLabel?: string;
  
  /** Signal metadata */
  metadata?: SignalMetadata;
  
  /** Old value (for updates) */
  oldValue?: any;
  
  /** New value (for creates and updates) */
  newValue?: any;
  
  /** Optional message */
  message?: string;
  
  /** Stack trace (for debugging) */
  stack?: string;
}

/**
 * Logger configuration options
 */
export interface LoggerOptions {
  /** Log level threshold (default: 'info') */
  level?: LogLevel;
  
  /** Maximum number of logs to keep in memory (default: 1000) */
  maxLogs?: number;
  
  /** Enable console output (default: true) */
  enableConsole?: boolean;
  
  /** Custom filter function */
  filter?: (log: LogEntry) => boolean;
  
  /** Filter by signal name pattern (regex) */
  signalPattern?: RegExp;
  
  /** Filter by specific signal IDs */
  signalIds?: string[];
  
  /** Include stack traces (default: false) */
  includeStackTrace?: boolean;
  
  /** Verbose mode - log all details (default: false) */
  verbose?: boolean;
  
  /** Custom formatter for console output */
  formatter?: (log: LogEntry) => string;
}

/**
 * Log statistics
 */
export interface LogStats {
  total: number;
  byType: Record<LogType, number>;
  byLevel: Record<LogLevel, number>;
  bySignal: Record<string, number>;
  oldestTimestamp?: number;
  newestTimestamp?: number;
}

// ============================================================================
// Logger Plugin
// ============================================================================

export class LoggerPlugin {
  private options: Required<LoggerOptions>;
  private logs: LogEntry[] = [];
  private logCounter = 0;
  private signalRegistry = new Map<string, SignalMetadata>();
  
  constructor(options: LoggerOptions = {}) {
    this.options = {
      level: options.level || 'info',
      maxLogs: validateMaxLogs(options.maxLogs),
      enableConsole: options.enableConsole !== false,
      filter: options.filter || (() => true),
      signalPattern: options.signalPattern || /.*/,
      signalIds: options.signalIds || [],
      includeStackTrace: options.includeStackTrace || false,
      verbose: options.verbose || false,
      formatter: options.formatter || this.defaultFormatter.bind(this),
    };
  }
  
  // --------------------------------------------------------------------------
  // Plugin Interface
  // --------------------------------------------------------------------------
  
  /**
   * Get the plugin instance for registration
   */
  getPlugin(): Plugin {
    return {
      name: 'logger',
      version: '2.0.0',
      
      onRegister: () => {
        this.logInternal('info', 'Logger plugin registered', 'create');
      },
      
      onSignalCreate: (metadata: SignalMetadata, initialValue: any) => {
        this.signalRegistry.set(metadata.id, metadata);
        
        const log = this.createLogEntry({
          type: 'create',
          level: 'info',
          signalId: metadata.id,
          signalLabel: metadata.label,
          metadata,
          newValue: initialValue,
          message: `Signal created: ${metadata.label || metadata.id}`,
        });
        
        this.addLog(log);
      },
      
      onSignalUpdate: (context: PluginContext) => {
        const metadata = this.signalRegistry.get(context.signal.id) || context.signal;
        
        const log = this.createLogEntry({
          type: 'update',
          level: 'debug',
          signalId: context.signal.id,
          signalLabel: metadata.label,
          metadata,
          oldValue: context.oldValue,
          newValue: context.newValue,
          message: `Signal updated: ${metadata.label || context.signal.id}`,
        });
        
        this.addLog(log);
      },
      
      onSignalDestroy: (metadata: SignalMetadata) => {
        const log = this.createLogEntry({
          type: 'destroy',
          level: 'info',
          signalId: metadata.id,
          signalLabel: metadata.label,
          metadata,
          message: `Signal destroyed: ${metadata.label || metadata.id}`,
        });
        
        this.addLog(log);
        this.signalRegistry.delete(metadata.id);
      },
      
      onUnregister: () => {
        this.logInternal('info', 'Logger plugin unregistered', 'destroy');
      },
    };
  }
  
  // --------------------------------------------------------------------------
  // Log Management
  // --------------------------------------------------------------------------
  
  /**
   * Create a log entry
   */
  private createLogEntry(partial: Partial<LogEntry>): LogEntry {
    const entry: LogEntry = {
      id: `log_${++this.logCounter}`,
      timestamp: Date.now(),
      type: partial.type || 'update',
      level: partial.level || 'info',
      signalId: partial.signalId || 'unknown',
      signalLabel: partial.signalLabel,
      metadata: partial.metadata,
      oldValue: partial.oldValue,
      newValue: partial.newValue,
      message: partial.message,
    };
    
    // Add stack trace if enabled
    if (this.options.includeStackTrace) {
      entry.stack = new Error().stack?.split('\n').slice(3).join('\n');
    }
    
    return entry;
  }
  
  /**
   * Add log entry to storage
   */
  private addLog(log: LogEntry): void {
    // Apply filters
    if (!this.shouldLog(log)) {
      return;
    }
    
    // Add to storage
    this.logs.push(log);
    
    // Enforce max logs limit
    if (this.logs.length > this.options.maxLogs) {
      this.logs.shift(); // Remove oldest
    }
    
    // Console output
    if (this.options.enableConsole) {
      this.logToConsole(log);
    }
  }
  
  /**
   * Check if log should be recorded based on filters
   */
  private shouldLog(log: LogEntry): boolean {
    // Level check
    if (!this.isLevelEnabled(log.level)) {
      return false;
    }
    
    // Signal ID filter
    if (this.options.signalIds.length > 0) {
      if (!this.options.signalIds.includes(log.signalId)) {
        return false;
      }
    }
    
    // Signal pattern filter
    const label = log.signalLabel || log.signalId;
    if (!this.options.signalPattern.test(label)) {
      return false;
    }
    
    // Custom filter
    if (!this.options.filter(log)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Check if log level is enabled
   */
  private isLevelEnabled(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'off'];
    const currentIndex = levels.indexOf(this.options.level);
    const logIndex = levels.indexOf(level);
    return logIndex >= currentIndex;
  }
  
  /**
   * Internal logging (for plugin lifecycle)
   */
  private logInternal(level: LogLevel, message: string, type: LogType): void {
    const log = this.createLogEntry({
      type,
      level,
      signalId: '__logger__',
      signalLabel: 'Logger',
      message,
    });
    
    this.logs.push(log);
    
    if (this.options.enableConsole) {
      this.logToConsole(log);
    }
  }
  
  // --------------------------------------------------------------------------
  // Console Output
  // --------------------------------------------------------------------------
  
  /**
   * Output log to console
   */
  private logToConsole(log: LogEntry): void {
    const formatted = this.options.formatter(log);
    
    switch (log.level) {
      case 'debug':
        console.debug(formatted);
        break;
      case 'info':
        console.info(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
    }
    
    // Verbose mode - log full details
    if (this.options.verbose && log.type === 'update') {
      console.log('  Old:', log.oldValue);
      console.log('  New:', log.newValue);
    }
  }
  
  /**
   * Default log formatter
   */
  private defaultFormatter(log: LogEntry): string {
    const time = new Date(log.timestamp).toISOString();
    const label = log.signalLabel || log.signalId;
    const icon = this.getLogIcon(log.type);
    
    let message = `[${time}] ${icon} ${label}`;
    
    if (log.type === 'update') {
      const oldStr = this.formatValue(log.oldValue);
      const newStr = this.formatValue(log.newValue);
      message += ` | ${oldStr} → ${newStr}`;
    } else if (log.type === 'create') {
      const valueStr = this.formatValue(log.newValue);
      message += ` = ${valueStr}`;
    }
    
    if (log.message && log.type === 'destroy') {
      message += ` | ${log.message}`;
    }
    
    return message;
  }
  
  /**
   * Get icon for log type
   */
  private getLogIcon(type: LogType): string {
    switch (type) {
      case 'create': return '🟢';
      case 'update': return '🔵';
      case 'destroy': return '🔴';
      default: return '⚪';
    }
  }
  
  /**
   * Format value for display
   */
  private formatValue(value: any): string {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    
    if (typeof value === 'object') {
      try {
        const json = JSON.stringify(value);
        return json.length > 50 ? json.substring(0, 47) + '...' : json;
      } catch {
        return '[Object]';
      }
    }
    
    return String(value);
  }
  
  // --------------------------------------------------------------------------
  // Query API
  // --------------------------------------------------------------------------
  
  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }
  
  /**
   * Get logs filtered by criteria
   */
  getLogsFiltered(filter: {
    type?: LogType;
    level?: LogLevel;
    signalId?: string;
    signalPattern?: RegExp;
    startTime?: number;
    endTime?: number;
  }): LogEntry[] {
    return this.logs.filter(log => {
      if (filter.type && log.type !== filter.type) return false;
      if (filter.level && log.level !== filter.level) return false;
      if (filter.signalId && log.signalId !== filter.signalId) return false;
      if (filter.signalPattern) {
        const label = log.signalLabel || log.signalId;
        if (!filter.signalPattern.test(label)) return false;
      }
      if (filter.startTime && log.timestamp < filter.startTime) return false;
      if (filter.endTime && log.timestamp > filter.endTime) return false;
      return true;
    });
  }
  
  /**
   * Get log by ID
   */
  getLogById(id: string): LogEntry | undefined {
    return this.logs.find(log => log.id === id);
  }
  
  /**
   * Get logs for a specific signal
   */
  getLogsForSignal(signalId: string): LogEntry[] {
    return this.logs.filter(log => log.signalId === signalId);
  }
  
  /**
   * Get log statistics
   */
  getStats(): LogStats {
    const stats: LogStats = {
      total: this.logs.length,
      byType: { create: 0, update: 0, destroy: 0 },
      byLevel: { debug: 0, info: 0, warn: 0, error: 0, off: 0 },
      bySignal: {},
    };
    
    this.logs.forEach(log => {
      stats.byType[log.type]++;
      stats.byLevel[log.level]++;
      
      const label = log.signalLabel || log.signalId;
      stats.bySignal[label] = (stats.bySignal[label] || 0) + 1;
      
      if (!stats.oldestTimestamp || log.timestamp < stats.oldestTimestamp) {
        stats.oldestTimestamp = log.timestamp;
      }
      if (!stats.newestTimestamp || log.timestamp > stats.newestTimestamp) {
        stats.newestTimestamp = log.timestamp;
      }
    });
    
    return stats;
  }
  
  /**
   * Get unique signal IDs
   */
  getSignalIds(): string[] {
    const ids = new Set<string>();
    this.logs.forEach(log => ids.add(log.signalId));
    return Array.from(ids);
  }
  
  /**
   * Get unique signal labels
   */
  getSignalLabels(): string[] {
    const labels = new Set<string>();
    this.logs.forEach(log => {
      if (log.signalLabel) {
        labels.add(log.signalLabel);
      }
    });
    return Array.from(labels);
  }
  
  // --------------------------------------------------------------------------
  // Configuration
  // --------------------------------------------------------------------------
  
  /**
   * Update logger options
   */
  setOptions(options: Partial<LoggerOptions>): void {
    Object.assign(this.options, options);
  }
  
  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.options.level = level;
  }
  
  /**
   * Set signal filter pattern
   */
  setSignalPattern(pattern: RegExp): void {
    this.options.signalPattern = pattern;
  }
  
  /**
   * Set signal ID filter
   */
  setSignalIds(ids: string[]): void {
    this.options.signalIds = ids;
  }
  
  /**
   * Enable/disable console output
   */
  setConsoleEnabled(enabled: boolean): void {
    this.options.enableConsole = enabled;
  }
  
  /**
   * Enable/disable verbose mode
   */
  setVerbose(verbose: boolean): void {
    this.options.verbose = verbose;
  }
  
  // --------------------------------------------------------------------------
  // Utility
  // --------------------------------------------------------------------------
  
  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = [];
    this.logCounter = 0;
  }
  
  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify({
      timestamp: Date.now(),
      options: this.options,
      logs: this.logs,
      stats: this.getStats(),
    }, null, 2);
  }
  
  /**
   * Import logs from JSON
   */
  importLogs(json: string): void {
    try {
      const data = JSON.parse(json);
      if (data.logs && Array.isArray(data.logs)) {
        this.logs = data.logs;
        this.logCounter = this.logs.length;
      }
    } catch (error) {
      console.error('Failed to import logs:', error);
    }
  }
  
  /**
   * Search logs by text
   */
  search(query: string): LogEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.logs.filter(log => {
      const label = (log.signalLabel || log.signalId).toLowerCase();
      const message = (log.message || '').toLowerCase();
      const oldValue = this.formatValue(log.oldValue).toLowerCase();
      const newValue = this.formatValue(log.newValue).toLowerCase();
      
      return label.includes(lowerQuery) ||
             message.includes(lowerQuery) ||
             oldValue.includes(lowerQuery) ||
             newValue.includes(lowerQuery);
    });
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a logger plugin with default options
 */
export function createLogger(options?: LoggerOptions): LoggerPlugin {
  return new LoggerPlugin(options);
}

/**
 * Create a minimal logger (only errors and warnings)
 */
export function createMinimalLogger(): LoggerPlugin {
  return new LoggerPlugin({
    level: 'warn',
    enableConsole: true,
    maxLogs: 100,
  });
}

/**
 * Create a debug logger (all logs, verbose)
 */
export function createDebugLogger(): LoggerPlugin {
  return new LoggerPlugin({
    level: 'debug',
    enableConsole: true,
    verbose: true,
    includeStackTrace: true,
    maxLogs: 5000,
  });
}

/**
 * Create a filtered logger (only specific signals)
 */
export function createFilteredLogger(
  signalPattern: RegExp,
  options?: LoggerOptions
): LoggerPlugin {
  return new LoggerPlugin({
    ...options,
    signalPattern,
  });
}
