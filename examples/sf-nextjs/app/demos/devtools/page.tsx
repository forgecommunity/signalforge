'use client';

import { useSignal } from 'signalforge/react';
import DemoLayout from '../../components/DemoLayout';

export default function DevToolsDemo() {
  const [counter1, setCounter1] = useSignal(0);
  const [counter2, setCounter2] = useSignal(10);
  const [counter3, setCounter3] = useSignal(100);

  return (
    <DemoLayout
      title="🛠️ DevTools - Signal Inspector & Debugger"
      description="Professional debugging tools for signals - inspect, profile, and visualize your reactive state!"
    >
      <div className="space-y-8">
        {/* What You'll Learn */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-blue-900 dark:text-blue-100">
            📚 What You'll Learn
          </h3>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Enable DevTools with <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">enableDevTools()</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Track all active signals with the Inspector API</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Profile performance and detect bottlenecks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Monitor dependency graphs and event streams</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Integrate with React Native Flipper for mobile debugging</span>
            </li>
          </ul>
        </div>

        {/* Interactive Demo Title */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🎮 Try It: DevTools in Action
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Update the counters below and see how DevTools tracks every change!
          </p>
        </div>

        {/* Info Banner */}
        <div className="p-6 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl shadow-xl">
          <h2 className="text-2xl font-bold mb-2">🛠️ DevTools Are Fully Implemented!</h2>
          <p className="mb-4 text-lg">
            SignalForge includes comprehensive development tools for professional debugging:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm bg-white/10 rounded-lg p-4">
            <li><strong>✅ Signal Inspector</strong> - Track all active signals with unique IDs</li>
            <li><strong>✅ Dependency Graph</strong> - Visualize computed signal relationships</li>
            <li><strong>✅ Performance Profiling</strong> - Monitor update times and detect bottlenecks</li>
            <li><strong>✅ Event Streaming</strong> - Real-time monitoring of all signal events</li>
            <li><strong>✅ React Native Flipper</strong> - Full mobile debugging integration</li>
          </ul>
          <div className="mt-4 p-4 bg-black/30 rounded-lg text-sm">
            <div className="font-bold mb-2 text-yellow-300">📖 Quick Start:</div>
            <code className="block bg-black/40 p-3 rounded font-mono text-xs">
              <span className="text-purple-300">import</span> &#123; enableDevTools &#125; <span className="text-purple-300">from</span> <span className="text-green-300">'signalforge/devtools'</span>;<br/>
              <br/>
              <span className="text-gray-400">// Enable in development only</span><br/>
              <span className="text-purple-300">if</span> (process.env.NODE_ENV === <span className="text-green-300">'development'</span>) &#123;<br/>
              &nbsp;&nbsp;enableDevTools();<br/>
              &#125;
            </code>
          </div>
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

        {/* DevTools API Reference */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
            <span className="text-2xl">📚</span> DevTools API Reference
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <code className="text-sm font-bold text-blue-600 dark:text-blue-400">enableDevTools(config?)</code>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Enable DevTools with optional configuration for performance tracking, console logging, and Flipper integration.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <code className="text-sm font-bold text-blue-600 dark:text-blue-400">listSignals()</code>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Get a list of all active signals with their IDs, values, and dependency information.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <code className="text-sm font-bold text-blue-600 dark:text-blue-400">getSignal(id)</code>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Inspect a specific signal by ID to see its current value, subscribers, and dependencies.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <code className="text-sm font-bold text-blue-600 dark:text-blue-400">getDependencyGraph()</code>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Get the complete dependency graph showing how all signals and computed values are connected.
              </p>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-amber-900 dark:text-amber-100 flex items-center gap-2">
            <span className="text-2xl">💡</span> Best Practices
          </h3>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <div className="flex gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <strong>Development Only</strong>
                <p className="text-sm">Always wrap enableDevTools() in a development check. DevTools are automatically disabled in production.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <strong>Zero Production Overhead</strong>
                <p className="text-sm">When disabled, all DevTools operations become no-ops with no performance impact.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <strong>Performance Monitoring</strong>
                <p className="text-sm">Use the performance profiler to identify slow updates and optimize your reactive code.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🔍</span>
              <div>
                <strong>Debug Complex Dependencies</strong>
                <p className="text-sm">Use getDependencyGraph() to visualize and understand complex signal relationships.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">🎓 While You Wait</h3>
          <p className="mb-4">Explore other debugging and optimization demos:</p>
          <div className="flex flex-wrap gap-3">
            <a href="/demos/subscribe" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
              Subscribe & Monitor →
            </a>
            <a href="/demos/timetravel" className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">
              Time Travel →
            </a>
            <a href="/demos/bigdata" className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition">
              Performance →
            </a>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}
