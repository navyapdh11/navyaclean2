# Backend Setup & Deployment Guide

## Overview

SparkleClean Pro uses **Supabase** as its backend:
- PostgreSQL database with Row Level Security (RLS)
- Edge Functions (Deno) for payments, email, and admin
- Supabase Auth for admin login

No separate API server needed.

---

## 1. Database Setup

### Option A: Run migrations via Supabase CLI (recommended)

```bash
# Install Supabase CLI
brew install supabase/tap/supabase  # macOS
# or: curl -fsSL https://cli.supabase.com/install.sh | sh

# Login
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Option B: Run SQL manually in Supabase SQL Editor

1. Go to Supabase Dashboard > SQL Editor
2. Run `supabase/migrations/001_initial_schema.sql`
3. Run `supabase/migrations/002_payment_and_admin_functions.sql`

---

## 2. Deploy Edge Functions

### Required secrets

Set these in Supabase Dashboard > Project Settings > Edge Functions > Secrets:

```bash
# All functions need these:
supabase secrets set \
  SUPABASE_URL=https://your-project.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# create-payment-intent + stripe-webhook:
supabase secrets set \
  STRIPE_SECRET_KEY=sk_live_... \
  STRIPE_WEBHOOK_SECRET=whsec_... \
  FRONTEND_URL=https://sparkleclean.pro

# notify-quote + stripe-webhook:
supabase secrets set \
  RESEND_API_KEY=re_...

# admin-auth:
supabase secrets set \
  ADMIN_LOGIN_PIN=123456
```

### Deploy all functions

```bash
# Deploy notify-quote (existing)
supabase functions deploy notify-quote

# Deploy new functions
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook
supabase functions deploy admin-auth
supabase functions deploy admin-crud
```

---

## 3. Stripe Webhook Configuration

### Create webhook in Stripe Dashboard

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
4. Copy the webhook secret (`whsec_...`)
5. Set as `STRIPE_WEBHOOK_SECRET` in Supabase secrets

### Test webhook locally

```bash
# Use Stripe CLI to forward webhooks
stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook

# Trigger test event
stripe trigger payment_intent.succeeded
```

---

## 4. Supabase Auth Setup (for admin login)

### Enable email/password auth

1. Supabase Dashboard > Authentication > Providers
2. Enable "Email" provider
3. Disable "Confirm email" (optional — for faster admin setup)
4. Set site URL: `https://sparkleclean.pro`
5. Add redirect URLs:
   - `https://sparkleclean.pro/admin/dashboard`
   - `http://localhost:5173/admin/dashboard` (dev)

### Create admin user

1. Go to Authentication > Users > Add user
2. Create with email `admin@sparkleclean.pro`
3. Set a strong password
4. Add a record to the `staff` table:

```sql
INSERT INTO staff (full_name, email, role, department, is_active)
VALUES ('Admin User', 'admin@sparkleclean.pro', 'admin', 'Management', true);
```

### Enable second-factor PIN (optional)

Set `ADMIN_LOGIN_PIN` secret to a 6-digit number. Users can optionally enter it during login.

---

## 5. Frontend Environment Variables

Create `.env.local` in the project root:

```env
VITE_SITE_URL=https://sparkleclean.pro
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_FUNCTIONS_URL=https://your-project.supabase.co/functions/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Deploy to Vercel

Set these environment variables in Vercel project settings:
- `VITE_SITE_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_FUNCTIONS_URL`
- `VITE_STRIPE_PUBLISHABLE_KEY`

Then deploy:

```bash
vercel --prod
```

---

## 6. Verify Everything Works

### Test quote submission

1. Visit the homepage
2. Fill out the quote builder
3. Submit a quote
4. Check Supabase > Table Editor > `quotes` — new record should appear
5. Check email — quote confirmation should arrive

### Test admin login

1. Visit `/admin/login`
2. Enter admin email + password
3. Should redirect to `/admin/dashboard`
4. Check that stats are real numbers (not mock data)

### Test payment (test mode)

1. Use Stripe test card: `4242 4242 4242 4242`
2. Book a cleaning service
3. Complete payment
4. Check:
   - Booking status updates to `confirmed`
   - `payment_status` = `deposit_paid`
   - Confirmation email arrives
   - Stripe Dashboard shows the PaymentIntent

### Test webhook

```bash
# Trigger via Stripe CLI
stripe trigger payment_intent.succeeded

# Check Supabase logs
supabase functions log stripe-webhook
```

---

## 7. Monitoring

### Supabase logs

```bash
# View Edge Function logs
supabase functions log notify-quote
supabase functions log create-payment-intent
supabase functions log stripe-webhook
supabase functions log admin-auth
supabase functions log admin-crud
```

### Audit trail

All admin actions are logged to the `audit_logs` table. View in Supabase Dashboard or via admin dashboard > Audit page.

### Rate limiting

Admin login has built-in rate limiting (5 attempts, 15-min lockout). Logs show blocked attempts in `audit_logs`.

---

## Architecture Diagram

```
Frontend (Vite + React)
  │
  ├── Supabase Client (anon key)
  │     ├── INSERT → quotes, bookings, customers, audit_log  (RLS: anon insert)
  │     ├── SELECT → services_config, suburbs, discounts, ads  (RLS: public read)
  │     └── RPC → validate_discount, get_admin_dashboard_stats, get_recent_bookings
  │
  ├── Stripe.js (client-side)
  │     └── confirmCardPayment() → Stripe
  │
  └── Edge Function calls
        ├── /create-payment-intent → creates Stripe PaymentIntent
        ├── /admin-auth → login, session validation
        └── /admin-crud → CRUD for staff, pricing, discounts, photos, ads

Stripe Webhook
  └── POST → /stripe-webhook → updates booking payment_status

Database Triggers
  └── INSERT on quotes → notify-quote Edge Function → Resend email
```

---

## Security Notes

1. **Never commit `.env.local`** — it contains API keys
2. **RLS policies** prevent unauthorized data access
3. **Admin tables** require authentication for write access
4. **Webhook signature verification** prevents spoofed Stripe events
5. **Rate limiting** on admin login prevents brute-force attacks
6. **Audit logging** tracks all admin actions
