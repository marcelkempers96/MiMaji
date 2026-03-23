import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

/**
 * Poll payment status by order ID.
 * Returns { status: "pending" | "success" | "failed", mpesa_receipt?: string }
 */
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  try {
    const supabase = createServiceClient();

    // Check order status directly — the callback updates order.status to "paid"
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("status, mpesa_ref")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ status: "pending" });
    }

    if (order.status === "paid" || order.status === "confirmed" || order.status === "out_for_delivery" || order.status === "delivered") {
      return NextResponse.json({
        status: "success",
        mpesa_receipt: order.mpesa_ref || null,
        order_status: order.status,
      });
    }

    if (order.status === "cancelled") {
      return NextResponse.json({ status: "failed", order_status: order.status });
    }

    // Also check the payments table for more detail
    const { data: payment } = await supabase
      .from("payments")
      .select("status, mpesa_receipt")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (payment?.status === "success") {
      return NextResponse.json({
        status: "success",
        mpesa_receipt: payment.mpesa_receipt || null,
      });
    }

    if (payment?.status === "failed") {
      return NextResponse.json({ status: "failed" });
    }

    return NextResponse.json({ status: "pending" });
  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json({ status: "pending" });
  }
}
