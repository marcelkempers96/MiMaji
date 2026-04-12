/**
 * Multi-channel new-order notifications for MiMaji.
 *
 * Replaces the single-channel CallMeBot WhatsApp flow. Sends via every channel
 * that is configured; each channel fails independently and never blocks the
 * caller. The existing WhatsApp call is still attempted as a best-effort
 * fallback so nothing gets worse for anyone who had it working.
 *
 * Channels (all optional — use whichever you've configured):
 *
 *   1. SMS (Africa's Talking) — owner + assigned vendor phones
 *      Env: AT_API_KEY, AT_USERNAME
 *           OWNER_NOTIFICATION_PHONE (optional, falls back to
 *           OWNER_WHATSAPP_PHONE, then to 254704476338)
 *
 *   2. Telegram — owner only
 *      Env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 *      Setup: message @BotFather → /newbot → save token.
 *             Message your bot once, then visit
 *             https://api.telegram.org/bot<TOKEN>/getUpdates to find chat_id.
 *
 *   3. In-app notifications (Supabase `notifications` table)
 *      Automatically sent to the assigned vendor's profile so it shows up
 *      live in the vendor portal via realtime.
 *
 *   4. WhatsApp (CallMeBot) — owner only, best-effort legacy fallback.
 *
 * This file is server-only. Never import it from a client component.
 */
import { createServiceClient } from "@/lib/supabase";
import { sendSMS } from "@/lib/sms";
import { sendOwnerWhatsApp } from "@/lib/whatsapp";

const OWNER_PHONE =
  process.env.OWNER_NOTIFICATION_PHONE ||
  process.env.OWNER_WHATSAPP_PHONE ||
  "254704476338";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

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
  current_vendor_offer?: string | null;
  vendor_id?: string | null;
}

interface VendorRow {
  id: string;
  name: string | null;
  phone_numbers: string[] | null;
  profile_id: string | null;
}

/** Normalise KE phone numbers to +2547XXXXXXXX format for SMS. */
function normalisePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d+]/g, "");
  if (!digits) return null;
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("254")) return `+${digits}`;
  if (digits.startsWith("0") && digits.length >= 10) return `+254${digits.slice(1)}`;
  if (digits.startsWith("7") || digits.startsWith("1")) return `+254${digits}`;
  return `+${digits}`;
}

function paymentLabel(method: string | null | undefined): string {
  switch (method) {
    case "cash":
      return "Cash on Delivery";
    case "mpesa-app":
      return "M-PESA (manual code)";
    case "stk-push":
      return "M-PESA STK Push";
    default:
      return method || "—";
  }
}

function statusLabel(status: string | null | undefined): string {
  switch (status) {
    case "paid":
      return "PAID";
    case "confirmed":
      return "CONFIRMED";
    case "pending_payment":
      return "PENDING PAYMENT";
    default:
      return String(status || "").toUpperCase();
  }
}

function shortId(id: string): string {
  return String(id).slice(0, 8).toUpperCase();
}

function itemsSummary(order: OrderRow): string {
  if (Array.isArray(order.order_items) && order.order_items.length > 0) {
    return order.order_items.map((i) => `${i.quantity}x ${i.name}`).join(", ");
  }
  return `${order.quantity || 1} item(s)`;
}

/** Compact SMS message for the owner — keep under ~320 chars (2 SMS segments). */
function formatOwnerSms(order: OrderRow): string {
  const total = Number(order.price_total || 0).toLocaleString("en-KE");
  const lines = [
    `MiMaji NEW ORDER #${shortId(order.id)} (${statusLabel(order.status)})`,
    `${itemsSummary(order)} — KES ${total}`,
    `Pay: ${paymentLabel(order.payment_method)}`,
    `${order.customer_name || "—"} ${order.customer_phone || ""}`.trim(),
    `${order.delivery_address || "—"}`,
  ];
  if (order.scheduled_date) {
    lines.push(
      `Scheduled: ${order.scheduled_date}${order.scheduled_time ? ` ${order.scheduled_time}` : ""}`
    );
  }
  if (order.mpesa_ref) lines.push(`Ref: ${order.mpesa_ref}`);
  lines.push(`Portal: mimaji.co.ke/vendor-portal`);
  return lines.join("\n");
}

/** Vendor-facing SMS — includes only what the vendor needs to act. */
function formatVendorSms(order: OrderRow): string {
  const total = Number(order.price_total || 0).toLocaleString("en-KE");
  const lines = [
    `MiMaji: New order offered to you #${shortId(order.id)}`,
    `${itemsSummary(order)} — KES ${total}`,
    `Area: ${order.delivery_address || "—"}`,
  ];
  if (order.scheduled_date) {
    lines.push(
      `Scheduled: ${order.scheduled_date}${order.scheduled_time ? ` ${order.scheduled_time}` : ""}`
    );
  }
  lines.push(`Accept at mimaji.co.ke/vendor-portal`);
  return lines.join("\n");
}

