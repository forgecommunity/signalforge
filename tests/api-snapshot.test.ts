const expectedExports: Record<string, string[]> = {
  'dist/index.mjs': [
    'batch',
    'createComputed',
    'createEffect',
    'createSignal',
    'createStore',
    'defineStore',
    'flushSync',
    'shallowEqual',
    'untrack',
    'useComputed',
    'useSignal',
    'useSignalEffect',
    'useSignalValue',
    'useStore',
    'useStoreSelector',
  ],
  'dist/entries/core.mjs': [
    'batch',
    'createComputed',
    'createEffect',
    'createSignal',
    'createStore',
    'defineStore',
    'flushSync',
    'shallowEqual',
    'untrack',
  ],
  'dist/entries/react.mjs': [
    'batch',
    'createComputed',
    'createEffect',
    'createSignal',
    'createStore',
    'defineStore',
    'flushSync',
    'shallowEqual',
    'untrack',
    'useComputed',
    'useSignal',
    'useSignalEffect',
    'useSignalValue',
    'useStore',
    'useStoreSelector',
    'withSignalValue',
    'withSignals',
  ],
  'dist/entries/devtools.mjs': [
    'DevToolsPanel',
    'DevToolsProvider',
    'batch',
    'clearPerformanceMetrics',
    'createComputed',
    'createEffect',
    'createSignal',
    'createStore',
    'defineStore',
    'disableDevTools',
    'disableProfiler',
    'enableDevTools',
    'enableProfiler',
    'exportSnapshot',
    'flushSync',
    'getActivePlugins',
    'getBatchStats',
    'getDependencies',
    'getDependencyGraph',
    'getPerformanceMetrics',
    'getPerformanceSummary',
    'getProfilerData',
    'getSignal',
    'getSignalLatencyStats',
    'getSubscribers',
    'isDevToolsEnabled',
    'listSignals',
    'onProfilerEvent',
    'printDependencyGraph',
    'shallowEqual',
    'untrack',
  ],
  'dist/entries/plugins.mjs': [
    'arePluginsEnabled',
    'batch',
    'clearPlugins',
    'createComputed',
    'createEffect',
    'createLoggerPlugin',
    'createPerformancePlugin',
    'createPersistentSignal',
    'createSignal',
    'createStore',
    'createTimeTravelPlugin',
    'createValidationPlugin',
    'defineStore',
    'disablePlugins',
    'enablePlugins',
    'flushSync',
    'getRegisteredPlugins',
    'persist',
    'registerPlugin',
    'shallowEqual',
    'unregisterPlugin',
    'untrack',
  ],
  'dist/entries/utils.mjs': [
    'batch',
    'combine',
    'createArraySignal',
    'createComputed',
    'createEffect',
    'createPersistentSignal',
    'createRecordSignal',
    'createResource',
    'createSignal',
    'createStorageAdapter',
    'createStore',
    'debounce',
    'defineStore',
    'derive',
    'detectEnvironment',
    'filter',
    'flushSync',
    'getStorageAdapter',
    'map',
    'memo',
    'monitor',
    'persist',
    'resetStorageAdapter',
    'safeParse',
    'safeStringify',
    'shallowEqual',
    'throttle',
    'untrack',
  ],
};

function assertEqualArray(actual: string[], expected: string[], label: string): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${label} export snapshot changed.\nExpected: ${expectedJson}\nActual:   ${actualJson}`);
  }
}

console.log('\n=== Public API Snapshot Tests ===');

async function run(): Promise<void> {
  for (const [modulePath, expected] of Object.entries(expectedExports)) {
    const mod = await import(`../${modulePath}`);
    const actual = Object.keys(mod).sort();
    assertEqualArray(actual, expected, modulePath);
    console.log(`✓ ${modulePath}`);
  }

  console.log('All public API snapshots match');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
