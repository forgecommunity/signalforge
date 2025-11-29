'use client';

import Link from 'next/link';

export default function Home() {
  const demos = [
    { id: 'basic', name: 'Basic Signal', description: 'Simple counter with get/set' },
    { id: 'computed', name: 'Computed Signal', description: 'Auto-calculating values' },
    { id: 'effects', name: 'Effects', description: 'Side effects and cleanup' },
    { id: 'batch', name: 'Batch Updates', description: 'Efficient multi-updates' },
    { id: 'subscribe', name: 'Subscribe', description: 'Listen to signal changes' },
    { id: 'untrack', name: 'Untrack', description: 'Read without dependencies' },
    { id: 'hooks', name: 'React Hooks', description: 'useSignal, useSignalValue, useSignalEffect' },
    { id: 'cart', name: 'Shopping Cart', description: 'Real-world example' },
    { id: 'form', name: 'Form Validation', description: 'Dynamic form with validation' },
    { id: 'todo', name: 'Todo App', description: 'Complete CRUD app' },
    { id: 'array', name: 'Array Signal', description: 'Array utilities' },
    { id: 'persistent', name: 'Persistent Signal', description: 'Auto-save to localStorage' },
    { id: 'bigdata', name: 'Big Data', description: 'Performance with 10k items' },
    { id: 'devtools', name: 'DevTools', description: 'Signal inspector' },
    { id: 'timetravel', name: 'Time Travel', description: 'Undo/Redo functionality' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            ⚡ SignalForge Next.js Demo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            The Easiest and Fastest State Management Library
          </p>
          <p className="text-md text-gray-500 dark:text-gray-400">
            Interactive examples showcasing SignalForge features in Next.js
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <a
              href="https://www.npmjs.com/package/signalforge-alpha"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📦 npm Package
            </a>
            <a
              href="https://github.com/forgecommunity/signalforge"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              🔗 GitHub
            </a>
          </div>
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {demos.map((demo) => (
            <Link
              key={demo.id}
              href={`/demos/${demo.id}`}
              className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {demo.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {demo.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-600 dark:text-gray-400">
          <p className="mb-2">
            Built by{' '}
            <a
              href="https://github.com/forgecommunity"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ForgeCommunity
            </a>
          </p>
          <p className="text-sm">
            ✅ Super Easy • ⚡ 100x Faster • 🪶 Only 2KB • 🌍 Works Everywhere
          </p>
        </div>
      </div>
    </div>
  );
}
