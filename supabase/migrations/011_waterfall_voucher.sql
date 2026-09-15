-- ────────────────────────────────────────────────────────
-- WATERFALL2026 voucher + per-order discount columns
-- ────────────────────────────────────────────────────────

-- Orders had nowhere to record a discount, so the customer's order view and
-- the invoice could not tell a free-delivery order from a normal one.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS voucher_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount INTEGER NOT NULL DEFAULT 0;

INSERT INTO vouchers (code, description, discount_type, discount_value, min_order_litres, max_uses, valid_until) VALUES
  ('WATERFALL2026', 'Free delivery on your order', 'free_delivery', 0, 0, NULL, '2026-12-31')
ON CONFLICT (code) DO NOTHING;
