-- Migration: 001_initial_schema
-- Created: 2026-04-16
-- Description: Complete initial schema for SparkleClean Pro with corrected RLS policies
-- Allows anon writes for quote/booking submission, tightens admin tables

-- ──────────────────────────────────────────────────────────────
-- 1. ENUMS
-- ──────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE property_type AS ENUM ('house', 'apartment', 'office', 'commercial');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE cleaning_frequency AS ENUM ('one-time', 'weekly', 'fortnightly', 'monthly');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE service_type AS ENUM ('standard', 'deep', 'carpet', 'windows', 'oven');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE quote_status AS ENUM ('pending', 'accepted', 'rejected', 'expired', 'converted');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE cleaner_status AS ENUM ('available', 'on_job', 'offline', 'on_leave');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ──────────────────────────────────────────────────────────────
-- 2. CUSTOMERS
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_customer_email UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon insert customers" ON customers;
CREATE POLICY "Anon insert customers"
  ON customers FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage customers" ON customers;
CREATE POLICY "Service role can manage customers"
  ON customers FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ──────────────────────────────────────────────────────────────
-- 3. QUOTES
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  property_type property_type NOT NULL DEFAULT 'house',
  bedrooms INT NOT NULL DEFAULT 0 CHECK (bedrooms BETWEEN 0 AND 10),
  bathrooms INT NOT NULL DEFAULT 0 CHECK (bathrooms BETWEEN 0 AND 10),
  area_sqm NUMERIC(10, 2) NOT NULL CHECK (area_sqm BETWEEN 10 AND 5000),
  selected_services service_type[] NOT NULL,
  frequency cleaning_frequency NOT NULL DEFAULT 'one-time',
  pets BOOLEAN DEFAULT FALSE,
  eco_friendly BOOLEAN DEFAULT FALSE,
  urgent BOOLEAN DEFAULT FALSE,
  subtotal_cents INT NOT NULL,
  gst_cents INT NOT NULL,
  total_cents INT NOT NULL,
  status quote_status NOT NULL DEFAULT 'pending',
  valid_until TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_quote_total CHECK (total_cents = subtotal_cents + gst_cents)
);

CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon insert quotes" ON quotes;
CREATE POLICY "Anon insert quotes"
  ON quotes FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage quotes" ON quotes;
CREATE POLICY "Service role can manage quotes"
  ON quotes FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ──────────────────────────────────────────────────────────────
