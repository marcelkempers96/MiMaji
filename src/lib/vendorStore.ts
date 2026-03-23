/**
 * Shared vendor data store — used by hidden-admin, vendor-portal, and auth.
 * All vendor data (profile, products, prices, service times, credentials)
 * is persisted in localStorage and shared across devices via the same keys.
 */

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

// ── CRUD operations ──

export function loadVendorStore(): VendorRecord[] {
  try {
    const raw = localStorage.getItem(VENDOR_STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveVendorStore(vendors: VendorRecord[]) {
  try { localStorage.setItem(VENDOR_STORE_KEY, JSON.stringify(vendors)); } catch {}
}

export function getVendorById(vendorId: string): VendorRecord | null {
  return loadVendorStore().find((v) => v.id === vendorId) || null;
}

export function getVendorByPhone(phone: string): VendorRecord | null {
  const normalized = normalizePhone(phone);
  return loadVendorStore().find((v) => v.credentials.phone === normalized || v.phone === normalized) || null;
}

/**
 * Create a new vendor with just name + phone.
 * Auto-generates credentials (PIN) and default products/times.
 * Returns the created vendor with login credentials.
 */
export function createVendor(name: string, phone: string): VendorRecord {
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

  // Save to vendor store
  const vendors = loadVendorStore();
  vendors.push(vendor);
  saveVendorStore(vendors);

  // Register vendor in mock signups so they can log in
  registerVendorAuth(vendor);

  return vendor;
}

/**
 * Register vendor credentials in the mock auth system
 * so they can log in via vendor-login page.
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
 * Update a vendor record. Merges partial updates.
 */
export function updateVendor(vendorId: string, updates: Partial<VendorRecord>): VendorRecord | null {
  const vendors = loadVendorStore();
  const idx = vendors.findIndex((v) => v.id === vendorId);
  if (idx === -1) return null;

  vendors[idx] = { ...vendors[idx], ...updates, updatedAt: new Date().toISOString() };
  saveVendorStore(vendors);

  // If name changed, update auth too
  if (updates.name || updates.credentials) {
    registerVendorAuth(vendors[idx]);
  }

  return vendors[idx];
}

/**
 * Delete a vendor
 */
export function deleteVendor(vendorId: string): VendorRecord[] {
  const vendors = loadVendorStore().filter((v) => v.id !== vendorId);
  saveVendorStore(vendors);

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
 * Checks vendor store first, then falls back to legacy localStorage.
 */
export function getVendorSettingsByUserId(userId: string): VendorRecord | null {
  const vendors = loadVendorStore();
  return vendors.find((v) => v.id === userId) || null;
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
