'use client';

import { useSignal, useSignalValue, useSignalEffect } from 'signalforge/react';
import { useState } from 'react';
import DemoLayout from '../../components/DemoLayout';

export default function ReactHooksDemo() {
  // useSignal - Returns [value, setValue] tuple
  const [count, setCount] = useSignal(10);
  const [doubled, setDoubled] = useSignal(0);
  
  const [effectLogs, setEffectLogs] = useState<string[]>([]);

  // useSignalEffect - Auto-tracking effect
  useSignalEffect(() => {
    setDoubled(count * 2);
    const log = `Effect: count=${count}, doubled=${count * 2}`;
    setEffectLogs(prev => [...prev.slice(-4), log]);
  });

  return (
    <DemoLayout
      title="⚛️ React Hooks - Complete Guide"
      description="Master all 3 SignalForge hooks: useSignal, useSignalValue, and useSignalEffect"
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
              <span><code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">useSignal()</code> - Create reactive state (most common)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span><code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">useSignalValue()</code> - Read signals without setter (read-only)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span><code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">useSignalEffect()</code> - React to signal changes (side effects)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>When to use each hook and best practices</span>
            </li>
          </ul>
        </div>

        {/* Quick Reference Table */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-750 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-purple-900 dark:text-purple-100">
            🔍 Quick Reference
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-2 text-left">Hook</th>
                  <th className="px-4 py-2 text-left">Returns</th>
                  <th className="px-4 py-2 text-left">Use When</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                <tr className="bg-white dark:bg-gray-900">
                  <td className="px-4 py-2 font-mono text-blue-600">useSignal(val)</td>
                  <td className="px-4 py-2">[value, setValue]</td>
                  <td className="px-4 py-2">You need to read AND write</td>
                </tr>
                <tr className="bg-white dark:bg-gray-900">
                  <td className="px-4 py-2 font-mono text-green-600">useSignalValue(sig)</td>
                  <td className="px-4 py-2">value (read-only)</td>
                  <td className="px-4 py-2">You only need to read</td>
                </tr>
                <tr className="bg-white dark:bg-gray-900">
                  <td className="px-4 py-2 font-mono text-purple-600">useSignalEffect(fn)</td>
                  <td className="px-4 py-2">void</td>
                  <td className="px-4 py-2">Run side effects on changes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* Hook Demos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* useSignal */}
          <div className="p-6 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
              useSignal()
            </h3>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4 text-center">
              {count}
            </div>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setCount(count - 1)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                -
              </button>
              <button
                onClick={() => setCount(10)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setCount(count + 1)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                +
              </button>
            </div>
            <pre className="text-xs bg-gray-900 text-green-400 p-2 rounded overflow-x-auto">
{`const [count, setCount] = useSignal(10);
setCount(count + 1) // update`}
            </pre>
          </div>

          {/* useSignalValue */}
          <div className="p-6 bg-green-50 dark:bg-green-900 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
              Computed Value
            </h3>
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-4 text-center">
              {doubled}
            </div>
            <div className="mb-4 text-center text-sm text-gray-600 dark:text-gray-300">
              Auto-computed value
              <br />
              (count * 2)
            </div>
            <pre className="text-xs bg-gray-900 text-green-400 p-2 rounded overflow-x-auto">
{`const [doubled, setDoubled] = useSignal(0);
useSignalEffect(() => {
  setDoubled(count * 2);
});`}
            </pre>
          </div>
        </div>

        {/* useSignalEffect */}
        <div className="p-6 bg-purple-50 dark:bg-purple-900 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">
            useSignalEffect()
          </h3>
          <div className="p-4 bg-gray-900 rounded-lg h-40 overflow-y-auto font-mono text-sm mb-4">
            {effectLogs.map((log, i) => (
              <div key={i} className="text-green-400">
                {log}
              </div>
            ))}
          </div>
          <pre className="text-xs bg-gray-900 text-green-400 p-2 rounded overflow-x-auto">
{`useSignalEffect(() => {
  // Automatically tracks count changes
  const doubled = count * 2;
  console.log('Doubled:', doubled);
});`}
          </pre>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3">Hook</th>
                <th className="px-6 py-3">Returns</th>
                <th className="px-6 py-3">Use Case</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <td className="px-6 py-4 font-mono text-blue-600 dark:text-blue-400">useSignal</td>
                <td className="px-6 py-4">Signal object</td>
                <td className="px-6 py-4">When you need to read AND write</td>
              </tr>
              <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <td className="px-6 py-4 font-mono text-green-600 dark:text-green-400">useSignalValue</td>
                <td className="px-6 py-4">Raw value</td>
                <td className="px-6 py-4">When you only need to read (optimized)</td>
              </tr>
              <tr className="bg-white dark:bg-gray-800">
                <td className="px-6 py-4 font-mono text-purple-600 dark:text-purple-400">useSignalEffect</td>
                <td className="px-6 py-4">void</td>
                <td className="px-6 py-4">Run side effects when signals change</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Detailed Examples */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Hook 1: useSignal */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-700">
            <div className="text-4xl mb-3">1️⃣</div>
            <h4 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">useSignal()</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Create reactive state. Just like useState but better!
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs font-mono text-green-400 mb-3">
              const [count, setCount] = useSignal(0);<br/><br/>
              // Read<br/>
              &#123;count&#125;<br/><br/>
              // Write<br/>
              setCount(5);
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              ✅ Best for: Component local state
            </div>
          </div>

          {/* Hook 2: useSignalValue */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-green-200 dark:border-green-700">
            <div className="text-4xl mb-3">2️⃣</div>
            <h4 className="text-lg font-bold text-green-600 dark:text-green-400 mb-2">useSignalValue()</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Read a signal created elsewhere. Read-only access.
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs font-mono text-green-400 mb-3">
              // In store.ts<br/>
              export const user = signal(&#123;...&#125;);<br/><br/>
              // In component<br/>
              const userData = useSignalValue(user);<br/><br/>
              &#123;userData.name&#125;
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              ✅ Best for: Reading global signals
            </div>
          </div>

          {/* Hook 3: useSignalEffect */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-purple-200 dark:border-purple-700">
            <div className="text-4xl mb-3">3️⃣</div>
            <h4 className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-2">useSignalEffect()</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Run code when signals change. Auto-tracks dependencies!
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs font-mono text-green-400 mb-3">
              useSignalEffect(() =&gt; &#123;<br/>
              &nbsp;&nbsp;console.log(count);<br/>
              &nbsp;&nbsp;<br/>
              &nbsp;&nbsp;return () =&gt; &#123;<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;// cleanup<br/>
              &nbsp;&nbsp;&#125;;<br/>
              &#125;);
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              ✅ Best for: Side effects, logging, API calls
            </div>
          </div>
        </div>

        {/* Complete Working Example */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-750 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-blue-900 dark:text-blue-100">
            💻 Complete Real-World Example
          </h3>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-green-400 text-sm">
{`import { useSignal, useSignalValue, useSignalEffect } from 'signalforge/react';
import { createSignal } from 'signalforge';

// Global signal (outside component)
const globalCounter = createSignal(0);

function ParentComponent() {
  // Local signal with useSignal
  const [name, setName] = useSignal('Guest');
  
  return (
    <div>
      <input 
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <ChildComponent />
    </div>
  );
}

function ChildComponent() {
  // Read global signal with useSignalValue
  const count = useSignalValue(globalCounter);
  
  // Effect runs when count changes
  useSignalEffect(() => {
    console.log(\`Count changed to: \${count}\`);
    
    // Cleanup (optional)
    return () => {
      console.log('Cleaning up...');
    };
  });
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => globalCounter.set(globalCounter.get() + 1)}>
        Increment Global Counter
      </button>
    </div>
  );
}

// ✨ Key Benefits:
// • useSignal for local state
// • useSignalValue for reading global state
// • useSignalEffect for side effects
// • All auto-track dependencies!`}
            </pre>
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-yellow-900 dark:text-yellow-100">
            💡 Best Practices & Tips
          </h3>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div className="flex gap-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <strong>Use useSignal for local state</strong>
                <p className="text-sm">Perfect for component-specific state like form inputs, toggles, counters.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <strong>Use useSignalValue for reading shared state</strong>
                <p className="text-sm">When you have a global signal and only need to read it (not write).</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <strong>Use useSignalEffect for side effects</strong>
                <p className="text-sm">API calls, logging, timers, subscriptions. Always return cleanup functions!</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">4️⃣</span>
              <div>
                <strong>No dependency arrays needed!</strong>
                <p className="text-sm">SignalForge automatically tracks what signals you use. Zero boilerplate!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Common Patterns */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-green-900 dark:text-green-100">
            🎯 Common Patterns
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded p-4">
              <div className="font-semibold text-blue-600 mb-2">✅ Good: Local State</div>
              <code className="text-xs block bg-gray-100 dark:bg-gray-800 p-2 rounded">
                const [count, setCount] = useSignal(0);<br/>
                &lt;button onClick=&#123;() =&gt; setCount(count + 1)&#125;&gt;
              </code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-4">
              <div className="font-semibold text-blue-600 mb-2">✅ Good: Read Global</div>
              <code className="text-xs block bg-gray-100 dark:bg-gray-800 p-2 rounded">
                const user = useSignalValue(userSignal);<br/>
                &lt;h1&gt;&#123;user.name&#125;&lt;/h1&gt;
              </code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-4">
              <div className="font-semibold text-blue-600 mb-2">✅ Good: Side Effect</div>
              <code className="text-xs block bg-gray-100 dark:bg-gray-800 p-2 rounded">
                useSignalEffect(() =&gt; &#123;<br/>
                &nbsp;&nbsp;fetchData(userId);<br/>
                &#125;);
              </code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-4">
              <div className="font-semibold text-red-600 mb-2">❌ Don't: Mix with useState</div>
              <code className="text-xs block bg-gray-100 dark:bg-gray-800 p-2 rounded">
                const [count] = useState(signal(0));<br/>
                // Use useSignal instead!
              </code>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">🎓 Next Steps</h3>
          <p className="mb-4">Now you know all the hooks! Try building something:</p>
          <div className="flex flex-wrap gap-3">
            <a href="/demos/cart" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
              Shopping Cart →
            </a>
            <a href="/demos/form" className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">
              Form Validation →
            </a>
            <a href="/demos/todo" className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition">
              Todo App →
            </a>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}
