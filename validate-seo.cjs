// SEO Schema Validation Script — validates JSON-LD against Google Rich Results requirements
// Run: node validate-seo.js

const https = require('https')

const URL = process.env.URL || 'https://sparkleclean-pro-chi.vercel.app'

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => resolve(data))
    }).on('error', reject)
  })
}

function validateLocalBusiness(schema) {
  const errors = []
  const warnings = []
  
  // Required fields for LocalBusiness rich results
  if (!schema['@type']) errors.push('Missing @type')
  if (!schema.name) errors.push('Missing name')
  if (!schema.address) errors.push('Missing address')
  if (!schema.telephone && !schema.image) errors.push('Missing telephone OR image')
  
  // Address validation
  if (schema.address) {
    if (!schema.address['@type']) errors.push('Address missing @type')
    if (!schema.address.addressLocality) warnings.push('Address missing addressLocality')
    if (!schema.address.addressCountry) warnings.push('Address missing addressCountry')
  }
  
  // Recommended fields
  if (!schema.openingHoursSpecification) warnings.push('Missing openingHoursSpecification')
  if (!schema.aggregateRating) warnings.push('Missing aggregateRating')
  if (!schema.priceRange) warnings.push('Missing priceRange')
  if (!schema.geo) warnings.push('Missing geo coordinates')
  if (!schema.sameAs || schema.sameAs.length === 0) warnings.push('Missing social profiles (sameAs)')
  
  return { errors, warnings }
}

function validateFAQPage(schema) {
  const errors = []
  const warnings = []
  
  if (!schema['@type'] || schema['@type'] !== 'FAQPage') {
    errors.push('Missing or incorrect @type (expected FAQPage)')
  }
  
  if (!schema.mainEntity || !Array.isArray(schema.mainEntity)) {
    errors.push('Missing or invalid mainEntity')
  } else {
    if (schema.mainEntity.length === 0) {
      errors.push('mainEntity is empty (need at least 1 Q&A)')
    }
    
    schema.mainEntity.forEach((item, i) => {
      if (!item['@type'] || item['@type'] !== 'Question') {
        errors.push(`mainEntity[${i}] missing Question type`)
      }
      if (!item.name || item.name.trim() === '') {
        errors.push(`mainEntity[${i}] missing question (name)`)
      }
      if (!item.acceptedAnswer) {
        errors.push(`mainEntity[${i}] missing acceptedAnswer`)
      } else if (!item.acceptedAnswer.text) {
        errors.push(`mainEntity[${i}] missing answer text`)
      }
    })
    
    if (schema.mainEntity.length < 2) {
      warnings.push('Only 1 FAQ entry (Google recommends 2+ for rich results)')
    }
  }
  
  return { errors, warnings }
}

function validateMetaTags(html) {
  const results = { errors: [], warnings: [], passed: [] }
  
  // Check for required meta tags
  const checks = [
    { name: 'description', pattern: /<meta[^>]*name="description"[^>]*content="([^"]*)"/ },
    { name: 'og:title', pattern: /<meta[^>]*property="og:title"[^>]*content="([^"]*)"/ },
    { name: 'og:description', pattern: /<meta[^>]*property="og:description"[^>]*content="([^"]*)"/ },
    { name: 'og:url', pattern: /<meta[^>]*property="og:url"[^>]*content="([^"]*)"/ },
    { name: 'og:image', pattern: /<meta[^>]*property="og:image"[^>]*content="([^"]*)"/ },
    { name: 'og:type', pattern: /<meta[^>]*property="og:type"[^>]*content="([^"]*)"/ },
    { name: 'twitter:card', pattern: /<meta[^>]*name="twitter:card"[^>]*content="([^"]*)"/ },
    { name: 'canonical', pattern: /<link[^>]*rel="canonical"[^>]*href="([^"]*)"/ },
  ]
  
  checks.forEach(({ name, pattern }) => {
    const match = html.match(pattern)
    if (match) {
      results.passed.push(`✅ ${name}: ${match[1].substring(0, 80)}...`)
      
      // Validate OG image dimensions
      if (name === 'og:image') {
        const hasWidth = html.includes('og:image:width')
        const hasHeight = html.includes('og:image:height')
        if (!hasWidth) results.warnings.push('og:image missing width')
        if (!hasHeight) results.warnings.push('og:image missing height')
      }
      
      // Validate title length
      if (name === 'description' && match[1].length > 160) {
        results.warnings.push(`Description too long (${match[1].length} chars, max 160)`)
      }
    } else {
      results.errors.push(`❌ Missing: ${name}`)
    }
  })
  
  // Check for robots meta
  const robots = html.match(/<meta[^>]*name="robots"[^>]*content="([^"]*)"/)
  if (robots) {
    if (robots[1].includes('noindex')) {
      results.errors.push('❌ Page has noindex!')
    } else {
      results.passed.push(`✅ robots: ${robots[1]}`)
    }
  } else {
    results.warnings.push('⚠️ Missing robots meta tag')
  }
  
  // Check for hreflang
  const hreflang = html.match(/<link[^>]*rel="alternate"[^>]*hreflang="([^"]*)"/g)
  if (hreflang) {
    results.passed.push(`✅ hreflang: ${hreflang.length} alternate(s)`)
  } else {
    results.warnings.push('⚠️ Missing hreflang (needed for multi-language)')
  }
  
  return results
}

