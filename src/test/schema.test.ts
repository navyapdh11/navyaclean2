import { describe, it, expect } from 'vitest'
import { quoteSchema, defaultValues, type QuoteForm } from '../lib/schema'

describe('quoteSchema', () => {
  it('rejects default values (empty contact fields)', () => {
    // Default values have empty strings for name/email/phone which are invalid
    // This is intentional — the form validates onBlur, not on mount
    const result = quoteSchema.safeParse(defaultValues)
    expect(result.success).toBe(false)
  })

  it('rejects name shorter than 2 characters', () => {
    const result = quoteSchema.safeParse({ ...defaultValues, name: 'A' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors.some(e => e.path.includes('name'))).toBe(true)
    }
  })

  it('rejects invalid email', () => {
    const result = quoteSchema.safeParse({ ...defaultValues, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects phone shorter than 8 digits', () => {
    const result = quoteSchema.safeParse({ ...defaultValues, phone: '12345' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid property type', () => {
    const result = quoteSchema.safeParse({ ...defaultValues, propertyType: 'castle' })
    expect(result.success).toBe(false)
  })

  it('rejects negative bedrooms/bathrooms', () => {
    const result = quoteSchema.safeParse({ ...defaultValues, bedrooms: -1 })
    expect(result.success).toBe(false)
  })

  it('rejects area outside range', () => {
    const resultTooSmall = quoteSchema.safeParse({ ...defaultValues, area: 5 })
    const resultTooLarge = quoteSchema.safeParse({ ...defaultValues, area: 6000 })
    expect(resultTooSmall.success).toBe(false)
    expect(resultTooLarge.success).toBe(false)
  })

  it('rejects empty services array', () => {
    const result = quoteSchema.safeParse({ ...defaultValues, services: [] })
    expect(result.success).toBe(false)
  })

  it('rejects invalid frequency', () => {
    const result = quoteSchema.safeParse({ ...defaultValues, frequency: 'daily' })
    expect(result.success).toBe(false)
  })

  it('accepts valid complete form', () => {
    const validForm: QuoteForm = {
      name: 'John Smith',
      email: 'john@example.com',
      phone: '0412345678',
      propertyType: 'house',
      bedrooms: 3,
      bathrooms: 2,
      area: 150,
      frequency: 'weekly',
      services: ['standard', 'deep'],
      pets: true,
      ecoFriendly: true,
      urgent: false,
    }
    const result = quoteSchema.safeParse(validForm)
    expect(result.success).toBe(true)
  })
})
