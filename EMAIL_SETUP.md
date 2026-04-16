# 📧 Email Notifications Setup Guide

> **Resend API + Supabase Edge Functions**

## 📋 Overview

SparkleClean Pro automatically sends email notifications when:
- ✅ A new quote is created (Quote Confirmation)
- ✅ A booking is confirmed (Booking Confirmation)
- ✅ A booking is cancelled (Cancellation Notice)
- ✅ A booking reminder (24 hours before service)

---

## 🚀 Quick Setup (15 minutes)

### Step 1: Create Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your domain (e.g., `sparkleclean.pro`)
4. Create an API key from [Dashboard > API Keys](https://resend.com/api-keys)

**Free Tier**: 3,000 emails/month, 100 emails/day

---

### Step 2: Set Supabase Secret

```bash
# Navigate to your Supabase project directory
cd sparkleclean-pro

# Login to Supabase CLI
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Set the Resend API key as a Supabase secret
supabase secrets set RESEND_API_KEY=re_your-api-key-here

# Verify the secret was set
supabase secrets list
```

---

### Step 3: Deploy Edge Function

```bash
# Deploy the notify-quote function
supabase functions deploy notify-quote

# Verify deployment
supabase functions list
```

Expected output:
```
FUNCTION       URL                                    STATUS
notify-quote   https://xxx.functions.supabase.co/notify-quote   active
```

---

### Step 4: Enable Database Webhook

Run the SQL migration in Supabase:

1. Go to [Supabase Dashboard > SQL Editor](https://supabase.com/dashboard/project/_/sql)
2. Copy contents of `supabase/email-webhook-setup.sql`
3. Replace `YOUR-PROJECT` with your Supabase project ID
4. Run the SQL

This creates:
- `pg_net` extension (for HTTP requests)
- `notify_quote_email()` trigger function
- Trigger on `quotes` table (AFTER INSERT)

---

### Step 5: Set Webhook URL

In Supabase SQL Editor:

```sql
-- Set the webhook URL (persistent across restarts)
ALTER SYSTEM SET app.notify_quote_webhook_url = 'https://YOUR-PROJECT.functions.supabase.co/notify-quote';

-- Reload config
SELECT pg_reload_conf();
```

---

### Step 6: Test Email Notification

#### Option A: Submit a Test Quote

1. Run your app locally: `pnpm dev`
2. Fill out the quote form
3. Submit the form
4. Check your inbox (or spam folder)

#### Option B: Direct API Test

```bash
# Test the Edge Function directly
curl -X POST https://YOUR-PROJECT.functions.supabase.co/notify-quote \
  -H "Authorization: Bearer YOUR-ANON-KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INSERT",
    "table": "quotes",
    "record": {
      "id": "test-quote-123",
      "customer_id": "test-customer-456",
      "property_type": "house",
      "bedrooms": 3,
      "bathrooms": 2,
      "area_sqm": 150,
      "selected_services": ["standard", "carpet"],
      "frequency": "weekly",
      "pets": false,
      "eco_friendly": true,
      "urgent": false,
      "subtotal_cents": 10000,
      "gst_cents": 1000,
      "total_cents": 11000,
      "status": "pending",
      "valid_until": "2026-04-23T00:00:00Z",
      "created_at": "2026-04-16T10:00:00Z"
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "email_id": "re_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

---

## 📊 Email Flow Architecture

```
User submits quote form
        ↓
Frontend calls submitQuoteRequest()
        ↓
Supabase INSERT into quotes table
        ↓
Database trigger fires (AFTER INSERT)
        ↓
pg_net sends HTTP POST to Edge Function
        ↓
Edge Function fetches customer details
        ↓
Edge Function calls Resend API
        ↓
Email sent to customer
        ↓
Audit log entry created
```

---

## 🎨 Email Templates

### Quote Confirmation Email

**Subject**: `Your SparkleClean Pro Quote — $150 AUD`

**Content**:
- Customer greeting
- Quote summary (property type, area, rooms, services)
- Pricing breakdown (subtotal, GST, total)
- Call-to-action button ("Book Your Clean Now →")
- Guarantees ($20M insured, satisfaction guarantee, eco-friendly)
- Footer with ABN, contact info, policy links

**Design**: HTML with gradient header, responsive layout, dark footer

---

## 📝 Environment Variables

### Frontend (`.env.local`)

```env
# Supabase Edge Functions URL
VITE_SUPABASE_FUNCTIONS_URL=https://YOUR-PROJECT.functions.supabase.co
```

### Supabase Secrets (set via CLI)

```bash
supabase secrets set RESEND_API_KEY=re_your-key
```

### Edge Function (via Supabase Dashboard)

Set in Supabase Dashboard > Project Settings > Edge Functions > Secrets:
- `RESEND_API_KEY` — Your Resend API key
- `SUPABASE_URL` — Auto-injected
- `SUPABASE_SERVICE_ROLE_KEY` — Auto-injected

---

## 🔍 Monitoring & Debugging

### Check Email Logs

```sql
-- View all email notifications sent
SELECT * FROM audit_log
WHERE action = 'QUOTE_EMAIL_SENT'
ORDER BY created_at DESC
LIMIT 20;
```

### Check Edge Function Logs

```bash
# View function logs
supabase functions logs notify-quote

# Or in Supabase Dashboard > Edge Functions > notify-quote > Logs
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Email not sent | RESEND_API_KEY not set | Run `supabase secrets set RESEND_API_KEY=re_xxx` |
| 502 error | Resend API key invalid | Verify key at resend.com/api-keys |
| 404 error | Function not deployed | Run `supabase functions deploy notify-quote` |
| Webhook fails | pg_net not enabled | Run `CREATE EXTENSION pg_net;` |
| Duplicate emails | Trigger created twice | Drop duplicate triggers: `DROP TRIGGER IF EXISTS` |

---

## 📈 Production Checklist

- [ ] Resend domain verified
- [ ] Supabase secret set (`RESEND_API_KEY`)
- [ ] Edge Function deployed
- [ ] Database trigger created
- [ ] Webhook URL configured
- [ ] Test email received
- [ ] Audit logs visible in Supabase
- [ ] Error monitoring enabled (Sentry optional)

---

## 🚀 Scaling

### High Volume (>3,000 emails/month)

Upgrade Resend plan:
- **Pro**: 50,000 emails/month — $20/month
- **Business**: 100,000 emails/month — $50/month

### Rate Limiting

Resend free tier limits:
- 100 emails/day
- 3,000 emails/month

If exceeded, emails will queue or fail gracefully (quote still saves to DB).

### Multiple Email Providers

To add fallback providers (SendGrid, AWS SES), modify the Edge Function:

```typescript
// Try Resend first, fallback to SendGrid
try {
  await sendViaResend(...)
} catch {
  await sendViaSendGrid(...)
}
```

---

## 📧 Additional Email Types

To add booking confirmations, cancellations, etc., create new Edge Functions:

```bash
# Create new function
supabase functions new notify-booking

# Deploy
supabase functions deploy notify-booking
```

Then create triggers on the `bookings` table similar to the quotes setup.

---

## 🔐 Security

- ✅ Edge Function runs server-side (no API key exposure)
- ✅ Supabase service role key (not anon key) used for DB access
- ✅ Resend API key stored as Supabase secret (not in code)
- ✅ Audit log tracks all email sends
- ✅ No customer data logged in plaintext (only IDs)

---

## 📚 Resources

- [Resend Docs](https://resend.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase pg_net](https://supabase.com/docs/guides/database/extensions/pg-net)
- [Supabase Secrets](https://supabase.com/docs/guides/functions/secrets)

---

Built with ❤️ using Resend + Supabase Edge Functions
