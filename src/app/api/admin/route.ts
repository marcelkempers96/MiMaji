import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import {
  readCollection,
  appendToCollection,
  updateInCollection,
  deleteFromCollection,
} from "@/lib/fileStore";

// Admin code from environment variable (fallback to hardcoded for dev only)
const ADMIN_CODE = process.env.ADMIN_SECRET_CODE || "5566";

// Simple in-memory rate limiter for FAILED admin auth attempts only
const authAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = authAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = authAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    authAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count++;
  }
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function rateLimited() {
  return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
}

const hasServiceKey =
  !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY !== "" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

// ── Default products & service times for new vendors ──
const DEFAULT_PRODUCTS = [
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

const DEFAULT_SERVICE_TIMES = [
  { day: "Monday", open: true, open_time: "07:00", close_time: "20:00" },
  { day: "Tuesday", open: true, open_time: "07:00", close_time: "20:00" },
  { day: "Wednesday", open: true, open_time: "07:00", close_time: "20:00" },
  { day: "Thursday", open: true, open_time: "07:00", close_time: "20:00" },
  { day: "Friday", open: true, open_time: "07:00", close_time: "20:00" },
  { day: "Saturday", open: true, open_time: "08:00", close_time: "18:00" },
  { day: "Sunday", open: false, open_time: "09:00", close_time: "16:00" },
];

// ── File-store fallback handlers (no Supabase needed) ──

function fileGetVendors() {
  const vendors = readCollection("vendors");
  const products = readCollection("vendor_products");
  const times = readCollection("vendor_service_times");
  const locations = readCollection("vendor_locations");
  // Attach related data
  return vendors
    .filter((v: Record<string, unknown>) => v.active !== false)
    .map((v: Record<string, unknown>) => ({
      ...v,
      vendor_products: products.filter((p: Record<string, unknown>) => p.vendor_id === v.id),
      vendor_service_times: times.filter((t: Record<string, unknown>) => t.vendor_id === v.id),
      vendor_locations: locations.filter((l: Record<string, unknown>) => l.vendor_id === v.id),
    }));
}

function fileGetOrders() {
  return readCollection("orders");
}

function fileGetUsers() {
  return readCollection("users");
}

function fileGetSubscriptions() {
  return readCollection("subscriptions");
}

function fileCreateVendor(body: Record<string, unknown>) {
  const phone = body.phone as string;
  const pin = body.pin as string;
  const name = body.name as string;
  const vendorId = `vendor-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const profileId = `profile-${Date.now()}`;
  const now = new Date().toISOString();

  // Create vendor record
  appendToCollection("vendors", {
    id: vendorId,
    name,
    area: "",
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
    created_at: now,
    updated_at: now,
  });

  // Create products
  const existingProducts = readCollection("vendor_products");
  const newProducts = DEFAULT_PRODUCTS.map((p) => ({ ...p, vendor_id: vendorId }));
  const { writeCollection } = require("@/lib/fileStore");
  writeCollection("vendor_products", [...existingProducts, ...newProducts]);

  // Create service times
  const existingTimes = readCollection("vendor_service_times");
  const newTimes = DEFAULT_SERVICE_TIMES.map((t) => ({ ...t, vendor_id: vendorId }));
  writeCollection("vendor_service_times", [...existingTimes, ...newTimes]);

  return { vendorId, profileId };
}

/**
 * Admin API — GET
 * Uses Supabase service role when available, falls back to file-based JSON store.
 * GET /api/admin?code=5566&type=orders|users|vendors|subscriptions|auth
 */
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) return rateLimited();
  const code = req.nextUrl.searchParams.get("code");
  if (code !== ADMIN_CODE) {
    recordFailedAttempt(ip);
    return unauthorized();
  }

  const type = req.nextUrl.searchParams.get("type") || "orders";

  // Auth-only check — always works
  if (type === "auth") {
    return NextResponse.json({ authenticated: true, hasServiceKey });
  }

  // ── Supabase path ──
  if (hasServiceKey) {
    const sb = createServiceClient();
    try {
      if (type === "orders") {
        const { data, error } = await sb
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        const orders = data || [];
        const customerIds = [...new Set(orders.map((o: Record<string, unknown>) => o.customer_id as string).filter(Boolean))];
        const customerMap = new Map<string, { name: string; phone: string }>();

        if (customerIds.length > 0) {
          let page = 1;
          const perPage = 1000;
          while (true) {
            const { data: authPage, error: authErr } = await sb.auth.admin.listUsers({ page, perPage });
            if (authErr) break;
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
        const allAuthUsers: Array<{ id: string; email?: string; phone?: string; user_metadata: Record<string, string>; created_at?: string }> = [];
        let page = 1;
        const perPage = 1000;
        while (true) {
          const { data: authPage, error: authErr } = await sb.auth.admin.listUsers({ page, perPage });
          if (authErr) break;
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
        const { data: profiles } = await sb.from("profiles").select("id, phone, full_name, role");
        const profileMap = new Map((profiles || []).map((p: Record<string, unknown>) => [p.id as string, p]));
        const merged = allAuthUsers.map((auth) => {
          const profile = profileMap.get(auth.id) as Record<string, unknown> | undefined;
          const meta = auth.user_metadata;
          return {
            id: auth.id,
            full_name: meta.full_name || meta.name || meta.display_name || (profile?.full_name as string) || "",
            phone: meta.phone || (profile?.phone as string) || auth.phone || auth.email?.replace(/@mimaji\.(app|co\.ke)$/, "") || "",
            role: (profile?.role as string) || "customer",
          };
        });
        return NextResponse.json(merged);
      }

      if (type === "vendors") {
        const { data, error } = await sb
          .from("vendors")
          .select("*, vendor_locations(*), vendor_products(*), vendor_service_times(*)")
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
      console.error("Admin API Supabase error:", e);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  // ── File-store fallback (no Supabase) ──
  try {
    if (type === "vendors") return NextResponse.json(fileGetVendors());
    if (type === "orders") return NextResponse.json(fileGetOrders());
    if (type === "users") return NextResponse.json(fileGetUsers());
    if (type === "subscriptions") return NextResponse.json(fileGetSubscriptions());
    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (e) {
    console.error("Admin API file-store error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Admin API — POST for mutations
 * POST /api/admin { code, action, ... }
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) return rateLimited();
  const body = await req.json();
  if (body.code !== ADMIN_CODE) {
    recordFailedAttempt(ip);
    return unauthorized();
  }

  const { action } = body;

  // ── Supabase path ──
  if (hasServiceKey) {
    const sb = createServiceClient();
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
        const phone = body.phone as string;
        const pin = body.pin as string;
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
            if (authErr.message.includes("already been registered") || authErr.message.includes("already exists")) {
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

        // Create/update profile (best-effort — check result)
        let profileOk = false;
        if (profileId) {
          const { error: profileErr } = await sb.from("profiles").upsert({
            id: profileId,
            phone,
            full_name: body.name,
            role: "vendor",
          }, { onConflict: "id" });
          if (profileErr) {
            console.error("Profile upsert failed:", profileErr.message);
          } else {
            profileOk = true;
          }
        }

        // Insert vendor record — the critical step.
        // Use profile_id only if the profile was successfully created/updated,
        // otherwise set null to avoid foreign key violations.
        const vendorRow = {
          name: body.name,
          area: "",
          hours: "7AM - 8PM",
          products: [],
          brands: [],
          areas_served: [],
          phone_numbers: [phone],
          delivery_radius_km: 10,
          active: true,
          verified: false,
          profile_id: profileOk ? profileId : null,
          business_reg_no: "",
          mpesa_number: "",
          description: "",
          min_order: "",
          pin,
        };

        let { data: vendorData, error } = await sb.from("vendors").insert(vendorRow).select("id").single();

        // If insert failed (e.g. FK constraint on profile_id), retry without profile_id
        if (error && profileId) {
          console.error("Vendor insert failed, retrying without profile_id:", error.message);
          const retryResult = await sb.from("vendors").insert({ ...vendorRow, profile_id: null }).select("id").single();
          vendorData = retryResult.data;
          error = retryResult.error;
        }

        if (error) {
          console.error("Vendor insert failed:", error.message);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (vendorData?.id) {
          await sb.from("vendor_products").insert(DEFAULT_PRODUCTS.map((p) => ({ ...p, vendor_id: vendorData.id })));
          await sb.from("vendor_service_times").insert(DEFAULT_SERVICE_TIMES.map((t) => ({ ...t, vendor_id: vendorData.id })));
        }

        return NextResponse.json({ success: true, vendorId: vendorData?.id, profileId });
      }

      if (action === "update_vendor") {
        // Resolve the actual vendor record ID (vendorId could be profile_id)
        let realVendorId = body.vendorId as string;
        {
          const { data: v } = await sb.from("vendors").select("id").eq("id", realVendorId).maybeSingle();
          if (!v) {
            const { data: v2 } = await sb.from("vendors").select("id").eq("profile_id", realVendorId).maybeSingle();
            if (v2) realVendorId = v2.id;
          }
        }

        // Update main vendor record
        if (body.updates && Object.keys(body.updates).length > 0) {
          const { error } = await sb.from("vendors").update(body.updates).eq("id", realVendorId);
          if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Update products (delete + re-insert, uses service role to bypass RLS)
        if (body.products) {
          await sb.from("vendor_products").delete().eq("vendor_id", realVendorId);
          if (body.products.length > 0) {
            const { error } = await sb.from("vendor_products").insert(
              body.products.map((p: Record<string, unknown>) => ({ ...p, vendor_id: realVendorId }))
            );
            if (error) console.error("vendor_products insert error:", error.message);
          }
        }

        // Update service times
        if (body.serviceTimes) {
          await sb.from("vendor_service_times").delete().eq("vendor_id", realVendorId);
          if (body.serviceTimes.length > 0) {
            const { error } = await sb.from("vendor_service_times").insert(
              body.serviceTimes.map((st: Record<string, unknown>) => ({ ...st, vendor_id: realVendorId }))
            );
            if (error) console.error("vendor_service_times insert error:", error.message);
          }
        }

        // Update locations
        if (body.locations) {
          await sb.from("vendor_locations").delete().eq("vendor_id", realVendorId);
          if (body.locations.length > 0) {
            const { error } = await sb.from("vendor_locations").insert(
              body.locations.map((l: Record<string, unknown>) => ({ ...l, vendor_id: realVendorId }))
            );
            if (error) console.error("vendor_locations insert error:", error.message);
          }
        }

        return NextResponse.json({ success: true });
      }

      if (action === "delete_vendor") {
        await sb.from("vendor_locations").delete().eq("vendor_id", body.vendorId);
        const { error } = await sb.from("vendors").update({ active: false }).eq("id", body.vendorId);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      if (action === "reactivate_vendor") {
        const { error } = await sb.from("vendors").update({ active: true }).eq("id", body.vendorId);
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
      console.error("Admin API Supabase POST error:", e);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  // ── File-store fallback (no Supabase) ──
  try {
    if (action === "create_vendor") {
      const result = fileCreateVendor(body);
      return NextResponse.json({ success: true, vendorId: result.vendorId, profileId: result.profileId });
    }

    if (action === "update_vendor") {
      updateInCollection("vendors", body.vendorId, body.updates);
      return NextResponse.json({ success: true });
    }

    if (action === "delete_vendor") {
      updateInCollection("vendors", body.vendorId, { active: false });
      return NextResponse.json({ success: true });
    }

    if (action === "reactivate_vendor") {
      updateInCollection("vendors", body.vendorId, { active: true });
      return NextResponse.json({ success: true });
    }

    if (action === "update_order_status") {
      updateInCollection("orders", body.orderId, {
        status: body.status,
        ...(body.mpesa_ref ? { mpesa_ref: body.mpesa_ref } : {}),
      });
      return NextResponse.json({ success: true });
    }

    if (action === "delete_user") {
      deleteFromCollection("users", body.userId);
      return NextResponse.json({ success: true });
    }

    if (action === "update_user") {
      const updates: Record<string, unknown> = {};
      if (body.name !== undefined) updates.full_name = body.name;
      if (body.role !== undefined) updates.role = body.role;
      if (body.phone !== undefined) updates.phone = body.phone;
      updateInCollection("users", body.userId, updates);
      return NextResponse.json({ success: true });
    }

    if (action === "add_subscription") {
      appendToCollection("subscriptions", { ...body.subscription, id: `sub-${Date.now()}`, created_at: new Date().toISOString() });
      return NextResponse.json({ success: true });
    }

    if (action === "update_subscription") {
      updateInCollection("subscriptions", body.subId, { status: body.status });
      return NextResponse.json({ success: true });
    }

    if (action === "delete_subscription") {
      deleteFromCollection("subscriptions", body.subId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error("Admin API file-store POST error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
