-- Migration 010: Add vendor_products and vendor_service_times tables
-- Enables full vendor data persistence in Supabase (no more localStorage-only)

-- ── Vendor Products ──
CREATE TABLE IF NOT EXISTS vendor_products (
  id TEXT NOT NULL,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  price_new NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_refill NUMERIC(10,2) NOT NULL DEFAULT 0,
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (vendor_id, id)
);

-- ── Vendor Service Times ──
CREATE TABLE IF NOT EXISTS vendor_service_times (
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  day TEXT NOT NULL, -- "Monday", "Tuesday", etc.
  open BOOLEAN NOT NULL DEFAULT true,
  open_time TEXT NOT NULL DEFAULT '07:00',
  close_time TEXT NOT NULL DEFAULT '20:00',
  PRIMARY KEY (vendor_id, day)
);

-- ── Add description, min_order, and credentials columns to vendors ──
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS min_order TEXT DEFAULT '';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS pin TEXT DEFAULT '';

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_vendor_products_vendor ON vendor_products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_service_times_vendor ON vendor_service_times(vendor_id);

-- ── RLS Policies ──
ALTER TABLE vendor_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_service_times ENABLE ROW LEVEL SECURITY;

-- Public can read active vendor products
CREATE POLICY "Anyone can read vendor products" ON vendor_products FOR SELECT USING (true);

-- Vendors can manage their own products
CREATE POLICY "Vendors can manage own products" ON vendor_products FOR ALL USING (
  vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
);

-- Public can read service times
CREATE POLICY "Anyone can read service times" ON vendor_service_times FOR SELECT USING (true);

-- Vendors can manage their own service times
CREATE POLICY "Vendors can manage own service times" ON vendor_service_times FOR ALL USING (
  vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
);

-- Enable realtime for vendor products
ALTER PUBLICATION supabase_realtime ADD TABLE vendor_products;
ALTER PUBLICATION supabase_realtime ADD TABLE vendor_service_times;
