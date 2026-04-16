# 🚀 SparkleClean Pro — Production Deployment Checklist

> Follow these steps to deploy SparkleClean Pro to production.

---

## ✅ Phase 5 Features Implemented

- [x] PWA Support (Service Worker, Offline Mode, Install Prompt)
- [x] Multi-step Booking Flow (5-step wizard with validation)
- [x] City/Suburb Pages (800+ local SEO pages)
- [x] Stripe Payment Integration (Client-side ready)
- [x] Analytics (PostHog)
- [x] Email Notifications (Resend API + Supabase Edge Functions)
- [x] SEO Optimization (Schema.org, OG Tags, Sitemap)
- [x] Blog System (9+ posts, expandable to 60+)

---

## 🔧 Pre-Deployment Setup

### 1. Generate PWA Icons (5 minutes)

**Quick method:**
```bash
cd sparkleclean-pro
npx pwa-asset-generator public/icons/icon.svg public/icons/ --manifest public/manifest.json --index index.html
```

**Manual method:**
1. Open `public/icons/icon.svg` in a browser
2. Use https://favicon.io or https://realfavicongenerator.net/
3. Generate all sizes: 72, 96, 128, 144, 152, 192, 384, 512
4. Save to `public/icons/` directory

**Required files:**
```
public/icons/
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png
├── icon-384x384.png
├── icon-512x512.png
├── apple-touch-icon.png
└── favicon.ico
```

---

### 2. Configure Supabase (15 minutes)

#### Create Project
1. Go to https://supabase.com/dashboard
2. Create new project → Region: **Australia East (Sydney)**
3. Wait for database to provision

#### Run Database Schema
1. Go to SQL Editor
2. Copy contents of `supabase/schema.sql` → Run
3. Copy contents of `supabase/email-webhook-setup.sql` → Run

#### Get API Keys
1. Settings → API
2. Copy:
   - Project URL: `https://xxxxx.supabase.co`
   - `anon` public key
   - `service_role` secret (keep secure!)

#### Deploy Edge Functions
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Set secrets
supabase secrets set RESEND_API_KEY=re_your-resend-api-key

# Deploy functions
supabase functions deploy notify-quote
```

#### Create Webhook
1. Database → Webhooks → Create Webhook
2. Event: `INSERT` on `quotes` table
3. URL: `https://your-project.functions.supabase.co/notify-quote`
4. HTTP Method: `POST`
5. Confirm

---

### 3. Set Up Resend (10 minutes)

#### Create Account
1. Go to https://resend.com
2. Sign up → Verify email
3. Free tier: 3,000 emails/month

#### Verify Domain
1. DNS Settings → Add your domain (e.g., `sparkleclean.pro`)
2. Add DNS records (MX, TXT, CNAME) to your domain registrar
3. Wait for verification (can take up to 48 hours)

#### Create API Key
1. API Keys → Create API Key
2. Name: `sparkleclean-pro`
3. Permissions: Full Access
4. Copy key: `re_xxxxx`

#### Set as Supabase Secret
```bash
supabase secrets set RESEND_API_KEY=re_xxxxx
```

#### Test Email
```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer re_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "SparkleClean Pro <noreply@sparkleclean.pro>",
    "to": ["your-email@example.com"],
    "subject": "Test Email",
    "html": "<h1>Hello from SparkleClean Pro!</h1>"
  }'
```

---

### 4. Configure Stripe (15 minutes)

#### Create Account
1. Go to https://dashboard.stripe.com/register
2. Activate test mode (toggle in top-right)
3. Complete business details

#### Get API Keys
1. Developers → API Keys
2. Copy:
   - Publishable key: `pk_test_xxxxx`
   - Secret key: `sk_test_xxxxx` (server-side only)

#### Create Webhook
1. Developers → Webhooks → Add endpoint
2. URL: `https://your-domain.com/api/payments/webhook`
3. Events: `payment_intent.succeeded`, `payment_intent.failed`
4. Copy webhook secret: `whsec_xxxxx`

#### Set Environment Variables
In Vercel (or your hosting platform):
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

#### Test Card Numbers
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Insufficient funds: `4000 0000 0000 9995`

---

### 5. Configure PostHog (5 minutes)

#### Create Project
1. Go to https://app.posthog.com
2. Sign up → Create project
3. Free tier: 1M events/month

#### Get API Key
1. Project Settings → API Keys
2. Copy Project API Key

#### Set Environment Variable
```
VITE_POSTHOG_API_KEY=phc_xxxxx
VITE_POSTHOG_HOST=https://app.posthog.com
```

