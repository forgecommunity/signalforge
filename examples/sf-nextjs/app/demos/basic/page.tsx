'use client';

import { useSignal } from 'signalforge-alpha/react';
import DemoLayout from '../../components/DemoLayout';

export default function BasicSignalDemo() {
  const [count, setCount] = useSignal(0);

  return (
    <DemoLayout
      title="Basic Signal"
      description="Create and manipulate signals with get() and set() operations"
    >
      <div className="space-y-6">
        {/* Counter Display */}
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            {count}
          </div>
          <p className="text-gray-600 dark:text-gray-300">Current Count</p>
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

        {/* Code Example */}
        <div className="mt-8 p-4 bg-gray-900 rounded-lg overflow-x-auto">
          <pre className="text-green-400 text-sm">
{`import { useSignal } from 'signalforge-alpha/react';

const [count, setCount] = useSignal(0);

// Read value
console.log(count); // ${count}

// Update value
setCount(count + 1); // ${count + 1}
setCount(count - 1); // ${count - 1}
setCount(0); // 0`}
          </pre>
        </div>
      </div>
    </DemoLayout>
  );
}
