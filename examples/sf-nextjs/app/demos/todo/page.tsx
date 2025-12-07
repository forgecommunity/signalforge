'use client';

import { useSignal, createComputed, useSignalValue } from 'signalforge/react';
import { useState } from 'react';
import DemoLayout from '../../components/DemoLayout';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function TodoAppDemo() {
  const [todos, setTodos] = useSignal<Todo[]>([]);
  const [inputText, setInputText] = useSignal('');
  const [filter, setFilter] = useSignal<'all' | 'active' | 'completed'>('all');

  const [filteredTodos] = useState(() => createComputed(() => {
    switch (filter) {
      case 'active':
        return todos.filter((todo: Todo) => !todo.completed);
      case 'completed':
        return todos.filter((todo: Todo) => todo.completed);
      default:
        return todos;
    }
  }));

  const [stats] = useState(() => createComputed(() => ({
    total: todos.length,
    active: todos.filter((t: Todo) => !t.completed).length,
    completed: todos.filter((t: Todo) => t.completed).length,
  })));
  
  const filteredTodosValue = useSignalValue(filteredTodos);
  const statsValue = useSignalValue(stats);

  const addTodo = () => {
    const text = inputText.trim();
    if (!text) return;
    
    setTodos([
      ...todos,
      { id: Date.now(), text, completed: false }
    ]);
    setInputText('');
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map((todo: Todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo: Todo) => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter((todo: Todo) => !todo.completed));
  };

  return (
    <DemoLayout
      title="✅ Todo App - Complete CRUD Example"
      description="Complete CRUD todo list application with filters"
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
              <span>Build a complete CRUD application (Create, Read, Update, Delete)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Implement filtering with computed signals (all/active/completed)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Calculate statistics automatically as data changes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Manage complex list state with reactive signals</span>
            </li>
          </ul>
        </div>

        {/* Interactive Demo Title */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🎮 Try It: Your Todo List
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Add todos, mark them complete, filter them - watch stats update automatically!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {statsValue.total}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total</div>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg text-center">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {statsValue.active}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Active</div>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {statsValue.completed}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Done</div>
          </div>
        </div>

        {/* Add Todo */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="What needs to be done?"
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={addTodo}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
          >
            Add
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 justify-center">
          {(['all', 'active', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Todo List */}
        <div className="space-y-2">
          {filteredTodosValue.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {filter === 'all' ? 'No todos yet. Add one above!' :
               filter === 'active' ? 'No active todos!' :
               'No completed todos!'}
            </div>
          ) : (
            filteredTodosValue.map((todo: Todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span
                  className={`flex-1 ${
                    todo.completed
                      ? 'line-through text-gray-500 dark:text-gray-400'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        {/* Clear Completed */}
        {statsValue.completed > 0 && (
          <button
            onClick={clearCompleted}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear Completed ({statsValue.completed})
          </button>
        )}

        {/* Code Example */}
        <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
          <pre className="text-green-400 text-sm">
{`import { useSignal, createComputed, useSignalValue } from 'signalforge/react';
import { useState } from 'react';

const [todos, setTodos] = useSignal<Todo[]>([]);
const [filter, setFilter] = useSignal<'all' | 'active' | 'completed'>('all');

// Computed filtered list
const [filteredTodos] = useState(() => createComputed(() => {
  switch (filter) {
    case 'active': return todos.filter(t => !t.completed);
    case 'completed': return todos.filter(t => t.completed);
    default: return todos;
  }
}));

// Add todo
const addTodo = (text: string) => {
  setTodos([...todos, { id: Date.now(), text, completed: false }]);
};`}
          </pre>
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
                <strong>Use unique IDs</strong>
                <p className="text-sm">Date.now() or UUID for reliable item tracking.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <strong>Computed filters</strong>
                <p className="text-sm">Filter lists with computed signals for efficiency.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <strong>Auto-compute stats</strong>
                <p className="text-sm">Let SignalForge calculate totals and counts.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">🎓 Next Steps</h3>
          <p className="mb-4">Master todo apps? Try these:</p>
          <div className="flex flex-wrap gap-3">
            <a href="/demos/persistent" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
              Persistent Todos →
            </a>
            <a href="/demos/timetravel" className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">
              Todo with Undo/Redo →
            </a>
            <a href="/demos/cart" className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition">
              Shopping Cart →
            </a>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}
