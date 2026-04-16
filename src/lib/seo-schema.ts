// SEO Schema.org Generator — generates JSON-LD structured data
// For services, FAQs, local business, breadcrumbs, etc.
// Production-ready with type safety, error handling, and configurable URLs

import type { ServiceDefinition, AustralianState } from '../lib/services-au'
import type { FAQEntry } from '../lib/faqs'
import { SITE_CONFIG } from '../lib/constants'

// ──────────────────────────────────────────────────────────────
// Type Definitions
// ──────────────────────────────────────────────────────────────

export interface SEODataOutput {
  localBusiness: LocalBusinessSchema
  website: WebSiteSchema
  og: Record<string, string>
  twitter: Record<string, string>
  service?: ServiceSchema
  fAQ?: FAQPageSchema
  breadcrumbs?: BreadcrumbListSchema
  alternates?: AlternateMetaTags
  preload?: PreloadTags
}

export interface AlternateMetaTags {
  hrefLang: { lang: string; url: string }[]
}

export interface PreloadTags {
  images: { url: string; as?: string; type?: string }[]
  fonts?: { url: string; type: string; crossOrigin?: string }[]
}

// JSON-LD Schema Types
interface LocalBusinessSchema {
  '@context': 'https://schema.org'
  '@type': 'LocalBusiness'
  name: string
  description: string
  url: string
  telephone: string
  email: string
  abn: string
  address: {
    '@type': 'PostalAddress'
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  geo: {
    '@type': 'GeoCoordinates'
    latitude: number
    longitude: number
  }
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification'
    dayOfWeek: string | string[]
    opens: string
    closes: string
  }[]
  priceRange: string
  areaServed: { '@type': 'State'; name: string }[]
  aggregateRating: {
    '@type': 'AggregateRating'
    ratingValue: string
    reviewCount: string
    bestRating: string
    worstRating: string
  }
  sameAs: string[]
}

interface ServiceSchema {
  '@context': 'https://schema.org'
  '@type': 'Service'
  name: string
  description: string
  provider: {
    '@type': 'LocalBusiness'
    name: string
    telephone: string
  }
  areaServed: {
    '@type': 'City'
    name: string
    containedInPlace: {
      '@type': 'State'
      name: string
    }
  }
  offers: {
    '@type': 'Offer'
    priceCurrency: 'AUD'
    price: string
    priceSpecification: {
      '@type': 'PriceSpecification'
      price: string
      priceCurrency: 'AUD'
      minPrice: string
      maxPrice: string
      unitText: string
    }
  }
  serviceType: string
  category: string
  additionalProperty?: {
    '@type': 'PropertyValue'
    name: string
  }[]
}

interface FAQPageSchema {
  '@context': 'https://schema.org'
  '@type': 'FAQPage'
  mainEntity: {
    '@type': 'Question'
    name: string
    acceptedAnswer: {
      '@type': 'Answer'
      text: string
    }
  }[]
}

interface BreadcrumbListSchema {
  '@context': 'https://schema.org'
  '@type': 'BreadcrumbList'
  itemListElement: {
    '@type': 'ListItem'
    position: number
    name: string
    item: string
  }[]
}

interface WebSiteSchema {
  '@context': 'https://schema.org'
  '@type': 'WebSite'
  name: string
  url: string
  potentialAction: {
    '@type': 'SearchAction'
    target: {
      '@type': 'EntryPoint'
      urlTemplate: string
    }
    'query-input': string
  }
}

export interface SEOOptions {
  title: string
  description: string
  url: string
  image?: string
  type?: string
  faqs?: FAQEntry[]
  service?: ServiceDefinition
  state?: AustralianState
  city?: string
  breadcrumbs?: { name: string; url: string }[]
  alternates?: { lang: string; url: string }[]
  preloadImages?: string[]
}

// ──────────────────────────────────────────────────────────────
// Helper: Safe URL normalizer
// ──────────────────────────────────────────────────────────────

export function normalizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return 'https://sparkleclean.pro' // Fallback to prevent breakage
  }
  // Remove trailing slashes, ensure https://
  const cleaned = url.replace(/\/+$/, '').trim()
  if (!cleaned.startsWith('http')) {
    return `https://${cleaned}`
  }
  return cleaned
}

