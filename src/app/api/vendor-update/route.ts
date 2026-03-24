import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { updateInCollection, readCollection } from "@/lib/fileStore";

const hasServiceKey =
  !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY !== "" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\s/g, "").replace(/^\+/, "");
  if (cleaned.startsWith("0")) cleaned = "254" + cleaned.slice(1);
  if (!cleaned.startsWith("254") && cleaned.length <= 9) cleaned = "254" + cleaned;
  return cleaned;
}

/**
 * Vendor self-service update endpoint.
 * Authenticates vendor by vendorId + PIN, then applies updates using service role.
 *
 * POST /api/vendor-update { vendorId, pin, updates, products?, serviceTimes?, locations? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vendorId, pin } = body;

    if (!vendorId || !pin) {
      return NextResponse.json({ error: "vendorId and pin are required" }, { status: 400 });
    }

    // ── Supabase path ──
    if (hasServiceKey) {
      const sb = createServiceClient();

      // Authenticate: verify vendorId + PIN match
      const { data: vendor, error: authErr } = await sb
        .from("vendors")
        .select("id, pin, active")
        .eq("id", vendorId)
        .maybeSingle();

      if (authErr || !vendor) {
        return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
      }
      if (vendor.pin !== pin) {
        return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
      }
      if (vendor.active === false) {
        return NextResponse.json({ error: "Vendor account is inactive" }, { status: 403 });
      }

      // Apply updates to vendor record
      if (body.updates && Object.keys(body.updates).length > 0) {
        const { error } = await sb.from("vendors").update(body.updates).eq("id", vendorId);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update products (delete + re-insert)
      if (body.products) {
        await sb.from("vendor_products").delete().eq("vendor_id", vendorId);
        if (body.products.length > 0) {
          const { error } = await sb.from("vendor_products").insert(
            body.products.map((p: Record<string, unknown>) => ({ ...p, vendor_id: vendorId }))
          );
          if (error) console.error("vendor_products insert error:", error.message);
        }
      }

      // Update service times
      if (body.serviceTimes) {
        await sb.from("vendor_service_times").delete().eq("vendor_id", vendorId);
        if (body.serviceTimes.length > 0) {
          const { error } = await sb.from("vendor_service_times").insert(
            body.serviceTimes.map((st: Record<string, unknown>) => ({ ...st, vendor_id: vendorId }))
          );
          if (error) console.error("vendor_service_times insert error:", error.message);
        }
      }

      // Update locations
      if (body.locations) {
        await sb.from("vendor_locations").delete().eq("vendor_id", vendorId);
        if (body.locations.length > 0) {
          const { error } = await sb.from("vendor_locations").insert(
            body.locations.map((l: Record<string, unknown>) => ({ ...l, vendor_id: vendorId }))
          );
          if (error) console.error("vendor_locations insert error:", error.message);
        }
      }

      return NextResponse.json({ success: true });
    }

    // ── File-store fallback ──
    const vendors = readCollection<Record<string, unknown>>("vendors");
    const match = vendors.find((v) => v.id === vendorId && v.pin === pin && v.active !== false);
    if (!match) {
      return NextResponse.json({ error: "Invalid vendor or PIN" }, { status: 401 });
    }

    if (body.updates) {
      updateInCollection("vendors", vendorId, body.updates);
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Vendor update error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
