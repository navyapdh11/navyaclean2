// Supabase SQL Schema — Admin Dashboard Tables
// Run this in Supabase SQL Editor to enable admin features

-- ──────────────────────────────────────────────────────────────
-- 1. Admin Settings & Pricing Table
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  updated_by UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default pricing settings
INSERT INTO admin_settings (key, value, category) VALUES
  ('pricing_state_multipliers', '{"NSW": 1.15, "VIC": 1.10, "QLD": 1.05, "WA": 1.08, "SA": 1.00, "TAS": 0.95, "ACT": 1.12, "NT": 1.05}', 'pricing'),
  ('pricing_gst_rate', '0.10', 'pricing'),
  ('pricing_currency', 'AUD', 'pricing')
ON CONFLICT (key) DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- 2. Photo Gallery Table
-- ──────────────────────────────────────────────────────────────

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

CREATE INDEX idx_photo_gallery_category ON photo_gallery(category);
CREATE INDEX idx_photo_gallery_active ON photo_gallery(is_active, sort_order);

-- ──────────────────────────────────────────────────────────────
-- 3. Ads/Banners Table
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'banner', -- banner, popup, sidebar
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, active, paused, expired
  image_url VARCHAR(500) NOT NULL,
  target_url VARCHAR(500),
  position VARCHAR(50) DEFAULT 'homepage_hero', -- homepage_hero, services_banner, sidebar, footer
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

CREATE INDEX idx_ad_campaigns_status ON ad_campaigns(status, start_date, end_date);
CREATE INDEX idx_ad_campaigns_position ON ad_campaigns(position, status);

-- ──────────────────────────────────────────────────────────────
-- 4. Discounts & Offerings Table
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'percentage', -- percentage, fixed, free_service
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

CREATE INDEX idx_discounts_code ON discounts(code, is_active);
CREATE INDEX idx_discounts_dates ON discounts(start_date, end_date, is_active);

-- ──────────────────────────────────────────────────────────────
-- 5. Staff Management Table
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'cleaner', -- admin, manager, cleaner, dispatcher
  department VARCHAR(50),
  avatar_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  hourly_rate_cents INTEGER,
  max_jobs_per_day INTEGER DEFAULT 4,
  service_areas TEXT[], -- suburbs they cover
  notes TEXT DEFAULT '',
  hired_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_staff_role ON staff(role, is_active);
CREATE INDEX idx_staff_email ON staff(email);

-- ──────────────────────────────────────────────────────────────
-- 6. Webcam/Camera Registry Table
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cameras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  stream_url VARCHAR(500),
  webrtc_token VARCHAR(100),
  status VARCHAR(20) DEFAULT 'offline', -- online, offline, maintenance
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cameras_status ON cameras(status);

-- ──────────────────────────────────────────────────────────────
-- 7. Audit Log Table
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type VARCHAR(20) NOT NULL DEFAULT 'admin', -- admin, system, api
  actor_id UUID,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  old_value JSONB,
  new_value JSONB,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_action ON audit_logs(action, created_at);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- ──────────────────────────────────────────────────────────────
-- 8. Row Level Security (RLS) Policies
-- ──────────────────────────────────────────────────────────────

-- Enable RLS on all admin tables
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public read for active discounts and ads (frontend display)
CREATE POLICY "Public read active discounts" ON discounts
  FOR SELECT USING (is_active = true AND NOW() BETWEEN start_date AND end_date);

CREATE POLICY "Public read active ads" ON ad_campaigns
  FOR SELECT USING (status = 'active' AND NOW() BETWEEN start_date AND COALESCE(end_date, NOW()));

CREATE POLICY "Public read active photos" ON photo_gallery
  FOR SELECT USING (is_active = true);

-- Admin full access (in production, restrict to authenticated admin users)
CREATE POLICY "Admin full access settings" ON admin_settings FOR ALL USING (true);
CREATE POLICY "Admin full access photos" ON photo_gallery FOR ALL USING (true);
CREATE POLICY "Admin full access ads" ON ad_campaigns FOR ALL USING (true);
CREATE POLICY "Admin full access discounts" ON discounts FOR ALL USING (true);
CREATE POLICY "Admin full access staff" ON staff FOR ALL USING (true);
CREATE POLICY "Admin full access cameras" ON cameras FOR ALL USING (true);
CREATE POLICY "Admin full access audit" ON audit_logs FOR ALL USING (true);

-- ──────────────────────────────────────────────────────────────
-- 9. Sample Data (for testing)
-- ──────────────────────────────────────────────────────────────

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
-- Verification
-- ──────────────────────────────────────────────────────────────

SELECT 'admin_settings' as table_name, COUNT(*) FROM admin_settings
UNION ALL
SELECT 'photo_gallery', COUNT(*) FROM photo_gallery
UNION ALL
SELECT 'ad_campaigns', COUNT(*) FROM ad_campaigns
UNION ALL
SELECT 'discounts', COUNT(*) FROM discounts
UNION ALL
SELECT 'staff', COUNT(*) FROM staff
UNION ALL
SELECT 'cameras', COUNT(*) FROM cameras
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs;
