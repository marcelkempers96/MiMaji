/**
 * Shared vendor data store — used by hidden-admin, vendor-portal, and auth.
 *
 * Supabase-first: All vendor data is persisted in Supabase (vendors,
 * vendor_products, vendor_service_times, vendor_locations tables).
 * localStorage is used as a cache for instant loading and as a fallback
 * when Supabase is not configured.
 */

import { supabase } from "./supabase";

const hasSupabaseConfig =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

export interface VendorProduct {
  id: string;
  name: string;       // e.g. "20L Hard Jug", "18.9L Soft Bottle", "1.5L Bottle"
  size: string;       // e.g. "20L", "18.9L", "1.5L", "1L", "500ML"
  priceNew: number;   // Price for new/sealed bottle
  priceRefill: number; // Price for refill (0 if N/A)
  available: boolean;
}

export interface ServiceDay {
  day: string;        // "Monday", "Tuesday", etc.
  open: boolean;
  openTime: string;   // e.g. "07:00"
  closeTime: string;  // e.g. "20:00"
}

export interface VendorCredentials {
  phone: string;      // Normalized phone (254...)
  pin: string;        // 4-digit PIN for vendor login
}

export interface VendorRecord {
  id: string;
  name: string;
  area: string;
  phone: string;        // Primary phone
  credentials: VendorCredentials;
  businessRegNo: string;
  mpesaNumber: string;
  phoneNumbers: string[];
  rating: number;
  reviews: number;
  products: VendorProduct[];
  brands: string[];
  areasServed: string[];
  serviceTimes: ServiceDay[];
  locations: Array<{ id: string; name: string; area: string; lat: number; lng: number }>;
  deliveryRadius: number;
  description: string;
  minOrder: string;
  createdAt: string;
  updatedAt: string;
}

const VENDOR_STORE_KEY = "mimaji_vendor_store";

// Default service times (Mon-Sun, 7AM-8PM)
export function defaultServiceTimes(): ServiceDay[] {
  return [
    { day: "Monday", open: true, openTime: "07:00", closeTime: "20:00" },
    { day: "Tuesday", open: true, openTime: "07:00", closeTime: "20:00" },
    { day: "Wednesday", open: true, openTime: "07:00", closeTime: "20:00" },
    { day: "Thursday", open: true, openTime: "07:00", closeTime: "20:00" },
    { day: "Friday", open: true, openTime: "07:00", closeTime: "20:00" },
    { day: "Saturday", open: true, openTime: "08:00", closeTime: "18:00" },
    { day: "Sunday", open: false, openTime: "09:00", closeTime: "16:00" },
  ];
}

// Default product catalog for new vendors
export function defaultVendorProducts(): VendorProduct[] {
  return [
    { id: "vp-20l-hard", name: "20L Hard Jug", size: "20L", priceNew: 1500, priceRefill: 290, available: true },
    { id: "vp-189l-hard", name: "18.9L Hard Jug", size: "18.9L", priceNew: 1400, priceRefill: 250, available: true },
    { id: "vp-20l-soft", name: "20L Soft Bottle", size: "20L", priceNew: 500, priceRefill: 280, available: true },
    { id: "vp-189l-soft", name: "18.9L Soft Bottle", size: "18.9L", priceNew: 450, priceRefill: 240, available: true },
    { id: "vp-10l-hard", name: "10L Hard Jug", size: "10L", priceNew: 180, priceRefill: 0, available: false },
    { id: "vp-10l-soft", name: "10L Soft Bottle", size: "10L", priceNew: 150, priceRefill: 0, available: false },
    { id: "vp-5l-soft", name: "5L Soft Bottle", size: "5L", priceNew: 80, priceRefill: 0, available: false },
    { id: "vp-15l", name: "1.5L Bottle", size: "1.5L", priceNew: 50, priceRefill: 0, available: false },
    { id: "vp-1l", name: "1L Bottle", size: "1L", priceNew: 40, priceRefill: 0, available: false },
    { id: "vp-500ml", name: "500ML Bottle", size: "500ML", priceNew: 25, priceRefill: 0, available: false },
  ];
}

// Generate a random 4-digit PIN
function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Normalize phone number to 254 format
function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\s/g, "").replace(/^\+/, "");
  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.slice(1);
  } else if (!cleaned.startsWith("254") && cleaned.length <= 9) {
    cleaned = "254" + cleaned;
  }
  return cleaned;
}