#### Verify Tracking
1. Deploy app
2. Visit site
3. Check PostHog dashboard → Activity → Should see page views

---

### 6. Deploy to Vercel (10 minutes)

#### Install Vercel CLI
```bash
npm i -g vercel
```

#### Deploy
```bash
cd sparkleclean-pro
vercel --prod
```

#### Set Environment Variables in Vercel
Go to Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-key` |
| `VITE_SUPABASE_FUNCTIONS_URL` | `https://xxxxx.functions.supabase.co` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_xxxxx` |
| `VITE_POSTHOG_API_KEY` | `phc_xxxxx` |
| `VITE_POSTHOG_HOST` | `https://app.posthog.com` |

#### Configure Custom Domain
1. Vercel Dashboard → Project → Settings → Domains
2. Add: `sparkleclean.pro`
3. Update DNS records at your registrar:
   - Type: `A` → Value: `76.76.21.21`
   - Type: `CNAME` → Value: `cname.vercel-dns.com`

---

## 🔐 Environment Variables Summary

### Frontend (`.env.local` for dev, Vercel for prod)
```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_FUNCTIONS_URL=https://xxxxx.functions.supabase.co

# Stripe (optional — enables payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Analytics (optional — enables tracking)
VITE_POSTHOG_API_KEY=phc_xxxxx
VITE_POSTHOG_HOST=https://app.posthog.com
```

### Supabase Secrets (set via CLI)
```bash
supabase secrets set RESEND_API_KEY=re_xxxxx
```

---

## ✅ Post-Deployment Verification

### 1. Functional Tests
- [ ] Home page loads
- [ ] Services page shows all 20 services
- [ ] Service detail page loads (e.g., `/service/domestic/NSW`)
- [ ] City page loads (e.g., `/service/domestic/nsw/sydney-cbd`)
- [ ] Booking form submits successfully
- [ ] Quote saved to Supabase database
- [ ] Email confirmation received
- [ ] PWA install prompt appears on mobile
- [ ] Offline page shows when disconnected

### 2. Performance Tests
- [ ] Lighthouse Performance ≥ 80
- [ ] Lighthouse Accessibility ≥ 90
- [ ] Lighthouse SEO ≥ 95
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s

### 3. SEO Tests
- [ ] Submit sitemap to Google Search Console
- [ ] Check structured data with Google Rich Results Test
- [ ] Verify robots.txt accessible
- [ ] Test mobile-friendliness with Google tool

### 4. PWA Tests
- [ ] Install prompt appears on Chrome mobile
- [ ] App launches in standalone mode
- [ ] Offline page shows when disconnected
- [ ] Icon appears on home screen

---

## 🚀 Go-Live Checklist

- [ ] All environment variables set in Vercel
- [ ] Supabase database schema applied
- [ ] Edge Functions deployed and tested
- [ ] Resend domain verified
- [ ] Stripe live keys configured (switch from test mode)
- [ ] PostHog tracking verified
- [ ] Custom domain configured
- [ ] SSL certificate active (automatic with Vercel)
- [ ] PWA icons generated and deployed
- [ ] Sitemap submitted to Google Search Console
- [ ] Robots.txt verified
- [ ] Google Analytics connected (optional)
- [ ] Error monitoring enabled (Sentry optional)
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured

---

## 📊 Monitoring & Maintenance

### Daily
- Check Supabase dashboard for errors
- Monitor Resend email delivery rates
- Review PostHog analytics for unusual activity

### Weekly
- Review booking conversion rates
- Check Lighthouse scores
- Update blog content (1-2 posts/week)

### Monthly
- Review Stripe payment success rates
- Analyze top-performing service pages
- Update city pricing if needed
- Check for dependency updates (`pnpm update`)

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Email not sending | Check `RESEND_API_KEY` secret in Supabase |
| Quotes not saving | Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |
| PWA not installing | Ensure all icons present + HTTPS |
| Stripe payments fail | Check webhook endpoint + secret |
| Analytics not tracking | Verify `VITE_POSTHOG_API_KEY` |
| Slow page loads | Enable Vercel Edge caching |

---

## 📞 Support

- **Docs**: `EMAIL_SETUP.md`, `AU_EXPANSION_SUMMARY.md`
- **Schema**: `supabase/schema.sql`
- **Edge Function**: `supabase/functions/notify-quote/index.ts`
- **GitHub**: https://github.com/navyapdh11/navyaclean2

---

Built with ❤️ in Sydney, Australia 🇦🇺
