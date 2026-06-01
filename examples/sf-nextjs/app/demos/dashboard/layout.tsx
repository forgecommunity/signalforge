import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SignalForge Dashboard Example - Fine-Grained Operational State',
  description: 'A SignalForge dashboard example with filters, derived totals, batched updates, and fine-grained React subscriptions.',
  alternates: { canonical: '/demos/dashboard' },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
