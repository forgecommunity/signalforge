import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Performance Benchmark - Speed Comparison',
  description: 'Real-time performance comparison showing render counts and batched update behavior.',
  keywords: ['benchmark', 'performance', 'speed', 'comparison', 'render', 'signalforge'],
  openGraph: {
    title: 'SignalForge Performance Benchmark',
    description: 'Real-time performance comparison for SignalForge update behavior.',
    images: [{
      url: 'https://raw.githubusercontent.com/forgecommunity/signalforge/refs/heads/master/docs/assets/signalforge.png',
      width: 1200,
      height: 630,
    }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
