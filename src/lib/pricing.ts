import type { QuoteForm } from './schema'

// ─── Pricing Constants ─────────────────────────────────────────
export const SERVICE_BASE_COSTS: Record<string, number> = {
  standard: 80,
  deep: 150,
  carpet: 60,
  windows: 45,
  oven: 35,
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
