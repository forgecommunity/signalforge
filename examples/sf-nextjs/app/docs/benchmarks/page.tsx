import { CodeBlock, DocCard, DocsShell } from '../DocsShell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SignalForge Benchmarks - Reproducible State Management Performance',
  description: 'SignalForge benchmark methodology for comparing signals, stores, selector reads, batched updates, bundle sizes, and runtime performance.',
  alternates: { canonical: '/docs/benchmarks' },
};

export default function BenchmarksPage() {
  return (
    <DocsShell
      eyebrow="Benchmarks"
      title="Benchmark claims must be reproducible"
      description="SignalForge should earn trust with scripts, workload descriptions, runtime versions, and hardware notes."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <DocCard title="Run the suite">
          Use the repository benchmark scripts and publish the command output with package versions.
        </DocCard>
        <DocCard title="Avoid unsupported claims">
          Do not publish fixed ratios unless the exact benchmark, environment, and competing versions are included.
        </DocCard>
      </div>
      <div className="mt-6">
        <CodeBlock>{`npm run benchmark:compare
npm run size
npm run test:all`}</CodeBlock>
      </div>
    </DocsShell>
  );
}
