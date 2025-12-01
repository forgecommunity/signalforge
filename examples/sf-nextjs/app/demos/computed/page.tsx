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
      title="🧮 Computed Signals - Automatic Calculations"
      description="Values that auto-update when their dependencies change. No manual tracking needed!"
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
              <span>Create computed values with <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">createComputed()</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Automatically track dependencies (no manual setup!)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Build complex calculations from simple signals</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Avoid recalculating unless dependencies actually change</span>
            </li>
          </ul>
        </div>

        {/* Interactive Demo Title */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🎨 Try It: Rectangle Calculator
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Change width or height - watch all calculated values update automatically!
          </p>
        </div>
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

        {/* How It Works */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-750 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-purple-900 dark:text-purple-100">
            🚀 How It Works (3 Simple Steps)
          </h3>
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="font-bold text-blue-600 dark:text-blue-400 mb-2">Step 1: Create your source signals</div>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded block">
                const [width, setWidth] = useSignal(10);<br/>
                const [height, setHeight] = useSignal(5);
              </code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-l-4 border-green-500">
              <div className="font-bold text-green-600 dark:text-green-400 mb-2">Step 2: Create computed signal with a function</div>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded block">
                const area = createComputed(() =&gt; width * height);
              </code>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                💡 SignalForge automatically tracks that this depends on width and height!
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="font-bold text-purple-600 dark:text-purple-400 mb-2">Step 3: Use it - updates happen automatically</div>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded block">
                const areaValue = useSignalValue(area);  // {areaValue}<br/>
                setWidth(20);  // area recalculates automatically! ✨
              </code>
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
{`import { useSignal, createComputed, useSignalValue } from 'signalforge/react';
import { useState } from 'react';

function RectangleCalculator() {
  // Create source signals
  const [width, setWidth] = useSignal(10);
  const [height, setHeight] = useSignal(5);
  
  // Create computed signals - these auto-update!
  const [area] = useState(() => 
    createComputed(() => width * height)
  );
  const [perimeter] = useState(() => 
    createComputed(() => 2 * (width + height))
  );
  
  // Read computed values
  const areaValue = useSignalValue(area);
  const perimeterValue = useSignalValue(perimeter);
  
  return (
    <div>
      <h2>Area: {areaValue}</h2>
      <h2>Perimeter: {perimeterValue}</h2>
      
      <input 
        value={width} 
        onChange={(e) => setWidth(Number(e.target.value))}
      />
      {/* When width changes, area and perimeter 
          automatically recalculate! */}
    </div>
  );
}

// ✨ Benefits:
// • No manual dependency tracking
// • Only recalculates when dependencies change
// • Can chain computed signals together
// • Zero boilerplate`}
            </pre>
          </div>
        </div>

        {/* Why This Matters */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-yellow-900 dark:text-yellow-100">
            💡 Why Computed Signals Are Better
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
            <div>
              <div className="font-semibold text-red-600 dark:text-red-400 mb-2">❌ Traditional useMemo:</div>
              <ul className="space-y-1 text-sm">
                <li>• Must list all dependencies manually</li>
                <li>• Easy to forget a dependency</li>
                <li>• Verbose dependency arrays</li>
                <li>• Hard to debug stale values</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-green-600 dark:text-green-400 mb-2">✅ SignalForge Computed:</div>
              <ul className="space-y-1 text-sm">
                <li>• Auto-tracks dependencies</li>
                <li>• Impossible to miss dependencies</li>
                <li>• Clean, simple syntax</li>
                <li>• Always accurate and up-to-date</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Real World Use Cases */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-green-900 dark:text-green-100">
            🌍 Real-World Use Cases
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-blue-600 mb-1">🛒 Shopping Cart Total</div>
              <code className="text-xs">total = sum(items.map(i =&gt; i.price * i.qty))</code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-purple-600 mb-1">📊 Dashboard Metrics</div>
              <code className="text-xs">avgRevenue = totalRevenue / daysCount</code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-green-600 mb-1">✅ Form Validation</div>
              <code className="text-xs">isValid = email.valid && password.length &gt; 8</code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-orange-600 mb-1">🎮 Game Score</div>
              <code className="text-xs">score = kills * 100 + bonuses - penalties</code>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">🎓 Next Steps</h3>
          <p className="mb-4">Master computed signals? Try these next:</p>
          <div className="flex flex-wrap gap-3">
            <a href="/demos/effects" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
              Effects →
            </a>
            <a href="/demos/cart" className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">
              Shopping Cart →
            </a>
            <a href="/demos/form" className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition">
              Form Validation →
            </a>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}
