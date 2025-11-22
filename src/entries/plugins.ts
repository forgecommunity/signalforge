/**
 * SignalForge Plugins Entry Point
 * Optional plugins and utilities
 */

export * from './core';

export {
  registerPlugin,
  enablePlugin,
  disablePlugin,
  getPlugin,
  isPluginEnabled,
  type Plugin,
  LoggerPlugin,
  TimeTravelPlugin,
} from '../core/pluginManager';

export {
  TimeTravelPlugin as TimeTravelPluginEnhanced,
  createTimeTravelPlugin,
  type TimeTravelConfig,
  type TimeTravelSnapshot,
} from '../plugins/timeTravel';

export {
  LoggerPlugin as LoggerPluginEnhanced,
  createLogger,
  createMinimalLogger,
  type LogLevel,
  type LoggerOptions,
} from '../plugins/logger';

export {
  persist,
  createPersistentSignal,
  type StorageAdapter,
  type PersistOptions,
} from '../utils/storageAdapter';
