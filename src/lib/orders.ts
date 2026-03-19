import { supabase } from "./supabase";

export interface OrderRecord {
  id: string;
  customer_id: string;
  delivery_address: string;
  quantity: number;
  price_total: number;
  status: string;
  mpesa_ref: string | null;
  product_name: string | null;
  order_items: Array<{ name: string; quantity: number; price: number }>;
  estimated_delivery_minutes: number | null;
  created_at: string;
  updated_at: string;
  // Vendor assignment fields
  vendor_id: string | null;
  vendor_name: string | null;
  vendor_location: string | null;
  vendors_tried: string[];
  current_vendor_offer: string | null;
}

// Check if real Supabase credentials are configured
const hasSupabaseConfig =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

// ── Local storage mock for orders when Supabase is not configured ──
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

export async function fetchUserOrders(userId: string): Promise<OrderRecord[]> {
  if (!hasSupabaseConfig) {
    return getMockOrders().filter((o) => o.customer_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
  return data || [];
}

export async function fetchOrderById(orderId: string): Promise<OrderRecord | null> {
  if (!hasSupabaseConfig) {
    return getMockOrders().find((o) => o.id === orderId) || null;
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error) {
    console.error("Error fetching order:", error);
    return null;
  }
  return data;
}

export async function createOrder(params: {
  customerId: string;
  deliveryAddress: string;
  quantity: number;
  priceTotal: number;
  productName: string;
  orderItems: Array<{ name: string; quantity: number; price: number }>;
}): Promise<{ orderId: string | null; error: string | null }> {
  if (!hasSupabaseConfig) {
    const orderId = crypto.randomUUID();
    const now = new Date().toISOString();
    const order: OrderRecord = {
      id: orderId,
      customer_id: params.customerId,
      delivery_address: params.deliveryAddress,
      quantity: Math.min(params.quantity, 10),
      price_total: params.priceTotal,
      product_name: params.productName,
      order_items: params.orderItems,
      status: "pending_payment",
      mpesa_ref: null,
      estimated_delivery_minutes: null,
      created_at: now,
      updated_at: now,
      vendor_id: null,
      vendor_name: null,
      vendor_location: null,
      vendors_tried: [],
      current_vendor_offer: null,
    };
    const orders = getMockOrders();
    orders.push(order);
    saveMockOrders(orders);
    return { orderId, error: null };
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_id: params.customerId,
      delivery_address: params.deliveryAddress,
      quantity: Math.min(params.quantity, 10),
      price_total: params.priceTotal,
      product_name: params.productName,
      order_items: params.orderItems,
      status: "pending_payment",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating order:", error);
    return { orderId: null, error: error.message };
  }
  return { orderId: data.id, error: null };
}

export async function updateOrderStatus(orderId: string, status: string, mpesaRef?: string) {
  if (!hasSupabaseConfig) {
    const orders = getMockOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx !== -1) {
      orders[idx].status = status;
      if (mpesaRef) orders[idx].mpesa_ref = mpesaRef;
      orders[idx].updated_at = new Date().toISOString();
      saveMockOrders(orders);
    }
    return;
  }

  const updates: Record<string, unknown> = { status };
  if (mpesaRef) updates.mpesa_ref = mpesaRef;

  const { error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", orderId);

  if (error) {
    console.error("Error updating order:", error);
  }
}

export async function updateOrder(orderId: string, updates: Partial<OrderRecord>) {
  if (!hasSupabaseConfig) {
    const orders = getMockOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx !== -1) {
      Object.assign(orders[idx], updates, { updated_at: new Date().toISOString() });
      saveMockOrders(orders);
    }
    return;
  }
  const { error } = await supabase
    .from("orders")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (error) { console.error("Error updating order:", error); }
}

// Map DB status to display status
export function mapOrderStatus(dbStatus: string): "Processing" | "Confirmed" | "In Transit" | "Delivered" {
  switch (dbStatus) {
    case "pending_payment":
    case "paid":
      return "Processing";
    case "confirmed":
      return "Confirmed";
    case "out_for_delivery":
      return "In Transit";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Delivered"; // show as complete
    default:
      return "Processing";
  }
}

export function formatOrderDate(isoDate: string): string {
  const d = new Date(isoDate);
  const day = d.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatOrderId(uuid: string): string {
  return `ORD-${uuid.slice(0, 6).toUpperCase()}`;
}
