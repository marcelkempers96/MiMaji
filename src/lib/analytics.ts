"use client";

/**
 * Client side of first-party analytics.
 *
 * Identifiers are random values minted in the browser — no IP, no user agent
 * stored raw, no account id. A visitor is a device that has been here before;
 * a session ends after 30 minutes of inactivity, which is the convention
 * Google Analytics uses too, so the numbers are comparable.
 */

const VISITOR_KEY = "mimaji_visitor_id";
const SESSION_KEY = "mimaji_session_id";
const SESSION_TS_KEY = "mimaji_session_ts";
const SESSION_SRC_KEY = "mimaji_session_source";
const SESSION_IDLE_MS = 30 * 60 * 1000;

export interface Attribution {
  source: string;
  medium: string | null;
  campaign: string | null;
  referrer: string | null;
}

function randomId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function read(store: Storage, key: string): string | null {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

function write(store: Storage, key: string, value: string): void {
  try {
    store.setItem(key, value);
  } catch {
    /* private mode — tracking degrades, the page does not */
  }
}

export function getVisitorId(): string {
  const existing = read(localStorage, VISITOR_KEY);
  if (existing) return existing;
  const id = randomId();
  write(localStorage, VISITOR_KEY, id);
  return id;
}

/**
 * Returns the session id and whether this call started a new session — the
 * caller uses that to mark the entry page, which is what makes landing pages
 * and exit pages computable later.
 */
export function getSession(): { sessionId: string; isNew: boolean } {
  const now = Date.now();
  const last = Number(read(localStorage, SESSION_TS_KEY) || 0);
  const existing = read(localStorage, SESSION_KEY);

  if (existing && last && now - last < SESSION_IDLE_MS) {
    write(localStorage, SESSION_TS_KEY, String(now));
    return { sessionId: existing, isNew: false };
  }

  const id = randomId();
  write(localStorage, SESSION_KEY, id);
  write(localStorage, SESSION_TS_KEY, String(now));
  return { sessionId: id, isNew: true };
}

/** Map a referrer host onto a channel a human would recognise. */
function channelFromReferrer(referrer: string): string {
  let host = "";
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "Other";
  }
  if (!host || host.endsWith("mimaji.co.ke")) return "Direct";
  if (host.includes("google")) return "Google";
  if (host.includes("bing") || host.includes("duckduckgo") || host.includes("yahoo")) return "Search";
  if (host.includes("whatsapp") || host === "wa.me") return "WhatsApp";
  if (host.includes("facebook") || host === "fb.com" || host.includes("fb.me")) return "Facebook";
  if (host.includes("instagram")) return "Instagram";
  if (host.includes("tiktok")) return "TikTok";
  if (host.includes("linkedin") || host === "lnkd.in") return "LinkedIn";
  if (host.includes("twitter") || host === "t.co" || host.includes("x.com")) return "X";
  if (host.includes("youtube") || host === "youtu.be") return "YouTube";
  return host;
}

/**
 * Where this session came from. Resolved once per session and then reused:
 * without that, an internal click would re-attribute the visit to the site
 * itself and every source would collapse to Direct.
 */
export function getAttribution(): Attribution {
  const stored = read(localStorage, SESSION_SRC_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as Attribution;
    } catch {
      /* fall through and recompute */
    }
  }

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  const referrer = document.referrer || null;

  const attribution: Attribution = {
    source: utmSource || (referrer ? channelFromReferrer(referrer) : "Direct"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
    referrer,
  };

  write(localStorage, SESSION_SRC_KEY, JSON.stringify(attribution));
  return attribution;
}

export function getDevice(): "mobile" | "desktop" {
  return window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
}

/** Clear the per-session values so a new session is minted on the next view. */
export function resetSessionForTest(): void {
  [SESSION_KEY, SESSION_TS_KEY, SESSION_SRC_KEY].forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch {}
  });
}

async function post(body: Record<string, unknown>): Promise<void> {
  try {
    const payload = JSON.stringify(body);
    // sendBeacon survives the page being closed mid-navigation, which a
    // fetch from an unload path does not.
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
      return;
    }
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  } catch (e) {
    console.error("[analytics] send failed:", e);
  }
}

export async function trackPageView(path: string): Promise<void> {
  if (typeof window === "undefined") return;
  const { sessionId, isNew } = getSession();
  const attribution = getAttribution();
  await post({
    kind: "page_view",
    visitorId: getVisitorId(),
    sessionId,
    path,
    isEntry: isNew,
    device: getDevice(),
    ...attribution,
  });
}

/** A named milestone — used for the checkout funnel. */
export async function trackEvent(
  name: string,
  props: Record<string, unknown> = {}
): Promise<void> {
  if (typeof window === "undefined") return;
  const { sessionId } = getSession();
  await post({
    kind: "event",
    visitorId: getVisitorId(),
    sessionId,
    name,
    path: window.location.pathname,
    props,
  });
}
