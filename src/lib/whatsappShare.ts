/**
 * Client-safe helpers for building WhatsApp share links so customers can
 * forward their order details to the MiMaji owner on +254 704 476 338.
 *
 * This file is safe to import from client components — it contains no
 * secrets or server-only code. For the server-side CallMeBot notifications,
 * see `src/lib/whatsapp.ts`.
 */

/** Owner WhatsApp number in international format, no "+". */
export const OWNER_WHATSAPP_NUMBER = "254704476338";

export interface ShareOrderItem {
  name: string;
  quantity: number;
  price?: number;
}

export interface ShareOrderParams {
  orderId: string;
  customerName?: string | null;
  customerPhone?: string | null;
  items: ShareOrderItem[];
  total: number;
  address: string;
  /** ISO string, Date, or undefined — defaults to now. */
  timestamp?: string | Date | null;
  paymentMethod?: string | null;
  mpesaRef?: string | null;
}

function formatTimestamp(value: string | Date | null | undefined): string {
  const d =
    value instanceof Date
      ? value
      : value
      ? new Date(value)
      : new Date();
  if (Number.isNaN(d.getTime())) return "—";
  try {
    return d.toLocaleString("en-KE", {
      timeZone: "Africa/Nairobi",
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return d.toISOString();
  }
}

function shortOrderId(orderId: string): string {
  return String(orderId).slice(0, 8).toUpperCase();
}

/**
 * Build the plain-text WhatsApp message body for an order.
 * Customers paste this into WhatsApp alongside their M-PESA screenshot.
 */
export function buildWhatsAppOrderMessage(params: ShareOrderParams): string {
  const timestamp = formatTimestamp(params.timestamp);
  const shortId = shortOrderId(params.orderId);

  const itemLines = (params.items || [])
    .map((i) => {
      const priceStr =
        typeof i.price === "number"
          ? ` — KES ${(i.price * i.quantity).toLocaleString("en-KE")}`
          : "";
      return `  • ${i.quantity}x ${i.name}${priceStr}`;
    })
    .join("\n");

  const paymentLabel =
    params.paymentMethod === "cash"
      ? "M-PESA / Cash on Delivery"
      : params.paymentMethod === "mpesa-app"
      ? "M-PESA (manual code)"
      : params.paymentMethod === "stk-push"
      ? "M-PESA STK Push"
      : params.paymentMethod || "M-PESA / Cash on Delivery";

  const lines = [
    "Hello MiMaji, I would like to confirm my water order.",
    "",
    `Name: ${params.customerName || "—"}`,
  ];

  if (params.customerPhone) {
    lines.push(`Phone: ${params.customerPhone}`);
  }

  lines.push(
    `Order ID: #${shortId}`,
    `Placed: ${timestamp}`,
    "",
    "Order:",
    itemLines || "  • —",
    "",
    `Total: KES ${Number(params.total || 0).toLocaleString("en-KE")}`,
    `Payment: ${paymentLabel}`,
  );

  if (params.mpesaRef) {
    lines.push(`M-PESA Ref: ${params.mpesaRef}`);
  }

  lines.push(
    `Delivery Address: ${params.address || "—"}`,
    "",
    "Please confirm my order. Thank you!",
  );

  return lines.join("\n");
}

/**
 * Build a `https://wa.me/...` link that opens WhatsApp with the order
 * message pre-filled, ready for the customer to send.
 */
export function buildWhatsAppOrderLink(params: ShareOrderParams): string {
  const message = buildWhatsAppOrderMessage(params);
  return `https://wa.me/${OWNER_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
