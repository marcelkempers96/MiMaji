import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

const hasServiceKey =
  !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY !== "" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Assign order to next best vendor (server-side with service role).
 */
async function assignOrderToNextVendor(
  sb: ReturnType<typeof createServiceClient>,
  orderId: string
): Promise<{ vendorId: string; vendorName: string } | null> {
  const { data: order } = await sb
    .from("orders")
    .select("vendors_tried, brand_preference, delivery_address_details, scheduled_date, scheduled_time")
    .eq("id", orderId)
    .single();
  if (!order) return null;

  const triedIds = (order.vendors_tried as string[]) || [];
  const brandPref = (order.brand_preference as string[]) || [];
  const addrDetails = order.delivery_address_details as { lat?: number; lng?: number; neighbourhood?: string } | null;
  const deliveryLat = addrDetails?.lat;
  const deliveryLng = addrDetails?.lng;
  const deliveryArea = addrDetails?.neighbourhood || "";

  const { data: vendors } = await sb
    .from("vendors")
    .select("id, name, brands, areas_served, vendor_locations(lat, lng), vendor_service_times(day, open, open_time, close_time)")
    .eq("active", true);

  if (!vendors || vendors.length === 0) return null;

  const kenyaNow = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let checkDay = dayNames[kenyaNow.getUTCDay()];
  let checkTime = `${kenyaNow.getUTCHours().toString().padStart(2, "0")}:${kenyaNow.getUTCMinutes().toString().padStart(2, "0")}`;

  if (order.scheduled_date) {
    const schedDate = new Date(order.scheduled_date as string);
    checkDay = dayNames[schedDate.getDay()];
    if (order.scheduled_time) checkTime = order.scheduled_time as string;
  }

  type ServiceTime = { day: string; open: boolean; open_time: string; close_time: string };
  type VendorRow = { id: string; name: string; brands?: string[]; areas_served?: string[]; vendor_locations?: Array<{ lat: number; lng: number }>; vendor_service_times?: ServiceTime[] };

  const candidates = (vendors as VendorRow[])
    .filter((v) => {
      if (triedIds.includes(v.id)) return false;
      if (v.vendor_service_times && v.vendor_service_times.length > 0) {
        const dayEntry = v.vendor_service_times.find((st) => st.day === checkDay);
        if (!dayEntry || !dayEntry.open) return false;
        if (checkTime < dayEntry.open_time || checkTime > dayEntry.close_time) return false;
      }
      return true;
    })
    .map((v) => {
      let score = 0;
      if (brandPref.length > 0) {
        const matches = brandPref.filter((b) => (v.brands || []).includes(b)).length;
        score += matches * 10;
      }
      if (deliveryArea && (v.areas_served || []).some((a) => a.toLowerCase() === deliveryArea.toLowerCase())) {
        score += 8;
      }
      if (deliveryLat && deliveryLng && v.vendor_locations && v.vendor_locations.length > 0) {
        let minDist = Infinity;
        for (const loc of v.vendor_locations) {
          const d = haversineKm(deliveryLat, deliveryLng, loc.lat, loc.lng);
          if (d < minDist) minDist = d;
        }
        score += Math.max(0, 5 - minDist);
      }
      return { vendor: v, score };
    })
    .sort((a, b) => b.score - a.score);

  if (candidates.length === 0) return null;
  const next = candidates[0].vendor;

  await sb.from("orders").update({
    current_vendor_offer: next.id,
    updated_at: new Date().toISOString(),
  }).eq("id", orderId);

  return { vendorId: next.id, vendorName: next.name };
}

/**
 * POST /api/vendor-order-action
 * Body: { action, orderId, vendorId }
 *
 * Actions:
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
