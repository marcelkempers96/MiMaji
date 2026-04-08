import { NextRequest, NextResponse } from "next/server";
import { notifyOwnerOfNewOrder } from "@/lib/whatsapp";

/**
 * POST /api/notify-new-order
 * Body: { orderId: string }
 *
 * Sends a WhatsApp notification to the owner for the given order via
 * CallMeBot. Used by the client after creating a cash or manual-M-PESA
 * order (STK Push orders are notified server-side from the M-PESA callback).
 *
 * Fire-and-forget: the endpoint responds OK even if CallMeBot is slow or
 * fails, so notification issues never block the order flow.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderId = body?.orderId;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    // Don't await — respond immediately so the client isn't blocked
    notifyOwnerOfNewOrder(orderId).catch((e) =>
      console.error("[notify-new-order] background error:", e)
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[notify-new-order] error:", e);
    // Still return OK so the caller doesn't surface a notification failure
    return NextResponse.json({ ok: true });
  }
}
