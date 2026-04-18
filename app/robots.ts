import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/create-admin'] },
    sitemap: 'https://top-pizza.shop/sitemap.xml',
  }
}
