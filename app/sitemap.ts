import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://top-pizza.shop'
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/checkout`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/dostavka`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/oferta`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/rekvizity`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]
}
