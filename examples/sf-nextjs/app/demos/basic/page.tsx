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
        {/* WHAT IS THIS? */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-300 dark:border-blue-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-2xl">❓</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-blue-900 dark:text-blue-100">
                What is a Signal?
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                A <strong>signal</strong> is like a <strong>smart variable</strong> that automatically tells your UI when it changes. 
                It's the simplest way to manage state in React!
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
            <p className="text-gray-700 dark:text-gray-300">
              🎯 <strong>Think of it like this:</strong> A regular variable is <em>silent</em> when it changes. 
              A signal <em>shouts</em> "Hey, I changed!" and React automatically updates your UI.
            </p>
          </div>
          
          {/* createSignal vs useSignal Explanation */}
          <div className="mt-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-lg p-4 border-2 border-cyan-400 dark:border-cyan-600">
            <h4 className="font-bold text-cyan-900 dark:text-cyan-100 mb-3 flex items-center gap-2">
              <span className="text-xl">🤔</span> createSignal vs useSignal - What's the Difference?
            </h4>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border-l-4 border-cyan-500">
                <h5 className="font-bold text-cyan-700 dark:text-cyan-300 mb-2">📦 createSignal()</h5>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Creates a <strong>standalone signal</strong> outside components
                </p>
                <pre className="bg-gray-900 text-cyan-400 p-2 rounded text-xs overflow-x-auto">
{`// Outside component
const count = createSignal(0);

// Use anywhere!
function Display() {
  const value = useSignalValue(count);
  return <div>{value}</div>;
}`}</pre>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  ✅ Use for <strong>global state</strong> shared across components
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border-l-4 border-purple-500">
                <h5 className="font-bold text-purple-700 dark:text-purple-300 mb-2">⚛️ useSignal()</h5>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  React hook - creates signal <strong>inside component</strong>
                </p>
                <pre className="bg-gray-900 text-purple-400 p-2 rounded text-xs overflow-x-auto">
{`// Inside component
function Counter() {
  const [count, setCount] = useSignal(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}`}</pre>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  ✅ Use for <strong>local state</strong> (like useState but reactive!)
                </p>
              </div>
            </div>
            <div className="mt-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-600 rounded-lg p-3">
              <p className="text-sm text-yellow-900 dark:text-yellow-200">
                💡 <strong>In this demo:</strong> We use <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">useSignal(0)</code> because 
                the counter is local to this component. For global state (like shopping cart), use <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">createSignal()</code>!
              </p>
            </div>
          </div>
        </div>

        {/* WHY USE THIS? */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-300 dark:border-green-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-green-900 dark:text-green-100">
                Why Use Signals?
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-3">
                Because they make state management <strong>ridiculously simple</strong>!
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-red-500">
              <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">❌ Without Signals (Regular useState)</h4>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Need Context for global state</li>
                <li>• Props drilling everywhere</li>
                <li>• Complex state management</li>
                <li>• Lots of boilerplate code</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
              <h4 className="font-bold text-green-600 dark:text-green-400 mb-2">✅ With Signals</h4>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Works anywhere instantly</li>
                <li>• No props drilling needed</li>
                <li>• Simple & straightforward</li>
                <li>• Just one line of code!</li>
              </ul>
            </div>
          </div>
        </div>

        {/* HOW TO USE IT? */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-300 dark:border-purple-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-2xl">🚀</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-purple-900 dark:text-purple-100">
                How To Use It? (3 Super Easy Steps!)
              </h3>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100">Create the signal</h4>
              </div>
              <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-sm overflow-x-auto">
{`const [count, setCount] = useSignal(0);
//     ↑       ↑              ↑
//   value  updater    starting value`}</pre>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100">Display it in your UI</h4>
              </div>
              <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-sm overflow-x-auto">
{`<div>{count}</div>  // Just use it like a regular variable!`}</pre>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100">Update it when needed</h4>
              </div>
              <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-sm overflow-x-auto">
{`setCount(count + 1)  // UI updates automatically! ✨`}</pre>
            </div>
          </div>
          <div className="mt-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-lg p-4">
            <p className="text-center text-gray-700 dark:text-gray-300 font-semibold">
              🎉 That's it! You're now using reactive state! Try it below ⬇️
            </p>
          </div>
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

        {/* What Problems Does This Solve? */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 border-2 border-orange-300 dark:border-orange-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-2xl">🔧</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-orange-900 dark:text-orange-100">
                What Problems Does This Solve?
              </h3>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                <span>😰</span> Traditional React Problems
              </h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex gap-2">
                  <span className="text-red-500">❌</span>
                  <span><strong>Props Drilling:</strong> Passing state through 5+ components</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500">❌</span>
                  <span><strong>Context Hell:</strong> Multiple providers wrapping your app</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500">❌</span>
                  <span><strong>Complex Setup:</strong> Redux with actions, reducers, types...</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500">❌</span>
                  <span><strong>Boilerplate Code:</strong> 50+ lines for a simple counter</span>
                </li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                <span>😊</span> SignalForge Solutions
              </h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex gap-2">
                  <span className="text-green-500">✅</span>
                  <span><strong>No Drilling:</strong> Access state anywhere, anytime</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-500">✅</span>
                  <span><strong>No Providers:</strong> Zero setup, works immediately</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-500">✅</span>
                  <span><strong>Simple:</strong> If you know useState, you know signals</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-500">✅</span>
                  <span><strong>Minimal Code:</strong> 3 lines for the same counter!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Real-World Example */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 border-2 border-cyan-300 dark:border-cyan-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-2xl">🌍</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-cyan-900 dark:text-cyan-100">
                Real-World Example: Shopping Cart
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Imagine you need a shopping cart quantity that multiple components can see and update:
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">📍 Create once (anywhere)</h4>
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`// cart.js
export const cartCount = 
  createSignal(0);`}</pre>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">🎯 Use anywhere</h4>
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`// Header.jsx
const count = 
  useSignalValue(cartCount);
return <Badge>{count}</Badge>;`}</pre>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">➕ Update anywhere</h4>
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`// ProductCard.jsx
cartCount.set(
  cartCount.get() + 1
);`}</pre>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">✨ Auto-updates!</h4>
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`// All components using 
// cartCount update 
// automatically! 🎉`}</pre>
            </div>
          </div>
        </div>

        {/* Step by Step Guide */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-750 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-purple-900 dark:text-purple-100">
            🚀 Complete Code Example
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
