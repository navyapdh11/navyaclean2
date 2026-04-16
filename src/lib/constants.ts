export type IconName = 'Shield' | 'Leaf' | 'Clock' | 'MapPin'

export type ServiceEntry = {
  id: 'standard' | 'deep' | 'carpet' | 'windows' | 'oven' | 'domestic' | 'endOfLease' | 'moveInOut' | 'laundry' | 'commercial' | 'office' | 'industrial' | 'builders' | 'retail' | 'strata' | 'school' | 'medical' | 'window' | 'upholstery' | 'tile' | 'pressure' | 'disinfection'
  name: string
  desc: string
  icon: string
  color: string
}

export const SERVICES_LIST: ServiceEntry[] = [
  // Original 5
  { id: 'standard' as const, name: 'Standard Clean', desc: 'Regular maintenance cleaning', icon: '🧹', color: '#00f0ff' },
  { id: 'deep' as const, name: 'Deep Clean', desc: 'Intensive sanitization', icon: '🔬', color: '#8b5cf6' },
  { id: 'carpet' as const, name: 'Carpet Clean', desc: 'Steam & extraction', icon: '🧽', color: '#00ff9d' },
  { id: 'windows' as const, name: 'Windows', desc: 'Interior & exterior', icon: '🪟', color: '#ffea00' },
  { id: 'oven' as const, name: 'Oven Clean', desc: 'Degrease & sanitize', icon: '🔥', color: '#ff0080' },
  // AU expansion (15 more)
  { id: 'domestic' as const, name: 'Domestic Clean', desc: 'Regular home cleaning', icon: '🏠', color: '#00f0ff' },
  { id: 'endOfLease' as const, name: 'End of Lease', desc: 'Bond-back guarantee', icon: '🔑', color: '#8b5cf6' },
  { id: 'moveInOut' as const, name: 'Move In/Out', desc: 'Property transition clean', icon: '📦', color: '#ffea00' },
  { id: 'laundry' as const, name: 'Laundry Service', desc: 'Wash, dry, fold', icon: '👕', color: '#ff0080' },
  { id: 'commercial' as const, name: 'Commercial Clean', desc: 'Office & retail', icon: '🏢', color: '#00cc7d' },
  { id: 'office' as const, name: 'Office Clean', desc: 'Daily/weekly service', icon: '💼', color: '#e6d400' },
  { id: 'industrial' as const, name: 'Industrial Clean', desc: 'Factory & warehouse', icon: '🏭', color: '#ff6b35' },
  { id: 'builders' as const, name: 'Builders Clean', desc: 'Post-construction', icon: '🔨', color: '#8b5cf6' },
  { id: 'retail' as const, name: 'Retail Clean', desc: 'Shops & showrooms', icon: '🛍️', color: '#e60073' },
  { id: 'strata' as const, name: 'Strata Clean', desc: 'Common areas & lifts', icon: '🏛️', color: '#00f0ff' },
  { id: 'school' as const, name: 'School Clean', desc: 'Educational facilities', icon: '🎓', color: '#00ff9d' },
  { id: 'medical' as const, name: 'Medical Clean', desc: 'Healthcare & clinics', icon: '🏥', color: '#ff0080' },
  { id: 'window' as const, name: 'Window Clean', desc: 'Interior & exterior', icon: '🪟', color: '#ffea00' },
  { id: 'upholstery' as const, name: 'Upholstery Clean', desc: 'Sofas & furniture', icon: '🛋️', color: '#8b5cf6' },
  { id: 'tile' as const, name: 'Tile & Grout', desc: 'Restoration & sealing', icon: '🔲', color: '#00f0ff' },
  { id: 'pressure' as const, name: 'Pressure Wash', desc: 'Driveways & decks', icon: '💦', color: '#00ff9d' },
  { id: 'disinfection' as const, name: 'Disinfection', desc: 'Hospital-grade sanitization', icon: '🦠', color: '#ff0080' },
]

