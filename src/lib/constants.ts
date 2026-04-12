export type IconName = 'Shield' | 'Leaf' | 'Clock' | 'MapPin'

export type ServiceEntry = {
  id: 'standard' | 'deep' | 'carpet' | 'windows' | 'oven'
  name: string
  desc: string
  icon: string
  color: string
}

export const SERVICES_LIST: ServiceEntry[] = [
  { id: 'standard' as const, name: 'Standard Clean', desc: 'Regular maintenance cleaning', icon: '🧹', color: '#00f0ff' },
  { id: 'deep' as const, name: 'Deep Clean', desc: 'Intensive sanitization', icon: '🔬', color: '#8b5cf6' },
  { id: 'carpet' as const, name: 'Carpet Clean', desc: 'Steam & extraction', icon: '🧽', color: '#00ff9d' },
  { id: 'windows' as const, name: 'Windows', desc: 'Interior & exterior', icon: '🪟', color: '#ffea00' },
  { id: 'oven' as const, name: 'Oven Clean', desc: 'Degrease & sanitize', icon: '🔥', color: '#ff0080' },
]

export const FAQS = [
  { q: 'How do you calculate cleaning quotes?', a: 'Our quote builder calculates prices based on selected services, property area, number of rooms, and booking frequency. Each service has a base cost, with area and room surcharges added. Weekly bookings receive 25% discount. All prices include GST.' },
  { q: 'What areas do you cover in Sydney?', a: 'We cover all of Greater Sydney Metropolitan area including CBD, Eastern Suburbs, Inner West, North Shore, Western Sydney, Sutherland Shire, and Northern Beaches. Travel within 50km is included at no extra charge.' },
  { q: 'Do you use eco-friendly products?', a: 'Yes! We offer eco-friendly cleaning options using sustainable, non-toxic products certified by Environmental Choice Australia. This option adds 15% to your quote but ensures zero chemical residue — perfect for families with children and pets.' },
  { q: 'What is your cancellation policy?', a: 'Free cancellation up to 24 hours before scheduled service. Cancellations within 24 hours incur a 50% fee. No-shows are charged the full quoted amount.' },
  { q: 'Are your cleaners insured and vetted?', a: 'Absolutely. All our cleaners undergo police checks, hold valid working rights, and are covered by our $20M public liability insurance. We also provide a 100% satisfaction guarantee — if you\'re not happy, we\'ll re-clean for free.' },
  { q: 'How long does a typical clean take?', a: 'Duration depends on property size and service type. A standard 150m² house clean takes 3–4 hours. Deep cleans may take 5–6 hours. We always allocate sufficient time for quality results, never rushing the job.' },
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
