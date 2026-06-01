import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SignalForge vs Redux/Zustand - Side-by-Side Comparison',
  description: 'Compare SignalForge with Redux and Zustand through the same shopping cart workflow, API shape, and update model.',
  keywords: ['redux', 'zustand', 'comparison', 'shopping cart', 'performance', 'state management'],
  openGraph: {
    title: 'SignalForge vs Redux/Zustand Comparison',
    description: 'Compare SignalForge with Redux and Zustand using the same shopping cart workflow.',
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
