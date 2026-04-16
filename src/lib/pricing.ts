import type { QuoteForm } from './schema'
import type { ServiceDefinition, AustralianState } from './services-au'

// ─── Pricing Constants ─────────────────────────────────────────
export const SERVICE_BASE_COSTS: Record<string, number> = {
  standard: 80,
  deep: 150,
  carpet: 60,
  windows: 45,
  oven: 35,
  // AU services expansion
  domestic: 55,
  endOfLease: 500,
  moveInOut: 450,
  laundry: 35,
  commercial: 60,
  office: 70,
  industrial: 80,
  builders: 70,
  retail: 60,
  strata: 75,
  school: 70,
  medical: 90,
  window: 60,
  upholstery: 120,
  tile: 70,
  pressure: 200,
  disinfection: 150,
}

export const AREA_RATES: Record<string, number> = {
  house: 1.2,
  apartment: 1.4,
  office: 1.6,
  commercial: 2.0,
}

export const ROOM_SURCHARGES = { bedroom: 15, bathroom: 20 }

export const FREQUENCY_DISCOUNTS: Record<string, number> = {
  'one-time': 0,
  weekly: 0.25,
  fortnightly: 0.15,
  monthly: 0.10,
}

export const PET_SURCHARGE = 35
export const ECO_MULTIPLIER = 1.15
export const URGENT_MULTIPLIER = 1.5

/**
 * Calculate cleaning quote with proper ordering:
 * 1. Base service costs (additive)
 * 2. Area-based rate
 * 3. Room surcharges
 * 4. Pet surcharge (flat)
 * 5. Frequency discount (percentage off subtotal)
 * 6. Eco-friendly multiplier (if applicable)
 * 7. Urgent multiplier (if applicable)
 *
 * All prices include GST.
 */
export function calculateQuote(data: QuoteForm): number {
  // 1. Base cost from selected services (additive)
  let price = data.services.reduce((sum, s) => sum + (SERVICE_BASE_COSTS[s] ?? 0), 0)

  // 2. Area-based cost
  const areaRate = AREA_RATES[data.propertyType] ?? 1.0
  price += data.area * areaRate

  // 3. Room surcharges
  price += data.bedrooms * ROOM_SURCHARGES.bedroom
  price += data.bathrooms * ROOM_SURCHARGES.bathroom

  // 4. Pet surcharge (flat add-on)
  if (data.pets) price += PET_SURCHARGE

  // 5. Frequency discount applied to subtotal
  const discount = FREQUENCY_DISCOUNTS[data.frequency] ?? 0
  price *= (1 - discount)

  // 6. Eco-friendly multiplier
  if (data.ecoFriendly) price *= ECO_MULTIPLIER

  // 7. Urgent multiplier
  if (data.urgent) price *= URGENT_MULTIPLIER

  // Round to nearest dollar (GST inclusive)
  return Math.round(price)
}

/**
 * Format price for display with GST breakdown
 */
export function formatPrice(total: number): { total: string; gst: string; subtotal: string } {
  const gst = Math.round(total / 11) // 1/11 of total is GST in Australia
  const subtotal = total - gst
  return {
    total: `$${total.toLocaleString('en-AU')}`,
    gst: `$${gst.toLocaleString('en-AU')}`,
    subtotal: `$${subtotal.toLocaleString('en-AU')}`,
  }
}

// ─── AU Services Advanced Pricing ───────────────────────────────

export interface AUQuoteParams {
  serviceId: string
  state: AustralianState
  bedrooms?: number
  bathrooms?: number
  sqm?: number
  condition?: 'basic' | 'standard' | 'deep'
  addons?: string[]
  frequency?: 'once' | 'weekly' | 'fortnightly' | 'monthly'
}

export interface PriceRange {
  min: number
  max: number
  avg: number
  gstIncluded: number
  subtotal: number
}

/**
 * Calculate AU service price with state multiplier
 */
export function calculateAUPrice(
  service: ServiceDefinition,
  state: AustralianState,
  params: {
    bedrooms?: number
    bathrooms?: number
    sqm?: number
    condition?: 'basic' | 'standard' | 'deep'
    addons?: string[]
    frequency?: 'once' | 'weekly' | 'fortnightly' | 'monthly'
  } = {}
): number {
  const stateMultiplier = service.states[state]?.multiplier ?? 1.0
  const conditionMultiplier = params.condition === 'deep' ? 1.5 : params.condition === 'basic' ? 0.9 : 1.0

  // Base price
  const basePrice = service.basePrice.min

  // Area and room factors
  const areaFactor = params.sqm ? (params.sqm / 100) * 0.3 : 0
  const roomFactor = (params.bedrooms ?? 0) * 0.1 + (params.bathrooms ?? 0) * 0.15

  // Addons
  const addonPrices: Record<string, number> = {
    oven_cleaning: 80,
    fridge_cleaning: 50,
    window_interior: 60,
    laundry: 40,
    stain_treatment: 35,
    deodorizing: 25,
    pet_hair_removal: 30,
    fly_screen_cleaning: 20,
    track_cleaning: 25,
    high_reach: 50,
    fabric_protection: 45,
    gutter_cleaning: 80,
    roof_washing: 100,
    deck_restoration: 120,
  }
  const addonsTotal = (params.addons ?? []).reduce(
    (sum, addon) => sum + (addonPrices[addon] ?? 0),
    0
  )

  // Frequency discount
  const frequencyDiscount = service.frequencyDiscounts?.[params.frequency ?? 'once'] ?? 0

  // Calculate
  let price =
    basePrice *
    stateMultiplier *
    (1 + areaFactor + roomFactor) *
    conditionMultiplier +
    addonsTotal

  price *= 1 - frequencyDiscount

  return Math.round(price)
}

/**
 * Monte Carlo Simulation for price range estimation
 * Runs 100 simulations with variance to provide realistic price ranges
 */
export function runMonteCarloSimulation(
  service: ServiceDefinition,
  state: AustralianState,
  params: AUQuoteParams
): PriceRange {
  const simulations = 100
  const results: number[] = []

  for (let i = 0; i < simulations; i++) {
    // Random variance ±15% to simulate real-world complexity
    const complexityVariance = (Math.random() - 0.5) * 0.3 // -15% to +15%

    const price = calculateAUPrice(service, state, {
      bedrooms: params.bedrooms,
      bathrooms: params.bathrooms,
      sqm: params.sqm,
      condition: params.condition,
      addons: params.addons,
      frequency: params.frequency,
    })

    results.push(Math.round(price * (1 + complexityVariance)))
  }

  const min = Math.min(...results)
  const max = Math.max(...results)
  const avg = Math.round(results.reduce((a, b) => a + b, 0) / simulations)
  const gstIncluded = Math.round(avg / 11)
  const subtotal = avg - gstIncluded

  return { min, max, avg, gstIncluded, subtotal }
}
