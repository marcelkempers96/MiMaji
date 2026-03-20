-- ============================================================
-- MiMaji Migration 007: Brands, Areas Served & Brand Preference
-- Run this in Supabase SQL Editor AFTER migrations 001-006
-- ============================================================

-- ────────────────────────────────────────────────────────
-- 1. WATER BRANDS – reference table
-- ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS water_brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE water_brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_read_brands" ON water_brands
  FOR SELECT USING (true);

CREATE POLICY "service_manage_brands" ON water_brands
  FOR ALL USING (auth.role() = 'service_role');

-- Seed the initial brands
INSERT INTO water_brands (id, name, active) VALUES
  ('keringet', 'Keringet', true),
  ('aquamist', 'AquaMist', true),
  ('mayers', 'Mayers', true)
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────
-- 2. VENDORS – add brands and areas_served columns
-- ────────────────────────────────────────────────────────
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS brands TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS areas_served TEXT[] NOT NULL DEFAULT '{}';

-- ────────────────────────────────────────────────────────
-- 3. VENDOR LOCATIONS – add full address field
-- ────────────────────────────────────────────────────────
ALTER TABLE vendor_locations ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '';

-- ────────────────────────────────────────────────────────
-- 4. ORDERS – add brand_preference column
-- ────────────────────────────────────────────────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS brand_preference TEXT[] DEFAULT '{}';

-- ────────────────────────────────────────────────────────
-- 5. ORDERS – add product_name and order_items if missing
--    (these may already exist from earlier migrations)
-- ────────────────────────────────────────────────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_items JSONB DEFAULT '[]';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_minutes INTEGER;

-- ────────────────────────────────────────────────────────
-- 6. NAIROBI AREAS – seed the zones table with more areas
--    (zones table exists from migration 001, add new ones)
-- ────────────────────────────────────────────────────────
INSERT INTO zones (name, active) VALUES
  ('Lavington', true),
  ('Hurlingham', true),
  ('South C', true),
  ('South B', true),
  ('Nairobi West', true),
  ('Upper Hill', true),
  ('Ngara', true),
  ('Pangani', true),
  ('Eastleigh', true),
  ('Roysambu', true),
  ('Ruaraka', true),
  ('Kahawa', true),
  ('Githurai', true),
  ('Ruiru', true),
  ('Donholm', true),
  ('Umoja', true),
  ('Buruburu', true),
  ('Kayole', true),
  ('Utawala', true),
  ('Syokimau', true),
  ('Athi River', true),
  ('Kitengela', true),
  ('Rongai', true),
  ('Ngong', true),
  ('Dagoretti', true),
  ('Waithaka', true),
  ('Kawangware', true),
  ('Satellite', true),
  ('Runda', true),
  ('Muthaiga', true),
  ('Gigiri', true),
  ('Spring Valley', true),
  ('Loresho', true),
  ('Mountain View', true),
  ('Zimmerman', true),
  ('Mwiki', true),
  ('Pipeline', true),
  ('Imara Daima', true)
ON CONFLICT (name) DO NOTHING;

-- ────────────────────────────────────────────────────────
-- 7. INDEX for brand matching queries
-- ────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_vendors_brands ON vendors USING GIN (brands);
CREATE INDEX IF NOT EXISTS idx_vendors_areas_served ON vendors USING GIN (areas_served);
CREATE INDEX IF NOT EXISTS idx_orders_brand_preference ON orders USING GIN (brand_preference);