/** Rich markdown message for Telegram (owner only). */
function formatTelegramMessage(order: OrderRow, vendorName: string | null): string {
  const total = Number(order.price_total || 0).toLocaleString("en-KE");
  const lines = [
    `🚰 *NEW MIMAJI ORDER*`,
    `#${shortId(order.id)} — ${statusLabel(order.status)}`,
    ``,
    `*Items:* ${itemsSummary(order)}`,
    `*Total:* KES ${total}`,
    `*Payment:* ${paymentLabel(order.payment_method)}`,
    ``,
    `*Customer:* ${order.customer_name || "—"}`,
    `*Phone:* ${order.customer_phone || "—"}`,
    `*Address:* ${order.delivery_address || "—"}`,
  ];
  if (order.scheduled_date) {
    lines.push(
      `*Scheduled:* ${order.scheduled_date}${order.scheduled_time ? ` at ${order.scheduled_time}` : ""}`
    );
  }
  if (order.mpesa_ref) lines.push(`*M-PESA Ref:* ${order.mpesa_ref}`);
  if (vendorName) lines.push(`*Assigned to:* ${vendorName}`);
  lines.push(``, `Open portal: https://mimaji.co.ke/vendor-portal`);
  return lines.join("\n");
}

/** Send a Telegram message. No-op if not configured. */
async function sendTelegram(text: string): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
      }
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[notifications] Telegram error:", res.status, body.slice(0, 200));
    }
  } catch (e) {
    console.error("[notifications] sendTelegram failed:", e);
  }
}

/**
 * Main entry point. Fetches the order, the vendor that was offered the order
 * (if any), then fans out notifications across every configured channel.
 * Always safe to fire-and-forget — all channels catch their own errors.
 */
export async function notifyNewOrder(orderId: string): Promise<void> {
  if (!orderId) return;

  const sb = createServiceClient();

  let order: OrderRow | null = null;
  try {
    const { data, error } = await sb
      .from("orders")
      .select(
        "id, status, quantity, price_total, order_items, delivery_address, customer_name, customer_phone, payment_method, mpesa_ref, scheduled_date, scheduled_time, current_vendor_offer, vendor_id"
      )
      .eq("id", orderId)
      .single();
    if (error || !data) {
      console.error(
        "[notifications] Could not load order:",
        orderId,
        error?.message
      );
      return;
    }
    order = data as OrderRow;
  } catch (e) {
    console.error("[notifications] Order lookup threw:", e);
    return;
  }

  // Resolve the vendor that was offered the order (if any). Fall back to an
  // already-accepted vendor_id if present. Failures here are non-fatal — the
  // owner still gets notified, we just skip the vendor notifications.
  let vendor: VendorRow | null = null;
  const targetVendorId = order.current_vendor_offer || order.vendor_id || null;
  if (targetVendorId) {
    try {
      const { data } = await sb
        .from("vendors")
        .select("id, name, phone_numbers, profile_id")
        .eq("id", targetVendorId)
        .single();
      if (data) vendor = data as VendorRow;
    } catch (e) {
      console.error("[notifications] Vendor lookup failed:", e);
    }
  }

  const ownerMsg = formatOwnerSms(order);
  const vendorMsg = formatVendorSms(order);
  const telegramMsg = formatTelegramMessage(order, vendor?.name ?? null);

  const tasks: Promise<unknown>[] = [];

  // 1. SMS to owner
  const ownerPhone = normalisePhone(OWNER_PHONE);
  if (ownerPhone) {
    tasks.push(
      sendSMS({ to: ownerPhone, message: ownerMsg }).catch((e) =>
        console.error("[notifications] owner SMS failed:", e)
      )
    );
  }

  // 2. SMS to each vendor phone
  if (vendor && Array.isArray(vendor.phone_numbers)) {
    const unique = new Set<string>();
    for (const raw of vendor.phone_numbers) {
      const p = normalisePhone(raw);
      if (p) unique.add(p);
    }
    for (const phone of unique) {
      tasks.push(
        sendSMS({ to: phone, message: vendorMsg }).catch((e) =>
          console.error("[notifications] vendor SMS failed:", e)
        )
      );
    }
  }

  // 3. In-app notification for the vendor's profile (shows up in portal)
  if (vendor?.profile_id) {
    const vendorProfileId = vendor.profile_id;
    tasks.push(
      (async () => {
        try {
          const { error } = await sb.from("notifications").insert({
            user_id: vendorProfileId,
            type: "order_update",
            title: "New order offered",
            message: `#${shortId(order!.id)} — ${itemsSummary(order!)} — ${
              order!.delivery_address || "delivery"
            }`,
            order_id: order!.id,
          });
          if (error) {
            console.error("[notifications] in-app insert failed:", error);
          }
        } catch (e) {
          console.error("[notifications] in-app insert threw:", e);
        }
      })()
    );
  }

  // 4. Telegram to owner (rich formatting)
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    tasks.push(
      sendTelegram(telegramMsg).catch((e) =>
        console.error("[notifications] telegram failed:", e)
      )
    );
  }

  // 5. Legacy WhatsApp fallback — best-effort, never throws.
  tasks.push(
    sendOwnerWhatsApp(ownerMsg).catch((e) =>
      console.error("[notifications] whatsapp fallback failed:", e)
    )
  );

  // Let everything run in parallel. We await so the caller (a fire-and-forget
  // wrapper in the API route) has a predictable completion point, but every
  // individual channel has its own .catch so one failure never cascades.
  await Promise.allSettled(tasks);
}
