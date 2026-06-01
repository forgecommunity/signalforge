import { CodeBlock, DocCard, DocsShell } from './DocsShell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SignalForge Guides - Signals, Stores, React Hooks, SSR, and DevTools',
  description: 'SignalForge guides for fine-grained signals, computed values, stores, batching, SSR-safe React hooks, React Native, plugins, and DevTools.',
  alternates: { canonical: '/docs' },
};

export default function GuidesPage() {
  return (
    <DocsShell
      eyebrow="Guides"
      title="Build with SignalForge deliberately"
      description="A production guide to signals, stores, React integration, SSR, DevTools, and release discipline."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <DocCard title="Signals">
          Create shared state with <code>createSignal</code>. Read it outside React with <code>get()</code>, and inside
          React with <code>useSignalValue</code> so subscriptions are lifecycle-safe.
        </DocCard>
        <DocCard title="Computed values">
          Use <code>createComputed</code> for derived state. Keep side effects out of computed functions and let the
          dependency graph update automatically.
        </DocCard>
        <DocCard title="Stores">
          Use <code>createStore</code> or <code>defineStore</code> when a feature has multiple fields and selectors.
          Use <code>shallowEqual</code> for small object selectors.
        </DocCard>
        <DocCard title="Batching">
          Wrap one user action that writes several signals in <code>batch</code>. This coalesces notifications and
          keeps dependent work predictable.
        </DocCard>
      </div>

      <div className="mt-6">
        <CodeBlock>{`import { createSignal, createComputed, batch } from 'signalforge/core';
import { useSignalValue } from 'signalforge/react';

const count = createSignal(0);
const doubled = createComputed(() => count.get() * 2);

function Counter() {
  const value = useSignalValue(doubled);
  return <button onClick={() => batch(() => count.set((n) => n + 1))}>{value}</button>;
}`}</CodeBlock>
      </div>
    </DocsShell>
  );
}