export function buildFullUrl(path: string): string {
  const siteUrl = normalizeUrl(SITE_CONFIG.siteUrl)
  
  // Validate siteUrl is not undefined/null
  if (!siteUrl || siteUrl === 'undefined' || siteUrl === 'null') {
    console.error('[SEO] Invalid SITE_CONFIG.siteUrl:', SITE_CONFIG.siteUrl)
    return `https://sparkleclean.pro${path.startsWith('/') ? path : `/${path}`}`
  }
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${siteUrl}${cleanPath}`
}

// ──────────────────────────────────────────────────────────────
// Helper: Validate URL (prevent javascript: URLs)
// ──────────────────────────────────────────────────────────────

export function validateUrl(url: string): string | null {
  try {
    // If it starts with http/https, validate it's a proper URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const parsed = new URL(url)
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return null // Reject javascript:, data:, etc.
      }
      return url
    }
    
    // For relative URLs, ensure they don't contain dangerous protocols
    if (url.startsWith('//') || url.startsWith('javascript:') || url.startsWith('data:')) {
      return null
    }
    
    // Return relative URLs as-is (they'll be normalized elsewhere)
    return url
  } catch {
    return null // Invalid URL
  }
}

// ──────────────────────────────────────────────────────────────
// Helper: Escape </script> tags in JSON-LD (prevent XSS)
// ──────────────────────────────────────────────────────────────

export function escapeScriptTags(json: string): string {
  // Replace </script> with <\/script> to prevent HTML parser from closing script tag
  return json.replace(/<\/script>/gi, '<\\/script>')
}

// ──────────────────────────────────────────────────────────────
// Helper: Sanitize text content for JSON-LD
// ──────────────────────────────────────────────────────────────

export function sanitizeForJsonLd(text: string): string {
  if (!text || typeof text !== 'string') return ''
  return text.trim()
    .replace(/<\/script>/gi, '<\\/script>') // Escape script tags
    .replace(/<[^>]*>/g, '') // Strip HTML tags (optional, prevents XSS in search results)
    .slice(0, 1000) // Limit length to prevent bloated schemas
}

// ──────────────────────────────────────────────────────────────
// LocalBusiness Schema
// ──────────────────────────────────────────────────────────────

export function generateLocalBusinessSchema(): LocalBusinessSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE_CONFIG.businessName,
    description: SITE_CONFIG.description,
    url: normalizeUrl(SITE_CONFIG.siteUrl),
    telephone: SITE_CONFIG.phone,
    email: SITE_CONFIG.email,
    abn: SITE_CONFIG.abn,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE_CONFIG.address.street,
      addressLocality: SITE_CONFIG.address.city,
      addressRegion: SITE_CONFIG.address.state,
      postalCode: SITE_CONFIG.address.postcode,
      addressCountry: SITE_CONFIG.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SITE_CONFIG.geo.latitude,
      longitude: SITE_CONFIG.geo.longitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: SITE_CONFIG.openingHours.weekdays.open,
        closes: SITE_CONFIG.openingHours.weekdays.close,
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: SITE_CONFIG.openingHours.saturday.open,
        closes: SITE_CONFIG.openingHours.saturday.close,
      },
    ],
    priceRange: '$$',
    areaServed: [
      { '@type': 'State', name: 'New South Wales' },
      { '@type': 'State', name: 'Victoria' },
      { '@type': 'State', name: 'Queensland' },
      { '@type': 'State', name: 'Western Australia' },
      { '@type': 'State', name: 'South Australia' },
      { '@type': 'State', name: 'Tasmania' },
      { '@type': 'State', name: 'Australian Capital Territory' },
      { '@type': 'State', name: 'Northern Territory' },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: SITE_CONFIG.rating.value,
      reviewCount: SITE_CONFIG.rating.count,
      bestRating: SITE_CONFIG.rating.best,
      worstRating: SITE_CONFIG.rating.worst,
    },
    sameAs: [
      SITE_CONFIG.social.facebook,
      SITE_CONFIG.social.instagram,
      SITE_CONFIG.social.linkedin,
    ],
  }
}

// ──────────────────────────────────────────────────────────────
// Service Schema
// ──────────────────────────────────────────────────────────────

export function generateServiceSchema(
  service: ServiceDefinition,
  state: AustralianState,
  city: string
): ServiceSchema {
  try {
    const statePrice = service.states[state]
    const multiplier = statePrice?.multiplier ?? 1
    const minPrice = Math.round(service.basePrice.min * multiplier)
    const maxPrice = Math.round(service.basePrice.max * multiplier)

    if (minPrice < 0 || maxPrice < 0) {
      throw new Error(`Invalid pricing for service: ${service.id}, state: ${state}`)
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `${service.name} in ${city}, ${state}`,
      description: service.description,
      provider: {
        '@type': 'LocalBusiness',
        name: SITE_CONFIG.businessName,
        telephone: SITE_CONFIG.phone,
      },
      areaServed: {
        '@type': 'City',
        name: city,
        containedInPlace: {
          '@type': 'State',
          name: state,
        },
      },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'AUD' as const,
        price: minPrice.toString(),
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: minPrice.toString(),
          priceCurrency: 'AUD' as const,
          minPrice: minPrice.toString(),
          maxPrice: maxPrice.toString(),
          unitText: statePrice?.complianceNotes || 'per service',
        },
      },
      serviceType: service.category,
      category: service.category,
      additionalProperty: service.certifications?.map((cert) => ({
        '@type': 'PropertyValue' as const,
        name: cert,
      })),
    }
  } catch (error) {
    console.error(`[SEO] Failed to generate service schema for ${service.id}:`, error)
    // Return minimal valid schema to prevent breakage
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.name,
      description: service.description,
      provider: {
        '@type': 'LocalBusiness',
        name: SITE_CONFIG.businessName,
        telephone: SITE_CONFIG.phone,
      },
      areaServed: {
        '@type': 'City',
        name: city || 'Australia',
        containedInPlace: {
          '@type': 'State',
          name: state,
        },
      },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'AUD' as const,
        price: '0',
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: '0',
          priceCurrency: 'AUD' as const,
          minPrice: '0',
          maxPrice: '0',
          unitText: 'Contact for pricing',
        },
      },
      serviceType: service.category,
      category: service.category,
    }
  }
}

// ──────────────────────────────────────────────────────────────
// FAQPage Schema
// ──────────────────────────────────────────────────────────────

export function generateFAQSchema(faqs: FAQEntry[]): FAQPageSchema {
  try {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs
        .filter((faq) => faq.q && faq.a) // Filter out incomplete entries
        .map((faq) => ({
          '@type': 'Question' as const,
          name: sanitizeForJsonLd(faq.q),
          acceptedAnswer: {
            '@type': 'Answer' as const,
            text: sanitizeForJsonLd(faq.a),
          },
        })),
    }
  } catch (error) {
    console.error('[SEO] Failed to generate FAQ schema:', error)
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [],
    }
  }
}

// ──────────────────────────────────────────────────────────────
// BreadcrumbList Schema
// ──────────────────────────────────────────────────────────────

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
): BreadcrumbListSchema {
  try {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items
        .filter((item) => item.name && item.url)
        .map((item, index) => {
          const validatedUrl = validateUrl(item.url)
          return {
            '@type': 'ListItem' as const,
            position: index + 1,
            name: sanitizeForJsonLd(item.name),
            item: validatedUrl ? buildFullUrl(validatedUrl) : buildFullUrl('/'),
          }
        }),
    }
  } catch (error) {
    console.error('[SEO] Failed to generate breadcrumb schema:', error)
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [],
    }
  }
}

// ──────────────────────────────────────────────────────────────
// WebSite Schema (for sitelinks search)
// ──────────────────────────────────────────────────────────────

export function generateWebSiteSchema(): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.businessName,
    url: normalizeUrl(SITE_CONFIG.siteUrl),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${normalizeUrl(SITE_CONFIG.siteUrl)}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// ──────────────────────────────────────────────────────────────
// Generate Open Graph Tags
// ──────────────────────────────────────────────────────────────

export function generateOGTags(options: SEOOptions): Record<string, string> {
  const { title, description, url, type = 'website' } = options
  const imageUrl = options.image || buildFullUrl(SITE_CONFIG.defaultOgImage)
  const fullUrl = url.startsWith('http') ? url : buildFullUrl(url)

  return {
    'og:title': title,
    'og:description': description,
    'og:url': fullUrl,
    'og:type': type,
    'og:site_name': SITE_CONFIG.businessName,
    'og:locale': 'en_AU',
    'og:image': imageUrl,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:type': 'image/jpeg',
  }
}

// ──────────────────────────────────────────────────────────────
// Generate Twitter Card Tags
// ──────────────────────────────────────────────────────────────

export function generateTwitterTags(options: SEOOptions): Record<string, string> {
  const { title, description, url } = options
  const fullUrl = url.startsWith('http') ? url : buildFullUrl(url)
  const imageUrl = options.image || buildFullUrl(SITE_CONFIG.defaultOgImage)

  return {
    'twitter:card': 'summary_large_image',
    'twitter:site': SITE_CONFIG.social.twitter,
    'twitter:title': title,
    'twitter:description': description,
    'twitter:url': fullUrl,
    'twitter:image': imageUrl,
  }
}

// ──────────────────────────────────────────────────────────────
// Generate Alternate Language Links (hreflang)
// ──────────────────────────────────────────────────────────────

export function generateAlternateTags(
  alternates?: { lang: string; url: string }[]
): AlternateMetaTags | undefined {
  if (!alternates || alternates.length === 0) {
    // Default to en-AU
    return {
      hrefLang: [
        { lang: 'en-au', url: buildFullUrl('/') },
        { lang: 'x-default', url: buildFullUrl('/') },
      ],
    }
  }

  return {
    hrefLang: [
      ...alternates.map((alt) => ({
        lang: alt.lang,
        url: alt.url.startsWith('http') ? alt.url : buildFullUrl(alt.url),
      })),
      { lang: 'x-default', url: buildFullUrl('/') },
    ],
  }
}

// ──────────────────────────────────────────────────────────────
// Generate Preload Tags (for critical resources)
// ──────────────────────────────────────────────────────────────

export function generatePreloadTags(
  preloadImages?: string[]
): PreloadTags | undefined {
  if (!preloadImages || preloadImages.length === 0) {
    return undefined
  }

  return {
    images: preloadImages.map((url) => ({
      url: url.startsWith('http') ? url : buildFullUrl(url),
      as: 'image',
      type: 'image/jpeg',
    })),
  }
}

// ──────────────────────────────────────────────────────────────
// Safe JSON-LD Serializer (with error handling)
// ──────────────────────────────────────────────────────────────

export function safeSerialize(
  data: unknown,
  schemaName: string
): string | null {
  try {
    const json = JSON.stringify(data, null, 2)
    // Validate JSON is parseable (sanity check)
    JSON.parse(json)
    // Escape </script> to prevent XSS via HTML parser
    return escapeScriptTags(json)
  } catch (error) {
    console.error(`[SEO] Failed to serialize ${schemaName} schema:`, error)
    return null
  }
}

// ──────────────────────────────────────────────────────────────
// Generate All SEO Tags (convenience function)
// ──────────────────────────────────────────────────────────────

export function generateAllSEOTags(options: SEOOptions): SEODataOutput {
  try {
    const tags: SEODataOutput = {
      localBusiness: generateLocalBusinessSchema(),
      website: generateWebSiteSchema(),
      og: generateOGTags(options),
      twitter: generateTwitterTags(options),
    }

    // Optional: Service schema
    if (options.service && options.state && options.city) {
      try {
        tags.service = generateServiceSchema(options.service, options.state, options.city)
      } catch (error) {
        console.error('[SEO] Skipping service schema due to error:', error)
      }
    }

    // Optional: FAQ schema
    if (options.faqs && options.faqs.length > 0) {
      try {
        tags.fAQ = generateFAQSchema(options.faqs)
      } catch (error) {
        console.error('[SEO] Skipping FAQ schema due to error:', error)
      }
    }

    // Optional: Breadcrumb schema
    if (options.breadcrumbs && options.breadcrumbs.length > 0) {
      try {
        tags.breadcrumbs = generateBreadcrumbSchema(options.breadcrumbs)
      } catch (error) {
        console.error('[SEO] Skipping breadcrumb schema due to error:', error)
      }
    }

    // Optional: Alternate language links
    tags.alternates = generateAlternateTags(options.alternates)

    // Optional: Preload tags
    if (options.preloadImages && options.preloadImages.length > 0) {
      tags.preload = generatePreloadTags(options.preloadImages)
    }

    return tags
  } catch (error) {
    console.error('[SEO] Critical error generating SEO tags:', error)
    // Return minimal valid SEO data to prevent complete failure
    return {
      localBusiness: generateLocalBusinessSchema(),
      website: generateWebSiteSchema(),
      og: {
        'og:title': options.title,
        'og:description': options.description,
        'og:url': buildFullUrl(options.url),
        'og:type': 'website',
        'og:site_name': SITE_CONFIG.businessName,
        'og:locale': 'en_AU',
      },
      twitter: {
        'twitter:card': 'summary_large_image',
        'twitter:site': SITE_CONFIG.social.twitter,
        'twitter:title': options.title,
        'twitter:description': options.description,
      },
    }
  }
}
