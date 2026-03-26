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
 * Helper: resolve vendorId (could be vendor.id or profile_id) and verify PIN.
 * Returns the resolved vendor row or null.
 */
async function resolveAndAuthVendor(sb: ReturnType<typeof createServiceClient>, vendorId: string, pin: string) {
  let { data: vendor } = await sb
    .from("vendors")
    .select("id, pin, active")
    .eq("id", vendorId)
    .maybeSingle();

  if (!vendor) {
    const result = await sb
      .from("vendors")
      .select("id, pin, active")
      .eq("profile_id", vendorId)
      .maybeSingle();
    vendor = result.data;
  }

  if (!vendor) return { error: "Vendor not found", status: 404, vendorId: null };
  if (vendor.pin !== pin) return { error: "Invalid PIN", status: 401, vendorId: null };
  if (vendor.active === false) return { error: "Vendor account is inactive", status: 403, vendorId: null };
  return { error: null, status: 200, vendorId: vendor.id as string };
}

/**
 * GET /api/vendor-update?vendorId=...
 * Returns full vendor settings (server-side, service role — bypasses RLS).
 * vendorId can be the vendor record UUID or the auth profile UUID.
 * No PIN required for reads — vendor is already authenticated via login.
 */
export async function GET(req: NextRequest) {
  try {
    const vendorId = req.nextUrl.searchParams.get("vendorId");

    if (!vendorId) {
      return NextResponse.json({ error: "vendorId is required" }, { status: 400 });
    }

    if (hasServiceKey) {
      const sb = createServiceClient();

      // Try by vendor record ID first, then by profile_id
      let { data } = await sb
        .from("vendors")
        .select("*, vendor_locations(*), vendor_products(*), vendor_service_times(*)")
        .eq("id", vendorId)
        .maybeSingle();

      if (!data) {
        const result = await sb
          .from("vendors")
          .select("*, vendor_locations(*), vendor_products(*), vendor_service_times(*)")
          .eq("profile_id", vendorId)
          .maybeSingle();
        data = result.data;
      }

      if (!data) {
        return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
      }

      return NextResponse.json(data);
    }

    // File-store fallback
    const vendors = readCollection<Record<string, unknown>>("vendors");
    const match = vendors.find((v) => v.id === vendorId && v.active !== false);
    if (!match) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }
    return NextResponse.json(match);
  } catch (e) {
    console.error("Vendor settings load error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
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
      const auth = await resolveAndAuthVendor(sb, vendorId, pin);
      if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
      const resolvedVendorId = auth.vendorId!;

      // Apply updates to vendor record
      if (body.updates && Object.keys(body.updates).length > 0) {
        const { error } = await sb.from("vendors").update(body.updates).eq("id", resolvedVendorId);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update products (delete + re-insert)
      if (body.products) {
        await sb.from("vendor_products").delete().eq("vendor_id", resolvedVendorId);
        if (body.products.length > 0) {
          const { error } = await sb.from("vendor_products").insert(
            body.products.map((p: Record<string, unknown>) => ({ ...p, vendor_id: resolvedVendorId }))
          );
          if (error) console.error("vendor_products insert error:", error.message);
        }
      }

      // Update service times
      if (body.serviceTimes) {
        await sb.from("vendor_service_times").delete().eq("vendor_id", resolvedVendorId);
        if (body.serviceTimes.length > 0) {
          const { error } = await sb.from("vendor_service_times").insert(
            body.serviceTimes.map((st: Record<string, unknown>) => ({ ...st, vendor_id: resolvedVendorId }))
          );
          if (error) console.error("vendor_service_times insert error:", error.message);
        }
      }

      // Update locations
      if (body.locations) {
        await sb.from("vendor_locations").delete().eq("vendor_id", resolvedVendorId);
        if (body.locations.length > 0) {
          const { error } = await sb.from("vendor_locations").insert(
            body.locations.map((l: Record<string, unknown>) => ({ ...l, vendor_id: resolvedVendorId }))
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
