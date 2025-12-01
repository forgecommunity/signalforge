'use client';

import { createSignal } from 'signalforge/core';
import { useState } from 'react';
import DemoLayout from '../../components/DemoLayout';

export default function TimeTravelDemo() {
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState<number[]>([0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [signal] = useState(() => createSignal(0));

  const addToHistory = (value: number) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(value);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
    setCount(value);
  };

  const increment = () => {
    const newValue = signal.get() + 1;
    signal.set(newValue);
    addToHistory(newValue);
  };
  
  const decrement = () => {
    const newValue = signal.get() - 1;
    signal.set(newValue);
    addToHistory(newValue);
  };
  
  const reset = () => {
    signal.set(0);
    addToHistory(0);
  };

  const undo = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const value = history[newIndex];
      signal.set(value);
      setCurrentIndex(newIndex);
      setCount(value);
    }
  };

  const redo = () => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      const value = history[newIndex];
      signal.set(value);
      setCurrentIndex(newIndex);
      setCount(value);
    }
  };

  const jumpTo = (index: number) => {
    if (index >= 0 && index < history.length) {
      const value = history[index];
      signal.set(value);
      setCurrentIndex(index);
      setCount(value);
    }
  };

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return (
    <DemoLayout
      title="⏱️ Time Travel - Undo/Redo Made Easy"
      description="Undo/redo functionality with history tracking using TimeTravelPlugin"
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
              <span>Implement undo/redo functionality easily</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Track signal history automatically</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Navigate through state timeline (jump to any point)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Build powerful debugging and user-facing features</span>
            </li>
          </ul>
        </div>

        {/* Interactive Demo Title */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🎮 Try It: Time Travel Controls
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Make changes, then undo/redo or jump to any point in history!
          </p>
        </div>

        {/* Current State */}
        <div className="text-center p-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 rounded-xl">
          <div className="text-7xl font-bold text-purple-600 dark:text-purple-400 mb-4">
            {count}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Current Value (History: {history.length} states)
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={decrement}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
          >
            -1
          </button>
          <button
            onClick={reset}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
          >
            Reset
          </button>
          <button
            onClick={increment}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            +1
          </button>
        </div>

        {/* Time Travel Controls */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
              canUndo
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span className="text-2xl">⏮️</span>
            <span>Undo</span>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
              canRedo
                ? 'bg-purple-500 text-white hover:bg-purple-600'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>Redo</span>
            <span className="text-2xl">⏭️</span>
          </button>
        </div>

        {/* History Timeline */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>📜</span>
            History Timeline
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                No history yet. Make some changes!
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((value, index) => (
                  <div
                    key={index}
                    onClick={() => jumpTo(index)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      index === currentIndex
                        ? 'bg-purple-500 text-white shadow-lg scale-105'
                        : 'bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold">
                          {value}
                        </span>
                        <span className="text-xs opacity-75">
                          State #{index}
                        </span>
                      </div>
                      <span className="text-xs opacity-75">
                        {index === currentIndex ? '← Current' : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 How It Works
          </h3>
          <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>Every signal change is recorded in history</li>
            <li>Click Undo/Redo to navigate through states</li>
            <li>Click any history entry to jump to that state</li>
            <li>Perfect for debugging and user-facing undo/redo features</li>
          </ul>
        </div>

        {/* Code Example */}
        <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
          <pre className="text-green-400 text-sm">
{`import { createSignal } from 'signalforge/core';
import { TimeTravelPlugin } from 'signalforge/plugins';

const count = createSignal(0);
const timeTravel = new TimeTravelPlugin();

// Track signal changes
timeTravel.trackSignal(count, 'counter');

// Make changes
count.set(1);
count.set(2);
count.set(3);

// Time travel!
timeTravel.undo('counter');  // back to 2
timeTravel.undo('counter');  // back to 1
timeTravel.redo('counter');  // forward to 2

// Jump to specific state
timeTravel.jumpTo('counter', 0);  // back to initial state

// Check history
const history = timeTravel.getHistory('counter');
console.log(history); // [{ value: 0, timestamp: ... }, ...]`}
          </pre>
        </div>

        {/* Real World Use Cases */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-green-900 dark:text-green-100">
            🌍 Real-World Use Cases
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-blue-600 mb-1">✏️ Text Editors</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Undo/redo for document editing
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-purple-600 mb-1">🎨 Drawing Apps</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Revert drawing actions step by step
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-green-600 mb-1">📋 Form Wizards</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Navigate back through multi-step forms
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-orange-600 mb-1">🐛 Debugging</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Replay state changes to find bugs
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
              <span className="text-2xl">📏</span>
              <div>
                <strong>Limit history size</strong>
                <p className="text-sm">Keep last 50-100 states to avoid memory issues.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">💾</span>
              <div>
                <strong>Store snapshots, not references</strong>
                <p className="text-sm">Deep clone objects to prevent accidental mutations.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">⏱️</span>
              <div>
                <strong>Consider using TimeTravelPlugin</strong>
                <p className="text-sm">Built-in plugin for automatic undo/redo support.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <strong>Batch operations</strong>
                <p className="text-sm">Group multiple changes into one history entry.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">🎓 Next Steps</h3>
          <p className="mb-4">Master time travel? Try these demos:</p>
          <div className="flex flex-wrap gap-3">
            <a href="/demos/todo" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
              Todo with Undo →
            </a>
            <a href="/demos/persistent" className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">
              Persistent State →
            </a>
            <a href="/demos/devtools" className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition">
              DevTools →
            </a>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}
