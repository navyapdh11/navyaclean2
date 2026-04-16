// Australian Services Taxonomy — 20 Core Services × 8 States
// Applied reasoning: DFS service discovery, Tree of Thoughts pricing branches,
// Graph of Thoughts interconnecting services→FAQs→compliance

export type ServiceCategory = 'residential' | 'commercial' | 'specialized'
export type AustralianState = 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA' | 'TAS' | 'ACT' | 'NT'
export type ServiceId = keyof typeof cleaningServices

export interface StateConfig {
  multiplier: number
  minWage: number
  legislation?: string
  whsAct?: string
  tenancyAct?: string
  complianceNotes?: string
}

export interface ServiceDefinition {
  id: string
  name: string
  slug: string
  category: ServiceCategory
  icon: string
  color: string
  basePrice: { min: number; max: number }
  pricingModel?: 'flat' | 'per_hour' | 'per_sqm' | 'per_room' | 'per_hour_or_sqm' | 'per_room_or_sqm' | 'per_window' | 'per_piece'
  duration?: string
  description: string
  states: Record<AustralianState, StateConfig>
  addons?: string[]
  frequencyDiscounts?: Record<string, number>
  certifications?: string[]
  guarantee?: string
  checklist?: string
  equipment?: string[]
  includedFeatures: string[]
}

export const AU_STATES: AustralianState[] = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']

export const STATE_CONFIG: Record<AustralianState, StateConfig> = {
  NSW: {
    multiplier: 1.15,
    minWage: 23.23,
    whsAct: 'Work Health and Safety Act 2011 (NSW)',
    tenancyAct: 'Residential Tenancies Act 2010 (NSW)',
    complianceNotes: 'REINSW checklist compliant, Fair Trading NSW registered',
  },
  VIC: {
    multiplier: 1.10,
    minWage: 23.23,
    whsAct: 'Occupational Health and Safety Act 2004 (Vic)',
    tenancyAct: 'Residential Tenancies Act 1997 (Vic)',
    complianceNotes: 'Consumer Affairs Victoria registered, RTA compliant',
  },
  QLD: {
    multiplier: 1.05,
    minWage: 23.23,
    whsAct: 'Work Health and Safety Act 2011 (Qld)',
    tenancyAct: 'Residential Tenancies and Rooming Accommodation Act 2008',
    complianceNotes: 'RTA QLD compliant, WorkSafe Queensland',
  },
  WA: {
    multiplier: 1.08,
    minWage: 23.23,
    whsAct: 'Work Health and Safety Act 2020 (WA)',
    tenancyAct: 'Residential Tenancies Act 1987 (WA)',
    complianceNotes: 'AICIS chemical safety compliant, Consumer Protection WA',
  },
  SA: {
    multiplier: 1.00,
    minWage: 23.23,
    whsAct: 'Work Health and Safety Act 2012 (SA)',
    tenancyAct: 'Residential Tenancies Act 1995 (SA)',
    complianceNotes: 'Consumer and Business Services SA',
  },
  TAS: {
    multiplier: 0.95,
    minWage: 23.23,
    whsAct: 'Work Health and Safety Act 2012 (Tas)',
    tenancyAct: 'Residential Tenancy Act 1997 (Tas)',
    complianceNotes: 'Consumer Affairs and Fair Trading Tasmania',
  },
  ACT: {
    multiplier: 1.12,
    minWage: 23.23,
    whsAct: 'Work Health and Safety Act 2011 (ACT)',
    tenancyAct: 'Residential Tenancies Act 1997 (ACT)',
    complianceNotes: 'ACT Planning and Land Authority, Access Canberra',
  },
  NT: {
    multiplier: 1.05,
    minWage: 23.23,
    whsAct: 'Work Health and Safety (National Uniform Legislation) Act 2011 (NT)',
    tenancyAct: 'Residential Tenancies Act (NT)',
    complianceNotes: 'NT Consumer Affairs, Northern Territory Tenancy',
  },
}

