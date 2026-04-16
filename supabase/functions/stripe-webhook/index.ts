// Supabase Edge Function: stripe-webhook
// Handles Stripe webhook events (payment succeeded, failed, refunded)
// Configured in Stripe Dashboard -> Webhooks -> Add endpoint

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://sparkleclean.pro'
const resendApiKey = Deno.env.get('RESEND_API_KEY')

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
})

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

interface BookingWithRelations {
  id: string
  customer_id: string
  quote_id: string
  requested_date: string
  requested_time_slot: string
  suburb: string
  payment_status: string
  quotes: {
    total_cents: number
    selected_services: string[]
  }
  customers: {
    full_name: string
    email: string
    phone: string
  }
}

// Send booking confirmation email
async function sendBookingConfirmation(booking: BookingWithRelations, paymentIntentId: string) {
  if (!resendApiKey) {
    console.warn('[stripe-webhook] RESEND_API_KEY not configured, skipping email')
    return
  }

  const total = (booking.quotes.total_cents / 100).toFixed(2)
  const services = booking.quotes.selected_services
    .map((s) => s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()))
    .join(', ')

  const date = new Date(booking.requested_date).toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SparkleClean Pro <bookings@sparkleclean.pro>',
        to: [booking.customers.email],
        subject: `Booking Confirmed — ${date}`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Booking Confirmed</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #00f0ff;">Booking Confirmed!</h1>
  <p>Hi ${booking.customers.full_name},</p>
  <p>Your cleaning has been booked and confirmed. Here are the details:</p>
  <table style="width: 100%; border-collapse: collapse;">
    <tr><td style="padding: 8px 0; color: #666;">Date</td><td style="padding: 8px 0; font-weight: 600;">${date}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Time Slot</td><td style="padding: 8px 0; font-weight: 600;">${booking.requested_time_slot}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Suburb</td><td style="padding: 8px 0; font-weight: 600;">${booking.suburb}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Services</td><td style="padding: 8px 0; font-weight: 600;">${services}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Total</td><td style="padding: 8px 0; font-weight: 600;">$${total} AUD (incl. GST)</td></tr>
  </table>
  <p style="margin-top: 24px;">We'll assign a cleaner to your booking shortly. You'll receive another email with your cleaner's details.</p>
  <p><a href="${frontendUrl}/booking/${booking.id}" style="color: #00f0ff;">View your booking →</a></p>
</body>
</html>
`,
        tags: [
          { name: 'type', value: 'booking_confirmation' },
          { name: 'booking_id', value: booking.id },
        ],
      }),
    })
    console.log(`[stripe-webhook] Confirmation email sent to ${booking.customers.email}`)
  } catch (err) {
    console.error('[stripe-webhook] Failed to send confirmation email:', err)
  }
}

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  if (!stripeSecretKey || !webhookSecret) {
    console.error('[stripe-webhook] STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET not configured')
    return new Response('Webhook not configured', { status: 500 })
  }

  try {
    // Get raw body for signature verification
    const rawBody = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return new Response('No Stripe signature', { status: 400 })
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (err) {
      console.error('[stripe-webhook] Signature verification failed:', err)
      return new Response('Invalid signature', { status: 400 })
    }

    console.log(`[stripe-webhook] Received event: ${event.type}`)

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata.bookingId

        if (!bookingId) {
          console.error('[stripe-webhook] No bookingId in payment metadata')
          return new Response('OK', { status: 200 })
        }

        const chargeType = paymentIntent.metadata.chargeType || 'deposit'
        const paymentStatus = chargeType === 'full' ? 'paid' : 'deposit_paid'

        // Update booking via RPC function
        const { data: result, error } = await supabase.rpc('update_booking_payment', {
          p_booking_id: bookingId,
          p_payment_status: paymentStatus,
          p_stripe_payment_intent_id: paymentIntent.id,
          p_stripe_receipt_url: paymentIntent.latest_charge
            ? `https://dashboard.stripe.com/payments/${paymentIntent.id}`
            : null,
        })

        if (error) {
          console.error('[stripe-webhook] Failed to update booking:', error)
          return new Response('OK', { status: 200 }) // Still return 200 to Stripe
        }

        // Fetch booking details for email
        const { data: booking } = await supabase
          .from('bookings')
          .select(`
            *,
            quotes (total_cents, selected_services),
            customers (full_name, email, phone)
          `)
          .eq('id', bookingId)
          .single()

        if (booking) {
          await sendBookingConfirmation(booking as BookingWithRelations, paymentIntent.id)
        }

        console.log(`[stripe-webhook] Payment succeeded for booking ${bookingId}: ${paymentStatus}`)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata.bookingId

        if (!bookingId) {
          return new Response('OK', { status: 200 })
        }

        // Update booking to failed
        await supabase
          .from('bookings')
          .update({ payment_status: 'failed' })
          .eq('id', bookingId)

        // Fetch customer email
        const { data: booking } = await supabase
          .from('bookings')
          .select('*, customers (full_name, email)')
          .eq('id', bookingId)
          .single()

        // Send failure email
        if (booking && resendApiKey && booking.customers?.email) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'SparkleClean Pro <bookings@sparkleclean.pro>',
              to: [booking.customers.email],
              subject: 'Payment Failed — Action Required',
              html: `<p>Hi ${booking.customers.full_name},</p><p>Your payment for the cleaning service failed. Please try again or contact us.</p>`,
              tags: [{ name: 'type', value: 'payment_failed' }],
            }),
          })
        }

        console.log(`[stripe-webhook] Payment failed for booking ${bookingId}`)
        break
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata.bookingId

        if (!bookingId) {
          return new Response('OK', { status: 200 })
        }

        await supabase
          .from('bookings')
          .update({ payment_status: 'unpaid' })
          .eq('id', bookingId)

        console.log(`[stripe-webhook] Payment canceled for booking ${bookingId}`)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const bookingId = (charge.metadata as any)?.bookingId

        if (!bookingId) {
          return new Response('OK', { status: 200 })
        }

        await supabase
          .from('bookings')
          .update({ payment_status: 'refunded' })
          .eq('id', bookingId)

        console.log(`[stripe-webhook] Refund processed for booking ${bookingId}`)
        break
      }

      default:
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`)
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('[stripe-webhook] Unexpected error:', error)
    return new Response('Internal error', { status: 500 })
  }
})
