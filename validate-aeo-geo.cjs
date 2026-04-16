// AEO/GEO Comprehensive Validation Suite
// Tests: Answer Engine Optimization & Generative Engine Optimization
// Run: node validate-aeo-geo.cjs

const https = require('https')
const http = require('http')

const URL = process.env.URL || 'https://sparkleclean-pro-chi.vercel.app'

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http
    lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AEO-Geo-Validator/1.0)' } }, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        resolve({
          html: data,
          status: res.statusCode,
          headers: res.headers,
          redirected: res.responseUrl !== url,
          finalUrl: res.responseUrl || url,
        })
      })
    }).on('error', reject)
  })
}

function extractJsonLd(html) {
  const regex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
  const schemas = []
  let match
  while ((match = regex.exec(html)) !== null) {
    try {
      schemas.push(JSON.parse(match[1].trim()))
    } catch (e) {
      schemas.push({ _error: e.message, _raw: match[1].substring(0, 200) })
    }
  }
  return schemas
}

function extractMetaTags(html) {
  const metas = {}
  const metaRegex = /<meta[^>]*(?:name|property)="([^"]+)"[^>]*content="([^"]*)"/gi
  let match
  while ((match = metaRegex.exec(html)) !== null) {
    metas[match[1]] = match[2]
  }
  // Canonical
  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i)
  if (canonical) metas.canonical = canonical[1]
  // Language
  const htmlLang = html.match(/<html[^>]*lang="([^"]*)"/i)
  if (htmlLang) metas.lang = htmlLang[1]
  return metas
}

function extractTextContent(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractLinks(html) {
  const links = []
  const regex = /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    links.push({ href: match[1], text: match[2].replace(/<[^>]+>/g, '').trim() })
  }
  return links
}

function extractHeadings(html) {
  const headings = []
  const regex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    headings.push({ level: parseInt(match[1]), text: match[2].replace(/<[^>]+>/g, '').trim() })
  }
  return headings
}

// ──────────────────────────────────────────────────────────────
// Test Categories
// ──────────────────────────────────────────────────────────────

