import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { assignOrderToNextVendor } from "@/lib/vendorAssign";

const hasServiceKey =
  !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY !== "" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

/**
 * POST /api/vendor-order-action
 * Body: { action, orderId, vendorId }
 *
 * Actions:
 *   "assign"    — auto-assign order to best matching vendor
 *   "accept"    — paid → confirmed (vendor accepts offer)
 *   "reject"    — paid → reassign to next vendor
 *   "dispatch"  — confirmed → out_for_delivery
 *   "decline"   — confirmed → paid, reassign to next vendor
 *   "complete"  — out_for_delivery → delivered
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, orderId, vendorId } = body;

    if (!action || !orderId) {
      return NextResponse.json({ error: "action and orderId are required" }, { status: 400 });
    }

    if (!hasServiceKey) {
      return NextResponse.json({ error: "Service key not configured" }, { status: 500 });
    }

    const sb = createServiceClient();

    if (action === "assign") {
      const result = await assignOrderToNextVendor(sb, orderId);
      if (!result) {
        return NextResponse.json({ success: true, assigned: false });
      }
      return NextResponse.json({ success: true, assigned: true, vendorName: result.vendorName });
    }

    if (action === "accept") {
      if (!vendorId) {
        return NextResponse.json({ error: "vendorId is required for accept" }, { status: 400 });
      }
      const { estimatedMinutes, storeLocationId } = body;

      // Look up vendor name
      let vendorName = "Vendor";
      const { data: vendor } = await sb.from("vendors").select("name").eq("id", vendorId).single();
      if (vendor) vendorName = vendor.name;

      // Look up store location
      let locationStr = "";
      if (storeLocationId) {
        const { data: loc } = await sb.from("vendor_locations").select("name, area").eq("id", storeLocationId).single();
        if (loc) locationStr = `${loc.name}, ${loc.area}`;
      }

      const { error } = await sb.from("orders").update({
        vendor_id: vendorId,
        vendor_name: vendorName,
        vendor_location: locationStr,
        estimated_delivery_minutes: estimatedMinutes || 30,
        current_vendor_offer: null,
        status: "confirmed",
        updated_at: new Date().toISOString(),
      }).eq("id", orderId);

      if (error) {
        console.error("[vendor-order-action] accept error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "reject") {
      if (!vendorId) {
        return NextResponse.json({ error: "vendorId is required for reject" }, { status: 400 });
      }

      const { data: order } = await sb
        .from("orders")
        .select("vendors_tried, customer_id")
        .eq("id", orderId)
        .single();

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      const triedIds = (order.vendors_tried as string[]) || [];
      if (!triedIds.includes(vendorId)) triedIds.push(vendorId);

      const { error } = await sb.from("orders").update({
        vendors_tried: triedIds,
        current_vendor_offer: null,
        updated_at: new Date().toISOString(),
      }).eq("id", orderId);

      if (error) {
        console.error("[vendor-order-action] reject error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const result = await assignOrderToNextVendor(sb, orderId);
      if (!result) {
        try {
          await sb.from("notifications").insert({
            user_id: order.customer_id as string,
            type: "order_update",
            title: "Vendor Unavailable",
            message: "We're having trouble finding a vendor for your order. Our team has been notified and will assign one shortly.",
            order_id: orderId,
          });
        } catch (e) {
          console.error("Failed to create notification:", e);
        }
        return NextResponse.json({ success: true, nextVendor: null, allRejected: true });
      }
      return NextResponse.json({ success: true, nextVendor: result.vendorName, allRejected: false });
    }

    if (action === "dispatch") {
      const { error } = await sb
        .from("orders")
        .update({ status: "out_for_delivery", updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) {
        console.error("[vendor-order-action] dispatch error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "decline") {
      if (!vendorId) {
        return NextResponse.json({ error: "vendorId is required for decline" }, { status: 400 });
      }

      // Fetch current order
      const { data: order } = await sb
        .from("orders")
        .select("vendors_tried, customer_id")
        .eq("id", orderId)
        .single();

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      const triedIds = (order.vendors_tried as string[]) || [];
      if (!triedIds.includes(vendorId)) triedIds.push(vendorId);

      // Reset vendor assignment, revert to paid
      const { error } = await sb.from("orders").update({
        vendors_tried: triedIds,
        vendor_id: null,
        vendor_name: null,
        vendor_location: null,
        current_vendor_offer: null,
        estimated_delivery_minutes: null,
        status: "paid",
        updated_at: new Date().toISOString(),
      }).eq("id", orderId);

      if (error) {
        console.error("[vendor-order-action] decline error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Try to assign to next vendor
      const result = await assignOrderToNextVendor(sb, orderId);
      if (!result) {
        // All vendors declined — notify customer
        try {
          await sb.from("notifications").insert({
            user_id: order.customer_id as string,
            type: "order_update",
            title: "Vendor Unavailable",
            message: "We're having trouble finding a vendor for your order. Our team has been notified and will assign one shortly.",
            order_id: orderId,
          });
        } catch (e) {
          console.error("Failed to create notification:", e);
        }
        return NextResponse.json({ success: true, nextVendor: null, allRejected: true });
      }

      return NextResponse.json({ success: true, nextVendor: result.vendorName, allRejected: false });
    }

    if (action === "complete") {
      const { error } = await sb
        .from("orders")
        .update({ status: "delivered", updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) {
        console.error("[vendor-order-action] complete error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (e) {
    console.error("[vendor-order-action] Error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
