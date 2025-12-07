'use client';

import { createSignal, createComputed, useSignalValue, batch } from 'signalforge/react';
import { useState } from 'react';
import DemoLayout from '../../components/DemoLayout';

// ============================================================================
// Complex E-Commerce Pricing System with Nested Computations
// ============================================================================

// Base signals (user inputs)
const basePrice = createSignal(100);
const quantity = createSignal(1);
const discountPercent = createSignal(0);
const taxRate = createSignal(10); // percentage
const shippingWeight = createSignal(1); // kg
const isPremiumMember = createSignal(false);
const couponCode = createSignal('');

// Level 1: Basic calculations
const subtotal = createComputed(() => basePrice.get() * quantity.get());

const discountAmount = createComputed(() => {
  const sub = subtotal.get();
  const discount = discountPercent.get();
  return sub * (discount / 100);
});

const afterDiscount = createComputed(() => {
  return subtotal.get() - discountAmount.get();
});

// Level 2: Shipping logic (depends on weight, quantity, premium status)
const shippingCost = createComputed(() => {
  const weight = shippingWeight.get() * quantity.get();
  const premium = isPremiumMember.get();
  
  if (premium) return 0; // Free shipping for premium members
  if (weight < 2) return 5;
  if (weight < 5) return 10;
  return 15;
});

// Level 3: Coupon logic (depends on afterDiscount and couponCode)
const couponDiscount = createComputed(() => {
  const code = couponCode.get().toUpperCase();
  const price = afterDiscount.get();
  
  if (code === 'SAVE10') return price * 0.1;
  if (code === 'SAVE20') return price * 0.2;
  if (code === 'WELCOME') return Math.min(20, price * 0.15);
  return 0;
});

const afterCoupon = createComputed(() => {
  return afterDiscount.get() - couponDiscount.get();
});

// Level 4: Tax calculation (depends on afterCoupon + shipping)
const taxableAmount = createComputed(() => {
  return afterCoupon.get() + shippingCost.get();
});

const taxAmount = createComputed(() => {
  return taxableAmount.get() * (taxRate.get() / 100);
});

// Level 5: Final total (top of the dependency tree)
const finalTotal = createComputed(() => {
  return taxableAmount.get() + taxAmount.get();
});

// Savings summary
const totalSavings = createComputed(() => {
  const memberSavings = isPremiumMember.get() ? shippingCost.get() : 0;
  return discountAmount.get() + couponDiscount.get() + memberSavings;
});

// Dependency tree visualization helper
const dependencyTree = [
  { level: 0, name: 'Base Inputs', items: ['basePrice', 'quantity', 'discountPercent', 'taxRate', 'shippingWeight', 'isPremiumMember', 'couponCode'] },
  { level: 1, name: 'Basic Calculations', items: ['subtotal', 'discountAmount', 'afterDiscount'] },
  { level: 2, name: 'Shipping Logic', items: ['shippingCost'] },
  { level: 3, name: 'Coupon Logic', items: ['couponDiscount', 'afterCoupon'] },
  { level: 4, name: 'Tax Calculation', items: ['taxableAmount', 'taxAmount'] },
  { level: 5, name: 'Final Result', items: ['finalTotal', 'totalSavings'] },
];

