import { supabase } from "./supabase";
import { OrderRecord } from "./orders";

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

export async function fetchVendorOrders(vendorId: string): Promise<OrderRecord[]> {
  if (!hasSupabaseConfig) {
    // In mock mode, vendors can see all orders
    return getMockOrders().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
