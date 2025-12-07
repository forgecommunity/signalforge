'use client';

import { createArraySignal } from 'signalforge/utils';
import { useState, useEffect } from 'react';
import DemoLayout from '../../components/DemoLayout';

export default function ArraySignalDemo() {
  const [items, setItems] = useState<number[]>([]);
  const [arraySignal] = useState(() => createArraySignal([1, 2, 3, 4, 5]));
  const [input, setInput] = useState('');

  useEffect(() => {
    const updateItems = () => setItems([...arraySignal.get()]);
    updateItems();
    const unsubscribe = arraySignal.subscribe(updateItems);
    return unsubscribe;
  }, [arraySignal]);

  return (
    <DemoLayout
      title="📋 Array Signals - Reactive Arrays"
      description="Work with arrays efficiently! Push, filter, map - all optimized for reactive programming."
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
              <span>Create reactive arrays with <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">createArraySignal()</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Use familiar array methods (push, pop, filter, map, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>All mutations automatically trigger updates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Build lists, tables, and collections easily</span>
            </li>
          </ul>
        </div>

        {/* Interactive Demo Title */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🎮 Try It: Interactive Array Playground
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Add items, filter, sort - all changes are reactive!
          </p>
        </div>
        {/* Array Display */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Array Contents ({items.length} items)
          </h3>
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Add Item */}
        <div className="flex gap-2">
          <input
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && input) {
                arraySignal.push(Number(input));
                setInput('');
              }
            }}
            placeholder="Enter a number"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={() => {
              if (input) {
                arraySignal.push(Number(input));
                setInput('');
              }
            }}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Push
          </button>
        </div>

        {/* Array Methods */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => arraySignal.pop()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Pop
          </button>
          <button
            onClick={() => arraySignal.filter((x) => x !== items[0])}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Remove First
          </button>
          <button
            onClick={() => arraySignal.remove(items[items.length - 1])}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Remove Last
          </button>
          <button
            onClick={() => arraySignal.filter((x) => x % 2 === 0)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Keep Evens
          </button>
          <button
            onClick={() => arraySignal.filter((x) => x > 3)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Keep {'>'}3
          </button>
          <button
            onClick={() => arraySignal.clear()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={() => {
              const found = arraySignal.find((x) => x > 3);
              if (found !== undefined) alert(`Found: ${found}`);
            }}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Find {'>'}3
          </button>
          <button
            onClick={() => arraySignal.set([1, 2, 3, 4, 5])}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Available Methods */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-750 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-purple-900 dark:text-purple-100">
            🛠️ Available Array Methods
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded p-4">
              <h4 className="font-semibold text-blue-600 mb-2">Mutating Methods (Trigger Updates)</h4>
              <ul className="text-sm space-y-1 font-mono">
                <li>• push(item) - Add to end</li>
                <li>• pop() - Remove from end</li>
                <li>• unshift(item) - Add to start</li>
                <li>• shift() - Remove from start</li>
                <li>• splice(index, count) - Remove/insert</li>
                <li>• remove(item) - Remove specific item</li>
                <li>• clear() - Remove all items</li>
                <li>• filter(fn) - Keep matching items</li>
                <li>• reverse() - Reverse order</li>
                <li>• sort(fn) - Sort items</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-4">
              <h4 className="font-semibold text-green-600 mb-2">Read-Only Methods</h4>
              <ul className="text-sm space-y-1 font-mono">
                <li>• map(fn) - Transform items</li>
                <li>• find(fn) - Find first match</li>
                <li>• findIndex(fn) - Find index</li>
                <li>• some(fn) - Check if any match</li>
                <li>• every(fn) - Check if all match</li>
                <li>• includes(item) - Check existence</li>
                <li>• indexOf(item) - Get index</li>
                <li>• length - Get count</li>
                <li>• get() - Get raw array</li>
                <li>• subscribe(fn) - Watch changes</li>
              </ul>
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
{`import { createArraySignal } from 'signalforge/utils';

// Create reactive array
const todos = createArraySignal([
  { id: 1, text: 'Learn SignalForge', done: false },
  { id: 2, text: 'Build amazing app', done: false }
]);

// Subscribe to changes
todos.subscribe(() => {
  console.log('Todos updated:', todos.get());
});

// Add items
todos.push({ id: 3, text: 'Deploy to production', done: false });
// Triggers subscriber!

// Remove items
todos.remove(todos.find(t => t.id === 2));
// Triggers subscriber!

// Filter items
todos.filter(t => !t.done);
// Triggers subscriber!

// Map (read-only, doesn't trigger)
const texts = todos.map(t => t.text);

// Use in React
function TodoList() {
  const [items, setItems] = useState([]);
  
  useEffect(() => {
    const updateItems = () => setItems([...todos.get()]);
    updateItems();
    return todos.subscribe(updateItems);
  }, []);
  
  return (
    <ul>
      {items.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}`}
            </pre>
          </div>
        </div>

        {/* Real World Use Cases */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-green-900 dark:text-green-100">
            🌍 Real-World Use Cases
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-blue-600 mb-1">✅ Todo Lists</div>
              <code className="text-xs block">
                const todos = createArraySignal([]);<br/>
                todos.push(newTodo);<br/>
                todos.remove(completedTodo);
              </code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-purple-600 mb-1">🛒 Shopping Cart</div>
              <code className="text-xs block">
                const cart = createArraySignal([]);<br/>
                cart.push(product);<br/>
                const total = cart.map(i =&gt; i.price);
              </code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-green-600 mb-1">💬 Chat Messages</div>
              <code className="text-xs block">
                const messages = createArraySignal([]);<br/>
                messages.push(newMessage);<br/>
                messages.filter(m =&gt; !m.deleted);
              </code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-orange-600 mb-1">📊 Data Tables</div>
              <code className="text-xs block">
                const rows = createArraySignal([]);<br/>
                rows.sort((a, b) =&gt; a.name - b.name);<br/>
                rows.filter(r =&gt; r.active);
              </code>
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
              <span className="text-2xl">✅</span>
              <div>
                <strong>Use for collections and lists</strong>
                <p className="text-sm">Perfect for todos, cart items, messages, table rows, etc.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <strong>Mutations are optimized</strong>
                <p className="text-sm">Methods like push, filter, sort are optimized to only update what changed.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <strong>Familiar API</strong>
                <p className="text-sm">If you know JavaScript arrays, you already know how to use array signals!</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🔄</span>
              <div>
                <strong>Automatic updates</strong>
                <p className="text-sm">Every mutation triggers subscribers - no manual notify() calls needed.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">🎓 Next Steps</h3>
          <p className="mb-4">Master array signals? Build something real:</p>
          <div className="flex flex-wrap gap-3">
            <a href="/demos/todo" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
              Todo App →
            </a>
            <a href="/demos/cart" className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">
              Shopping Cart →
            </a>
            <a href="/demos/bigdata" className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition">
              Big Data →
            </a>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}
