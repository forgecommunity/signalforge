'use client';

import { useSignal } from 'signalforge/react';
import { untrack } from 'signalforge/core';
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
      title="🔓 Untrack - Advanced Reactivity Control"
      description="Read signals without creating dependencies. Perfect for optimization and preventing unnecessary updates!"
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
              <span>Use <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">untrack()</code> to read signals without tracking them</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Prevent unnecessary re-computations and re-renders</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>When and why to use untrack for optimization</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Advanced reactivity patterns for performance</span>
            </li>
          </ul>
        </div>

        {/* Interactive Demo Title */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🎮 Try It: See Untrack in Action
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Compute both results, then change each signal to see the difference!
          </p>
        </div>
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

        {/* How It Works */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-750 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-purple-900 dark:text-purple-100">
            🚀 How It Works
          </h3>
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-l-4 border-red-500">
              <div className="font-bold text-red-600 dark:text-red-400 mb-2">❌ Without untrack() - Tracks Everything</div>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded block">
                const result = count + dependency;<br/>
                // Re-computes when EITHER changes
              </code>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Both signals are tracked as dependencies
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-l-4 border-green-500">
              <div className="font-bold text-green-600 dark:text-green-400 mb-2">✅ With untrack() - Selective Tracking</div>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded block">
                const result = count + untrack(() =&gt; dependency);<br/>
                // Only re-computes when count changes!
              </code>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Only count is tracked; dependency is ignored
              </p>
            </div>
          </div>
        </div>

        {/* Complete Code Example */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
            💻 Complete Code Example
          </h3>
          <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
            <pre className="text-green-400 text-sm">
{`import { createSignal, createComputed, untrack } from 'signalforge/core';

const currentUser = createSignal({ id: 1, name: 'Alice' });
const theme = createSignal('dark');

// BAD: Re-computes when theme changes (unnecessary!)
const userDisplayBad = createComputed(() => {
  const user = currentUser.get();
  const themeColor = theme.get(); // Tracked!
  return \`\${user.name} (theme: \${themeColor})\`;
});

// GOOD: Only re-computes when user changes
const userDisplayGood = createComputed(() => {
  const user = currentUser.get();
  const themeColor = untrack(() => theme.get()); // NOT tracked!
  return \`\${user.name} (theme: \${themeColor})\`;
});

// Now changing theme won't trigger userDisplayGood!
theme.set('light'); // userDisplayBad updates ❌
                    // userDisplayGood stays same ✅`}
            </pre>
          </div>
        </div>

        {/* Real World Use Cases */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-green-900 dark:text-green-100">
            🌍 When To Use Untrack
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-blue-600 mb-1">🎨 Reading UI Preferences</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Don't recompute data when theme/locale changes
              </div>
              <code className="text-xs block">
                const display = computed(() =&gt; &#123;<br/>
                &nbsp;&nbsp;const data = mainData.get();<br/>
                &nbsp;&nbsp;const theme = untrack(() =&gt; uiTheme.get());<br/>
                &nbsp;&nbsp;return formatData(data, theme);<br/>
                &#125;);
              </code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-purple-600 mb-1">📊 Expensive Calculations</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Skip tracking signals that change often but don't matter
              </div>
              <code className="text-xs block">
                const stats = computed(() =&gt; &#123;<br/>
                &nbsp;&nbsp;const data = dataset.get();<br/>
                &nbsp;&nbsp;const precision = untrack(() =&gt; decimals.get());<br/>
                &nbsp;&nbsp;return calculateStats(data).toFixed(precision);<br/>
                &#125;);
              </code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-green-600 mb-1">🔐 Auth Checks</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Check permissions without tracking them
              </div>
              <code className="text-xs block">
                const canEdit = computed(() =&gt; &#123;<br/>
                &nbsp;&nbsp;const post = currentPost.get();<br/>
                &nbsp;&nbsp;const userId = untrack(() =&gt; user.get().id);<br/>
                &nbsp;&nbsp;return post.authorId === userId;<br/>
                &#125;);
              </code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-orange-600 mb-1">⏰ Timestamps</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Read current time without tracking it
              </div>
              <code className="text-xs block">
                const log = computed(() =&gt; &#123;<br/>
                &nbsp;&nbsp;const message = logMessage.get();<br/>
                &nbsp;&nbsp;const t = untrack(() =&gt; currentTime.get());<br/>
                &nbsp;&nbsp;return `[$&#123;t&#125;] $&#123;message&#125;`;<br/>
                &#125;);
              </code>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-yellow-900 dark:text-yellow-100">
            💡 Best Practices
          </h3>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <div className="flex gap-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <strong>Use untrack for performance optimization</strong>
                <p className="text-sm">When you need a value but don't want to recompute when it changes.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <strong>Don't overuse it</strong>
                <p className="text-sm">Only use when you have a specific performance reason. Most signals should be tracked!</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <strong>Perfect for UI preferences</strong>
                <p className="text-sm">Theme, locale, display settings - things that don't affect data calculations.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">4️⃣</span>
              <div>
                <strong>Great for initial values</strong>
                <p className="text-sm">Read a signal once without tracking future changes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Tip */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-indigo-900 dark:text-indigo-100">
            ⚡ Performance Impact
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Using untrack() can significantly improve performance when you have:
          </p>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Signals that change frequently (like mouse position, scroll position)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Expensive computations that you don't want to repeat unnecessarily</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Many dependent computations that would all update</span>
            </li>
          </ul>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">🎓 Next Steps</h3>
          <p className="mb-4">Master untrack? Try these advanced demos:</p>
          <div className="flex flex-wrap gap-3">
            <a href="/demos/computed" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
              Computed Signals →
            </a>
            <a href="/demos/batch" className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">
              Batch Updates →
            </a>
            <a href="/demos/bigdata" className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition">
              Big Data Performance →
            </a>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}