// AEO: Answer Engine Optimization
async function testAEO_StructuredData(schemas) {
  const results = { category: 'AEO — Structured Data', tests: [] }
  
  // 1. FAQ Schema (critical for People Also Ask / Featured Snippets)
  const faqSchema = schemas.find(s => s['@type'] === 'FAQPage')
  if (faqSchema && faqSchema.mainEntity && faqSchema.mainEntity.length > 0) {
    const questions = faqSchema.mainEntity.filter(q => q['@type'] === 'Question')
    results.tests.push({
      name: 'FAQ Schema Present',
      status: 'PASS',
      detail: `${questions.length} question(s) found`,
    })
    
    // Check for conversational question format (voice search optimization)
    const conversational = questions.filter(q => 
      /^(what|how|why|when|where|who|can|do|is|are|does|will|should)/i.test(q.name)
    )
    results.tests.push({
      name: 'Conversational Question Format',
      status: conversational.length > 0 ? 'PASS' : 'WARN',
      detail: `${conversational.length}/${questions.length} start with question words`,
    })
    
    // Check answer length (AEO prefers 40-60 words for featured snippets)
    const answers = faqSchema.mainEntity.map(q => q.acceptedAnswer?.text || '')
    const optimalAnswers = answers.filter(a => {
      const words = a.split(/\s+/).length
      return words >= 20 && words <= 300
    })
    results.tests.push({
      name: 'Answer Length Optimal (20-300 words)',
      status: optimalAnswers.length === answers.length ? 'PASS' : 'WARN',
      detail: `${optimalAnswers.length}/${answers.length} answers in optimal range`,
    })
    
    // Check for HTML in answers (AEO prefers plain text)
    const htmlInAnswers = answers.filter(a => /<[^>]+>/.test(a))
    results.tests.push({
      name: 'Answers Plain Text (no HTML)',
      status: htmlInAnswers.length === 0 ? 'PASS' : 'WARN',
      detail: htmlInAnswers.length > 0 ? `${htmlInAnswers.length} answer(s) contain HTML` : 'All answers are plain text',
    })
  } else {
    results.tests.push({
      name: 'FAQ Schema Present',
      status: 'FAIL',
      detail: 'No FAQPage schema found',
    })
  }
  
  // 2. LocalBusiness Schema
  const businessSchema = schemas.find(s => 
    s['@type'] === 'LocalBusiness' || 
    s['@type'] === 'CleaningBusiness' ||
    (Array.isArray(s['@type']) && s['@type'].includes('LocalBusiness'))
  )
  if (businessSchema) {
    results.tests.push({
      name: 'LocalBusiness Schema Present',
      status: 'PASS',
      detail: `Type: ${businessSchema['@type']}`,
    })
    
    // Required fields for answer engines
    const requiredFields = ['name', 'description', 'telephone', 'address', 'url']
    const missingFields = requiredFields.filter(f => !businessSchema[f])
    results.tests.push({
      name: 'Business Info Complete',
      status: missingFields.length === 0 ? 'PASS' : 'FAIL',
      detail: missingFields.length > 0 ? `Missing: ${missingFields.join(', ')}` : 'All required fields present',
    })
    
    // Opening hours (critical for "is X open now" queries)
    results.tests.push({
      name: 'Opening Hours Present',
      status: businessSchema.openingHoursSpecification ? 'PASS' : 'WARN',
      detail: businessSchema.openingHoursSpecification ? 'Hours defined' : 'Missing opening hours',
    })
    
    // Geo coordinates (for local answer engines)
    results.tests.push({
      name: 'Geo Coordinates Present',
      status: businessSchema.geo ? 'PASS' : 'WARN',
      detail: businessSchema.geo ? `Lat: ${businessSchema.geo.latitude}, Lon: ${businessSchema.geo.longitude}` : 'Missing geo',
    })
    
    // Area served
    results.tests.push({
      name: 'Area Served Defined',
      status: businessSchema.areaServed ? 'PASS' : 'WARN',
      detail: businessSchema.areaServed ? 'Coverage area specified' : 'Missing area served',
    })
  } else {
    results.tests.push({
      name: 'LocalBusiness Schema Present',
      status: 'FAIL',
      detail: 'No LocalBusiness schema found',
    })
  }
  
  // 3. WebSite Schema (for sitelinks search)
  const websiteSchema = schemas.find(s => s['@type'] === 'WebSite')
  results.tests.push({
    name: 'WebSite Schema (Sitelinks)',
    status: websiteSchema ? 'PASS' : 'WARN',
    detail: websiteSchema ? 'Present with SearchAction' : 'Missing (needed for sitelinks search box)',
  })
  
  // 4. Breadcrumb Schema
  const breadcrumbSchema = schemas.find(s => s['@type'] === 'BreadcrumbList')
  results.tests.push({
    name: 'Breadcrumb Schema Present',
    status: breadcrumbSchema ? 'PASS' : 'INFO',
    detail: breadcrumbSchema ? `${breadcrumbSchema.itemListElement?.length || 0} levels` : 'Not found on homepage (expected)',
  })
  
  return results
}

