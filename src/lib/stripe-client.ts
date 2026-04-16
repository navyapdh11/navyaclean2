// Stripe Payment Integration — Client-side
// Uses Supabase Edge Functions for PaymentIntent creation
import { loadStripe, type Stripe } from '@stripe/stripe-js'
import { supabase } from './supabase-client'

let stripePromise: Promise<Stripe | null>

export function getStripe() {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  if (!publishableKey) {
    console.warn('[Stripe] VITE_STRIPE_PUBLISHABLE_KEY not configured')
    return null
  }
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey)
  }
  return stripePromise
}

export interface PaymentIntent {
  id: string
  clientSecret: string
  amount: number
  currency: string
  status: string
}

export interface PaymentResult {
  success: boolean
  paymentIntentId?: string
  error?: string
}

/**
 * Create payment intent via Supabase Edge Function
 */
export async function createPaymentIntent(
  bookingId: string,
  amountCents: number,
  depositOnly = true
): Promise<PaymentIntent | null> {
  try {
    const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL
    if (!functionsUrl) {
      throw new Error('VITE_SUPABASE_FUNCTIONS_URL not configured')
    }

    const response = await fetch(`${functionsUrl}/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, amountCents, currency: 'aud', depositOnly }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('[Stripe] Failed to create payment intent:', error)
    return null
  }
}

/**
 * Process payment with Stripe Elements
 */
export async function processPayment(
  clientSecret: string,
  cardElement: any
): Promise<PaymentResult> {
  const stripe = await getStripe()
  if (!stripe) {
    return { success: false, error: 'Stripe not configured' }
  }

  try {
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: paymentIntent.status === 'succeeded',
      paymentIntentId: paymentIntent.id,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Payment failed',
    }
  }
}

/**
 * Validate a discount code via Supabase RPC
 */
export async function validateDiscount(
  code: string,
  totalCents: number,
  serviceSlugs?: string[]
): Promise<{ valid: boolean; discountAmountCents?: number; error?: string; description?: string } | null> {
  try {
    const { data, error } = await supabase.rpc('validate_discount', {
      p_code: code,
      p_total_cents: totalCents,
      p_service_slugs: serviceSlugs || [],
    })

    if (error) {
      console.error('[Discount] RPC error:', error.message)
      return null
    }

    return data
  } catch (err) {
    console.error('[Discount] Failed to validate:', err)
    return null
  }
}