async function main() {
  console.log(`🔍 Validating SEO for: ${URL}\n`)
  
  const html = await fetchPage(URL)
  
  // Extract JSON-LD schemas
  const schemaRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
  const schemas = []
  let match
  
  while ((match = schemaRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim())
      schemas.push(parsed)
    } catch (e) {
      console.log(`❌ Invalid JSON-LD schema: ${e.message}`)
      console.log(`   Content: ${match[1].substring(0, 100)}...\n`)
    }
  }
  
  console.log(`📋 Found ${schemas.length} JSON-LD schema(s)\n`)
  
  let totalErrors = 0
  let totalWarnings = 0
  
  // Validate each schema
  schemas.forEach((schema, i) => {
    let result
    if (schema['@type'] === 'FAQPage') {
      result = validateFAQPage(schema)
    } else if (schema['@type'] === 'LocalBusiness' || schema['@type'] === 'CleaningBusiness') {
      result = validateLocalBusiness(schema)
    } else {
      console.log(`⏭️  Schema ${i + 1}: Unknown type "${schema['@type']}"\n`)
      return
    }
    
    console.log(`━━━ Schema ${i + 1}: ${schema['@type']} ━━━`)
    
    if (result.errors.length === 0) {
      console.log('✅ No critical errors')
    } else {
      result.errors.forEach((err) => console.log(`  ${err}`))
      totalErrors += result.errors.length
    }
    
    if (result.warnings.length > 0) {
      console.log('')
      result.warnings.forEach((warn) => console.log(`  ⚠️ ${warn}`))
      totalWarnings += result.warnings.length
    }
    
    console.log('')
  })
  
  // Validate meta tags
  console.log('━━━ Meta Tags ━━━')
  const metaResults = validateMetaTags(html)
  metaResults.passed.forEach((p) => console.log(`  ${p}`))
  if (metaResults.errors.length > 0) {
    console.log('')
    metaResults.errors.forEach((e) => console.log(`  ${e}`))
    totalErrors += metaResults.errors.length
  }
  if (metaResults.warnings.length > 0) {
    console.log('')
    metaResults.warnings.forEach((w) => console.log(`  ⚠️ ${w}`))
    totalWarnings += metaResults.warnings.length
  }
  console.log('')
  
  // Summary
  console.log('━━━ Summary ━━━')
  console.log(`  Errors:   ${totalErrors}`)
  console.log(`  Warnings: ${totalWarnings}`)
  console.log('')
  
  if (totalErrors === 0) {
    console.log('🎉 All critical SEO checks passed!')
    console.log('')
    console.log('Next: Validate with Google Rich Results Test:')
    console.log('https://search.google.com/test/rich-results')
    console.log('')
    console.log('Paste this URL:')
    console.log(URL)
  } else {
    console.log('❌ Fix critical errors before deploying')
    process.exit(1)
  }
}

main().catch(console.error)
