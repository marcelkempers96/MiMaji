import { supabase } from "./supabase";
import { OrderRecord, updateOrder } from "./orders";

const hasSupabaseConfig =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

const MOCK_ORDERS_KEY = "mimaji_mock_orders";

function getMockOrders(): OrderRecord[] {
  try {
    const raw = localStorage.getItem(MOCK_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveMockOrders(orders: OrderRecord[]) {
  try { localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(orders)); } catch {}
}

// ── Mock vendor list (matches vendors page) ──
export interface VendorInfo {
  id: string;
  name: string;
  area: string;
  distance: string;
  rating: number;
  reviews: number;
  hours: string;
  products: string[];
}

export const MOCK_VENDORS: VendorInfo[] = [
  { id: "v1", name: "AquaPure Kilimani", area: "Kilimani, Nairobi", distance: "0.8 km", rating: 4.8, reviews: 156, hours: "6AM - 9PM", products: ["20L Hard", "20L Soft", "10L Soft", "5L Soft"] },
  { id: "v2", name: "WaterPoint Westlands", area: "Westlands, Nairobi", distance: "1.2 km", rating: 4.6, reviews: 89, hours: "7AM - 8PM", products: ["20L Hard", "20L Soft", "10L Soft"] },
  { id: "v3", name: "CleanWater Hub", area: "Lavington, Nairobi", distance: "2.1 km", rating: 4.9, reviews: 234, hours: "6AM - 10PM", products: ["20L Hard", "20L Soft", "10L Soft", "5L Soft"] },
  { id: "v4", name: "Maji Fresh Karen", area: "Karen, Nairobi", distance: "5.3 km", rating: 4.7, reviews: 67, hours: "7AM - 9PM", products: ["20L Hard", "20L Soft"] },
  { id: "v5", name: "PureDrops CBD", area: "CBD, Nairobi", distance: "3.8 km", rating: 4.5, reviews: 112, hours: "6AM - 8PM", products: ["20L Soft", "10L Soft", "5L Soft"] },
];

// ── Fetch orders for vendor portal ──
export async function fetchVendorOrders(vendorId: string): Promise<OrderRecord[]> {
  if (!hasSupabaseConfig) {
    // In mock mode, show orders that are either:
    // - Being offered to this vendor (current_vendor_offer matches)
    // - Already accepted by this vendor (vendor_id matches)
    // - Still unassigned with status "paid" (for demo purposes, show all paid orders)
    return getMockOrders()
      .filter((o) =>
        o.current_vendor_offer === vendorId ||
        o.vendor_id === vendorId ||
        (o.status === "paid" && !o.vendor_id && !o.current_vendor_offer)
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching vendor orders:", error);
    return [];
  }
  return data || [];
}

export async function updateVendorOrderStatus(orderId: string, status: string) {
  if (!hasSupabaseConfig) {
    const orders = getMockOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx !== -1) {
      orders[idx].status = status;
      orders[idx].updated_at = new Date().toISOString();
      saveMockOrders(orders);
    }
    return;
  }

  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) {
    console.error("Error updating order status:", error);
  }
}

export interface VendorStats {
  todayOrders: number;
  todayRevenue: number;
  totalOrders: number;
  totalRevenue: number;
  avgDeliveryMinutes: number;
}

export async function fetchVendorStats(vendorId: string, orders: OrderRecord[]): Promise<VendorStats> {
  const today = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter((o) => o.created_at.startsWith(today));

  return {
    todayOrders: todayOrders.length,
    todayRevenue: todayOrders.reduce((sum, o) => sum + o.price_total, 0),
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, o) => sum + o.price_total, 0),
    avgDeliveryMinutes: orders.length > 0 ? 28 : 0,
  };
}

// ── Vendor Routing Logic ──

/**
 * Assign an order to the next available vendor.
 * Goes through MOCK_VENDORS in order, skipping any in vendors_tried.
 * Sets current_vendor_offer to the chosen vendor's ID.
 */
export async function assignOrderToVendor(orderId: string): Promise<{ vendorId: string; vendorName: string } | null> {
  if (!hasSupabaseConfig) {
    const orders = getMockOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return null;

    const order = orders[idx];
    const triedIds = order.vendors_tried || [];

    // Find the next vendor that hasn't been tried
    const nextVendor = MOCK_VENDORS.find((v) => !triedIds.includes(v.id));
    if (!nextVendor) {
      // All vendors have been tried — no one available
      return null;
    }

    orders[idx].current_vendor_offer = nextVendor.id;
    orders[idx].updated_at = new Date().toISOString();
    saveMockOrders(orders);

    return { vendorId: nextVendor.id, vendorName: nextVendor.name };
  }

  // Supabase version would query available vendors — for now just update the order
  return null;
}

/**
 * Vendor accepts an order: sets vendor info, ETA, and status to "confirmed".
 */
export async function acceptOrder(
  orderId: string,
  vendorId: string,
  estimatedMinutes: number
): Promise<void> {
  const vendor = MOCK_VENDORS.find((v) => v.id === vendorId);
  const vendorName = vendor?.name || "Unknown Vendor";
  const vendorLocation = vendor?.area || "Nairobi";

  await updateOrder(orderId, {
    vendor_id: vendorId,
    vendor_name: vendorName,
    vendor_location: vendorLocation,
    estimated_delivery_minutes: estimatedMinutes,
    current_vendor_offer: null,
    status: "confirmed",
  });
}

/**
 * Vendor rejects an order: adds vendor to vendors_tried, clears current_vendor_offer,
 * then attempts to assign to the next vendor.
 */
export async function rejectOrder(orderId: string, vendorId: string): Promise<{ nextVendor: string | null }> {
  if (!hasSupabaseConfig) {
    const orders = getMockOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return { nextVendor: null };

    const order = orders[idx];
    const triedIds = order.vendors_tried || [];
    if (!triedIds.includes(vendorId)) {
      triedIds.push(vendorId);
    }
    orders[idx].vendors_tried = triedIds;
    orders[idx].current_vendor_offer = null;
    orders[idx].updated_at = new Date().toISOString();
    saveMockOrders(orders);

    // Try to assign to next vendor
    const result = await assignOrderToVendor(orderId);
    return { nextVendor: result?.vendorName || null };
  }

  // Supabase version
  return { nextVendor: null };
}
