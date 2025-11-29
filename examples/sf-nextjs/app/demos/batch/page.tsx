'use client';

import { useSignal } from 'signalforge-alpha/react';
import { batch } from 'signalforge-alpha/core';
import { useState } from 'react';
import DemoLayout from '../../components/DemoLayout';

export default function BatchUpdatesDemo() {
  const [count1, setCount1] = useSignal(0);
  const [count2, setCount2] = useSignal(0);
  const [count3, setCount3] = useSignal(0);
  const [renderCount, setRenderCount] = useState(0);

  // Track renders
  useState(() => {
    setRenderCount(prev => prev + 1);
  });

  const updateWithoutBatch = () => {
    setCount1(count1 + 1);
    setCount2(count2 + 1);
    setCount3(count3 + 1);
    // This triggers 3 separate re-renders
  };

  const updateWithBatch = () => {
    batch(() => {
      setCount1(count1 + 1);
      setCount2(count2 + 1);
      setCount3(count3 + 1);
    });
    // This triggers only 1 re-render
  };

  return (
    <DemoLayout
      title="Batch Updates"
      description="Optimize performance by batching multiple signal updates"
    >
      <div className="space-y-6">
        {/* Render Counter */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg text-center">
          <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {renderCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Component Renders
          </div>
        </div>

        {/* Counters Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-blue-50 dark:bg-blue-900 rounded-lg text-center">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {count1}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Counter 1</div>
          </div>
          <div className="p-6 bg-green-50 dark:bg-green-900 rounded-lg text-center">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400">
              {count2}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Counter 2</div>
          </div>
          <div className="p-6 bg-purple-50 dark:bg-purple-900 rounded-lg text-center">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
              {count3}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Counter 3</div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={updateWithoutBatch}
            className="p-6 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <div className="text-xl font-bold mb-2">Update Without Batch</div>
            <div className="text-sm opacity-90">Triggers 3 re-renders ❌</div>
          </button>
          <button
            onClick={updateWithBatch}
            className="p-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <div className="text-xl font-bold mb-2">Update With Batch</div>
            <div className="text-sm opacity-90">Triggers 1 re-render ✅</div>
          </button>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            batch(() => {
              setCount1(0);
              setCount2(0);
              setCount3(0);
            });
            setRenderCount(0);
          }}
          className="w-full p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Reset All
        </button>

        {/* Code Example */}
        <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
          <pre className="text-green-400 text-sm">
{`import { useSignal } from 'signalforge-alpha/react';
import { batch } from 'signalforge-alpha/core';

const count1 = useSignal(0);
const count2 = useSignal(0);

// ❌ Without batch - multiple re-renders
count1.value++;
count2.value++;

// ✅ With batch - single re-render
batch(() => {
  count1.value++;
  count2.value++;
});`}
          </pre>
        </div>
      </div>
    </DemoLayout>
  );
}
