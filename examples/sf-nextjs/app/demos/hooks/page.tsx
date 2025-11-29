'use client';

import { useSignal, useSignalValue, useSignalEffect } from 'signalforge/react';
import { useState } from 'react';
import DemoLayout from '../../components/DemoLayout';

export default function ReactHooksDemo() {
  // useSignal - Returns [value, setValue] tuple
  const [count, setCount] = useSignal(10);
  const [doubled, setDoubled] = useSignal(0);
  
  const [effectLogs, setEffectLogs] = useState<string[]>([]);

  // useSignalEffect - Auto-tracking effect
  useSignalEffect(() => {
    setDoubled(count * 2);
    const log = `Effect: count=${count}, doubled=${count * 2}`;
    setEffectLogs(prev => [...prev.slice(-4), log]);
  });

  return (
    <DemoLayout
      title="React Hooks"
      description="useSignal, useSignalValue, and useSignalEffect hooks"
    >
      <div className="space-y-6">
        {/* Hook Demos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* useSignal */}
          <div className="p-6 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
              useSignal()
            </h3>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4 text-center">
              {count}
            </div>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setCount(count - 1)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                -
              </button>
              <button
                onClick={() => setCount(10)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setCount(count + 1)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                +
              </button>
            </div>
            <pre className="text-xs bg-gray-900 text-green-400 p-2 rounded overflow-x-auto">
{`const [count, setCount] = useSignal(10);
setCount(count + 1) // update`}
            </pre>
          </div>

          {/* useSignalValue */}
          <div className="p-6 bg-green-50 dark:bg-green-900 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
              Computed Value
            </h3>
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-4 text-center">
              {doubled}
            </div>
            <div className="mb-4 text-center text-sm text-gray-600 dark:text-gray-300">
              Auto-computed value
              <br />
              (count * 2)
            </div>
            <pre className="text-xs bg-gray-900 text-green-400 p-2 rounded overflow-x-auto">
{`const [doubled, setDoubled] = useSignal(0);
useSignalEffect(() => {
  setDoubled(count * 2);
});`}
            </pre>
          </div>
        </div>

        {/* useSignalEffect */}
        <div className="p-6 bg-purple-50 dark:bg-purple-900 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">
            useSignalEffect()
          </h3>
          <div className="p-4 bg-gray-900 rounded-lg h-40 overflow-y-auto font-mono text-sm mb-4">
            {effectLogs.map((log, i) => (
              <div key={i} className="text-green-400">
                {log}
              </div>
            ))}
          </div>
          <pre className="text-xs bg-gray-900 text-green-400 p-2 rounded overflow-x-auto">
{`useSignalEffect(() => {
  // Automatically tracks count.value
  doubled.value = count.value * 2;
});`}
          </pre>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3">Hook</th>
                <th className="px-6 py-3">Returns</th>
                <th className="px-6 py-3">Use Case</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <td className="px-6 py-4 font-mono text-blue-600 dark:text-blue-400">useSignal</td>
                <td className="px-6 py-4">Signal object</td>
                <td className="px-6 py-4">When you need to read AND write</td>
              </tr>
              <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <td className="px-6 py-4 font-mono text-green-600 dark:text-green-400">useSignalValue</td>
                <td className="px-6 py-4">Raw value</td>
                <td className="px-6 py-4">When you only need to read (optimized)</td>
              </tr>
              <tr className="bg-white dark:bg-gray-800">
                <td className="px-6 py-4 font-mono text-purple-600 dark:text-purple-400">useSignalEffect</td>
                <td className="px-6 py-4">void</td>
                <td className="px-6 py-4">Run side effects when signals change</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Full Code Example */}
        <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
          <pre className="text-green-400 text-sm">
{`import { useSignal, useSignalEffect } from 'signalforge/react';

function MyComponent() {
  // useState-like API
  const [count, setCount] = useSignal(0);
  const [doubled, setDoubled] = useSignal(0);
  
  // Auto-tracking effect
  useSignalEffect(() => {
    setDoubled(count * 2);
  });
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Doubled: {doubled}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}`}
          </pre>
        </div>
      </div>
    </DemoLayout>
  );
}
