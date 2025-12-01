'use client';

import { useSignal } from 'signalforge/react';
import DemoLayout from '../../components/DemoLayout';

export default function BasicSignalDemo() {
  const [count, setCount] = useSignal(0);

  return (
    <DemoLayout
      title="🎯 Basic Signal - Get Started in 30 Seconds"
      description="Learn how to create and update reactive state with just one hook. No Redux, no Context, no complexity."
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
              <span>How to create a signal with <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">useSignal(initialValue)</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>How to read the current value (it's just a variable!)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>How to update the value with <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">setCount(newValue)</code></span>
            </li>
          </ul>
        </div>

        {/* Interactive Demo */}
        <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border-2 border-blue-200 dark:border-blue-600">
          <div className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {count}
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">👆 Try the buttons below!</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => setCount(count - 1)}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
          >
            Decrement -
          </button>
          <button
            onClick={() => setCount(0)}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
          >
            Reset
          </button>
          <button
            onClick={() => setCount(count + 1)}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            Increment +
          </button>
        </div>

        {/* Advanced Controls */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => setCount(count + 5)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            +5
          </button>
          <button
            onClick={() => setCount(count + 10)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            +10
          </button>
          <button
            onClick={() => setCount(count * 2)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            ×2
          </button>
          <button
            onClick={() => setCount(Math.floor(count / 2))}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            ÷2
          </button>
        </div>

        {/* Step by Step Guide */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-750 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-purple-900 dark:text-purple-100">
            🚀 How It Works (3 Simple Steps)
          </h3>
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="font-bold text-blue-600 dark:text-blue-400 mb-2">Step 1: Import the hook</div>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded block">
                import &#123; useSignal &#125; from 'signalforge/react';
              </code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-l-4 border-green-500">
              <div className="font-bold text-green-600 dark:text-green-400 mb-2">Step 2: Create your signal</div>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded block">
                const [count, setCount] = useSignal(0);  // Start at 0
              </code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="font-bold text-purple-600 dark:text-purple-400 mb-2">Step 3: Use it like normal state!</div>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded block">
                &#123;count&#125;  // Display the value<br/>
                setCount(count + 1)  // Update it
              </code>
            </div>
          </div>
        </div>

        {/* Full Code Example */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
            💻 Complete Code Example
          </h3>
          <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
            <pre className="text-green-400 text-sm">
{`import { useSignal } from 'signalforge/react';

function Counter() {
  // Create a signal with initial value 0
  const [count, setCount] = useSignal(0);

  return (
    <div>
      <h1>Count: {count}</h1>
      
      {/* Update the signal */}
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      
      <button onClick={() => setCount(0)}>
        Reset
      </button>
    </div>
  );
}

// That's it! Your component will automatically
// re-render when count changes. No useEffect,
// no useCallback, no useMemo needed!`}</pre>
          </div>
        </div>

        {/* Why This Matters */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-yellow-900 dark:text-yellow-100">
            💡 Why SignalForge is Better
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
            <div>
              <div className="font-semibold text-red-600 dark:text-red-400 mb-2">❌ Traditional useState:</div>
              <ul className="space-y-1 text-sm">
                <li>• Causes full component re-render</li>
                <li>• Slow with many state updates</li>
                <li>• Need useCallback/useMemo</li>
                <li>• Complex prop drilling</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-green-600 dark:text-green-400 mb-2">✅ SignalForge useSignal:</div>
              <ul className="space-y-1 text-sm">
                <li>• Only re-renders what changed</li>
                <li>• 33x faster with batching</li>
                <li>• No extra optimization needed</li>
                <li>• Global state built-in</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">🎓 Next Steps</h3>
          <p className="mb-4">Now that you understand basic signals, try these demos:</p>
          <div className="flex flex-wrap gap-3">
            <a href="/demos/computed" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
              Computed Signals →
            </a>
            <a href="/demos/effects" className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">
              Effects →
            </a>
            <a href="/demos/hooks" className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition">
              React Hooks →
            </a>
          </div>
        </div>

        {/* Original Demo kept for interaction */}
        <details className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <summary className="cursor-pointer font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🎮 Interactive Playground (Click to expand)
          </summary>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => setCount(count - 1)}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
              >
                Decrement -
              </button>
              <button
                onClick={() => setCount(0)}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                Reset
              </button>
              <button
                onClick={() => setCount(count + 1)}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                Increment +
              </button>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => setCount(count + 5)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                +5
              </button>
              <button
                onClick={() => setCount(count + 10)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                +10
              </button>
              <button
                onClick={() => setCount(count * 2)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                ×2
              </button>
              <button
                onClick={() => setCount(Math.floor(count / 2))}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                ÷2
              </button>
            </div>
          </div>
        </details>
      </div>
    </DemoLayout>
  );
}
