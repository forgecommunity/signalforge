/**
 * SignalForge Core Constants
 * 
 * Centralized configuration values for the entire library.
 * All magic numbers and hardcoded values should be defined here.
 */

// ============================================================================
// Performance & Batching
// ============================================================================

/**
 * Default batch depth for nested batch operations
 */
export const DEFAULT_BATCH_DEPTH = 0;

/**
 * Maximum safe batch depth to prevent stack overflow
 */
export const MAX_BATCH_DEPTH = 1000;

// ============================================================================
// Plugin Defaults
// ============================================================================

/**
 * Default maximum history entries for Time Travel plugin
 */
export const TIME_TRAVEL_MAX_HISTORY = 100;

/**
 * Default interval for full snapshots in Time Travel (every Nth update)
 */
export const TIME_TRAVEL_FULL_SNAPSHOT_INTERVAL = 10;

/**
 * Default maximum logs to keep in Logger plugin
 */
export const LOGGER_MAX_LOGS = 1000;

/**
 * Minimum max logs allowed in Logger plugin
 */
export const LOGGER_MIN_LOGS = 100;

/**
 * Maximum max logs allowed in Logger plugin
 */
export const LOGGER_MAX_LOGS_LIMIT = 10000;

// ============================================================================
// String Truncation
// ============================================================================

/**
 * Default maximum string length before truncation
 */
export const DEFAULT_STRING_TRUNCATE_LENGTH = 100;

/**
 * Short string truncation length (for previews)
 */
export const SHORT_STRING_TRUNCATE_LENGTH = 50;

/**
 * Very short string truncation (for labels)
 */
export const VERY_SHORT_STRING_TRUNCATE_LENGTH = 30;

// ============================================================================
// Performance Profiling
// ============================================================================

/**
 * Default sample rate for performance profiling (0-1)
 */
export const PROFILER_SAMPLE_RATE = 1.0;

/**
 * Maximum performance samples to keep in memory
 */
export const PROFILER_MAX_SAMPLES = 1000;

/**
 * Threshold for slow operation warning (milliseconds)
 */
export const PROFILER_SLOW_OPERATION_THRESHOLD = 16;

/**
 * Interval for printing performance statistics (milliseconds)
 */
export const PROFILER_STATS_INTERVAL = 5000;

// ============================================================================
// Storage & Persistence
// ============================================================================

/**
 * Default debounce time for storage operations (milliseconds)
 */
export const STORAGE_DEBOUNCE_TIME = 300;

/**
 * Maximum retry attempts for storage operations
 */
export const STORAGE_MAX_RETRIES = 3;

/**
 * Delay between storage retry attempts (milliseconds)
 */
export const STORAGE_RETRY_DELAY = 1000;

// ============================================================================
// DevTools
// ============================================================================

/**
 * Default port for DevTools server
 */
export const DEVTOOLS_DEFAULT_PORT = 8098;

/**
 * Maximum event queue size for DevTools
 */
export const DEVTOOLS_MAX_QUEUE_SIZE = 1000;

/**
 * Reconnection delay for DevTools (milliseconds)
 */
export const DEVTOOLS_RECONNECT_DELAY = 2000;

// ============================================================================
// Benchmarking
// ============================================================================

/**
 * Default number of iterations for benchmarks
 */
export const BENCHMARK_DEFAULT_ITERATIONS = 10000;

/**
 * Warmup iterations before actual benchmark
 */
export const BENCHMARK_WARMUP_ITERATIONS = 100;

/**
 * Number of benchmark runs to average
 */
export const BENCHMARK_RUNS = 5;

/**
 * Log progress every N operations in benchmarks
 */
export const BENCHMARK_LOG_INTERVAL = 100;

// ============================================================================
// Signal Defaults
// ============================================================================

/**
 * Default signal label when none provided
 */
export const DEFAULT_SIGNAL_LABEL = 'signal';

/**
 * Maximum signal dependency depth (prevent infinite loops)
 */
export const MAX_DEPENDENCY_DEPTH = 100;

/**
 * Maximum number of subscribers per signal before warning
 */
export const MAX_SUBSCRIBERS_WARNING = 1000;

// ============================================================================
// Error Messages
// ============================================================================

/**
 * Error message prefix for SignalForge errors
 */
export const ERROR_PREFIX = '[SignalForge]';

/**
 * Error messages
 */
export const ERRORS = {
  BATCH_MISMATCH: 'endBatch called without matching startBatch',
  MAX_BATCH_DEPTH: `Maximum batch depth (${MAX_BATCH_DEPTH}) exceeded`,
  MAX_DEPENDENCY_DEPTH: `Maximum dependency depth (${MAX_DEPENDENCY_DEPTH}) exceeded - possible circular dependency`,
  INVALID_SIGNAL: 'Invalid signal provided',
  PLUGIN_NOT_FOUND: 'Plugin not found',
  PLUGIN_ALREADY_REGISTERED: 'Plugin with this name is already registered',
  STORAGE_NOT_AVAILABLE: 'Storage backend not available',
  DEVTOOLS_CONNECTION_FAILED: 'Failed to connect to DevTools',
} as const;

// ============================================================================
// Warning Messages
// ============================================================================

/**
 * Warning message prefix
 */
export const WARNING_PREFIX = '[SignalForge Warning]';

/**
 * Warning messages
 */
export const WARNINGS = {
  TOO_MANY_SUBSCRIBERS: `Signal has more than ${MAX_SUBSCRIBERS_WARNING} subscribers - this may impact performance`,
  SLOW_OPERATION: `Operation took longer than ${PROFILER_SLOW_OPERATION_THRESHOLD}ms`,
  STORAGE_QUOTA_EXCEEDED: 'Storage quota exceeded - some data may not be persisted',
  ASYNC_STORAGE_NOT_AVAILABLE: 'AsyncStorage not available - using memory storage',
} as const;

// ============================================================================
// Version & Metadata
// ============================================================================

/**
 * Library version
 */
export const VERSION = '2.0.0';

/**
 * Plugin API version
 */
export const PLUGIN_API_VERSION = '3.0.0';

/**
 * Minimum supported React version
 */
export const MIN_REACT_VERSION = '16.8.0';

/**
 * Minimum supported React Native version
 */
export const MIN_REACT_NATIVE_VERSION = '0.60.0';

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a value is within valid range
 */
export function isValidRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Validate and clamp max history value
 */
export function validateMaxHistory(value: number | undefined): number {
  if (value === undefined) return TIME_TRAVEL_MAX_HISTORY;
  return clamp(value, 10, 10000);
}

/**
 * Validate and clamp max logs value
 */
export function validateMaxLogs(value: number | undefined): number {
  if (value === undefined) return LOGGER_MAX_LOGS;
  return clamp(value, LOGGER_MIN_LOGS, LOGGER_MAX_LOGS_LIMIT);
}

/**
 * Truncate string to specified length
 */
export function truncateString(
  str: string,
  maxLength: number = DEFAULT_STRING_TRUNCATE_LENGTH
): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Format error message with prefix
 */
export function formatError(message: string): string {
  return `${ERROR_PREFIX} ${message}`;
}

/**
 * Format warning message with prefix
 */
export function formatWarning(message: string): string {
  return `${WARNING_PREFIX} ${message}`;
}