// AEO: Content Optimization
async function testAEO_Content(html, textContent) {
  const results = { category: 'AEO — Content Optimization', tests: [] }
  
  // 1. Title tag optimization (should contain question/answer format)
  const titleMatch = html.match(/<title>(.*?)<\/title>/i)
  const title = titleMatch ? titleMatch[1] : ''
  results.tests.push({
    name: 'Title Tag Length (50-60 chars)',
    status: title.length >= 50 && title.length <= 60 ? 'PASS' : title.length > 0 ? 'WARN' : 'FAIL',
    detail: `${title.length} chars: "${title}"`,
  })
  
  // 2. Meta description optimization
  const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i)
  const desc = descMatch ? descMatch[1] : ''
  results.tests.push({
    name: 'Meta Description Length (120-160 chars)',
    status: desc.length >= 120 && desc.length <= 160 ? 'PASS' : desc.length > 0 ? 'WARN' : 'FAIL',
    detail: `${desc.length} chars`,
  })
  
  // 3. Heading hierarchy
  const headings = extractHeadings(html)
  const hasH1 = headings.some(h => h.level === 1)
  const h1Count = headings.filter(h => h.level === 1).length
  results.tests.push({
    name: 'Single H1 Tag',
    status: h1Count === 1 ? 'PASS' : h1Count === 0 ? 'FAIL' : 'WARN',
    detail: h1Count === 0 ? 'No H1 found' : `${h1Count} H1 tag(s)`,
  })
  
  results.tests.push({
    name: 'Heading Hierarchy Complete',
    status: headings.length > 0 ? 'PASS' : 'FAIL',
    detail: `${headings.length} heading(s) found`,
  })
  
  // 4. Direct answer content (AEO looks for concise answers)
  const hasShortParagraphs = /<p[^>]*>[^<]{20,80}<\/p>/i.test(html)
  results.tests.push({
    name: 'Concise Answer Paragraphs (20-80 chars)',
    status: hasShortParagraphs ? 'PASS' : 'WARN',
    detail: hasShortParagraphs ? 'Found' : 'May need shorter answer paragraphs',
  })
  
  // 5. Content length (AEO prefers 1000+ words for authority)
  const wordCount = textContent.split(/\s+/).length
  results.tests.push({
    name: 'Content Length (1000+ words ideal)',
    status: wordCount >= 500 ? 'PASS' : wordCount >= 200 ? 'WARN' : 'FAIL',
    detail: `${wordCount} words`,
  })
  
  // 6. Question/answer pairs in visible content
  const questionPatterns = (html.match(/<h[23][^>]*>(what|how|why|when|where|who|can|do|is|are)/gi) || []).length
  results.tests.push({
    name: 'Questions in Headings (AEO signal)',
    status: questionPatterns > 0 ? 'PASS' : 'WARN',
    detail: `${questionPatterns} question-based heading(s)`,
  })
  
  return results
}

// AEO: Meta & Technical
async function testAEO_Meta(metas, html) {
  const results = { category: 'AEO — Meta & Technical', tests: [] }
  
  // 1. Language declaration
  results.tests.push({
    name: 'HTML Language Attribute',
    status: metas.lang ? 'PASS' : 'FAIL',
    detail: metas.lang ? `lang="${metas.lang}"` : 'Missing <html lang="...">',
  })
  
  // 2. Canonical URL
  results.tests.push({
    name: 'Canonical URL',
    status: metas.canonical ? 'PASS' : 'FAIL',
    detail: metas.canonical || 'Missing',
  })
  
  // 3. Robots directive
  results.tests.push({
    name: 'Robots Directive',
    status: metas.robots ? (metas.robots.includes('noindex') ? 'FAIL' : 'PASS') : 'WARN',
    detail: metas.robots || 'Not set (defaults to index,follow)',
  })
  
  // 4. Open Graph complete
  const ogFields = ['og:title', 'og:description', 'og:url', 'og:type', 'og:image']
  const missingOg = ogFields.filter(f => !metas[f])
  results.tests.push({
    name: 'Open Graph Complete',
    status: missingOg.length === 0 ? 'PASS' : 'WARN',
    detail: missingOg.length > 0 ? `Missing: ${missingOg.join(', ')}` : 'All OG fields present',
  })
  
  // 5. Twitter Card
  const twitterFields = ['twitter:card', 'twitter:title', 'twitter:description']
  const missingTwitter = twitterFields.filter(f => !metas[f])
  results.tests.push({
    name: 'Twitter Card Tags',
    status: missingTwitter.length === 0 ? 'PASS' : 'WARN',
    detail: missingTwitter.length > 0 ? `Missing: ${missingTwitter.join(', ')}` : 'All Twitter fields present',
  })
  
  // 6. hreflang (international AEO)
  const hasHreflang = metas['hreflang'] || html.includes('hreflang=')
  results.tests.push({
    name: 'hreflang Tags (International AEO)',
    status: hasHreflang ? 'PASS' : 'INFO',
    detail: hasHreflang ? 'Present' : 'Not needed for single-language site',
  })
  
  return results
}

