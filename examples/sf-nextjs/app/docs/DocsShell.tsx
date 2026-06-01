import Link from 'next/link';
import type { ReactNode } from 'react';

const navItems = [
  { href: '/docs', label: 'Guides' },
  { href: '/docs/api', label: 'API' },
  { href: '/docs/examples', label: 'Examples' },
  { href: '/docs/benchmarks', label: 'Benchmarks' },
  { href: '/docs/migration', label: 'Migration' },
  { href: '/docs/production', label: 'Production' },
];

export function DocsShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="lg:sticky lg:top-8 lg:h-fit">
          <Link href="/" className="mb-8 inline-flex text-sm text-emerald-300 hover:text-emerald-200">
            Back to SignalForge
          </Link>
          <nav className="grid gap-2 rounded-lg border border-slate-800 bg-slate-900/80 p-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <section>
          <header className="border-b border-slate-800 pb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">{eyebrow}</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-normal text-white md:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">{description}</p>
          </header>

          <div className="py-8">{children}</div>
        </section>
      </div>
    </main>
  );
}

export function DocCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-3 text-sm leading-7 text-slate-300">{children}</div>
    </article>
  );
}

export function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-black p-4 text-sm text-emerald-200">
      <code>{children}</code>
    </pre>
  );
}
