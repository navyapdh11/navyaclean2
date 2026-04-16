// Supabase Edge Function: notify-quote
// Deploys via: supabase functions deploy notify-quote
// Triggers on: INSERT into quotes table (via Database Webhook)
//
// Sends confirmation email to customer using Resend API.
// Setup: Set RESEND_API_KEY secret in Supabase project settings.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = 'SparkleClean Pro <quotes@sparkleclean.pro>'

interface QuotePayload {
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
  customer: {
    full_name: string
    email: string
    phone: string
  }
}

serve(async (req) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  // Parse payload
  let payload: QuotePayload
  try {
    payload = await req.json()
  } catch {
    return new Response('Invalid JSON payload', { status: 400 })
  }

  const { record, customer } = payload

  if (!customer?.email) {
    return new Response('Customer email required', { status: 400 })
  }

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured')
    return new Response('Email service not configured', { status: 500 })
  }

  // Format currency for display
  const totalDollars = (record.total_cents / 100).toFixed(2)
  const gstDollars = (record.gst_cents / 100).toFixed(2)
  const subtotalDollars = (record.subtotal_cents / 100).toFixed(2)

  // Service names for display
  const serviceNames = record.selected_services
    .map((s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
    .join(', ')

  // Build HTML email body
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your SparkleClean Pro Quote</title>
    </head>
    <body style="margin:0;padding:0;background-color:#0a0e17;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0e17;padding:40px 20px;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden;">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#00d4e6,#8b5cf6);padding:32px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:28px;">✨ Your SparkleClean Quote</h1>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:16px;">Thank you, ${customer.full_name}!</p>
                </td>
              </tr>

              <!-- Quote Total -->
              <tr>
                <td style="padding:32px;text-align:center;">
                  <div style="font-size:48px;font-weight:900;background:linear-gradient(135deg,#00d4e6,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
                    $${totalDollars}
                  </div>
                  <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:8px 0 0;">Total (GST inclusive)</p>
                </td>
              </tr>

              <!-- Details -->
              <tr>
                <td style="padding:0 32px 32px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(255,255,255,0.03);border-radius:12px;padding:20px;">
                    <tr>
                      <td style="color:rgba(255,255,255,0.6);font-size:14px;padding:8px 0;">Services:</td>
                      <td style="color:#ffffff;font-size:14px;text-align:right;font-weight:600;">${serviceNames}</td>
                    </tr>
                    <tr>
                      <td style="color:rgba(255,255,255,0.6);font-size:14px;padding:8px 0;">Property:</td>
                      <td style="color:#ffffff;font-size:14px;text-align:right;">${record.property_type} · ${record.bedrooms} bed · ${record.bathrooms} bath</td>
                    </tr>
                    <tr>
                      <td style="color:rgba(255,255,255,0.6);font-size:14px;padding:8px 0;">Area:</td>
                      <td style="color:#ffffff;font-size:14px;text-align:right;">${record.area_sqm} m²</td>
                    </tr>
                    <tr>
                      <td style="color:rgba(255,255,255,0.6);font-size:14px;padding:8px 0;">Frequency:</td>
                      <td style="color:#ffffff;font-size:14px;text-align:right;text-transform:capitalize;">${record.frequency.replace('-', ' ')}</td>
                    </tr>
                    ${record.eco_friendly ? '<tr><td style="color:rgba(255,255,255,0.6);font-size:14px;padding:8px 0;">Eco-Friendly:</td><td style="color:#00cc7d;font-size:14px;text-align:right;">✅ Yes (+15%)</td></tr>' : ''}
                    ${record.pets ? '<tr><td style="color:rgba(255,255,255,0.6);font-size:14px;padding:8px 0;">Pet Friendly:</td><td style="color:#ffffff;font-size:14px;text-align:right;">✅ Yes (+$35)</td></tr>' : ''}
                    ${record.urgent ? '<tr><td style="color:rgba(255,255,255,0.6);font-size:14px;padding:8px 0;">Urgent Service:</td><td style="color:#e6d400;font-size:14px;text-align:right;">⚡ Yes (x1.5)</td></tr>' : ''}
                    <tr>
                      <td style="color:rgba(255,255,255,0.6);font-size:14px;padding:8px 0;border-top:1px solid rgba(255,255,255,0.1);">Subtotal:</td>
                      <td style="color:#ffffff;font-size:14px;text-align:right;border-top:1px solid rgba(255,255,255,0.1);">$${subtotalDollars}</td>
                    </tr>
                    <tr>
                      <td style="color:rgba(255,255,255,0.6);font-size:14px;padding:8px 0;">GST (10%):</td>
                      <td style="color:#ffffff;font-size:14px;text-align:right;">$${gstDollars}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- CTA -->
              <tr>
                <td style="padding:0 32px 32px;text-align:center;">
                  <a href="https://sparkleclean.pro/booking/${record.id}"
                     style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#00d4e6,#8b5cf6);color:#ffffff;text-decoration:none;border-radius:12px;font-weight:600;font-size:16px;">
                    Book This Clean →
                  </a>
                </td>
              </tr>

              <!-- Validity -->
              <tr>
                <td style="padding:0 32px 32px;text-align:center;">
                  <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0;">
                    Quote valid until ${new Date(record.valid_until).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                    · Quote ID: ${record.id.slice(0, 8)}
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color:rgba(0,0,0,0.3);padding:24px 32px;text-align:center;">
                  <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0 0 8px;">
                    SparkleClean Pro · 123 Clean Street, Sydney NSW 2000
                  </p>
                  <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0;">
                    This email was sent because you requested a cleaning quote.
                    If this wasn't you, please ignore this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  // Send via Resend
  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [customer.email],
        subject: `✨ Your SparkleClean Quote — $${totalDollars}`,
        html: htmlBody,
        text: `Hi ${customer.full_name},\n\nYour SparkleClean Pro quote is ready!\n\nTotal: $${totalDollars} (GST inclusive)\nServices: ${serviceNames}\nProperty: ${record.property_type}, ${record.bedrooms} bed, ${record.bathrooms} bath\nArea: ${record.area_sqm} m²\nFrequency: ${record.frequency}\n\nBook now: https://sparkleclean.pro/booking/${record.id}\n\nQuote valid until ${new Date(record.valid_until).toLocaleDateString('en-AU')}.\n\nThanks,\nSparkleClean Pro Team`,
      }),
    })

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json()
      console.error('Resend API error:', errorData)
      return new Response(`Email send failed: ${resendResponse.status}`, { status: 502 })
    }

    console.log(`✅ Email sent to ${customer.email} for quote ${record.id}`)
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Email send error:', error)
    return new Response(`Failed to send email: ${error.message}`, { status: 500 })
  }
})
