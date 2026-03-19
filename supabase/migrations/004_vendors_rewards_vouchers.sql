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
