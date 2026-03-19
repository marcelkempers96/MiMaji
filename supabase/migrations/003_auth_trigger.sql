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
