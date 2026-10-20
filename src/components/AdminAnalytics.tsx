"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Users, MousePointerClick, TrendingDown } from "lucide-react";

type Period = "day" | "week" | "month" | "year";

const PERIODS: { value: Period; label: string; days: number; range: string }[] = [
  { value: "day", label: "Day", days: 1, range: "Today, by hour" },
  { value: "week", label: "Week", days: 7, range: "Last 7 days" },
  { value: "month", label: "Month", days: 30, range: "Last 30 days" },
  { value: "year", label: "Year", days: 365, range: "Last 12 months" },
];

interface PageViewRow {
  path: string;
  source: string | null;
  device: string | null;
  is_entry: boolean;
  session_id: string;
  visitor_id: string;
  created_at: string;
}

interface EventRow {
  name: string;
  path: string | null;
  session_id: string;
  created_at: string;
}

function localDayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Time buckets matching the revenue chart, so the two read the same way. */
function buildBuckets(period: Period) {
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
  return { shell, keyOf };
}

function RankedBars({
  title,
  subtitle,
  rows,
  unit,
  empty,
}: {
  title: string;
  subtitle?: string;
  rows: { label: string; value: number }[];
  unit: string;
  empty: string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="bg-surface shadow-card rounded-2xl p-5">
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      {subtitle && <p className="text-xs text-text-secondary mt-0.5 mb-4">{subtitle}</p>}
      {rows.length === 0 ? (
        <p className="text-center text-text-secondary text-sm py-8">{empty}</p>
      ) : (
        <div className="space-y-3 mt-4">
          {rows.map((r) => (
            <div key={r.label}>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="text-xs font-semibold text-text-primary truncate">{r.label}</span>
                <span className="text-xs text-text-secondary whitespace-nowrap">
                  {r.value.toLocaleString("en-KE")} {unit}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${Math.max((r.value / max) * 100, 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminAnalytics({ adminCode }: { adminCode: string }) {
  const [period, setPeriod] = useState<Period>("week");
  const [views, setViews] = useState<PageViewRow[] | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin?type=analytics&days=400&code=${encodeURIComponent(adminCode)}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not load analytics");
        setViews([]);
        return;
      }
      setViews(json.pageViews || []);
      setEvents(json.events || []);
    } catch (e) {
      console.error("[analytics] load failed:", e);
      setError("Could not reach the analytics endpoint.");
      setViews([]);
    } finally {
      setLoading(false);
    }
  }, [adminCode]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    if (!views) return null;
    const cfg = PERIODS.find((p) => p.value === period)!;
    const cutoff =
      period === "day"
        ? new Date(new Date().setHours(0, 0, 0, 0)).getTime()
        : Date.now() - cfg.days * 24 * 60 * 60 * 1000;

    const inRange = views.filter((v) => new Date(v.created_at).getTime() >= cutoff);
    const eventsInRange = events.filter((e) => new Date(e.created_at).getTime() >= cutoff);

    const { shell, keyOf } = buildBuckets(period);
    const perBucket = new Map<string, Set<string>>();
    for (const v of inRange) {
      const k = keyOf(new Date(v.created_at));
      if (!perBucket.has(k)) perBucket.set(k, new Set());
      perBucket.get(k)!.add(v.visitor_id);
    }
    const series = shell.map((b) => ({ ...b, value: perBucket.get(b.key)?.size || 0 }));

    const visitors = new Set(inRange.map((v) => v.visitor_id)).size;
    const sessions = new Set(inRange.map((v) => v.session_id)).size;

    // Bounce = a session that never went past its landing page.
    const viewsPerSession = new Map<string, number>();
    for (const v of inRange) viewsPerSession.set(v.session_id, (viewsPerSession.get(v.session_id) || 0) + 1);
    const bounced = [...viewsPerSession.values()].filter((n) => n === 1).length;

    const tally = (rows: { k: string }[]) => {
      const m = new Map<string, number>();
      for (const r of rows) m.set(r.k, (m.get(r.k) || 0) + 1);
      return [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
    };

    // Sources counted per session, not per view — otherwise a visitor who
    // reads six pages looks like six arrivals from that source.
    const sessionSource = new Map<string, string>();
    for (const v of inRange) if (!sessionSource.has(v.session_id)) sessionSource.set(v.session_id, v.source || "Direct");
    const sources = tally([...sessionSource.values()].map((k) => ({ k }))).slice(0, 10);

    const topPages = tally(inRange.map((v) => ({ k: v.path }))).slice(0, 10);
    const entryPages = tally(inRange.filter((v) => v.is_entry).map((v) => ({ k: v.path }))).slice(0, 8);

    // Exit page = the last view recorded in a session.
    const lastBySession = new Map<string, PageViewRow>();
    for (const v of inRange) {
      const prev = lastBySession.get(v.session_id);
      if (!prev || new Date(v.created_at) > new Date(prev.created_at)) lastBySession.set(v.session_id, v);
    }
    const exitPages = tally([...lastBySession.values()].map((v) => ({ k: v.path }))).slice(0, 8);

    const sessionsWith = (name: string) =>
      new Set(eventsInRange.filter((e) => e.name === name).map((e) => e.session_id)).size;

    const funnel = [
      { label: "Visited the site", value: sessions },
      { label: "Added to cart", value: sessionsWith("add_to_cart") },
      { label: "Started checkout", value: sessionsWith("begin_checkout") },
      { label: "Placed an order", value: sessionsWith("order_placed") },
    ];
    const failedOrders = eventsInRange.filter((e) => e.name === "order_failed").length;

    const devices = tally(inRange.map((v) => ({ k: v.device === "mobile" ? "Mobile" : "Desktop" })));

    return {
      series,
      visitors,
      sessions,
      pageViews: inRange.length,
      bounceRate: sessions ? Math.round((bounced / sessions) * 100) : 0,
      sources,
      topPages,
      entryPages,
      exitPages,
      funnel,
      failedOrders,
      devices,
      range: cfg.range,
    };
  }, [views, events, period]);

  const maxSeries = stats ? Math.max(...stats.series.map((s) => s.value), 1) : 1;
  const showBarValues = stats ? stats.series.length <= 12 : false;
  const labelEvery = stats ? Math.ceil(stats.series.length / 8) : 1;

  if (loading) {
    return (
      <div className="bg-surface shadow-card rounded-2xl p-5">
        <p className="text-text-secondary text-sm text-center py-10">Loading analytics…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface shadow-card rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-text-primary mb-1 flex items-center gap-2">
          <BarChart3 size={18} />
          Site Analytics
        </h2>
        <p className="text-cta-alt text-sm mt-2">{error}</p>
        <button onClick={load} className="text-primary text-sm font-semibold mt-3">
          Try again
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const headline = [
    { label: "Visitors", value: stats.visitors.toLocaleString("en-KE"), icon: Users },
    { label: "Sessions", value: stats.sessions.toLocaleString("en-KE"), icon: MousePointerClick },
    { label: "Page views", value: stats.pageViews.toLocaleString("en-KE"), icon: BarChart3 },
    { label: "Left after one page", value: `${stats.bounceRate}%`, icon: TrendingDown },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-surface shadow-card rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <BarChart3 size={18} />
            Site Analytics
          </h2>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                aria-pressed={period === p.value}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  period === p.value ? "bg-surface text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-text-secondary mb-5">
          {stats.range} · unique visitors per {period === "year" ? "month" : period === "day" ? "hour" : "day"}
        </p>

        {stats.pageViews === 0 ? (
          <p className="text-center text-text-secondary text-sm py-12">
            No visits recorded in this period.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {headline.map((h) => {
                const Icon = h.icon;
                return (
                  <div key={h.label} className="border-l-2 border-primary-light pl-3">
                    <div className="flex items-center gap-1.5 text-text-secondary mb-1">
                      <Icon size={13} />
                      <span className="text-[11px]">{h.label}</span>
                    </div>
                    <p className="text-xl font-bold text-text-primary">{h.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="relative">
              <span className="absolute top-0 left-0 text-[10px] text-text-secondary">
                {maxSeries.toLocaleString("en-KE")}
              </span>
              <div className={`flex items-end gap-[2px] h-44 ${showBarValues ? "pt-9" : "pt-5"}`}>
                {stats.series.map((b) => (
                  <div
                    key={b.key}
                    className="group relative flex-1 min-w-0 h-full flex flex-col justify-end items-center"
                  >
                    {showBarValues && b.value > 0 && (
                      <span
                        className="absolute left-1/2 -translate-x-1/2 text-[9px] font-semibold text-text-primary whitespace-nowrap"
                        style={{ bottom: `${Math.max((b.value / maxSeries) * 100, 2)}%`, marginBottom: "2px" }}
                      >
                        {b.value}
                      </span>
                    )}
                    {b.value > 0 ? (
                      <div
                        className="w-full rounded-t bg-primary/85 group-hover:bg-primary transition-colors"
                        style={{ height: `${Math.max((b.value / maxSeries) * 100, 2)}%` }}
                      />
                    ) : (
                      <div className="w-full h-[2px] bg-gray-200 rounded-t" />
                    )}
                    <div className="pointer-events-none absolute bottom-full mb-1 z-10 hidden group-hover:block">
                      <div className="bg-text-primary text-white text-[10px] rounded-md px-2 py-1 whitespace-nowrap shadow-lg">
                        <span className="font-semibold">{b.full}</span> · {b.value} visitor
                        {b.value !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex gap-[2px] mt-2">
              {stats.series.map((b, i) => (
                <span
                  key={b.key}
                  className="flex-1 min-w-0 text-center text-[10px] text-text-secondary whitespace-nowrap"
                >
                  {(stats.series.length - 1 - i) % labelEvery === 0 ? b.label : ""}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Funnel — the question "where do they fail" answered directly. */}
      <div className="bg-surface shadow-card rounded-2xl p-5">
        <h3 className="text-base font-semibold text-text-primary">Checkout funnel</h3>
        <p className="text-xs text-text-secondary mt-0.5 mb-4">
          Sessions reaching each step · {stats.range.toLowerCase()}
        </p>
        <div className="space-y-3">
          {stats.funnel.map((step, i) => {
            const first = stats.funnel[0].value || 1;
            const prev = i === 0 ? null : stats.funnel[i - 1].value;
            const dropped = prev !== null && prev > 0 ? Math.round(((prev - step.value) / prev) * 100) : null;
            return (
              <div key={step.label}>
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <span className="text-xs font-semibold text-text-primary">{step.label}</span>
                  <span className="text-xs text-text-secondary whitespace-nowrap">
                    {step.value.toLocaleString("en-KE")}
                    {dropped !== null && dropped > 0 && (
                      <span className="text-cta-alt font-semibold"> · −{dropped}%</span>
                    )}
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.max((step.value / first) * 100, step.value > 0 ? 2 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {stats.failedOrders > 0 && (
          <p className="text-xs text-cta-alt mt-4">
            {stats.failedOrders} checkout{stats.failedOrders !== 1 ? "s" : ""} errored before an order was
            created in this period.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RankedBars
          title="Where visitors come from"
          subtitle="Counted once per session"
          rows={stats.sources}
          unit="sessions"
          empty="No sources recorded yet."
        />
        <RankedBars
          title="Most viewed pages"
          rows={stats.topPages}
          unit="views"
          empty="No pages recorded yet."
        />
        <RankedBars
          title="Where visits start"
          subtitle="The first page of a session"
          rows={stats.entryPages}
          unit="entries"
          empty="No landing pages recorded yet."
        />
        <RankedBars
          title="Where visits end"
          subtitle="The last page before leaving — high counts here are worth reading closely"
          rows={stats.exitPages}
          unit="exits"
          empty="No exit pages recorded yet."
        />
        <RankedBars title="Device" rows={stats.devices} unit="views" empty="No device data yet." />
      </div>
    </div>
  );
}
