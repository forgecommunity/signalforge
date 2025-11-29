'use client';

import { useSignal, createComputed, useSignalValue } from 'signalforge/react';
import { useState } from 'react';
import DemoLayout from '../../components/DemoLayout';

export default function ComputedSignalDemo() {
  const [width, setWidth] = useSignal(10);
  const [height, setHeight] = useSignal(5);
  
  const [area] = useState(() => createComputed(() => width * height));
  const [perimeter] = useState(() => createComputed(() => 2 * (width + height)));
  const [diagonal] = useState(() => createComputed(() => 
    Math.sqrt(width ** 2 + height ** 2).toFixed(2)
  ));
  
  const areaValue = useSignalValue(area);
  const perimeterValue = useSignalValue(perimeter);
  const diagonalValue = useSignalValue(diagonal);

  return (
    <DemoLayout
      title="Computed Signal"
      description="Automatically derived values that update when dependencies change"
    >
      <div className="space-y-6">
        {/* Visual Rectangle */}
        <div className="flex justify-center p-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div
            className="bg-blue-500 border-4 border-blue-700 relative"
            style={{
              width: `${Math.min(width * 20, 400)}px`,
              height: `${Math.min(height * 20, 300)}px`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
              {width} × {height}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Width: {width}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Height: {height}
            </label>
            <input
              type="range"
              min="1"
              max="15"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Computed Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {areaValue}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Area (w × h)
            </div>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {perimeterValue}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Perimeter (2(w+h))
            </div>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900 rounded-lg">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {diagonalValue}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Diagonal (√(w²+h²))
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="mt-8 p-4 bg-gray-900 rounded-lg overflow-x-auto">
          <pre className="text-green-400 text-sm">
{`import { useSignal, useComputed } from 'signalforge/react';

const [width, setWidth] = useSignal(10);
const [height, setHeight] = useSignal(5);

// Automatically updates when width or height changes
const [area] = useState(() => createComputed(() => width * height));
const areaValue = useSignalValue(area);

console.log(areaValue); // ${areaValue}
setWidth(15); // area automatically recalculates!`}
          </pre>
        </div>
      </div>
    </DemoLayout>
  );
}
