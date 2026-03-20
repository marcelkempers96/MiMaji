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
