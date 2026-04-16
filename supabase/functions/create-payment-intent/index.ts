// Supabase Edge Function: create-payment-intent
// Creates a Stripe PaymentIntent for booking deposits
// Called from frontend when customer accepts a quote and books

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://sparkleclean.pro'

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
})

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CreatePaymentIntentRequest {
  bookingId: string
  amountCents: number
  currency?: string
  depositOnly?: boolean // true = charge 25% deposit, false = charge full amount
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }

  // Validate config
  if (!stripeSecretKey) {
    console.error('[create-payment-intent] STRIPE_SECRET_KEY not configured')
    return new Response(
      JSON.stringify({ error: 'Payment service not configured' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Parse request
    const body: CreatePaymentIntentRequest = await req.json()
    const { bookingId, amountCents, currency = 'aud', depositOnly = true } = body

    if (!bookingId || !amountCents) {
      return new Response(
        JSON.stringify({ error: 'bookingId and amountCents are required' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        quotes (total_cents, selected_services),
        customers (full_name, email)
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found', details: bookingError?.message }),
        { status: 404, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Check if already paid
    if (booking.payment_status === 'paid' || booking.payment_status === 'deposit_paid') {
      // Return existing payment intent if one exists
      if (booking.stripe_payment_intent_id) {
        const existingIntent = await stripe.paymentIntents.retrieve(booking.stripe_payment_intent_id)
        return new Response(
          JSON.stringify({
            id: existingIntent.id,
            clientSecret: existingIntent.client_secret,
            amount: existingIntent.amount,
            currency: existingIntent.currency,
            status: existingIntent.status,
          }),
          { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
      }
      return new Response(
        JSON.stringify({ error: 'Booking already paid' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate charge amount
    const chargeAmount = depositOnly
      ? Math.round(amountCents * 0.25) // 25% deposit
      : amountCents

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: chargeAmount,
      currency,
      metadata: {
        bookingId,
        customerId: booking.customer_id,
        quoteId: booking.quote_id,
        chargeType: depositOnly ? 'deposit' : 'full',
        services: booking.quotes.selected_services.join(','),
      },
      description: `${depositOnly ? 'Deposit' : 'Payment'} for cleaning service — ${booking.customers.full_name}`,
      receipt_email: booking.customers.email,
      automatic_payment_methods: { enabled: true },
    })

    // Update booking with payment intent ID
    await supabase
      .from('bookings')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', bookingId)

    // Log to audit
    await supabase.from('audit_log').insert({
      actor_type: 'system',
      actor_id: 'create-payment-intent',
      action: 'PAYMENT_INTENT_CREATED',
      resource_type: 'booking',
      resource_id: bookingId,
      details: {
        payment_intent_id: paymentIntent.id,
        amount: chargeAmount,
        currency,
        chargeType: depositOnly ? 'deposit' : 'full',
      },
    })

    console.log(`[create-payment-intent] Created ${paymentIntent.id} for booking ${bookingId}: ${chargeAmount} ${currency}`)

    return new Response(
      JSON.stringify({
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[create-payment-intent] Error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to create payment intent',
        message: (error as Error).message,
      }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }
})
