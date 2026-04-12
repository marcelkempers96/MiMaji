import { NextRequest, NextResponse } from "next/server";
import { notifyNewOrder } from "@/lib/notifications";

/**
 * POST /api/notify-new-order
 * Body: { orderId: string }
 *
 * Fans out a new-order notification across every configured channel
 * (SMS → owner + assigned vendor, in-app row for the vendor portal,
 * Telegram to owner, and a best-effort WhatsApp fallback). Used by the
 * client after creating a cash or manual-M-PESA order (STK Push orders
 * are notified server-side from the M-PESA callback).
 *
 * Fire-and-forget: the endpoint responds OK even if an individual channel
 * is slow or fails, so notification issues never block the order flow.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderId = body?.orderId;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    // Don't await — respond immediately so the client isn't blocked
    notifyNewOrder(orderId).catch((e) =>
      console.error("[notify-new-order] background error:", e)
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[notify-new-order] error:", e);
    // Still return OK so the caller doesn't surface a notification failure
    return NextResponse.json({ ok: true });
  }
}
