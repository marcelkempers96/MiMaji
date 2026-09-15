"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { OrderRecord } from "@/lib/orders";

const NAIROBI = { lat: -1.2921, lng: 36.8219 };

interface AreaRow {
  area: string;
  count: number;
  revenue: number;
}

/** Orders grouped by the neighbourhood recorded on the delivery address. */
export function buildAreaRows(orders: OrderRecord[]): AreaRow[] {
  const rows = new Map<string, AreaRow>();
  for (const o of orders) {
    const area = (o.delivery_address_details?.neighbourhood || "").trim();
    if (!area) continue;
    const key = area.toLowerCase();
    const row = rows.get(key) || { area, count: 0, revenue: 0 };
    row.count += 1;
    row.revenue += Number(o.price_total) || 0;
    rows.set(key, row);
  }
  return [...rows.values()].sort((a, b) => b.count - a.count);
}

/** Delivery coordinates, for orders that have them. */
export function buildPoints(orders: OrderRecord[]): { lat: number; lng: number }[] {
  return orders
    .map((o) => o.delivery_address_details)
    .filter((d): d is NonNullable<typeof d> => !!d)
    .filter((d) => typeof d.lat === "number" && typeof d.lng === "number")
    .map((d) => ({ lat: d.lat as number, lng: d.lng as number }));
}

export default function OrderHeatmap({ orders }: { orders: OrderRecord[] }) {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [mapsFailed, setMapsFailed] = useState(false);

  const points = buildPoints(orders);
  const areas = buildAreaRows(orders);
  const maxCount = Math.max(...areas.map((a) => a.count), 1);

  // The Maps script is loaded lazily from the root layout, so poll for it the
  // same way AddressForm does rather than assuming it has arrived.
  useEffect(() => {
    const ready = () =>
      typeof window !== "undefined" && !!window.google?.maps?.visualization;
    if (ready()) {
      setMapsReady(true);
      return;
    }
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (ready()) {
        setMapsReady(true);
        clearInterval(interval);
      } else if (attempts >= 30) {
        // Give up rather than sit on "Loading map…" forever — the script is
        // lazily loaded and simply absent when no Maps key is configured.
        setMapsFailed(true);
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mapsReady || !mapDivRef.current || points.length === 0) return;

    const map = new window.google.maps.Map(mapDivRef.current, {
      center: NAIROBI,
      zoom: 11,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    const heatmap = new window.google.maps.visualization.HeatmapLayer({
      data: points.map((p) => new window.google.maps.LatLng(p.lat, p.lng)),
      radius: 28,
      opacity: 0.75,
    });
    heatmap.setMap(map);

    // Frame the actual orders rather than leaving the view on a fixed centre.
    const bounds = new window.google.maps.LatLngBounds();
    points.forEach((p) => bounds.extend(new window.google.maps.LatLng(p.lat, p.lng)));
    if (points.length > 1) map.fitBounds(bounds, 40);

    return () => heatmap.setMap(null);
    // points is derived from orders each render, so key the effect on its size
    // and the orders themselves rather than the new array identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsReady, orders]);

  return (
    <div className="bg-surface shadow-card rounded-2xl p-5">
      <h2 className="text-lg font-semibold text-text-primary mb-1 flex items-center gap-2">
        <MapPin size={18} />
        Where Orders Come From
      </h2>
      <p className="text-xs text-text-secondary mb-4">
        {points.length} of {orders.length} order{orders.length !== 1 ? "s" : ""} have map
        coordinates · {areas.length} area{areas.length !== 1 ? "s" : ""} named
      </p>

      {points.length === 0 ? (
        <div className="bg-background rounded-xl p-6 text-center mb-4">
          <p className="text-text-secondary text-sm">
            No orders carry delivery coordinates yet, so there is nothing to plot. The
            area breakdown below still works — it reads the neighbourhood saved on each
            address.
          </p>
        </div>
      ) : (
        <div className="relative w-full h-64 rounded-xl overflow-hidden bg-background mb-4">
          {/* Google Maps replaces this node's children, so React must never
              render any of its own into it — doing so made React reconcile a
              child Maps had already detached, which threw removeChild and
              took the whole page down. The status text is a sibling overlay. */}
          <div ref={mapDivRef} className="absolute inset-0" />
          {!mapsReady && (
            <div className="absolute inset-0 flex items-center justify-center px-6 pointer-events-none">
              <p className="text-text-secondary text-sm text-center">
                {mapsFailed
                  ? "Map could not load. The area breakdown below is unaffected."
                  : "Loading map…"}
              </p>
            </div>
          )}
        </div>
      )}

      {areas.length === 0 ? (
        <p className="text-center text-text-secondary text-sm py-6">
          No delivery areas recorded yet.
        </p>
      ) : (
        <div className="space-y-3">
          {areas.map((a) => (
            <div key={a.area}>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="text-xs font-semibold text-text-primary truncate">{a.area}</span>
                <span className="text-xs text-text-secondary whitespace-nowrap">
                  {a.count} order{a.count !== 1 ? "s" : ""} · KES{" "}
                  {a.revenue.toLocaleString("en-KE")}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${Math.max((a.count / maxCount) * 100, 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
