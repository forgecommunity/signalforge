'use client';

import { createPersistentSignal } from 'signalforge/utils';
import { useState, useEffect } from 'react';
import DemoLayout from '../../components/DemoLayout';

export default function PersistentSignalDemo() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);
  const countSignalRef = useState<any>(null);
  const nameSignalRef = useState<any>(null);
  const themeSignalRef = useState<any>(null);

  useEffect(() => {
    // Create signals only on client side
    const countSignal = createPersistentSignal('demo-count', 0);
    const nameSignal = createPersistentSignal('demo-name', 'Guest');
    const themeSignal = createPersistentSignal('demo-theme', 'light');
    
    countSignalRef[0] = countSignal;
    nameSignalRef[0] = nameSignal;
    themeSignalRef[0] = themeSignal;

    // Subscribe to changes
    const unsubCount = countSignal.subscribe((val: number) => setCount(val));
    const unsubName = nameSignal.subscribe((val: string) => setName(val));
    const unsubTheme = themeSignal.subscribe((val: string) => setTheme(val));

    // Initial values
    setCount(countSignal.get());
    setName(nameSignal.get());
    setTheme(themeSignal.get());
    setMounted(true);

    return () => {
      unsubCount();
      unsubName();
      unsubTheme();
    };
  }, []);

  if (!mounted) {
    return (
      <DemoLayout
        title="Persistent Signal"
        description="Signals that automatically save to and restore from localStorage"
      >
        <div className="text-center p-8">Loading...</div>
      </DemoLayout>
    );
  }

  return (
    <DemoLayout
      title="Persistent Signal"
      description="Signals that automatically save to and restore from localStorage"
    >
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-blue-900 dark:text-blue-100 text-sm">
            💡 <strong>Try this:</strong> Change the values below, then refresh the page. 
            Your changes will persist thanks to localStorage!
          </p>
        </div>

        {/* Counter */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Persistent Counter
          </h3>
          <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 text-center mb-4">
            {count}
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => countSignalRef[0]?.set(countSignalRef[0]?.get() - 1)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              -1
            </button>
            <button
              onClick={() => countSignalRef[0]?.set(0)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => countSignalRef[0]?.set(countSignalRef[0]?.get() + 1)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              +1
            </button>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Stored as: <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">demo-count</code>
          </div>
        </div>

        {/* Name Input */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Persistent Name
          </h3>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 text-center mb-4">
            Hello, {name}!
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => nameSignalRef[0]?.set(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
          />
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Stored as: <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">demo-name</code>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Persistent Theme
          </h3>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 text-center mb-4 capitalize">
            {theme} Mode
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['light', 'dark', 'auto'].map((t) => (
              <button
                key={t}
                onClick={() => themeSignalRef[0]?.set(t)}
                className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                  theme === t
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Stored as: <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">demo-theme</code>
          </div>
        </div>

        {/* LocalStorage Viewer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            LocalStorage Contents
          </h3>
          <div className="space-y-2 font-mono text-sm">
            <div className="p-2 bg-white dark:bg-gray-800 rounded">
              <span className="text-blue-600 dark:text-blue-400">demo-count:</span>{' '}
              <span className="text-gray-900 dark:text-white">{localStorage.getItem('demo-count')}</span>
            </div>
            <div className="p-2 bg-white dark:bg-gray-800 rounded">
              <span className="text-green-600 dark:text-green-400">demo-name:</span>{' '}
              <span className="text-gray-900 dark:text-white">{localStorage.getItem('demo-name')}</span>
            </div>
            <div className="p-2 bg-white dark:bg-gray-800 rounded">
              <span className="text-purple-600 dark:text-purple-400">demo-theme:</span>{' '}
              <span className="text-gray-900 dark:text-white">{localStorage.getItem('demo-theme')}</span>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
          <pre className="text-green-400 text-sm">
{`import { createPersistentSignal } from 'signalforge/utils';

// Create persistent signals
const count = createPersistentSignal('demo-count', 0);
const name = createPersistentSignal('demo-name', 'Guest');

// Use like regular signals
count.set(count.get() + 1);
name.set('Alice');

// Values automatically save to localStorage
// and restore on page reload!`}
          </pre>
        </div>
      </div>
    </DemoLayout>
  );
}
