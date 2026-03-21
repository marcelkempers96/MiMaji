import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

const ADMIN_CODE = "5566";

export async function POST(req: NextRequest) {
  const code = req.headers.get("x-admin-code");
  if (code !== ADMIN_CODE) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { action } = body;
  const supabase = createServiceClient();

  switch (action) {
    // ── Orders ──
    case "update_order_status": {
      const { orderId, status, mpesaRef } = body;
      const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (mpesaRef) updates.mpesa_ref = mpesaRef;
      const { error } = await supabase.from("orders").update(updates).eq("id", orderId);
      return NextResponse.json({ success: !error, error: error?.message || null });
    }

    case "reassign_vendor": {
      const { orderId, vendorId, vendorName, vendorLocation } = body;
      const { error } = await supabase.from("orders").update({
        vendor_id: vendorId,
        vendor_name: vendorName,
        vendor_location: vendorLocation,
        current_vendor_offer: vendorId,
        updated_at: new Date().toISOString(),
      }).eq("id", orderId);
      return NextResponse.json({ success: !error, error: error?.message || null });
    }

    // ── Users ──
    case "create_user": {
      const { phone, name, password, role } = body;
      const email = `${phone}@mimaji.co.ke`;
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name, phone },
      });
      if (!error && data?.user && role !== "customer") {
        await supabase.from("profiles").update({ role }).eq("id", data.user.id);
      }
      return NextResponse.json({ success: !error, userId: data?.user?.id, error: error?.message || null });
    }

    case "update_user": {
      const { userId, updates } = body;
      const profileUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) profileUpdates.full_name = updates.name;
      if (updates.role !== undefined) profileUpdates.role = updates.role;
      const { error } = await supabase.from("profiles").update(profileUpdates).eq("id", userId);
      return NextResponse.json({ success: !error, error: error?.message || null });
    }

    case "delete_user": {
      const { userId } = body;
      // Delete profile (cascades from auth.users FK)
      await supabase.from("profiles").delete().eq("id", userId);
      // Also try to delete from auth
      try { await supabase.auth.admin.deleteUser(userId); } catch {}
      return NextResponse.json({ success: true });
    }

    // ── Vendors ──
    case "add_vendor": {
      const { vendor, locations } = body;
      const { data: vendorData, error } = await supabase.from("vendors").insert(vendor).select("id").single();
      if (!error && vendorData && locations?.length > 0) {
        const locs = locations.map((l: Record<string, unknown>) => ({ ...l, vendor_id: vendorData.id }));
        await supabase.from("vendor_locations").insert(locs);
      }
      return NextResponse.json({ success: !error, vendorId: vendorData?.id, error: error?.message || null });
    }

    case "delete_vendor": {
      const { vendorId } = body;
      const { error } = await supabase.from("vendors").update({ active: false }).eq("id", vendorId);
      return NextResponse.json({ success: !error, error: error?.message || null });
    }

    case "update_vendor": {
      const { vendorId, updates } = body;
      const { error } = await supabase.from("vendors").update(updates).eq("id", vendorId);
      return NextResponse.json({ success: !error, error: error?.message || null });
    }

    // ── Vendor Locations ──
    case "add_vendor_location": {
      const { location } = body;
      const { data, error } = await supabase.from("vendor_locations").insert(location).select("id").single();
      return NextResponse.json({ success: !error, locationId: data?.id, error: error?.message || null });
    }

    case "delete_vendor_location": {
      const { locationId } = body;
      const { error } = await supabase.from("vendor_locations").delete().eq("id", locationId);
      return NextResponse.json({ success: !error, error: error?.message || null });
    }

    case "update_vendor_location": {
      const { locationId, updates } = body;
      const { error } = await supabase.from("vendor_locations").update(updates).eq("id", locationId);
      return NextResponse.json({ success: !error, error: error?.message || null });
    }

    // ── Subscriptions ──
    case "add_subscription": {
      const { subscription } = body;
      const { error } = await supabase.from("subscriptions").insert(subscription);
      return NextResponse.json({ success: !error, error: error?.message || null });
    }

    case "update_subscription": {
      const { subscriptionId, updates } = body;
      const { error } = await supabase.from("subscriptions").update(updates).eq("id", subscriptionId);
      return NextResponse.json({ success: !error, error: error?.message || null });
    }

    case "delete_subscription": {
      const { subscriptionId } = body;
      const { error } = await supabase.from("subscriptions").delete().eq("id", subscriptionId);
      return NextResponse.json({ success: !error, error: error?.message || null });
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
