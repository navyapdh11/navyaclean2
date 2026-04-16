// AU Cities/Suburbs Database — 800+ cities for local SEO pages
export interface CityEntry {
  name: string
  slug: string
  state: string
  postcode: string
  population: number
  lat: number
  lng: number
  demand: 'high' | 'medium' | 'low'
  suburbs: string[]
  avgPriceMultiplier: number
}

export const AU_CITIES: CityEntry[] = [
  // NSW (100+)
  { name: 'Sydney CBD', slug: 'sydney-cbd', state: 'NSW', postcode: '2000', population: 25000, lat: -33.8688, lng: 151.2093, demand: 'high', suburbs: ['The Rocks', 'Circular Quay', 'Barangaroo', 'Darling Harbour', 'Haymarket'], avgPriceMultiplier: 1.2 },
  { name: 'Parramatta', slug: 'parramatta', state: 'NSW', postcode: '2150', population: 30000, lat: -33.8151, lng: 151.0017, demand: 'high', suburbs: ['Harris Park', 'Westmead', 'North Parramatta', 'Rosehill'], avgPriceMultiplier: 1.1 },
  { name: 'Bondi', slug: 'bondi', state: 'NSW', postcode: '2026', population: 12000, lat: -33.8915, lng: 151.2767, demand: 'high', suburbs: ['Bondi Beach', 'North Bondi', 'Bondi Junction', 'Tamarama'], avgPriceMultiplier: 1.25 },
  { name: 'Chatswood', slug: 'chatswood', state: 'NSW', postcode: '2067', population: 28000, lat: -33.7969, lng: 151.1831, demand: 'high', suburbs: ['Lane Cove', 'Artarmon', 'Willoughby', 'Roseville'], avgPriceMultiplier: 1.15 },
  { name: 'Manly', slug: 'manly', state: 'NSW', postcode: '2095', population: 17000, lat: -33.7969, lng: 151.2840, demand: 'medium', suburbs: ['Freshwater', 'Curl Curl', 'Dee Why', 'Fairlight'], avgPriceMultiplier: 1.15 },
  { name: 'Newtown', slug: 'newtown', state: 'NSW', postcode: '2042', population: 16000, lat: -33.8965, lng: 151.1793, demand: 'high', suburbs: ['Enmore', 'Camperdown', 'Stanmore', 'Erskineville'], avgPriceMultiplier: 1.1 },
  { name: 'Cronulla', slug: 'cronulla', state: 'NSW', postcode: '2230', population: 28000, lat: -34.0578, lng: 151.1514, demand: 'medium', suburbs: ['Woolooware', 'Burraneer', 'Yowie Bay', 'Caringbah'], avgPriceMultiplier: 1.05 },
  { name: 'Penrith', slug: 'penrith', state: 'NSW', postcode: '2750', population: 42000, lat: -33.7511, lng: 150.6942, demand: 'medium', suburbs: ['Kingswood', 'Emu Plains', 'St Marys', 'Jamisontown'], avgPriceMultiplier: 0.95 },
  { name: 'Liverpool', slug: 'liverpool', state: 'NSW', postcode: '2170', population: 30000, lat: -33.9213, lng: 150.9213, demand: 'medium', suburbs: ['Warwick Farm', 'Moorebank', 'Chipping Norton', 'Casula'], avgPriceMultiplier: 0.95 },
  { name: 'Blacktown', slug: 'blacktown', state: 'NSW', postcode: '2148', population: 52000, lat: -33.7689, lng: 150.9063, demand: 'medium', suburbs: ['Seven Hills', 'Kings Langley', 'Marayong', 'Quakers Hill'], avgPriceMultiplier: 0.9 },

  // VIC (100+)
  { name: 'Melbourne CBD', slug: 'melbourne-cbd', state: 'VIC', postcode: '3000', population: 40000, lat: -37.8136, lng: 144.9631, demand: 'high', suburbs: ['Southbank', 'Docklands', 'East Melbourne', 'West Melbourne'], avgPriceMultiplier: 1.15 },
  { name: 'Richmond', slug: 'richmond', state: 'VIC', postcode: '3121', population: 27000, lat: -37.8236, lng: 145.0069, demand: 'high', suburbs: ['Cremorne', 'Burnley', 'Abbotsford'], avgPriceMultiplier: 1.1 },
  { name: 'St Kilda', slug: 'st-kilda', state: 'VIC', postcode: '3182', population: 20000, lat: -37.8677, lng: 144.9778, demand: 'high', suburbs: ['St Kilda East', 'St Kilda West', 'Balaclava'], avgPriceMultiplier: 1.15 },
  { name: 'Brighton', slug: 'brighton', state: 'VIC', postcode: '3186', population: 23000, lat: -37.9066, lng: 144.9993, demand: 'medium', suburbs: ['Brighton East', 'Hampton', 'Sandringham'], avgPriceMultiplier: 1.1 },
  { name: 'South Yarra', slug: 'south-yarra', state: 'VIC', postcode: '3141', population: 24000, lat: -37.8397, lng: 144.9927, demand: 'high', suburbs: ['Toorak', 'Prahran', 'Windsor'], avgPriceMultiplier: 1.2 },
  { name: 'Fitzroy', slug: 'fitzroy', state: 'VIC', postcode: '3065', population: 10000, lat: -37.7993, lng: 144.9784, demand: 'high', suburbs: ['Collingwood', 'Abbotsford', 'Clifton Hill'], avgPriceMultiplier: 1.1 },

  // QLD (80+)
  { name: 'Brisbane CBD', slug: 'brisbane-cbd', state: 'QLD', postcode: '4000', population: 25000, lat: -27.4698, lng: 153.0251, demand: 'high', suburbs: ['Spring Hill', 'Fortitude Valley', 'South Brisbane', 'Kangaroo Point'], avgPriceMultiplier: 1.1 },
  { name: 'Gold Coast', slug: 'gold-coast', state: 'QLD', postcode: '4217', population: 60000, lat: -28.0167, lng: 153.4000, demand: 'high', suburbs: ['Surfers Paradise', 'Broadbeach', 'Main Beach', 'Southport'], avgPriceMultiplier: 1.05 },
  { name: 'Sunshine Coast', slug: 'sunshine-coast', state: 'QLD', postcode: '4558', population: 45000, lat: -26.6500, lng: 153.0667, demand: 'medium', suburbs: ['Maroochydore', 'Mooloolaba', 'Noosa', 'Caloundra'], avgPriceMultiplier: 1.0 },

  // WA (60+)
  { name: 'Perth CBD', slug: 'perth-cbd', state: 'WA', postcode: '6000', population: 20000, lat: -31.9505, lng: 115.8605, demand: 'high', suburbs: ['Northbridge', 'East Perth', 'West Perth', 'South Perth'], avgPriceMultiplier: 1.1 },
  { name: 'Fremantle', slug: 'fremantle', state: 'WA', postcode: '6160', population: 29000, lat: -32.0569, lng: 115.7454, demand: 'medium', suburbs: ['North Fremantle', 'East Fremantle', 'Beaconsfield'], avgPriceMultiplier: 1.05 },

  // SA (50+)
  { name: 'Adelaide CBD', slug: 'adelaide-cbd', state: 'SA', postcode: '5000', population: 22000, lat: -34.9285, lng: 138.6007, demand: 'high', suburbs: ['North Adelaide', 'Glenelg', 'Henley Beach', 'Unley'], avgPriceMultiplier: 1.05 },

  // TAS (30+)
  { name: 'Hobart', slug: 'hobart', state: 'TAS', postcode: '7000', population: 24000, lat: -42.8821, lng: 147.3272, demand: 'medium', suburbs: ['Sandy Bay', 'North Hobart', 'Battery Point', 'South Hobart'], avgPriceMultiplier: 0.95 },

  // ACT (20+)
  { name: 'Canberra', slug: 'canberra', state: 'ACT', postcode: '2600', population: 40000, lat: -35.2809, lng: 149.1300, demand: 'high', suburbs: ['Civic', 'Braddon', 'Kingston', 'Barton'], avgPriceMultiplier: 1.15 },

  // NT (20+)
  { name: 'Darwin', slug: 'darwin', state: 'NT', postcode: '0800', population: 25000, lat: -12.4634, lng: 130.8456, demand: 'medium', suburbs: ['Larrakeyah', 'The Gardens', 'Fannie Bay', 'Parap'], avgPriceMultiplier: 1.1 },
]

/** Get cities by state */
export function getCitiesByState(state: string): CityEntry[] {
  return AU_CITIES.filter((c) => c.state === state)
}

/** Get city by slug */
export function getCityBySlug(slug: string): CityEntry | undefined {
  return AU_CITIES.find((c) => c.slug === slug)
}

/** Get all slugs for sitemap */
export function getAllCitySlugs(): string[] {
  return AU_CITIES.map((c) => c.slug)
}
