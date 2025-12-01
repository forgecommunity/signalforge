'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [flash, setFlash] = useState(false);
  const [lightningBolts, setLightningBolts] = useState<Array<{id: number; left: string; top: string; height: string}>>([]);

  const triggerLightning = () => {
    setFlash(true);
    const boltCount = Math.floor(Math.random() * 2) + 1; // 1-2 bolts
    const newBolts = Array.from({ length: boltCount }, (_, i) => ({
      id: Date.now() + i,
      left: `${Math.random() * 80 + 10}%`,
      top: `${Math.random() * 20}%`,
      height: `${Math.random() * 100 + 80}px`,
    }));
    setLightningBolts(newBolts);
    
    setTimeout(() => {
      setFlash(false);
      setLightningBolts([]);
    }, 600);
  };

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    // Initial lightning after 3s so users see it
    const firstFlash = setTimeout(() => {
      triggerLightning();
    }, 3000);
    // Trigger cloud lightning randomly every 10-18s
    const timer = setInterval(() => {
      triggerLightning();
    }, 10000 + Math.random() * 8000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(firstFlash);
      clearInterval(timer);
    };
  }, []);
  const demos = [
    { 
      id: 'basic', 
      name: 'Basic Signal', 
      description: 'Learn in 30 seconds! Create reactive state with just one hook. Perfect for beginners.', 
      icon: '🎯', 
      difficulty: 'Beginner',
      learn: 'How to use useSignal() to create and update state'
    },
    { 
      id: 'computed', 
      name: 'Computed Signal', 
      description: 'Auto-calculating values that update when dependencies change. No manual tracking needed.', 
      icon: '🧮', 
      difficulty: 'Beginner',
      learn: 'Derive values automatically from other signals'
    },
    { 
      id: 'effects', 
      name: 'Effects', 
      description: 'Run side effects when signals change. Built-in cleanup. Simpler than useEffect.', 
      icon: '⚡', 
      difficulty: 'Beginner',
      learn: 'React to signal changes with automatic cleanup'
    },
    { 
      id: 'hooks', 
      name: 'React Hooks', 
      description: 'useSignal, useSignalValue, useSignalEffect - React integration made simple.', 
      icon: '⚛️', 
      difficulty: 'Beginner',
      learn: 'All the React hooks you need for SignalForge'
    },
    { 
      id: 'batch', 
      name: 'Batch Updates', 
      description: 'Update multiple signals at once. 33x faster than sequential updates.', 
      icon: '🚀', 
      difficulty: 'Intermediate',
      learn: 'Optimize performance with batched updates'
    },
    { 
      id: 'subscribe', 
      name: 'Subscribe', 
      description: 'Listen to signal changes outside React. Perfect for logging or analytics.', 
      icon: '👂', 
      difficulty: 'Intermediate',
      learn: 'Monitor signal changes with subscriptions'
    },
    { 
      id: 'cart', 
      name: 'Shopping Cart', 
      description: 'Real e-commerce cart with add/remove items, quantities, and total calculation.', 
      icon: '🛒', 
      difficulty: 'Intermediate',
      learn: 'Build a complete shopping cart feature'
    },
    { 
      id: 'form', 
      name: 'Form Validation', 
      description: 'Dynamic form with real-time validation, error messages, and submission handling.', 
      icon: '📝', 
      difficulty: 'Intermediate',
      learn: 'Create forms with live validation'
    },
    { 
      id: 'todo', 
      name: 'Todo App', 
      description: 'Full CRUD app with add, edit, delete, and filter. Classic example done right.', 
      icon: '✅', 
      difficulty: 'Intermediate',
      learn: 'Build a complete CRUD application'
    },
    { 
      id: 'array', 
      name: 'Array Signal', 
      description: 'Work with arrays efficiently. Push, filter, map - all optimized for signals.', 
      icon: '📋', 
      difficulty: 'Intermediate',
      learn: 'Handle arrays with signal-optimized methods'
    },
    { 
      id: 'untrack', 
      name: 'Untrack', 
      description: 'Read signals without creating dependencies. Advanced control over reactivity.', 
      icon: '🔓', 
      difficulty: 'Advanced',
      learn: 'Fine-tune reactivity with untrack()'
    },
    { 
      id: 'persistent', 
      name: 'Persistent Signal', 
      description: 'Auto-save to localStorage. One line of code for data persistence.', 
      icon: '💾', 
      difficulty: 'Advanced',
      learn: 'Persist state across page reloads'
    },
    { 
      id: 'bigdata', 
      name: 'Big Data', 
      description: 'Handle 10,000+ items smoothly. See how SignalForge scales.', 
      icon: '📊', 
      difficulty: 'Advanced',
      learn: 'Test performance with large datasets'
    },
    { 
      id: 'devtools', 
      name: 'DevTools', 
      description: 'Inspect signals in real-time. Debug like a pro with time-travel.', 
      icon: '🛠️', 
      difficulty: 'Advanced',
      learn: 'Debug with signal inspector and profiler'
    },
    { 
      id: 'timetravel', 
      name: 'Time Travel', 
      description: 'Undo/Redo built-in. Travel back in time through state changes.', 
      icon: '⏱️', 
      difficulty: 'Advanced',
      learn: 'Implement undo/redo functionality'
    },
  ];

  const features = [
    { icon: '✅', title: 'Super Easy', description: 'Only 3 core functions to learn. No Redux complexity, no boilerplate.' },
    { icon: '⚡', title: 'Blazing Fast', description: 'Updates 33x faster with batching. Handles thousands of signals smoothly.' },
    { icon: '🪶', title: 'Tiny Bundle', description: 'Just 2KB gzipped. Zero dependencies. Tree-shakeable.' },
    { icon: '🌍', title: 'Works Everywhere', description: 'React, React Native, Next.js, or plain JavaScript. SSR ready.' },
    { icon: '💾', title: 'Persistence Built-in', description: 'Auto-save to localStorage or AsyncStorage with one line of code.' },
    { icon: '🛠️', title: 'DevTools Ready', description: 'Time travel debugging, signal inspection, and performance monitoring.' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, #080b12 0%, #0a0d14 60%, #090c12 100%)',
    }}>
      {/* Cloud layer at top - stays in background */}
      <div className="cloud-layer">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
        
        {/* Lightning bolts from clouds */}
        {lightningBolts.map((bolt) => (
          <div
            key={bolt.id}
            className="lightning-bolt"
            style={{
              left: bolt.left,
              top: bolt.top,
              height: bolt.height,
            }}
          />
        ))}
      </div>

      {/* Subtle flash overlay when lightning strikes */}
      {flash && (
        <div 
          className="pointer-events-none fixed inset-0 z-20"
          style={{
            background: 'radial-gradient(ellipse at 50% 20%, rgba(160, 200, 255, 0.15) 0%, transparent 60%)',
            animation: 'flashPulse 0.6s ease-out',
          }}
        />
      )}

      {/* Interactive cursor glow - subtle */}
      <div 
        className="fixed w-96 h-96 rounded-full pointer-events-none z-0 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {/* Logo in an elegant card */}
          <div className="relative inline-block mb-8 max-w-2xl mx-auto">
            <div className="relative p-6 md:p-8 rounded-2xl bg-[#0f1629]/60 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
              {/* subtle gradient stroke */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(14,165,233,0.25))',
                  WebkitMaskImage: 'radial-gradient(80% 80% at 50% 50%, black 60%, transparent 100%)',
                  maskImage: 'radial-gradient(80% 80% at 50% 50%, black 60%, transparent 100%)',
                  opacity: 0.25,
                }}
              />
              {/* signal waves */}
              <div className="ring-wave"></div>
              <div className="ring-wave delay-1"></div>
              <img
                src="https://raw.githubusercontent.com/forgecommunity/signalforge/refs/heads/master/docs/assets/signalforge.png"
                alt="SignalForge logo"
                className="relative w-full max-w-[200px] md:max-w-[240px] lg:max-w-[280px] mx-auto object-contain"
                loading="eager"
              />
            </div>
          </div>

          {/* Tagline only */}
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-200 mb-6 font-semibold animate-fade-in-up max-w-4xl mx-auto" style={{ animationDelay: '0.2s' }}>
            Fine-Grained Reactive State Management for Modern JavaScript
          </p>
          <p className="text-base md:text-lg text-gray-400 mb-8 max-w-3xl mx-auto animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.4s' }}>
            A simple, fast, and powerful state management library for React and React Native. 
            Your UI automatically updates when data changes. No complexity, no boilerplate, just signals.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex justify-center gap-4 flex-wrap mb-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <a
              href="https://www.npmjs.com/package/signalforge"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg overflow-hidden text-lg font-semibold shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10 flex items-center gap-2">
                <span className="group-hover:rotate-12 transition-transform">📦</span>
                Get Started
              </span>
            </a>
            <a
              href="https://github.com/forgecommunity/signalforge"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-8 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg overflow-hidden text-lg font-semibold shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 border border-gray-700"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10 flex items-center gap-2">
                <span className="group-hover:rotate-12 transition-transform">⭐</span>
                Star on GitHub
              </span>
            </a>
          </div>

          {/* Quick Stats */}
          <div className="flex justify-center gap-8 flex-wrap text-sm text-gray-400 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <div className="flex items-center gap-2 hover:text-blue-400 transition-colors cursor-default group">
              <span className="text-2xl group-hover:scale-110 transition-transform">🪶</span>
              <span>2KB gzipped</span>
            </div>
            <div className="flex items-center gap-2 hover:text-purple-400 transition-colors cursor-default group">
              <span className="text-2xl group-hover:scale-110 transition-transform">⚡</span>
              <span>33x faster</span>
            </div>
            <div className="flex items-center gap-2 hover:text-pink-400 transition-colors cursor-default group">
              <span className="text-2xl group-hover:scale-110 transition-transform">📦</span>
              <span>Zero deps</span>
            </div>
            <div className="flex items-center gap-2 hover:text-indigo-400 transition-colors cursor-default group">
              <span className="text-2xl group-hover:scale-110 transition-transform">🎯</span>
              <span>TypeScript</span>
            </div>
          </div>
        </div>

        {/* What is SignalForge Section */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              What is SignalForge?
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                SignalForge is a <strong>reactive state management library</strong> that makes building interactive UIs incredibly simple. 
                Think of signals as "smart variables" that automatically notify your UI when they change.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg mb-4">
                <pre className="text-sm overflow-x-auto">
                  <code className="text-gray-800 dark:text-gray-200">
{`// Create a signal (smart variable)
const count = createSignal(0);

// Computed values auto-update
const doubled = createComputed(() => count.get() * 2);

// Effects run when dependencies change
createEffect(() => {
  console.log('Count is now:', count.get());
});

count.set(5);  // UI updates automatically! ✨`}
                  </code>
                </pre>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Unlike Redux or Context API, SignalForge requires <strong>no providers, no actions, no reducers</strong>. 
                Just create signals and watch your app come alive.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Why Choose SignalForge?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Demos Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            📚 Learn by Doing - Interactive Demos
          </h2>
          <p className="text-center text-gray-400 mb-4 text-lg">
            15 hands-on examples that teach you SignalForge from beginner to advanced
          </p>
          <p className="text-center text-blue-400 mb-12 text-sm">
            💡 Start with "Basic Signal" - learn the fundamentals in 30 seconds!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {demos.map((demo, index) => (
              <Link
                key={demo.id}
                href={`/demos/${demo.id}`}
                className="group block p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all hover:scale-105 border border-gray-700/50 hover:border-blue-500/50 relative overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300 rounded-xl"></div>
                
                {/* Difficulty badge */}
                <div className={`absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-medium backdrop-blur-sm ${
                  demo.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                  demo.difficulty === 'Intermediate' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                  'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                }`}>
                  {demo.difficulty}
                </div>
                
                {/* Icon with animation */}
                <div className="relative text-5xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  {demo.icon}
                </div>
                
                {/* Content */}
                <h2 className="relative text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {demo.name}
                </h2>
                <p className="relative text-gray-400 text-sm mb-3 group-hover:text-gray-300 transition-colors">
                  {demo.description}
                </p>
                
                {/* What you'll learn */}
                {demo.learn && (
                  <div className="relative text-xs text-blue-300/70 mb-3 italic">
                    📖 {demo.learn}
                  </div>
                )}
                
                {/* Arrow indicator */}
                <div className="relative mt-4 flex items-center text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">Try it now</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* About Forge Community Section */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-2xl shadow-xl p-8 border border-purple-200 dark:border-purple-700">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              About Forge Community
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 text-center">
                <strong>Forge Community</strong> is an open-source collective dedicated to building high-quality, 
                developer-friendly tools for the modern JavaScript ecosystem.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-4xl mb-3">🔨</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Crafted with Care</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Every tool is meticulously designed, tested, and optimized for real-world use.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">🌟</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Open Source</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    100% free and open. MIT licensed. Community-driven development.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">🚀</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Production Ready</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Battle-tested in production apps. Comprehensive docs and support.
                  </p>
                </div>
              </div>
              <div className="text-center mt-8">
                <a
                  href="https://github.com/forgecommunity"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-semibold"
                >
                  🔗 Visit Forge Community on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Start Code Example */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Get Started in 30 Seconds
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">1. Install</div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <code className="text-gray-800 dark:text-gray-200">npm install signalforge</code>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">2. Use in React</div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    <code className="text-gray-800 dark:text-gray-200">
{`import { useSignal } from 'signalforge/react';

function Counter() {
  const [count, setCount] = useSignal(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}`}
                    </code>
                  </pre>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">3. That's it! 🎉</div>
                <p className="text-gray-700 dark:text-gray-300">
                  No providers, no context, no configuration needed. Just install and use.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Concepts Detailed */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Core Concepts
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 text-lg">
            Master these three concepts and you know 90% of SignalForge
          </p>
          
          <div className="space-y-8">
            {/* Signals */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4">
                <div className="text-5xl">🎯</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    1. Signals - Reactive Variables
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Signals are containers for values that notify subscribers when they change. 
                    Think of them as "smart variables" that your UI can watch.
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      <code className="text-gray-800 dark:text-gray-200">
{`const username = createSignal('John');
const count = createSignal(0);

// Read values
console.log(username.get());  // 'John'

// Update values
username.set('Jane');
count.set(count.get() + 1);

// Your React components automatically re-render! ✨`}
                      </code>
                    </pre>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                      Reactive
                    </span>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                      Type-safe
                    </span>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                      Writable
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Computed */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4">
                <div className="text-5xl">🧮</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    2. Computed - Auto-Calculating Values
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Computed signals automatically recalculate when their dependencies change. 
                    Perfect for derived state like totals, filtered lists, or formatted data.
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      <code className="text-gray-800 dark:text-gray-200">
{`const price = createSignal(100);
const quantity = createSignal(3);

// Automatically updates when price or quantity changes
const total = createComputed(() => 
  price.get() * quantity.get()
);

console.log(total.get());  // 300
price.set(150);
console.log(total.get());  // 450 - Updated automatically! 🎉`}
                      </code>
                    </pre>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm">
                      Auto-updating
                    </span>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm">
                      Memoized
                    </span>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm">
                      Read-only
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Effects */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4">
                <div className="text-5xl">⚡</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    3. Effects - Side Effects with Cleanup
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Effects run code when signals change. Great for logging, API calls, DOM updates, 
                    or syncing with external systems. Cleanup functions prevent memory leaks.
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      <code className="text-gray-800 dark:text-gray-200">
{`const theme = createSignal('light');

createEffect(() => {
  // Runs when theme changes
  document.body.className = theme.get();
  console.log('Theme changed to:', theme.get());
  
  // Optional cleanup
  return () => {
    console.log('Cleaning up old theme');
  };
});

theme.set('dark');  // Effect runs automatically!`}
                      </code>
                    </pre>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                      Side effects
                    </span>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                      Auto-cleanup
                    </span>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                      Reactive
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison with Other Solutions */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            How Does It Compare?
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 text-lg">
            See how SignalForge stacks up against popular alternatives
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900">
                  <th className="px-6 py-4 text-left text-gray-900 dark:text-white font-semibold">Feature</th>
                  <th className="px-6 py-4 text-center text-gray-900 dark:text-white font-semibold">SignalForge</th>
                  <th className="px-6 py-4 text-center text-gray-600 dark:text-gray-400 font-semibold">Redux</th>
                  <th className="px-6 py-4 text-center text-gray-600 dark:text-gray-400 font-semibold">Zustand</th>
                  <th className="px-6 py-4 text-center text-gray-600 dark:text-gray-400 font-semibold">Context API</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Bundle Size</td>
                  <td className="px-6 py-4 text-center text-green-600 dark:text-green-400 font-semibold">2KB</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">45KB</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">3KB</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">0KB (built-in)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Learning Curve</td>
                  <td className="px-6 py-4 text-center text-green-600 dark:text-green-400 font-semibold">5 mins</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">2-3 days</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">30 mins</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">1 hour</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Boilerplate</td>
                  <td className="px-6 py-4 text-center text-green-600 dark:text-green-400 font-semibold">None</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">Heavy</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">Minimal</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">Medium</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Fine-Grained Updates</td>
                  <td className="px-6 py-4 text-center text-green-600 dark:text-green-400 font-semibold">✅</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">❌</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">❌</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">❌</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">TypeScript</td>
                  <td className="px-6 py-4 text-center text-green-600 dark:text-green-400 font-semibold">✅ Built-in</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">✅</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">✅</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">✅</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">DevTools</td>
                  <td className="px-6 py-4 text-center text-green-600 dark:text-green-400 font-semibold">✅ Built-in</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">✅ Extension</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">⚠️ Limited</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">❌</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Time Travel</td>
                  <td className="px-6 py-4 text-center text-green-600 dark:text-green-400 font-semibold">✅ Built-in</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">✅ Via DevTools</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">❌</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">❌</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">Persistence</td>
                  <td className="px-6 py-4 text-center text-green-600 dark:text-green-400 font-semibold">✅ Built-in</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">⚠️ Middleware</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">⚠️ Manual</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">❌</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-center text-gray-700 dark:text-gray-300">
              <strong>💡 Pro Tip:</strong> SignalForge combines the simplicity of Context API 
              with the power of Redux and the performance of fine-grained reactivity.
            </p>
          </div>
        </div>

        {/* Use Cases */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Perfect For
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 text-lg">
            SignalForge shines in these scenarios
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                E-commerce Apps
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Shopping cart with auto-calculated totals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Product filtering and sorting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Persistent user preferences</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Real-time price updates</span>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Forms & Validation
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Real-time field validation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Computed form state (valid/invalid)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Auto-save drafts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Complex multi-step wizards</span>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Dashboards & Analytics
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Real-time data visualization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Filtering and aggregation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Performance with large datasets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Interactive charts and graphs</span>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Mobile Apps (React Native)
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Tiny bundle for fast app startup</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>AsyncStorage persistence out-of-box</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Smooth 60fps animations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Offline-first capabilities</span>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Real-Time Applications
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Chat applications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Collaborative editing tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Live sports scores</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Stock tickers and trading platforms</span>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Creative Tools
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Image editors with undo/redo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Design tools with live preview</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Configuration builders</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Theme customization panels</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Performance That Matters
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 text-lg">
            Real benchmarks from our test suite
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl shadow-lg p-8 border border-blue-200 dark:border-blue-800 text-center">
              <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                33x
              </div>
              <div className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
                Faster Updates
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Batched updates vs individual changes
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl shadow-lg p-8 border border-green-200 dark:border-green-800 text-center">
              <div className="text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
                10,000+
              </div>
              <div className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
                Signals
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Handle thousands of signals smoothly
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl shadow-lg p-8 border border-purple-200 dark:border-purple-800 text-center">
              <div className="text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                &lt;1ms
              </div>
              <div className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
                Update Time
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Sub-millisecond reactivity
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              Why It's So Fast
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Fine-Grained Reactivity</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Only updates components that actually use changed signals
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Smart Batching</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Groups multiple updates into a single render
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🧠</span>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Automatic Memoization</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Computed values cache results until dependencies change
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🪶</span>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Minimal Overhead</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Tiny runtime with zero unnecessary abstractions
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 dark:text-gray-400 pt-8 border-t border-gray-300 dark:border-gray-700">
          <p className="mb-4 text-lg">
            Built with ❤️ by{' '}
            <a
              href="https://github.com/forgecommunity"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Forge Community
            </a>
          </p>
          <div className="flex justify-center gap-6 mb-4">
            <a
              href="https://www.npmjs.com/package/signalforge"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              📦 npm
            </a>
            <a
              href="https://github.com/forgecommunity/signalforge"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              🐙 GitHub
            </a>
            <a
              href="https://github.com/forgecommunity/signalforge/blob/master/docs/getting-started.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              📚 Docs
            </a>
            <a
              href="https://github.com/forgecommunity/signalforge/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              💬 Support
            </a>
          </div>
          <p className="text-sm">
            MIT Licensed • TypeScript • 2KB gzipped • Zero Dependencies
          </p>
        </div>
      </div>
    </div>
  );
}
