/**
 * MiMaji Voucher System
 *
 * Supports: percentage, fixed_amount, free_litres, free_delivery discount types.
 * Dual-mode: localStorage (mock) and Supabase backends.
 */

import { supabase } from "./supabase";

const hasSupabaseConfig =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

export interface Voucher {
  id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed_amount" | "free_litres" | "free_delivery";
  discountValue: number;
  minOrderLitres: number;
  minOrderAmount: number;
  maxUses: number | null;
  usesPerUser: number;
  currentUses: number;
  validFrom: string;
  validUntil: string | null;
  active: boolean;
}

export interface VoucherValidation {
  valid: boolean;
  voucher: Voucher | null;
  error?: string;
}

// ── Mock vouchers (localStorage mode) ──

const MOCK_VOUCHERS_KEY = "mimaji_mock_vouchers";
const MOCK_REDEMPTIONS_KEY = "mimaji_mock_redemptions";

interface MockRedemption {
  voucherId: string;
  userId: string;
  orderId: string;
  redeemedAt: string;
}

function getDefaultMockVouchers(): Voucher[] {
  return [
    {
      id: "voucher-1",
      code: "WELCOME10",
      description: "10% off your first order",
      discountType: "percentage",
      discountValue: 10,
      minOrderLitres: 0,
      minOrderAmount: 0,
      maxUses: null,
      usesPerUser: 1,
      currentUses: 0,
      validFrom: "2024-01-01T00:00:00Z",
      validUntil: "2027-12-31T23:59:59Z",
      active: true,
    },
    {
      id: "voucher-2",
      code: "FREEDELIVERY",
      description: "Free delivery on orders 20L+",
      discountType: "free_delivery",
      discountValue: 0,
      minOrderLitres: 20,
      minOrderAmount: 0,
      maxUses: null,
      usesPerUser: 1,
      currentUses: 0,
      validFrom: "2024-01-01T00:00:00Z",
      validUntil: "2027-12-31T23:59:59Z",
      active: true,
    },
    {
      id: "voucher-3",
      code: "MAJI5L",
      description: "5 free litres on orders 20L+",
      discountType: "free_litres",
      discountValue: 5,
      minOrderLitres: 20,
      minOrderAmount: 0,
      maxUses: 500,
      usesPerUser: 1,
      currentUses: 0,
      validFrom: "2024-01-01T00:00:00Z",
      validUntil: "2026-12-31T23:59:59Z",
      active: true,
    },
  ];
}

function loadMockVouchers(): Voucher[] {
  try {
    const raw = localStorage.getItem(MOCK_VOUCHERS_KEY);
    if (raw) return JSON.parse(raw);
    const defaults = getDefaultMockVouchers();
    localStorage.setItem(MOCK_VOUCHERS_KEY, JSON.stringify(defaults));
    return defaults;
  } catch {
    return getDefaultMockVouchers();
  }
}

