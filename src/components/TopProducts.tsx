"use client";

import { Package } from "lucide-react";
import { OrderRecord } from "@/lib/orders";

function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

interface ProductRow {
  name: string;
  quantity: number;
  revenue: number;
  orders: number;
}

type SortKey = "quantity" | "revenue";

/**
 * Roll orders up to their line items. Older orders predate order_items and
 * only carry product_name/quantity, so those are folded in as a single line
 * rather than dropped — otherwise the ranking silently ignores early sales.
 */
export function buildProductRows(orders: OrderRecord[]): ProductRow[] {
  const rows = new Map<string, ProductRow>();

  for (const o of orders) {
    const items =
      o.order_items && o.order_items.length > 0
        ? o.order_items
        : o.product_name
        ? [{ name: o.product_name, quantity: o.quantity || 1, price: o.price_total || 0 }]
        : [];

    for (const item of items) {
      const name = (item.name || "").trim() || "Unspecified";
      const row = rows.get(name) || { name, quantity: 0, revenue: 0, orders: 0 };
      const qty = Number(item.quantity) || 0;
      row.quantity += qty;
      row.revenue += (Number(item.price) || 0) * qty;
      row.orders += 1;
      rows.set(name, row);
    }
  }

  return [...rows.values()];
}

export default function TopProducts({ orders }: { orders: OrderRecord[] }) {
  const rows = buildProductRows(orders);

  // Ranked by units by default: "mostly sold" is a count question, and the
  // revenue view is a separate lens because the two disagree — a cheap 5L
  // bottle can top the units list while a 20L jug earns more.
  const sorted = [...rows].sort((a, b) => b.quantity - a.quantity);
  const maxQty = Math.max(...sorted.map((r) => r.quantity), 1);
  const totalUnits = sorted.reduce((s, r) => s + r.quantity, 0);

  return (
    <div className="bg-surface shadow-card rounded-2xl p-5">
      <h2 className="text-lg font-semibold text-text-primary mb-1 flex items-center gap-2">
        <Package size={18} />
        Top Products
      </h2>
      <p className="text-xs text-text-secondary mb-4">
        {totalUnits.toLocaleString("en-KE")} unit{totalUnits !== 1 ? "s" : ""} across{" "}
        {sorted.length} product{sorted.length !== 1 ? "s" : ""}
      </p>

      {sorted.length === 0 ? (
        <p className="text-center text-text-secondary text-sm py-10">No product sales yet.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((r) => (
            <div key={r.name}>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="text-xs font-semibold text-text-primary truncate">{r.name}</span>
                <span className="text-xs text-text-secondary whitespace-nowrap">
                  {r.quantity} unit{r.quantity !== 1 ? "s" : ""} · {formatKES(r.revenue)}
                </span>
              </div>
              {/* ranked categories read better as horizontal bars — the labels
                  sit on their natural reading line */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${Math.max((r.quantity / maxQty) * 100, 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export type { ProductRow, SortKey };
