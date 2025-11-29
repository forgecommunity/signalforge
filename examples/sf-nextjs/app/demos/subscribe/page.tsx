'use client';

import { createSignal } from 'signalforge-alpha/core';
import { useState, useEffect } from 'react';
import DemoLayout from '../../components/DemoLayout';

export default function SubscribeDemo() {
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [signal] = useState(() => createSignal(0));
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-9), `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleSubscribe = () => {
    if (isSubscribed) return;
    
    const unsub = signal.subscribe((newValue) => {
      addLog(`Subscription triggered! New value: ${newValue}`);
      setCount(newValue);
    });
    
    setUnsubscribe(() => unsub);
    setIsSubscribed(true);
    addLog('Subscribed to signal');
  };

  const handleUnsubscribe = () => {
    if (unsubscribe) {
      unsubscribe();
      setUnsubscribe(null);
      setIsSubscribed(false);
      addLog('Unsubscribed from signal');
    }
  };

  useEffect(() => {
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [unsubscribe]);

  return (
    <DemoLayout
      title="Subscribe"
      description="Listen to signal changes with subscribe() and unsubscribe"
    >
      <div className="space-y-6">
        {/* Signal Display */}
        <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            {signal.get()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Signal Value</div>
        </div>

        {/* Subscription Status */}
        <div className={`p-4 rounded-lg ${isSubscribed ? 'bg-green-50 dark:bg-green-900' : 'bg-gray-50 dark:bg-gray-700'}`}>
          <div className="flex items-center justify-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isSubscribed ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className={`font-semibold ${isSubscribed ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
              {isSubscribed ? 'Subscribed - Listening for changes' : 'Not Subscribed'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => signal.set(signal.get() - 1)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Decrement
          </button>
          <button
            onClick={() => signal.set(0)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => signal.set(signal.get() + 1)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Increment
          </button>
          <button
            onClick={() => signal.set(Math.floor(Math.random() * 100))}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Random
          </button>
        </div>

        {/* Subscribe/Unsubscribe */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleSubscribe}
            disabled={isSubscribed}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              isSubscribed
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Subscribe
          </button>
          <button
            onClick={handleUnsubscribe}
            disabled={!isSubscribed}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              !isSubscribed
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            Unsubscribe
          </button>
        </div>

        {/* Logs */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Subscription Logs
            </h3>
            <button
              onClick={() => setLogs([])}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="p-4 bg-gray-900 rounded-lg h-48 overflow-y-auto font-mono text-sm">
            {logs.map((log, i) => (
              <div key={i} className="text-green-400 mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Code Example */}
        <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
          <pre className="text-green-400 text-sm">
{`import { createSignal, subscribe } from 'signalforge-alpha/core';

const signal = createSignal(0);

// Subscribe to changes
const unsubscribe = subscribe(signal, (newValue) => {
  console.log('Signal changed to:', newValue);
});

// Update signal (triggers subscriber)
signal.set(42);

// Clean up subscription
unsubscribe();`}
          </pre>
        </div>
      </div>
    </DemoLayout>
  );
}