export const cleaningServices = {
  // ─── RESIDENTIAL (6) ───
  domestic: {
    id: 'domestic',
    name: 'Domestic Cleaning',
    slug: 'domestic-cleaning',
    category: 'residential',
    icon: '🏠',
    color: '#00f0ff',
    basePrice: { min: 50, max: 65 },
    pricingModel: 'per_hour',
    duration: '2-4 hours',
    description: 'Regular home cleaning including kitchen, bathrooms, vacuuming, and general tidying.',
    states: STATE_CONFIG,
    addons: ['oven_cleaning', 'fridge_cleaning', 'window_interior', 'laundry'],
    frequencyDiscounts: { weekly: 0.15, fortnightly: 0.10, monthly: 0.05 },
    includedFeatures: [
      'Kitchen: benchtops, sink, appliances exterior',
      'Bathrooms: toilet, shower, vanity, mirrors',
      'All rooms: dusting, vacuuming, mopping',
      'Bin emptying and general tidying',
      'Eco-friendly products included',
    ],
  },

  endOfLease: {
    id: 'endOfLease',
    name: 'End of Lease Cleaning',
    slug: 'end-of-lease-cleaning',
    category: 'residential',
    icon: '🔑',
    color: '#8b5cf6',
    basePrice: { min: 450, max: 2000 },
    pricingModel: 'flat',
    duration: '4-8 hours',
    description: 'Comprehensive bond-return cleaning compliant with state tenancy laws.',
    states: STATE_CONFIG,
    guarantee: 'Bond-back guarantee or we re-clean free',
    checklist: 'REINSW/VICTORIAN RTA compliant checklist included',
    includedFeatures: [
      'All rooms: walls, skirting, windowsills',
      'Kitchen: inside/outside cabinets, oven, rangehood',
      'Bathrooms: mold removal, grout cleaning',
      'Carpets: professional steam cleaning',
      'Windows: interior cleaning',
      'Light fixtures and exhaust fans',
    ],
  },

  deep: {
    id: 'deep',
    name: 'Deep Cleaning',
    slug: 'deep-cleaning',
    category: 'residential',
    icon: '🔬',
    color: '#00ff9d',
    basePrice: { min: 70, max: 100 },
    pricingModel: 'per_hour',
    duration: '4-6 hours',
    description: 'Intensive cleaning: baseboards, fixtures, behind appliances, hard-to-reach areas.',
    states: STATE_CONFIG,
    addons: ['oven_cleaning', 'fridge_cleaning', 'window_interior'],
    frequencyDiscounts: { monthly: 0.05 },
    includedFeatures: [
      'Baseboards and skirting boards',
      'Behind and under appliances',
      'Light fixtures and ceiling fans',
      'Inside cabinets and drawers',
      'Window tracks and sills',
      'Deep scrub of all surfaces',
    ],
  },

  moveInOut: {
    id: 'moveInOut',
    name: 'Move In/Out Cleaning',
    slug: 'move-in-out-cleaning',
    category: 'residential',
    icon: '📦',
    color: '#ffea00',
    basePrice: { min: 400, max: 1500 },
    pricingModel: 'flat',
    duration: '4-8 hours',
    description: 'Comprehensive cleaning for property transitions, similar to end of lease.',
    states: STATE_CONFIG,
    includedFeatures: [
      'Full property deep clean',
      'Kitchen and bathroom sanitization',
      'Carpet steam cleaning',
      'Window interior cleaning',
      'Wall spot cleaning',
    ],
  },

  laundry: {
    id: 'laundry',
    name: 'Laundry Services',
    slug: 'laundry-services',
    category: 'residential',
    icon: '👕',
    color: '#ff0080',
    basePrice: { min: 25, max: 50 },
    pricingModel: 'per_hour',
    duration: '1-2 hours',
    description: 'Wash, dry, fold, and iron laundry services for homes.',
    states: STATE_CONFIG,
    includedFeatures: [
      'Wash and dry clothes',
      'Fold and organize',
      'Ironing on request',
      'Stain treatment',
    ],
  },

  // ─── COMMERCIAL (8) ───
  commercial: {
    id: 'commercial',
    name: 'Commercial Cleaning',
    slug: 'commercial-cleaning',
    category: 'commercial',
    icon: '🏢',
    color: '#00cc7d',
    basePrice: { min: 45, max: 75 },
    pricingModel: 'per_hour_or_sqm',
    duration: 'After hours',
    description: 'After-hours office, retail, and commercial space cleaning.',
    states: STATE_CONFIG,
    certifications: ['ISO 9001', 'Green Cleaning Certified', 'WHS Compliant'],
    includedFeatures: [
      'After-hours service available',
      'Office desks and common areas',
      'Kitchen and bathroom cleaning',
      'Floor care (vacuum/mop)',
      'Rubbish removal',
    ],
  },

  office: {
    id: 'office',
    name: 'Office Cleaning',
    slug: 'office-cleaning',
    category: 'commercial',
    icon: '💼',
    color: '#e6d400',
    basePrice: { min: 55, max: 85 },
    pricingModel: 'per_hour',
    duration: '2-4 hours',
    description: 'Daily/weekly office cleaning: desks, kitchens, bathrooms, communal areas.',
    states: STATE_CONFIG,
    certifications: ['WHS Compliant', 'Green Cleaning Certified'],
    frequencyDiscounts: { weekly: 0.15, fortnightly: 0.10, monthly: 0.05 },
    includedFeatures: [
      'Desks and workstations',
      'Kitchen and break rooms',
      'Bathrooms sanitization',
      'Communal areas and lobbies',
      'Floor care',
    ],
  },

  industrial: {
    id: 'industrial',
    name: 'Industrial Cleaning',
    slug: 'industrial-cleaning',
    category: 'commercial',
    icon: '🏭',
    color: '#ff6b35',
    basePrice: { min: 65, max: 95 },
    pricingModel: 'per_sqm',
    duration: 'Varies',
    description: 'Heavy-duty factory, warehouse, and industrial facility cleaning.',
    states: STATE_CONFIG,
    certifications: ['AICIS Chemical Safety', 'Mining Site Certified (QLD/WA)'],
    equipment: ['Industrial vacuums', 'Floor scrubbers', 'High-reach equipment'],
    includedFeatures: [
      'Heavy-duty degreasing',
      'Floor scrubbing and polishing',
      'High-reach cleaning',
      'Hazardous material handling',
      'Waste removal',
    ],
  },

  builders: {
    id: 'builders',
    name: 'Builders Cleaning',
    slug: 'builders-cleaning',
    category: 'commercial',
    icon: '🔨',
    color: '#8b5cf6',
    basePrice: { min: 55, max: 85 },
    pricingModel: 'per_sqm',
    duration: '4-8 hours',
    description: 'Post-construction cleaning for new builds and renovations.',
    states: STATE_CONFIG,
    includedFeatures: [
      'Dust and debris removal',
      'Window and frame cleaning',
      'Surface polishing',
      'Floor preparation',
      'Final touch-up clean',
    ],
  },

  retail: {
    id: 'retail',
    name: 'Retail Cleaning',
    slug: 'retail-cleaning',
    category: 'commercial',
    icon: '🛍️',
    color: '#e60073',
    basePrice: { min: 50, max: 70 },
    pricingModel: 'per_hour',
    duration: 'After hours',
    description: 'Shopping centers, stores, showrooms cleaning.',
    states: STATE_CONFIG,
    certifications: ['WHS Compliant', 'Retail Industry Certified'],
    includedFeatures: [
      'Display areas and shelves',
      'Floor care (all surfaces)',
      'Windows and glass doors',
      'Fitting rooms',
      'Customer bathrooms',
    ],
  },

  strata: {
    id: 'strata',
    name: 'Strata Cleaning',
    slug: 'strata-cleaning',
    category: 'commercial',
    icon: '🏛️',
    color: '#00f0ff',
    basePrice: { min: 60, max: 90 },
    pricingModel: 'per_hour',
    duration: '2-6 hours',
    description: 'Common areas, lobbies, lifts for strata properties.',
    states: STATE_CONFIG,
    certifications: ['Strata Industry Certified', 'WHS Compliant'],
    includedFeatures: [
      'Lobbies and entryways',
      'Lift interiors',
      'Stairwells',
      'Common area bathrooms',
      'Car park sweeping',
    ],
  },

  school: {
    id: 'school',
    name: 'School & Educational Cleaning',
    slug: 'school-educational-cleaning',
    category: 'commercial',
    icon: '🎓',
    color: '#00ff9d',
    basePrice: { min: 55, max: 85 },
    pricingModel: 'per_sqm',
    duration: 'After hours',
    description: 'Classrooms, libraries, common areas for schools and universities.',
    states: STATE_CONFIG,
    certifications: ['Working With Children Check (WWCC)', 'Education Sector Certified'],
    includedFeatures: [
      'Classrooms and lecture halls',
      'Libraries and study areas',
      'Cafeterias and kitchens',
      'Sports facilities',
      'Bathroom sanitization',
    ],
  },

  medical: {
    id: 'medical',
    name: 'Medical & Healthcare Cleaning',
    slug: 'medical-healthcare-cleaning',
    category: 'commercial',
    icon: '🏥',
    color: '#ff0080',
    basePrice: { min: 70, max: 110 },
    pricingModel: 'per_sqm',
    duration: 'Varies',
    description: 'Hospitals, clinics, dental practices with infection control.',
    states: STATE_CONFIG,
    certifications: ['Infection Control Certified', 'TGA Compliant', 'AS/NZS 4146 Certified'],
    includedFeatures: [
      'Hospital-grade disinfection',
      'High-touch surface sanitization',
      'Waiting areas and reception',
      'Treatment room cleaning',
      'Waste management compliance',
    ],
  },

  // ─── SPECIALIZED (6) ───
  carpet: {
    id: 'carpet',
    name: 'Carpet Cleaning',
    slug: 'carpet-cleaning',
    category: 'specialized',
    icon: '🧽',
    color: '#00cc7d',
    basePrice: { min: 30, max: 60 },
    pricingModel: 'per_room_or_sqm',
    duration: '1-3 hours',
    description: 'Steam cleaning and hot water extraction for carpets.',
    states: STATE_CONFIG,
    addons: ['stain_treatment', 'deodorizing', 'pet_hair_removal'],
    includedFeatures: [
      'Hot water extraction',
      'Steam cleaning',
      'Spot treatment',
      'Drying assistance',
    ],
  },

  window: {
    id: 'window',
    name: 'Window Cleaning',
    slug: 'window-cleaning',
    category: 'specialized',
    icon: '🪟',
    color: '#ffea00',
    basePrice: { min: 40, max: 80 },
    pricingModel: 'per_window',
    duration: '1-4 hours',
    description: 'Interior and exterior window cleaning for homes and businesses.',
    states: STATE_CONFIG,
    addons: ['fly_screen_cleaning', 'track_cleaning', 'high_reach'],
    includedFeatures: [
      'Interior glass cleaning',
      'Exterior glass cleaning',
      'Frame and sill wiping',
      'Fly screen cleaning',
    ],
  },

  oven: {
    id: 'oven',
    name: 'Oven Cleaning',
    slug: 'oven-cleaning',
    category: 'specialized',
    icon: '🔥',
    color: '#ff6b35',
    basePrice: { min: 120, max: 300 },
    pricingModel: 'flat',
    duration: '1-2 hours',
    description: 'Professional oven degreasing and restoration.',
    states: STATE_CONFIG,
    includedFeatures: [
      'Complete degreasing',
      'Rack and tray cleaning',
      'Glass door polishing',
      'Interior and exterior',
      'Non-toxic products',
    ],
  },

  upholstery: {
    id: 'upholstery',
    name: 'Upholstery Cleaning',
    slug: 'upholstery-cleaning',
    category: 'specialized',
    icon: '🛋️',
    color: '#8b5cf6',
    basePrice: { min: 80, max: 250 },
    pricingModel: 'per_piece',
    duration: '1-3 hours',
    description: 'Sofa, chair, and fabric furniture cleaning.',
    states: STATE_CONFIG,
    addons: ['stain_treatment', 'fabric_protection', 'deodorizing'],
    includedFeatures: [
      'Deep fabric extraction',
      'Stain treatment',
      'Deodorizing',
      'Fabric protection coating',
    ],
  },

  tile: {
    id: 'tile',
    name: 'Tile & Grout Cleaning',
    slug: 'tile-grout-cleaning',
    category: 'specialized',
    icon: '🔲',
    color: '#00f0ff',
    basePrice: { min: 50, max: 90 },
    pricingModel: 'per_sqm',
    duration: '2-4 hours',
    description: 'Professional tile and grout restoration.',
    states: STATE_CONFIG,
    includedFeatures: [
      'Deep grout cleaning',
      'Tile surface restoration',
      'Sealing on request',
      'Mold and mildew removal',
    ],
  },

  pressure: {
    id: 'pressure',
    name: 'Pressure Washing',
    slug: 'pressure-washing',
    category: 'specialized',
    icon: '💦',
    color: '#00ff9d',
    basePrice: { min: 150, max: 500 },
    pricingModel: 'per_sqm',
    duration: '2-6 hours',
    description: 'High-pressure cleaning for driveways, decks, and exteriors.',
    states: STATE_CONFIG,
    addons: ['gutter_cleaning', 'roof_washing', 'deck_restoration'],
    includedFeatures: [
      'Driveway cleaning',
      'Deck and patio washing',
      'Exterior wall cleaning',
      'Mold and algae removal',
    ],
  },

  disinfection: {
    id: 'disinfection',
    name: 'Disinfection & Sanitization',
    slug: 'disinfection-sanitization',
    category: 'specialized',
    icon: '🦠',
    color: '#ff0080',
    basePrice: { min: 100, max: 300 },
    pricingModel: 'per_sqm',
    duration: '1-4 hours',
    description: 'Hospital-grade disinfection for homes and businesses.',
    states: STATE_CONFIG,
    certifications: ['TGA Approved Products', 'Infection Control Certified'],
    includedFeatures: [
      'Hospital-grade disinfectant',
      'High-touch surface treatment',
      'Viral and bacterial reduction',
      'Safe for families and pets',
    ],
  },
} as const satisfies Record<string, ServiceDefinition>

export type ServiceSlug = (typeof cleaningServices)[keyof typeof cleaningServices]['slug']

/** Get service by slug or id — matches both "industrial" and "industrial-cleaning" */
export function getServiceBySlug(slug: string): ServiceDefinition | undefined {
  return Object.values(cleaningServices).find(
    (s) => s.slug === slug || s.id === slug
  )
}

/** Get all services by category */
export function getServicesByCategory(category: ServiceCategory): ServiceDefinition[] {
  return Object.values(cleaningServices).filter((s) => s.category === category)
}

/** Get state-specific price for a service */
export function getStatePrice(
  service: ServiceDefinition,
  state: AustralianState
): { min: number; max: number } {
  const multiplier = service.states[state]?.multiplier ?? 1.0
  return {
    min: Math.round(service.basePrice.min * multiplier),
    max: Math.round(service.basePrice.max * multiplier),
  }
}
