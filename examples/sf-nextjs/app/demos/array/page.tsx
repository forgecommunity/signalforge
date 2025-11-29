'use client';

import { createArraySignal } from 'signalforge/utils';
import { useState, useEffect } from 'react';
import DemoLayout from '../../components/DemoLayout';

export default function ArraySignalDemo() {
  const [items, setItems] = useState<number[]>([]);
  const [arraySignal] = useState(() => createArraySignal([1, 2, 3, 4, 5]));
  const [input, setInput] = useState('');

  useEffect(() => {
    const updateItems = () => setItems([...arraySignal.get()]);
    updateItems();
    const unsubscribe = arraySignal.subscribe(updateItems);
    return unsubscribe;
  }, [arraySignal]);

  return (
    <DemoLayout
      title="Array Signal"
      description="Specialized signal for array operations with utility methods"
    >
      <div className="space-y-6">
        {/* Array Display */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Array Contents ({items.length} items)
          </h3>
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Add Item */}
        <div className="flex gap-2">
          <input
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && input) {
                arraySignal.push(Number(input));
                setInput('');
              }
            }}
            placeholder="Enter a number"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={() => {
              if (input) {
                arraySignal.push(Number(input));
                setInput('');
              }
            }}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Push
          </button>
        </div>

        {/* Array Methods */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => arraySignal.pop()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Pop
          </button>
          <button
            onClick={() => arraySignal.filter((x) => x !== items[0])}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Remove First
          </button>
          <button
            onClick={() => arraySignal.remove(items[items.length - 1])}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Remove Last
          </button>
          <button
            onClick={() => arraySignal.filter((x) => x % 2 === 0)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Keep Evens
          </button>
          <button
            onClick={() => arraySignal.filter((x) => x > 3)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Keep {'>'}3
          </button>
          <button
            onClick={() => arraySignal.clear()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={() => {
              const found = arraySignal.find((x) => x > 3);
              if (found !== undefined) alert(`Found: ${found}`);
            }}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Find {'>'}3
          </button>
          <button
            onClick={() => arraySignal.set([1, 2, 3, 4, 5])}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Code Example */}
        <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
          <pre className="text-green-400 text-sm">
{`import { createArraySignal } from 'signalforge/utils';

const arr = createArraySignal([1, 2, 3, 4, 5]);

// Available array methods
arr.push(6);              // [1, 2, 3, 4, 5, 6]
arr.pop();                // [1, 2, 3, 4, 5]
arr.filter(x => x > 2);   // [3, 4, 5]
arr.remove(3);            // [4, 5]
arr.clear();              // []

// Read-only methods
const mapped = arr.map(x => x * 2);
const found = arr.find(x => x > 3);
const len = arr.length;

// All mutations trigger subscribers
arr.subscribe(() => {
  console.log('Array changed:', arr.get());
});`}
          </pre>
        </div>
      </div>
    </DemoLayout>
  );
}
