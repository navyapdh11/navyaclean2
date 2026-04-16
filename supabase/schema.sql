-- SparkleClean Pro — Supabase Schema
-- Run this in your Supabase SQL Editor to create the database structure.
-- Requires: Row Level Security (RLS) enabled on all tables.

-- ──────────────────────────────────────────────────────────────
-- 1. ENUMS
-- ──────────────────────────────────────────────────────────────

CREATE TYPE property_type AS ENUM ('house', 'apartment', 'office', 'commercial');
CREATE TYPE cleaning_frequency AS ENUM ('one-time', 'weekly', 'fortnightly', 'monthly');
CREATE TYPE service_type AS ENUM ('standard', 'deep', 'carpet', 'windows', 'oven');
CREATE TYPE quote_status AS ENUM ('pending', 'accepted', 'rejected', 'expired', 'converted');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE cleaner_status AS ENUM ('available', 'on_job', 'offline', 'on_leave');

-- ──────────────────────────────────────────────────────────────
-- 2. CUSTOMERS
-- ──────────────────────────────────────────────────────────────

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one record per email
  CONSTRAINT uq_customer_email UNIQUE (email)
);

-- Index for fast email lookups
CREATE INDEX idx_customers_email ON customers(email);

-- RLS: Customers can only read their own data
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own data"
  ON customers FOR SELECT
  USING (email = current_setting('app.current_email', true));

-- ──────────────────────────────────────────────────────────────
-- 3. QUOTES
-- ──────────────────────────────────────────────────────────────

CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Property details
  property_type property_type NOT NULL DEFAULT 'house',
  bedrooms INT NOT NULL DEFAULT 0 CHECK (bedrooms BETWEEN 0 AND 10),
  bathrooms INT NOT NULL DEFAULT 0 CHECK (bathrooms BETWEEN 0 AND 10),
  area_sqm NUMERIC(10, 2) NOT NULL CHECK (area_sqm BETWEEN 10 AND 5000),

  -- Quote calculation
  selected_services service_type[] NOT NULL,
  frequency cleaning_frequency NOT NULL DEFAULT 'one-time',
  pets BOOLEAN DEFAULT FALSE,
  eco_friendly BOOLEAN DEFAULT FALSE,
  urgent BOOLEAN DEFAULT FALSE,

  -- Pricing (in cents to avoid floating-point issues)
  subtotal_cents INT NOT NULL,
  gst_cents INT NOT NULL,
  total_cents INT NOT NULL,

  -- Metadata
  status quote_status NOT NULL DEFAULT 'pending',
  valid_until TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Check: total = subtotal + gst
  CONSTRAINT chk_quote_total CHECK (total_cents = subtotal_cents + gst_cents)
);

-- Index for filtering by customer and status
CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);

-- RLS: Only authenticated service role can manage quotes
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage all quotes"
  ON quotes FOR ALL
  USING (auth.role() = 'service_role');

