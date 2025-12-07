'use client';

import { createSignal } from 'signalforge/core';
import { useState, useEffect } from 'react';
import DemoLayout from '../../components/DemoLayout';

export default function SubscribeDemo() {
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [signal] = useState(() => createSignal(0));
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-9), `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleSubscribe = () => {
    if (isSubscribed) return;
    
    const unsub = signal.subscribe((newValue) => {
      addLog(`Subscription triggered! New value: ${newValue}`);
      setCount(newValue);
    });
    
    setUnsubscribe(() => unsub);
    setIsSubscribed(true);
    addLog('Subscribed to signal');
  };

  const handleUnsubscribe = () => {
    if (unsubscribe) {
      unsubscribe();
      setUnsubscribe(null);
      setIsSubscribed(false);
      addLog('Unsubscribed from signal');
    }
  };

  useEffect(() => {
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [unsubscribe]);

  return (
    <DemoLayout
      title="👂 Subscribe - Listen to Signal Changes"
      description="Monitor signal changes outside React. Perfect for logging, analytics, and debugging!"
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
              <span>Subscribe to signal changes with <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">signal.subscribe()</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Unsubscribe properly to prevent memory leaks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Listen to changes outside React components</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Build logging, analytics, and monitoring systems</span>
            </li>
          </ul>
        </div>

        {/* Interactive Demo Title */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🎮 Try It: Subscribe and Watch Changes
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Subscribe to see logs appear when the signal changes!
          </p>
        </div>
        {/* Signal Display */}
        <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            {signal.get()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Signal Value</div>
        </div>

        {/* Subscription Status */}
        <div className={`p-4 rounded-lg ${isSubscribed ? 'bg-green-50 dark:bg-green-900' : 'bg-gray-50 dark:bg-gray-700'}`}>
          <div className="flex items-center justify-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isSubscribed ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className={`font-semibold ${isSubscribed ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
              {isSubscribed ? 'Subscribed - Listening for changes' : 'Not Subscribed'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => signal.set(signal.get() - 1)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Decrement
          </button>
          <button
            onClick={() => signal.set(0)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => signal.set(signal.get() + 1)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Increment
          </button>
          <button
            onClick={() => signal.set(Math.floor(Math.random() * 100))}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Random
          </button>
        </div>

        {/* Subscribe/Unsubscribe */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleSubscribe}
            disabled={isSubscribed}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              isSubscribed
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Subscribe
          </button>
          <button
            onClick={handleUnsubscribe}
            disabled={!isSubscribed}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              !isSubscribed
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            Unsubscribe
          </button>
        </div>

        {/* Logs */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Subscription Logs
            </h3>
            <button
              onClick={() => setLogs([])}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="p-4 bg-gray-900 rounded-lg h-48 overflow-y-auto font-mono text-sm">
            {logs.map((log, i) => (
              <div key={i} className="text-green-400 mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-750 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-purple-900 dark:text-purple-100">
            🚀 How It Works (3 Simple Steps)
          </h3>
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="font-bold text-blue-600 dark:text-blue-400 mb-2">Step 1: Create or access a signal</div>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded block">
                const mySignal = createSignal(0);
              </code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-l-4 border-green-500">
              <div className="font-bold text-green-600 dark:text-green-400 mb-2">Step 2: Subscribe with a callback function</div>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded block">
                const unsubscribe = mySignal.subscribe((newValue) =&gt; &#123;<br/>
                &nbsp;&nbsp;console.log('Changed to:', newValue);<br/>
                &#125;);
              </code>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                💡 Your callback runs every time the signal changes!
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="font-bold text-purple-600 dark:text-purple-400 mb-2">Step 3: Always clean up when done</div>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded block">
                unsubscribe();  // Prevents memory leaks!
              </code>
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
{`import { createSignal } from 'signalforge/core';

// Create a signal
const userCount = createSignal(0);

// Subscribe to changes
const unsubscribe = userCount.subscribe((newCount) => {
  console.log(\`Users online: \${newCount}\`);
  
  // Send to analytics
  analytics.track('user_count_changed', { count: newCount });
  
  // Update dashboard
  updateDashboard(newCount);
});

// When a user joins
userCount.set(userCount.get() + 1); // Triggers subscriber!

// When a user leaves
userCount.set(userCount.get() - 1); // Triggers subscriber!

// Clean up when component unmounts
useEffect(() => {
  return () => unsubscribe();
}, []);

// ✨ Benefits:
// • Works outside React components
// • Perfect for logging and analytics
// • No re-renders triggered
// • Can have multiple subscribers`}
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
              <div className="font-semibold text-blue-600 mb-1">📊 Analytics Tracking</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Send events to analytics when signals change
              </div>
              <code className="text-xs block">
                signal.subscribe((val) =&gt; &#123;<br/>
                &nbsp;&nbsp;analytics.track('value_changed', &#123;val&#125;);<br/>
                &#125;);
              </code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-purple-600 mb-1">🐛 Debug Logging</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Log all state changes during development
              </div>
              <code className="text-xs block">
                signal.subscribe((val) =&gt; &#123;<br/>
                &nbsp;&nbsp;console.log('State:', val);<br/>
                &#125;);
              </code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-green-600 mb-1">💾 Auto-Save</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Save to localStorage on every change
              </div>
              <code className="text-xs block">
                signal.subscribe((val) =&gt; &#123;<br/>
                &nbsp;&nbsp;localStorage.setItem('data', val);<br/>
                &#125;);
              </code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-orange-600 mb-1">🔔 Notifications</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Show alerts when values reach thresholds
              </div>
              <code className="text-xs block">
                signal.subscribe((val) =&gt; &#123;<br/>
                &nbsp;&nbsp;if (val &gt; 100) alert('High!');<br/>
                &#125;);
              </code>
            </div>
          </div>
        </div>

        {/* Important Warning */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-yellow-900 dark:text-yellow-100">
            ⚠️ Important: Always Unsubscribe!
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Forgetting to unsubscribe causes memory leaks. Your callback will keep running even after the component unmounts!
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded p-4">
              <div className="font-semibold text-red-600 mb-2">❌ Bad - Memory Leak</div>
              <code className="text-xs block bg-gray-100 dark:bg-gray-800 p-2 rounded">
                useEffect(() =&gt; &#123;<br/>
                &nbsp;&nbsp;signal.subscribe(callback);<br/>
                &nbsp;&nbsp;// No cleanup!<br/>
                &#125;, []);
              </code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-4">
              <div className="font-semibold text-green-600 mb-2">✅ Good - Clean Cleanup</div>
              <code className="text-xs block bg-gray-100 dark:bg-gray-800 p-2 rounded">
                useEffect(() =&gt; &#123;<br/>
                &nbsp;&nbsp;const unsub = signal.subscribe(callback);<br/>
                &nbsp;&nbsp;return () =&gt; unsub();<br/>
                &#125;, []);
              </code>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">🎓 Next Steps</h3>
          <p className="mb-4">Master subscriptions? Try these advanced patterns:</p>
          <div className="flex flex-wrap gap-3">
            <a href="/demos/effects" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
              Effects →
            </a>
            <a href="/demos/persistent" className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">
              Persistent Signals →
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
