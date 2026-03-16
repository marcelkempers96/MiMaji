-- MiMaji: Riders and Kiosks Schema

-- ============================================
-- RIDERS (delivery riders)
-- ============================================
CREATE TABLE riders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  id_number TEXT NOT NULL,
  zone_id UUID REFERENCES zones ON DELETE SET NULL,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('motorcycle', 'bicycle', 'tuktuk', 'van')),
  license_number TEXT,
  experience TEXT,
  availability TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- KIOSKS (water providers / shops)
-- ============================================
CREATE TABLE kiosks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  zone_id UUID REFERENCES zones ON DELETE SET NULL,
  address TEXT NOT NULL DEFAULT '',
  lat DOUBLE PRECISION DEFAULT -1.2921,
  lng DOUBLE PRECISION DEFAULT 36.8219,
  business_type TEXT NOT NULL CHECK (business_type IN ('kiosk', 'depot', 'shop', 'borehole')),
  water_source TEXT,
  jug_capacity INTEGER,
  price_per_jug INTEGER NOT NULL DEFAULT 200,
  operating_hours TEXT,
  has_permit BOOLEAN NOT NULL DEFAULT FALSE,
  permit_number TEXT,
  delivery_capable BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT FALSE,
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiosks ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public signup forms)
CREATE POLICY "anyone_create_riders" ON riders FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone_create_kiosks" ON kiosks FOR INSERT WITH CHECK (true);

-- Active kiosks are publicly viewable
CREATE POLICY "public_read_active_kiosks" ON kiosks
  FOR SELECT USING (active = true AND status = 'active');

-- Riders can read their own record
CREATE POLICY "riders_read_own" ON riders
  FOR SELECT USING (phone = current_setting('request.jwt.claim.phone', true));

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_riders_phone ON riders (phone);
CREATE INDEX idx_riders_zone ON riders (zone_id);
CREATE INDEX idx_riders_status ON riders (status);
CREATE INDEX idx_kiosks_zone ON kiosks (zone_id);
CREATE INDEX idx_kiosks_status ON kiosks (status);
CREATE INDEX idx_kiosks_active ON kiosks (active, status);
