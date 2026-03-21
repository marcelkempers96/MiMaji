import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

const ADMIN_CODE = "5566";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/**
 * Admin API — uses service role client to bypass RLS.
 * GET /api/admin?code=5566&type=orders|users|vendors|subscriptions
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (code !== ADMIN_CODE) return unauthorized();

  const type = req.nextUrl.searchParams.get("type") || "orders";
  const sb = createServiceClient();

  try {
    if (type === "orders") {
      // Fetch orders with customer profile info
      const { data, error } = await sb
        .from("orders")
        .select("*, profiles:customer_id(full_name, phone)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Admin API: orders error:", error);
        // Fallback without join
        const { data: fallback, error: err2 } = await sb
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });
        if (err2) return NextResponse.json({ error: err2.message }, { status: 500 });
        return NextResponse.json(fallback || []);
      }

      // Flatten profile data into order records
      const enriched = (data || []).map((row: Record<string, unknown>) => {
        const profile = row.profiles as { full_name?: string; phone?: string } | null;
        return {
          ...row,
          profiles: undefined,
          customer_name: profile?.full_name || (row.customer_name as string) || "",
          customer_phone: profile?.phone || (row.customer_phone as string) || "",
        };
      });
      return NextResponse.json(enriched);
    }

    if (type === "users") {
      const { data, error } = await sb
        .from("profiles")
        .select("id, phone, full_name, role")
        .order("created_at", { ascending: false });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data || []);
    }

    if (type === "vendors") {
      const { data, error } = await sb
        .from("vendors")
        .select("*, vendor_locations(*)")
        .eq("active", true);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data || []);
    }

    if (type === "subscriptions") {
      const { data, error } = await sb
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data || []);
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (e) {
    console.error("Admin API error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Admin API — POST for mutations (status updates, vendor reassignment, etc.)
 * POST /api/admin { code, action, ... }
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.code !== ADMIN_CODE) return unauthorized();

  const sb = createServiceClient();
  const { action } = body;

  try {
    if (action === "update_order_status") {
      const updates: Record<string, unknown> = { status: body.status, updated_at: new Date().toISOString() };
      if (body.mpesa_ref) updates.mpesa_ref = body.mpesa_ref;
      const { error } = await sb.from("orders").update(updates).eq("id", body.orderId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (action === "reassign_vendor") {
      const { error } = await sb.from("orders").update({
        vendor_id: body.vendorId,
        vendor_name: body.vendorName,
        vendor_location: body.vendorLocation,
        current_vendor_offer: body.vendorId,
        updated_at: new Date().toISOString(),
      }).eq("id", body.orderId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (action === "delete_user") {
      const { error } = await sb.from("profiles").delete().eq("id", body.userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (action === "update_user") {
      const updates: Record<string, unknown> = {};
      if (body.name !== undefined) updates.full_name = body.name;
      if (body.role !== undefined) updates.role = body.role;
      if (body.phone !== undefined) updates.phone = body.phone;
      const { error } = await sb.from("profiles").update(updates).eq("id", body.userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (action === "create_user") {
      const email = `${body.phone}@mimaji.co.ke`;
      const { data: signUpData, error: signUpErr } = await sb.auth.admin.createUser({
        email,
        password: body.password,
        email_confirm: true,
        user_metadata: { full_name: body.name, phone: body.phone },
      });
      if (signUpErr) return NextResponse.json({ error: signUpErr.message }, { status: 500 });
      if (signUpData?.user && body.role !== "customer") {
        await sb.from("profiles").update({ role: body.role }).eq("id", signUpData.user.id);
      }
      return NextResponse.json({ success: true });
    }

    if (action === "add_vendor") {
      const { data: vendorData, error } = await sb.from("vendors").insert({
        name: body.name,
        area: body.area,
        rating: body.rating || 4.5,
        reviews: body.reviews || 0,
        hours: body.hours || "7AM - 8PM",
        products: body.products || [],
        business_reg_no: body.businessRegNo || "",
        mpesa_number: body.mpesaNumber || "",
        phone_numbers: body.phoneNumbers || [],
        delivery_radius_km: body.deliveryRadius || 10,
        active: true,
      }).select("id").single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      // Insert locations
      if (vendorData && body.locations) {
        for (const loc of body.locations) {
          await sb.from("vendor_locations").insert({
            vendor_id: vendorData.id,
            name: loc.name,
            area: loc.area,
            lat: loc.lat || -1.2864,
            lng: loc.lng || 36.8172,
          });
        }
      }
      return NextResponse.json({ success: true, vendorId: vendorData?.id });
    }

    if (action === "update_vendor") {
      const { error } = await sb.from("vendors").update(body.updates).eq("id", body.vendorId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (action === "delete_vendor") {
      await sb.from("vendor_locations").delete().eq("vendor_id", body.vendorId);
      const { error } = await sb.from("vendors").update({ active: false }).eq("id", body.vendorId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (action === "add_subscription") {
      const { error } = await sb.from("subscriptions").insert(body.subscription);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (action === "update_subscription") {
      const { error } = await sb.from("subscriptions").update({ status: body.status }).eq("id", body.subId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (action === "delete_subscription") {
      const { error } = await sb.from("subscriptions").delete().eq("id", body.subId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error("Admin API POST error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
