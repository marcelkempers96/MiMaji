import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

const hasServiceKey =
  !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY !== "" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

/**
 * GET /api/vendor-orders?vendorId=...
 * Returns orders for a vendor (server-side, service role — bypasses RLS).
 * Fetches orders where vendor_id or current_vendor_offer matches.
 */
export async function GET(req: NextRequest) {
  try {
    const vendorId = req.nextUrl.searchParams.get("vendorId");
    if (!vendorId) {
      return NextResponse.json({ error: "vendorId is required" }, { status: 400 });
    }

    if (!hasServiceKey) {
      console.error("[vendor-orders] No service key configured");
      return NextResponse.json([], { status: 200 });
    }

    const sb = createServiceClient();

    // Query orders assigned to this vendor OR offered to this vendor
    const { data, error } = await sb
      .from("orders")
      .select("*")
      .or(`current_vendor_offer.eq.${vendorId},vendor_id.eq.${vendorId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[vendor-orders] Query error:", error.message, "vendorId:", vendorId);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[vendor-orders] vendorId:", vendorId, "found:", data?.length || 0, "orders");

    // If no orders found with vendor record ID, also try matching by
    // checking all orders (the vendor_id column might store a different format)
    if ((!data || data.length === 0)) {
      // Debug: fetch a few recent orders to see what vendor_id values look like
      const { data: recentOrders } = await sb
        .from("orders")
        .select("id, vendor_id, current_vendor_offer, status")
        .not("vendor_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(5);
      if (recentOrders && recentOrders.length > 0) {
        console.log("[vendor-orders] Recent orders with vendor_id:", JSON.stringify(recentOrders.map(o => ({
          id: o.id?.slice(0, 8),
          vendor_id: o.vendor_id,
          current_vendor_offer: o.current_vendor_offer,
          status: o.status,
        }))));
      }
    }

    return NextResponse.json(data || []);
  } catch (e) {
    console.error("[vendor-orders] Error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
