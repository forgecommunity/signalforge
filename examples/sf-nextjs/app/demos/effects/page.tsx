'use client';

import { useSignal, useSignalEffect } from 'signalforge/react';
import { useState } from 'react';
import DemoLayout from '../../components/DemoLayout';

export default function EffectsDemo() {
  const [count, setCount] = useSignal(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-9), `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // Effect runs whenever count changes
  useSignalEffect(() => {
    addLog(`Effect triggered! Count is now ${count}`);
    
    // Cleanup function
    return () => {
      addLog(`Cleaning up effect for count ${count}`);
    };
  });

  return (
    <DemoLayout
      title="Effects"
      description="Run side effects automatically when signals change"
    >
      <div className="space-y-6">
        {/* Counter */}
        <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            {count}
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setCount(count - 1)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Decrement
            </button>
            <button
              onClick={() => setCount(0)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => setCount(count + 1)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Increment
            </button>
          </div>
        </div>

        {/* Logs */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Effect Logs
            </h3>
            <button
              onClick={() => setLogs([])}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Clear Logs
            </button>
          </div>
          <div className="p-4 bg-gray-900 rounded-lg h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet. Change the counter to trigger effects.</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-green-400 mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Code Example */}
        <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
          <pre className="text-green-400 text-sm">
{`import { useSignal, useSignalEffect } from 'signalforge/react';

const count = useSignal(0);

// Effect runs automatically when count changes
useSignalEffect(() => {
  console.log('Count changed to:', count.value);
  
  // Optional cleanup function
  return () => {
    console.log('Cleaning up...');
  };
});`}
          </pre>
        </div>
      </div>
    </DemoLayout>
  );
}