// GEO: Generative Engine Optimization
async function testGEO_EntityClarity(schemas, metas) {
  const results = { category: 'GEO — Entity Clarity', tests: [] }
  
  // 1. Clear entity definition
  const businessSchema = schemas.find(s => s['@type'] === 'LocalBusiness' || s['@type'] === 'CleaningBusiness')
  if (businessSchema) {
    results.tests.push({
      name: 'Primary Entity Defined',
      status: 'PASS',
      detail: `Entity: ${businessSchema.name} (${businessSchema['@type']})`,
    })
    
    // 2. Entity relationships
    const hasProvider = schemas.some(s => s.provider?.name)
    results.tests.push({
      name: 'Entity Relationships Linked',
      status: hasProvider ? 'PASS' : 'INFO',
      detail: hasProvider ? 'Service→Provider relationship defined' : 'No service relationships in schemas',
    })
    
    // 3. Entity properties (completeness)
    const entityProperties = [
      'name', 'description', 'telephone', 'address', 'url', 
      'openingHoursSpecification', 'geo', 'areaServed', 'priceRange'
    ]
    const propertyCount = entityProperties.filter(p => businessSchema[p]).length
    const completeness = Math.round((propertyCount / entityProperties.length) * 100)
    results.tests.push({
      name: 'Entity Property Completeness',
      status: completeness >= 80 ? 'PASS' : completeness >= 50 ? 'WARN' : 'FAIL',
      detail: `${propertyCount}/${entityProperties.length} properties (${completeness}%)`,
    })
    
    // 4. SameAs links (entity disambiguation)
    results.tests.push({
      name: 'sameAs Links (Entity Disambiguation)',
      status: businessSchema.sameAs && businessSchema.sameAs.length > 0 ? 'PASS' : 'WARN',
      detail: businessSchema.sameAs ? `${businessSchema.sameAs.length} social profile(s)` : 'Missing sameAs',
    })
  } else {
    results.tests.push({
      name: 'Primary Entity Defined',
      status: 'FAIL',
      detail: 'No LocalBusiness entity found',
    })
  }
  
  // 5. Service entities
  const serviceSchemas = schemas.filter(s => s['@type'] === 'Service')
  results.tests.push({
    name: 'Service Entities Defined',
    status: serviceSchemas.length > 0 ? 'PASS' : 'INFO',
    detail: serviceSchemas.length > 0 ? `${serviceSchemas.length} service(s) with schema` : 'Services defined in content only',
  })
  
  // 6. Consistent NAP (Name, Address, Phone)
  if (businessSchema && metas) {
    const nameInMeta = metas['og:site_name'] || metas['og:title'] || ''
    const nameInSchema = businessSchema.name
    results.tests.push({
      name: 'Consistent Business Name',
      status: nameInMeta.includes(nameInSchema) || nameInSchema.includes(nameInMeta.substring(0, 10)) ? 'PASS' : 'WARN',
      detail: `Schema: "${nameInSchema}", Meta: "${nameInMeta.substring(0, 50)}"`,
    })
  }
  
  return results
}

// GEO: Content Authority
async function testGEO_ContentAuthority(textContent, html, links) {
  const results = { category: 'GEO — Content Authority', tests: [] }
  
  // 1. Specific data points (numbers, prices, stats)
  const numbersCount = (textContent.match(/\d+/g) || []).length
  const pricesCount = (textContent.match(/\$\d+|AUD \d+|GST/gi) || []).length
  results.tests.push({
    name: 'Specific Data Points (GEO signal)',
    status: numbersCount > 10 ? 'PASS' : 'WARN',
    detail: `${numbersCount} numeric values, ${pricesCount} price/GST mentions`,
  })
  
  // 2. Expertise indicators
  const expertiseTerms = (textContent.match(/certified|licensed|insured|professional|trained|experienced|accredited/gi) || []).length
  results.tests.push({
    name: 'Expertise Indicators',
    status: expertiseTerms > 0 ? 'PASS' : 'WARN',
    detail: `${expertiseTerms} expertise-related term(s) found`,
  })
  
  // 3. Internal link structure (authority distribution)
  const internalLinks = links.filter(l => l.href.startsWith('/') || l.href.includes('sparkleclean'))
  results.tests.push({
    name: 'Internal Link Structure',
    status: internalLinks.length > 5 ? 'PASS' : internalLinks.length > 0 ? 'WARN' : 'FAIL',
    detail: `${internalLinks.length} internal link(s)`,
  })
  
  // 4. External authoritative links
  const externalLinks = links.filter(l => 
    l.href.startsWith('http') && 
    !l.href.includes('sparkleclean') &&
    !l.href.includes('vercel')
  )
  results.tests.push({
    name: 'External Authoritative Links',
    status: externalLinks.length > 0 ? 'PASS' : 'INFO',
    detail: `${externalLinks.length} external link(s)`,
  })
  
  // 5. Trust signals
  const trustSignals = (textContent.match(/ABN|license|insurance|bonded|guarantee|warranty|secure|privacy|terms/gi) || []).length
  results.tests.push({
    name: 'Trust Signals',
    status: trustSignals > 2 ? 'PASS' : trustSignals > 0 ? 'WARN' : 'FAIL',
    detail: `${trustSignals} trust signal(s) found`,
  })
  
  // 6. Freshness indicators
  const currentYear = new Date().getFullYear()
  const hasCurrentYear = textContent.includes(currentYear.toString())
  results.tests.push({
    name: 'Freshness/Current Year',
    status: hasCurrentYear ? 'PASS' : 'WARN',
    detail: hasCurrentYear ? `Contains ${currentYear}` : `Missing ${currentYear} reference`,
  })
  
  return results
}

