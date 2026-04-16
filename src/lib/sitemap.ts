// Dynamic Sitemap Generator — generates sitemap.xml for SEO
// Includes all service/state combinations + static pages

import { cleaningServices, AU_STATES } from './services-au'

interface SitemapEntry {
  url: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

// Static pages with their priorities
const STATIC_PAGES: SitemapEntry[] = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/services', changefreq: 'weekly', priority: 0.9 },
  { url: '/booking', changefreq: 'daily', priority: 0.9 },
  { url: '/about', changefreq: 'monthly', priority: 0.7 },
  { url: '/contact', changefreq: 'monthly', priority: 0.7 },
  { url: '/terms', changefreq: 'yearly', priority: 0.5 },
  { url: '/privacy', changefreq: 'yearly', priority: 0.5 },
  { url: '/cancellation', changefreq: 'yearly', priority: 0.5 },
]

// Sample cities for each state (expand as needed)
const STATE_CITIES: Record<string, string[]> = {
  NSW: ['sydney', 'parramatta', 'chatswood', 'bondi', 'manly', 'newtown', 'cronulla', 'penrith'],
  VIC: ['melbourne', 'richmond', 'st-kilda', 'brighton', 'south-yarra', 'fitzroy'],
  QLD: ['brisbane', 'gold-coast', 'sunshine-coast', 'ipswich', 'logan'],
  WA: ['perth', 'fremantle', 'joondalup', 'rockingham'],
  SA: ['adelaide', 'glenelg', 'norwood'],
  TAS: ['hobart', 'launceston'],
  ACT: ['canberra', 'woden'],
  NT: ['darwin', 'palmerston'],
}

/**
 * Generate all service pages (service + state combinations)
 */
function generateServicePages(): SitemapEntry[] {
  const pages: SitemapEntry[] = []
  const services = Object.values(cleaningServices)
  const today = new Date().toISOString().split('T')[0]

  for (const service of services) {
    for (const state of AU_STATES) {
      pages.push({
        url: `/service/${service.slug}/${state.toLowerCase()}`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.8,
      })

      // Add city-level pages
      const cities = STATE_CITIES[state] || []
      for (const city of cities) {
        pages.push({
          url: `/service/${service.slug}/${state.toLowerCase()}/${city}`,
          lastmod: today,
          changefreq: 'monthly',
          priority: 0.6,
        })
      }
    }
  }

  return pages
}

/**
 * Generate complete sitemap entries
 */
export function generateSitemapEntries(): SitemapEntry[] {
  return [...STATIC_PAGES, ...generateServicePages()]
}

/**
 * Generate XML sitemap string
 */
export function generateXMLSitemap(): string {
  const entries = generateSitemapEntries()

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`
  xml += `        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n`
  xml += `        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n`
  xml += `        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n\n`

  for (const entry of entries) {
    xml += `  <url>\n`
    xml += `    <loc>https://sparkleclean.pro${entry.url}</loc>\n`
    if (entry.lastmod) xml += `    <lastmod>${entry.lastmod}</lastmod>\n`
    if (entry.changefreq) xml += `    <changefreq>${entry.changefreq}</changefreq>\n`
    if (entry.priority) xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`
    xml += `  </url>\n\n`
  }

  xml += `</urlset>`

  return xml
}

/**
 * Generate robots.txt
 */
export function generateRobotsTXT(): string {
  return `# SparkleClean Pro - Robots.txt
# https://sparkleclean.pro

User-agent: *
Allow: /

# Sitemap
Sitemap: https://sparkleclean.pro/sitemap.xml

# Disallow admin and private routes
Disallow: /admin
Disallow: /api
Disallow: /booking/confirmation
Disallow: /*?*

# Allow all public pages
Allow: /services
Allow: /service/*
Allow: /about
Allow: /contact
Allow: /terms
Allow: /privacy
Allow: /cancellation

# Crawl-delay for polite crawling (optional)
Crawl-delay: 1
`
}
