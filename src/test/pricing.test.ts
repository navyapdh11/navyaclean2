import { describe, it, expect } from 'vitest'
import { calculateQuote, formatPrice, SERVICE_BASE_COSTS, FREQUENCY_DISCOUNTS } from '../lib/pricing'
import { defaultValues, type QuoteForm } from '../lib/schema'

describe('calculateQuote', () => {
  it('calculates a basic quote with default values', () => {
    const quote = calculateQuote(defaultValues)
    expect(quote).toBeGreaterThan(0)
    expect(Number.isInteger(quote)).toBe(true)
  })

  it('calculates base cost as sum of selected services', () => {
    const formData: QuoteForm = {
      ...defaultValues,
      services: ['standard'],
      area: 0,
      bedrooms: 0,
      bathrooms: 0,
      frequency: 'one-time',
    }
    const quote = calculateQuote(formData)
    expect(quote).toBe(SERVICE_BASE_COSTS.standard)
  })

  it('adds area-based cost correctly', () => {
    const formData: QuoteForm = {
      ...defaultValues,
      services: [],
      area: 100,
      bedrooms: 0,
      bathrooms: 0,
      propertyType: 'house',
      frequency: 'one-time',
    }
    const quote = calculateQuote(formData)
    expect(quote).toBe(100 * 1.2) // area * house rate
  })

  it('adds room surcharges correctly', () => {
    const formData: QuoteForm = {
      ...defaultValues,
      services: [],
      area: 0,
      bedrooms: 2,
      bathrooms: 1,
      frequency: 'one-time',
    }
    const quote = calculateQuote(formData)
    expect(quote).toBe(2 * 15 + 1 * 20) // 2 bedrooms + 1 bathroom
  })

  it('applies weekly frequency discount (25%)', () => {
    const formDataOneTime: QuoteForm = {
      ...defaultValues,
      services: ['standard'],
      area: 100,
      bedrooms: 3,
      bathrooms: 2,
      propertyType: 'house',
      frequency: 'one-time',
    }
    const formDataWeekly: QuoteForm = { ...formDataOneTime, frequency: 'weekly' }

    const oneTimeQuote = calculateQuote(formDataOneTime)
    const weeklyQuote = calculateQuote(formDataWeekly)

    const expectedDiscount = Math.round(oneTimeQuote * (1 - (FREQUENCY_DISCOUNTS.weekly ?? 0)))
    expect(weeklyQuote).toBe(expectedDiscount)
  })

  it('applies pet surcharge as flat add-on before discount', () => {
    const withoutPets: QuoteForm = {
      ...defaultValues,
      services: ['standard'],
      area: 0,
      bedrooms: 0,
      bathrooms: 0,
      frequency: 'one-time',
      pets: false,
    }
    const withPets: QuoteForm = { ...withoutPets, pets: true }

    const quoteWithoutPets = calculateQuote(withoutPets)
    const quoteWithPets = calculateQuote(withPets)

    expect(quoteWithPets).toBe(quoteWithoutPets + 35)
  })

  it('applies eco multiplier after discount', () => {
    const base: QuoteForm = {
      ...defaultValues,
      services: ['standard'],
      area: 0,
      bedrooms: 0,
      bathrooms: 0,
      frequency: 'one-time',
    }

    const withoutEco = calculateQuote(base)
    const withEco = calculateQuote({ ...base, ecoFriendly: true })

    expect(withEco).toBe(Math.round(withoutEco * 1.15))
  })

  it('applies urgent multiplier last', () => {
    const base: QuoteForm = {
      ...defaultValues,
      services: ['standard'],
      area: 0,
      bedrooms: 0,
      bathrooms: 0,
      frequency: 'one-time',
    }

    const withoutUrgent = calculateQuote(base)
    const withUrgent = calculateQuote({ ...base, urgent: true })

    expect(withUrgent).toBe(Math.round(withoutUrgent * 1.5))
  })

  it('rounds to nearest integer', () => {
    const formData: QuoteForm = {
      ...defaultValues,
      services: ['standard'],
      area: 10,
      bedrooms: 0,
      bathrooms: 0,
      propertyType: 'apartment',
      frequency: 'weekly',
      ecoFriendly: true,
    }
    const quote = calculateQuote(formData)
    expect(Number.isInteger(quote)).toBe(true)
  })
})

describe('formatPrice', () => {
  it('formats price with GST breakdown (Australian 1/11 rule)', () => {
    const result = formatPrice(110)
    expect(result.total).toBe('$110')
    expect(result.gst).toBe('$10')
    expect(result.subtotal).toBe('$100')
  })

  it('handles zero price', () => {
    const result = formatPrice(0)
    expect(result.total).toBe('$0')
    expect(result.gst).toBe('$0')
    expect(result.subtotal).toBe('$0')
  })

  it('handles large prices', () => {
    const result = formatPrice(1100)
    expect(result.total).toBe('$1,100')
    expect(result.gst).toBe('$100')
  })
})
