// SEO Component — injects structured data into <head>
// Use on every page for optimal SEO
// Production-ready with performance optimizations, error handling, and proper cleanup

import { useEffect } from 'react'
import {
  generateAllSEOTags,
  normalizeUrl,
  validateUrl,
  safeSerialize,
} from '../lib/seo-schema'
import { SITE_CONFIG } from '../lib/constants'
import type { ServiceDefinition, AustralianState } from '../lib/services-au'
import type { FAQEntry } from '../lib/faqs'

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

interface SEOProps {
  title: string
  description: string
  url: string
  image?: string
  type?: 'website' | 'article' | 'product' | 'service'
  service?: ServiceDefinition
  state?: AustralianState
  city?: string
  faqs?: FAQEntry[]
  breadcrumbs?: { name: string; url: string }[]
  noindex?: boolean
  alternates?: { lang: string; url: string }[]
  preloadImages?: string[]
}

// Track which schema scripts we've injected for cleanup
const SCHEMA_IDS = [
  'schema-localBusiness',
  'schema-website',
  'schema-service',
  'schema-faq',
  'schema-breadcrumbs',
] as const

// Constants for meta tag selectors (used for cleanup)
const PRELOAD_LINK_SELECTOR = 'link[data-seo-preload="true"]'
const HREFLANG_LINK_SELECTOR = 'link[rel="alternate"][hreflang]'

// ──────────────────────────────────────────────────────────────
// Helper: Validate and truncate title/description for SEO
// ──────────────────────────────────────────────────────────────

function validateSEOText(text: string, maxLength: number): string {
  if (!text || typeof text !== 'string') return ''
  const cleaned = text.trim().replace(/\s+/g, ' ') // Normalize whitespace
  return cleaned.length > maxLength ? cleaned.slice(0, maxLength - 3) + '...' : cleaned
}

// ──────────────────────────────────────────────────────────────
// Helper: Safe meta tag updater/creator
// ──────────────────────────────────────────────────────────────

