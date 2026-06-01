import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://signalforge-fogecommunity.vercel.app'
  const now = new Date()
  
  // Demo pages
  const demos = [
    'dashboard',
    'plugin',
    'comparison',
    'collaboration',
    'chains',
    'benchmark',
    'basic',
    'hooks',
    'computed',
    'effects',
    'batch',
    'subscribe',
    'untrack',
    'array',
    'cart',
    'form',
    'todo',
    'persistent',
    'timetravel',
    'devtools',
    'bigdata',
  ]

  const demoPages = demos.map(demo => ({
    url: `${baseUrl}/demos/${demo}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: demo === 'dashboard' || demo === 'plugin' || demo === 'benchmark' ? 0.85 : 0.75,
  }))

  const docs = [
    'docs',
    'docs/api',
    'docs/examples',
    'docs/benchmarks',
    'docs/migration',
    'docs/production',
  ]

  const docsPages = docs.map(page => ({
    url: `${baseUrl}/${page}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: page === 'docs' || page === 'docs/api' ? 0.95 : 0.9,
  }))

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...docsPages,
    ...demoPages,
  ]
}
