/**
 * StructuredData Component
 * 
 * Provides JSON-LD structured data for better SEO and rich search results.
 * This helps Google understand your brand, logo, and organization details.
 */

interface StructuredDataProps {
  type?: 'organization' | 'website' | 'article' | 'faqPage'
  data?: Record<string, unknown>
}

export function StructuredData({ type = 'organization', data = {} }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseUrl = 'https://joinbrightnest.com'

    switch (type) {
      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'BrightNest',
          alternateName: 'BrightNest Financial',
          url: baseUrl,
          logo: `${baseUrl}/icon.png`,
          description: 'Discover your financial personality and get personalized insights for a brighter financial future.',
          sameAs: [
            // Add your social media profiles here when available
            // 'https://www.facebook.com/brightnest',
            // 'https://twitter.com/brightnest',
            // 'https://www.linkedin.com/company/brightnest',
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            availableLanguage: 'English',
          },
          ...data,
        }

      case 'website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'BrightNest',
          url: baseUrl,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
          ...data,
        }

      case 'article':
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          publisher: {
            '@type': 'Organization',
            name: 'BrightNest',
            logo: {
              '@type': 'ImageObject',
              url: `${baseUrl}/icon.png`,
            },
          },
          ...data,
        }

      case 'faqPage':
        return {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          ...data,
        }

      default:
        return data
    }
  }

  const structuredData = getStructuredData()

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

