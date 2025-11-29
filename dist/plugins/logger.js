import { validateMaxLogs, } from '../core/constants';
export class LoggerPlugin {
    constructor(options = {}) {
        this.logs = [];
        this.logCounter = 0;
        this.signalRegistry = new Map();
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
    getPlugin() {
        return {
            name: 'logger',
            version: '2.0.0',
            onRegister: () => {
                this.logInternal('info', 'Logger plugin registered', 'create');
            },
            onSignalCreate: (metadata, initialValue) => {
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
            onSignalUpdate: (context) => {
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
            onSignalDestroy: (metadata) => {
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
    createLogEntry(partial) {
        const entry = {
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
        if (this.options.includeStackTrace) {
            entry.stack = new Error().stack?.split('\n').slice(3).join('\n');
        }
        return entry;
    }
    addLog(log) {
        if (!this.shouldLog(log)) {
            return;
        }
        this.logs.push(log);
        if (this.logs.length > this.options.maxLogs) {
            this.logs.shift();
        }
        if (this.options.enableConsole) {
            this.logToConsole(log);
        }
    }
    shouldLog(log) {
        if (!this.isLevelEnabled(log.level)) {
            return false;
        }
        if (this.options.signalIds.length > 0) {
            if (!this.options.signalIds.includes(log.signalId)) {
                return false;
            }
        }
        const label = log.signalLabel || log.signalId;
        if (!this.options.signalPattern.test(label)) {
            return false;
        }
        if (!this.options.filter(log)) {
            return false;
        }
        return true;
    }
    isLevelEnabled(level) {
        const levels = ['debug', 'info', 'warn', 'error', 'off'];
        const currentIndex = levels.indexOf(this.options.level);
        const logIndex = levels.indexOf(level);
        return logIndex >= currentIndex;
    }
    logInternal(level, message, type) {
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
    logToConsole(log) {
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
        if (this.options.verbose && log.type === 'update') {
            console.log('  Old:', log.oldValue);
            console.log('  New:', log.newValue);
        }
    }
    defaultFormatter(log) {
        const time = new Date(log.timestamp).toISOString();
        const label = log.signalLabel || log.signalId;
        const icon = this.getLogIcon(log.type);
        let message = `[${time}] ${icon} ${label}`;
        if (log.type === 'update') {
            const oldStr = this.formatValue(log.oldValue);
            const newStr = this.formatValue(log.newValue);
            message += ` | ${oldStr} → ${newStr}`;
        }
        else if (log.type === 'create') {
            const valueStr = this.formatValue(log.newValue);
            message += ` = ${valueStr}`;
        }
        if (log.message && log.type === 'destroy') {
            message += ` | ${log.message}`;
        }
        return message;
    }
    getLogIcon(type) {
        switch (type) {
            case 'create': return '🟢';
            case 'update': return '🔵';
            case 'destroy': return '🔴';
            default: return '⚪';
        }
    }
    formatValue(value) {
        if (value === undefined)
            return 'undefined';
        if (value === null)
            return 'null';
        if (typeof value === 'object') {
            try {
                const json = JSON.stringify(value);
                return json.length > 50 ? json.substring(0, 47) + '...' : json;
            }
            catch {
                return '[Object]';
            }
        }
        return String(value);
    }
    getLogs() {
        return [...this.logs];
    }
    getLogsFiltered(filter) {
        return this.logs.filter(log => {
            if (filter.type && log.type !== filter.type)
                return false;
            if (filter.level && log.level !== filter.level)
                return false;
            if (filter.signalId && log.signalId !== filter.signalId)
                return false;
            if (filter.signalPattern) {
                const label = log.signalLabel || log.signalId;
                if (!filter.signalPattern.test(label))
                    return false;
            }
            if (filter.startTime && log.timestamp < filter.startTime)
                return false;
            if (filter.endTime && log.timestamp > filter.endTime)
                return false;
            return true;
        });
    }
    getLogById(id) {
        return this.logs.find(log => log.id === id);
    }
    getLogsForSignal(signalId) {
        return this.logs.filter(log => log.signalId === signalId);
    }
    getStats() {
        const stats = {
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
    getSignalIds() {
        const ids = new Set();
        this.logs.forEach(log => ids.add(log.signalId));
        return Array.from(ids);
    }
    getSignalLabels() {
        const labels = new Set();
        this.logs.forEach(log => {
            if (log.signalLabel) {
                labels.add(log.signalLabel);
            }
        });
        return Array.from(labels);
    }
    setOptions(options) {
        Object.assign(this.options, options);
    }
    setLevel(level) {
        this.options.level = level;
    }
    setSignalPattern(pattern) {
        this.options.signalPattern = pattern;
    }
    setSignalIds(ids) {
        this.options.signalIds = ids;
    }
    setConsoleEnabled(enabled) {
        this.options.enableConsole = enabled;
    }
    setVerbose(verbose) {
        this.options.verbose = verbose;
    }
    clear() {
        this.logs = [];
        this.logCounter = 0;
    }
    exportLogs() {
        return JSON.stringify({
            timestamp: Date.now(),
            options: this.options,
            logs: this.logs,
            stats: this.getStats(),
        }, null, 2);
    }
    importLogs(json) {
        try {
            const data = JSON.parse(json);
            if (data.logs && Array.isArray(data.logs)) {
                this.logs = data.logs;
                this.logCounter = this.logs.length;
            }
        }
        catch (error) {
            console.error('Failed to import logs:', error);
        }
    }
    search(query) {
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
export function createLogger(options) {
    return new LoggerPlugin(options);
}
export function createMinimalLogger() {
    return new LoggerPlugin({
        level: 'warn',
        enableConsole: true,
        maxLogs: 100,
    });
}
export function createDebugLogger() {
    return new LoggerPlugin({
        level: 'debug',
        enableConsole: true,
        verbose: true,
        includeStackTrace: true,
        maxLogs: 5000,
    });
}
export function createFilteredLogger(signalPattern, options) {
    return new LoggerPlugin({
        ...options,
        signalPattern,
    });
}
