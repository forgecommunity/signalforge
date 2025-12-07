import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://signalforge-fogecommunity.vercel.app'
  
  // Demo pages
  const demos = [
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
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...demoPages,
  ]
}
