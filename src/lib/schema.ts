import { z } from 'zod'

// ─── Zod Schema ───────────────────────────────────────────────
export const quoteSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .min(8, 'Phone must be at least 8 digits')
    .max(20)
    .refine(
      (val) => {
        // Accept Australian formats: +61, 04XX, landlines
        const auPhoneRegex = /^(\+61|0)[\d\s\-]{7,}$/
        return auPhoneRegex.test(val.replace(/\s/g, '')) || val.length >= 8
      },
      { message: 'Please enter a valid Australian phone number' }
    ),
  propertyType: z.enum(['house', 'apartment', 'office', 'commercial']),
  bedrooms: z.number().min(0).max(10),
  bathrooms: z.number().min(0).max(10),
  area: z.number().min(10).max(5000),
  frequency: z.enum(['one-time', 'weekly', 'fortnightly', 'monthly']),
  services: z.array(z.enum([
    'standard', 'deep', 'carpet', 'windows', 'oven',
    'domestic', 'endOfLease', 'moveInOut', 'laundry',
    'commercial', 'office', 'industrial', 'builders', 'retail', 'strata', 'school', 'medical',
    'window', 'upholstery', 'tile', 'pressure', 'disinfection',
  ])).min(1, 'Select at least one service'),
  pets: z.boolean().default(false),
  ecoFriendly: z.boolean().default(false),
  urgent: z.boolean().default(false),
})

export type QuoteForm = z.infer<typeof quoteSchema>

// ─── Booking Schema (AU-compliant) ─────────────────────────────
export const bookingSchema = z.object({
  serviceId: z.string().min(1, 'Service is required'),
  state: z.enum(['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']),
  city: z.string().min(2, 'City/suburb is required'),
  date: z.date().min(new Date(), 'Date must be in the future'),
  timeSlot: z.string().min(1, 'Time slot is required'),
  address: z.object({
    street: z.string().min(5, 'Street address is required'),
    suburb: z.string().min(2, 'Suburb is required'),
    state: z.string().length(3, 'State code must be 3 characters'),
    postcode: z.string().regex(/^\d{4}$/, 'Postcode must be 4 digits'),
    instructions: z.string().optional(),
  }),
  contact: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z
      .string()
      .min(8, 'Phone must be at least 8 digits')
      .refine(
        (val) => /^(\+61|0)[\d\s\-]{7,}$/.test(val.replace(/\s/g, '')),
        { message: 'Valid AU mobile required (e.g., 04XX XXX XXX or +61...)' }
      ),
  }),
  propertyDetails: z.object({
    bedrooms: z.number().min(0).max(10),
    bathrooms: z.number().min(1).max(5),
    sqm: z.number().min(10).max(5000).optional(),
    parking: z.boolean().default(false),
  }),
})

export type BookingForm = z.infer<typeof bookingSchema>

export const defaultValues: QuoteForm = {
  name: '',
  email: '',
  phone: '',
  propertyType: 'house',
  bedrooms: 3,
  bathrooms: 2,
  area: 150,
  frequency: 'weekly',
  services: ['standard'],
  pets: false,
  ecoFriendly: false,
  urgent: false,
}
