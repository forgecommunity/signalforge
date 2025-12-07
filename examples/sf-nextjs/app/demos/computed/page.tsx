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
        {/* WHAT IS THIS? */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-300 dark:border-blue-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-2xl">❓</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-blue-900 dark:text-blue-100">
                What is a Computed Signal?
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                A <strong>computed signal</strong> is a <strong>value that automatically calculates itself</strong> based on other signals. 
                When the inputs change, it recalculates instantly!
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
            <p className="text-gray-700 dark:text-gray-300">
              💡 <strong>Real-life example:</strong> Like a spreadsheet formula! When you change A1 or B1, 
              the formula <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">=A1+B1</code> automatically updates. 
              That's exactly what computed signals do!
            </p>
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
                Why Use Computed Signals?
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-3">
                Because manual calculations are <strong>error-prone and annoying</strong>!
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-red-500">
              <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">❌ Without Computed Signals</h4>
              <pre className="bg-gray-900 text-red-400 p-3 rounded text-xs overflow-x-auto mb-2">
{`const [width, setWidth] = useState(10);
const [height, setHeight] = useState(5);
const [area, setArea] = useState(50);

// Update width
setWidth(20);
setArea(width * height); // FORGOT TO UPDATE!

// Update height  
setHeight(10);
setArea(width * height); // Manual sync again!

// 😱 Easy to forget, causes bugs!`}</pre>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
              <h4 className="font-bold text-green-600 dark:text-green-400 mb-2">✅ With Computed Signals</h4>
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto mb-2">
{`const [width, setWidth] = useSignal(10);
const [height, setHeight] = useSignal(5);
const area = createComputed(() => 
  width * height
);

// Update width
setWidth(20); // area auto-updates! ✨

// Update height
setHeight(10); // area auto-updates! ✨

// 🎉 Always in sync, zero effort!`}</pre>
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
                How To Use It? (Super Simple Pattern!)
              </h3>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100">Create your input signals</h4>
              </div>
              <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-sm overflow-x-auto">
{`const [width, setWidth] = useSignal(10);
const [height, setHeight] = useSignal(5);`}</pre>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100">Create computed signal with a formula</h4>
              </div>
              <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-sm overflow-x-auto">
{`const area = createComputed(() => width * height);
//                          ↑
//                    Your calculation here!`}</pre>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100">Use it - it auto-updates forever!</h4>
              </div>
              <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-sm overflow-x-auto">
{`const areaValue = useSignalValue(area);
<div>Area: {areaValue}</div>  // Always correct! ✨`}</pre>
            </div>
          </div>
          <div className="mt-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-lg p-4">
            <p className="text-center text-gray-700 dark:text-gray-300 font-semibold">
              🧮 Try changing the rectangle size below to see it in action! ⬇️
            </p>
          </div>
        </div>

        {/* Interactive Demo Title */}
        <div className="text-center bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 p-6 rounded-xl border-2 border-cyan-300 dark:border-cyan-600">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🎨 Interactive Rectangle Calculator
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Move the sliders - watch <strong>ALL 3 calculations update automatically</strong> without ANY extra code!
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
