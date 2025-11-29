'use client';

import { createSignal } from 'signalforge-alpha/core';
import { useSignalValue } from 'signalforge-alpha/react';
import { createComputed } from 'signalforge-alpha/core';
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
      title="Shopping Cart"
      description="Real-world e-commerce example with reactive cart management"
    >
      <div className="space-y-6">
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

        {/* Code Example */}
        <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
          <pre className="text-green-400 text-sm">
{`import { useSignal, useComputed } from 'signalforge-alpha/react';

const cart = useSignal<CartItem[]>([]);

// Computed values auto-update
const totalItems = useComputed(() => 
  cart.value.reduce((sum, item) => sum + item.quantity, 0)
);

const totalPrice = useComputed(() => 
  cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

// Add to cart
const addToCart = (product) => {
  cart.value = [...cart.value, { ...product, quantity: 1 }];
};`}
          </pre>
        </div>
      </div>
    </DemoLayout>
  );
}