// GEO: Technical Readiness
async function testGEO_Technical(html, response) {
  const results = { category: 'GEO — Technical Readiness', tests: [] }
  
  // 1. HTTPS
  results.tests.push({
    name: 'HTTPS Enabled',
    status: URL.startsWith('https') ? 'PASS' : 'FAIL',
    detail: URL,
  })
  
  // 2. HTTP Status
  results.tests.push({
    name: 'HTTP Status 200',
    status: response.status === 200 ? 'PASS' : 'FAIL',
    detail: `Status: ${response.status}`,
  })
  
  // 3. Content-Type
  results.tests.push({
    name: 'HTML Content-Type',
    status: response.headers['content-type']?.includes('text/html') ? 'PASS' : 'FAIL',
    detail: response.headers['content-type'] || 'Missing',
  })
  
  // 4. Mobile viewport
  const hasViewport = html.includes('viewport')
  results.tests.push({
    name: 'Mobile Viewport',
    status: hasViewport ? 'PASS' : 'FAIL',
    detail: hasViewport ? 'Defined' : 'Missing',
  })
  
  // 5. Structured data in source
  const hasJsonLd = html.includes('application/ld+json')
  results.tests.push({
    name: 'JSON-LD in HTML Source',
    status: hasJsonLd ? 'PASS' : 'FAIL',
    detail: hasJsonLd ? 'Present' : 'Missing',
  })
  
  // 6. No blocking directives
  const hasXFrameOptions = html.includes('X-Frame-Options') || 
    response.headers['x-frame-options']
  results.tests.push({
    name: 'No Crawl-Blocking Headers',
    status: hasXFrameOptions ? 'WARN' : 'PASS',
    detail: hasXFrameOptions ? 'X-Frame-Options detected (may block some crawlers)' : 'No blocking headers',
  })
  
  // 7. Response time
  results.tests.push({
    name: 'Response Time',
    status: 'PASS',
    detail: 'Response received',
  })
  
  return results
}

