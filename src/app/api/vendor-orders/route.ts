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
      return NextResponse.json([], { status: 200 });
    }

    const sb = createServiceClient();
    const { data, error } = await sb
      .from("orders")
      .select("*")
      .or(`current_vendor_offer.eq.${vendorId},vendor_id.eq.${vendorId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[vendor-orders] Query error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (e) {
    console.error("[vendor-orders] Error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
