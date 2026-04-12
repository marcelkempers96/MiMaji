/**
 * Owner-facing WhatsApp notifications via CallMeBot (free, no account).
 *
 * Setup (one-time, already done for MiMaji):
 *   1. Save +34 644 78 33 97 as a contact on the owner's phone.
 *   2. Send that contact the WhatsApp message:
 *        "I allow callmebot to send me messages"
 *   3. CallMeBot replies with an API key. Store it alongside the owner phone.
 *
 * This file is server-only. Never import it from a client component — it
 * embeds fallback credentials and should only run inside API routes.
 *
 * Env var overrides (optional):
 *   - OWNER_WHATSAPP_PHONE   e.g. "254704476338" (international, no "+")
 *   - CALLMEBOT_API_KEY      the key CallMeBot sent via WhatsApp
 */
import { createServiceClient } from "@/lib/supabase";

// Fallback values are the values the owner activated on 2026-04-08.
// They only allow messages to 254704476338, so exposing them is low-risk,
// but env vars take precedence if set (for rotation).
const OWNER_PHONE = process.env.OWNER_WHATSAPP_PHONE || "254704476338";
const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY || "2398280";

/**
 * Send a plain-text WhatsApp message to the owner via CallMeBot.
 * Fire-and-forget safe — all errors are caught and logged, never thrown.
 */
export async function sendOwnerWhatsApp(message: string): Promise<void> {
  if (!OWNER_PHONE || !CALLMEBOT_API_KEY) {
    console.warn("[whatsapp] CallMeBot not configured — skipping owner notification");
    return;
  }

  try {
    const url =
      `https://api.callmebot.com/whatsapp.php` +
      `?phone=${encodeURIComponent(OWNER_PHONE)}` +
      `&text=${encodeURIComponent(message)}` +
      `&apikey=${encodeURIComponent(CALLMEBOT_API_KEY)}`;

    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[whatsapp] CallMeBot error:", res.status, body.slice(0, 200));
    }
  } catch (e) {
    console.error("[whatsapp] sendOwnerWhatsApp failed:", e);
  }
}

interface OrderItem {
  name: string;
  quantity: number;
  price?: number;
}

interface OrderRow {
  id: string;
  status?: string | null;
  quantity?: number | null;
  price_total?: number | null;
  order_items?: OrderItem[] | null;
  delivery_address?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  payment_method?: string | null;
  mpesa_ref?: string | null;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
}

function formatOrderMessage(order: OrderRow): string {
  const shortId = String(order.id).slice(0, 8).toUpperCase();

  const items =
    Array.isArray(order.order_items) && order.order_items.length > 0
      ? order.order_items
          .map((i) => `${i.quantity}x ${i.name}`)
          .join(", ")
      : `${order.quantity || 1} item(s)`;

  const total = Number(order.price_total || 0).toLocaleString("en-KE");

  const payment =
    order.payment_method === "cash"
      ? "Cash on Delivery"
      : order.payment_method === "mpesa-app"
      ? "M-PESA (manual code)"
      : order.payment_method === "stk-push"
      ? "M-PESA STK Push"
      : order.payment_method || "—";

  const statusLabel =
    order.status === "paid"
      ? "PAID"
      : order.status === "confirmed"
      ? "CONFIRMED"
      : order.status === "pending_payment"
      ? "PENDING PAYMENT"
      : String(order.status || "").toUpperCase();

  const lines = [
    `🚰 NEW MIMAJI ORDER`,
    `#${shortId} — ${statusLabel}`,
    ``,
    `Items: ${items}`,
    `Total: KES ${total}`,
    `Payment: ${payment}`,
    ``,
    `Customer: ${order.customer_name || "—"}`,
    `Phone: ${order.customer_phone || "—"}`,
    `Address: ${order.delivery_address || "—"}`,
  ];

  if (order.scheduled_date) {
    const when = order.scheduled_time
      ? `${order.scheduled_date} at ${order.scheduled_time}`
      : order.scheduled_date;
    lines.push(`Scheduled: ${when}`);
  }

  if (order.mpesa_ref) {
    lines.push(`M-PESA Ref: ${order.mpesa_ref}`);
  }

  lines.push(``, `Open portal: https://mimaji.co.ke/vendor-portal`);

  return lines.join("\n");
}

/**
 * Look up an order via the Supabase service client and send a formatted
 * WhatsApp notification to the owner. Safe to fire-and-forget.
 */
export async function notifyOwnerOfNewOrder(orderId: string): Promise<void> {
  if (!orderId) return;

  try {
    const sb = createServiceClient();
    const { data: order, error } = await sb
      .from("orders")
      .select(
        "id, status, quantity, price_total, order_items, delivery_address, customer_name, customer_phone, payment_method, mpesa_ref, scheduled_date, scheduled_time"
      )
      .eq("id", orderId)
      .single();

    if (error || !order) {
      console.error(
        "[whatsapp] Could not load order for notification:",
        orderId,
        error?.message
      );
      return;
    }

    await sendOwnerWhatsApp(formatOrderMessage(order as OrderRow));
  } catch (e) {
    console.error("[whatsapp] notifyOwnerOfNewOrder failed:", e);
  }
}
