"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { OrderRecord } from "@/lib/orders";

function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

type RevenuePeriod = "day" | "week" | "month" | "year";

const REVENUE_PERIODS: { value: RevenuePeriod; label: string; range: string }[] = [
  { value: "day", label: "Day", range: "Today, by hour" },
  { value: "week", label: "Week", range: "Last 7 days" },
  { value: "month", label: "Month", range: "Last 30 days" },
  { value: "year", label: "Year", range: "Last 12 months" },
];

// Bucket on the viewer's own calendar. The previous chart mixed local date
// arithmetic with toISOString(), whose UTC date pushed late-evening Nairobi
// orders (EAT is UTC+3) into the following day's bar.
function localDayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface RevenueBucket {
  key: string;
  label: string;
  full: string;
  revenue: number;
  count: number;
}

function buildRevenueBuckets(orders: OrderRecord[], period: RevenuePeriod): RevenueBucket[] {
  const now = new Date();
  const shell: { key: string; label: string; full: string }[] = [];
  let keyOf: (d: Date) => string;

  if (period === "day") {
    keyOf = (d) => `${localDayKey(d)}T${String(d.getHours()).padStart(2, "0")}`;
    for (let h = 0; h < 24; h++) {
      const d = new Date(now);
      d.setHours(h, 0, 0, 0);
      shell.push({ key: keyOf(d), label: String(h).padStart(2, "0"), full: `${String(h).padStart(2, "0")}:00` });
    }
  } else if (period === "year") {
    keyOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      shell.push({
        key: keyOf(d),
        label: d.toLocaleDateString("en-KE", { month: "short" }),
        full: d.toLocaleDateString("en-KE", { month: "long", year: "numeric" }),
      });
    }
  } else {
    const span = period === "week" ? 7 : 30;
    keyOf = localDayKey;
    for (let i = span - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      shell.push({
        key: keyOf(d),
        label: span === 7 ? d.toLocaleDateString("en-KE", { weekday: "short" }) : String(d.getDate()),
        full: d.toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short" }),
      });
    }
  }

  const totals = new Map<string, { revenue: number; count: number }>();
  for (const o of orders) {
    const k = keyOf(new Date(o.created_at));
    const cur = totals.get(k) || { revenue: 0, count: 0 };
    cur.revenue += o.price_total;
    cur.count += 1;
    totals.set(k, cur);
  }

  return shell.map((b) => ({ ...b, ...(totals.get(b.key) || { revenue: 0, count: 0 }) }));
}

/**
 * Revenue over a selectable period, as a vertical bar chart.
 * Lives outside the admin page so it can be rendered on its own.
 */
export default function RevenueChart({ orders }: { orders: OrderRecord[] }) {
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>("week");

  const revenueBuckets = buildRevenueBuckets(orders, revenuePeriod);
  const maxRevenue = Math.max(...revenueBuckets.map((b) => b.revenue), 1);
  const revenueTotal = revenueBuckets.reduce((s, b) => s + b.revenue, 0);
  const revenueOrders = revenueBuckets.reduce((s, b) => s + b.count, 0);
  // Too many bars to label each one, so thin the axis to roughly 8 ticks.
  const labelEvery = Math.ceil(revenueBuckets.length / 8);

  return (
    <div className="bg-surface shadow-card rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Calendar size={18} />
            Revenue
          </h2>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {REVENUE_PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setRevenuePeriod(p.value)}
                aria-pressed={revenuePeriod === p.value}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  revenuePeriod === p.value
                    ? "bg-surface text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-text-secondary mb-4">
          {REVENUE_PERIODS.find((p) => p.value === revenuePeriod)?.range} ·{" "}
          {formatKES(revenueTotal)} from {revenueOrders} order{revenueOrders !== 1 ? "s" : ""}
        </p>

        {revenueTotal === 0 ? (
          <p className="text-center text-text-secondary text-sm py-12">
            No revenue in this period.
          </p>
        ) : (
          <>
            {/* Scale reference sits in the container's top padding, so a
                full-height bar never collides with it. */}
            <div className="relative">
              <span className="absolute top-0 left-0 text-[10px] text-text-secondary">
                {formatKES(maxRevenue)}
              </span>
              <div className="flex items-end gap-[2px] h-44 pt-5">
                {revenueBuckets.map((b) => (
                  <div
                    key={b.key}
                    className="group relative flex-1 min-w-0 h-full flex flex-col justify-end items-center"
                  >
                    {b.revenue > 0 ? (
                      <div
                        className="w-full rounded-t bg-primary/85 group-hover:bg-primary transition-colors"
                        style={{ height: `${Math.max((b.revenue / maxRevenue) * 100, 2)}%` }}
                      />
                    ) : (
                      /* a flat tick, so an empty bucket reads as zero rather than missing */
                      <div className="w-full h-[2px] bg-gray-200 rounded-t" />
                    )}
                    <div className="pointer-events-none absolute bottom-full mb-1 z-10 hidden group-hover:block">
                      <div className="bg-text-primary text-white text-[10px] rounded-md px-2 py-1 whitespace-nowrap shadow-lg">
                        <span className="font-semibold">{b.full}</span> · {formatKES(b.revenue)} ·{" "}
                        {b.count} order{b.count !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex gap-[2px] mt-2">
              {revenueBuckets.map((b, i) => (
                /* Columns stay equal width so labels line up with their bars,
                   but text may overflow into the blank columns either side: at
                   30 bars a column is ~11px and clipping turned "11" into "1.".
                   Ticks count back from the newest bucket so it is always
                   labelled. */
                <span
                  key={b.key}
                  className="flex-1 min-w-0 text-center text-[10px] text-text-secondary whitespace-nowrap"
                >
                  {(revenueBuckets.length - 1 - i) % labelEvery === 0 ? b.label : ""}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
  );
}
