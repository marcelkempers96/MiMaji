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
-- Create a profile automatically when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add saved_locations column to profiles for delivery addresses
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS saved_locations JSONB DEFAULT '[]';

-- Add estimated_delivery_minutes and order_items to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_minutes INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_items JSONB DEFAULT '[]';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_name TEXT;

-- Allow customers to insert their own orders
CREATE POLICY "customers_insert_own_orders" ON orders
  FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Allow customers to read their own orders
DROP POLICY IF EXISTS "customers_own_orders" ON orders;
CREATE POLICY "customers_own_orders" ON orders
  FOR SELECT USING (customer_id = auth.uid());
-- ============================================================
-- MiMaji Migration 004: Vendors, Rewards, Vouchers & Alignment
-- ============================================================

-- ────────────────────────────────────────────────────────
-- 1. PROFILES – add referral & corporate fields
-- ────────────────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_reg_no TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_corporate BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Auto-generate referral codes for new profiles
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := 'MAJI' || UPPER(SUBSTR(REPLACE(NEW.id::text, '-', ''), 27, 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER profiles_referral_code
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION generate_referral_code();

-- Backfill existing profiles that have no referral code
UPDATE profiles SET referral_code = 'MAJI' || UPPER(SUBSTR(REPLACE(id::text, '-', ''), 27, 6))
WHERE referral_code IS NULL;

-- Allow users to read profiles by referral_code (for referral lookup)
CREATE POLICY "anyone_read_profile_by_referral" ON profiles
  FOR SELECT USING (true);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles (referral_code);

-- ────────────────────────────────────────────────────────
-- 2. VENDORS – proper vendor table (replaces MOCK_VENDORS)
-- ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  area TEXT NOT NULL DEFAULT '',
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  reviews INTEGER NOT NULL DEFAULT 0,
  hours TEXT NOT NULL DEFAULT '7AM - 8PM',
  products TEXT[] NOT NULL DEFAULT '{}',
  business_reg_no TEXT,
  mpesa_number TEXT,
  phone_numbers TEXT[] NOT NULL DEFAULT '{}',
  delivery_radius_km INTEGER NOT NULL DEFAULT 10,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Public can read active vendors
CREATE POLICY "public_read_active_vendors" ON vendors
  FOR SELECT USING (active = true);

-- Vendors can update their own record
CREATE POLICY "vendors_update_own" ON vendors
  FOR UPDATE USING (profile_id = auth.uid());

-- Service role / admin can do anything
CREATE POLICY "service_manage_vendors" ON vendors
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX idx_vendors_profile ON vendors (profile_id);
CREATE INDEX idx_vendors_active ON vendors (active);

-- ────────────────────────────────────────────────────────
-- 3. VENDOR LOCATIONS – multi-store support
-- ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendor_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  area TEXT NOT NULL DEFAULT '',
  lat DOUBLE PRECISION NOT NULL DEFAULT -1.2921,
  lng DOUBLE PRECISION NOT NULL DEFAULT 36.8219,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE vendor_locations ENABLE ROW LEVEL SECURITY;

-- Public can read active locations
CREATE POLICY "public_read_vendor_locations" ON vendor_locations
  FOR SELECT USING (active = true);

-- Vendors can manage their own locations
CREATE POLICY "vendors_manage_own_locations" ON vendor_locations
  FOR ALL USING (
    vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
  );

CREATE INDEX idx_vendor_locations_vendor ON vendor_locations (vendor_id);

-- ────────────────────────────────────────────────────────
-- 4. ORDERS – add vendor routing columns
-- ────────────────────────────────────────────────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vendor_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vendor_location TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vendors_tried UUID[] DEFAULT '{}';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS current_vendor_offer UUID REFERENCES vendors(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_lat DOUBLE PRECISION;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_lng DOUBLE PRECISION;

-- Vendors can read orders offered to them or assigned to them
DROP POLICY IF EXISTS "distributors_zone_orders" ON orders;
CREATE POLICY "vendors_read_offered_orders" ON orders
  FOR SELECT USING (
    customer_id = auth.uid()
    OR vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
    OR current_vendor_offer IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
    OR (status = 'paid' AND vendor_id IS NULL AND current_vendor_offer IS NULL)
  );

-- Vendors can update orders offered to them
DROP POLICY IF EXISTS "distributors_update_orders" ON orders;
CREATE POLICY "vendors_update_orders" ON orders
  FOR UPDATE USING (
    vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
    OR current_vendor_offer IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
    OR (status = 'paid' AND vendor_id IS NULL)
  );

CREATE INDEX IF NOT EXISTS idx_orders_vendor ON orders (vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_current_offer ON orders (current_vendor_offer);

-- ────────────────────────────────────────────────────────
-- 5. REWARDS – user reward balances
-- ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rewards (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  free_litres NUMERIC(8,1) NOT NULL DEFAULT 0,
  total_earned_from_referrals NUMERIC(8,1) NOT NULL DEFAULT 0,
  milestone_bonus_awarded BOOLEAN NOT NULL DEFAULT FALSE,
  referral_qualified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_rewards" ON rewards
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users_update_own_rewards" ON rewards
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "service_manage_rewards" ON rewards
  FOR ALL USING (auth.role() = 'service_role');

-- Auto-create rewards row on profile creation
CREATE OR REPLACE FUNCTION init_user_rewards()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO rewards (user_id, free_litres)
  VALUES (NEW.id, 1)  -- 1L welcome bonus
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_profile_created_init_rewards
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION init_user_rewards();

-- ────────────────────────────────────────────────────────
-- 6. REFERRALS – tracks each referral relationship
-- ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  friend_name TEXT NOT NULL DEFAULT '',
  qualified BOOLEAN NOT NULL DEFAULT FALSE,
  qualified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(referrer_id, friend_id)
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_referrals" ON referrals
  FOR SELECT USING (referrer_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "service_manage_referrals" ON referrals
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX idx_referrals_referrer ON referrals (referrer_id);
CREATE INDEX idx_referrals_friend ON referrals (friend_id);

-- ────────────────────────────────────────────────────────
-- 7. VOUCHERS – promo/discount codes
-- ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_litres', 'free_delivery')),
  discount_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_order_litres INTEGER DEFAULT 0,
  min_order_amount INTEGER DEFAULT 0,
  max_uses INTEGER,                    -- NULL = unlimited
  uses_per_user INTEGER DEFAULT 1,
  current_uses INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ,             -- NULL = no expiry
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_read_active_vouchers" ON vouchers
  FOR SELECT USING (active = true);

CREATE POLICY "service_manage_vouchers" ON vouchers
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX idx_vouchers_code ON vouchers (code);

-- ────────────────────────────────────────────────────────
-- 8. VOUCHER REDEMPTIONS – tracks who used which voucher
-- ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS voucher_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE voucher_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_redemptions" ON voucher_redemptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "service_manage_redemptions" ON voucher_redemptions
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX idx_redemptions_user ON voucher_redemptions (user_id);
CREATE INDEX idx_redemptions_voucher ON voucher_redemptions (voucher_id);

-- ────────────────────────────────────────────────────────
-- 9. INVOICES – persistent invoice records
-- ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  mpesa_ref TEXT,
  business_name TEXT,           -- for corporate invoices
  business_reg_no TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_invoices" ON invoices
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "service_manage_invoices" ON invoices
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX idx_invoices_user ON invoices (user_id);
CREATE INDEX idx_invoices_order ON invoices (order_id);

-- ────────────────────────────────────────────────────────
-- 10. SEED sample vouchers
-- ────────────────────────────────────────────────────────
INSERT INTO vouchers (code, description, discount_type, discount_value, min_order_litres, max_uses, valid_until) VALUES
  ('WELCOME10', '10% off your first order', 'percentage', 10, 0, NULL, '2027-12-31'),
  ('FREEDELIVERY', 'Free delivery on orders 20L+', 'free_delivery', 0, 20, NULL, '2027-12-31'),
  ('MAJI5L', '5 free litres on orders 20L+', 'free_litres', 5, 20, 500, '2026-12-31')
ON CONFLICT (code) DO NOTHING;

-- ────────────────────────────────────────────────────────
-- 11. Updated triggers
-- ────────────────────────────────────────────────────────

-- updated_at triggers for new tables
CREATE OR REPLACE TRIGGER vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER rewards_updated_at
  BEFORE UPDATE ON rewards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable realtime for vendor orders
ALTER PUBLICATION supabase_realtime ADD TABLE vendors;
ALTER PUBLICATION supabase_realtime ADD TABLE rewards;
-- ============================================================
-- MiMaji Migration 005: Live Mode - Missing columns, notifications, admin RLS
-- Run this in Supabase SQL Editor AFTER migrations 001-004
-- ============================================================

-- ────────────────────────────────────────────────────────
-- 1. ORDERS – add missing columns used by the app
-- ────────────────────────────────────────────────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_code TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'mpesa-app';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address_details JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS scheduled_date TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS scheduled_time TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

-- ────────────────────────────────────────────────────────
-- 2. PROFILES – add missing columns
-- ────────────────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS delivery_pin TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_address TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mpesa_number TEXT DEFAULT '';

-- ────────────────────────────────────────────────────────
-- 3. NOTIFICATIONS TABLE
-- ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'general',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_update_own_notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "service_manage_notifications" ON notifications
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications (created_at DESC);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ────────────────────────────────────────────────────────
-- 4. AUTO-GENERATE NOTIFICATIONS ON ORDER STATUS CHANGE
-- ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  notif_title TEXT;
  notif_message TEXT;
  notif_type TEXT;
  order_display_id TEXT;
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  order_display_id := 'ORD-' || UPPER(LEFT(NEW.id::TEXT, 6));

  CASE NEW.status
    WHEN 'confirmed' THEN
      notif_type := 'order_confirmed';
      notif_title := 'Order Confirmed';
      notif_message := 'Your order ' || order_display_id || ' has been confirmed and is being prepared.';
    WHEN 'out_for_delivery' THEN
      notif_type := 'order_transit';
      notif_title := 'Out for Delivery';
      notif_message := 'Your order ' || order_display_id || ' is on its way! Get your delivery code ready.';
    WHEN 'delivered' THEN
      notif_type := 'order_delivered';
      notif_title := 'Order Delivered';
      notif_message := 'Your order ' || order_display_id || ' has been delivered. Enjoy your fresh water!';
    WHEN 'cancelled' THEN
      notif_type := 'order_cancelled';
      notif_title := 'Order Cancelled';
      notif_message := 'Your order ' || order_display_id || ' has been cancelled.';
    ELSE
      RETURN NEW;
  END CASE;

  INSERT INTO notifications (user_id, type, title, message, order_id)
  VALUES (NEW.customer_id, notif_type, notif_title, notif_message, NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_status_change ON orders;
CREATE TRIGGER on_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_order_status_change();

-- Notification on order creation
CREATE OR REPLACE FUNCTION public.handle_order_placed()
RETURNS TRIGGER AS $$
DECLARE
  order_display_id TEXT;
BEGIN
  order_display_id := 'ORD-' || UPPER(LEFT(NEW.id::TEXT, 6));

  INSERT INTO notifications (user_id, type, title, message, order_id)
  VALUES (
    NEW.customer_id,
    'order_placed',
    'Order Placed',
    'Your order ' || order_display_id || ' has been placed successfully.',
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_placed ON orders;
CREATE TRIGGER on_order_placed
  AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_order_placed();

-- ────────────────────────────────────────────────────────
-- 5. ADMIN RLS POLICIES – admins can access everything
-- ────────────────────────────────────────────────────────

-- Admin access to all orders
CREATE POLICY "admins_full_access_orders" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Admin access to all profiles
CREATE POLICY "admins_read_all_profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "admins_update_all_profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Admin access to vendors
CREATE POLICY "admins_full_access_vendors" ON vendors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Admin access to vendor_locations
CREATE POLICY "admins_full_access_vendor_locations" ON vendor_locations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Admin access to notifications (for debugging)
CREATE POLICY "admins_read_all_notifications" ON notifications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Admin access to payments
CREATE POLICY "admins_full_access_payments" ON payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Admin access to rewards
CREATE POLICY "admins_read_all_rewards" ON rewards
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ────────────────────────────────────────────────────────
-- 6. Allow users to insert their own profiles (for upsert)
-- ────────────────────────────────────────────────────────
CREATE POLICY "users_insert_own_profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ────────────────────────────────────────────────────────
-- 7. Update auth trigger to also set delivery_pin
-- ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  pin TEXT;
BEGIN
  -- Generate a 4-digit delivery PIN from the user ID
  pin := LPAD(CAST(ABS(('x' || LEFT(MD5(NEW.id::TEXT), 8))::BIT(32)::INTEGER) % 10000 AS TEXT), 4, '0');

  INSERT INTO public.profiles (id, phone, full_name, role, delivery_pin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'customer',
    pin
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    phone = COALESCE(NULLIF(EXCLUDED.phone, ''), profiles.phone);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ────────────────────────────────────────────────────────
-- 8. Seed admin user profile (if the admin account exists)
-- Run after admin has signed up with phone 254704476338
-- ────────────────────────────────────────────────────────
-- This updates the admin's role when they exist:
UPDATE profiles SET role = 'admin'
WHERE phone = '254704476338' AND role != 'admin';
-- Fix: "Database error saving new user"
-- Root cause: phone column has UNIQUE + NOT NULL constraints.
-- If the trigger inserts an empty phone, it can violate UNIQUE when multiple
-- users sign up. Also, the email-based auth stores phone in metadata but
-- some paths may not have it set.

-- 1. Make phone column nullable (the phone lives in user metadata anyway)
ALTER TABLE profiles ALTER COLUMN phone DROP NOT NULL;

-- 2. Drop the strict UNIQUE on phone and replace with a partial unique index
--    that only enforces uniqueness on non-empty phones
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_phone_key;
DROP INDEX IF EXISTS profiles_phone_key;
CREATE UNIQUE INDEX profiles_phone_unique ON profiles (phone) WHERE phone IS NOT NULL AND phone != '';

-- 3. Harden the trigger to never fail on insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  pin TEXT;
  user_phone TEXT;
BEGIN
  -- Generate a 4-digit delivery PIN from the user ID
  pin := LPAD(CAST(ABS(('x' || LEFT(MD5(NEW.id::TEXT), 8))::BIT(32)::INTEGER) % 10000 AS TEXT), 4, '0');

  -- Extract phone, falling back to email prefix (which is our fake phone@mimaji.app)
  user_phone := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    REPLACE(SPLIT_PART(COALESCE(NEW.email, ''), '@', 1), '+', '')
  );

  -- Insert profile, gracefully handle conflicts
  INSERT INTO public.profiles (id, phone, full_name, role, delivery_pin)
  VALUES (
    NEW.id,
    NULLIF(user_phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    'customer',
    pin
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    phone = COALESCE(NULLIF(EXCLUDED.phone, ''), profiles.phone),
    delivery_pin = COALESCE(NULLIF(EXCLUDED.delivery_pin, ''), profiles.delivery_pin);

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block user creation even if profile insert fails
  RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Add RLS policy to allow service role and trigger to insert profiles
DROP POLICY IF EXISTS "service_role_insert_profiles" ON profiles;
CREATE POLICY "service_role_insert_profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- 5. Allow users to read all profiles (needed for admin user list)
DROP POLICY IF EXISTS "admin_read_all_profiles" ON profiles;
CREATE POLICY "admin_read_all_profiles" ON profiles
  FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role::text = 'admin')
  );
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
-- ============================================================
-- MiMaji Migration 008: Fix infinite recursion in RLS policies
--
-- Problem: Multiple RLS policies on profiles (and other tables)
-- use EXISTS (SELECT 1 FROM profiles WHERE ...) to check admin role.
-- When any query touches profiles, it triggers the admin SELECT
-- policies which query profiles again → infinite recursion (42P17).
--
-- Fix: Create a SECURITY DEFINER function that bypasses RLS to
-- check if the current user is an admin, then use it everywhere.
-- ============================================================

-- 1. Create a helper function that checks admin status WITHOUT RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Drop all the problematic policies that cause recursion

-- From 005_live_mode.sql
DROP POLICY IF EXISTS "admins_full_access_orders" ON orders;
DROP POLICY IF EXISTS "admins_read_all_profiles" ON profiles;
DROP POLICY IF EXISTS "admins_update_all_profiles" ON profiles;
DROP POLICY IF EXISTS "admins_full_access_vendors" ON vendors;
DROP POLICY IF EXISTS "admins_full_access_vendor_locations" ON vendor_locations;
DROP POLICY IF EXISTS "admins_read_all_notifications" ON notifications;
DROP POLICY IF EXISTS "admins_full_access_payments" ON payments;
DROP POLICY IF EXISTS "admins_read_all_rewards" ON rewards;

-- From 006_fix_auth_trigger.sql
DROP POLICY IF EXISTS "admin_read_all_profiles" ON profiles;

-- 3. Recreate all admin policies using public.is_admin()

CREATE POLICY "admins_full_access_orders" ON orders
  FOR ALL USING (public.is_admin());

CREATE POLICY "admins_read_all_profiles" ON profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "admins_update_all_profiles" ON profiles
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "admins_full_access_vendors" ON vendors
  FOR ALL USING (public.is_admin());

CREATE POLICY "admins_full_access_vendor_locations" ON vendor_locations
  FOR ALL USING (public.is_admin());

CREATE POLICY "admins_read_all_notifications" ON notifications
  FOR SELECT USING (public.is_admin());

CREATE POLICY "admins_full_access_payments" ON payments
  FOR ALL USING (public.is_admin());

CREATE POLICY "admins_read_all_rewards" ON rewards
  FOR SELECT USING (public.is_admin());

-- 4. Fix the combined policy from 006 that also had recursion
DROP POLICY IF EXISTS "admin_read_all_profiles" ON profiles;
-- (Already replaced by admins_read_all_profiles above which covers both
--  own-profile and admin access via is_admin())
-- MiMaji Migration 009: Allow customers to update their own orders
-- Customers need to update order status (e.g. pending_payment → paid) and mpesa_ref

CREATE POLICY "customers_update_own_orders" ON orders
  FOR UPDATE USING (customer_id = auth.uid());
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
