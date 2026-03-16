-- MiMaji Database Schema
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('customer', 'distributor', 'admin');
CREATE TYPE order_status AS ENUM ('pending_payment', 'paid', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed');

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'customer',
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ZONES
-- ============================================
CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial Nairobi zones
INSERT INTO zones (name, active) VALUES
  ('Westlands', true),
  ('Karen', true),
  ('Kilimani', true),
  ('Kileleshwa', true),
  ('CBD', true),
  ('Parklands', true),
  ('Langata', true),
  ('Embakasi', true),
  ('Kasarani', true),
  ('Thika Road', true);

-- ============================================
-- DISTRIBUTORS
-- ============================================
CREATE TABLE distributors (
  id UUID PRIMARY KEY REFERENCES profiles ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES zones ON DELETE RESTRICT,
  depot_name TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES profiles ON DELETE SET NULL,
  distributor_id UUID REFERENCES distributors ON DELETE SET NULL,
  zone_id UUID REFERENCES zones ON DELETE SET NULL,
  delivery_address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL DEFAULT -1.2921,
  lng DOUBLE PRECISION NOT NULL DEFAULT 36.8219,
  quantity INTEGER NOT NULL CHECK (quantity >= 1 AND quantity <= 10),
  price_total INTEGER NOT NULL CHECK (price_total > 0),
  status order_status NOT NULL DEFAULT 'pending_payment',
  mpesa_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- PAYMENTS
-- ============================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders ON DELETE CASCADE,
  mpesa_checkout_id TEXT,
  mpesa_receipt TEXT,
  amount INTEGER NOT NULL CHECK (amount > 0),
  status payment_status NOT NULL DEFAULT 'pending',
  raw_callback JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CONFIG (for pricing and settings)
-- ============================================
CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO config (key, value) VALUES
  ('jug_price_kes', '200'),
  ('delivery_fee_kes', '100'),
  ('app_name', 'MiMaji'),
  ('whatsapp_number', '');

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own profile
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Zones: everyone can read active zones
CREATE POLICY "anyone_read_zones" ON zones
  FOR SELECT USING (active = true);

-- Orders: customers see only their own orders
CREATE POLICY "customers_own_orders" ON orders
  FOR SELECT USING (customer_id = auth.uid());

-- Orders: distributors see orders in their zone
CREATE POLICY "distributors_zone_orders" ON orders
  FOR SELECT USING (
    zone_id IN (SELECT zone_id FROM distributors WHERE id = auth.uid())
  );

-- Orders: anyone can insert (for unauthenticated ordering)
CREATE POLICY "anyone_create_orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Orders: distributors can update status of orders assigned to them
CREATE POLICY "distributors_update_orders" ON orders
  FOR UPDATE USING (
    distributor_id = auth.uid()
    OR distributor_id IS NULL
  );

-- Payments: linked to orders (use service role for M-Pesa callback)
CREATE POLICY "service_role_payments" ON payments
  FOR ALL USING (true);

-- Config: anyone can read
CREATE POLICY "anyone_read_config" ON config
  FOR SELECT USING (true);

-- ============================================
-- REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_orders_customer ON orders (customer_id);
CREATE INDEX idx_orders_distributor ON orders (distributor_id);
CREATE INDEX idx_orders_zone ON orders (zone_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX idx_payments_order ON payments (order_id);
CREATE INDEX idx_payments_checkout ON payments (mpesa_checkout_id);