function loadMockRedemptions(): MockRedemption[] {
  try {
    const raw = localStorage.getItem(MOCK_REDEMPTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMockRedemptions(redemptions: MockRedemption[]) {
  try {
    localStorage.setItem(MOCK_REDEMPTIONS_KEY, JSON.stringify(redemptions));
  } catch {}
}

// ── Public API ──

export async function validateVoucher(
  code: string,
  userId: string,
  orderLitres: number,
  orderAmount: number
): Promise<VoucherValidation> {
  if (!hasSupabaseConfig) {
    return validateVoucherMock(code, userId, orderLitres, orderAmount);
  }
  return validateVoucherSupabase(code, userId, orderLitres, orderAmount);
}

function validateVoucherMock(
  code: string,
  userId: string,
  orderLitres: number,
  orderAmount: number
): VoucherValidation {
  const vouchers = loadMockVouchers();
  const upper = code.toUpperCase().trim();
  const voucher = vouchers.find((v) => v.code === upper && v.active);

  if (!voucher) return { valid: false, voucher: null, error: "Invalid voucher code" };

  const now = new Date();
  if (voucher.validUntil && new Date(voucher.validUntil) < now) {
    return { valid: false, voucher: null, error: "This voucher has expired" };
  }
  if (new Date(voucher.validFrom) > now) {
    return { valid: false, voucher: null, error: "This voucher is not yet active" };
  }
  if (voucher.maxUses !== null && voucher.currentUses >= voucher.maxUses) {
    return { valid: false, voucher: null, error: "This voucher has reached its usage limit" };
  }
  if (voucher.minOrderLitres > 0 && orderLitres < voucher.minOrderLitres) {
    return { valid: false, voucher: null, error: `Minimum ${voucher.minOrderLitres}L required for this voucher` };
  }
  if (voucher.minOrderAmount > 0 && orderAmount < voucher.minOrderAmount) {
    return { valid: false, voucher: null, error: `Minimum KES ${voucher.minOrderAmount} required for this voucher` };
  }

  // Check per-user limit
  const redemptions = loadMockRedemptions();
  const userUses = redemptions.filter((r) => r.voucherId === voucher.id && r.userId === userId).length;
  if (userUses >= voucher.usesPerUser) {
    return { valid: false, voucher: null, error: "You have already used this voucher" };
  }

  return { valid: true, voucher };
}

async function validateVoucherSupabase(
  code: string,
  userId: string,
  orderLitres: number,
  orderAmount: number
): Promise<VoucherValidation> {
  const { data: voucher, error } = await supabase
    .from("vouchers")
    .select("*")
    .eq("code", code.toUpperCase().trim())
    .eq("active", true)
    .single();

  if (error || !voucher) return { valid: false, voucher: null, error: "Invalid voucher code" };

  const now = new Date();
  if (voucher.valid_until && new Date(voucher.valid_until) < now) {
    return { valid: false, voucher: null, error: "This voucher has expired" };
  }
  if (new Date(voucher.valid_from) > now) {
    return { valid: false, voucher: null, error: "This voucher is not yet active" };
  }
  if (voucher.max_uses !== null && voucher.current_uses >= voucher.max_uses) {
    return { valid: false, voucher: null, error: "This voucher has reached its usage limit" };
  }
  if (voucher.min_order_litres > 0 && orderLitres < voucher.min_order_litres) {
    return { valid: false, voucher: null, error: `Minimum ${voucher.min_order_litres}L required for this voucher` };
  }
  if (voucher.min_order_amount > 0 && orderAmount < voucher.min_order_amount) {
    return { valid: false, voucher: null, error: `Minimum KES ${voucher.min_order_amount} required for this voucher` };
  }

  // Check per-user limit
  const { count } = await supabase
    .from("voucher_redemptions")
    .select("*", { count: "exact", head: true })
    .eq("voucher_id", voucher.id)
    .eq("user_id", userId);

  if ((count ?? 0) >= voucher.uses_per_user) {
    return { valid: false, voucher: null, error: "You have already used this voucher" };
  }

  const mapped: Voucher = {
    id: voucher.id,
    code: voucher.code,
    description: voucher.description,
    discountType: voucher.discount_type,
    discountValue: Number(voucher.discount_value),
    minOrderLitres: voucher.min_order_litres || 0,
    minOrderAmount: voucher.min_order_amount || 0,
    maxUses: voucher.max_uses,
    usesPerUser: voucher.uses_per_user,
    currentUses: voucher.current_uses,
    validFrom: voucher.valid_from,
    validUntil: voucher.valid_until,
    active: voucher.active,
  };

  return { valid: true, voucher: mapped };
}

export async function redeemVoucher(
  voucherId: string,
  userId: string,
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  if (!hasSupabaseConfig) {
    return redeemVoucherMock(voucherId, userId, orderId);
  }
  return redeemVoucherSupabase(voucherId, userId, orderId);
}

function redeemVoucherMock(
  voucherId: string,
  userId: string,
  orderId: string
): { success: boolean; error?: string } {
  const redemptions = loadMockRedemptions();
  redemptions.push({
    voucherId,
    userId,
    orderId,
    redeemedAt: new Date().toISOString(),
  });
  saveMockRedemptions(redemptions);

  // Increment usage count
  const vouchers = loadMockVouchers();
  const idx = vouchers.findIndex((v) => v.id === voucherId);
  if (idx !== -1) {
    vouchers[idx].currentUses += 1;
    try {
      localStorage.setItem(MOCK_VOUCHERS_KEY, JSON.stringify(vouchers));
    } catch {}
  }

  return { success: true };
}

async function redeemVoucherSupabase(
  voucherId: string,
  userId: string,
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  const { error: insertError } = await supabase.from("voucher_redemptions").insert({
    voucher_id: voucherId,
    user_id: userId,
    order_id: orderId,
  });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  // Increment usage count
  const { data: voucher } = await supabase
    .from("vouchers")
    .select("current_uses")
    .eq("id", voucherId)
    .single();

  if (voucher) {
    await supabase
      .from("vouchers")
      .update({ current_uses: voucher.current_uses + 1 })
      .eq("id", voucherId);
  }

  return { success: true };
}

export function calculateDiscount(
  voucher: Voucher,
  orderAmount: number
): { discountAmount: number; freeDelivery: boolean; freeLitres: number } {
  switch (voucher.discountType) {
    case "percentage":
      return {
        discountAmount: Math.round(orderAmount * (voucher.discountValue / 100)),
        freeDelivery: false,
        freeLitres: 0,
      };
    case "fixed_amount":
      return {
        discountAmount: Math.min(voucher.discountValue, orderAmount),
        freeDelivery: false,
        freeLitres: 0,
      };
    case "free_litres":
      return {
        discountAmount: 0,
        freeDelivery: false,
        freeLitres: voucher.discountValue,
      };
    case "free_delivery":
      return {
        discountAmount: 0,
        freeDelivery: true,
        freeLitres: 0,
      };
    default:
      return { discountAmount: 0, freeDelivery: false, freeLitres: 0 };
  }
}
