import { Metadata } from 'next';

interface DemoMetadata {
  title: string;
  description: string;
  keywords?: string[];
}

export function generateDemoMetadata(demo: DemoMetadata): Metadata {
  const baseUrl = 'https://signalforge-fogecommunity.vercel.app';
  
  return {
    title: demo.title,
    description: demo.description,
    keywords: [
      'signalforge',
      'react',
      'state management',
      'demo',
      'example',
      ...(demo.keywords || []),
    ],
    openGraph: {
      title: `${demo.title} | SignalForge`,
      description: demo.description,
      type: 'website',
      images: [
        {
          url: 'https://raw.githubusercontent.com/forgecommunity/signalforge/refs/heads/master/docs/assets/signalforge.png',
          width: 1200,
          height: 630,
          alt: 'SignalForge',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${demo.title} | SignalForge`,
      description: demo.description,
    },
  };
}

export const demoMetadata = {
  comparison: {
    title: 'SignalForge vs Redux/Zustand - Side-by-Side Comparison',
    description: 'Compare SignalForge with Redux and Zustand. See 90% less code with the same shopping cart functionality and better performance.',
    keywords: ['redux', 'zustand', 'comparison', 'shopping cart', 'performance'],
  },
  collaboration: {
    title: 'Fine-Grained Reactivity Demo - Real-time Collaboration',
    description: 'Experience fine-grained reactivity with real-time collaboration. Only edited cells re-render, unlike Redux/Context.',
    keywords: ['fine-grained', 'reactivity', 'collaboration', 'real-time', 'performance'],
  },
  chains: {
    title: 'Advanced Computed Chains - Dependency Tracking',
    description: 'Complex nested calculations with visual dependency tree and automatic updates. See how SignalForge handles computed chains.',
    keywords: ['computed', 'chains', 'dependency', 'automatic', 'reactive'],
  },
  benchmark: {
    title: 'Live Performance Benchmark - Speed Comparison',
    description: 'Real-time performance comparison showing render counts and speed differences. SignalForge is 33x faster.',
    keywords: ['benchmark', 'performance', 'speed', 'comparison', 'render'],
  },
  basic: {
    title: 'Basic Signal Usage - Getting Started',
    description: 'Learn the basics of SignalForge. Create signals, update values, and see automatic UI updates.',
    keywords: ['basic', 'tutorial', 'getting started', 'signals', 'beginner'],
  },
  hooks: {
    title: 'React Hooks Integration - useSignal & useSignalEffect',
    description: 'Use SignalForge with React hooks. Learn useSignal and useSignalEffect patterns.',
    keywords: ['hooks', 'react', 'useSignal', 'useSignalEffect', 'integration'],
  },
  computed: {
    title: 'Computed Values Demo - Automatic Calculations',
    description: 'Create computed values that automatically update when dependencies change. No manual selectors needed.',
    keywords: ['computed', 'derived', 'automatic', 'calculations', 'reactive'],
  },
  effects: {
    title: 'Effects System - Side Effects Management',
    description: 'Handle side effects with SignalForge effects system. Automatic cleanup and dependency tracking.',
    keywords: ['effects', 'side effects', 'cleanup', 'dependencies', 'reactive'],
  },
  batch: {
    title: 'Batched Updates - Performance Optimization',
    description: 'Batch multiple updates into a single render. 33x faster than individual updates.',
    keywords: ['batch', 'performance', 'optimization', 'updates', 'render'],
  },
  subscribe: {
    title: 'Subscription System - Listen to Changes',
    description: 'Subscribe to signal changes and react to updates. Fine-grained control over reactions.',
    keywords: ['subscribe', 'listen', 'changes', 'observer', 'reactive'],
  },
  untrack: {
    title: 'Untracked Reads - Control Dependencies',
    description: 'Read signal values without creating dependencies. Fine-grained control over reactivity.',
    keywords: ['untrack', 'dependencies', 'control', 'read', 'reactive'],
  },
  array: {
    title: 'Array Operations - List Management',
    description: 'Efficient array operations with SignalForge. Add, remove, and update items with minimal re-renders.',
    keywords: ['array', 'list', 'operations', 'crud', 'performance'],
  },
  cart: {
    title: 'Shopping Cart Example - Real-world Use Case',
    description: 'Full shopping cart implementation with SignalForge. Add items, update quantities, calculate totals.',
    keywords: ['shopping cart', 'e-commerce', 'example', 'real-world', 'application'],
  },
  form: {
    title: 'Form Handling - Input Management',
    description: 'Handle forms with SignalForge. Validation, submission, and state management made easy.',
    keywords: ['form', 'input', 'validation', 'handling', 'state'],
  },
  todo: {
    title: 'Todo App Example - Classic Use Case',
    description: 'Classic todo app built with SignalForge. Add, edit, delete, and filter todos.',
    keywords: ['todo', 'task', 'example', 'crud', 'application'],
  },
  persistent: {
    title: 'Persistent State - LocalStorage Integration',
    description: 'Persist state to localStorage automatically. State survives page refreshes.',
    keywords: ['persistent', 'localStorage', 'storage', 'persist', 'save'],
  },
  timetravel: {
    title: 'Time Travel Debugging - Undo/Redo',
    description: 'Debug with time travel. Undo and redo state changes with full history.',
    keywords: ['time travel', 'debug', 'undo', 'redo', 'history'],
  },
  devtools: {
    title: 'DevTools Integration - Inspector & Profiler',
    description: 'Debug with SignalForge DevTools. Inspect signals, track dependencies, profile performance.',
    keywords: ['devtools', 'inspector', 'profiler', 'debug', 'developer'],
  },
  bigdata: {
    title: 'Big Data Performance - Scalability Test',
    description: 'Handle thousands of signals efficiently. Test SignalForge scalability with large datasets.',
    keywords: ['big data', 'performance', 'scalability', 'large', 'dataset'],
  },
};
