# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Supabase database schema with Row Level Security policies (`supabase/schema.sql`)
  - Tables: `customers`, `quotes`, `bookings`, `cleaners`, `services_config`, `suburbs`, `audit_log`
  - Enums for property types, frequencies, service types, statuses
  - Auto-updating `updated_at` triggers on all tables
  - Seeded data for services and Sydney suburbs
- Supabase Edge Function for email notifications (`supabase/functions/notify-quote/index.ts`)
  - Resend API integration for HTML + text email delivery
  - Beautiful branded email template with quote details
  - Triggered on INSERT into `quotes` table via database webhook
- React Router DOM v6 with multi-page structure
  - Pages: Home (`/`), Services (`/services`), About (`/about`), Contact (`/contact`)
  - Legal pages: Terms (`/terms`), Privacy (`/privacy`), Cancellation (`/cancellation`)
  - Quote builder preserved at `/booking` route
  - 404 fallback page
- Layout components
  - `Header` with responsive navigation + mobile hamburger menu
  - `Footer` with quick links, legal links, contact info, trust badges
- `BookingConfirmation` component with quote ID display, price summary, next steps, and trust messaging
- Sitemap.xml for SEO (`public/sitemap.xml`) with all routes
- Lazy-loading for Three.js scene via `React.lazy()` + dynamic `import()`
  - Defers 1.1MB Three.js bundle until after initial paint
  - Scene completely disabled for users with `prefers-reduced-motion: reduce`
- Vite chunk splitting optimization
  - `three-vendor`: Three.js ecosystem (lazy-loaded)
  - `framer`: Framer Motion animations
  - `forms`: React Hook Form + Zod validation
  - `router`: React Router DOM
- Supabase client library (`src/lib/supabase-client.ts`)
  - Quote submission with customer upsert logic
  - Booking creation with quote status update
  - Query helpers: `getQuotesByCustomer`, `getRecentQuotes`, `getBookingStats`
  - Audit logging for all quote and booking actions
- API layer with fallback chain (`src/lib/api.ts`)
  - Priority 1: Supabase (primary persistence)
  - Priority 2: External API endpoint (fallback)
  - Priority 3: `console.log` (development mode)
- Comprehensive `README.md` with setup instructions, project structure, and deployment guide
- GitHub Actions CI/CD pipeline (`.github/workflows/ci.yml`)
  - Jobs: lint, test, build, Lighthouse CI
  - Performance budget: performance ≥ 80, accessibility ≥ 90, best-practices ≥ 90, seo ≥ 90
  - pnpm store caching
  - Artifact upload for build output
- Sentry error tracking integration guide
- Plausible privacy-first analytics integration guide
- `CHANGELOG.md` following Keep a Changelog format

### Changed
- Updated `.env.example` with Supabase configuration documentation
- Updated `Content-Security-Policy` to allow Supabase and Resend API connections
- Updated `index.html` with sitemap link
- Optimized `vite.config.ts` with `reportCompressedSize: true` and additional manual chunks
- Updated `vercel.json` permissions policy to include geolocation self-access
- Updated `main.tsx` to use React Router and lazy-load 3D scene
- Refactored `App.tsx` to integrate `BookingConfirmation` component with quote ID display

### Security
- Row Level Security (RLS) policies on all database tables
- Service role restriction for quote and booking management
- Public read-only access for services config and suburbs
- Audit logging for all user-initiated actions
- Input validation via Zod schemas on all form fields

### Fixed
- Three.js bundle (1.1MB) was loading on initial page — now lazy-loaded after first paint
- Quote submissions had no persistence — now saved to Supabase database
- No email confirmations — now automated via Resend API Edge Function
- Single-page architecture — now multi-page with proper routing and SEO

---

## [1.0.0] - 2026-04-12

### Added
- Initial release: Single-page 3D quote builder application
- Vite + React 18 + TypeScript foundation
- Glassmorphism UI with neon color palette
- Three.js 3D background with sparkle particles, crystal, and floating rings
- Real-time quote calculation with GST breakdown
- Form validation via Zod + React Hook Form
- 22 passing unit tests (13 pricing + 9 schema)
- Dark/light theme toggle with localStorage
- Error boundaries (app-level + 3D canvas-level)
- PWA support (manifest.json, service worker)
- Full SEO: meta tags, Open Graph, Twitter Cards, Schema.org JSON-LD
- Security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- Accessibility: skip navigation, ARIA attributes, reduced motion support
- Vercel deployment configuration (Sydney region)
- Manual chunk splitting (three-vendor, framer)

[Unreleased]: https://github.com/navyapdh11/sparkleclean-pro/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/navyapdh11/sparkleclean-pro/releases/tag/v1.0.0