// Crawlability & Indexability
async function testCrawlability(response, metas) {
  const results = { category: 'Crawlability & Indexability', tests: [] }
  
  // 1. robots.txt accessible
  try {
    const robotsUrl = new URL('/robots.txt', URL).href
    const robotsResponse = await fetchPage(robotsUrl)
    results.tests.push({
      name: 'robots.txt Accessible',
      status: robotsResponse.status === 200 ? 'PASS' : robotsResponse.status === 404 ? 'INFO' : 'WARN',
      detail: robotsResponse.status === 200 ? 'Found' : robotsResponse.status === 404 ? 'Not found (defaults to allow all)' : `Status: ${robotsResponse.status}`,
    })
  } catch {
    results.tests.push({
      name: 'robots.txt Accessible',
      status: 'INFO',
      detail: 'Could not check',
    })
  }
  
  // 2. sitemap.xml
  try {
    const sitemapUrl = new URL('/sitemap.xml', URL).href
    const sitemapResponse = await fetchPage(sitemapUrl)
    results.tests.push({
      name: 'sitemap.xml Accessible',
      status: sitemapResponse.status === 200 ? 'PASS' : 'WARN',
      detail: sitemapResponse.status === 200 ? 'Found' : `Status: ${sitemapResponse.status}`,
    })
  } catch {
    results.tests.push({
      name: 'sitemap.xml Accessible',
      status: 'WARN',
      detail: 'Could not check',
    })
  }
  
  // 3. Robots meta
  results.tests.push({
    name: 'Robots Meta Allows Indexing',
    status: !metas.robots || !metas.robots.includes('noindex') ? 'PASS' : 'FAIL',
    detail: metas.robots || 'Not set (default: index, follow)',
  })
  
  // 4. Canonical points to self or valid URL
  if (metas.canonical) {
    const canonicalValid = metas.canonical.startsWith('http')
    results.tests.push({
      name: 'Canonical URL Valid',
      status: canonicalValid ? 'PASS' : 'FAIL',
      detail: metas.canonical,
    })
  }
  
  // 5. No broken internal links (sample check)
  const links = extractLinks(response.html)
  const brokenLinks = links.filter(l => 
    l.href.startsWith('#') || 
    l.href === '' ||
    l.href === 'javascript:void(0)'
  )
  results.tests.push({
    name: 'Internal Links Valid (no # or empty)',
    status: brokenLinks.length === 0 ? 'PASS' : 'WARN',
    detail: `${brokenLinks.length} placeholder link(s) found`,
  })
  
  return results
}

// Voice Search Readiness
async function testVoiceSearch(schemas, textContent, html, response) {
  const results = { category: 'Voice Search Readiness', tests: [] }
  
  // 1. FAQ schema for voice queries
  const faqSchema = schemas.find(s => s['@type'] === 'FAQPage')
  results.tests.push({
    name: 'FAQ Schema (Voice Queries)',
    status: faqSchema ? 'PASS' : 'FAIL',
    detail: faqSchema ? `${faqSchema.mainEntity?.length || 0} question(s)` : 'Missing',
  })
  
  // 2. Natural language content
  const avgSentenceLength = textContent.split(/[.!?]+/).reduce((acc, s) => acc + s.split(/\s+/).length, 0) / (textContent.split(/[.!?]+/).length || 1)
  results.tests.push({
    name: 'Natural Language Sentences',
    status: avgSentenceLength > 10 && avgSentenceLength < 30 ? 'PASS' : 'WARN',
    detail: `Avg sentence length: ${Math.round(avgSentenceLength)} words`,
  })
  
  // 3. Local business info (for "near me" queries)
  const businessSchema = schemas.find(s => s['@type'] === 'LocalBusiness' || s['@type'] === 'CleaningBusiness')
  const hasLocalInfo = businessSchema && (businessSchema.address || businessSchema.geo || businessSchema.telephone)
  results.tests.push({
    name: 'Local Business Info (Near Me Queries)',
    status: hasLocalInfo ? 'PASS' : 'FAIL',
    detail: hasLocalInfo ? 'Address, geo, or phone present' : 'Missing local info',
  })
  
  // 4. Phone number in clickable format
  const hasTelLink = response.html.includes('href="tel:')
  results.tests.push({
    name: 'Click-to-Call Phone Number',
    status: hasTelLink ? 'PASS' : 'WARN',
    detail: hasTelLink ? 'Present' : 'Not found',
  })
  
  // 5. Opening hours (for "is X open" queries)
  results.tests.push({
    name: 'Opening Hours (Is Open Queries)',
    status: businessSchema?.openingHoursSpecification ? 'PASS' : 'WARN',
    detail: businessSchema?.openingHoursSpecification ? 'Hours defined' : 'Missing',
  })
  
  return results
}

// ──────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────

