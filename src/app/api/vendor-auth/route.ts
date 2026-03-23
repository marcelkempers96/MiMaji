import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

/**
 * Vendor authentication endpoint.
 * Validates phone + PIN against the vendors table (pin column).
 * Works with service role so it bypasses RLS and doesn't depend
 * on Supabase Auth being set up for vendor users.
 *
 * POST /api/vendor-auth { phone, pin }
 * Returns { success, vendor: { id, name, phone, role } } or { error }
 */
export async function POST(req: NextRequest) {
  try {
    const { phone, pin } = await req.json();
    if (!phone || !pin) {
      return NextResponse.json({ error: "Phone and PIN are required" }, { status: 400 });
    }

    // Normalize phone
    let cleaned = phone.replace(/\s/g, "").replace(/^\+/, "");
    if (cleaned.startsWith("0")) cleaned = "254" + cleaned.slice(1);
    if (!cleaned.startsWith("254") && cleaned.length <= 9) cleaned = "254" + cleaned;

    const hasServiceKey =
      !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY !== "" &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

    if (!hasServiceKey) {
      return NextResponse.json({ error: "Server not configured" }, { status: 503 });
    }

    const sb = createServiceClient();

    // Find vendor by phone number and PIN
    const { data: vendor, error } = await sb
      .from("vendors")
      .select("id, name, phone_numbers, pin, profile_id, active")
      .eq("active", true)
      .eq("pin", pin)
      .limit(100);

    if (error) {
      console.error("Vendor auth query error:", error);
      return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
    }

    // Match by phone number (vendors store phone_numbers as array)
    const match = (vendor || []).find((v: Record<string, unknown>) => {
      const phones = (v.phone_numbers as string[]) || [];
      return phones.some((p) => {
        let norm = p.replace(/\s/g, "").replace(/^\+/, "");
        if (norm.startsWith("0")) norm = "254" + norm.slice(1);
        return norm === cleaned;
      });
    });

    if (!match) {
      return NextResponse.json({ error: "Invalid phone number or PIN" }, { status: 401 });
    }

    // Return vendor info for the frontend to create a session
    const vendorId = match.profile_id || match.id;
    return NextResponse.json({
      success: true,
      vendor: {
        id: vendorId as string,
        vendorRecordId: match.id as string,
        name: match.name as string,
        phone: cleaned,
        role: "vendor" as const,
      },
    });
  } catch (e) {
    console.error("Vendor auth error:", e);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
