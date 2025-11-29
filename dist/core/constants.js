export const DEFAULT_BATCH_DEPTH = 0;
export const MAX_BATCH_DEPTH = 1000;
export const TIME_TRAVEL_MAX_HISTORY = 100;
export const TIME_TRAVEL_FULL_SNAPSHOT_INTERVAL = 10;
export const LOGGER_MAX_LOGS = 1000;
export const LOGGER_MIN_LOGS = 100;
export const LOGGER_MAX_LOGS_LIMIT = 10000;
export const DEFAULT_STRING_TRUNCATE_LENGTH = 100;
export const SHORT_STRING_TRUNCATE_LENGTH = 50;
export const VERY_SHORT_STRING_TRUNCATE_LENGTH = 30;
export const PROFILER_SAMPLE_RATE = 1.0;
export const PROFILER_MAX_SAMPLES = 1000;
export const PROFILER_SLOW_OPERATION_THRESHOLD = 16;
export const PROFILER_STATS_INTERVAL = 5000;
export const STORAGE_DEBOUNCE_TIME = 300;
export const STORAGE_MAX_RETRIES = 3;
export const STORAGE_RETRY_DELAY = 1000;
export const DEVTOOLS_DEFAULT_PORT = 8098;
export const DEVTOOLS_MAX_QUEUE_SIZE = 1000;
export const DEVTOOLS_RECONNECT_DELAY = 2000;
export const BENCHMARK_DEFAULT_ITERATIONS = 10000;
export const BENCHMARK_WARMUP_ITERATIONS = 100;
export const BENCHMARK_RUNS = 5;
export const BENCHMARK_LOG_INTERVAL = 100;
export const DEFAULT_SIGNAL_LABEL = 'signal';
export const MAX_DEPENDENCY_DEPTH = 100;
export const MAX_SUBSCRIBERS_WARNING = 1000;
export const ERROR_PREFIX = '[SignalForge]';
export const ERRORS = {
    BATCH_MISMATCH: 'endBatch called without matching startBatch',
    MAX_BATCH_DEPTH: `Maximum batch depth (${MAX_BATCH_DEPTH}) exceeded`,
    MAX_DEPENDENCY_DEPTH: `Maximum dependency depth (${MAX_DEPENDENCY_DEPTH}) exceeded - possible circular dependency`,
    INVALID_SIGNAL: 'Invalid signal provided',
    PLUGIN_NOT_FOUND: 'Plugin not found',
    PLUGIN_ALREADY_REGISTERED: 'Plugin with this name is already registered',
    STORAGE_NOT_AVAILABLE: 'Storage backend not available',
    DEVTOOLS_CONNECTION_FAILED: 'Failed to connect to DevTools',
};
export const WARNING_PREFIX = '[SignalForge Warning]';
export const WARNINGS = {
    TOO_MANY_SUBSCRIBERS: `Signal has more than ${MAX_SUBSCRIBERS_WARNING} subscribers - this may impact performance`,
    SLOW_OPERATION: `Operation took longer than ${PROFILER_SLOW_OPERATION_THRESHOLD}ms`,
    STORAGE_QUOTA_EXCEEDED: 'Storage quota exceeded - some data may not be persisted',
    ASYNC_STORAGE_NOT_AVAILABLE: 'AsyncStorage not available - using memory storage',
};
export const VERSION = '2.0.0';
export const PLUGIN_API_VERSION = '3.0.0';
export const MIN_REACT_VERSION = '16.8.0';
export const MIN_REACT_NATIVE_VERSION = '0.60.0';
export function isValidRange(value, min, max) {
    return value >= min && value <= max;
}
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
export function validateMaxHistory(value) {
    if (value === undefined)
        return TIME_TRAVEL_MAX_HISTORY;
    return clamp(value, 10, 10000);
}
export function validateMaxLogs(value) {
    if (value === undefined)
        return LOGGER_MAX_LOGS;
    return clamp(value, LOGGER_MIN_LOGS, LOGGER_MAX_LOGS_LIMIT);
}
export function truncateString(str, maxLength = DEFAULT_STRING_TRUNCATE_LENGTH) {
    if (str.length <= maxLength)
        return str;
    return str.substring(0, maxLength - 3) + '...';
}
export function formatError(message) {
    return `${ERROR_PREFIX} ${message}`;
}
export function formatWarning(message) {
    return `${WARNING_PREFIX} ${message}`;
}
