import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SignalForge - Fine-Grained Reactive State Management',
    short_name: 'SignalForge',
    description: 'Fine-grained reactive state management for React, React Native, Next.js, and TypeScript.',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#10b981',
    categories: ['developer', 'productivity', 'utilities'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
