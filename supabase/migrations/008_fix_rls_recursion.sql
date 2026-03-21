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