-- ──────────────────────────────────────────────────────────────
-- 4. BOOKINGS (extends quotes — created when customer accepts)
-- ──────────────────────────────────────────────────────────────

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Scheduling
  requested_date DATE NOT NULL,
  requested_time_slot TEXT NOT NULL, -- e.g., "08:00-12:00"
  actual_date DATE,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,

  -- Assignment
  cleaner_id UUID, -- References cleaners table (created later)

  -- Status & payment
  status booking_status NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'unpaid', -- unpaid, deposit_paid, paid, refunded
  stripe_payment_intent_id TEXT,
  stripe_receipt_url TEXT,

  -- Address (for the job)
  street_address TEXT,
  suburb TEXT NOT NULL,
  postcode TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'NSW',
  access_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_requested_date ON bookings(requested_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_cleaner_id ON bookings(cleaner_id);

-- RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage all bookings"
  ON bookings FOR ALL
  USING (auth.role() = 'service_role');

-- ──────────────────────────────────────────────────────────────
-- 5. CLEANERS (staff members who perform the cleaning)
-- ──────────────────────────────────────────────────────────────

CREATE TABLE cleaners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  status cleaner_status NOT NULL DEFAULT 'available',
  rating DECIMAL(3, 2) DEFAULT 5.00 CHECK (rating BETWEEN 0 AND 5),
  jobs_completed INT DEFAULT 0,
  max_daily_jobs INT DEFAULT 4,
  service_radius_km INT DEFAULT 50,
  home_suburb TEXT,
  police_check_expiry DATE,
  insurance_expiry DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cleaners_status ON cleaners(status);
CREATE INDEX idx_cleaners_suburb ON cleaners(home_suburb);

-- RLS
ALTER TABLE cleaners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage all cleaners"
  ON cleaners FOR ALL
  USING (auth.role() = 'service_role');

-- ──────────────────────────────────────────────────────────────
-- 6. SERVICES CONFIG (pricing managed by admin)
-- ──────────────────────────────────────────────────────────────

CREATE TABLE services_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug service_type NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  base_cost_cents INT NOT NULL,
  icon_emoji TEXT,
  color_hex TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default service pricing
INSERT INTO services_config (slug, name, description, base_cost_cents, icon_emoji, color_hex) VALUES
  ('standard', 'Standard Clean', 'Regular maintenance cleaning', 8000, '🧹', '#00f0ff'),
  ('deep', 'Deep Clean', 'Intensive sanitization', 15000, '🔬', '#8b5cf6'),
  ('carpet', 'Carpet Clean', 'Steam & extraction', 6000, '🧽', '#00ff9d'),
  ('windows', 'Windows', 'Interior & exterior', 4500, '🪟', '#ffea00'),
  ('oven', 'Oven Clean', 'Degrease & sanitize', 3500, '🔥', '#ff0080');

-- RLS
ALTER TABLE services_config ENABLE ROW LEVEL SECURITY;

-- Public read for pricing transparency
CREATE POLICY "Anyone can read services config"
  ON services_config FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage services config"
  ON services_config FOR ALL
  USING (auth.role() = 'service_role');

-- ──────────────────────────────────────────────────────────────
-- 7. SUBURBS (service area coverage for Sydney)
-- ──────────────────────────────────────────────────────────────

CREATE TABLE suburbs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  postcode TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'NSW',
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  is_active BOOLEAN DEFAULT TRUE,
  travel_surcharge_cents INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_suburbs_postcode ON suburbs(postcode);
CREATE INDEX idx_suburbs_name ON suburbs(name);

-- Seed some Sydney suburbs
INSERT INTO suburbs (name, postcode, state, latitude, longitude) VALUES
  ('Sydney CBD', '2000', 'NSW', -33.8688, 151.2093),
  ('Bondi Beach', '2026', 'NSW', -33.8915, 151.2767),
  ('Parramatta', '2150', 'NSW', -33.8151, 151.0017),
  ('Chatswood', '2067', 'NSW', -33.7969, 151.1831),
  ('Manly', '2095', 'NSW', -33.7969, 151.2840),
  ('Newtown', '2042', 'NSW', -33.8965, 151.1793),
  ('Cronulla', '2230', 'NSW', -34.0578, 151.1514),
  ('Penrith', '2750', 'NSW', -33.7511, 150.6942);

-- RLS
ALTER TABLE suburbs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read suburbs"
  ON suburbs FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role can manage suburbs"
  ON suburbs FOR ALL
  USING (auth.role() = 'service_role');

-- ──────────────────────────────────────────────────────────────
-- 8. AUDIT LOG (for OASIS-IS governance compliance)
-- ──────────────────────────────────────────────────────────────

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'agent', 'system')),
  actor_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_actor ON audit_log(actor_type, actor_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage audit log"
  ON audit_log FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can read audit log"
  ON audit_log FOR SELECT
  USING (auth.role() = 'service_role');

-- ──────────────────────────────────────────────────────────────
-- 9. TRIGGER: Auto-update updated_at
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cleaners_updated_at
  BEFORE UPDATE ON cleaners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_config_updated_at
  BEFORE UPDATE ON services_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────────────────────
-- 10. STORAGE BUCKET: Quote PDFs & Receipts
-- ──────────────────────────────────────────────────────────────
-- Run this in the Supabase Dashboard > Storage, not SQL:
-- Create bucket: "documents" (public: false)
-- Policy: Allow authenticated users to upload
-- Policy: Allow public read on specific paths

-- ──────────────────────────────────────────────────────────────
-- VERIFICATION
-- ──────────────────────────────────────────────────────────────

-- Check all tables were created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
