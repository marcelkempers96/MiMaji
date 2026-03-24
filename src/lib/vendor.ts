import { supabase } from "./supabase";
import { OrderRecord, updateOrder } from "./orders";
import { loadVendorStore } from "./vendorStore";

const hasSupabaseConfig =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

const isProduction = typeof process !== "undefined" && process.env.NODE_ENV === "production";

const MOCK_ORDERS_KEY = "mimaji_mock_orders";

function getMockOrders(): OrderRecord[] {
  try {
    const raw = localStorage.getItem(MOCK_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveMockOrders(orders: OrderRecord[]) {
  try { localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(orders)); } catch {}
}

// ── Vendor store location ──
export interface StoreLocation {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
}

// ── Vendor info ──
export interface VendorInfo {
  id: string;
  name: string;
  area: string;
  distance: string;
  hours: string;
  products: string[];
  brands: string[];
  areasServed: string[];
  businessRegNo: string;
  mpesaNumber: string;
  phoneNumbers: string[];
  locations: StoreLocation[];
}

// Mock vendors removed — all vendor data comes from Supabase now.
export const MOCK_VENDORS: VendorInfo[] = [];

// ── Fetch all active vendors ──
export async function fetchVendors(): Promise<VendorInfo[]> {
  if (!hasSupabaseConfig) {
    // No Supabase config — return vendors from localStorage cache only
    const storeVendors = loadVendorStore();
    return storeVendors.map((v) => ({
      id: v.id,
      name: v.name,
      area: v.area || "",
      distance: "",
      hours: v.serviceTimes?.find((t) => t.open) ? `${v.serviceTimes.find((t) => t.open)!.openTime} - ${v.serviceTimes.find((t) => t.open)!.closeTime}` : "7AM - 8PM",
      products: v.products.filter((p) => p.available).map((p) => `${p.size} ${p.name.includes("Hard") ? "Hard" : p.name.includes("Soft") ? "Soft" : p.name}`),
      brands: v.brands || [],
      areasServed: v.areasServed || [],
      businessRegNo: v.businessRegNo || "",
      mpesaNumber: v.mpesaNumber || "",
      phoneNumbers: v.phoneNumbers || [],
      locations: v.locations || [],
    }));
  }

  const { data: vendors, error } = await supabase
    .from("vendors")
    .select("*, vendor_locations(*)")
    .eq("active", true);

  if (error || !vendors) {
    console.error("Error fetching vendors:", error);
    return [];
  }

  return vendors.map((v: Record<string, unknown>) => ({
    id: v.id as string,
    name: v.name as string,
    area: v.area as string,
    distance: "",
    hours: (v.hours as string) || "7AM - 8PM",
    products: (v.products as string[]) || [],
    brands: (v.brands as string[]) || [],
    areasServed: (v.areas_served as string[]) || [],
    businessRegNo: (v.business_reg_no as string) || "",
    mpesaNumber: (v.mpesa_number as string) || "",
    phoneNumbers: (v.phone_numbers as string[]) || [],
    locations: ((v.vendor_locations as Array<Record<string, unknown>>) || []).map((l) => ({
      id: l.id as string,
      name: l.name as string,
      area: l.area as string,
      lat: Number(l.lat),
      lng: Number(l.lng),
    })),
  }));
}

// ── Fetch orders for vendor portal ──
export async function fetchVendorOrders(vendorId: string): Promise<OrderRecord[]> {
  if (!hasSupabaseConfig) {
    // Auto-assign any unassigned paid orders to a vendor
    const allOrders = getMockOrders();
    let changed = false;
    for (const o of allOrders) {
      if (o.status === "paid" && !o.vendor_id && !o.current_vendor_offer) {
        // Trigger auto-assignment
        await assignOrderToVendor(o.id);
        changed = true;
      }
    }
    const orders = changed ? getMockOrders() : allOrders;
    return orders
      .filter((o) =>
        o.current_vendor_offer === vendorId ||
        o.vendor_id === vendorId
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Fetch orders relevant to this vendor:
  // 1) Orders offered to this vendor (current_vendor_offer)
  // 2) Orders already assigned to this vendor (vendor_id)
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .or(`current_vendor_offer.eq.${vendorId},vendor_id.eq.${vendorId}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching vendor orders:", error);
    return [];
  }
  return data || [];
}

export async function updateVendorOrderStatus(orderId: string, status: string) {
  if (!hasSupabaseConfig) {
    const orders = getMockOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx !== -1) {
      orders[idx].status = status;
      orders[idx].updated_at = new Date().toISOString();
      saveMockOrders(orders);
    }
    return;
  }

  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) console.error("Error updating order status:", error);
}

export interface VendorStats {
  todayOrders: number;
  todayRevenue: number;
  totalOrders: number;
  totalRevenue: number;
  avgDeliveryMinutes: number;
}

export async function fetchVendorStats(vendorId: string, orders: OrderRecord[]): Promise<VendorStats> {
  const today = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter((o) => o.created_at.startsWith(today));

  return {
    todayOrders: todayOrders.length,
    todayRevenue: todayOrders.reduce((sum, o) => sum + o.price_total, 0),
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, o) => sum + o.price_total, 0),
    avgDeliveryMinutes: orders.length > 0 ? 28 : 0,
  };
}

// ── Haversine distance (km) ──
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getClosestLocation(vendor: VendorInfo, deliveryLat?: number, deliveryLng?: number): StoreLocation {
  if (!deliveryLat || !deliveryLng || vendor.locations.length <= 1) {
    return vendor.locations[0];
  }
  let closest = vendor.locations[0];
  let minDist = Infinity;
  for (const loc of vendor.locations) {
    const d = haversineKm(deliveryLat, deliveryLng, loc.lat, loc.lng);
    if (d < minDist) { minDist = d; closest = loc; }
  }
  return closest;
}

// ── Vendor Routing ──

/**
 * Assign order to the best matching vendor.
 * Priority: brand match > proximity > rating.
 * Skips vendors already tried.
 */
export async function assignOrderToVendor(orderId: string): Promise<{ vendorId: string; vendorName: string } | null> {
  if (!hasSupabaseConfig) {
    const orders = getMockOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return null;

    const order = orders[idx];
    const triedIds = order.vendors_tried || [];
    const brandPref = order.brand_preference || [];
    const deliveryLat = order.delivery_address_details?.lat;
    const deliveryLng = order.delivery_address_details?.lng;

    // Score each untried vendor (including vendorStore vendors)
    const allVendors = await fetchVendors();
    const candidates = allVendors
      .filter((v) => !triedIds.includes(v.id))
      .map((v) => {
        let score = 0;
        // Brand match: +10 per matching brand
        if (brandPref.length > 0) {
          const matches = brandPref.filter((b: string) => v.brands.includes(b)).length;
          score += matches * 10;
        }
        // Proximity: closer = higher score (max 5 points)
        if (deliveryLat && deliveryLng) {
          const closest = getClosestLocation(v, deliveryLat, deliveryLng);
          const dist = haversineKm(deliveryLat, deliveryLng, closest.lat, closest.lng);
          score += Math.max(0, 5 - dist); // 5 points at 0km, 0 points at 5km+
        }
        return { vendor: v, score };
      })
      .sort((a, b) => b.score - a.score);

    if (candidates.length === 0) return null;
    const nextVendor = candidates[0].vendor;

    orders[idx].current_vendor_offer = nextVendor.id;
    orders[idx].updated_at = new Date().toISOString();
    saveMockOrders(orders);
    return { vendorId: nextVendor.id, vendorName: nextVendor.name };
  }

  // Supabase path: fetch order, vendors + locations + service times, score, assign
  const attempt = async (): Promise<{ vendorId: string; vendorName: string } | null> => {
    const { data: order } = await supabase
      .from("orders")
      .select("vendors_tried, brand_preference, delivery_address_details, scheduled_date, scheduled_time")
      .eq("id", orderId)
      .single();
    if (!order) return null;

    const triedIds = (order.vendors_tried as string[]) || [];
    const brandPref = (order.brand_preference as string[]) || [];
    const addrDetails = order.delivery_address_details as { lat?: number; lng?: number; neighbourhood?: string } | null;
    const deliveryLat = addrDetails?.lat;
    const deliveryLng = addrDetails?.lng;
    const deliveryArea = addrDetails?.neighbourhood || "";

    const { data: vendors } = await supabase
      .from("vendors")
      .select("id, name, brands, areas_served, vendor_locations(lat, lng), vendor_service_times(day, open, open_time, close_time)")
      .eq("active", true);

    if (!vendors || vendors.length === 0) return null;

    // Determine which day/time to check (Kenya time UTC+3)
    const kenyaNow = new Date(Date.now() + 3 * 60 * 60 * 1000);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = dayNames[kenyaNow.getUTCDay()];
    const currentTime = `${kenyaNow.getUTCHours().toString().padStart(2, "0")}:${kenyaNow.getUTCMinutes().toString().padStart(2, "0")}`;

    // For scheduled orders, check the scheduled day/time instead
    let checkDay = currentDay;
    let checkTime = currentTime;
    if (order.scheduled_date) {
      const schedDate = new Date(order.scheduled_date as string);
      checkDay = dayNames[schedDate.getDay()];
      if (order.scheduled_time) checkTime = order.scheduled_time as string;
    }

    // Score each untried vendor
    type ServiceTime = { day: string; open: boolean; open_time: string; close_time: string };
    type VendorRow = { id: string; name: string; brands?: string[]; areas_served?: string[]; vendor_locations?: Array<{ lat: number; lng: number }>; vendor_service_times?: ServiceTime[] };
    const candidates = (vendors as VendorRow[])
      .filter((v) => {
        if (triedIds.includes(v.id)) return false;
        // Check service times — if vendor has schedule data, ensure they're open
        if (v.vendor_service_times && v.vendor_service_times.length > 0) {
          const dayEntry = v.vendor_service_times.find((st) => st.day === checkDay);
          if (!dayEntry || !dayEntry.open) return false;
          if (checkTime < dayEntry.open_time || checkTime > dayEntry.close_time) return false;
        }
        return true;
      })
      .map((v) => {
        let score = 0;

        // Brand match: +10 per matching brand
        if (brandPref.length > 0) {
          const matches = brandPref.filter((b) => (v.brands || []).includes(b)).length;
          score += matches * 10;
        }

        // Area match: +8 if vendor serves delivery neighbourhood
        if (deliveryArea && (v.areas_served || []).some((a) => a.toLowerCase() === deliveryArea.toLowerCase())) {
          score += 8;
        }

        // Proximity: closer = higher score (max 5 points)
        if (deliveryLat && deliveryLng && v.vendor_locations && v.vendor_locations.length > 0) {
          let minDist = Infinity;
          for (const loc of v.vendor_locations) {
            const d = haversineKm(deliveryLat, deliveryLng, loc.lat, loc.lng);
            if (d < minDist) minDist = d;
          }
          score += Math.max(0, 5 - minDist);
        }

        return { vendor: v, score };
      })
      .sort((a, b) => b.score - a.score);

    if (candidates.length === 0) return null;
    const next = candidates[0].vendor;

    await supabase.from("orders").update({
      current_vendor_offer: next.id,
      updated_at: new Date().toISOString(),
    }).eq("id", orderId);

    return { vendorId: next.id, vendorName: next.name };
  };

  // Retry up to 2 times with timeout
  for (let i = 0; i < 2; i++) {
    try {
      const result = await Promise.race([
        attempt(),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Vendor assignment timeout")), 10000)),
      ]);
      return result;
    } catch (e) {
      console.error(`assignOrderToVendor attempt ${i + 1} failed:`, e);
      if (i === 0) await new Promise((r) => setTimeout(r, 1000)); // brief delay before retry
    }
  }
  return null;
}

export async function acceptOrder(
  orderId: string,
  vendorId: string,
  estimatedMinutes: number,
  storeLocationId?: string
): Promise<void> {
  if (!hasSupabaseConfig) {
    // Look up vendor from all sources: vendorStore (dynamic) + mock vendors
    const allVendors = await fetchVendors();
    const vendor = allVendors.find((v) => v.id === vendorId);
    if (!vendor) return;
    let store: StoreLocation;
    if (storeLocationId) {
      store = vendor.locations.find((l) => l.id === storeLocationId) || vendor.locations[0];
    } else {
      store = vendor.locations[0] || { id: "", name: vendor.name, area: vendor.area, lat: -1.2921, lng: 36.8219 };
    }
    await updateOrder(orderId, {
      vendor_id: vendorId,
      vendor_name: vendor.name,
      vendor_location: `${store.name}, ${store.area}`,
      estimated_delivery_minutes: estimatedMinutes,
      current_vendor_offer: null,
      status: "confirmed",
    });
    return;
  }

  let vendorName = "Vendor";
  let locationStr = "";

  const { data: vendor } = await supabase.from("vendors").select("name").eq("id", vendorId).single();
  if (vendor) vendorName = vendor.name;

  if (storeLocationId) {
    const { data: loc } = await supabase.from("vendor_locations").select("name, area").eq("id", storeLocationId).single();
    if (loc) locationStr = `${loc.name}, ${loc.area}`;
  }

  await supabase.from("orders").update({
    vendor_id: vendorId,
    vendor_name: vendorName,
    vendor_location: locationStr,
    estimated_delivery_minutes: estimatedMinutes,
    current_vendor_offer: null,
    status: "confirmed",
    updated_at: new Date().toISOString(),
  }).eq("id", orderId);
}

export async function rejectOrder(orderId: string, vendorId: string): Promise<{ nextVendor: string | null; allRejected: boolean }> {
  if (!hasSupabaseConfig) {
    const orders = getMockOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return { nextVendor: null, allRejected: false };

    const order = orders[idx];
    const triedIds = order.vendors_tried || [];
    if (!triedIds.includes(vendorId)) triedIds.push(vendorId);
    orders[idx].vendors_tried = triedIds;
    orders[idx].current_vendor_offer = null;
    orders[idx].updated_at = new Date().toISOString();
    saveMockOrders(orders);

    const result = await assignOrderToVendor(orderId);
    if (!result) {
      // All vendors rejected — mark order so admin can see
      orders[idx].status = "pending_payment"; // revert to pending for admin attention
      saveMockOrders(orders);
      return { nextVendor: null, allRejected: true };
    }
    return { nextVendor: result.vendorName, allRejected: false };
  }

  const { data: order } = await supabase.from("orders").select("vendors_tried, customer_id").eq("id", orderId).single();
  if (!order) return { nextVendor: null, allRejected: false };

  const triedIds = (order.vendors_tried as string[]) || [];
  if (!triedIds.includes(vendorId)) triedIds.push(vendorId);

  await supabase.from("orders").update({
    vendors_tried: triedIds,
    current_vendor_offer: null,
    updated_at: new Date().toISOString(),
  }).eq("id", orderId);

  const result = await assignOrderToVendor(orderId);
  if (!result) {
    // All vendors rejected — notify customer and flag for admin
    try {
      await supabase.from("notifications").insert({
        user_id: order.customer_id as string,
        type: "order_update",
        title: "Vendor Unavailable",
        message: "We're having trouble finding a vendor for your order. Our team has been notified and will assign one shortly.",
        order_id: orderId,
      });
    } catch (e) {
      console.error("Failed to create notification:", e);
    }
    return { nextVendor: null, allRejected: true };
  }
  return { nextVendor: result.vendorName, allRejected: false };
}