// ── localStorage cache helpers ──

function loadLocalCache(): VendorRecord[] {
  try {
    const raw = localStorage.getItem(VENDOR_STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocalCache(vendors: VendorRecord[]) {
  try { localStorage.setItem(VENDOR_STORE_KEY, JSON.stringify(vendors)); } catch {}
}

// ── Supabase <-> VendorRecord mapping ──

export function mapSupabaseToVendor(v: Record<string, unknown>): VendorRecord {
  const locations = ((v.vendor_locations as Array<Record<string, unknown>>) || []).map((l) => ({
    id: l.id as string,
    name: l.name as string,
    area: (l.area as string) || "",
    lat: Number(l.lat) || -1.2921,
    lng: Number(l.lng) || 36.8219,
  }));

  const products = ((v.vendor_products as Array<Record<string, unknown>>) || []).map((p) => ({
    id: p.id as string,
    name: p.name as string,
    size: p.size as string,
    priceNew: Number(p.price_new) || 0,
    priceRefill: Number(p.price_refill) || 0,
    available: p.available !== false,
  }));

  const serviceTimes = ((v.vendor_service_times as Array<Record<string, unknown>>) || []).map((st) => ({
    day: st.day as string,
    open: st.open !== false,
    openTime: (st.open_time as string) || "07:00",
    closeTime: (st.close_time as string) || "20:00",
  }));

  return {
    id: v.id as string,
    name: (v.name as string) || "",
    area: (v.area as string) || "",
    phone: ((v.phone_numbers as string[]) || [])[0] || "",
    credentials: {
      phone: ((v.phone_numbers as string[]) || [])[0] || "",
      pin: (v.pin as string) || "",
    },
    businessRegNo: (v.business_reg_no as string) || "",
    mpesaNumber: (v.mpesa_number as string) || "",
    phoneNumbers: (v.phone_numbers as string[]) || [],
    rating: Number(v.rating) || 5.0,
    reviews: Number(v.reviews) || 0,
    products: products.length > 0 ? products : defaultVendorProducts(),
    brands: (v.brands as string[]) || [],
    areasServed: (v.areas_served as string[]) || [],
    serviceTimes: serviceTimes.length > 0 ? serviceTimes : defaultServiceTimes(),
    locations,
    deliveryRadius: Number(v.delivery_radius_km) || 10,
    description: (v.description as string) || "",
    minOrder: (v.min_order as string) || "",
    createdAt: (v.created_at as string) || new Date().toISOString(),
    updatedAt: (v.updated_at as string) || new Date().toISOString(),
  };
}

// ── CRUD operations (Supabase-first, localStorage fallback) ──

/**
 * Load all vendors. Tries Supabase first, falls back to localStorage.
 */
export function loadVendorStore(): VendorRecord[] {
  // Return cache immediately (synchronous API preserved for compatibility)
  return loadLocalCache();
}

/**
 * Async load: fetches from Supabase and updates local cache.
 */
export async function loadVendorStoreAsync(): Promise<VendorRecord[]> {
  if (!hasSupabaseConfig) return loadLocalCache();

  try {
    const { data, error } = await supabase
      .from("vendors")
      .select("*, vendor_locations(*), vendor_products(*), vendor_service_times(*)")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return loadLocalCache();

    const vendors = data.map((v: Record<string, unknown>) => mapSupabaseToVendor(v));
    saveLocalCache(vendors); // Update cache
    return vendors;
  } catch (e) {
    console.error("Failed to load vendors from Supabase:", e);
    return loadLocalCache();
  }
}

export function saveVendorStore(vendors: VendorRecord[]) {
  saveLocalCache(vendors);
}

export function getVendorById(vendorId: string): VendorRecord | null {
  return loadLocalCache().find((v) => v.id === vendorId) || null;
}

export async function getVendorByIdAsync(vendorId: string): Promise<VendorRecord | null> {
  if (!hasSupabaseConfig) return getVendorById(vendorId);

  try {
    const { data, error } = await supabase
      .from("vendors")
      .select("*, vendor_locations(*), vendor_products(*), vendor_service_times(*)")
      .eq("id", vendorId)
      .maybeSingle();

    if (error || !data) return getVendorById(vendorId);
    return mapSupabaseToVendor(data as Record<string, unknown>);
  } catch {
    return getVendorById(vendorId);
  }
}

export function getVendorByPhone(phone: string): VendorRecord | null {
  const normalized = normalizePhone(phone);
  return loadLocalCache().find((v) => v.credentials.phone === normalized || v.phone === normalized) || null;
}

export async function getVendorByPhoneAsync(phone: string): Promise<VendorRecord | null> {
  if (!hasSupabaseConfig) return getVendorByPhone(phone);

  const normalized = normalizePhone(phone);
  try {
    const { data, error } = await supabase
      .from("vendors")
      .select("*, vendor_locations(*), vendor_products(*), vendor_service_times(*)")
      .contains("phone_numbers", [normalized])
      .maybeSingle();

    if (error || !data) return getVendorByPhone(phone);
    return mapSupabaseToVendor(data as Record<string, unknown>);
  } catch {
    return getVendorByPhone(phone);
  }
}

/**
 * Create a new vendor with just name + phone.
 * Calls the server-side admin API which uses the service role to:
 * 1. Create a real Supabase auth user (so vendor can log in from any device)
 * 2. Create a profile with role "vendor"
 * 3. Create the vendor record with PIN
 * 4. Insert default products and service times
 */
export async function createVendorAsync(name: string, phone: string): Promise<VendorRecord> {
  const normalizedPhone = normalizePhone(phone);
  const pin = generatePin();
  const now = new Date().toISOString();

  if (hasSupabaseConfig) {
    try {
      // Call server-side API to create vendor (uses service role — bypasses RLS,
      // creates auth user without affecting admin session)
      // Read admin code from sessionStorage (set during admin login)
      let adminCode = "";
      try { adminCode = sessionStorage.getItem("mimaji_admin_code") || ""; } catch {}
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: adminCode,
          action: "create_vendor",
          name,
          phone: normalizedPhone,
          pin,
        }),
      });
      const result = await res.json();
      if (!res.ok || result.error) throw new Error(result.error || "Failed to create vendor");

      const vendorId = result.vendorId;
      const defaultProducts = defaultVendorProducts();
      const defaultTimes = defaultServiceTimes();

      // Build the local record (server already created everything in Supabase)
      const vendor: VendorRecord = {
        id: vendorId,
        name,
        area: "",
        phone: normalizedPhone,
        credentials: { phone: normalizedPhone, pin },
        businessRegNo: "",
        mpesaNumber: "",
        phoneNumbers: [normalizedPhone],
        rating: 5.0,
        reviews: 0,
        products: defaultProducts,
        brands: [],
        areasServed: [],
        serviceTimes: defaultTimes,
        locations: [],
        deliveryRadius: 10,
        description: "",
        minOrder: "",
        createdAt: now,
        updatedAt: now,
      };

      // Update local cache
      const cached = loadLocalCache();
      cached.push(vendor);
      saveLocalCache(cached);

      // Also register in mock signups as fallback
      registerVendorAuth(vendor);

      return vendor;
    } catch (e) {
      console.error("Supabase vendor creation failed, falling back to localStorage:", e);
    }
  }

  // Fallback: localStorage-only
  return createVendorLocal(name, phone);
}

