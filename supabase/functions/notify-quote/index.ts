// Supabase Edge Function: notify-quote
// Sends email notifications via Resend API when a new quote is created
// Triggered by webhook on INSERT into quotes table

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const BUSINESS = {
  name: 'SparkleClean Pro',
  email: 'contact@sparkleclean.pro',
  phone: '+61 2 9000 0000',
  address: '123 Clean Street, Sydney NSW 2000',
  abn: '12 345 678 901',
  website: 'https://sparkleclean.pro',
}

interface QuotePayload {
  type: 'INSERT'
  table: string
  record: {
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
    created_at: string
  }
}

// Email template for quote confirmation
function generateQuoteEmail(
  customerName: string,
  customerEmail: string,
  quote: QuotePayload['record']
): { subject: string; html: string; text: string } {
  const total = (quote.total_cents / 100).toFixed(2)
  const gst = (quote.gst_cents / 100).toFixed(2)
  const subtotal = (quote.subtotal_cents / 100).toFixed(2)
  const validUntil = new Date(quote.valid_until).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const servicesList = quote.selected_services
    .map((s) => `<li>${s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</li>`)
    .join('')

  const frequencyDiscount = getFrequencyDiscount(quote.frequency)

  return {
    subject: `Your SparkleClean Pro Quote — $${total} AUD`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your SparkleClean Pro Quote</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #00f0ff 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✨ SparkleClean Pro</h1>
        <p style="color: #ffffff; margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Premium Cleaning Services — Sydney, Australia</p>
      </td>
    </tr>

    <!-- Greeting -->
    <tr>
      <td style="padding: 40px 30px 20px 30px;">
        <h2 style="color: #1a1a1a; margin: 0 0 12px 0; font-size: 24px;">Hi ${customerName},</h2>
        <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Thank you for choosing SparkleClean Pro! Your personalized cleaning quote is ready.
        </p>
      </td>
    </tr>

    <!-- Quote Summary -->
    <tr>
      <td style="padding: 0 30px 30px 30px;">
        <div style="background-color: #f8f9fa; border-radius: 12px; padding: 24px; border: 2px solid #00f0ff33;">
          <h3 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 18px;">📋 Quote Summary</h3>
          
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
            <tr>
              <td style="color: #666666; padding: 8px 0;">Property Type</td>
              <td style="color: #1a1a1a; font-weight: 600; text-align: right; padding: 8px 0;">${quote.property_type}</td>
            </tr>
            <tr>
              <td style="color: #666666; padding: 8px 0; border-top: 1px solid #e5e5e5;">Area</td>
              <td style="color: #1a1a1a; text-align: right; padding: 8px 0; border-top: 1px solid #e5e5e5;">${quote.area_sqm} m²</td>
            </tr>
            <tr>
              <td style="color: #666666; padding: 8px 0; border-top: 1px solid #e5e5e5;">Bedrooms / Bathrooms</td>
              <td style="color: #1a1a1a; text-align: right; padding: 8px 0; border-top: 1px solid #e5e5e5;">${quote.bedrooms} bed / ${quote.bathrooms} bath</td>
            </tr>
            <tr>
              <td style="color: #666666; padding: 8px 0; border-top: 1px solid #e5e5e5;">Frequency</td>
              <td style="color: #1a1a1a; text-align: right; padding: 8px 0; border-top: 1px solid #e5e5e5;">${quote.frequency} ${frequencyDiscount ? `(${frequencyDiscount} OFF)` : ''}</td>
            </tr>
            <tr>
              <td style="color: #666666; padding: 8px 0; border-top: 1px solid #e5e5e5;">Services</td>
              <td style="color: #1a1a1a; text-align: right; padding: 8px 0; border-top: 1px solid #e5e5e5;">
                <ul style="margin: 0; padding: 0; list-style: none;">${servicesList}</ul>
              </td>
            </tr>
            ${quote.pets ? `<tr><td style="color: #666666; padding: 8px 0; border-top: 1px solid #e5e5e5;">Pet-Friendly Products</td><td style="color: #1a1a1a; text-align: right; padding: 8px 0; border-top: 1px solid #e5e5e5;">🐾 Yes</td></tr>` : ''}
            ${quote.eco_friendly ? `<tr><td style="color: #666666; padding: 8px 0; border-top: 1px solid #e5e5e5;">Eco-Friendly Cleaning</td><td style="color: #1a1a1a; text-align: right; padding: 8px 0; border-top: 1px solid #e5e5e5;">🌿 Yes</td></tr>` : ''}
            ${quote.urgent ? `<tr><td style="color: #666666; padding: 8px 0; border-top: 1px solid #e5e5e5;">Urgent Service</td><td style="color: #1a1a1a; text-align: right; padding: 8px 0; border-top: 1px solid #e5e5e5;">⚡ Yes</td></tr>` : ''}
          </table>
        </div>
      </td>
    </tr>

    <!-- Pricing -->
    <tr>
      <td style="padding: 0 30px 30px 30px;">
        <div style="background: linear-gradient(135deg, #00f0ff11 0%, #8b5cf611 100%); border-radius: 12px; padding: 24px; border: 1px solid #00f0ff44;">
          <h3 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 18px;">💰 Pricing</h3>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
            <tr>
              <td style="color: #666666; padding: 6px 0;">Subtotal</td>
              <td style="color: #1a1a1a; text-align: right; padding: 6px 0;">$${subtotal} AUD</td>
            </tr>
            <tr>
              <td style="color: #666666; padding: 6px 0; border-top: 1px solid #e5e5e5;">GST (10%)</td>
              <td style="color: #666666; text-align: right; padding: 6px 0; border-top: 1px solid #e5e5e5;">$${gst} AUD</td>
            </tr>
            <tr>
              <td style="color: #1a1a1a; font-weight: 700; font-size: 18px; padding: 12px 0 0 0; border-top: 2px solid #00f0ff;">Total (incl. GST)</td>
              <td style="color: #00f0ff; font-weight: 700; font-size: 24px; text-align: right; padding: 12px 0 0 0; border-top: 2px solid #00f0ff;">$${total} AUD</td>
            </tr>
          </table>
        </div>
      </td>
    </tr>

    <!-- CTA Button -->
    <tr>
      <td style="padding: 0 30px 30px 30px; text-align: center;">
        <a href="${BUSINESS.website}/booking/${quote.id}" 
           style="display: inline-block; background: linear-gradient(135deg, #00f0ff 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
          Book Your Clean Now →
        </a>
        <p style="color: #999999; font-size: 12px; margin: 16px 0 0 0;">
          Quote valid until ${validUntil}
        </p>
      </td>
    </tr>

    <!-- Guarantees -->
    <tr>
      <td style="padding: 0 30px 30px 30px;">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
          <div style="text-align: center;">
            <div style="font-size: 24px; margin-bottom: 8px;">🛡️</div>
            <p style="color: #666666; font-size: 12px; margin: 0;">$20M Insured</p>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 24px; margin-bottom: 8px;">✅</div>
            <p style="color: #666666; font-size: 12px; margin: 0;">Satisfaction Guarantee</p>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 24px; margin-bottom: 8px;">🌿</div>
            <p style="color: #666666; font-size: 12px; margin: 0;">Eco-Friendly Products</p>
          </div>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #1a1a1a; padding: 30px; text-align: center;">
        <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">${BUSINESS.name}</p>
        <p style="color: #999999; font-size: 12px; margin: 0 0 4px 0;">ABN: ${BUSINESS.abn}</p>
        <p style="color: #999999; font-size: 12px; margin: 0 0 4px 0;">${BUSINESS.address}</p>
        <p style="color: #999999; font-size: 12px; margin: 0 0 4px 0;">📞 ${BUSINESS.phone} | ✉️ ${BUSINESS.email}</p>
        <p style="color: #666666; font-size: 11px; margin: 16px 0 0 0;">
          This quote is valid for 7 days from issue. All prices include 10% GST.
          Terms and conditions apply.
        </p>
        <p style="color: #666666; font-size: 11px; margin: 8px 0 0 0;">
          <a href="${BUSINESS.website}/privacy" style="color: #999999; text-decoration: none;">Privacy Policy</a> | 
          <a href="${BUSINESS.website}/terms" style="color: #999999; text-decoration: none;">Terms of Service</a> | 
          <a href="${BUSINESS.website}/cancellation" style="color: #999999; text-decoration: none;">Cancellation Policy</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`,
    text: `
SparkleClean Pro — Your Quote is Ready
=====================================

Hi ${customerName},

Thank you for choosing SparkleClean Pro! Your personalized cleaning quote is ready.

QUOTE SUMMARY
-------------
Property Type: ${quote.property_type}
Area: ${quote.area_sqm} m²
Bedrooms: ${quote.bedrooms}
Bathrooms: ${quote.bathrooms}
Frequency: ${quote.frequency} ${frequencyDiscount ? `(${frequencyDiscount} OFF)` : ''}
Services: ${quote.selected_services.join(', ')}
${quote.pets ? 'Pet-Friendly Products: Yes' : ''}
${quote.eco_friendly ? 'Eco-Friendly Cleaning: Yes' : ''}
${quote.urgent ? 'Urgent Service: Yes' : ''}

PRICING
-------
Subtotal: $${subtotal} AUD
GST (10%): $${gst} AUD
Total (incl. GST): $${total} AUD

Quote valid until: ${validUntil}

Book your clean now: ${BUSINESS.website}/booking/${quote.id}

---
${BUSINESS.name}
ABN: ${BUSINESS.abn}
${BUSINESS.address}
📞 ${BUSINESS.phone} | ✉️ ${BUSINESS.email}

This quote is valid for 7 days from issue. All prices include 10% GST.
Terms and conditions apply.

Privacy Policy: ${BUSINESS.website}/privacy
Terms of Service: ${BUSINESS.website}/terms
`,
  }
}

function getFrequencyDiscount(frequency: string): string {
  const discounts: Record<string, string> = {
    'weekly': '15%',
    'fortnightly': '10%',
    'monthly': '5%',
  }
  return discounts[frequency] || ''
}

// Main handler
serve(async (req: Request) => {
  try {
    // Verify request method
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Check for Resend API key
    if (!RESEND_API_KEY) {
      console.error('[notify-quote] RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Parse webhook payload
    const payload: QuotePayload = await req.json()
    const quote = payload.record

    console.log(`[notify-quote] Processing quote: ${quote.id} for customer: ${quote.customer_id}`)

    // Fetch customer details
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('full_name, email, phone')
      .eq('id', quote.customer_id)
      .single()

    if (customerError || !customer) {
      console.error(`[notify-quote] Customer lookup failed: ${customerError?.message}`)
      return new Response(
        JSON.stringify({ error: 'Customer not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Generate email content
    const { subject, html, text } = generateQuoteEmail(customer.full_name, customer.email, quote)

    // Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SparkleClean Pro <noreply@sparkleclean.pro>',
        to: [customer.email],
        subject,
        html,
        text,
        reply_to: BUSINESS.email,
        tags: [
          { name: 'type', value: 'quote' },
          { name: 'quote_id', value: quote.id },
          { name: 'customer_id', value: quote.customer_id },
        ],
      }),
    })

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json()
      console.error(`[notify-quote] Resend API error: ${JSON.stringify(errorData)}`)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: errorData }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const resendResult = await resendResponse.json()
    console.log(`[notify-quote] Email sent successfully: ${resendResult.id}`)

    // Log the email in audit_log
    await supabase.from('audit_log').insert({
      actor_type: 'system',
      actor_id: 'notify-quote-function',
      action: 'QUOTE_EMAIL_SENT',
      resource_type: 'quote',
      resource_id: quote.id,
      details: {
        customer_id: quote.customer_id,
        email: customer.email,
        resend_id: resendResult.id,
        total_cents: quote.total_cents,
      },
    })

    return new Response(
      JSON.stringify({ success: true, email_id: resendResult.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[notify-quote] Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
