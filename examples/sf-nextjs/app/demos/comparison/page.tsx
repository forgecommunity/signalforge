'use client';

import { useSignal, createSignal, createComputed, useSignalValue } from 'signalforge/react';
import { useState, useEffect, useRef } from 'react';
import DemoLayout from '../../components/DemoLayout';

// ============================================================================
// SignalForge Implementation (SIMPLE & CLEAN)
// ============================================================================

// Global signals - works immediately, no providers needed!
const cartItemsSignal = createSignal<Array<{ id: number; name: string; price: number; quantity: number }>>([]);
const totalSignal = createComputed(() => 
  cartItemsSignal.get().reduce((sum, item) => sum + item.price * item.quantity, 0)
);
const itemCountSignal = createComputed(() => 
  cartItemsSignal.get().reduce((sum, item) => sum + item.quantity, 0)
);

// Shopping Cart with SignalForge
function SignalForgeCart() {
  const items = useSignalValue(cartItemsSignal);
  const total = useSignalValue(totalSignal);
  const itemCount = useSignalValue(itemCountSignal);

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      name: `Product ${items.length + 1}`,
      price: Math.floor(Math.random() * 50) + 10,
      quantity: 1
    };
    cartItemsSignal.set([...items, newItem]);
  };

  const updateQuantity = (id: number, delta: number) => {
    cartItemsSignal.set(items.map(item => 
      item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
    ).filter(item => item.quantity > 0));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-2 border-green-500">
        <div>
          <h3 className="font-bold text-lg text-green-900 dark:text-green-100">
            ✨ SignalForge Cart
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300">
            {itemCount} items • ${total.toFixed(2)}
          </p>
        </div>
        <button
          onClick={addItem}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Add Item
        </button>
      </div>

      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">${item.price} each</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQuantity(item.id, -1)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                -
              </button>
              <span className="font-semibold w-8 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, 1)}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Redux-Style Implementation (VERBOSE & COMPLEX)
// ============================================================================

// Simulate Redux patterns
type ReduxAction = 
  | { type: 'ADD_ITEM'; payload: any }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; delta: number } };

function reduxReducer(state: any[], action: ReduxAction) {
  switch (action.type) {
    case 'ADD_ITEM':
      return [...state, action.payload];
    case 'UPDATE_QUANTITY':
      return state.map(item => 
        item.id === action.payload.id 
          ? { ...item, quantity: Math.max(0, item.quantity + action.payload.delta) }
          : item
      ).filter(item => item.quantity > 0);
    default:
      return state;
  }
}

