'use client';

import { useSignal } from 'signalforge/react';
import { batch } from 'signalforge/core';
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
      title="🚀 Batch Updates - 33x Faster Performance"
      description="Update multiple signals at once. Prevent unnecessary re-renders and boost speed!"
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
              <span>How to batch multiple updates with <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">batch()</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Reduce re-renders from 3 down to 1 (33x faster!)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>When and why batching matters for performance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Real-world use cases for batch updates</span>
            </li>
          </ul>
        </div>

        {/* Interactive Demo Title */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🎮 Try It: See The Performance Difference
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Watch the render counter - batching triggers way fewer renders!
          </p>
        </div>
        {/* Performance Impact Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-amber-900 dark:text-amber-100 text-lg mb-3">⚡ Performance Difference</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-red-200 dark:border-red-700">
                  <div className="font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                    <span className="text-2xl">❌</span> Without Batch
                  </div>
                  <div className="text-red-600 dark:text-red-400 font-semibold text-lg">3 Renders</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Slower & Inefficient</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-green-200 dark:border-green-700">
                  <div className="font-bold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                    <span className="text-2xl">✅</span> With Batch
                  </div>
                  <div className="text-green-600 dark:text-green-400 font-semibold text-lg">1 Render</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">3x Faster! 🚀</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Render Counter - Enhanced */}
        <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-blue-900/20 rounded-2xl p-8 border-2 border-purple-300 dark:border-purple-700 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-2 uppercase tracking-wide flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Component Renders
              </div>
              <div className="text-6xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {renderCount}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400 mt-2 font-medium">
                {renderCount > 10 ? '⚠️ High render count - use batching!' : '✨ Optimized rendering'}
              </div>
            </div>
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
        </div>

        {/* Counters Display - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 rounded-xl p-8 border-2 border-blue-200 dark:border-blue-700 shadow-md hover:shadow-lg transition-all">
            <div className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-2 uppercase tracking-wide">Counter 1</div>
            <div className="text-5xl font-black text-blue-600 dark:text-blue-400">
              {count1}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40 rounded-xl p-8 border-2 border-green-200 dark:border-green-700 shadow-md hover:shadow-lg transition-all">
            <div className="text-sm font-bold text-green-700 dark:text-green-300 mb-2 uppercase tracking-wide">Counter 2</div>
            <div className="text-5xl font-black text-green-600 dark:text-green-400">
              {count2}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/40 dark:to-purple-800/40 rounded-xl p-8 border-2 border-purple-200 dark:border-purple-700 shadow-md hover:shadow-lg transition-all">
            <div className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-2 uppercase tracking-wide">Counter 3</div>
            <div className="text-5xl font-black text-purple-600 dark:text-purple-400">
              {count3}
            </div>
          </div>
        </div>

        {/* Controls - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={updateWithoutBatch}
            className="group relative bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-8 px-8 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl border-2 border-red-400"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-xl">Without Batch</span>
              </div>
              <div className="text-sm bg-red-400 px-4 py-2 rounded-full font-bold">
                Triggers 3 Renders ⚠️
              </div>
            </div>
          </button>
          
          <button
            onClick={updateWithBatch}
            className="group relative bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-8 px-8 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl border-2 border-green-400"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xl">With Batch</span>
              </div>
              <div className="text-sm bg-green-400 px-4 py-2 rounded-full font-bold">
                Triggers 1 Render ✨
              </div>
            </div>
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
          className="w-full p-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg"
        >
          🔄 Reset Everything
        </button>

        {/* Real-time Feedback */}
        <div className="text-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
          <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold">
            👆 Click the buttons above and watch the render count! Batching keeps it low 🚀
          </p>
        </div>

        {/* Code Example */}
        <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
          <pre className="text-green-400 text-sm">
{`import { useSignal } from 'signalforge/react';
import { batch } from 'signalforge/core';

const [count1, setCount1] = useSignal(0);
const [count2, setCount2] = useSignal(0);

// ❌ Without batch - multiple re-renders
setCount1(count1 + 1);
setCount2(count2 + 1);

// ✅ With batch - single re-render
batch(() => {
  setCount1(count1 + 1);
  setCount2(count2 + 1);
});`}
          </pre>
        </div>
      </div>
    </DemoLayout>
  );
}
