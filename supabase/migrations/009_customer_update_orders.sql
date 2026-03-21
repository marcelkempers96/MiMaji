-- MiMaji Migration 009: Allow customers to update their own orders
-- Customers need to update order status (e.g. pending_payment → paid) and mpesa_ref

CREATE POLICY "customers_update_own_orders" ON orders
  FOR UPDATE USING (customer_id = auth.uid());
