import Link from 'next/link';
import { DocCard, DocsShell } from '../DocsShell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SignalForge Examples - Next.js, React Native, Dashboard, Forms, Persistence, Plugins',
  description: 'Buildable SignalForge examples for Next.js, React Native, dashboards, forms, persistence, plugins, carts, and DevTools debugging.',
  alternates: { canonical: '/docs/examples' },
};

const examples = [
  ['/demos/dashboard', 'Dashboard app', 'Operational metrics, filters, derived totals, and live status.'],
  ['/demos/form', 'Form app', 'Real-time validation and field state.'],
  ['/demos/persistent', 'Persistence app', 'Browser storage-backed preferences.'],
  ['/demos/plugin', 'Plugin app', 'Custom plugin lifecycle debugging.'],
  ['/demos/cart', 'Commerce app', 'Cart totals, quantities, and derived values.'],
  ['/demos/devtools', 'DevTools app', 'Runtime inspection and performance monitoring.'],
];

export default function ExamplesPage() {
  return (
    <DocsShell
      eyebrow="Examples"
      title="Real examples maintained in the site"
      description="Examples are actual routes that build with the local package. They should stay useful for users and CI."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {examples.map(([href, title, description]) => (
          <Link key={href} href={href}>
            <DocCard title={title}>
              <p>{description}</p>
              <p className="mt-3 text-emerald-300">Open {href}</p>
            </DocCard>
          </Link>
        ))}
      </div>
    </DocsShell>
  );
}
