'use client';

import { createSignal } from 'signalforge/core';
import { useState, useEffect } from 'react';
import DemoLayout from '../../components/DemoLayout';

interface DataItem {
  id: number;
  value: number;
  signal: ReturnType<typeof createSignal<number>>;
}

export default function BigDataDemo() {
  const [items, setItems] = useState<DataItem[]>([]);
  const [itemCount, setItemCount] = useState(1000);
  const [isCreating, setIsCreating] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const [renderTime, setRenderTime] = useState(0);

  const createItems = (count: number) => {
    setIsCreating(true);
    const startTime = performance.now();

    const newItems: DataItem[] = [];
    for (let i = 0; i < count; i++) {
      newItems.push({
        id: i,
        value: Math.floor(Math.random() * 100),
        signal: createSignal(Math.floor(Math.random() * 100)),
      });
    }

    setItems(newItems);
    const endTime = performance.now();
    setRenderTime(endTime - startTime);
    setIsCreating(false);
  };

  const updateAllSignals = () => {
    const startTime = performance.now();
    items.forEach(item => {
      item.signal.set(Math.floor(Math.random() * 100));
    });
    const endTime = performance.now();
    setRenderTime(endTime - startTime);
    setUpdateCount(prev => prev + 1);
    // Force re-render
    setItems([...items]);
  };

  const incrementAll = () => {
    const startTime = performance.now();
    items.forEach(item => {
      item.signal.set(item.signal.get() + 1);
    });
    const endTime = performance.now();
    setRenderTime(endTime - startTime);
    setUpdateCount(prev => prev + 1);
    setItems([...items]);
  };

  useEffect(() => {
    createItems(1000);
  }, []);

  return (
    <DemoLayout
      title="Big Data Performance"
      description="Test SignalForge performance with thousands of signals"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {items.length.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Active Signals</div>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {renderTime.toFixed(2)}ms
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Last Operation</div>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {updateCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Updates Performed</div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of Signals: {itemCount.toLocaleString()}
            </label>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={itemCount}
              onChange={(e) => setItemCount(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => createItems(itemCount)}
              disabled={isCreating}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                isCreating
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isCreating ? 'Creating...' : 'Create Signals'}
            </button>
            <button
              onClick={updateAllSignals}
              disabled={items.length === 0}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                items.length === 0
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              Update All (Random)
            </button>
            <button
              onClick={incrementAll}
              disabled={items.length === 0}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                items.length === 0
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              Increment All
            </button>
          </div>
        </div>

        {/* Sample Data Display */}
        {items.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Sample Data (First 100 items)
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg max-h-96 overflow-y-auto">
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {items.slice(0, 100).map(item => (
                  <div
                    key={item.id}
                    className="p-2 bg-blue-500 text-white rounded text-center font-semibold text-sm"
                  >
                    {item.signal.get()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Performance Tips */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            ⚡ Performance Tips
          </h3>
          <ul className="list-disc list-inside text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
            <li>SignalForge can handle 10,000+ signals efficiently</li>
            <li>Use batch() to group multiple updates</li>
            <li>Computed signals only re-run when dependencies change</li>
            <li>Virtual scrolling recommended for large lists in production</li>
          </ul>
        </div>

        {/* Code Example */}
        <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
          <pre className="text-green-400 text-sm">
{`import { createSignal, batch } from 'signalforge/core';

// Create thousands of signals
const signals = Array.from({ length: 10000 }, () => 
  createSignal(Math.random() * 100)
);

// Update efficiently with batch
batch(() => {
  signals.forEach(signal => {
    signal.set(signal.get() + 1);
  });
}); // Only triggers one re-render!`}
          </pre>
        </div>
      </div>
    </DemoLayout>
  );
}
