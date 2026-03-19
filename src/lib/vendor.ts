import { supabase } from "./supabase";
import { OrderRecord, updateOrder } from "./orders";

const hasSupabaseConfig =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

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
  rating: number;
  reviews: number;
  hours: string;
  products: string[];
  businessRegNo: string;
  mpesaNumber: string;
  phoneNumbers: string[];
  locations: StoreLocation[];
}

// ── Mock vendor list with multi-location support ──
export const MOCK_VENDORS: VendorInfo[] = [
  {
    id: "v1", name: "AquaPure Kilimani", area: "Kilimani, Nairobi", distance: "0.8 km", rating: 4.8, reviews: 156, hours: "6AM - 9PM",
    products: ["20L Hard", "20L Soft", "10L Soft", "5L Soft"],
    businessRegNo: "BN-2024-001234", mpesaNumber: "254700111222", phoneNumbers: ["+254700111222", "+254700111223"],
    locations: [
      { id: "v1-loc1", name: "AquaPure Kilimani Main", area: "Kilimani, Nairobi", lat: -1.2921, lng: 36.7877 },
      { id: "v1-loc2", name: "AquaPure Hurlingham", area: "Hurlingham, Nairobi", lat: -1.2975, lng: 36.7950 },
    ],
  },
  {
    id: "v2", name: "WaterPoint Westlands", area: "Westlands, Nairobi", distance: "1.2 km", rating: 4.6, reviews: 89, hours: "7AM - 8PM",
    products: ["20L Hard", "20L Soft", "10L Soft"],
    businessRegNo: "BN-2024-002345", mpesaNumber: "254700222333", phoneNumbers: ["+254700222333"],
    locations: [
      { id: "v2-loc1", name: "WaterPoint Westlands", area: "Westlands, Nairobi", lat: -1.2673, lng: 36.8110 },
    ],
  },
  {
    id: "v3", name: "CleanWater Hub", area: "Lavington, Nairobi", distance: "2.1 km", rating: 4.9, reviews: 234, hours: "6AM - 10PM",
    products: ["20L Hard", "20L Soft", "10L Soft", "5L Soft"],
    businessRegNo: "BN-2024-003456", mpesaNumber: "254700333444", phoneNumbers: ["+254700333444", "+254700333445"],
    locations: [
      { id: "v3-loc1", name: "CleanWater Hub Lavington", area: "Lavington, Nairobi", lat: -1.2786, lng: 36.7718 },
      { id: "v3-loc2", name: "CleanWater Hub Kileleshwa", area: "Kileleshwa, Nairobi", lat: -1.2750, lng: 36.7810 },
      { id: "v3-loc3", name: "CleanWater Hub South C", area: "South C, Nairobi", lat: -1.3100, lng: 36.8250 },
    ],
  },
  {
    id: "v4", name: "Maji Fresh Karen", area: "Karen, Nairobi", distance: "5.3 km", rating: 4.7, reviews: 67, hours: "7AM - 9PM",
    products: ["20L Hard", "20L Soft"],
    businessRegNo: "BN-2024-004567", mpesaNumber: "254700444555", phoneNumbers: ["+254700444555"],
    locations: [
      { id: "v4-loc1", name: "Maji Fresh Karen", area: "Karen, Nairobi", lat: -1.3226, lng: 36.7126 },
    ],
  },
  {
    id: "v5", name: "PureDrops CBD", area: "CBD, Nairobi", distance: "3.8 km", rating: 4.5, reviews: 112, hours: "6AM - 8PM",
    products: ["20L Soft", "10L Soft", "5L Soft"],
    businessRegNo: "BN-2024-005678", mpesaNumber: "254700555666", phoneNumbers: ["+254700555666", "+254700555667"],
    locations: [
      { id: "v5-loc1", name: "PureDrops CBD", area: "CBD, Nairobi", lat: -1.2864, lng: 36.8172 },
      { id: "v5-loc2", name: "PureDrops Upperhill", area: "Upperhill, Nairobi", lat: -1.2950, lng: 36.8180 },
    ],
  },
];

// ── Fetch all active vendors ──
export async function fetchVendors(): Promise<VendorInfo[]> {
  if (!hasSupabaseConfig) return MOCK_VENDORS;

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
    rating: Number(v.rating) || 0,
    reviews: Number(v.reviews) || 0,
    hours: (v.hours as string) || "7AM - 8PM",
    products: (v.products as string[]) || [],
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
    return getMockOrders()
      .filter((o) =>
        o.current_vendor_offer === vendorId ||
        o.vendor_id === vendorId ||
        (o.status === "paid" && !o.vendor_id && !o.current_vendor_offer)
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
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

export async function assignOrderToVendor(orderId: string): Promise<{ vendorId: string; vendorName: string } | null> {
  if (!hasSupabaseConfig) {
    const orders = getMockOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return null;

    const order = orders[idx];
    const triedIds = order.vendors_tried || [];
    const nextVendor = MOCK_VENDORS.find((v) => !triedIds.includes(v.id));
    if (!nextVendor) return null;

    orders[idx].current_vendor_offer = nextVendor.id;
    orders[idx].updated_at = new Date().toISOString();
    saveMockOrders(orders);
    return { vendorId: nextVendor.id, vendorName: nextVendor.name };
  }

  const { data: order } = await supabase.from("orders").select("vendors_tried").eq("id", orderId).single();
  if (!order) return null;

  const triedIds = (order.vendors_tried as string[]) || [];
  const { data: vendors } = await supabase
    .from("vendors").select("id, name").eq("active", true).order("rating", { ascending: false });

  if (!vendors) return null;
  const next = vendors.find((v: { id: string }) => !triedIds.includes(v.id));
  if (!next) return null;

  await supabase.from("orders").update({
    current_vendor_offer: next.id,
    updated_at: new Date().toISOString(),
  }).eq("id", orderId);

  return { vendorId: next.id, vendorName: next.name };
}

export async function acceptOrder(
  orderId: string,
  vendorId: string,
  estimatedMinutes: number,
  storeLocationId?: string
): Promise<void> {
  if (!hasSupabaseConfig) {
    const vendor = MOCK_VENDORS.find((v) => v.id === vendorId);
    if (!vendor) return;
    let store: StoreLocation;
    if (storeLocationId) {
      store = vendor.locations.find((l) => l.id === storeLocationId) || vendor.locations[0];
    } else {
      store = vendor.locations[0];
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

export async function rejectOrder(orderId: string, vendorId: string): Promise<{ nextVendor: string | null }> {
  if (!hasSupabaseConfig) {
    const orders = getMockOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return { nextVendor: null };

    const order = orders[idx];
    const triedIds = order.vendors_tried || [];
    if (!triedIds.includes(vendorId)) triedIds.push(vendorId);
    orders[idx].vendors_tried = triedIds;
    orders[idx].current_vendor_offer = null;
    orders[idx].updated_at = new Date().toISOString();
    saveMockOrders(orders);

    const result = await assignOrderToVendor(orderId);
    return { nextVendor: result?.vendorName || null };
  }

  const { data: order } = await supabase.from("orders").select("vendors_tried").eq("id", orderId).single();
  if (!order) return { nextVendor: null };

  const triedIds = (order.vendors_tried as string[]) || [];
  if (!triedIds.includes(vendorId)) triedIds.push(vendorId);

  await supabase.from("orders").update({
    vendors_tried: triedIds,
    current_vendor_offer: null,
    updated_at: new Date().toISOString(),
  }).eq("id", orderId);

  const result = await assignOrderToVendor(orderId);
  return { nextVendor: result?.vendorName || null };
}
