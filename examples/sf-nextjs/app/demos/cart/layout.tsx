import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopping Cart Example - Real-world Use Case',
  description: 'Full shopping cart implementation with SignalForge. Add items, update quantities, calculate totals with automatic reactivity.',
  keywords: ['shopping cart', 'e-commerce', 'example', 'real-world', 'application', 'signalforge'],
  openGraph: {
    title: 'SignalForge Shopping Cart Example',
    description: 'Full shopping cart with automatic reactivity and zero boilerplate.',
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
