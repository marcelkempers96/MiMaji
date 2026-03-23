import { supabase } from "./supabase";

export interface DeliveryAddressDetails {
  streetName?: string;
  buildingName?: string;
  unitNumber?: string;
  floor?: string;
  locationType?: string;
  postalCode?: string;
  additionalDirections?: string;
  neighbourhood?: string;
  label?: string;
  lat?: number;
  lng?: number;
}

export interface OrderRecord {
  id: string;
  customer_id: string;
  delivery_address: string;
  delivery_address_details: DeliveryAddressDetails | null;
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
  // Scheduling fields
  scheduled_date: string | null;
  scheduled_time: string | null;
  // Delivery confirmation code (4-digit PIN the customer shares with driver)
  delivery_code: string | null;
  // Payment method used for this order
  payment_method: string | null;
  // Brand preference for vendor matching
  brand_preference: string[];
  // Customer info (populated from profiles join)
  customer_name?: string;
  customer_phone?: string;
}

/** Generate a 4-digit delivery confirmation code from the order ID */
export function generateDeliveryCode(orderId: string): string {
  let hash = 0;
  for (let i = 0; i < orderId.length; i++) {
    hash = ((hash << 5) - hash + orderId.charCodeAt(i)) | 0;
  }
  const code = Math.abs(hash) % 10000;
  return code.toString().padStart(4, "0");
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

/** Fetch ALL orders (for admin panel) */
export async function fetchAllOrders(): Promise<OrderRecord[]> {
  if (!hasSupabaseConfig) {
    return getMockOrders().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Join with profiles to get customer name and phone
  const { data, error } = await supabase
    .from("orders")
    .select("*, profiles:customer_id(full_name, phone)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all orders:", error);
    // Fallback: fetch without join if profiles relation fails
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (fallbackError) {
      console.error("Error fetching orders (fallback):", fallbackError);
      return [];
    }
    return (fallbackData || []).map(mapSupabaseOrder);
  }
  return (data || []).map((row: Record<string, unknown>) => {
    const order = mapSupabaseOrder(row);
    // Extract joined profile data
    const profile = row.profiles as { full_name?: string; phone?: string } | null;
    if (profile) {
      order.customer_name = profile.full_name || undefined;
      order.customer_phone = profile.phone || undefined;
    }
    return order;
  });
}

export async function fetchUserOrders(userId: string): Promise<OrderRecord[]> {
  if (!hasSupabaseConfig) {
    try {
      return getMockOrders().filter((o) => o.customer_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (e) {
      console.error("Error reading mock orders:", e);
      return [];
    }
  }

  // Add timeout to prevent hanging forever on network issues
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", userId)
      .order("created_at", { ascending: false })
      .abortSignal(controller.signal);

    clearTimeout(timeout);

    if (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
    return (data || []).map(mapSupabaseOrder);
  } catch (e) {
    clearTimeout(timeout);
    console.error("Error fetching orders:", e);
    return [];
  }
}

function mapSupabaseOrder(row: Record<string, unknown>): OrderRecord {
  return {
    id: row.id as string,
    customer_id: row.customer_id as string,
    delivery_address: (row.delivery_address as string) || "",
    delivery_address_details: (row.delivery_address_details as DeliveryAddressDetails) || null,
    quantity: Number(row.quantity) || 0,
    price_total: Number(row.price_total) || 0,
    status: (row.status as string) || "pending_payment",
    mpesa_ref: (row.mpesa_ref as string) || null,
    product_name: (row.product_name as string) || null,
    order_items: (row.order_items as OrderRecord["order_items"]) || [],
    estimated_delivery_minutes: row.estimated_delivery_minutes != null ? Number(row.estimated_delivery_minutes) : null,
    created_at: (row.created_at as string) || new Date().toISOString(),
    updated_at: (row.updated_at as string) || new Date().toISOString(),
    vendor_id: (row.vendor_id as string) || null,
    vendor_name: (row.vendor_name as string) || null,
    vendor_location: (row.vendor_location as string) || null,
    vendors_tried: (row.vendors_tried as string[]) || [],
    current_vendor_offer: (row.current_vendor_offer as string) || null,
    scheduled_date: (row.scheduled_date as string) || null,
    scheduled_time: (row.scheduled_time as string) || null,
    delivery_code: (row.delivery_code as string) || null,
    payment_method: (row.payment_method as string) || null,
    brand_preference: (row.brand_preference as string[]) || [],
  };
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
  return data ? mapSupabaseOrder(data) : null;
}

export async function createOrder(params: {
  customerId: string;
  deliveryAddress: string;
  deliveryAddressDetails?: DeliveryAddressDetails | null;
  quantity: number;
  priceTotal: number;
  productName: string;
  orderItems: Array<{ name: string; quantity: number; price: number }>;
  scheduledDate?: string;
  scheduledTime?: string;
  /** Optional user-level delivery PIN to use instead of auto-generated one */
  deliveryCode?: string;
  /** Payment method: stk-push, mpesa-app, or cash */
  paymentMethod?: string;
  /** Brand preference IDs for vendor matching */
  brandPreference?: string[];
  /** Initial order status (defaults to pending_payment) */
  initialStatus?: string;
  /** M-PESA reference code if already known */
  mpesaRef?: string;
  /** Customer name for admin visibility */
  customerName?: string;
  /** Customer phone for admin visibility */
  customerPhone?: string;
}): Promise<{ orderId: string | null; error: string | null }> {
  const status = params.initialStatus || "pending_payment";

  if (!hasSupabaseConfig) {
    const orderId = crypto.randomUUID();
    const now = new Date().toISOString();
    const order: OrderRecord = {
      id: orderId,
      customer_id: params.customerId,
      delivery_address: params.deliveryAddress,
      delivery_address_details: params.deliveryAddressDetails || null,
      quantity: Math.min(params.quantity, 10),
      price_total: params.priceTotal,
      product_name: params.productName,
      order_items: params.orderItems,
      status,
      mpesa_ref: params.mpesaRef || null,
      estimated_delivery_minutes: null,
      created_at: now,
      updated_at: now,
      vendor_id: null,
      vendor_name: null,
      vendor_location: null,
      vendors_tried: [],
      current_vendor_offer: null,
      scheduled_date: params.scheduledDate || null,
      scheduled_time: params.scheduledTime || null,
      delivery_code: params.deliveryCode || generateDeliveryCode(orderId),
      payment_method: params.paymentMethod || null,
      brand_preference: params.brandPreference || [],
      customer_name: params.customerName || undefined,
      customer_phone: params.customerPhone || undefined,
    };
    const orders = getMockOrders();
    orders.push(order);
    saveMockOrders(orders);

    // Verify the order was actually persisted
    const verify = getMockOrders();
    if (!verify.find((o) => o.id === orderId)) {
      // Retry save
      verify.push(order);
      saveMockOrders(verify);
    }

    return { orderId, error: null };
  }

  // Add timeout to prevent hanging forever on network issues
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    // Ensure the customer has a profile (foreign key requirement)
    const { data: profile, error: profileCheckErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", params.customerId)
      .maybeSingle();

    if (!profile || profileCheckErr) {
      // Profile missing or unreadable — create a minimal one so the order can proceed
      const { error: profileErr } = await supabase
        .from("profiles")
        .upsert({ id: params.customerId, role: "customer" }, { onConflict: "id" });
      if (profileErr) {
        console.error("Error ensuring profile exists:", profileErr);
        clearTimeout(timeout);
        return { orderId: null, error: "Could not verify your account. Please log out and log back in." };
      }

      // Verify the profile was actually created (upsert can silently fail under RLS)
      const { data: verifyProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", params.customerId)
        .maybeSingle();

      if (!verifyProfile) {
        console.error("Profile still missing after upsert for customer:", params.customerId);
        clearTimeout(timeout);
        return { orderId: null, error: "Could not verify your account. Please log out and log back in." };
      }
    }

    // Generate a temporary ID for the delivery code, then use the real DB id
    const tempId = crypto.randomUUID();
    const { data, error } = await supabase
      .from("orders")
      .insert({
        customer_id: params.customerId,
        delivery_address: params.deliveryAddress,
        delivery_address_details: params.deliveryAddressDetails || null,
        quantity: Math.min(params.quantity, 10),
        price_total: params.priceTotal,
        product_name: params.productName,
        order_items: params.orderItems,
        status,
        mpesa_ref: params.mpesaRef || null,
        vendor_id: null,
        vendor_name: null,
        vendor_location: null,
        vendors_tried: [],
        current_vendor_offer: null,
        scheduled_date: params.scheduledDate || null,
        scheduled_time: params.scheduledTime || null,
        delivery_code: generateDeliveryCode(tempId),
        payment_method: params.paymentMethod || null,
        brand_preference: params.brandPreference || [],
        customer_name: params.customerName || "",
        customer_phone: params.customerPhone || "",
      })
      .select("id")
      .single();

    clearTimeout(timeout);

    if (error) {
      console.error("Error creating order:", error);
      // Return a user-friendly message instead of raw DB errors
      if (error.message?.includes("foreign key constraint")) {
        return { orderId: null, error: "Could not verify your account. Please log out and log back in." };
      }
      return { orderId: null, error: "Failed to place order. Please try again." };
    }
    return { orderId: data.id, error: null };
  } catch (e) {
    clearTimeout(timeout);
    console.error("Order creation failed:", e);
    return { orderId: null, error: "Connection issue. Please check your internet and try again." };
  }
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
export function mapOrderStatus(dbStatus: string): "Processing" | "Confirmed" | "In Transit" | "Delivered" | "Cancelled" {
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
      return "Cancelled";
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

/** Format order date with time, e.g. "21 Mar 2026, 14:32" */
export function formatOrderDateTime(isoDate: string): string {
  const d = new Date(isoDate);
  const day = d.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const hrs = d.getHours().toString().padStart(2, "0");
  const mins = d.getMinutes().toString().padStart(2, "0");
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}, ${hrs}:${mins}`;
}

export function formatOrderId(uuid: string): string {
  return `ORD-${uuid.slice(0, 6).toUpperCase()}`;
}
