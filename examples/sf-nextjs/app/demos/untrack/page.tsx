'use client';

import { useSignal } from 'signalforge-alpha/react';
import { untrack } from 'signalforge-alpha/core';
import { useState } from 'react';
import DemoLayout from '../../components/DemoLayout';

export default function UntrackDemo() {
  const [count, setCount] = useSignal(0);
  const [dependency, setDependency] = useSignal(0);
  const [trackedResult, setTrackedResult] = useState(0);
  const [untrackedResult, setUntrackedResult] = useState(0);

  const computeTracked = () => {
    // This will re-compute whenever count OR dependency changes
    const result = count + dependency;
    setTrackedResult(result);
  };

  const computeUntracked = () => {
    // This will only re-compute when count changes
    // dependency is read inside untrack(), so it's not tracked
    const result = count + untrack(() => dependency);
    setUntrackedResult(result);
  };

  return (
    <DemoLayout
      title="Untrack"
      description="Read signal values without creating dependencies"
    >
      <div className="space-y-6">
        {/* Signal Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-blue-50 dark:bg-blue-900 rounded-lg text-center">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {count}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">Count Signal</div>
            <div className="flex gap-2">
              <button
                onClick={() => setCount(count - 1)}
                className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                -
              </button>
              <button
                onClick={() => setCount(count + 1)}
                className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="p-6 bg-green-50 dark:bg-green-900 rounded-lg text-center">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
              {dependency}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">Dependency Signal</div>
            <div className="flex gap-2">
              <button
                onClick={() => setDependency(dependency - 1)}
                className="flex-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                -
              </button>
              <button
                onClick={() => setDependency(dependency + 1)}
                className="flex-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Compute Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={computeTracked}
            className="p-6 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <div className="text-xl font-bold mb-2">Compute Tracked</div>
            <div className="text-sm opacity-90">Depends on both signals</div>
          </button>
          <button
            onClick={computeUntracked}
            className="p-6 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <div className="text-xl font-bold mb-2">Compute Untracked</div>
            <div className="text-sm opacity-90">Only depends on Count</div>
          </button>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <div className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              {trackedResult}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Tracked Result
              <br />
              <span className="text-xs">(count + dependency)</span>
            </div>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <div className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              {untrackedResult}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Untracked Result
              <br />
              <span className="text-xs">(count + untrack(dependency))</span>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 Try this:
          </h3>
          <ol className="list-decimal list-inside text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>Click "Compute Tracked" and "Compute Untracked"</li>
            <li>Increment the Count signal - both results update</li>
            <li>Increment the Dependency signal - only Tracked updates!</li>
            <li>The Untracked result doesn't re-compute because dependency was read inside untrack()</li>
          </ol>
        </div>

        {/* Code Example */}
        <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
          <pre className="text-green-400 text-sm">
{`import { createSignal, createComputed, untrack } from 'signalforge-alpha/core';

const count = createSignal(0);
const dependency = createSignal(0);

// ❌ Both signals are tracked
const tracked = createComputed(() => {
  return count.get() + dependency.get();
});

// ✅ Only count is tracked, dependency is untracked
const untracked = createComputed(() => {
  return count.get() + untrack(() => dependency.get());
});`}
          </pre>
        </div>
      </div>
    </DemoLayout>
  );
}