function setMetaTag(name: string, content: string, attribute = 'name') {
  if (!content || typeof content !== 'string') return // Skip empty values

  let meta = document.querySelector(`meta[${attribute}="${name}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attribute, name)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}

// ──────────────────────────────────────────────────────────────
// Helper: Build safe URL (prevent javascript: URLs)
// ──────────────────────────────────────────────────────────────

function buildSafeUrl(url: string): string {
  // Check for dangerous protocols
  const validated = validateUrl(url)
  if (!validated) {
    console.warn('[SEO] Invalid URL detected, falling back to homepage:', url)
    return normalizeUrl(SITE_CONFIG.siteUrl)
  }
  
  // Build full URL
  return validated.startsWith('http')
    ? validated
    : `${normalizeUrl(SITE_CONFIG.siteUrl)}${validated.startsWith('/') ? validated : `/${validated}`}`
}

// ──────────────────────────────────────────────────────────────
// SEO Component
// ──────────────────────────────────────────────────────────────

export default function SEO({
  title,
  description,
  url,
  image,
  type,
  service,
  state,
  city,
  faqs,
  breadcrumbs,
  noindex = false,
  alternates,
  preloadImages,
}: SEOProps) {
  useEffect(() => {
    // Validate inputs
    const safeTitle = validateSEOText(title, 70)
    const safeDescription = validateSEOText(description, 160)
    const fullUrl = buildSafeUrl(url)
    
    // Validate image URL
    const safeImage = image && validateUrl(image) ? image : undefined

    if (!safeTitle || !safeDescription) {
      console.warn('[SEO] Missing or invalid title/description')
    }

    // Generate all SEO tags
    const tags = generateAllSEOTags({
      title: safeTitle,
      description: safeDescription,
      url: fullUrl,
      image: safeImage,
      type,
      service,
      state,
      city,
      faqs,
      breadcrumbs,
      alternates,
      preloadImages,
    })

    // ───────────────────────────────────────────────────────
    // Update DOM synchronously (SEO must be set before paint)
    // ───────────────────────────────────────────────────────

    // 1. Update document title
    document.title = `${safeTitle} | ${SITE_CONFIG.businessName}`

    // 2. Update meta description
    setMetaTag('description', safeDescription)

    // 3. Batch update all OG tags
    Object.entries(tags.og).forEach(([key, value]) => {
      setMetaTag(key, value, 'property')
    })

    // 4. Batch update all Twitter tags
    Object.entries(tags.twitter).forEach(([key, value]) => {
      setMetaTag(key, value)
    })

    // 5. Update/set canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', fullUrl)

    // 6. Handle alternate language links (hreflang)
    updateAlternateLinks(tags.alternates)

    // 7. Handle preload tags (marked with data attribute for safe cleanup)
    updatePreloadLinks(tags.preload)

    // 8. Add noindex if requested
    if (noindex) {
      setMetaTag('robots', 'noindex, nofollow')
    } else {
      // Always ensure index when noindex is false
      setMetaTag('robots', 'index, follow')
    }

    // 9. Inject JSON-LD schemas (with safe serialization)
    injectSchemaScript('schema-localBusiness', tags.localBusiness)
    injectSchemaScript('schema-website', tags.website)
    injectSchemaScript('schema-service', tags.service)
    injectSchemaScript('schema-faq', tags.fAQ)
    injectSchemaScript('schema-breadcrumbs', tags.breadcrumbs)

    // ───────────────────────────────────────────────────────
    // Cleanup function: Remove dynamically created elements
    // ───────────────────────────────────────────────────────
    return () => {
      // Remove all injected schema scripts
      SCHEMA_IDS.forEach((id) => {
        const script = document.getElementById(id)
        if (script && script.tagName === 'SCRIPT') {
          script.remove()
        }
      })

      // Note: We intentionally do NOT remove meta tags on cleanup.
      // In SPA navigation, meta tags should persist until the next SEO
      // component updates them. Removing them would cause a flash of
      // missing metadata during route transitions.
    }
  }, [
    title,
    description,
    url,
    image,
    type,
    service,
    state,
    city,
    faqs,
    breadcrumbs,
    noindex,
    alternates,
    preloadImages,
  ])

  // Preconnect to critical origins (render blocking prevention)
  useEffect(() => {
    const siteUrl = normalizeUrl(SITE_CONFIG.siteUrl)
    let origin: string
    try {
      origin = new URL(siteUrl).origin
    } catch {
      origin = 'https://sparkleclean.pro'
    }

    // Preconnect to site origin
    let preconnect = document.querySelector(`link[rel="preconnect"][href="${origin}"]`)
    if (!preconnect) {
      preconnect = document.createElement('link')
      preconnect.setAttribute('rel', 'preconnect')
      preconnect.setAttribute('href', origin)
      document.head.appendChild(preconnect)
    }

    // DNS prefetch for external resources
    const externalOrigins = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ]

    externalOrigins.forEach((extOrigin) => {
      let dnsPrefetch = document.querySelector(
        `link[rel="dns-prefetch"][href="${extOrigin}"]`
      )
      if (!dnsPrefetch) {
        dnsPrefetch = document.createElement('link')
        dnsPrefetch.setAttribute('rel', 'dns-prefetch')
        dnsPrefetch.setAttribute('href', extOrigin)
        document.head.appendChild(dnsPrefetch)
      }
    })

    // Cleanup: Remove preconnect/dns-prefetch on unmount
    return () => {
      document.querySelectorAll(`link[rel="preconnect"][href="${origin}"]`).forEach((el) => el.remove())
      externalOrigins.forEach((extOrigin) => {
        document.querySelectorAll(`link[rel="dns-prefetch"][href="${extOrigin}"]`).forEach((el) => el.remove())
      })
    }
  }, [])

  return null // This component doesn't render anything
}

// ──────────────────────────────────────────────────────────────
// Helper Functions (outside component for reuse)
// ──────────────────────────────────────────────────────────────

function updateAlternateLinks(
  alternates?: { hrefLang: { lang: string; url: string }[] }
) {
  if (!alternates || alternates.hrefLang.length === 0) return

  // Remove old hreflang links
  document.querySelectorAll(HREFLANG_LINK_SELECTOR).forEach((el) => el.remove())

  // Add new hreflang links
  alternates.hrefLang.forEach(({ lang, url }) => {
    const validatedUrl = validateUrl(url)
    if (!validatedUrl) return

    const link = document.createElement('link')
    link.setAttribute('rel', 'alternate')
    link.setAttribute('hreflang', lang)
    link.setAttribute('href', validatedUrl.startsWith('http') ? validatedUrl : url)
    document.head.appendChild(link)
  })
}

function updatePreloadLinks(preload?: {
  images: { url: string; as?: string; type?: string }[]
  fonts?: { url: string; type: string; crossOrigin?: string }[]
}) {
  if (!preload) return

  // Remove ONLY preload links created by this SEO component
  document.querySelectorAll(PRELOAD_LINK_SELECTOR).forEach((el) => el.remove())

  // Add image preloads
  preload.images.forEach(({ url, as = 'image', type = 'image/jpeg' }) => {
    const link = document.createElement('link')
    link.setAttribute('rel', 'preload')
    link.setAttribute('href', url)
    link.setAttribute('as', as)
    link.setAttribute('data-seo-preload', 'true') // Mark for safe cleanup
    if (type) link.setAttribute('type', type)
    document.head.appendChild(link)
  })

  // Add font preloads
  preload.fonts?.forEach(({ url, type, crossOrigin = 'anonymous' }) => {
    const link = document.createElement('link')
    link.setAttribute('rel', 'preload')
    link.setAttribute('href', url)
    link.setAttribute('as', 'font')
    link.setAttribute('type', type)
    link.setAttribute('crossorigin', crossOrigin)
    link.setAttribute('data-seo-preload', 'true') // Mark for safe cleanup
    document.head.appendChild(link)
  })
}

function injectSchemaScript(id: string, data: unknown) {
  if (!data) return

  // Remove existing script with this ID
  const existing = document.getElementById(id)
  if (existing) {
    existing.remove()
  }

  // Serialize with safeSerialize (escapes </script> to prevent XSS)
  const json = safeSerialize(data, id)
  if (!json) {
    console.warn(`[SEO] Failed to serialize schema: ${id}`)
    return
  }

  // Create new script
  const script = document.createElement('script')
  script.id = id
  script.type = 'application/ld+json'
  script.textContent = json
  document.head.appendChild(script)
}
