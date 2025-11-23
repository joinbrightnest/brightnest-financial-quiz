import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://joinbrightnest.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Disallow admin and private areas
        disallow: ['/admin/', '/api/', '/closer/dashboard/', '/affiliate/dashboard/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

