import { CodeBlock, DocCard, DocsShell } from '../DocsShell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SignalForge Migration Guide - Redux, Zustand, Context, and React State',
  description: 'Incremental migration guide from Redux, Zustand, Context, and useState to SignalForge signals, stores, computed values, and selectors.',
  alternates: { canonical: '/docs/migration' },
};

export default function MigrationPage() {
  return (
    <DocsShell
      eyebrow="Migration"
      title="Adopt SignalForge feature by feature"
      description="Production migration should be incremental. Replace one feature state boundary, verify behavior, then continue."
    >
      <div className="grid gap-5">
        <DocCard title="Recommended path">
          <ol className="list-decimal space-y-2 pl-5">
            <li>Move one isolated feature to <code>createStore</code>.</li>
            <li>Replace broad context consumers with <code>useStoreSelector</code>.</li>
            <li>Move derived fields into <code>createComputed</code> or <code>useComputed</code>.</li>
            <li>Enable DevTools in development and inspect fan-out before expanding usage.</li>
          </ol>
        </DocCard>
      </div>
      <div className="mt-6">
        <CodeBlock>{`const store = createStore({ items: [], filter: 'all' });
const visible = useStoreSelector(store, (state) => state.items.filter(/* feature rule */));`}</CodeBlock>
      </div>
    </DocsShell>
  );
}
