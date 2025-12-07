'use client';

import { useSignal, useSignalEffect } from 'signalforge/react';
import { useState } from 'react';
import DemoLayout from '../../components/DemoLayout';

export default function EffectsDemo() {
  const [count, setCount] = useSignal(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-9), `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // Effect runs whenever count changes
  useSignalEffect(() => {
    addLog(`Effect triggered! Count is now ${count}`);
    
    // Cleanup function
    return () => {
      addLog(`Cleaning up effect for count ${count}`);
    };
  });

  return (
    <DemoLayout
      title="⚡ Effects - React to Changes"
      description="Run code automatically when signals change. Built-in cleanup. Simpler than useEffect!"
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
                What Are Effects?
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                <strong>Effects</strong> are <strong>actions that happen automatically</strong> when a signal changes. 
                Like setting up a "watcher" that says <em>"whenever this changes, do that!"</em>
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
            <p className="text-gray-700 dark:text-gray-300">
              💡 <strong>Real-life example:</strong> Like a motion sensor light! When it detects movement (signal changes), 
              it automatically turns on the light (effect runs). No manual switch needed!
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
                Why Use Effects?
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-3">
                Because you need to do things WHEN state changes: save to server, log analytics, start timers, etc.
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-red-500">
              <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">❌ React useEffect Problems</h4>
              <pre className="bg-gray-900 text-red-400 p-3 rounded text-xs overflow-x-auto mb-2">
{`useEffect(() => {
  // What dependencies?? 🤔
  console.log(count, name);
}, [count, name]); // Easy to forget!
//  ↑ Manual tracking = BUGS

// Forgot to add 'name' to array?
// Effect won't run when name changes!`}</pre>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Manual dependency arrays</li>
                <li>• Easy to forget dependencies</li>
                <li>• Linter warnings everywhere</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
              <h4 className="font-bold text-green-600 dark:text-green-400 mb-2">✅ SignalForge Effects</h4>
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto mb-2">
{`useSignalEffect(() => {
  // Auto-tracks EVERYTHING! ✨
  console.log(count, name);
}); // No dependency array!

// Automatically knows count and name
// are dependencies. No manual work!`}</pre>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Auto-tracks all signals used</li>
                <li>• Impossible to forget deps</li>
                <li>• No linter warnings!</li>
              </ul>
            </div>
          </div>
        </div>

        {/* HOW TO USE IT? */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-300 dark:border-purple-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-2xl">🚀</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-purple-900 dark:text-purple-100">
                How To Use It? (Pattern + Real Examples!)
              </h3>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">📝 Basic Pattern</h4>
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`useSignalEffect(() => {
  // Code here runs when ANY signal used inside changes
  console.log('Count changed to:', count);
  
  // Optional cleanup (runs before next effect)
  return () => {
    console.log('Cleaning up!');
  };
});`}</pre>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border-l-4 border-cyan-500">
                <h4 className="font-bold text-sm mb-2">💾 Example: Auto-save</h4>
                <pre className="bg-gray-900 text-cyan-400 p-2 rounded text-xs overflow-x-auto">
{`useSignalEffect(() => {
  localStorage.setItem(
    'draft', 
    draftText
  );
});`}</pre>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border-l-4 border-orange-500">
                <h4 className="font-bold text-sm mb-2">📊 Example: Analytics</h4>
                <pre className="bg-gray-900 text-orange-400 p-2 rounded text-xs overflow-x-auto">
{`useSignalEffect(() => {
  analytics.track(
    'page_view',
    { page: currentPage }
  );
});`}</pre>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border-l-4 border-pink-500">
                <h4 className="font-bold text-sm mb-2">⏰ Example: Timer</h4>
                <pre className="bg-gray-900 text-pink-400 p-2 rounded text-xs overflow-x-auto">
{`useSignalEffect(() => {
  const id = setInterval(
    () => tick(), 1000
  );
  return () => clearInterval(id);
});`}</pre>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border-l-4 border-green-500">
                <h4 className="font-bold text-sm mb-2">🌐 Example: API Call</h4>
                <pre className="bg-gray-900 text-green-400 p-2 rounded text-xs overflow-x-auto">
{`useSignalEffect(() => {
  fetch(\`/api/\${userId}\`)
    .then(r => r.json())
    .then(setUserData);
});`}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Demo Title */}
        <div className="text-center bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 p-6 rounded-xl border-2 border-cyan-300 dark:border-cyan-600">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🎮 Watch Effects Run Automatically!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Every time you change the counter, the effect logs it automatically ⬇️
          </p>
        </div>
        {/* Counter */}
        <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            {count}
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setCount(count - 1)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Decrement
            </button>
            <button
              onClick={() => setCount(0)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => setCount(count + 1)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Increment
            </button>
          </div>
        </div>

        {/* Logs */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Effect Logs
            </h3>
            <button
              onClick={() => setLogs([])}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Clear Logs
            </button>
          </div>
          <div className="p-4 bg-gray-900 rounded-lg h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet. Change the counter to trigger effects.</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-green-400 mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-750 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-purple-900 dark:text-purple-100">
            🚀 How It Works (3 Simple Steps)
          </h3>
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="font-bold text-blue-600 dark:text-blue-400 mb-2">Step 1: Create your signals</div>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded block">
                const [count, setCount] = useSignal(0);
              </code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-l-4 border-green-500">
              <div className="font-bold text-green-600 dark:text-green-400 mb-2">Step 2: Create an effect that uses the signal</div>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded block">
                useSignalEffect(() =&gt; &#123;<br/>
                &nbsp;&nbsp;console.log('Count is:', count);<br/>
                &#125;);
              </code>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                💡 It auto-tracks that it depends on count - no array needed!
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="font-bold text-purple-600 dark:text-purple-400 mb-2">Step 3: Change the signal - effect runs automatically!</div>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded block">
                setCount(5);  // Effect runs! ✨
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
{`import { useSignal, useSignalEffect } from 'signalforge/react';

function TimerComponent() {
  const [seconds, setSeconds] = useSignal(0);
  
  // Effect runs when seconds changes
  useSignalEffect(() => {
    console.log(\`Timer at: \${seconds} seconds\`);
    
    // Optional: Return cleanup function
    return () => {
      console.log(\`Cleaning up timer at \${seconds}\`);
    };
  });
  
  // Another effect - can have multiple!
  useSignalEffect(() => {
    if (seconds >= 10) {
      alert('Timer reached 10 seconds!');
    }
  });
  
  return (
    <div>
      <h2>{seconds} seconds</h2>
      <button onClick={() => setSeconds(seconds + 1)}>
        Add Second
      </button>
    </div>
  );
}

// ✨ No dependency array needed!
// ✨ Auto-tracks what you use
// ✨ Cleanup runs before next effect`}
            </pre>
          </div>
        </div>

        {/* Why This Matters */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-yellow-900 dark:text-yellow-100">
            💡 Why SignalForge Effects Are Better
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
            <div>
              <div className="font-semibold text-red-600 dark:text-red-400 mb-2">❌ Traditional useEffect:</div>
              <ul className="space-y-1 text-sm">
                <li>• Must manually list dependencies</li>
                <li>• Easy to forget a dependency</li>
                <li>• Stale closures are common bugs</li>
                <li>• Runs on every render initially</li>
                <li>• Verbose and error-prone</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-green-600 dark:text-green-400 mb-2">✅ SignalForge useSignalEffect:</div>
              <ul className="space-y-1 text-sm">
                <li>• Auto-tracks dependencies</li>
                <li>• Impossible to miss dependencies</li>
                <li>• No stale closure issues</li>
                <li>• Only runs when signals change</li>
                <li>• Clean, simple syntax</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Real World Use Cases */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-green-900 dark:text-green-100">
            🌍 Real-World Use Cases
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-blue-600 mb-1">📡 API Calls</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Fetch data when user ID changes
              </div>
              <code className="text-xs block mt-2">
                useSignalEffect(() =&gt; &#123;<br/>
                &nbsp;&nbsp;fetchUser(userId);<br/>
                &#125;);
              </code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-purple-600 mb-1">📊 Analytics Tracking</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Log page views or events
              </div>
              <code className="text-xs block mt-2">
                useSignalEffect(() =&gt; &#123;<br/>
                &nbsp;&nbsp;analytics.track(page);<br/>
                &#125;);
              </code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-green-600 mb-1">⏰ Timers & Intervals</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Set up timers with auto-cleanup
              </div>
              <code className="text-xs block mt-2">
                useSignalEffect(() =&gt; &#123;<br/>
                &nbsp;&nbsp;const id = setInterval(fn, 1000);<br/>
                &nbsp;&nbsp;return () =&gt; clearInterval(id);<br/>
                &#125;);
              </code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-orange-600 mb-1">💾 LocalStorage Sync</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Save state to localStorage
              </div>
              <code className="text-xs block mt-2">
                useSignalEffect(() =&gt; &#123;<br/>
                &nbsp;&nbsp;localStorage.setItem('user', JSON.stringify(user));<br/>
                &#125;);
              </code>
            </div>
          </div>
        </div>

        {/* Cleanup Explained */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-indigo-900 dark:text-indigo-100">
            🧹 Understanding Cleanup Functions
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            When your effect returns a function, it gets called before the next effect runs or when the component unmounts.
          </p>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
            <code className="text-sm">
              useSignalEffect(() =&gt; &#123;<br/>
              &nbsp;&nbsp;// 1. Set up resources<br/>
              &nbsp;&nbsp;const subscription = api.subscribe(userId);<br/>
              &nbsp;&nbsp;const timer = setInterval(() =&gt; &#123;...&#125;, 1000);<br/>
              <br/>
              &nbsp;&nbsp;// 2. Return cleanup function<br/>
              &nbsp;&nbsp;return () =&gt; &#123;<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;subscription.unsubscribe(); // Clean up!<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;clearInterval(timer); // Prevent memory leaks!<br/>
              &nbsp;&nbsp;&#125;;<br/>
              &#125;);
            </code>
          </div>
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            💡 <strong>Pro tip:</strong> Always clean up subscriptions, timers, and listeners to prevent memory leaks!
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">🎓 Next Steps</h3>
          <p className="mb-4">Master effects? Try these advanced demos:</p>
          <div className="flex flex-wrap gap-3">
            <a href="/demos/subscribe" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
              Subscribe →
            </a>
            <a href="/demos/persistent" className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">
              Persistent Signals →
            </a>
            <a href="/demos/form" className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition">
              Form Validation →
            </a>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}
