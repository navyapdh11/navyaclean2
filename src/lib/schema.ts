import { z } from 'zod'

// ─── Zod Schema ───────────────────────────────────────────────
export const quoteSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone must be at least 8 digits').max(20),
  propertyType: z.enum(['house', 'apartment', 'office', 'commercial']),
  bedrooms: z.number().min(0).max(10),
  bathrooms: z.number().min(0).max(10),
  area: z.number().min(10).max(5000),
  frequency: z.enum(['one-time', 'weekly', 'fortnightly', 'monthly']),
  services: z.array(z.enum(['standard', 'deep', 'carpet', 'windows', 'oven'])).min(1, 'Select at least one service'),
  pets: z.boolean().default(false),
  ecoFriendly: z.boolean().default(false),
  urgent: z.boolean().default(false),
})

export type QuoteForm = z.infer<typeof quoteSchema>

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
