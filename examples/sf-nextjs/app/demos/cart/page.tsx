'use client';

import { createSignal } from 'signalforge/core';
import { useSignalValue } from 'signalforge/react';
import { createComputed } from 'signalforge/core';
import { useState } from 'react';
import DemoLayout from '../../components/DemoLayout';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Laptop', price: 999, image: '💻' },
  { id: 2, name: 'Phone', price: 699, image: '📱' },
  { id: 3, name: 'Headphones', price: 199, image: '🎧' },
  { id: 4, name: 'Watch', price: 399, image: '⌚' },
  { id: 5, name: 'Keyboard', price: 149, image: '⌨️' },
  { id: 6, name: 'Mouse', price: 79, image: '🖱️' },
];

export default function ShoppingCartDemo() {
  const [cartSignal] = useState(() => createSignal<CartItem[]>([]));  
  const cart = useSignalValue(cartSignal);
  
  const [totalItems] = useState(() => createComputed(() => 
    cartSignal.get().reduce((sum: number, item: CartItem) => sum + item.quantity, 0)
  ));
  
  const [totalPrice] = useState(() => createComputed(() => 
    cartSignal.get().reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0)
  ));
  
  const totalItemsValue = useSignalValue(totalItems);
  const totalPriceValue = useSignalValue(totalPrice);

  const addToCart = (product: Product) => {
    const currentCart = cartSignal.get();
    const existing = currentCart.find((item: CartItem) => item.id === product.id);
    if (existing) {
      cartSignal.set(currentCart.map((item: CartItem) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      cartSignal.set([...currentCart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, delta: number) => {
    const currentCart = cartSignal.get();
    cartSignal.set(currentCart
      .map((item: CartItem) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
      .filter((item: CartItem) => item.quantity > 0));
  };

  const removeItem = (id: number) => {
    cartSignal.set(cartSignal.get().filter((item: CartItem) => item.id !== id));
  };

  const clearCart = () => {
    cartSignal.set([]);
  };

  return (
    <DemoLayout
      title="🛒 Shopping Cart - Real E-Commerce Example"
      description="Build a complete shopping cart with add/remove, quantities, and auto-calculating totals!"
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
              <span>Build a real e-commerce shopping cart from scratch</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Manage cart items with add/remove/update operations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Auto-calculate totals with computed signals</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Handle quantities, pricing, and cart state management</span>
            </li>
          </ul>
        </div>

        {/* Interactive Demo Title */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🎮 Try It: Add Products to Cart
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Click products to add them, adjust quantities - watch totals update automatically!
          </p>
        </div>

        {/* Cart Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {totalItemsValue}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Items in Cart</div>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              ${totalPriceValue}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Price</div>
          </div>
          <div className="flex items-center justify-center">
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                cart.length === 0
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Products
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PRODUCTS.map(product => (
              <div
                key={product.id}
                className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="text-5xl mb-2 text-center">{product.image}</div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-center mb-1">
                  {product.name}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-3">
                  ${product.price}
                </p>
                <button
                  onClick={() => addToCart(product)}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Items */}
        {cart.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Shopping Cart
            </h3>
            <div className="space-y-3">
              {cart.map((item: CartItem) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="text-3xl">{item.image}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      ${item.price} × {item.quantity} = ${item.price * item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-750 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-purple-900 dark:text-purple-100">
            🚀 How It Works
          </h3>
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="font-bold text-blue-600 dark:text-blue-400 mb-2">Cart State</div>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded block">
                const cart = createSignal&lt;CartItem[]&gt;([]);
              </code>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Single signal holds all cart items
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-l-4 border-green-500">
              <div className="font-bold text-green-600 dark:text-green-400 mb-2">Auto-Computed Totals</div>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded block">
                const totalPrice = createComputed(() =&gt; <br/>
                &nbsp;&nbsp;cart.get().reduce((sum, item) =&gt; <br/>
                &nbsp;&nbsp;&nbsp;&nbsp;sum + item.price * item.quantity, 0)<br/>
                );
              </code>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Totals recalculate automatically when cart changes
              </p>
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
{`import { createSignal, createComputed } from 'signalforge/core';
import { useSignalValue } from 'signalforge/react';
import { useState } from 'react';

function ShoppingCart() {
  const [cart] = useState(() => createSignal<CartItem[]>([]));
  
  // Computed totals - auto-update!
  const [totalItems] = useState(() => createComputed(() => 
    cart.get().reduce((sum, item) => sum + item.quantity, 0)
  ));
  
  const [totalPrice] = useState(() => createComputed(() => 
    cart.get().reduce((sum, item) => 
      sum + item.price * item.quantity, 0
    )
  ));
  
  const totalItemsValue = useSignalValue(totalItems);
  const totalPriceValue = useSignalValue(totalPrice);
  
  // Add item to cart
  const addToCart = (product) => {
    const existing = cart.get().find(i => i.id === product.id);
    if (existing) {
      // Increment quantity
      cart.set(cart.get().map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      // Add new item
      cart.set([...cart.get(), { ...product, quantity: 1 }]);
    }
  };
  
  // Update quantity
  const updateQuantity = (id, delta) => {
    cart.set(cart.get()
      .map(item => item.id === id
        ? { ...item, quantity: item.quantity + delta }
        : item
      )
      .filter(item => item.quantity > 0)
    );
  };
  
  return (
    <div>
      <h2>Cart ({totalItemsValue} items)</h2>
      <h2>Total: ${totalPriceValue}</h2>
      {/* Cart items */}
    </div>
  );
}`}
            </pre>
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
                <strong>Use computed for calculations</strong>
                <p className="text-sm">Let SignalForge handle totals automatically.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <strong>Validate quantities</strong>
                <p className="text-sm">Filter out items with quantity &lt;= 0.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">💾</span>
              <div>
                <strong>Consider persistence</strong>
                <p className="text-sm">Save cart to localStorage for better UX.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">🎓 Next Steps</h3>
          <p className="mb-4">Master shopping carts? Try these:</p>
          <div className="flex flex-wrap gap-3">
            <a href="/demos/persistent" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
              Persistent Cart →
            </a>
            <a href="/demos/todo" className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">
              Todo App →
            </a>
            <a href="/demos/array" className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition">
              Array Signals →
            </a>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}