/** Synchronous localStorage-only vendor creation (fallback) */
export function createVendor(name: string, phone: string): VendorRecord {
  return createVendorLocal(name, phone);
}

function createVendorLocal(name: string, phone: string): VendorRecord {
  const normalizedPhone = normalizePhone(phone);
  const pin = generatePin();
  const vendorId = `vendor-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();

  const vendor: VendorRecord = {
    id: vendorId,
    name,
    area: "",
    phone: normalizedPhone,
    credentials: { phone: normalizedPhone, pin },
    businessRegNo: "",
    mpesaNumber: "",
    phoneNumbers: [normalizedPhone],
    rating: 5.0,
    reviews: 0,
    products: defaultVendorProducts(),
    brands: [],
    areasServed: [],
    serviceTimes: defaultServiceTimes(),
    locations: [],
    deliveryRadius: 10,
    description: "",
    minOrder: "",
    createdAt: now,
    updatedAt: now,
  };

  const vendors = loadLocalCache();
  vendors.push(vendor);
  saveLocalCache(vendors);
  registerVendorAuth(vendor);
  return vendor;
}

/**
 * Register vendor credentials in the mock auth system
 * so they can log in via vendor-login page (localStorage fallback).
 */
export function registerVendorAuth(vendor: VendorRecord) {
  try {
    const raw = localStorage.getItem("mimaji_mock_signups");
    const signups = raw ? JSON.parse(raw) : {};
    const phone = vendor.credentials.phone;
    const user = {
      id: vendor.id,
      phone,
      name: vendor.name,
      role: "vendor",
    };
    signups[phone] = { pin: vendor.credentials.pin, user };
    // Also save under 0-prefix format
    if (phone.startsWith("254")) {
      signups["0" + phone.slice(3)] = { pin: vendor.credentials.pin, user };
    }
    localStorage.setItem("mimaji_mock_signups", JSON.stringify(signups));
  } catch {}
}

/**
 * Update a vendor record. Syncs to Supabase and local cache.
 */
export async function updateVendorAsync(vendorId: string, updates: Partial<VendorRecord>): Promise<VendorRecord | null> {
  // Always update local cache first for instant feedback
  const localResult = updateVendorLocal(vendorId, updates);

  if (!hasSupabaseConfig || !localResult) return localResult;

  try {
    // Update main vendor fields
    const vendorUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) vendorUpdate.name = updates.name;
    if (updates.area !== undefined) vendorUpdate.area = updates.area;
    if (updates.businessRegNo !== undefined) vendorUpdate.business_reg_no = updates.businessRegNo;
    if (updates.mpesaNumber !== undefined) vendorUpdate.mpesa_number = updates.mpesaNumber;
    if (updates.phoneNumbers !== undefined) vendorUpdate.phone_numbers = updates.phoneNumbers;
    if (updates.brands !== undefined) vendorUpdate.brands = updates.brands;
    if (updates.areasServed !== undefined) vendorUpdate.areas_served = updates.areasServed;
    if (updates.deliveryRadius !== undefined) vendorUpdate.delivery_radius_km = updates.deliveryRadius;
    if (updates.description !== undefined) vendorUpdate.description = updates.description;
    if (updates.minOrder !== undefined) vendorUpdate.min_order = updates.minOrder;
    if (updates.rating !== undefined) vendorUpdate.rating = updates.rating;
    if (updates.reviews !== undefined) vendorUpdate.reviews = updates.reviews;

    if (Object.keys(vendorUpdate).length > 1) {
      await supabase.from("vendors").update(vendorUpdate).eq("id", vendorId);
    }

    // Update products if provided
    if (updates.products) {
      // Delete existing and re-insert
      await supabase.from("vendor_products").delete().eq("vendor_id", vendorId);
      if (updates.products.length > 0) {
        await supabase.from("vendor_products").insert(
          updates.products.map((p) => ({
            id: p.id,
            vendor_id: vendorId,
            name: p.name,
            size: p.size,
            price_new: p.priceNew,
            price_refill: p.priceRefill,
            available: p.available,
          }))
        );
      }
    }

    // Update service times if provided
    if (updates.serviceTimes) {
      await supabase.from("vendor_service_times").delete().eq("vendor_id", vendorId);
      if (updates.serviceTimes.length > 0) {
        await supabase.from("vendor_service_times").insert(
          updates.serviceTimes.map((st) => ({
            vendor_id: vendorId,
            day: st.day,
            open: st.open,
            open_time: st.openTime,
            close_time: st.closeTime,
          }))
        );
      }
    }

    // Update locations if provided
    if (updates.locations) {
      await supabase.from("vendor_locations").delete().eq("vendor_id", vendorId);
      if (updates.locations.length > 0) {
        await supabase.from("vendor_locations").insert(
          updates.locations.map((l) => ({
            id: l.id,
            vendor_id: vendorId,
            name: l.name,
            area: l.area,
            lat: l.lat,
            lng: l.lng,
          }))
        );
      }
    }
  } catch (e) {
    console.error("Failed to sync vendor update to Supabase:", e);
  }

  return localResult;
}

/** Synchronous local-only update */
export function updateVendor(vendorId: string, updates: Partial<VendorRecord>): VendorRecord | null {
  const result = updateVendorLocal(vendorId, updates);
  // Fire-and-forget Supabase sync
  if (hasSupabaseConfig && result) {
    updateVendorAsync(vendorId, updates).catch(console.error);
  }
  return result;
}

function updateVendorLocal(vendorId: string, updates: Partial<VendorRecord>): VendorRecord | null {
  const vendors = loadLocalCache();
  const idx = vendors.findIndex((v) => v.id === vendorId);
  if (idx === -1) return null;

  vendors[idx] = { ...vendors[idx], ...updates, updatedAt: new Date().toISOString() };
  saveLocalCache(vendors);

  if (updates.name || updates.credentials) {
    registerVendorAuth(vendors[idx]);
  }

  return vendors[idx];
}

/**
 * Delete a vendor. Removes from Supabase and local cache.
 */
export async function deleteVendorAsync(vendorId: string): Promise<VendorRecord[]> {
  const remaining = deleteVendorLocal(vendorId);

  if (hasSupabaseConfig) {
    try {
      // Cascade deletes vendor_products, vendor_service_times, vendor_locations
      await supabase.from("vendors").delete().eq("id", vendorId);
    } catch (e) {
      console.error("Failed to delete vendor from Supabase:", e);
    }
  }

  return remaining;
}

export function deleteVendor(vendorId: string): VendorRecord[] {
  const result = deleteVendorLocal(vendorId);
  if (hasSupabaseConfig) {
    deleteVendorAsync(vendorId).catch(console.error);
  }
  return result;
}

function deleteVendorLocal(vendorId: string): VendorRecord[] {
  const vendors = loadLocalCache().filter((v) => v.id !== vendorId);
  saveLocalCache(vendors);

  // Remove from mock signups
  try {
    const raw = localStorage.getItem("mimaji_mock_signups");
    const signups = raw ? JSON.parse(raw) : {};
    for (const [phone, entry] of Object.entries(signups)) {
      const e = entry as { pin: string; user: { id: string } };
      if (e.user.id === vendorId) {
        delete signups[phone];
      }
    }
    localStorage.setItem("mimaji_mock_signups", JSON.stringify(signups));
  } catch {}

  return vendors;
}

/**
 * Get vendor settings for the vendor portal (by user ID).
 * Checks local cache first, then Supabase.
 */
export function getVendorSettingsByUserId(userId: string): VendorRecord | null {
  const vendors = loadLocalCache();
  return vendors.find((v) => v.id === userId) || null;
}

export async function getVendorSettingsByUserIdAsync(userId: string): Promise<VendorRecord | null> {
  if (!hasSupabaseConfig) return getVendorSettingsByUserId(userId);

  try {
    // Try by vendor ID first
    let { data } = await supabase
      .from("vendors")
      .select("*, vendor_locations(*), vendor_products(*), vendor_service_times(*)")
      .eq("id", userId)
      .maybeSingle();

    // If not found by ID, try by profile_id
    if (!data) {
      const result = await supabase
        .from("vendors")
        .select("*, vendor_locations(*), vendor_products(*), vendor_service_times(*)")
        .eq("profile_id", userId)
        .maybeSingle();
      data = result.data;
    }

    if (data) {
      const vendor = mapSupabaseToVendor(data as Record<string, unknown>);
      return vendor;
    }
  } catch (e) {
    console.error("Failed to load vendor settings from Supabase:", e);
  }

  return getVendorSettingsByUserId(userId);
}

/**
 * Format phone for display (e.g. "0712 345 678")
 */
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return "";
  let p = phone;
  if (p.startsWith("254")) p = "0" + p.slice(3);
  if (p.length === 10) {
    return `${p.slice(0, 4)} ${p.slice(4, 7)} ${p.slice(7)}`;
  }
  return p;
}

/**
 * Format service times for display
 */
export function formatServiceTimesDisplay(times: ServiceDay[]): string {
  if (!times || times.length === 0) return "Not set";
  const openDays = times.filter((t) => t.open);
  if (openDays.length === 0) return "Closed";
  if (openDays.length === 7) {
    const allSame = openDays.every((t) => t.openTime === openDays[0].openTime && t.closeTime === openDays[0].closeTime);
    if (allSame) return `Daily ${formatTime(openDays[0].openTime)} - ${formatTime(openDays[0].closeTime)}`;
  }
  // Show condensed range
  const first = openDays[0];
  const last = openDays[openDays.length - 1];
  return `${first.day.slice(0, 3)}-${last.day.slice(0, 3)} ${formatTime(first.openTime)} - ${formatTime(first.closeTime)}`;
}

function formatTime(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
}