export default function ComputedChainsDemo() {
  // Use hooks to subscribe to computed values
  const subtotalValue = useSignalValue(subtotal);
  const discountAmountValue = useSignalValue(discountAmount);
  const afterDiscountValue = useSignalValue(afterDiscount);
  const shippingCostValue = useSignalValue(shippingCost);
  const couponDiscountValue = useSignalValue(couponDiscount);
  const afterCouponValue = useSignalValue(afterCoupon);
  const taxAmountValue = useSignalValue(taxAmount);
  const finalTotalValue = useSignalValue(finalTotal);
  const totalSavingsValue = useSignalValue(totalSavings);

  const [couponInput, setCouponInput] = useState('');

  const applyRandomScenario = () => {
    batch(() => {
      const scenarios = [
        { basePrice: 50, qty: 2, discount: 10, premium: false, coupon: '' },
        { basePrice: 200, qty: 1, discount: 25, premium: true, coupon: 'SAVE20' },
        { basePrice: 80, qty: 5, discount: 15, premium: false, coupon: 'WELCOME' },
        { basePrice: 150, qty: 3, discount: 0, premium: true, coupon: 'SAVE10' },
      ];
      
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      
      basePrice.set(scenario.basePrice);
      quantity.set(scenario.qty);
      discountPercent.set(scenario.discount);
      isPremiumMember.set(scenario.premium);
      couponCode.set(scenario.coupon);
      setCouponInput(scenario.coupon);
    });
  };

  return (
    <DemoLayout
      title="🛍️ Smart Shopping Cart - Auto-Calculating Prices"
      description="Change the price, add a coupon, or adjust quantity - everything updates automatically! No manual calculations needed."
    >
      <div className="space-y-8">
        {/* WHAT IS THIS? */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-300 dark:border-blue-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-2xl">❓</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-blue-900 dark:text-blue-100">
                What Is This Demo Showing?
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-3">
                This is like a <strong>real online shopping cart</strong>! When you shop on Amazon, changing one thing (like quantity) automatically updates:
              </p>
              <ul className="space-y-1 text-gray-700 dark:text-gray-300 ml-6">
                <li>• Subtotal (price × quantity)</li>
                <li>• Discounts (if you have a sale)</li>
                <li>• Shipping costs (based on weight)</li>
                <li>• Taxes (based on your location)</li>
                <li>• Final total (everything combined)</li>
              </ul>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
            <p className="text-gray-700 dark:text-gray-300">
              🎯 <strong>Try it:</strong> Move any slider below and watch all the prices update instantly!
              SignalForge automatically knows what needs to recalculate.
            </p>
          </div>
        </div>

        {/* WHY USE THIS? */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-300 dark:border-green-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-green-900 dark:text-green-100">
                Why Is This Amazing?
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Imagine coding this manually - you'd need to write code to recalculate <strong>everything</strong> whenever <strong>anything</strong> changes!
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-red-500">
              <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">😰 Without SignalForge (Manual Way)</h4>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>📝 You change the quantity</p>
                <p>⚒️ You manually recalculate subtotal</p>
                <p>⚒️ You manually recalculate discount</p>
                <p>⚒️ You manually recalculate shipping</p>
                <p>⚒️ You manually recalculate tax</p>
                <p>⚒️ You manually recalculate total</p>
                <p className="text-red-600 dark:text-red-400 font-bold mt-3">
                  😫 For 12 calculations: ~200 lines of code!
                </p>
                <p className="text-xs mt-2">It's like doing your taxes by hand with a calculator! 🧑‍💻</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
              <h4 className="font-bold text-green-600 dark:text-green-400 mb-2">✅ With SignalForge (Smart Way)</h4>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>📝 You change the quantity</p>
                <p className="text-green-600 dark:text-green-400 font-bold">✨ Everything updates automatically!</p>
                <p className="text-xs mt-2">SignalForge tracks what depends on what, and only recalculates what changed.</p>
                <pre className="bg-gray-900 text-green-400 p-2 rounded mt-2 text-xs overflow-x-auto">
{`const subtotal = createComputed(() => 
  price.get() * quantity.get()
);
// Done! Subtotal auto-updates! 🎉`}</pre>
                <p className="text-green-600 dark:text-green-400 font-bold mt-3">
                  🚀 For 12 calculations: ~50 lines of code!
                </p>
                <p className="text-xs mt-2">Like having a personal accountant! 🧾</p>
              </div>
            </div>
          </div>
        </div>

        {/* HOW DOES IT WORK? */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-300 dark:border-purple-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-2xl">🔧</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-purple-900 dark:text-purple-100">
                How Does It Work? (3 Simple Steps!)
              </h3>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100">Create base signals (user inputs)</h4>
              </div>
              <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-xs overflow-x-auto">
{`const price = createSignal(100);      // Base price
const quantity = createSignal(1);     // How many items
const discount = createSignal(10);    // Discount %`}</pre>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">These are like the input fields in a form! 📝</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100">Create computed values (automatic calculations)</h4>
              </div>
              <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-xs overflow-x-auto">
{`const subtotal = createComputed(() => 
  price.get() * quantity.get()
);

const total = createComputed(() => 
  subtotal.get() - (subtotal.get() * discount.get() / 100)
);`}</pre>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">These auto-update when inputs change! No manual work! ✨</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100">Use them in your UI</h4>
              </div>
              <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-xs overflow-x-auto">
{`function Cart() {
  const totalValue = useSignalValue(total);
  return <div>Total: \${totalValue}</div>;
  // Updates automatically when anything changes! 🎉
}`}</pre>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">SignalForge handles all the math - you just display it! 📊</p>
            </div>
          </div>
        </div>

        {/* TRY IT YOURSELF */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/30 dark:to-yellow-900/30 border-2 border-orange-400 dark:border-orange-600 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100">🎮 Play With The Shopping Cart!</h3>
            <button
              onClick={applyRandomScenario}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold shadow-md"
            >
              🎲 Try Random Example!
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Base Price */}
            <div>
              <label className="block text-sm font-medium mb-2">
                💰 Base Price: ${basePrice.get()}
              </label>
              <input
                type="range"
                min="10"
                max="500"
                value={basePrice.get()}
                onChange={(e) => basePrice.set(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium mb-2">
                📦 Quantity: {quantity.get()}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={quantity.get()}
                onChange={(e) => quantity.set(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Discount */}
            <div>
              <label className="block text-sm font-medium mb-2">
                🏷️ Discount: {discountPercent.get()}%
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={discountPercent.get()}
                onChange={(e) => discountPercent.set(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Tax Rate */}
            <div>
              <label className="block text-sm font-medium mb-2">
                📊 Tax Rate: {taxRate.get()}%
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={taxRate.get()}
                onChange={(e) => taxRate.set(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Shipping Weight */}
            <div>
              <label className="block text-sm font-medium mb-2">
                ⚖️ Weight/Item: {shippingWeight.get()}kg
              </label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={shippingWeight.get()}
                onChange={(e) => shippingWeight.set(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Premium Member */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPremiumMember.get()}
                  onChange={(e) => isPremiumMember.set(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="font-medium">⭐ Premium Member (Free Shipping)</span>
              </label>
            </div>
          </div>

          {/* Coupon Code */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              🎟️ Coupon Code (try SAVE10, SAVE20, WELCOME)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
              <button
                onClick={() => couponCode.set(couponInput)}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Calculation Breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Step-by-step breakdown */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold mb-4">📊 How Your Total Is Calculated (Step-by-Step)</h3>
            
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Base Price × Quantity</p>
              <p className="text-2xl font-bold">${subtotalValue.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Level 1: subtotal</p>
            </div>

            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">- Discount ({discountPercent.get()}%)</p>
              <p className="text-2xl font-bold text-red-600">-${discountAmountValue.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Level 1: discountAmount</p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">After Discount</p>
              <p className="text-2xl font-bold">${afterDiscountValue.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Level 1: afterDiscount</p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">+ Shipping {isPremiumMember.get() && '(FREE for Premium!)'}</p>
              <p className="text-2xl font-bold">${shippingCostValue.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Level 2: shippingCost</p>
            </div>

            {couponDiscountValue > 0 && (
              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">- Coupon "{couponCode.get()}"</p>
                <p className="text-2xl font-bold text-green-600">-${couponDiscountValue.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Level 3: couponDiscount</p>
              </div>
            )}

            <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">+ Tax ({taxRate.get()}%)</p>
              <p className="text-2xl font-bold">${taxAmountValue.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Level 4: taxAmount</p>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-lg">
              <p className="text-sm">Final Total</p>
              <p className="text-4xl font-bold">${finalTotalValue.toFixed(2)}</p>
              <p className="text-xs opacity-80">Level 5: finalTotal</p>
            </div>

            {totalSavingsValue > 0 && (
              <div className="bg-green-100 dark:bg-green-900/40 p-4 rounded-lg border-2 border-green-500">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Savings 🎉</p>
                <p className="text-3xl font-bold text-green-600">${totalSavingsValue.toFixed(2)}</p>
              </div>
            )}
          </div>

          {/* Right: Dependency visualization */}
          <div>
            <h3 className="text-xl font-bold mb-4">🌳 Dependency Tree</h3>
            <div className="space-y-4">
              {dependencyTree.map((level, idx) => (
                <div key={idx} className="relative">
                  <div className={`bg-gradient-to-r ${
                    level.level === 0 ? 'from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800' :
                    level.level === 5 ? 'from-green-100 to-green-200 dark:from-green-900 dark:to-green-800' :
                    'from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800'
                  } p-4 rounded-lg border-l-4 ${
                    level.level === 0 ? 'border-blue-500' :
                    level.level === 5 ? 'border-green-500' :
                    'border-purple-500'
                  }`}>
                    <p className="font-bold text-sm mb-2">
                      Level {level.level}: {level.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {level.items.map((item, i) => (
                        <span key={i} className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded font-mono">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  {idx < dependencyTree.length - 1 && (
                    <div className="flex justify-center my-2">
                      <div className="text-2xl text-gray-400">⬇️</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Code Comparison */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl p-6">
          <h3 className="text-2xl font-bold mb-4 text-red-900 dark:text-red-100">
            💀 The Redux Nightmare
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold mb-3">SignalForge (12 lines)</h4>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
{`// Define once, works everywhere
const subtotal = createComputed(() => 
  basePrice.get() * quantity.get()
);

const discountAmount = createComputed(() =>
  subtotal.get() * (discount.get() / 100)
);

const afterDiscount = createComputed(() =>
  subtotal.get() - discountAmount.get()
);

// ... 9 more like this
// Total: ~50 lines including all logic`}
              </pre>
            </div>
            <div>
              <h4 className="font-bold mb-3">Redux (100+ lines)</h4>
              <pre className="bg-gray-900 text-red-400 p-4 rounded-lg text-xs overflow-x-auto">
{`// Need reselect for memoization
import { createSelector } from 'reselect';

// Selector for each value
const selectBase = state => state.basePrice;
const selectQty = state => state.quantity;

// Memoized selector
const selectSubtotal = createSelector(
  [selectBase, selectQty],
  (base, qty) => base * qty
);

const selectDiscount = state => state.discount;
const selectDiscountAmount = createSelector(
  [selectSubtotal, selectDiscount],
  (sub, discount) => sub * (discount / 100)
);

// ... 50 more lines of selectors
// ... plus actions, reducers, types
// Total: ~200 lines for same logic`}
              </pre>
            </div>
          </div>
        </div>

        {/* Real-World Applications */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-6">
          <h3 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-100">
            🌍 Real-World Use Cases
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-bold mb-2">💼 Financial Calculators</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Loan payments, investment returns, tax calculations with 20+ interdependent formulas. 
                SignalForge handles the entire dependency tree automatically.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-bold mb-2">🎮 Game State</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Character stats → equipment bonuses → skill modifiers → final damage. 
                Change one item, everything updates instantly.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-bold mb-2">📊 Analytics Dashboards</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Raw data → filtered data → aggregations → visualizations. 
                Filter changes propagate through entire pipeline in microseconds.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-bold mb-2">🛒 Complex Pricing</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Volume discounts, member tiers, dynamic fees, currency conversion. 
                This demo is a simplified real e-commerce scenario!
              </p>
            </div>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}
