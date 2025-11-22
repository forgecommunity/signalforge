/**
 * SignalForge - Fine-grained reactive state management
 * 
 * A lightweight, framework-agnostic reactive system with automatic
 * dependency tracking, computed signals, and efficient batched updates.
 * 
 * @example
 * ```ts
 * import { createSignal, createComputed } from 'signalforge';
 * 
 * const count = createSignal(0);
 * const doubled = createComputed(() => count.get() * 2);
 * 
 * count.set(5);
 * console.log(doubled.get()); // 10
 * ```
 */

// Core reactive primitives
export {
  createSignal,
  createComputed,
  createEffect,
  batch,
  untrack,
  flushSync,
  type Signal,
  type ComputedSignal,
} from './core/store';

// Batching system (internal utilities)
export {
  startBatch,
  endBatch,
  flushBatches,
  queueBatchCallback,
  getBatchDepth,
  getPendingCount,
  isBatching,
} from './core/batcher';

// Plugin system (middleware layer)
export {
  registerPlugin,
  unregisterPlugin,
  getRegisteredPlugins,
  clearPlugins,
  enablePlugins,
  disablePlugins,
  arePluginsEnabled,
  createLoggerPlugin,
  createTimeTravelPlugin,
  createPerformancePlugin,
  createValidationPlugin,
  type Plugin,
  type SignalMetadata as PluginSignalMetadata,
  type PluginContext,
  type HistoryEntry,
  type PerformanceMetrics,
} from './core/plugins';

// Plugin Manager (official plugin ecosystem manager)
export {
  registerPlugin as registerManagedPlugin,
  enablePlugin,
  disablePlugin,
  unregisterPlugin as unregisterManagedPlugin,
  getPlugin,
  isPluginEnabled,
  getAllPlugins,
  getPluginStats,
  clearAllPlugins,
  printPluginStatus,
  LoggerPlugin,
  TimeTravelPlugin,
} from './core/pluginManager';

// Note: Use these from pluginManager for dynamic enable/disable support
// or use the core plugins API for simpler plugin registration

// React hooks (optional - requires React)
export {
  useSignal,
  useSignalValue,
  useSignalEffect,
} from './hooks/useSignal';

export {
  useSignalEffect as useSignalEffectV2,
} from './hooks/useSignalEffect';

// Utility functions
export {
  // Combinators
  derive,
  combine,
  map,
  filter,
  memo,
  
  // Async utilities
  createResource,
  debounce,
  throttle,
  type ResourceState,
  
  // Collection utilities
  createArraySignal,
  createRecordSignal,
  
  // Performance monitoring
  monitor,
  
  // Storage & Persistence
  getStorageAdapter,
  resetStorageAdapter,
  createStorageAdapter,
  detectEnvironment,
  safeStringify,
  safeParse,
  persist,
  createPersistentSignal,
  type StorageAdapter,
  type StorageOptions,
  type PersistOptions,
  type Environment,
  
  // Benchmark utilities
  benchmarkSignalUpdates,
  benchmarkBatchedUpdates,
  compareWithRedux,
  compareWithZustand,
  benchmarkMemoryUsage,
  runBenchmarkSuite,
  logResults,
  getResults,
  clearResults,
  exportResults,
  customBenchmark,
  type BenchmarkResult,
} from './utils/index';

// DevTools (optional - only import in development)
export {
  enableDevTools,
  disableDevTools,
  isDevToolsEnabled,
  registerSignal,
  unregisterSignal,
  trackUpdate,
  trackDependency,
  untrackDependency,
  listSignals,
  getSignal,
  getDependencies,
  getSubscribers,
  getDependencyGraph,
  getSignalsByType,
  getPerformanceMetrics,
  getPerformanceSummary,
  clearPerformanceMetrics,
  createConsoleOverlay,
  exportSnapshot,
  printDependencyGraph,
  __DEVTOOLS__,
  type DevToolsConfig,
  type SignalMetadata,
  type PerformanceMetric,
  type DependencyNode,
} from './devtools/inspector';

// DevTools Graph Visualizer (React component)
export {
  SignalGraphVisualizer,
  type SignalGraphVisualizerProps,
} from './devtools/SignalGraphVisualizer';

// DevTools Performance Tab (React component)
export {
  PerformanceTab,
  type PerformanceTabProps,
} from './devtools/ui/PerformanceTab';

// Performance Profiler (lightweight latency & batch tracking)
export {
  enableProfiler,
  disableProfiler,
  isProfilerEnabled,
  resetProfiler,
  configureProfiler,
  getProfilerData,
  getSignalLatencyStats,
  getBatchStats,
  getLatencySamples,
  getBatchRecords,
  startLatencyMeasurement,
  endLatencyMeasurement,
  startBatchMeasurement,
  endBatchMeasurement,
  recordBatchOperation,
  type ProfilerData,
  type ProfilerConfig,
  type SignalLatencyStats,
  type BatchStats,
  type LatencySample,
  type BatchTimingRecord,
} from './devtools/performanceProfiler';

// React Native DevTools Bridge (Flipper & WebSocket)
export {
  initializeDevToolsBridge,
  shutdownDevToolsBridge,
  isBridgeConnected,
  getBridgeConfig,
  notifySignalCreated,
  notifySignalUpdated,
  notifyPerformanceMetric,
  type BridgeConfig,
  type BridgeMessage,
  type CommandMessage,
  type ResponseMessage,
  type SnapshotMessage,
  type Transport,
  type TransportType,
  type MessageType,
} from './devtools/nativeBridge';

// Time Travel Plugin Enhanced (Redux DevTools-style debugging with diff storage)
export {
  TimeTravelPlugin as TimeTravelPluginEnhanced,
  createTimeTravelPlugin as createEnhancedTimeTravelPlugin,
  calculateMemoryUsage,
  formatMemorySize,
  type TimeTravelConfig,
  type TimeTravelSnapshot,
  type TimeTravelSession,
  type TimelineState,
  type ValueDiff,
} from './plugins/timeTravel';

// Time Travel Timeline UI
export {
  TimeTravelTimeline,
  type TimeTravelTimelineProps,
} from './devtools/ui/TimeTravelTimeline';

// Logger Plugin Enhanced (lifecycle logging with filtering and DevTools integration)
export {
  LoggerPlugin as LoggerPluginEnhanced,
  createLogger,
  createMinimalLogger,
  createDebugLogger,
  createFilteredLogger,
  type LogLevel,
  type LogType,
  type LogEntry,
  type LoggerOptions,
  type LogStats,
} from './plugins/logger';

// LogViewer UI Component
export {
  LogViewer,
  type LogViewerProps,
} from './devtools/ui/LogViewer';