-- 4. BOOKINGS
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  requested_date DATE NOT NULL,
  requested_time_slot TEXT NOT NULL,
  actual_date DATE,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  cleaner_id UUID,
  status booking_status NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  stripe_payment_intent_id TEXT,
  stripe_receipt_url TEXT,
  street_address TEXT,
  suburb TEXT NOT NULL,
  postcode TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'NSW',
  access_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_requested_date ON bookings(requested_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_cleaner_id ON bookings(cleaner_id);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon insert bookings" ON bookings;
CREATE POLICY "Anon insert bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage bookings" ON bookings;
CREATE POLICY "Service role can manage bookings"
  ON bookings FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ──────────────────────────────────────────────────────────────
-- 5. CLEANERS
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cleaners (
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

CREATE INDEX IF NOT EXISTS idx_cleaners_status ON cleaners(status);
CREATE INDEX IF NOT EXISTS idx_cleaners_suburb ON cleaners(home_suburb);

ALTER TABLE cleaners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage cleaners" ON cleaners;
CREATE POLICY "Service role can manage cleaners"
  ON cleaners FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ──────────────────────────────────────────────────────────────
-- 6. SERVICES CONFIG
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS services_config (
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

ALTER TABLE services_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read services config" ON services_config;
CREATE POLICY "Anyone can read services config"
  ON services_config FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role can manage services config" ON services_config;
CREATE POLICY "Service role can manage services config"
  ON services_config FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Seed service pricing (ignore if already exists)
INSERT INTO services_config (slug, name, description, base_cost_cents, icon_emoji, color_hex) VALUES
  ('standard', 'Standard Clean', 'Regular maintenance cleaning', 8000, '🧹', '#00f0ff'),
  ('deep', 'Deep Clean', 'Intensive sanitization', 15000, '🔬', '#8b5cf6'),
  ('carpet', 'Carpet Clean', 'Steam & extraction', 6000, '🧽', '#00ff9d'),
  ('windows', 'Windows', 'Interior & exterior', 4500, '🪟', '#ffea00'),
  ('oven', 'Oven Clean', 'Degrease & sanitize', 3500, '🔥', '#ff0080')
ON CONFLICT (slug) DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- 7. SUBURBS
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS suburbs (
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

CREATE INDEX IF NOT EXISTS idx_suburbs_postcode ON suburbs(postcode);
CREATE INDEX IF NOT EXISTS idx_suburbs_name ON suburbs(name);

ALTER TABLE suburbs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active suburbs" ON suburbs;
CREATE POLICY "Anyone can read active suburbs"
  ON suburbs FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Service role can manage suburbs" ON suburbs;
CREATE POLICY "Service role can manage suburbs"
  ON suburbs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Seed suburbs (ignore if already exists)
INSERT INTO suburbs (name, postcode, state, latitude, longitude) VALUES
  ('Sydney CBD', '2000', 'NSW', -33.8688, 151.2093),
  ('Bondi Beach', '2026', 'NSW', -33.8915, 151.2767),
  ('Parramatta', '2150', 'NSW', -33.8151, 151.0017),
  ('Chatswood', '2067', 'NSW', -33.7969, 151.1831),
  ('Manly', '2095', 'NSW', -33.7969, 151.2840),
  ('Newtown', '2042', 'NSW', -33.8965, 151.1793),
  ('Cronulla', '2230', 'NSW', -34.0578, 151.1514),
  ('Penrith', '2750', 'NSW', -33.7511, 150.6942)
ON CONFLICT DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- 8. AUDIT LOG
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_log (
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

CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor_type, actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon insert audit_log" ON audit_log;
CREATE POLICY "Anon insert audit_log"
  ON audit_log FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage audit log" ON audit_log;
CREATE POLICY "Service role can manage audit log"
  ON audit_log FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ──────────────────────────────────────────────────────────────
-- 9. ADMIN TABLES
-- ──────────────────────────────────────────────────────────────

-- Admin Settings
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  updated_by UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO admin_settings (key, value, category) VALUES
  ('pricing_state_multipliers', '{"NSW": 1.15, "VIC": 1.10, "QLD": 1.05, "WA": 1.08, "SA": 1.00, "TAS": 0.95, "ACT": 1.12, "NT": 1.05}', 'pricing'),
  ('pricing_gst_rate', '0.10', 'pricing'),
  ('pricing_currency', 'AUD', 'pricing')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated read admin_settings" ON admin_settings;
CREATE POLICY "Authenticated read admin_settings"
  ON admin_settings FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated write admin_settings" ON admin_settings;
CREATE POLICY "Authenticated write admin_settings"
  ON admin_settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Photo Gallery
CREATE TABLE IF NOT EXISTS photo_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  category VARCHAR(50) DEFAULT 'general',
  service_id VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photo_gallery_category ON photo_gallery(category);
CREATE INDEX IF NOT EXISTS idx_photo_gallery_active ON photo_gallery(is_active, sort_order);

ALTER TABLE photo_gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active photos" ON photo_gallery;
CREATE POLICY "Public read active photos"
  ON photo_gallery FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated write photos" ON photo_gallery;
CREATE POLICY "Authenticated write photos"
  ON photo_gallery FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Ad Campaigns
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'banner',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  image_url VARCHAR(500) NOT NULL,
  target_url VARCHAR(500),
  position VARCHAR(50) DEFAULT 'homepage_hero',
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  budget_cents INTEGER DEFAULT 0,
  spent_cents INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON ad_campaigns(status, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_position ON ad_campaigns(position, status);

ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active ads" ON ad_campaigns;
CREATE POLICY "Public read active ads"
  ON ad_campaigns FOR SELECT
  USING (status = 'active' AND NOW() BETWEEN start_date AND COALESCE(end_date, NOW()));

DROP POLICY IF EXISTS "Authenticated write ads" ON ad_campaigns;
CREATE POLICY "Authenticated write ads"
  ON ad_campaigns FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Discounts
CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'percentage',
  value NUMERIC(10, 2) NOT NULL,
  min_spend_cents INTEGER,
  max_discount_cents INTEGER,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  description TEXT DEFAULT '',
  applicable_services TEXT[],
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code, is_active);
CREATE INDEX IF NOT EXISTS idx_discounts_dates ON discounts(start_date, end_date, is_active);

ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active discounts" ON discounts;
CREATE POLICY "Public read active discounts"
  ON discounts FOR SELECT
  USING (is_active = true AND NOW() BETWEEN start_date AND end_date);

DROP POLICY IF EXISTS "Authenticated write discounts" ON discounts;
CREATE POLICY "Authenticated write discounts"
  ON discounts FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Staff
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'cleaner',
  department VARCHAR(50),
  avatar_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  hourly_rate_cents INTEGER,
  max_jobs_per_day INTEGER DEFAULT 4,
  service_areas TEXT[],
  notes TEXT DEFAULT '',
  hired_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role, is_active);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated read staff" ON staff;
CREATE POLICY "Authenticated read staff"
  ON staff FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated write staff" ON staff;
CREATE POLICY "Authenticated write staff"
  ON staff FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Cameras
CREATE TABLE IF NOT EXISTS cameras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  stream_url VARCHAR(500),
  webrtc_token VARCHAR(100),
  status VARCHAR(20) DEFAULT 'offline',
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cameras_status ON cameras(status);

ALTER TABLE cameras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated read cameras" ON cameras;
CREATE POLICY "Authenticated read cameras"
  ON cameras FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated write cameras" ON cameras;
CREATE POLICY "Authenticated write cameras"
  ON cameras FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Admin Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type VARCHAR(20) NOT NULL DEFAULT 'admin',
  actor_id UUID,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  old_value JSONB,
  new_value JSONB,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated read audit_logs" ON audit_logs;
CREATE POLICY "Authenticated read audit_logs"
  ON audit_logs FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated write audit_logs" ON audit_logs;
CREATE POLICY "Authenticated write audit_logs"
  ON audit_logs FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Seed data (ignore if already exists)
INSERT INTO staff (full_name, email, phone, role, department, is_active, hourly_rate_cents, service_areas) VALUES
  ('Admin User', 'admin@sparkleclean.pro', '+61 400 000 001', 'admin', 'Management', true, 3500, ARRAY['Sydney CBD', 'Parramatta', 'Bondi']),
  ('Sarah Mitchell', 'sarah@sparkleclean.pro', '+61 400 000 002', 'manager', 'Operations', true, 3000, ARRAY['Sydney CBD', 'North Shore']),
  ('James Chen', 'james@sparkleclean.pro', '+61 400 000 003', 'cleaner', 'Residential', true, 2500, ARRAY['Bondi', 'Manly', 'Cronulla']),
  ('Emma Green', 'emma@sparkleclean.pro', '+61 400 000 004', 'cleaner', 'Commercial', true, 2500, ARRAY['Parramatta', 'Liverpool'])
ON CONFLICT (email) DO NOTHING;

INSERT INTO discounts (code, type, value, description, start_date, end_date, is_active) VALUES
  ('WELCOME20', 'percentage', 20, '20% off your first clean', NOW(), NOW() + INTERVAL '90 days', true),
  ('SPRING2026', 'percentage', 15, 'Spring cleaning special — 15% off all services', NOW(), NOW() + INTERVAL '60 days', true),
  ('BONDI50', 'fixed', 50, '$50 off Bondi area cleans', NOW(), NOW() + INTERVAL '30 days', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO cameras (name, location, status) VALUES
  ('Front Entrance', 'Sydney CBD Office — Front', 'offline'),
  ('Reception Area', 'Sydney CBD Office — Reception', 'offline'),
  ('Warehouse Bay 3', 'Parramatta Warehouse', 'offline')
ON CONFLICT DO NOTHING;

INSERT INTO ad_campaigns (name, type, status, image_url, target_url, position, start_date, end_date, priority) VALUES
  ('Summer Sale 2026', 'banner', 'draft', '/ads/summer-sale.jpg', '/booking', 'homepage_hero', NOW(), NOW() + INTERVAL '60 days', 1),
  ('New Service Launch', 'popup', 'draft', '/ads/new-service.jpg', '/services', 'homepage_popup', NOW(), NOW() + INTERVAL '30 days', 2)
ON CONFLICT DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- 10. TRIGGERS: Auto-update updated_at
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cleaners_updated_at ON cleaners;
CREATE TRIGGER update_cleaners_updated_at BEFORE UPDATE ON cleaners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_config_updated_at ON services_config;
CREATE TRIGGER update_services_config_updated_at BEFORE UPDATE ON services_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_settings_updated_at ON admin_settings;
CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_photo_gallery_updated_at ON photo_gallery;
CREATE TRIGGER update_photo_gallery_updated_at BEFORE UPDATE ON photo_gallery FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ad_campaigns_updated_at ON ad_campaigns;
CREATE TRIGGER update_ad_campaigns_updated_at BEFORE UPDATE ON ad_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_discounts_updated_at ON discounts;
CREATE TRIGGER update_discounts_updated_at BEFORE UPDATE ON discounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cameras_updated_at ON cameras;
CREATE TRIGGER update_cameras_updated_at BEFORE UPDATE ON cameras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
