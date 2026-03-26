"use client";

import { logo1 } from "@/assets/images";
import { useState, useEffect, useCallback } from "react";
import { Package, TrendingUp, Users, Clock, MapPin, Star, Bell, Settings, LogOut, CheckCircle, Truck, X, Timer, Plus, Trash2, MessageCircle, FileText, Phone, Mail, Headphones, Calendar, Navigation } from "lucide-react";
import AddressSearch from "@/components/AddressSearch";
import Image from "next/image";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { OrderRecord, formatOrderDate, formatOrderDateTime, formatOrderId, generateDeliveryCode } from "@/lib/orders";
import { fetchVendorOrders, updateVendorOrderStatus, VendorStats, fetchVendorStats, acceptOrder, rejectOrder, StoreLocation } from "@/lib/vendor";
import { supabase } from "@/lib/supabase";
import { waterBrands, NAIROBI_AREAS } from "@/data/products";
import { getVendorSettingsByUserId, getVendorSettingsByUserIdAsync, updateVendor as updateVendorStore, updateVendorAsync, VendorProduct, ServiceDay, defaultVendorProducts, defaultServiceTimes, formatServiceTimesDisplay } from "@/lib/vendorStore";

export default function VendorPortalPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"orders" | "stats" | "profile">("orders");
  const [activeDesktopTab, setActiveDesktopTab] = useState<"dashboard" | "orders" | "analytics" | "notifications" | "settings">("dashboard");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [stats, setStats] = useState<VendorStats | null>(null);

  // ETA Modal state
  const [etaModalOrderId, setEtaModalOrderId] = useState<string | null>(null);
  const [etaMinutes, setEtaMinutes] = useState(30);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");

  // Delivery code confirmation modal
  const [deliveryCodeModalOrder, setDeliveryCodeModalOrder] = useState<OrderRecord | null>(null);
  // Items popup
  const [itemsPopup, setItemsPopup] = useState<{ orderId: string; items: Array<{ name: string; quantity: number; price: number }>; total: number } | null>(null);
  const [deliveryCodeInput, setDeliveryCodeInput] = useState("");
  const [deliveryCodeError, setDeliveryCodeError] = useState("");
  const [deliveryCodeAttempts, setDeliveryCodeAttempts] = useState(0);
  const [deliveryCodeLocked, setDeliveryCodeLocked] = useState(false);

  // Settings state
  const [settingsBusinessName, setSettingsBusinessName] = useState("");
  const [settingsBusinessReg, setSettingsBusinessReg] = useState("");
  const [settingsMpesaNumber, setSettingsMpesaNumber] = useState("");
  const [settingsPhoneNumbers, setSettingsPhoneNumbers] = useState<string[]>([""]);
  const [settingsLocations, setSettingsLocations] = useState<Array<{ name: string; area: string; address: string; lat: number; lng: number }>>([{ name: "", area: "", address: "", lat: 0, lng: 0 }]);
  const [settingsHours, setSettingsHours] = useState("7:00 AM - 8:00 PM");
  const [settingsRadius, setSettingsRadius] = useState(10);
  const [settingsBrands, setSettingsBrands] = useState<string[]>([]);
  const [settingsProducts, setSettingsProducts] = useState<string[]>([]);
  const [settingsAreasServed, setSettingsAreasServed] = useState<string[]>([]);
  const [settingsCustomBrand, setSettingsCustomBrand] = useState("");
  const [settingsCustomProduct, setSettingsCustomProduct] = useState("");
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsSaveError, setSettingsSaveError] = useState("");

  // Additional business fields
  const [settingsArea, setSettingsArea] = useState("");
  const [settingsDescription, setSettingsDescription] = useState("");
  const [settingsMinOrder, setSettingsMinOrder] = useState("");

  // New: Product catalog with prices
  const [settingsProductCatalog, setSettingsProductCatalog] = useState<VendorProduct[]>(defaultVendorProducts());
  const [customProductName, setCustomProductName] = useState("");
  const [customProductSize, setCustomProductSize] = useState("");
  const [customProductPrice, setCustomProductPrice] = useState("");

  // New: Service times (Mon-Sun)
  const [settingsServiceTimes, setSettingsServiceTimes] = useState<ServiceDay[]>(defaultServiceTimes());

  const handleSaveSettings = async () => {
    try {
      const vendorSettings = {
        businessName: settingsBusinessName,
        businessReg: settingsBusinessReg,
        mpesaNumber: settingsMpesaNumber,
        phoneNumbers: settingsPhoneNumbers.filter(Boolean),
        locations: settingsLocations.filter((l) => l.name),
        hours: settingsHours,
        radius: settingsRadius,
        brands: settingsBrands,
        products: settingsProducts,
        areasServed: settingsAreasServed,
        productCatalog: settingsProductCatalog,
        serviceTimes: settingsServiceTimes,
      };

      // Save to vendorStore + Supabase (async, handles both)
      // Prefer vendorRecordId (actual vendors table UUID) over user.id (profile UUID)
      const vid = user?.vendorRecordId || user?.id;
      if (vid) {
        const result = await updateVendorAsync(vid, {
          name: settingsBusinessName,
          area: settingsArea,
          businessRegNo: settingsBusinessReg,
          mpesaNumber: settingsMpesaNumber,
          phoneNumbers: settingsPhoneNumbers.filter(Boolean),
          locations: settingsLocations.filter((l) => l.name).map((l, i) => ({
            id: `${user.id}-loc${i}`,
            name: l.name,
            area: l.area,
            lat: l.lat,
            lng: l.lng,
          })),
          deliveryRadius: settingsRadius,
          brands: settingsBrands,
          areasServed: settingsAreasServed,
          products: settingsProductCatalog,
          serviceTimes: settingsServiceTimes,
          description: settingsDescription,
          minOrder: settingsMinOrder,
        });
        if (!result.serverSynced) {
          setSettingsSaveError("Changes saved locally but failed to sync to server. Please try again.");
          setTimeout(() => setSettingsSaveError(""), 5000);
          return;
        }
      }
      // Also save to localStorage as cache
      localStorage.setItem(`mimaji_vendor_settings_${user?.id || "default"}`, JSON.stringify(vendorSettings));
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  };

  // Load vendor settings from Supabase or localStorage
  useEffect(() => {
    if (!user?.id) return;

    const loadFromSupabase = async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        // Try by vendorRecordId first (direct vendor table ID), then by profile_id
        const selectQuery = "*, vendor_locations(*), vendor_products(*), vendor_service_times(*)";
        let vendor = null;
        if (user.vendorRecordId) {
          const { data } = await supabase
            .from("vendors")
            .select(selectQuery)
            .eq("id", user.vendorRecordId)
            .maybeSingle();
          vendor = data;
        }
        if (!vendor) {
          const { data } = await supabase
            .from("vendors")
            .select(selectQuery)
            .eq("profile_id", user.id)
            .maybeSingle();
          vendor = data;
        }
        if (vendor) {
          setSettingsBusinessName(vendor.name || "");
          setSettingsArea(vendor.area || "");
          setSettingsBusinessReg(vendor.business_reg_no || "");
          setSettingsMpesaNumber(vendor.mpesa_number || "");
          setSettingsDescription(vendor.description || "");
          setSettingsMinOrder(vendor.min_order || "");
          setSettingsPhoneNumbers(vendor.phone_numbers?.length > 0 ? vendor.phone_numbers : [""]);
          if (vendor.vendor_locations?.length > 0) {
            setSettingsLocations(vendor.vendor_locations.map((l: Record<string, unknown>) => ({
              name: (l.name as string) || "", area: (l.area as string) || "",
              address: (l.address as string) || `${l.name}, ${l.area}`,
              lat: (l.lat as number) || 0, lng: (l.lng as number) || 0,
            })));
            setSelectedStoreId((vendor.vendor_locations[0] as Record<string, string>).id || "");
          }
          if (vendor.vendor_products?.length > 0) {
            setSettingsProductCatalog(vendor.vendor_products.map((p: Record<string, unknown>) => ({
              id: p.id as string, name: p.name as string, size: p.size as string,
              priceNew: Number(p.price_new) || 0, priceRefill: Number(p.price_refill) || 0,
              available: p.available !== false,
            })));
          }
          if (vendor.vendor_service_times?.length > 0) {
            setSettingsServiceTimes(vendor.vendor_service_times.map((st: Record<string, unknown>) => ({
              day: st.day as string, open: st.open !== false,
              openTime: (st.open_time as string) || "07:00", closeTime: (st.close_time as string) || "20:00",
            })));
          }
          if (vendor.hours) setSettingsHours(vendor.hours);
          if (vendor.delivery_radius_km) setSettingsRadius(vendor.delivery_radius_km);
          if (vendor.brands) setSettingsBrands(vendor.brands);
          if (vendor.areas_served) setSettingsAreasServed(vendor.areas_served);
          return true;
        }
      } catch {}
      return false;
    };

    // Try Supabase first (via vendorStore async), then localStorage, then Supabase direct, then mock
    const applyVendorData = (storeVendor: { name: string; area?: string; businessRegNo: string; mpesaNumber: string; description?: string; minOrder?: string; phoneNumbers: string[]; locations: Array<{ id?: string; name: string; area: string; lat: number; lng: number }>; brands: string[]; areasServed: string[]; products: VendorProduct[]; serviceTimes: ServiceDay[]; deliveryRadius?: number }) => {
      setSettingsBusinessName(storeVendor.name || "");
      setSettingsArea(storeVendor.area || "");
      setSettingsBusinessReg(storeVendor.businessRegNo || "");
      setSettingsMpesaNumber(storeVendor.mpesaNumber || "");
      setSettingsDescription(storeVendor.description || "");
      setSettingsMinOrder(storeVendor.minOrder || "");
      setSettingsPhoneNumbers(storeVendor.phoneNumbers?.length > 0 ? storeVendor.phoneNumbers : [""]);
      setSettingsLocations(storeVendor.locations?.length > 0 ? storeVendor.locations.map((l) => ({ name: l.name, area: l.area, address: `${l.name}, ${l.area}`, lat: l.lat, lng: l.lng })) : [{ name: "", area: "", address: "", lat: 0, lng: 0 }]);
      if (storeVendor.locations?.[0] && "id" in storeVendor.locations[0] && storeVendor.locations[0].id) setSelectedStoreId(storeVendor.locations[0].id);
      if (storeVendor.deliveryRadius) setSettingsRadius(storeVendor.deliveryRadius);
      setSettingsBrands(storeVendor.brands || []);
      setSettingsAreasServed(storeVendor.areasServed || []);
      if (storeVendor.products?.length > 0) setSettingsProductCatalog(storeVendor.products);
      if (storeVendor.serviceTimes?.length > 0) setSettingsServiceTimes(storeVendor.serviceTimes);
      setSettingsProducts(storeVendor.products.filter((p) => p.available).map((p) => `${p.size} ${p.name.includes("Hard") ? "Hard" : p.name.includes("Soft") ? "Soft" : p.name}`));
      const hours = storeVendor.serviceTimes?.find((t) => t.open);
      if (hours) setSettingsHours(`${hours.openTime} - ${hours.closeTime}`);
    };

    // Primary: load from vendorStore (Supabase-first with localStorage cache)
    // Use vendorRecordId (actual vendor table UUID) for accurate lookup
    getVendorSettingsByUserIdAsync(user.id, user.vendorRecordId).then((storeVendor) => {
      if (storeVendor) {
        applyVendorData(storeVendor);
        // Store the vendor PIN in sessionStorage so updateVendorAsync can use it
        if (storeVendor.credentials?.pin) {
          try { sessionStorage.setItem("mimaji_vendor_pin", storeVendor.credentials.pin); } catch {}
        }
        return;
      }

      // Secondary: try direct Supabase query
      loadFromSupabase().then((loaded) => {
        if (loaded) return;

        // Tertiary: localStorage cache (try vendorRecordId first, then user.id)
        const cachedVendor = getVendorSettingsByUserId(user.vendorRecordId || user.id);
        if (cachedVendor) {
          applyVendorData(cachedVendor);
          if (cachedVendor.credentials?.pin) {
            try { sessionStorage.setItem("mimaji_vendor_pin", cachedVendor.credentials.pin); } catch {}
          }
          return;
        }

        // Last resort: start with the vendor's own name and empty defaults
        // (no fake AquaPure data — new vendors should fill in their own details)
        setSettingsBusinessName(user.name || "");
        setSettingsPhoneNumbers(user.phone ? [user.phone] : [""]);
      });
    });
  }, [user?.id, user?.vendorRecordId]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "vendor")) {
      router.push("/vendor-login");
    }
  }, [user, authLoading, router]);

  const loadOrders = useCallback(async () => {
    if (!user?.id) return;
    setLoadingOrders(true);
    const data = await fetchVendorOrders(user.id);
    setOrders(data);
    setLoadingOrders(false);
  }, [user?.id]);

  const loadStats = useCallback(async () => {
    if (!user?.id) return;
    const data = await fetchVendorStats(user.id, orders);
    setStats(data);
  }, [user?.id, orders]);

  useEffect(() => { loadOrders(); }, [loadOrders]);
  useEffect(() => { loadStats(); }, [loadStats]);

  // Subscribe to order changes via Supabase realtime, fallback to 30s polling
  useEffect(() => {
    if (!user?.id) return;

    // Realtime subscription for instant updates
    const channel = supabase
      .channel(`vendor-orders-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          // Only reload if this order is relevant to this vendor
          const row = payload.new as Record<string, unknown> | undefined;
          if (
            row &&
            (row.current_vendor_offer === user.id || row.vendor_id === user.id)
          ) {
            loadOrders();
          }
        }
      )
      .subscribe();

    // Fallback polling at 30s in case realtime connection drops
    const interval = setInterval(() => { loadOrders(); }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user?.id, loadOrders]);

  // Get current vendor's locations from settings (not mock data)
  const vendorLocations = settingsLocations
    .filter((l) => l.name)
    .map((l, i) => ({ id: `${user?.id}-loc${i}`, name: l.name, area: l.area, lat: l.lat, lng: l.lng }));

  const handleAcceptOrder = (orderId: string) => {
    setEtaModalOrderId(orderId);
    setEtaMinutes(30);
    if (vendorLocations.length > 0) {
      setSelectedStoreId(vendorLocations[0].id);
    }
  };

  const handleConfirmAccept = async () => {
    if (!etaModalOrderId || !user?.id) return;
    await acceptOrder(etaModalOrderId, user.id, etaMinutes, selectedStoreId || undefined);
    setEtaModalOrderId(null);
    loadOrders();
  };

  const handleRejectOrder = async (orderId: string) => {
    if (!user?.id) return;
    await rejectOrder(orderId, user.id);
    loadOrders();
  };

  const handleDispatchOrder = async (orderId: string) => {
    await updateVendorOrderStatus(orderId, "out_for_delivery");
    loadOrders();
  };

  const handleCompleteOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setDeliveryCodeModalOrder(order);
      setDeliveryCodeInput("");
      setDeliveryCodeError("");
      setDeliveryCodeAttempts(0);
      setDeliveryCodeLocked(false);
    }
  };

  const MAX_CODE_ATTEMPTS = 5;

  const handleConfirmDeliveryCode = async () => {
    if (!deliveryCodeModalOrder || deliveryCodeLocked) return;
    const expectedCode = deliveryCodeModalOrder.delivery_code || generateDeliveryCode(deliveryCodeModalOrder.id);
    if (deliveryCodeInput !== expectedCode) {
      const newAttempts = deliveryCodeAttempts + 1;
      setDeliveryCodeAttempts(newAttempts);
      if (newAttempts >= MAX_CODE_ATTEMPTS) {
        setDeliveryCodeLocked(true);
        setDeliveryCodeError(`Too many incorrect attempts. Please contact the customer or admin to verify delivery.`);
      } else {
        setDeliveryCodeError(`Incorrect code (${newAttempts}/${MAX_CODE_ATTEMPTS} attempts). Ask the customer for their 4-digit delivery code.`);
      }
      setDeliveryCodeInput("");
      return;
    }
    await updateVendorOrderStatus(deliveryCodeModalOrder.id, "delivered");
    setDeliveryCodeModalOrder(null);
    setDeliveryCodeAttempts(0);
    setDeliveryCodeLocked(false);
    loadOrders();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Logout error:", e);
    }
    router.push("/");
  };

  if (!user || user.role !== "vendor") return null;

  const vendorId = user.id;
  // Only show orders specifically offered to THIS vendor
  const pendingOrders = orders.filter((o) => o.status === "paid" && !o.vendor_id && o.current_vendor_offer === vendorId);
  // Only show orders accepted by THIS vendor
  const activeOrders = orders.filter((o) => (o.status === "confirmed" || o.status === "out_for_delivery") && o.vendor_id === vendorId);
  const completedOrders = orders.filter((o) => o.status === "delivered" && o.vendor_id === vendorId);
  const cancelledOrders = orders.filter((o) => o.status === "cancelled" && o.vendor_id === vendorId);

  const statsCards = stats ? [
    { label: "Today's Orders", value: String(stats.todayOrders), icon: Package, color: "#2979C1" },
    { label: "Revenue (Today)", value: `KES ${stats.todayRevenue.toLocaleString()}`, icon: TrendingUp, color: "#2ECC71" },
    { label: "Total Orders", value: String(stats.totalOrders), icon: Users, color: "#F5A623" },
    { label: "Avg. Delivery", value: `${stats.avgDeliveryMinutes} min`, icon: Clock, color: "#E8544E" },
  ] : [
    { label: "Today's Orders", value: "\u2014", icon: Package, color: "#2979C1" },
    { label: "Revenue (Today)", value: "\u2014", icon: TrendingUp, color: "#2ECC71" },
    { label: "Total Orders", value: "\u2014", icon: Users, color: "#F5A623" },
    { label: "Avg. Delivery", value: "\u2014", icon: Clock, color: "#E8544E" },
  ];

  // ── Settings Panel (shared between mobile and desktop) ──
  const settingsPanel = (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Business Name</label>
        <input type="text" value={settingsBusinessName} onChange={(e) => setSettingsBusinessName(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-background" />
      </div>
      <div>
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Area / Location</label>
        <input type="text" value={settingsArea} onChange={(e) => setSettingsArea(e.target.value)} placeholder="e.g. Kilimani, Nairobi" className="w-full h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-background" />
      </div>
      <div>
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Business Registration No.</label>
        <input type="text" value={settingsBusinessReg} onChange={(e) => setSettingsBusinessReg(e.target.value)} placeholder="e.g. BN-2024-001234" className="w-full h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-background" />
      </div>
      <div>
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">M-PESA Number / Till Number</label>
        <input type="text" value={settingsMpesaNumber} onChange={(e) => setSettingsMpesaNumber(e.target.value)} placeholder="e.g. 254700111222" className="w-full h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-background" />
      </div>
      <div>
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Business Description</label>
        <input type="text" value={settingsDescription} onChange={(e) => setSettingsDescription(e.target.value)} placeholder="Brief description of your business" className="w-full h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-background" />
      </div>
      <div>
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Minimum Order</label>
        <input type="text" value={settingsMinOrder} onChange={(e) => setSettingsMinOrder(e.target.value)} placeholder="e.g. 20L" className="w-full h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-background" />
      </div>
      <div>
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Phone Number(s)</label>
        {settingsPhoneNumbers.map((phone, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input type="text" value={phone} onChange={(e) => { const updated = [...settingsPhoneNumbers]; updated[i] = e.target.value; setSettingsPhoneNumbers(updated); }} placeholder="+254..." className="flex-1 h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-background" />
            {settingsPhoneNumbers.length > 1 && (
              <button onClick={() => setSettingsPhoneNumbers(settingsPhoneNumbers.filter((_, idx) => idx !== i))} className="text-cta-alt hover:text-red-700 px-2"><Trash2 size={16} /></button>
            )}
          </div>
        ))}
        <button onClick={() => setSettingsPhoneNumbers([...settingsPhoneNumbers, ""])} className="text-primary text-xs font-semibold flex items-center gap-1 mt-1"><Plus size={14} /> Add Phone Number</button>
      </div>
      <div>
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Store Locations</label>
        {settingsLocations.map((loc, i) => (
          <div key={i} className="bg-background rounded-lg border border-[#E0E0E0] p-3 mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-text-secondary">Location {i + 1}</span>
              {settingsLocations.length > 1 && (
                <button onClick={() => setSettingsLocations(settingsLocations.filter((_, idx) => idx !== i))} className="text-cta-alt hover:text-red-700"><Trash2 size={14} /></button>
              )}
            </div>
            <input type="text" value={loc.name} onChange={(e) => { const updated = [...settingsLocations]; updated[i] = { ...updated[i], name: e.target.value }; setSettingsLocations(updated); }} placeholder="Store name" className="w-full h-9 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-white mb-2" />
            <div className="mb-2">
              <AddressSearch
                placeholder="Search store address..."
                initialValue={loc.address || loc.area}
                onSelect={(result) => {
                  const updated = [...settingsLocations];
                  updated[i] = { ...updated[i], area: result.area || result.displayName.split(",").slice(1, 3).join(",").trim(), address: result.displayName, lat: result.lat, lng: result.lng };
                  setSettingsLocations(updated);
                }}
              />
            </div>
            {loc.lat !== 0 && loc.lng !== 0 && (
              <div className="flex items-center gap-1 text-[10px] text-text-secondary mt-1">
                <Navigation size={10} className="text-primary" />
                <span className="font-mono">{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</span>
              </div>
            )}
          </div>
        ))}
        <button onClick={() => setSettingsLocations([...settingsLocations, { name: "", area: "", address: "", lat: 0, lng: 0 }])} className="text-primary text-xs font-semibold flex items-center gap-1 mt-1"><Plus size={14} /> Add Location</button>
      </div>
      {/* Brands */}
      <div>
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Brands Stocked</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {waterBrands.map((brand) => {
            const isSelected = settingsBrands.includes(brand.id);
            return (
              <button
                key={brand.id}
                type="button"
                onClick={() => setSettingsBrands(isSelected ? settingsBrands.filter((b) => b !== brand.id) : [...settingsBrands, brand.id])}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isSelected ? "bg-primary text-white" : "bg-gray-100 text-text-secondary hover:bg-gray-200"}`}
              >
                {brand.name}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <input type="text" value={settingsCustomBrand} onChange={(e) => setSettingsCustomBrand(e.target.value)} placeholder="Add custom brand..." className="flex-1 h-8 px-3 rounded-lg border border-[#E0E0E0] text-xs text-text-primary outline-none focus:border-primary bg-white" />
          <button
            type="button"
            onClick={() => {
              if (settingsCustomBrand.trim()) {
                const id = settingsCustomBrand.trim().toLowerCase().replace(/\s+/g, "-");
                if (!settingsBrands.includes(id)) setSettingsBrands([...settingsBrands, id]);
                setSettingsCustomBrand("");
              }
            }}
            className="px-3 h-8 bg-primary text-white rounded-lg text-xs font-semibold"
          >
            Add
          </button>
        </div>
        {settingsBrands.filter((b) => !waterBrands.some((wb) => wb.id === b)).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {settingsBrands.filter((b) => !waterBrands.some((wb) => wb.id === b)).map((b) => (
              <span key={b} className="bg-primary-light text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                {b} <button onClick={() => setSettingsBrands(settingsBrands.filter((x) => x !== b))} className="hover:text-red-600">&times;</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Product Catalog with Prices */}
      <div>
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Products & Prices</label>
        <p className="text-[10px] text-text-secondary mb-3">Toggle products on/off and set your prices. Customers see your prices when ordering.</p>
        <div className="space-y-2">
          {settingsProductCatalog.map((product, idx) => (
            <div key={product.id} className={`rounded-lg border p-3 transition-colors ${product.available ? "bg-white border-primary/30" : "bg-gray-50 border-gray-200 opacity-60"}`}>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={product.available}
                  onChange={(e) => {
                    const updated = [...settingsProductCatalog];
                    updated[idx] = { ...updated[idx], available: e.target.checked };
                    setSettingsProductCatalog(updated);
                  }}
                  className="rounded"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">{product.name}</span>
                    <span className="text-[10px] bg-gray-100 text-text-secondary px-1.5 py-0.5 rounded">{product.size}</span>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <div>
                      <label className="text-[10px] text-text-secondary">New/Sealed (KES)</label>
                      <input
                        type="number"
                        value={product.priceNew}
                        onChange={(e) => {
                          const updated = [...settingsProductCatalog];
                          updated[idx] = { ...updated[idx], priceNew: Number(e.target.value) };
                          setSettingsProductCatalog(updated);
                        }}
                        className="w-24 h-8 px-2 rounded-lg border border-[#E0E0E0] text-sm font-mono text-text-primary outline-none focus:border-primary bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-text-secondary">Refill (KES)</label>
                      <input
                        type="number"
                        value={product.priceRefill}
                        onChange={(e) => {
                          const updated = [...settingsProductCatalog];
                          updated[idx] = { ...updated[idx], priceRefill: Number(e.target.value) };
                          setSettingsProductCatalog(updated);
                        }}
                        placeholder="0 = N/A"
                        className="w-24 h-8 px-2 rounded-lg border border-[#E0E0E0] text-sm font-mono text-text-primary outline-none focus:border-primary bg-white"
                      />
                    </div>
                  </div>
                </div>
                {/* Delete button for custom products */}
                {!["vp-20l-hard", "vp-189l-hard", "vp-20l-soft", "vp-189l-soft", "vp-10l-hard", "vp-10l-soft", "vp-5l-soft", "vp-15l", "vp-1l", "vp-500ml"].includes(product.id) && (
                  <button
                    onClick={() => setSettingsProductCatalog(settingsProductCatalog.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Add custom product */}
        <div className="mt-3 flex gap-2">
          <input type="text" value={customProductName} onChange={(e) => setCustomProductName(e.target.value)} placeholder="Product name" className="flex-1 h-8 px-3 rounded-lg border border-[#E0E0E0] text-xs text-text-primary outline-none focus:border-primary bg-white" />
          <input type="text" value={customProductSize} onChange={(e) => setCustomProductSize(e.target.value)} placeholder="Size (e.g. 5L)" className="w-20 h-8 px-2 rounded-lg border border-[#E0E0E0] text-xs text-text-primary outline-none focus:border-primary bg-white" />
          <input type="number" value={customProductPrice} onChange={(e) => setCustomProductPrice(e.target.value)} placeholder="Price" className="w-20 h-8 px-2 rounded-lg border border-[#E0E0E0] text-xs font-mono text-text-primary outline-none focus:border-primary bg-white" />
          <button
            type="button"
            onClick={() => {
              if (customProductName.trim()) {
                const newProduct: VendorProduct = {
                  id: `vp-custom-${Date.now()}`,
                  name: customProductName.trim(),
                  size: customProductSize.trim() || "Custom",
                  priceNew: Number(customProductPrice) || 0,
                  priceRefill: 0,
                  available: true,
                };
                setSettingsProductCatalog([...settingsProductCatalog, newProduct]);
                setCustomProductName("");
                setCustomProductSize("");
                setCustomProductPrice("");
              }
            }}
            className="px-3 h-8 bg-[#1a5a9a] text-white rounded-lg text-xs font-semibold"
          >
            Add
          </button>
        </div>
      </div>

      {/* Service Times (Mon-Sun) */}
      <div>
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Service Hours (Monday - Sunday)</label>
        <div className="space-y-2">
          {settingsServiceTimes.map((st, idx) => (
            <div key={st.day} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${st.open ? "bg-white border border-primary/20" : "bg-gray-50 border border-gray-200"}`}>
              <input
                type="checkbox"
                checked={st.open}
                onChange={(e) => {
                  const updated = [...settingsServiceTimes];
                  updated[idx] = { ...updated[idx], open: e.target.checked };
                  setSettingsServiceTimes(updated);
                }}
                className="rounded"
              />
              <span className={`text-sm font-semibold w-24 ${st.open ? "text-text-primary" : "text-text-secondary"}`}>{st.day}</span>
              <input
                type="time"
                value={st.openTime}
                disabled={!st.open}
                onChange={(e) => {
                  const updated = [...settingsServiceTimes];
                  updated[idx] = { ...updated[idx], openTime: e.target.value };
                  setSettingsServiceTimes(updated);
                }}
                className="h-8 px-2 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-white disabled:opacity-40 disabled:bg-gray-100"
              />
              <span className="text-text-secondary text-xs">to</span>
              <input
                type="time"
                value={st.closeTime}
                disabled={!st.open}
                onChange={(e) => {
                  const updated = [...settingsServiceTimes];
                  updated[idx] = { ...updated[idx], closeTime: e.target.value };
                  setSettingsServiceTimes(updated);
                }}
                className="h-8 px-2 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-white disabled:opacity-40 disabled:bg-gray-100"
              />
              {!st.open && <span className="text-xs text-red-400 font-medium">Closed</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Areas Served */}
      <div>
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Areas Served</label>
        <div className="flex flex-wrap gap-1.5 mb-2 max-h-32 overflow-y-auto">
          {NAIROBI_AREAS.map((area) => {
            const isSelected = settingsAreasServed.includes(area);
            return (
              <button
                key={area}
                type="button"
                onClick={() => setSettingsAreasServed(isSelected ? settingsAreasServed.filter((a) => a !== area) : [...settingsAreasServed, area])}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${isSelected ? "bg-[#2ECC71] text-white" : "bg-gray-100 text-text-secondary hover:bg-gray-200"}`}
              >
                {area}
              </button>
            );
          })}
        </div>
        {settingsAreasServed.length > 0 && (
          <p className="text-[10px] text-text-secondary">{settingsAreasServed.length} area{settingsAreasServed.length !== 1 ? "s" : ""} selected</p>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Operating Hours</label>
        <input type="text" value={settingsHours} onChange={(e) => setSettingsHours(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-background" />
      </div>
      <div>
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Delivery Radius (km)</label>
        <input type="number" value={settingsRadius} onChange={(e) => setSettingsRadius(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-background" />
      </div>
      <button onClick={handleSaveSettings} className="bg-primary text-white rounded-xl px-6 py-2.5 font-semibold text-sm hover:bg-[#1a5a9a] transition-colors">
        {settingsSaved ? "Saved!" : "Save Settings"}
      </button>
      {settingsSaved && (
        <p className="text-[#2ECC71] text-xs font-semibold mt-2">Your settings have been saved.</p>
      )}
      {settingsSaveError && (
        <p className="text-red-500 text-xs font-semibold mt-2">{settingsSaveError}</p>
      )}
    </div>
  );

  // ── Support Panel ──
  const supportPanel = (
    <div className="bg-surface shadow-card rounded-xl p-5">
      <h3 className="font-bold text-sm text-text-primary mb-4 flex items-center gap-2"><Headphones size={16} className="text-primary" /> Vendor Support</h3>
      <div className="space-y-3">
        <a href="https://wa.me/254758434076" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-[#E8F5E9] rounded-lg hover:bg-[#C8E6C9] transition-colors">
          <MessageCircle size={18} className="text-[#25D366]" />
          <div>
            <p className="font-semibold text-sm text-text-primary">WhatsApp Support</p>
            <p className="text-text-secondary text-xs">+254 758 434 076</p>
          </div>
        </a>
        <a href="tel:+254758434076" className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-gray-100 transition-colors">
          <Phone size={18} className="text-primary" />
          <div>
            <p className="font-semibold text-sm text-text-primary">Call Support</p>
            <p className="text-text-secondary text-xs">07:00 – 21:00 EAT, 7 days a week</p>
          </div>
        </a>
        <a href="mailto:support@mimaji.co.ke" className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-gray-100 transition-colors">
          <Mail size={18} className="text-primary" />
          <div>
            <p className="font-semibold text-sm text-text-primary">Email Support</p>
            <p className="text-text-secondary text-xs">support@mimaji.co.ke</p>
          </div>
        </a>
      </div>
    </div>
  );

  // ── Documents Panel ──
  const documentsPanel = (
    <div className="bg-surface shadow-card rounded-xl p-5">
      <h3 className="font-bold text-sm text-text-primary mb-4 flex items-center gap-2"><FileText size={16} className="text-primary" /> Vendor Documents</h3>
      <div className="space-y-2">
        <Link href="/terms" className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-gray-100 transition-colors">
          <FileText size={16} className="text-primary" />
          <div>
            <p className="font-semibold text-sm text-text-primary">Vendor Agreement</p>
            <p className="text-text-secondary text-xs">Terms & conditions for MiMaji vendors</p>
          </div>
        </Link>
        <Link href="/privacy" className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-gray-100 transition-colors">
          <FileText size={16} className="text-primary" />
          <div>
            <p className="font-semibold text-sm text-text-primary">Privacy Policy</p>
            <p className="text-text-secondary text-xs">How we handle vendor & customer data</p>
          </div>
        </Link>
        <Link href="/cancellation" className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-gray-100 transition-colors">
          <FileText size={16} className="text-primary" />
          <div>
            <p className="font-semibold text-sm text-text-primary">Cancellation & Refund Policy</p>
            <p className="text-text-secondary text-xs">Refund processes & vendor accountability</p>
          </div>
        </Link>
        <Link href="/vendor-signup" className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-gray-100 transition-colors">
          <FileText size={16} className="text-primary" />
          <div>
            <p className="font-semibold text-sm text-text-primary">Commission & Fee Schedule</p>
            <p className="text-text-secondary text-xs">Current commission rates & payouts</p>
          </div>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-16">
      <TopBar title="Vendor Portal" showBack={true} />

      {/* ETA Modal */}
      {etaModalOrderId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-text-primary">Accept Order</h3>
              <button onClick={() => setEtaModalOrderId(null)} className="text-text-secondary hover:text-text-primary"><X size={20} /></button>
            </div>

            {/* Store location picker — only show if vendor has multiple locations */}
            {vendorLocations.length > 1 && (
              <div className="mb-4">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Fulfil from store</label>
                <div className="space-y-2">
                  {vendorLocations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedStoreId(loc.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${selectedStoreId === loc.id ? "border-primary bg-primary-light" : "border-[#E0E0E0] bg-white"}`}
                    >
                      <p className="font-semibold text-sm text-text-primary">{loc.name}</p>
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.area)}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-primary text-xs flex items-center gap-1 hover:underline"><MapPin size={10} /> {loc.area}</a>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-text-secondary text-sm mb-4">Estimated delivery time:</p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <button onClick={() => setEtaMinutes(Math.max(10, etaMinutes - 10))} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-text-primary hover:bg-gray-200">&minus;</button>
              <div className="text-center">
                <p className="text-4xl font-extrabold text-primary">{etaMinutes}</p>
                <p className="text-text-secondary text-xs">minutes</p>
              </div>
              <button onClick={() => setEtaMinutes(Math.min(120, etaMinutes + 10))} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-text-primary hover:bg-gray-200">+</button>
            </div>
            <div className="flex gap-2 mb-2">
              {[15, 30, 45, 60].map((min) => (
                <button key={min} onClick={() => setEtaMinutes(min)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${etaMinutes === min ? "bg-primary text-white" : "bg-gray-100 text-text-secondary hover:bg-gray-200"}`}>{min}m</button>
              ))}
            </div>
            <button onClick={handleConfirmAccept} className="w-full mt-4 bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#1a5a9a] transition-colors flex items-center justify-center gap-2">
              <CheckCircle size={18} /> Accept Order ({etaMinutes} min)
            </button>
          </div>
        </div>
      )}

      {/* Delivery Code Confirmation Modal */}
      {deliveryCodeModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-text-primary">Confirm Delivery</h3>
              <button onClick={() => setDeliveryCodeModalOrder(null)} className="text-text-secondary hover:text-text-primary"><X size={20} /></button>
            </div>
            <p className="text-text-secondary text-sm mb-1">
              Order: <span className="font-bold text-text-primary">{formatOrderId(deliveryCodeModalOrder.id)}</span>
            </p>
            <p className="text-text-secondary text-sm mb-4">
              Enter the customer&apos;s 4-digit delivery code to confirm delivery.
            </p>
            <div className="flex justify-center gap-2 mb-4">
              {[0, 1, 2, 3].map((i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={deliveryCodeInput[i] || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    const newCode = deliveryCodeInput.split("");
                    newCode[i] = val;
                    setDeliveryCodeInput(newCode.join("").slice(0, 4));
                    setDeliveryCodeError("");
                    if (val && i < 3) {
                      const next = e.target.parentElement?.children[i + 1] as HTMLInputElement;
                      next?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !deliveryCodeInput[i] && i > 0) {
                      const prev = (e.target as HTMLElement).parentElement?.children[i - 1] as HTMLInputElement;
                      prev?.focus();
                    }
                  }}
                  className="w-14 h-16 text-center text-2xl font-extrabold text-primary border-2 border-gray-200 rounded-xl focus:border-primary outline-none transition-colors"
                  autoFocus={i === 0}
                />
              ))}
            </div>
            {deliveryCodeError && (
              <p className="text-cta-alt text-xs text-center mb-3 font-semibold">{deliveryCodeError}</p>
            )}
            <button
              onClick={handleConfirmDeliveryCode}
              disabled={deliveryCodeInput.length < 4 || deliveryCodeLocked}
              className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                deliveryCodeLocked
                  ? "bg-red-100 text-red-400 cursor-not-allowed"
                  : deliveryCodeInput.length >= 4
                  ? "bg-[#2ECC71] text-white hover:bg-[#27ae60]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <CheckCircle size={18} /> {deliveryCodeLocked ? "Locked — Contact Admin" : "Confirm Delivery"}
            </button>
          </div>
        </div>
      )}

      {/* Items Detail Popup */}
      {itemsPopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setItemsPopup(null)}>
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-text-primary">Order Items</h3>
              <button onClick={() => setItemsPopup(null)} className="text-text-secondary hover:text-text-primary"><X size={18} /></button>
            </div>
            <p className="text-xs text-text-secondary mb-3">{formatOrderId(itemsPopup.orderId)}</p>
            <div className="space-y-2">
              {itemsPopup.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{item.name}</p>
                    <p className="text-xs text-text-secondary">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-text-primary">KES {(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between">
              <span className="text-sm font-semibold text-text-secondary">Total</span>
              <span className="text-sm font-bold text-text-primary">KES {itemsPopup.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile */}
      <div className="max-w-md mx-auto px-4 pt-4 md:hidden">
        <div className="bg-gradient-to-br from-primary to-[#1a5a9a] rounded-2xl p-5 text-white mb-4">
          <p className="text-white/70 text-xs">Welcome back</p>
          <p className="text-xl font-extrabold">{settingsBusinessName || user.name}</p>
          <div className="flex items-center gap-2 mt-2">
            <Star size={14} className="text-rating fill-rating" />
            <span className="text-sm">Vendor Dashboard</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-surface shadow-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1"><Icon size={16} style={{ color: stat.color }} /><span className="text-text-secondary text-xs">{stat.label}</span></div>
                <p className="text-lg font-extrabold text-text-primary">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setActiveTab("orders")} className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${activeTab === "orders" ? "bg-primary text-white" : "bg-white text-text-secondary"}`}>Orders</button>
          <button onClick={() => setActiveTab("stats")} className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${activeTab === "stats" ? "bg-primary text-white" : "bg-white text-text-secondary"}`}>Analytics</button>
          <button onClick={() => setActiveTab("profile")} className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${activeTab === "profile" ? "bg-primary text-white" : "bg-white text-text-secondary"}`}>Profile</button>
        </div>

        {activeTab === "orders" && (
          <div className="flex flex-col gap-3">
            {loadingOrders ? (
              <div className="text-center py-8 text-text-secondary text-sm">Loading orders...</div>
            ) : pendingOrders.length === 0 && activeOrders.length === 0 && completedOrders.length === 0 ? (
              <div className="bg-surface shadow-card rounded-xl p-8 text-center">
                <Package size={40} className="text-text-secondary mx-auto mb-3" />
                <p className="text-text-primary font-bold mb-1">No orders yet</p>
                <p className="text-text-secondary text-sm">Orders will appear here when customers place them</p>
              </div>
            ) : (
              <>
                {/* ── PENDING ORDERS ── */}
                {pendingOrders.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mt-1">
                      <Bell size={16} className="text-[#F5A623]" />
                      <h3 className="font-bold text-sm text-text-primary uppercase tracking-wide">New Orders</h3>
                      <span className="bg-[#F5A623] text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">{pendingOrders.length}</span>
                    </div>
                    {pendingOrders.map((order) => (
                      <MobileOrderCard key={order.id} order={order} userId={vendorId} onAccept={handleAcceptOrder} onReject={handleRejectOrder} onDispatch={handleDispatchOrder} onComplete={handleCompleteOrder} onViewItems={(o) => setItemsPopup({ orderId: o.id, items: o.order_items, total: o.price_total })} />
                    ))}
                  </>
                )}

                {/* ── ONGOING DELIVERIES ── */}
                {activeOrders.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mt-4">
                      <Truck size={16} className="text-primary" />
                      <h3 className="font-bold text-sm text-text-primary uppercase tracking-wide">Ongoing Deliveries</h3>
                      <span className="bg-primary text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">{activeOrders.length}</span>
                    </div>
                    {activeOrders.map((order) => (
                      <MobileOrderCard key={order.id} order={order} userId={vendorId} onAccept={handleAcceptOrder} onReject={handleRejectOrder} onDispatch={handleDispatchOrder} onComplete={handleCompleteOrder} onViewItems={(o) => setItemsPopup({ orderId: o.id, items: o.order_items, total: o.price_total })} />
                    ))}
                  </>
                )}

                {/* ── COMPLETED ORDERS ── */}
                {completedOrders.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mt-4">
                      <CheckCircle size={16} className="text-[#2ECC71]" />
                      <h3 className="font-bold text-sm text-text-primary uppercase tracking-wide">Completed</h3>
                      <span className="bg-[#2ECC71] text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">{completedOrders.length}</span>
                    </div>
                    {completedOrders.slice(0, 5).map((order) => (
                      <MobileOrderCard key={order.id} order={order} userId={vendorId} onAccept={handleAcceptOrder} onReject={handleRejectOrder} onDispatch={handleDispatchOrder} onComplete={handleCompleteOrder} onViewItems={(o) => setItemsPopup({ orderId: o.id, items: o.order_items, total: o.price_total })} />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "stats" && stats && (
          <div className="bg-surface shadow-card rounded-xl p-5">
            <h3 className="font-bold text-sm text-text-primary mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-text-secondary">Total Orders</span><span className="font-bold text-text-primary">{stats.totalOrders}</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-secondary">Total Revenue</span><span className="font-bold text-text-primary">KES {stats.totalRevenue.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-secondary">Pending</span><span className="font-bold text-[#F5A623]">{pendingOrders.length}</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-secondary">Completed</span><span className="font-bold text-[#2ECC71]">{completedOrders.length}</span></div>
              {cancelledOrders.length > 0 && (
                <div className="flex justify-between text-sm"><span className="text-text-secondary">Cancelled</span><span className="font-bold text-red-600">{cancelledOrders.length}</span></div>
              )}
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="flex flex-col gap-4">
            <div className="bg-surface shadow-card rounded-xl p-5">
              <h3 className="font-bold text-sm text-text-primary mb-4 flex items-center gap-2"><Settings size={16} className="text-primary" /> Vendor Settings</h3>
              {settingsPanel}
            </div>
            {supportPanel}
            {documentsPanel}
          </div>
        )}

        <button onClick={handleLogout} className="w-full mt-6 bg-surface shadow-card rounded-xl flex items-center justify-center gap-2 px-5 py-4 text-cta-alt font-medium text-sm hover:bg-red-50 transition-colors">
          <LogOut size={20} /> Log Out
        </button>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopVendorNav onLogout={handleLogout} activeTab={activeDesktopTab} setActiveTab={setActiveDesktopTab} />
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-text-primary">Vendor Dashboard</h1>
              <p className="text-text-secondary">{settingsBusinessName || user.name} \u2014 Welcome back</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setActiveDesktopTab("notifications")} className={`bg-surface shadow-card rounded-xl px-4 py-2 text-sm font-medium text-text-primary hover:shadow-card-hover transition-shadow flex items-center gap-2 ${activeDesktopTab === "notifications" ? "ring-2 ring-primary" : ""}`}>
                <Bell size={16} /> Notifications
                {pendingOrders.length > 0 && <span className="bg-cta-alt text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">{pendingOrders.length}</span>}
              </button>
              <button onClick={() => setActiveDesktopTab("settings")} className={`bg-surface shadow-card rounded-xl px-4 py-2 text-sm font-medium text-text-primary hover:shadow-card-hover transition-shadow flex items-center gap-2 ${activeDesktopTab === "settings" ? "ring-2 ring-primary" : ""}`}>
                <Settings size={16} /> Settings
              </button>
            </div>
          </div>

          {/* Notifications */}
          {activeDesktopTab === "notifications" && (
            <div className="bg-surface shadow-card rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-text-primary">Notifications</h2>
                <button onClick={() => setActiveDesktopTab("dashboard")} className="text-text-secondary hover:text-text-primary"><X size={20} /></button>
              </div>
              {pendingOrders.length > 0 ? (
                <div className="space-y-3">
                  {pendingOrders.map((order) => (
                    <div key={order.id} className="flex items-center gap-4 p-3 bg-[#FFF5EC] rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-[#F5A623]/20 flex items-center justify-center"><Package size={20} className="text-[#F5A623]" /></div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-text-primary">New Order: {formatOrderId(order.id)}</p>
                        <p className="text-text-secondary text-xs">{order.product_name} \u2014 KES {order.price_total.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleAcceptOrder(order.id)} className="bg-primary text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-[#1a5a9a] transition-colors">Accept</button>
                        <button onClick={() => handleRejectOrder(order.id)} className="bg-gray-100 text-cta-alt text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-red-50 transition-colors">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary text-sm text-center py-4">No new notifications</p>
              )}
              {activeOrders.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-bold text-base text-text-primary mb-3 flex items-center gap-2">
                    <Truck size={18} className="text-primary" /> Ongoing Deliveries
                    <span className="bg-primary text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">{activeOrders.length}</span>
                  </h3>
                  <div className="space-y-3">
                  {activeOrders.map((order) => (
                    <div key={order.id} className="flex items-center gap-4 p-3 bg-primary-light rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"><Truck size={20} className="text-primary" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-text-primary">{formatOrderId(order.id)} {"\u2014"} {order.status === "confirmed" ? "Ready to dispatch" : "Out for delivery"}</p>
                        <p className="text-text-secondary text-xs truncate">{order.delivery_address}</p>
                        {order.delivery_address_details?.additionalDirections && (
                          <p className="text-text-secondary text-[11px] italic truncate">&quot;{order.delivery_address_details.additionalDirections}&quot;</p>
                        )}
                        {order.estimated_delivery_minutes && (
                          <p className="text-xs text-primary font-semibold mt-0.5">ETA: {order.estimated_delivery_minutes} min</p>
                        )}
                        {(order.customer_name || order.customer_phone) && (
                          <p className="text-xs text-text-secondary mt-0.5">
                            {order.customer_name}{order.customer_phone ? ` — ${order.customer_phone.startsWith("254") ? `0${order.customer_phone.slice(3)}` : order.customer_phone}` : ""}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {order.status === "confirmed" && (
                          <button onClick={() => handleDispatchOrder(order.id)} className="bg-[#F5A623] text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-[#d4901e] transition-colors flex items-center gap-1"><Truck size={14} /> Dispatch</button>
                        )}
                        {order.status === "out_for_delivery" && (
                          <button onClick={() => handleCompleteOrder(order.id)} className="bg-[#2ECC71] text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-[#27ae60] transition-colors flex items-center gap-1"><CheckCircle size={14} /> Complete</button>
                        )}
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          {activeDesktopTab === "settings" && (
            <>
              <div className="bg-surface shadow-card rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg text-text-primary">Vendor Settings</h2>
                  <button onClick={() => setActiveDesktopTab("dashboard")} className="text-text-secondary hover:text-text-primary"><X size={20} /></button>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>{settingsPanel}</div>
                  <div className="bg-background rounded-xl p-5">
                    <h3 className="font-bold text-sm text-text-primary mb-3">Store Locations Preview</h3>
                    <div className="space-y-2">
                      {settingsLocations.filter((l) => l.name).map((loc, i) => (
                        <div key={i} className="bg-white rounded-lg p-3 border border-[#E0E0E0]">
                          <p className="font-semibold text-sm text-text-primary">{loc.name}</p>
                          {loc.lat !== 0 && loc.lng !== 0 ? (
                            <a href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`} target="_blank" rel="noopener noreferrer" className="text-primary text-xs flex items-center gap-1 hover:underline">
                              <MapPin size={10} /> {loc.address || loc.area}
                            </a>
                          ) : loc.area ? (
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.area)}`} target="_blank" rel="noopener noreferrer" className="text-primary text-xs flex items-center gap-1 hover:underline">
                              <MapPin size={10} /> {loc.area}
                            </a>
                          ) : (
                            <p className="text-text-secondary text-xs flex items-center gap-1"><MapPin size={10} /> Area not set</p>
                          )}
                          {loc.lat !== 0 && loc.lng !== 0 && (
                            <p className="text-[10px] text-text-secondary font-mono mt-0.5">{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</p>
                          )}
                        </div>
                      ))}
                      {settingsLocations.filter((l) => l.name).length === 0 && (
                        <p className="text-text-secondary text-sm">Add at least one store location.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-8">
                {supportPanel}
                {documentsPanel}
              </div>
            </>
          )}

          {/* Stats + Orders */}
          {(activeDesktopTab === "dashboard" || activeDesktopTab === "orders") && (
            <>
              <div className="grid grid-cols-4 gap-4 mb-8">
                {statsCards.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-surface shadow-card rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}><Icon size={20} style={{ color: stat.color }} /></div>
                        <span className="text-text-secondary text-sm">{stat.label}</span>
                      </div>
                      <p className="text-2xl font-extrabold text-text-primary">{stat.value}</p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-surface shadow-card rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
                  <h2 className="font-bold text-base text-text-primary">{activeDesktopTab === "orders" ? "All Orders" : "Recent Orders"}</h2>
                  {activeDesktopTab !== "orders" && <button onClick={() => setActiveDesktopTab("orders")} className="text-primary text-sm font-semibold cursor-pointer">View All</button>}
                </div>
                {loadingOrders ? (
                  <div className="p-8 text-center text-text-secondary">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="p-8 text-center text-text-secondary">No orders yet.</div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#F0F0F0]">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Order</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Customer</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Items</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Address</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Total</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Payment</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Delivery</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeDesktopTab === "orders" ? orders : orders.slice(0, 10)).map((order) => (
                        <tr key={order.id} className="border-b border-[#F0F0F0] last:border-0 hover:bg-background transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-text-primary">{formatOrderId(order.id)}</p>
                            <p className="text-[10px] text-text-secondary">{formatOrderDateTime(order.created_at)}</p>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {order.customer_name && <span className="font-medium text-text-primary block">{order.customer_name}</span>}
                            {order.customer_phone && (
                              <a href={`tel:+${order.customer_phone.replace(/^0/, "254")}`} className="text-[11px] text-primary hover:underline block mt-0.5">
                                {order.customer_phone.startsWith("254") ? `0${order.customer_phone.slice(3)}` : order.customer_phone}
                              </a>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {order.order_items && order.order_items.length > 0 ? (
                              <button
                                onClick={() => setItemsPopup({ orderId: order.id, items: order.order_items, total: order.price_total })}
                                className="text-primary text-xs font-medium hover:underline text-left"
                              >
                                {order.order_items.length} item{order.order_items.length !== 1 ? "s" : ""} — View
                              </button>
                            ) : (
                              <span className="text-sm text-text-secondary">{order.product_name || "Water Order"}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_address)}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{order.delivery_address}</a>
                            {order.delivery_address_details?.additionalDirections && (
                              <p className="text-xs text-text-secondary italic mt-0.5">&quot;{order.delivery_address_details.additionalDirections}&quot;</p>
                            )}
                            {order.delivery_address_details?.neighbourhood && (
                              <p className="text-xs text-text-secondary mt-0.5">{order.delivery_address_details.neighbourhood}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-text-primary">KES {order.price_total.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            {order.mpesa_ref ? (
                              <span className="text-xs font-mono bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold">{order.mpesa_ref}</span>
                            ) : order.payment_method === "cash" ? (
                              <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-medium">Cash</span>
                            ) : order.payment_method === "mpesa-app" ? (
                              <span className="text-xs text-yellow-600 font-medium">Awaiting code</span>
                            ) : (
                              <span className="text-xs text-text-secondary">{"\u2014"}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {order.scheduled_date && order.scheduled_time ? (
                              <div className="flex items-center gap-1">
                                <Calendar size={12} className="text-[#F5A623] flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-semibold text-[#F5A623] whitespace-nowrap">{order.scheduled_date}</p>
                                  <p className="text-[10px] text-text-secondary">{order.scheduled_time}</p>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-[#2ECC71] font-medium">ASAP</span>
                            )}
                          </td>
                          <td className="px-6 py-4"><OrderStatusBadge status={order.status} /></td>
                          <td className="px-6 py-4">
                            {order.status === "paid" && !order.vendor_id && (
                              <div className="flex gap-2">
                                <button onClick={() => handleAcceptOrder(order.id)} className="bg-primary text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-[#1a5a9a] transition-colors">Accept</button>
                                <button onClick={() => handleRejectOrder(order.id)} className="bg-gray-100 text-cta-alt text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-red-50 transition-colors">Reject</button>
                              </div>
                            )}
                            {order.status === "confirmed" && order.vendor_id === user.id && (
                              <button onClick={() => handleDispatchOrder(order.id)} className="bg-[#F5A623] text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-[#d4901e] transition-colors">Dispatch</button>
                            )}
                            {order.status === "out_for_delivery" && order.vendor_id === user.id && (
                              <button onClick={() => handleCompleteOrder(order.id)} className="bg-[#2ECC71] text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-[#27ae60] transition-colors">Complete</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* Analytics */}
          {activeDesktopTab === "analytics" && stats && (
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-surface shadow-card rounded-xl p-6">
                <h3 className="font-bold text-base text-text-primary mb-4">Revenue Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-text-secondary">Today&apos;s Revenue</span><span className="font-bold text-text-primary">KES {stats.todayRevenue.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-text-secondary">Total Revenue</span><span className="font-bold text-text-primary">KES {stats.totalRevenue.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-text-secondary">Avg. Order Value</span><span className="font-bold text-text-primary">KES {stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString() : 0}</span></div>
                </div>
              </div>
              <div className="bg-surface shadow-card rounded-xl p-6">
                <h3 className="font-bold text-base text-text-primary mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-text-secondary">Total Orders</span><span className="font-bold text-text-primary">{stats.totalOrders}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-text-secondary">Pending</span><span className="font-bold text-[#F5A623]">{pendingOrders.length}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-text-secondary">Active</span><span className="font-bold text-primary">{activeOrders.length}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-text-secondary">Completed</span><span className="font-bold text-[#2ECC71]">{completedOrders.length}</span></div>
                  {cancelledOrders.length > 0 && (
                    <div className="flex justify-between text-sm"><span className="text-text-secondary">Cancelled</span><span className="font-bold text-red-600">{cancelledOrders.length}</span></div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MobileOrderCard({ order, userId, onAccept, onReject, onDispatch, onComplete, onViewItems }: {
  order: OrderRecord;
  userId: string;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onDispatch: (id: string) => void;
  onComplete: (id: string) => void;
  onViewItems: (o: OrderRecord) => void;
}) {
  return (
    <div className="bg-surface shadow-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-sm text-text-primary">{formatOrderId(order.id)}</span>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="text-sm text-text-primary font-medium">{order.product_name || "Water Order"}</p>
      {order.order_items && order.order_items.length > 0 ? (
        <button
          onClick={() => onViewItems(order)}
          className="text-primary text-xs font-medium hover:underline text-left"
        >
          {order.order_items.length} item{order.order_items.length !== 1 ? "s" : ""} — View details
        </button>
      ) : (
        <p className="text-xs text-text-secondary">{"\u2014"}</p>
      )}
      <div className="bg-primary-light rounded-lg p-2.5 mt-2">
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_address)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline font-medium"><MapPin size={12} /> {order.delivery_address}</a>
        {order.delivery_address_details?.additionalDirections && (
          <p className="text-xs text-text-secondary italic mt-1 ml-4">&quot;{order.delivery_address_details.additionalDirections}&quot;</p>
        )}
        {order.delivery_address_details?.neighbourhood && (
          <p className="text-xs text-text-secondary mt-0.5 ml-4">Area: {order.delivery_address_details.neighbourhood}</p>
        )}
        {order.delivery_address_details?.buildingName && (
          <p className="text-xs text-text-secondary mt-0.5 ml-4">
            {order.delivery_address_details.buildingName}
            {order.delivery_address_details.floor ? `, Floor ${order.delivery_address_details.floor}` : ""}
            {order.delivery_address_details.unitNumber ? `, Unit ${order.delivery_address_details.unitNumber}` : ""}
          </p>
        )}
      </div>
      {order.scheduled_date && order.scheduled_time && (
        <div className="bg-[#FFF5EC] rounded-lg p-2.5 mt-2 flex items-center gap-2">
          <Calendar size={14} className="text-[#F5A623] flex-shrink-0" />
          <div>
            <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wide">Scheduled Delivery</p>
            <p className="text-xs font-bold text-[#F5A623]">{order.scheduled_date} at {order.scheduled_time}</p>
          </div>
        </div>
      )}
      {(order.customer_name || order.customer_phone) && (
        <div className="bg-gray-50 rounded-lg p-2.5 mt-2">
          <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wide mb-1">Customer</p>
          {order.customer_name && <p className="text-xs font-medium text-text-primary">{order.customer_name}</p>}
          {order.customer_phone && (
            <a href={`tel:+${order.customer_phone.replace(/^0/, "254")}`} className="text-xs text-primary hover:underline">
              {order.customer_phone.startsWith("254") ? `0${order.customer_phone.slice(3)}` : order.customer_phone}
            </a>
          )}
        </div>
      )}
      {order.mpesa_ref && (
        <div className="bg-green-50 rounded-lg p-2.5 mt-2 flex items-center gap-2">
          <div>
            <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wide">Payment Confirmed</p>
            <p className="text-xs font-bold text-green-700 font-mono">{order.mpesa_ref}</p>
          </div>
        </div>
      )}
      {!order.mpesa_ref && order.payment_method === "mpesa-app" && (
        <div className="bg-yellow-50 rounded-lg p-2.5 mt-2">
          <p className="text-[10px] text-yellow-700 font-semibold">Awaiting M-PESA code</p>
        </div>
      )}
      {order.payment_method === "cash" && (
        <div className="bg-orange-50 rounded-lg p-2.5 mt-2">
          <p className="text-[10px] text-orange-700 font-semibold">Cash on Delivery</p>
        </div>
      )}
      <div className="flex items-center justify-between mt-3">
        <span className="font-bold text-text-primary">KES {order.price_total.toLocaleString()}</span>
        <span className="text-text-secondary text-[10px]">{formatOrderDateTime(order.created_at)}</span>
      </div>
      {order.estimated_delivery_minutes && (order.status === "confirmed" || order.status === "out_for_delivery") && (
        <div className="flex items-center gap-1 mt-2 text-xs text-primary"><Timer size={12} /><span className="font-semibold">ETA: {order.estimated_delivery_minutes} min</span></div>
      )}
      {order.vendor_location && order.status === "confirmed" && (
        <div className="flex items-center gap-1 mt-1 text-xs text-text-secondary"><MapPin size={12} /><span>From: {order.vendor_location}</span></div>
      )}
      {order.status === "paid" && !order.vendor_id && (
        <div className="flex gap-2 mt-3">
          <button onClick={() => onAccept(order.id)} className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Accept</button>
          <button onClick={() => onReject(order.id)} className="flex-1 bg-gray-100 text-cta-alt py-2 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors">Reject</button>
        </div>
      )}
      {order.status === "confirmed" && order.vendor_id === userId && (
        <button onClick={() => onDispatch(order.id)} className="w-full mt-3 bg-[#F5A623] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#d4901e] transition-colors flex items-center justify-center gap-2"><Truck size={16} /> Dispatch Order</button>
      )}
      {order.status === "out_for_delivery" && order.vendor_id === userId && (
        <button onClick={() => onComplete(order.id)} className="w-full mt-3 bg-[#2ECC71] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#27ae60] transition-colors flex items-center justify-center gap-2"><CheckCircle size={16} /> Mark Delivered</button>
      )}
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; text: string }> = {
    pending_payment: { label: "Pending", bg: "bg-[#FFF5EC]", text: "text-[#F5A623]" },
    paid: { label: "Paid", bg: "bg-[#E8F5E9]", text: "text-[#2ECC71]" },
    confirmed: { label: "Confirmed", bg: "bg-primary-light", text: "text-primary" },
    out_for_delivery: { label: "In Transit", bg: "bg-primary-light", text: "text-primary" },
    delivered: { label: "Delivered", bg: "bg-[#E8F5E9]", text: "text-[#2ECC71]" },
    cancelled: { label: "Cancelled", bg: "bg-red-50", text: "text-red-600" },
  };
  const c = config[status] || config.pending_payment;
  return <span className={`${c.bg} ${c.text} text-xs px-2.5 py-1 rounded-full font-semibold`}>{c.label}</span>;
}

function DesktopVendorNav({ onLogout, activeTab, setActiveTab }: { onLogout: () => void; activeTab: string; setActiveTab: (t: "dashboard" | "orders" | "analytics" | "notifications" | "settings") => void }) {
  return (
    <header className="bg-surface border-b border-[#E0E0E0]">
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center">
          <Image src={logo1.src} alt="MiMaji" width={115} height={41} className="h-8 w-auto" />
          <span className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded-full font-semibold ml-2">Vendor</span>
        </Link>
        <nav className="flex items-center gap-6">
          <button onClick={() => setActiveTab("dashboard")} className={`font-medium text-sm transition-colors ${activeTab === "dashboard" ? "text-primary" : "text-text-secondary hover:text-primary"}`}>Dashboard</button>
          <button onClick={() => setActiveTab("orders")} className={`font-medium text-sm transition-colors ${activeTab === "orders" ? "text-primary" : "text-text-secondary hover:text-primary"}`}>Orders</button>
          <button onClick={() => setActiveTab("analytics")} className={`font-medium text-sm transition-colors ${activeTab === "analytics" ? "text-primary" : "text-text-secondary hover:text-primary"}`}>Analytics</button>
          <button onClick={onLogout} className="text-text-secondary hover:text-cta-alt font-medium text-sm transition-colors flex items-center gap-1"><LogOut size={16} /> Logout</button>
        </nav>
      </div>
    </header>
  );
}
