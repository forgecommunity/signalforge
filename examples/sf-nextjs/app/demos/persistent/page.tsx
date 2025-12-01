'use client';

import { createPersistentSignal } from 'signalforge/utils';
import { useState, useEffect } from 'react';
import DemoLayout from '../../components/DemoLayout';

export default function PersistentSignalDemo() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);
  const [countSignal, setCountSignal] = useState<any>(null);
  const [nameSignal, setNameSignal] = useState<any>(null);
  const [themeSignal, setThemeSignal] = useState<any>(null);

  useEffect(() => {
    // Create signals only on client side
    const cSignal = createPersistentSignal('demo-count', 0);
    const nSignal = createPersistentSignal('demo-name', 'Guest');
    const tSignal = createPersistentSignal('demo-theme', 'light');
    
    setCountSignal(cSignal);
    setNameSignal(nSignal);
    setThemeSignal(tSignal);

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
        title="💾 Persistent Signals - Auto-Save to Storage"
        description="Signals that automatically save to and restore from localStorage"
      >
        <div className="text-center p-8">Loading...</div>
      </DemoLayout>
    );
  }

  return (
    <DemoLayout
      title="💾 Persistent Signals - Auto-Save to Storage"
      description="Signals that automatically save to and restore from localStorage"
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
              <span>Create signals that auto-save to localStorage</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Automatically restore state on page reload</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Build user preferences and settings systems</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Handle complex data types (objects, arrays, etc.)</span>
            </li>
          </ul>
        </div>

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
              onClick={() => countSignal?.set(countSignal?.get() - 1)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              -1
            </button>
            <button
              onClick={() => countSignal?.set(0)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => countSignal?.set(countSignal?.get() + 1)}
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
            onChange={(e) => nameSignal?.set(e.target.value)}
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
                onClick={() => themeSignal?.set(t)}
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

        {/* Real World Use Cases */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-green-900 dark:text-green-100">
            🌍 Real-World Use Cases
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-blue-600 mb-1">⚙️ User Preferences</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Theme, language, layout preferences
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-purple-600 mb-1">🛒 Shopping Cart</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Persist cart items across sessions
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-green-600 mb-1">📝 Draft Content</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Auto-save forms, comments, posts
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-orange-600 mb-1">👤 Auth Tokens</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Remember login state securely
              </p>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-yellow-900 dark:text-yellow-100">
            💡 Best Practices
          </h3>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <div className="flex gap-3">
              <span className="text-2xl">🔑</span>
              <div>
                <strong>Use descriptive keys</strong>
                <p className="text-sm">Namespace your keys to avoid conflicts (e.g., 'myapp-user-settings').</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <strong>Don't store sensitive data</strong>
                <p className="text-sm">localStorage is not secure - don't store passwords or sensitive info.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">📏</span>
              <div>
                <strong>Mind the size limit</strong>
                <p className="text-sm">localStorage has ~5-10MB limit. Use IndexedDB for larger data.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <strong>Provide default values</strong>
                <p className="text-sm">Always set sensible defaults for first-time users.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">🎓 Next Steps</h3>
          <p className="mb-4">Master persistent signals? Try these:</p>
          <div className="flex flex-wrap gap-3">
            <a href="/demos/cart" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
              Persistent Cart →
            </a>
            <a href="/demos/form" className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">
              Draft Forms →
            </a>
            <a href="/demos/todo" className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition">
              Persistent Todos →
            </a>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}
