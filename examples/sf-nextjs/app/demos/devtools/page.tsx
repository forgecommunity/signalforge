'use client';

import { useSignal } from 'signalforge/react';
import DemoLayout from '../../components/DemoLayout';

export default function DevToolsDemo() {
  const [counter1, setCounter1] = useSignal(0);
  const [counter2, setCounter2] = useSignal(10);
  const [counter3, setCounter3] = useSignal(100);

  return (
    <DemoLayout
      title="DevTools Integration"
      description="Inspect and debug signals with DevTools (Coming Soon)"
    >
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl">
          <h2 className="text-2xl font-bold mb-2">🛠️ DevTools Coming Soon!</h2>
          <p className="mb-4">
            SignalForge DevTools will provide powerful debugging capabilities:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Visualize signal dependency graphs</li>
            <li>Track signal value changes over time</li>
            <li>Performance profiling for computations</li>
            <li>Time-travel debugging</li>
            <li>React component re-render tracking</li>
          </ul>
        </div>

        {/* Demo Signals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Counter 1
            </h3>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 text-center mb-4">
              {counter1}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCounter1(counter1 - 1)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                -
              </button>
              <button
                onClick={() => setCounter1(counter1 + 1)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Counter 2
            </h3>
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 text-center mb-4">
              {counter2}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCounter2(counter2 - 5)}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                -5
              </button>
              <button
                onClick={() => setCounter2(counter2 + 5)}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                +5
              </button>
            </div>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Counter 3
            </h3>
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 text-center mb-4">
              {counter3}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCounter3(counter3 - 10)}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                -10
              </button>
              <button
                onClick={() => setCounter3(counter3 + 10)}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                +10
              </button>
            </div>
          </div>
        </div>

        {/* Feature Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white dark:bg-gray-700 rounded-xl border-2 border-blue-200 dark:border-blue-800">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Signal Graph Visualization
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              See how signals and computed values connect. Understand data flow at a glance with interactive dependency graphs.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-700 rounded-xl border-2 border-green-200 dark:border-green-800">
            <div className="text-4xl mb-3">⏱️</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Performance Profiler
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Track computation times, identify bottlenecks, and optimize your reactive code with detailed profiling data.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-700 rounded-xl border-2 border-purple-200 dark:border-purple-800">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Signal Inspector
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Inspect any signal's current value, history, and subscribers. Debug complex state interactions easily.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-700 rounded-xl border-2 border-orange-200 dark:border-orange-800">
            <div className="text-4xl mb-3">⏮️</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Time Travel Debugging
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Step back through signal changes, replay state transitions, and debug issues with full history playback.
            </p>
          </div>
        </div>

        {/* Usage Preview */}
        <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
          <pre className="text-green-400 text-sm">
{`import { enableDevTools } from 'signalforge/devtools';

// Enable DevTools (development only)
if (process.env.NODE_ENV === 'development') {
  enableDevTools();
}

// Your signals will now be tracked and visible in DevTools
const count = createSignal(0);
const doubled = createComputed(() => count.get() * 2);

// Open Chrome DevTools → SignalForge panel`}
          </pre>
        </div>

        {/* Current Status */}
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            🚧 Development Status
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            DevTools are currently in active development. You can track progress and contribute on GitHub:
          </p>
          <a
            href="https://github.com/forgecommunity/signalforge"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            View on GitHub →
          </a>
        </div>
      </div>
    </DemoLayout>
  );
}
