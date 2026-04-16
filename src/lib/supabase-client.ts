import { createClient } from '@supabase/supabase-js'
import type { QuoteForm } from '../lib/schema'

// ──────────────────────────────────────────────────────────────
// Supabase Client — Singleton
// ──────────────────────────────────────────────────────────────

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Quote persistence will be disabled. See .env.example for setup.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true, // Enable for admin auth
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

export interface QuoteRecord {
  id: string
  customer_id: string
  property_type: string
  bedrooms: number
  bathrooms: number
  area_sqm: number
  selected_services: string[]
  frequency: string
  pets: boolean
  eco_friendly: boolean
  urgent: boolean
  subtotal_cents: number
  gst_cents: number
  total_cents: number
  status: string
  valid_until: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface BookingRecord {
  id: string
  quote_id: string
  customer_id: string
  requested_date: string
  requested_time_slot: string
  status: string
  payment_status: string
  street_address: string | null
  suburb: string
  postcode: string
  state: string
  access_notes: string | null
  created_at: string
}

// ──────────────────────────────────────────────────────────────
// Quote Submission
// ──────────────────────────────────────────────────────────────

/**
 * Submit a quote request to Supabase.
 * Creates customer record (or finds existing), then creates quote.
 * All in a transaction using Supabase RPC or sequential inserts.
 */
export async function submitQuoteToSupabase(
  formData: QuoteForm,
  totalAmount: number
): Promise<{ success: boolean; quoteId?: string; customerId?: string; error?: string }> {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Client not configured — falling back to console.log')
    console.log('[DEV MODE] Quote submitted:', { formData, totalAmount, timestamp: new Date().toISOString() })
    return { success: true }
  }

  try {
    // Step 1: Upsert customer (find by email, or create)
    const { data: existingCustomer, error: findError } = await supabase
      .from('customers')
      .select('id')
      .eq('email', formData.email)
      .single()

    if (findError && findError.code !== 'PGRST116') { // PGRST116 = not found
      throw new Error(`Customer lookup failed: ${findError.message}`)
    }

    let customerId: string

    if (existingCustomer) {
      customerId = existingCustomer.id
      // Update customer info (name/phone may have changed)
      const { error: updateError } = await supabase
        .from('customers')
        .update({ full_name: formData.name, phone: formData.phone })
        .eq('id', customerId)

      if (updateError) {
        console.warn('[Supabase] Failed to update customer:', updateError.message)
        // Non-fatal: continue with quote creation
      }
    } else {
      // Create new customer
      const { data: newCustomer, error: insertError } = await supabase
        .from('customers')
        .insert({
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
        })
        .select('id')
        .single()

      if (insertError || !newCustomer) {
        throw new Error(`Customer creation failed: ${insertError?.message || 'no data returned'}`)
      }
      customerId = newCustomer.id
    }

    // Step 2: Create quote record
    // Convert dollars to cents for storage
    const totalCents = Math.round(totalAmount * 100)
    const gstCents = Math.round(totalCents / 11) // 1/11 of total is GST
    const subtotalCents = totalCents - gstCents

    const { data: newQuote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        customer_id: customerId,
        property_type: formData.propertyType,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        area_sqm: formData.area,
        selected_services: formData.services,
        frequency: formData.frequency,
        pets: formData.pets,
        eco_friendly: formData.ecoFriendly,
        urgent: formData.urgent,
        subtotal_cents: subtotalCents,
        gst_cents: gstCents,
        total_cents: totalCents,
        status: 'pending',
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })
      .select('id')
      .single()

    if (quoteError || !newQuote) {
      throw new Error(`Quote creation failed: ${quoteError?.message || 'no data returned'}`)
    }

    // Step 3: Log audit entry
    await supabase
      .from('audit_log')
      .insert({
        actor_type: 'user',
        actor_id: customerId,
        action: 'QUOTE_CREATED',
        resource_type: 'quote',
        resource_id: newQuote.id,
        details: {
          services: formData.services,
          frequency: formData.frequency,
          total_cents: totalCents,
          property_type: formData.propertyType,
        },
      })

    return { success: true, quoteId: newQuote.id, customerId }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Supabase] Quote submission failed:', error)
    return { success: false, error: message }
  }
}

// ──────────────────────────────────────────────────────────────
// Booking Creation (when customer accepts quote)
// ──────────────────────────────────────────────────────────────

export interface CreateBookingInput {
  quoteId: string
  customerId: string
  requestedDate: string // YYYY-MM-DD
  requestedTimeSlot: string
  suburb: string
  postcode: string
  streetAddress?: string
  accessNotes?: string
}

export async function createBooking(input: CreateBookingInput): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Client not configured')
    console.log('[DEV MODE] Booking created:', input)
    return { success: true }
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        quote_id: input.quoteId,
        customer_id: input.customerId,
        requested_date: input.requestedDate,
        requested_time_slot: input.requestedTimeSlot,
        suburb: input.suburb,
        postcode: input.postcode,
        street_address: input.streetAddress || null,
        access_notes: input.accessNotes || null,
        status: 'pending',
        payment_status: 'unpaid',
      })
      .select('id')
      .single()

    if (error || !data) {
      throw new Error(`Booking creation failed: ${error?.message || 'no data returned'}`)
    }

    // Update quote status
    await supabase
      .from('quotes')
      .update({ status: 'accepted' })
      .eq('id', input.quoteId)

    // Log audit
    await supabase
      .from('audit_log')
      .insert({
        actor_type: 'user',
        actor_id: input.customerId,
        action: 'BOOKING_CREATED',
        resource_type: 'booking',
        resource_id: data.id,
        details: {
          quote_id: input.quoteId,
          date: input.requestedDate,
          time_slot: input.requestedTimeSlot,
        },
      })

    return { success: true, bookingId: data.id }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Supabase] Booking creation failed:', error)
    return { success: false, error: message }
  }
}

// ──────────────────────────────────────────────────────────────
// Query Helpers (for admin dashboard)
// ──────────────────────────────────────────────────────────────

export async function getQuotesByCustomer(customerId: string): Promise<QuoteRecord[]> {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function getRecentQuotes(limit = 20): Promise<QuoteRecord[]> {
  const { data, error } = await supabase
    .from('quotes')
    .select(`
      *,
      customers (full_name, email, phone)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data || []
}

export async function getBookingStats() {
  const { data, error } = await supabase
    .from('bookings')
    .select('status, payment_status')

  if (error) throw new Error(error.message)

  const stats = {
    total: data?.length || 0,
    pending: data?.filter((b: { status: string }) => b.status === 'pending').length || 0,
    confirmed: data?.filter((b: { status: string }) => b.status === 'confirmed').length || 0,
    completed: data?.filter((b: { status: string }) => b.status === 'completed').length || 0,
    cancelled: data?.filter((b: { status: string }) => b.status === 'cancelled').length || 0,
    paid: data?.filter((b: { payment_status: string }) => b.payment_status === 'paid').length || 0,
    unpaid: data?.filter((b: { payment_status: string }) => b.payment_status === 'unpaid').length || 0,
  }

  return stats
}
