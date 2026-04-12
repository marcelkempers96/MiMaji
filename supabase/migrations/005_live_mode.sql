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
