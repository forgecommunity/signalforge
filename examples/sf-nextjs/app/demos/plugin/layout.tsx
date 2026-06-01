import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SignalForge Plugin Example - Audit Hooks and DevTools Debugging',
  description: 'A SignalForge plugin example showing custom audit hooks, signal update debugging, and plugin lifecycle validation.',
  alternates: { canonical: '/demos/plugin' },
};

export default function PluginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
