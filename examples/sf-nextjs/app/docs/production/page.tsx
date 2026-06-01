import { DocCard, DocsShell } from '../DocsShell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SignalForge Production Validation - CI, Audits, SSR, DevTools, Real Apps',
  description: 'SignalForge production readiness checklist covering CI, package smoke tests, audits, SSR, examples, DevTools, and real app validation.',
  alternates: { canonical: '/docs/production' },
};

export default function ProductionPage() {
  return (
    <DocsShell
      eyebrow="Production"
      title="Validation before number-one claims"
      description="The library needs a serious app integration, clean CI, audited examples, SSR coverage, and package smoke tests before aggressive positioning."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <DocCard title="Required gates">
          <ul className="list-disc space-y-2 pl-5">
            <li>Root build, tests, package smoke, package contents, size, and audit pass.</li>
            <li>Next.js, React Native, and React examples build from the local package.</li>
            <li>Docs, examples, and README avoid unsupported claims.</li>
          </ul>
        </DocCard>
        <DocCard title="Serious app validation">
          Validate dashboard filters, form validation, persistence, custom plugins, SSR hydration, and DevTools inspection in one app before declaring the public release mature.
        </DocCard>
      </div>
    </DocsShell>
  );
}
