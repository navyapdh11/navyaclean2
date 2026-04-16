# ✨ SparkleClean Pro

> Premium 3D Cleaning Quote Builder — Transparent Pricing, Instant Results

[![CI](https://github.com/navyapdh11/sparkleclean-pro/actions/workflows/ci.yml/badge.svg)](https://github.com/navyapdh11/sparkleclean-pro/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](tsconfig.json)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com)

Professional cleaning services quote builder for Sydney, Australia. Features a stunning 3D glassmorphism UI with real-time GST-inclusive pricing, Supabase backend persistence, and email notifications.

**Live Site**: [sparkleclean.pro](https://sparkleclean.pro)

---

## 🌟 Features

- **🧊 3D Quote Builder** — Interactive Three.js background with crystal/particle animations
- **💰 Real-Time Pricing** — Instant quote calculation with GST breakdown (Australian 1/11 rule)
- **🎨 Glassmorphism UI** — 2026 design system with neon accents, gradients, and blur effects
- **📧 Email Notifications** — Automated confirmation emails via Resend API + Supabase Edge Functions
- **🗄️ Database Persistence** — Supabase PostgreSQL with Row Level Security (RLS)
- **📱 PWA Support** — Installable, offline-capable with service worker
- **♿ Accessible** — WCAG 2.2 AA compliant with ARIA attributes, skip links, reduced motion support
- **🔒 Secure** — Content Security Policy, HSTS, input validation via Zod schemas
- **📊 SEO Optimized** — Schema.org JSON-LD, sitemap.xml, Open Graph, Twitter Cards
- **🌙 Dark/Light Theme** — Toggle with localStorage persistence
- **📐 Multi-Page** — React Router with Home, Services, About, Contact, Terms, Privacy pages
- **⚡ Performance** — Lazy-loaded Three.js (1.1MB deferred), chunk splitting, code optimization

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Vite 5 + React 18 + TypeScript |
| **Styling** | Tailwind CSS 3 (glassmorphism, neon theme) |
| **Animations** | Framer Motion 11 |
| **3D Graphics** | Three.js + React Three Fiber + Drei |
| **Routing** | React Router DOM v6 |
| **Forms** | React Hook Form + Zod validation |
| **Backend** | Supabase (PostgreSQL + Edge Functions) |
| **Email** | Resend API (via Supabase Edge Function) |
| **Testing** | Vitest + Testing Library |
| **Deployment** | Vercel (Sydney region) |
| **CI/CD** | GitHub Actions + Lighthouse CI |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 9.0.0
- **Supabase account** (for database + email features)

### Installation

```bash
# Clone the repository
git clone https://github.com/navyapdh11/sparkleclean-pro.git
cd sparkleclean-pro

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your Supabase credentials
```

### Development

```bash
# Start dev server (http://localhost:3000)
pnpm dev

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Type check
pnpm lint

# Build for production
pnpm build

# Preview production build
pnpm preview
```

---

## 📁 Project Structure

```
sparkleclean-pro/
├── src/
│   ├── App.tsx                    # Quote builder form (kept at /booking route)
│   ├── AppRouter.tsx              # Main router with all page routes
│   ├── main.tsx                   # Entry point with lazy 3D loading
│   ├── index.css                  # Global styles + glassmorphism components
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx         # Navigation + mobile menu
│   │   │   └── Footer.tsx         # Footer with links
│   │   ├── BookingConfirmation.tsx # Post-submission confirmation UI
│   │   ├── ErrorBoundary.tsx      # React error boundary
│   │   ├── FaqItem.tsx            # FAQ accordion
│   │   ├── Scene3D.tsx            # Three.js 3D background
│   │   ├── Scene3DLoader.tsx      # Lazy loader for 3D scene
│   │   ├── ServiceCard.tsx        # Service selection card
│   │   └── TrustBadge.tsx         # Trust badge component
│   ├── pages/
│   │   ├── HomePage.tsx           # Landing page
│   │   ├── ServicesPage.tsx       # Services showcase + pricing
│   │   ├── AboutPage.tsx          # About us + stats
│   │   ├── ContactPage.tsx        # Contact form + info
│   │   ├── TermsPage.tsx          # Terms of Service
│   │   ├── PrivacyPage.tsx        # Privacy Policy
│   │   └── CancellationPage.tsx   # Cancellation Policy
│   ├── hooks/
│   │   ├── useQuoteCalculator.ts  # Reactive quote calculation
│   │   └── useTheme.ts            # Dark/light theme toggle
│   └── lib/
│       ├── api.ts                 # Quote submission (Supabase → API → dev)
│       ├── constants.ts           # Services, FAQs, trust badges
│       ├── pricing.ts             # Quote calculation engine
│       ├── schema.ts              # Zod validation schema
│       └── supabase-client.ts     # Supabase client + CRUD operations
├── supabase/
│   ├── schema.sql                 # Database schema + RLS policies
│   └── functions/
│       └── notify-quote/index.ts  # Edge Function for email notifications
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service worker
│   └── sitemap.xml                # SEO sitemap
├── .github/workflows/ci.yml       # CI/CD pipeline
├── .env.example                   # Environment variable template
├── index.html                     # HTML entry with SEO + CSP
├── vercel.json                    # Vercel deployment config
├── vite.config.ts                 # Vite + chunk splitting config
└── package.json                   # Dependencies + scripts
```

---

## 🔐 Environment Variables

Create a `.env.local` file (gitignored) with:

```env
# Supabase (Required for database persistence)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# External API (Optional fallback)
# VITE_API_URL=https://api.sparkleclean.pro

# Feature flags (Optional)
# VITE_ENABLE_ANALYTICS=true
# VITE_ENABLE_SENTRY=true
# VITE_SENTRY_DSN=
```

Get your Supabase credentials from [Supabase Dashboard](https://supabase.com/dashboard) > Settings > API.

---

## 🗄️ Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com/dashboard)
2. **Run the schema**: Go to SQL Editor and paste the contents of `supabase/schema.sql`
3. **Set up Edge Function secret**:
   ```bash
   supabase secrets set RESEND_API_KEY=re_your-key
   ```
4. **Deploy Edge Function**:
   ```bash
   supabase functions deploy notify-quote
   ```
5. **Create Database Webhook**: In Supabase Dashboard > Database > Webhooks, create a webhook that triggers on `INSERT` into `quotes` table, pointing to your Edge Function URL.

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Watch mode (re-runs on file changes)
pnpm test:watch

# Coverage report
pnpm test:coverage
```

**Current test coverage**:
- Pricing engine: 13 tests (base costs, area rates, room surcharges, frequency discounts, add-ons, GST)
- Schema validation: 9 tests (all 13 fields with constraints)

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

The project is configured for the **Sydney region** (`syd1`) in `vercel.json`.

### Environment Variables in Vercel

Set these in your Vercel project settings:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Post-Deployment

1. Verify all routes work (`/`, `/services`, `/about`, `/booking`, etc.)
2. Test quote submission (should save to Supabase)
3. Check email notifications are received
4. Run Lighthouse audit (target: Performance ≥80, Accessibility ≥90)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add amazing feature"
   git commit -m "fix: resolve bug with amazing feature"
   git commit -m "docs: update README"
   ```
4. Push to your branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 📞 Contact

- **Email**: [contact@sparkleclean.pro](mailto:contact@sparkleclean.pro)
- **Phone**: +61 2 9000 0000
- **Address**: 123 Clean Street, Sydney NSW 2000

---

Built with ❤️ in Sydney, Australia 🇦🇺
