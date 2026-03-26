import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { readCollection } from "@/lib/fileStore";

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
 * Vendor authentication endpoint.
 * Validates phone + PIN against the vendors table (pin column).
 * Uses service role (bypasses RLS). Falls back to file store.
 *
 * POST /api/vendor-auth { phone, pin }
 */
export async function POST(req: NextRequest) {
  try {
    const { phone, pin } = await req.json();
    if (!phone || !pin) {
      return NextResponse.json({ error: "Phone and PIN are required" }, { status: 400 });
    }

    const cleaned = normalizePhone(phone);

    // Helper to match vendor by phone + pin
    function matchVendor(vendors: Record<string, unknown>[]) {
      return vendors.find((v) => {
        if (v.pin !== pin || v.active === false) return false;
        const phones = (v.phone_numbers as string[]) || [];
        return phones.some((p) => normalizePhone(p) === cleaned);
      });
    }

    // ── Supabase path ──
    if (hasServiceKey) {
      const sb = createServiceClient();
      const { data, error } = await sb
        .from("vendors")
        .select("id, name, phone_numbers, pin, profile_id, active")
        .eq("active", true)
        .eq("pin", pin)
        .limit(100);

      if (error) {
        console.error("Vendor auth query error:", error);
        return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
      }

      const match = matchVendor((data || []) as Record<string, unknown>[]);
      if (match) {
        return NextResponse.json({
          success: true,
          vendor: {
            id: match.id as string,
            vendorRecordId: match.id as string,
            name: match.name as string,
            phone: cleaned,
            role: "vendor" as const,
          },
        });
      }
      return NextResponse.json({ error: "Invalid phone number or PIN" }, { status: 401 });
    }

    // ── File store fallback ──
    const vendors = readCollection<Record<string, unknown>>("vendors");
    const match = matchVendor(vendors);
    if (match) {
      return NextResponse.json({
        success: true,
        vendor: {
          id: match.id as string,
          vendorRecordId: match.id as string,
          name: match.name as string,
          phone: cleaned,
          role: "vendor" as const,
        },
      });
    }
    return NextResponse.json({ error: "Invalid phone number or PIN" }, { status: 401 });
  } catch (e) {
    console.error("Vendor auth error:", e);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
