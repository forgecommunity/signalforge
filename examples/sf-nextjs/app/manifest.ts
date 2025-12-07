import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SignalForge - Fine-Grained Reactive State Management',
    short_name: 'SignalForge',
    description: 'The simplest state management library for React and React Native. Only 2KB, 33x faster updates.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
