'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);
  const demos = [
    // ===== NEW: FEATURED COMPARISONS =====
    { 
      id: 'comparison', 
      name: 'SignalForge vs Redux/Zustand', 
      description: 'Side-by-side comparison showing 90% less code with the same shopping cart functionality.', 
      icon: '🔥', 
      difficulty: 'Featured',
      learn: 'Compare SignalForge with traditional state management',
      featured: true
    },
    { 
      id: 'collaboration', 
      name: 'Fine-Grained Reactivity', 
      description: 'See how only edited cells re-render, while Redux/Context would re-render the entire grid.', 
      icon: '👥', 
      difficulty: 'Featured',
      learn: 'Real-time collaboration with minimal re-renders',
      featured: true
    },
    { 
      id: 'chains', 
      name: 'Advanced Computed Chains', 
      description: 'Complex nested calculations with visual dependency tree and automatic updates.', 
      icon: '🔗', 
      difficulty: 'Featured',
      learn: 'Automatic dependency tracking vs manual selectors',
      featured: true
    },
    { 
      id: 'benchmark', 
      name: 'Live Performance Benchmark', 
      description: 'Real-time comparison showing render counts and performance differences.', 
      icon: '⚡', 
      difficulty: 'Featured',
      learn: 'Measure the performance difference',
      featured: true
    },
    // ===== BEGINNER DEMOS =====
    { 
      id: 'basic', 
      name: 'Basic Signal', 
      description: 'Create reactive state with just one hook. Quick start for beginners.', 
      icon: '🎯', 
      difficulty: 'Beginner',
      learn: 'How to use useSignal() to create and update state'
    },
    { 
      id: 'computed', 
      name: 'Computed Signal', 
      description: 'Auto-calculating values that update when dependencies change.', 
      icon: '🧮', 
      difficulty: 'Beginner',
      learn: 'Derive values automatically from other signals'
    },
    { 
      id: 'effects', 
      name: 'Effects', 
      description: 'Run side effects when signals change with built-in cleanup.', 
      icon: '⚡', 
      difficulty: 'Beginner',
      learn: 'React to signal changes with automatic cleanup'
    },
    { 
      id: 'hooks', 
      name: 'React Hooks', 
      description: 'Complete React integration with useSignal, useSignalValue, and useSignalEffect.', 
      icon: '⚛️', 
      difficulty: 'Beginner',
      learn: 'All the React hooks you need for SignalForge'
    },
    // ===== INTERMEDIATE DEMOS =====
    { 
      id: 'batch', 
      name: 'Batch Updates', 
      description: 'Update multiple signals efficiently with batched updates for better performance.', 
      icon: '🚀', 
      difficulty: 'Intermediate',
      learn: 'Optimize performance with batched updates'
    },
    { 
      id: 'subscribe', 
      name: 'Subscribe', 
      description: 'Listen to signal changes outside React for logging or analytics.', 
      icon: '👂', 
      difficulty: 'Intermediate',
      learn: 'Monitor signal changes with subscriptions'
    },
    { 
      id: 'cart', 
      name: 'Shopping Cart', 
      description: 'E-commerce cart with add/remove items, quantities, and automatic total calculation.', 
      icon: '🛒', 
      difficulty: 'Intermediate',
      learn: 'Build a complete shopping cart feature'
    },
    { 
      id: 'form', 
      name: 'Form Validation', 
      description: 'Dynamic form with real-time validation and error messages.', 
      icon: '📝', 
      difficulty: 'Intermediate',
      learn: 'Create forms with live validation'
    },
    { 
      id: 'todo', 
      name: 'Todo App', 
      description: 'Full CRUD application with add, edit, delete, and filter functionality.', 
      icon: '✅', 
      difficulty: 'Intermediate',
      learn: 'Build a complete CRUD application'
    },
    { 
      id: 'array', 
      name: 'Array Signal', 
      description: 'Work with arrays using push, filter, and map optimized for signals.', 
      icon: '📋', 
      difficulty: 'Intermediate',
      learn: 'Handle arrays with signal-optimized methods'
    },
    // ===== ADVANCED DEMOS =====
    { 
      id: 'untrack', 
      name: 'Untrack', 
      description: 'Read signals without creating dependencies for advanced control.', 
      icon: '🔓', 
      difficulty: 'Advanced',
      learn: 'Fine-tune reactivity with untrack()'
    },
    { 
      id: 'persistent', 
      name: 'Persistent Signal', 
      description: 'Auto-save to localStorage with simple one-line configuration.', 
      icon: '💾', 
      difficulty: 'Advanced',
      learn: 'Persist state across page reloads'
    },
    { 
      id: 'bigdata', 
      name: 'Big Data', 
      description: 'Handle 10,000+ items efficiently to see how SignalForge scales.', 
      icon: '📊', 
      difficulty: 'Advanced',
      learn: 'Test performance with large datasets'
    },
    { 
      id: 'devtools', 
      name: 'DevTools', 
      description: 'Inspect signals in real-time with debugging tools and time-travel.', 
      icon: '🛠️', 
      difficulty: 'Advanced',
      learn: 'Debug with signal inspector and profiler'
    },
    { 
      id: 'timetravel', 
      name: 'Time Travel', 
      description: 'Built-in undo/redo functionality for state changes.', 
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
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: '#020617', // Fallback solid color for Safari
        backgroundImage: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
        WebkitBackgroundSize: 'cover',
        backgroundSize: 'cover',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(71, 85, 105) 1px, transparent 0)',
          backgroundSize: '40px 40px',
          WebkitBackgroundSize: '40px 40px',
        }} />
      </div>

      {/* Subtle background orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl opacity-50" />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Logo with glassmorphism */}
          <div className="relative inline-block mb-8">
            <div className="relative p-8 md:p-10 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl hover:border-blue-500/50 transition-all duration-300">
              <img
                src="https://raw.githubusercontent.com/forgecommunity/signalforge/refs/heads/master/docs/assets/signalforge.png"
                alt="SignalForge logo"
                className="w-full max-w-[220px] md:max-w-[280px] lg:max-w-[320px] mx-auto object-contain"
                loading="eager"
              />
            </div>
          </div>

          {/* Hero title with gradient */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Fine-Grained Reactive
            </span>
            <br />
            <span className="text-white">
              State Management
            </span>
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 max-w-3xl mx-auto animate-fade-in-up font-light" style={{ animationDelay: '0.3s' }}>
            Build <span className="text-blue-400 font-semibold">lightning-fast</span> apps with <span className="text-purple-400 font-semibold">zero boilerplate</span>
          </p>
          
          <p className="text-base md:text-lg text-gray-400 mb-10 max-w-2xl mx-auto animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.4s' }}>
            The modern state management library for React & React Native. 
            <span className="text-blue-400"> 33x faster</span>, 
            <span className="text-purple-400"> 90% less code</span>, 
            <span className="text-pink-400"> infinitely simpler</span>.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex justify-center gap-4 flex-wrap mb-12">
            <a
              href="https://www.npmjs.com/package/signalforge"
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                <span>🚀</span>
                <span>Get Started Now</span>
              </span>
            </a>
            <a
              href="https://github.com/forgecommunity/signalforge"
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 backdrop-blur-xl bg-white/5 text-white rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 border border-white/10 hover:border-purple-500/50"
            >
              <span className="flex items-center gap-2">
                <span>⭐</span>
                <span>Star on GitHub</span>
              </span>
            </a>
          </div>

          {/* Quick Stats with cards */}
          <div className="flex justify-center gap-4 flex-wrap max-w-4xl mx-auto">
            {[
              { icon: '🪶', label: '2KB Gzipped', color: 'blue' },
              { icon: '⚡', label: '33x Faster', color: 'purple' },
              { icon: '📦', label: 'Zero Deps', color: 'pink' },
              { icon: '🎯', label: 'TypeScript', color: 'indigo' },
            ].map((stat, i) => (
              <div key={i} className="backdrop-blur-xl bg-white/5 rounded-xl px-6 py-3 border border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className={`font-semibold text-${stat.color}-400`}>{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Start - Moved Higher */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Quick Start
              </span>
            </h2>
            <div className="space-y-5">
              <div className="backdrop-blur-xl bg-black/20 rounded-xl p-5 border border-green-500/20">
                <div className="text-sm text-green-400 mb-2 font-bold flex items-center gap-2">
                  <span className="text-xl">1️⃣</span> Install
                </div>
                <code className="text-white text-lg font-mono">npm install signalforge</code>
              </div>
              <div className="backdrop-blur-xl bg-black/20 rounded-xl p-5 border border-blue-500/20">
                <div className="text-sm text-blue-400 mb-3 font-bold flex items-center gap-2">
                  <span className="text-xl">2️⃣</span> Use in React
                </div>
                <pre className="text-sm overflow-x-auto">
                  <code className="text-gray-200">
<span className="text-purple-400">import</span> {'{'} <span className="text-blue-300">useSignal</span> {'}'} <span className="text-purple-400">from</span> <span className="text-green-400">'signalforge/react'</span>;
{'\n\n'}
<span className="text-purple-400">function</span> <span className="text-yellow-300">Counter</span>() {'{'}
{'\n  '}
<span className="text-purple-400">const</span> [count, setCount] = <span className="text-yellow-300">useSignal</span>(<span className="text-orange-400">0</span>);
{'\n  '}
<span className="text-purple-400">return</span> {'<'}<span className="text-green-300">button</span> <span className="text-blue-300">onClick</span>={'{'}() {'=>'} setCount(count + <span className="text-orange-400">1</span>){'}'}{'>'}
{'\n    '}Clicked {'{'}count{'}'} times
{'\n  '}{'</'}<span className="text-green-300">button</span>{'>'};
{'\n}'}
                  </code>
                </pre>
              </div>
              <div className="backdrop-blur-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-5 border border-green-500/30">
                <div className="text-center">
                  <span className="text-3xl mb-2 block">🎉</span>
                  <p className="text-green-300 font-semibold">That's it! No providers, no context, just works!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Demos Section - MOVED UP */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Learn By Doing
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-3">
              15 interactive demos that make you a SignalForge expert
            </p>
            <div className="inline-flex items-center gap-2 backdrop-blur-xl bg-orange-500/10 px-6 py-3 rounded-full border border-orange-500/30">
              <span className="text-orange-400 font-semibold">Start with Featured Comparisons</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {demos.map((demo, index) => (
              <Link
                key={demo.id}
                href={`/demos/${demo.id}`}
                className={`group block relative overflow-hidden backdrop-blur-xl rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                  demo.featured 
                    ? 'bg-gradient-to-br from-orange-600/20 via-red-600/20 to-pink-600/20 border-2 border-orange-400/50 hover:border-orange-300' 
                    : 'bg-white/5 border border-white/10 hover:border-blue-400/50'
                }`}
              >
                <div className="relative p-6">
                  {/* Badges row */}
                  <div className="flex justify-between items-start mb-4">
                    {/* Featured badge */}
                    {demo.featured && (
                      <div className="text-xs px-3 py-1.5 rounded-full font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white border border-orange-300/50">
                        FEATURED
                      </div>
                    )}
                    
                    {/* Difficulty badge */}
                    <div className={`text-xs px-3 py-1.5 rounded-full font-semibold backdrop-blur-sm ${demo.featured ? 'ml-auto' : ''} ${
                      demo.difficulty === 'Featured' ? 'bg-orange-500/30 text-orange-200 border border-orange-400/50' :
                      demo.difficulty === 'Beginner' ? 'bg-green-500/30 text-green-200 border border-green-400/50' :
                      demo.difficulty === 'Intermediate' ? 'bg-blue-500/30 text-blue-200 border border-blue-400/50' :
                      'bg-purple-500/30 text-purple-200 border border-purple-400/50'
                    }`}>
                      {demo.difficulty}
                    </div>
                  </div>
                  
                  {/* Icon */}
                  <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110">
                    {demo.icon}
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-xl font-bold text-white mb-3 transition-colors">
                    {demo.name}
                  </h2>
                  
                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    {demo.description}
                  </p>
                  
                  {/* Learn badge */}
                  {demo.learn && (
                    <div className="bg-blue-500/10 rounded-lg px-3 py-2 mb-4 border border-blue-500/20">
                      <p className="text-xs text-blue-300/90 leading-relaxed">
                        {demo.learn}
                      </p>
                    </div>
                  )}
                  
                  {/* CTA Arrow */}
                  <div className="flex items-center gap-2 text-blue-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm">Explore Demo</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>

                {/* Corner glow */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 ${
                  demo.featured ? 'bg-orange-500' : 'bg-blue-500'
                }`}></div>
              </Link>
            ))}
          </div>
        </div>

        {/* Code Example Showcase */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                See The Difference
              </span>
            </h2>
            <p className="text-xl text-gray-400">
              Compare traditional React to SignalForge
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Code Block */}
            <div className="backdrop-blur-xl bg-slate-900/80 rounded-2xl p-6 border border-blue-500/20 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02]">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-2 text-gray-400 text-sm font-mono">app.tsx</span>
              </div>
              <pre className="text-sm md:text-base overflow-x-auto">
                <code className="text-gray-200">
<span className="text-purple-400">import</span> <span className="text-blue-400">{'{'} createSignal {'}'}</span> <span className="text-purple-400">from</span> <span className="text-green-400">'signalforge'</span>;
{'\n\n'}
<span className="text-gray-500">// Create a signal</span>
{'\n'}
<span className="text-purple-400">const</span> <span className="text-blue-300">count</span> = <span className="text-yellow-400">createSignal</span>(<span className="text-orange-400">0</span>);
{'\n\n'}
<span className="text-gray-500">// Auto-updating computed value</span>
{'\n'}
<span className="text-purple-400">const</span> <span className="text-blue-300">doubled</span> = <span className="text-yellow-400">createComputed</span>(<span className="text-gray-400">()</span> {'=>'} 
{'\n  '}count.<span className="text-yellow-400">get</span>() * <span className="text-orange-400">2</span>
{'\n'});
{'\n\n'}
<span className="text-gray-500">// Update = UI updates automatically! ✨</span>
{'\n'}
count.<span className="text-yellow-400">set</span>(<span className="text-orange-400">5</span>);
                </code>
              </pre>
            </div>

            {/* Feature Cards */}
            <div className="space-y-4">
              <div className="backdrop-blur-xl bg-blue-500/10 rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02] group">
                <div className="flex items-start gap-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform">⚡</div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
                    <p className="text-gray-400">Fine-grained reactivity means only what changed re-renders. 33x faster than useState + useEffect.</p>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-purple-500/10 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] group">
                <div className="flex items-start gap-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform">🎯</div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Zero Boilerplate</h3>
                    <p className="text-gray-400">No providers, no actions, no reducers, no selectors. Just signals. Compare 200 lines of Redux to 20 lines of SignalForge.</p>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-pink-500/10 rounded-xl p-6 border border-pink-500/20 hover:border-pink-500/50 transition-all duration-300 hover:scale-[1.02] group">
                <div className="flex items-start gap-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform">🪶</div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Tiny Bundle</h3>
                    <p className="text-gray-400">Just 2KB gzipped. Zero dependencies. Tree-shakeable. Your users will thank you.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Everything You Need
              </span>
            </h2>
            <p className="text-xl text-gray-400">
              Professional features that developers love
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500"></div>
                
                <div className="relative z-10">
                  <div className="text-5xl mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 inline-block">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                
                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              </div>
            ))}
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
        <div className="mt-32 pt-12 border-t border-white/10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-8 border border-purple-500/20">
              <h3 className="text-2xl font-bold text-white mb-3">
                Built by <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Forge Community</span>
              </h3>
              <p className="text-gray-300 mb-6">
                An open-source collective crafting high-quality tools for modern JavaScript
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                <a
                  href="https://github.com/forgecommunity"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 backdrop-blur-xl bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all border border-white/20 hover:scale-105 font-semibold"
                >
                  🔗 Forge Community
                </a>
                <a
                  href="https://www.npmjs.com/package/signalforge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 backdrop-blur-xl bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all border border-white/20 hover:scale-105 font-semibold"
                >
                  📦 npm
                </a>
                <a
                  href="https://github.com/forgecommunity/signalforge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 backdrop-blur-xl bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all border border-white/20 hover:scale-105 font-semibold"
                >
                  ⭐ GitHub
                </a>
              </div>
            </div>
          </div>
          
          <div className="text-center text-gray-400 text-sm pb-8">
            <p className="mb-2">
              MIT Licensed • 100% Open Source • Made with ❤️ for developers
            </p>
            <p className="text-gray-500">
              2KB gzipped • Zero Dependencies • TypeScript • Production Ready
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