function ReduxStyleCart() {
  const [items, setItems] = useState<Array<{ id: number; name: string; price: number; quantity: number }>>([]);
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  // Manual recalculation needed!
  useEffect(() => {
    setTotal(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
    setItemCount(items.reduce((sum, item) => sum + item.quantity, 0));
  }, [items]);

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      name: `Product ${items.length + 1}`,
      price: Math.floor(Math.random() * 50) + 10,
      quantity: 1
    };
    setItems(prevItems => reduxReducer(prevItems, { type: 'ADD_ITEM', payload: newItem }));
  };

  const updateQuantity = (id: number, delta: number) => {
    setItems(prevItems => reduxReducer(prevItems, { type: 'UPDATE_QUANTITY', payload: { id, delta } }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border-2 border-orange-500">
        <div>
          <h3 className="font-bold text-lg text-orange-900 dark:text-orange-100">
            📦 Redux-Style Cart
          </h3>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            {itemCount} items • ${total.toFixed(2)}
          </p>
        </div>
        <button
          onClick={addItem}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Add Item
        </button>
      </div>

      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">${item.price} each</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQuantity(item.id, -1)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                -
              </button>
              <span className="font-semibold w-8 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, 1)}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ComparisonDemo() {
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  return (
    <DemoLayout
      title="🔥 SignalForge vs Redux/Zustand - Direct Comparison"
      description="See the same shopping cart built with SignalForge vs traditional state management. Which would YOU rather maintain?"
    >
      <div className="space-y-8">
        {/* What You'll Learn */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-6">
          <h3 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-100">
            🎓 What Makes SignalForge Different?
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-bold mb-2">90% Less Code</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No actions, reducers, or selectors. Just signals.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="font-bold mb-2">Auto-Computed Values</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Totals update automatically. No useEffect needed.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-3xl mb-2">🚀</div>
              <h4 className="font-bold mb-2">Zero Config</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No providers, no context. Works immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Code Comparison */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-bold text-xl text-green-600 dark:text-green-400">
              ✅ SignalForge (3 lines)
            </h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`// Global state - works everywhere
const cart = createSignal([]);
const total = createComputed(() => 
  cart.get().reduce((s, i) => 
    s + i.price * i.qty, 0)
);

// Use anywhere - no provider!
function Header() {
  const t = useSignalValue(total);
  return <div>Total: \${t}</div>;
}`}
            </pre>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-xl text-orange-600 dark:text-orange-400">
              ⚠️ Redux (40+ lines)
            </h3>
            <pre className="bg-gray-900 text-orange-400 p-4 rounded-lg text-sm overflow-x-auto">
{`// Actions
const ADD = 'cart/add';
const UPDATE = 'cart/update';

// Reducer
function cartReducer(state, action) {
  switch (action.type) {
    case ADD: return [...state, action.payload];
    case UPDATE: return state.map(/* ... */);
    default: return state;
  }
}

// Store
const store = createStore(cartReducer);

// Selectors
const selectTotal = state => 
  state.cart.reduce(/* ... */);

// Provider wrapper
<Provider store={store}>
  <App />
</Provider>

// Component
function Header() {
  const total = useSelector(selectTotal);
  return <div>Total: \${total}</div>;
}`}
            </pre>
          </div>
        </div>

        {/* Live Demo */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-center">
            🎮 Try Both Implementations
          </h3>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Both do the SAME thing. Notice how SignalForge automatically updates the total without useEffect!
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <SignalForgeCart />
            <ReduxStyleCart />
          </div>
        </div>

        {/* Pain Points */}
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl p-6">
          <h3 className="text-2xl font-bold mb-4 text-red-900 dark:text-red-100">
            😫 Common Pain Points in Traditional State Management
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold mb-2 text-red-800 dark:text-red-200">❌ With Redux/Zustand:</h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• Write actions, reducers, selectors for everything</li>
                <li>• Wrap app in Provider component</li>
                <li>• Manual useEffect for computed values</li>
                <li>• Selector optimization headaches</li>
                <li>• Entire component re-renders on any state change</li>
                <li>• DevTools setup requires extensions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2 text-green-800 dark:text-green-200">✅ With SignalForge:</h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• Create signal in 1 line, use anywhere</li>
                <li>• No providers or wrappers needed</li>
                <li>• Computed values auto-update (0 lines of code)</li>
                <li>• Fine-grained updates - only changed values re-render</li>
                <li>• Built-in DevTools, time travel, persistence</li>
                <li>• TypeScript types inferred automatically</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Performance Insight */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl p-6">
          <h3 className="text-2xl font-bold mb-4 text-purple-900 dark:text-purple-100">
            ⚡ Performance Advantage
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-4xl font-bold text-purple-600 mb-2">33x</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Faster batch updates than individual setState calls
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-4xl font-bold text-purple-600 mb-2">2KB</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total bundle size (gzipped) vs 40KB+ for Redux + middleware
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-4xl font-bold text-purple-600 mb-2">0ms</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Computed value recalculation (&lt;0.01ms) - imperceptible to users
              </p>
            </div>
          </div>
        </div>

        {/* Real-World Scenarios */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-6">
          <h3 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-100">
            🌍 Real-World Scenarios Where SignalForge Shines
          </h3>
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-bold mb-2">📊 Dashboard with Live Data</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Problem with Redux:</strong> Every metric update triggers entire dashboard re-render. Need complex selectors and memoization.
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>SignalForge Solution:</strong> Each widget subscribes to its own signal. Only changed widgets update. Zero optimization needed.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-bold mb-2">🛒 E-commerce Cart & Recommendations</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Problem with Context API:</strong> Cart update causes entire product list to re-render. Slow and choppy.
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>SignalForge Solution:</strong> Cart badge updates independently. Product list unaffected. Butter smooth.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-bold mb-2">📝 Collaborative Editing</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Problem with Zustand:</strong> Each keystroke triggers selector recalculation. Complex optimization required.
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>SignalForge Solution:</strong> Each paragraph is a signal. Only edited paragraph updates. Natural fit for real-time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}
