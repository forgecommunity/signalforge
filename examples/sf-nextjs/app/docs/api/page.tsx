import { CodeBlock, DocCard, DocsShell } from '../DocsShell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SignalForge API Reference - Core, React, DevTools, Plugins, Utils',
  description: 'Complete SignalForge API reference for signalforge/core, signalforge/react, signalforge/devtools, signalforge/plugins, and signalforge/utils.',
  alternates: { canonical: '/docs/api' },
};

const rows = [
  ['signalforge/core', 'createSignal, createComputed, createEffect, batch, untrack, createStore, defineStore, shallowEqual'],
  ['signalforge/react', 'useSignal, useSignalValue, useComputed, useStore, useStoreSelector, useSignalEffect'],
  ['signalforge/devtools', 'DevToolsProvider, DevToolsPanel, getSignalGraph, getPerformanceMetrics, getActivePlugins'],
  ['signalforge/plugins', 'registerPlugin, unregisterPlugin, logger and time-travel helpers'],
  ['signalforge/utils', 'storage adapters and persistence helpers'],
];

export default function ApiPage() {
  return (
    <DocsShell
      eyebrow="API"
      title="Public API reference"
      description="SignalForge is split into explicit entrypoints so apps can import only the surface they need."
    >
      <div className="grid gap-4">
        {rows.map(([entry, exports]) => (
          <DocCard key={entry} title={entry}>
            <p>{exports}</p>
          </DocCard>
        ))}
      </div>
      <div className="mt-6">
        <CodeBlock>{`import { createStore, shallowEqual } from 'signalforge/core';
import { useStoreSelector } from 'signalforge/react';

const session = createStore({ userId: null as string | null, roles: [] as string[] });

function Header() {
  const view = useStoreSelector(
    session,
    (state) => ({ userId: state.userId, roles: state.roles }),
    [],
    shallowEqual,
  );
  return <span>{view.userId ?? 'Guest'}</span>;
}`}</CodeBlock>
      </div>
    </DocsShell>
  );
}