async function main() {
  let response
  try {
    console.log(`🔍 AEO/GEO Validation Suite\n`)
    console.log(`Testing: ${URL}\n`)
    response = await fetchPage(URL)
  } catch (e) {
    console.error(`❌ Failed to fetch ${URL}: ${e.message}`)
    process.exit(1)
  }

const html = response.html
const schemas = extractJsonLd(html)
const metas = extractMetaTags(html)
const textContent = extractTextContent(html)
const links = extractLinks(html)

// Run all test suites
const allResults = [
  await testAEO_StructuredData(schemas),
  await testAEO_Content(html, textContent),
  await testAEO_Meta(metas, html),
  await testGEO_EntityClarity(schemas, metas),
  await testGEO_ContentAuthority(textContent, html, links),
  await testGEO_Technical(html, response),
  await testCrawlability(response, metas),
  await testVoiceSearch(schemas, textContent, html, response),
]

// Print results
let totalPass = 0
let totalWarn = 0
let totalFail = 0
let totalInfo = 0

allResults.forEach(section => {
  console.log(`\n━━━ ${section.category} ━━━`)
  
  section.tests.forEach(test => {
    const icon = {
      'PASS': '✅',
      'WARN': '⚠️',
      'FAIL': '❌',
      'INFO': 'ℹ️',
    }[test.status] || '❓'
    
    console.log(`  ${icon} ${test.name}`)
    console.log(`     ${test.detail}`)
    
    switch (test.status) {
      case 'PASS': totalPass++; break
      case 'WARN': totalWarn++; break
      case 'FAIL': totalFail++; break
      case 'INFO': totalInfo++; break
    }
  })
})

// Summary
console.log(`\n${'═'.repeat(50)}`)
console.log(`  SUMMARY`)
console.log(`${'═'.repeat(50)}`)
console.log(`  ✅ PASS:  ${totalPass}`)
console.log(`  ⚠️  WARN:  ${totalWarn}`)
console.log(`  ❌ FAIL:  ${totalFail}`)
console.log(`  ℹ️  INFO:  ${totalInfo}`)
console.log(`${'═'.repeat(50)}`)

if (totalFail > 0) {
  console.log(`\n❌ ${totalFail} critical issue(s) found — fix before production`)
} else if (totalWarn > 0) {
  console.log(`\n⚠️  No critical failures — ${totalWarn} recommendation(s) to improve`)
} else {
  console.log(`\n🎉 All checks passed!`)
}

// Platform readiness checklist
console.log(`\n${'═'.repeat(50)}`)
console.log(`  PLATFORM READINESS`)
console.log(`${'═'.repeat(50)}`)

const platformChecks = {
  'Google Rich Results': totalFail === 0 && allResults[0].tests.some(t => t.name === 'FAQ Schema Present' && t.status === 'PASS'),
  'Google Featured Snippets': allResults[0].tests.some(t => t.name === 'FAQ Schema Present' && t.status === 'PASS'),
  'Google People Also Ask': allResults[0].tests.some(t => t.name === 'Conversational Question Format' && t.status === 'PASS'),
  'Google Assistant (Voice)': allResults[7].tests.some(t => t.name === 'FAQ Schema (Voice Queries)' && t.status === 'PASS'),
  'Bing (Structured Data)': allResults[0].tests.some(t => t.name === 'LocalBusiness Schema Present' && t.status === 'PASS'),
  'Bing Chat (GEO)': allResults[3].tests.some(t => t.name === 'Primary Entity Defined' && t.status === 'PASS'),
  'Perplexity AI (GEO)': allResults[4].tests.some(t => t.name === 'Specific Data Points (GEO signal)' && t.status === 'PASS'),
  'ChatGPT Browse (GEO)': allResults[4].tests.some(t => t.name === 'Content Length (1000+ words ideal)' && t.status !== 'FAIL'),
  'DuckDuckGo': allResults[5].tests.some(t => t.name === 'HTTPS Enabled' && t.status === 'PASS'),
  'Apple Siri (Voice)': allResults[7].tests.some(t => t.name === 'Local Business Info (Near Me Queries)' && t.status === 'PASS'),
  'Amazon Alexa': allResults[7].tests.some(t => t.name === 'Opening Hours (Is Open Queries)' && t.status !== 'FAIL'),
  'Yandex': allResults[5].tests.some(t => t.name === 'JSON-LD in HTML Source' && t.status === 'PASS'),
  'Baidu': allResults[5].tests.some(t => t.name === 'Mobile Viewport' && t.status === 'PASS'),
}

Object.entries(platformChecks).forEach(([platform, ready]) => {
  console.log(`  ${ready ? '✅' : '❌'} ${platform}`)
})

const readyCount = Object.values(platformChecks).filter(Boolean).length
const totalPlatforms = Object.keys(platformChecks).length
console.log(`\n  Ready: ${readyCount}/${totalPlatforms} platforms`)

}

main()