export const FAQS = [
  { q: 'How do you calculate cleaning quotes?', a: 'Our quote builder uses four factors: the service type, property area, number of rooms, and booking frequency. Each service has a base cost. Weekly bookings get 25% off. All prices include GST.' },
  { q: 'What areas do you cover in Sydney?', a: 'All of Greater Sydney — CBD, Eastern Suburbs, Inner West, North Shore, Western Sydney, Sutherland Shire, and Northern Beaches. Travel within 50km is included.' },
  { q: 'Do you use eco-friendly products?', a: 'Yes. We use products certified by Environmental Choice Australia. They\'re non-toxic and safe for children and pets. The eco-friendly option adds about 15% to your quote.' },
  { q: 'What is your cancellation policy?', a: 'Free cancellation up to 24 hours before your scheduled service. Less than 24 hours incurs a 50% fee. No-shows are charged the full amount.' },
  { q: 'Are your cleaners insured and vetted?', a: 'All cleaners have police checks, valid working rights, and are covered by our $20M public liability insurance. If you\'re not happy with the clean, we\'ll re-clean for free.' },
  { q: 'How long does a typical clean take?', a: 'A standard 150m² house takes about 3–4 hours. Deep cleans run longer — closer to 5–6 hours. We don\'t rush.' },
]

export type TrustBadgeEntry = {
  icon: IconName
  title: string
  desc: string
  color: string
}

export const TRUST_BADGES: TrustBadgeEntry[] = [
  { icon: 'Shield' as const, title: 'Hospital Grade', desc: 'Disinfectant Tech', color: '#00f0ff' },
  { icon: 'Leaf' as const, title: 'Eco Certified', desc: 'Sustainable Products', color: '#00cc7d' },
  { icon: 'Clock' as const, title: 'Same Day', desc: 'Guaranteed Service', color: '#e6d400' },
  { icon: 'MapPin' as const, title: 'Sydney Wide', desc: 'Metro Coverage', color: '#e60073' },
]

export const PHONE_DISPLAY = '+61 2 9000 0000'
export const PHONE_LINK = 'tel:+61290000000'
export const EMAIL_DISPLAY = 'contact@sparkleclean.pro'
export const EMAIL_LINK = 'mailto:contact@sparkleclean.pro'

// ──────────────────────────────────────────────────────────────
// Site Configuration (used by SEO, sitemap, etc.)
// ──────────────────────────────────────────────────────────────

export const SITE_CONFIG = {
  // Site URLs
  siteUrl: import.meta.env.VITE_SITE_URL || 'https://sparkleclean.pro',
  // Business Info
  businessName: 'SparkleClean Pro',
  description: 'Premium 3D Cleaning Quote Builder — Transparent Pricing, Instant Results',
  phone: '+61-2-9000-0000',
  email: 'contact@sparkleclean.pro',
  abn: '12 345 678 901',
  // Address
  address: {
    street: '123 Clean Street',
    city: 'Sydney',
    state: 'NSW',
    postcode: '2000',
    country: 'AU',
  },
  // Geo coordinates
  geo: {
    latitude: -33.8688,
    longitude: 151.2093,
  },
  // Social profiles
  social: {
    facebook: 'https://facebook.com/sparklecleanpro',
    instagram: 'https://instagram.com/sparklecleanpro',
    linkedin: 'https://linkedin.com/company/sparklecleanpro',
    twitter: '@sparklecleanpro',
  },
  // Operating hours
  openingHours: {
    weekdays: { open: '07:00', close: '20:00' },
    saturday: { open: '08:00', close: '18:00' },
    sunday: null, // Closed
  },
  // Aggregate rating
  rating: {
    value: '4.9',
    count: '487',
    best: '5',
    worst: '1',
  },
  // Default SEO image (OG image path)
  defaultOgImage: '/og-image.jpg',
  // Supported locales for alternate language links
  locales: [
    { code: 'en-AU', hrefLang: 'en-au', url: '/' },
    // Add more locales as needed: { code: 'zh-AU', hrefLang: 'zh-au', url: '/zh' }
  ],
} as const
