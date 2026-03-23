import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// Admin code from environment variable (fallback to hardcoded for dev only)
const ADMIN_CODE = process.env.ADMIN_SECRET_CODE || "5566";

// Simple in-memory rate limiter for admin auth attempts
const authAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = authAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    authAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX_ATTEMPTS;
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function rateLimited() {
  return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
}

function notConfigured() {
  return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
}

const hasServiceKey =
  !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY !== "" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

/**
 * Admin API — uses service role client to bypass RLS.
 * GET /api/admin?code=5566&type=orders|users|vendors|subscriptions
 */
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) return rateLimited();
  const code = req.nextUrl.searchParams.get("code");
  if (code !== ADMIN_CODE) return unauthorized();

  const type = req.nextUrl.searchParams.get("type") || "orders";

  // Auth-only check — returns success even without Supabase, so admin login gate works
  if (type === "auth") {
    return NextResponse.json({ authenticated: true, hasServiceKey });
  }

  if (!hasServiceKey) return notConfigured();
  const sb = createServiceClient();

  try {
    if (type === "orders") {
      // Fetch orders
      const { data, error } = await sb
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Admin API: orders error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const orders = data || [];

      // Collect unique customer IDs to resolve names/phones
      const customerIds = [...new Set(orders.map((o: Record<string, unknown>) => o.customer_id as string).filter(Boolean))];

      // Build customer info map from auth.users metadata (the real source of truth)
      const customerMap = new Map<string, { name: string; phone: string }>();

      if (customerIds.length > 0) {
        let page = 1;
        const perPage = 1000;
        while (true) {
          const { data: authPage, error: authErr } = await sb.auth.admin.listUsers({ page, perPage });
          if (authErr) { console.error("listUsers error:", authErr); break; }
          if (!authPage?.users?.length) break;
          for (const u of authPage.users) {
            if (customerIds.includes(u.id)) {
              const meta = (u.user_metadata || {}) as Record<string, string>;
              customerMap.set(u.id, {
                name: meta.full_name || meta.name || meta.display_name || "",
                phone: meta.phone || u.phone || u.email?.replace(/@mimaji\.(app|co\.ke)$/, "") || "",
              });
            }
          }
          if (authPage.users.length < perPage) break;
          page++;
        }
      }

      // Enrich orders with customer info
      const enriched = orders.map((row: Record<string, unknown>) => {
        const custId = row.customer_id as string;
        const auth = customerMap.get(custId);
        return {
          ...row,
          customer_name: auth?.name || (row.customer_name as string) || "",
          customer_phone: auth?.phone || (row.customer_phone as string) || "",
        };
      });
      return NextResponse.json(enriched);
    }

    if (type === "users") {
      // Primary source: auth.users (has ALL registered users + raw_user_meta_data).
      // The profiles table is often incomplete (missing rows, blank fields).
      const allAuthUsers: Array<{ id: string; email?: string; phone?: string; user_metadata: Record<string, string>; created_at?: string }> = [];
      let page = 1;
      const perPage = 1000;
      while (true) {
        const { data: authPage, error: authErr } = await sb.auth.admin.listUsers({ page, perPage });
        if (authErr) { console.error("listUsers error:", authErr); break; }
        if (!authPage?.users?.length) break;
        allAuthUsers.push(...authPage.users.map((u) => ({
          id: u.id,
          email: u.email,
          phone: u.phone,
          user_metadata: (u.user_metadata || {}) as Record<string, string>,
          created_at: u.created_at,
        })));
        if (authPage.users.length < perPage) break;
        page++;
      }

      // Fetch profiles for role info (and as fallback for name/phone)
      const { data: profiles } = await sb
        .from("profiles")
        .select("id, phone, full_name, role");
      const profileMap = new Map(
        (profiles || []).map((p: Record<string, unknown>) => [p.id as string, p])
      );

      // Build merged list — one entry per auth user
      const merged = allAuthUsers.map((auth) => {
        const profile = profileMap.get(auth.id) as Record<string, unknown> | undefined;
        const meta = auth.user_metadata;
        return {
          id: auth.id,
          full_name:
            meta.full_name || meta.name || meta.display_name ||
            (profile?.full_name as string) || "",
          phone:
            meta.phone || (profile?.phone as string) ||
            auth.phone ||
            auth.email?.replace(/@mimaji\.(app|co\.ke)$/, "") || "",
          role: (profile?.role as string) || "customer",
        };
      });

      return NextResponse.json(merged);
    }

    if (type === "vendors") {
      const { data, error } = await sb
        .from("vendors")
        .select("*, vendor_locations(*), vendor_products(*), vendor_service_times(*)")
        .eq("active", true)
        .order("created_at", { ascending: false });
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
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) return rateLimited();
  const body = await req.json();
  if (body.code !== ADMIN_CODE) return unauthorized();
  if (!hasServiceKey) return notConfigured();

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

    if (action === "create_vendor") {
      // 1. Create Supabase auth user for vendor (server-side, won't affect admin session)
      const phone = body.phone;
      const pin = body.pin;
      const email = `${phone}@mimaji.co.ke`;
      const password = `MiMaji${pin}`;

      let profileId: string | null = null;
      try {
        const { data: authData, error: authErr } = await sb.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: body.name, phone, role: "vendor" },
        });
        if (authErr) {
          // User might already exist — try to find them
          if (authErr.message.includes("already been registered") || authErr.message.includes("already exists")) {
            const { data: existing } = await sb.auth.admin.listUsers({ page: 1, perPage: 1 });
            // Try to find by email in all users
            let foundPage = 1;
            while (true) {
              const { data: page } = await sb.auth.admin.listUsers({ page: foundPage, perPage: 100 });
              if (!page?.users?.length) break;
              const found = page.users.find((u) => u.email === email);
              if (found) { profileId = found.id; break; }
              if (page.users.length < 100) break;
              foundPage++;
            }
          } else {
            console.error("Auth user creation error:", authErr);
          }
        } else if (authData?.user) {
          profileId = authData.user.id;
        }
      } catch (e) {
        console.error("Auth user creation failed:", e);
      }

      // 2. Create/update profile with vendor role
      if (profileId) {
        await sb.from("profiles").upsert({
          id: profileId,
          phone,
          full_name: body.name,
          role: "vendor",
        }, { onConflict: "id" });
      }

      // 3. Create vendor record
      const { data: vendorData, error } = await sb.from("vendors").insert({
        name: body.name,
        area: "",
        rating: 5.0,
        reviews: 0,
        hours: "7AM - 8PM",
        products: [],
        brands: [],
        areas_served: [],
        phone_numbers: [phone],
        delivery_radius_km: 10,
        active: true,
        verified: false,
        profile_id: profileId,
        business_reg_no: "",
        mpesa_number: "",
        description: "",
        min_order: "",
        pin,
      }).select("id").single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // 4. Insert default products
      const defaultProducts = [
        { id: "vp-20l-hard", name: "20L Hard Jug", size: "20L", price_new: 1500, price_refill: 290, available: true },
        { id: "vp-189l-hard", name: "18.9L Hard Jug", size: "18.9L", price_new: 1400, price_refill: 250, available: true },
        { id: "vp-20l-soft", name: "20L Soft Bottle", size: "20L", price_new: 500, price_refill: 280, available: true },
        { id: "vp-189l-soft", name: "18.9L Soft Bottle", size: "18.9L", price_new: 450, price_refill: 240, available: true },
        { id: "vp-10l-hard", name: "10L Hard Jug", size: "10L", price_new: 180, price_refill: 0, available: false },
        { id: "vp-10l-soft", name: "10L Soft Bottle", size: "10L", price_new: 150, price_refill: 0, available: false },
        { id: "vp-5l-soft", name: "5L Soft Bottle", size: "5L", price_new: 80, price_refill: 0, available: false },
        { id: "vp-15l", name: "1.5L Bottle", size: "1.5L", price_new: 50, price_refill: 0, available: false },
        { id: "vp-1l", name: "1L Bottle", size: "1L", price_new: 40, price_refill: 0, available: false },
        { id: "vp-500ml", name: "500ML Bottle", size: "500ML", price_new: 25, price_refill: 0, available: false },
      ];
      if (vendorData?.id) {
        await sb.from("vendor_products").insert(defaultProducts.map((p) => ({ ...p, vendor_id: vendorData.id })));
      }

      // 5. Insert default service times
      const defaultTimes = [
        { day: "Monday", open: true, open_time: "07:00", close_time: "20:00" },
        { day: "Tuesday", open: true, open_time: "07:00", close_time: "20:00" },
        { day: "Wednesday", open: true, open_time: "07:00", close_time: "20:00" },
        { day: "Thursday", open: true, open_time: "07:00", close_time: "20:00" },
        { day: "Friday", open: true, open_time: "07:00", close_time: "20:00" },
        { day: "Saturday", open: true, open_time: "08:00", close_time: "18:00" },
        { day: "Sunday", open: false, open_time: "09:00", close_time: "16:00" },
      ];
      if (vendorData?.id) {
        await sb.from("vendor_service_times").insert(defaultTimes.map((t) => ({ ...t, vendor_id: vendorData.id })));
      }

      return NextResponse.json({ success: true, vendorId: vendorData?.id, profileId });
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
