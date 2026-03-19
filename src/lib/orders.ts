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
}

export async function fetchUserOrders(userId: string): Promise<OrderRecord[]> {
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
