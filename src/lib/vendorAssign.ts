import { createServiceClient } from "@/lib/supabase";

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Assign order to next best vendor using service role (server-side only).
 * Scores vendors by brand match, area match, and proximity, then sets current_vendor_offer.
 */
export async function assignOrderToNextVendor(
  sb: ReturnType<typeof createServiceClient>,
  orderId: string
): Promise<{ vendorId: string; vendorName: string } | null> {
  const { data: order } = await sb
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

  const { data: vendors } = await sb
    .from("vendors")
    .select("id, name, brands, areas_served, vendor_locations(lat, lng), vendor_service_times(day, open, open_time, close_time)")
    .eq("active", true);

  if (!vendors || vendors.length === 0) return null;

  const kenyaNow = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let checkDay = dayNames[kenyaNow.getUTCDay()];
  let checkTime = `${kenyaNow.getUTCHours().toString().padStart(2, "0")}:${kenyaNow.getUTCMinutes().toString().padStart(2, "0")}`;

  if (order.scheduled_date) {
    const schedDate = new Date(order.scheduled_date as string);
    checkDay = dayNames[schedDate.getDay()];
    if (order.scheduled_time) checkTime = order.scheduled_time as string;
  }

  type ServiceTime = { day: string; open: boolean; open_time: string; close_time: string };
  type VendorRow = { id: string; name: string; brands?: string[]; areas_served?: string[]; vendor_locations?: Array<{ lat: number; lng: number }>; vendor_service_times?: ServiceTime[] };

  const candidates = (vendors as VendorRow[])
    .filter((v) => {
      if (triedIds.includes(v.id)) return false;
      if (v.vendor_service_times && v.vendor_service_times.length > 0) {
        const dayEntry = v.vendor_service_times.find((st) => st.day === checkDay);
        if (!dayEntry || !dayEntry.open) return false;
        if (checkTime < dayEntry.open_time || checkTime > dayEntry.close_time) return false;
      }
      return true;
    })
    .map((v) => {
      let score = 0;
      if (brandPref.length > 0) {
        const matches = brandPref.filter((b) => (v.brands || []).includes(b)).length;
        score += matches * 10;
      }
      if (deliveryArea && (v.areas_served || []).some((a) => a.toLowerCase() === deliveryArea.toLowerCase())) {
        score += 8;
      }
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

  await sb.from("orders").update({
    current_vendor_offer: next.id,
    updated_at: new Date().toISOString(),
  }).eq("id", orderId);

  return { vendorId: next.id, vendorName: next.name };
}
