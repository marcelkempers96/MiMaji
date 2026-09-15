-- ────────────────────────────────────────────────────────
-- WATERFALL2026 voucher + per-order discount columns
--
-- Safe to run more than once.
-- ────────────────────────────────────────────────────────

-- 1. Orders had nowhere to record a discount, so the customer's order view
--    and the invoice could not tell a free-delivery order from a normal one.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS voucher_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount INTEGER NOT NULL DEFAULT 0;

-- 2. The voucher itself. Checkout looks this row up by code, so without it
--    WATERFALL2026 is simply rejected as an invalid code.
--    DO UPDATE rather than DO NOTHING so re-running repairs a row that was
--    left inactive or expired.
INSERT INTO vouchers (code, description, discount_type, discount_value,
                      min_order_litres, min_order_amount, max_uses,
                      uses_per_user, valid_until, active)
VALUES ('WATERFALL2026', 'Free delivery on your order', 'free_delivery', 0,
        0, 0, NULL,
        1, '2026-12-31 23:59:59+00', TRUE)
ON CONFLICT (code) DO UPDATE SET
  description      = EXCLUDED.description,
  discount_type    = EXCLUDED.discount_type,
  min_order_litres = EXCLUDED.min_order_litres,
  min_order_amount = EXCLUDED.min_order_amount,
  valid_until      = EXCLUDED.valid_until,
  active           = TRUE;

-- 3. Confirm the result.
SELECT code, discount_type, active, valid_until FROM vouchers WHERE code = 'WATERFALL2026';
