// Stripe Payment Integration — Client-side
import { loadStripe, type Stripe } from '@stripe/stripe-js'

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
  amountCents: number
): Promise<PaymentIntent | null> {
  try {
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, amountCents, currency: 'aud' }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
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
