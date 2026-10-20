import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

const hasServiceKey =
  !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY !== "" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

/** Keep a stray value from becoming an unbounded row. */
function str(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

/**
 * POST /api/track
 *
 * Ingest for first-party analytics. Writes with the service role, so the
 * tables stay closed to the browser: a visitor can record their own view but
 * cannot read anyone else's.
 *
 * Always answers 204. Analytics failing is never a reason for a page to see
 * an error, and sendBeacon ignores the response anyway.
 */
export async function POST(req: NextRequest) {
  if (!hasServiceKey) return new NextResponse(null, { status: 204 });

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return new NextResponse(null, { status: 204 });

    const visitorId = str(body.visitorId, 64);
    const sessionId = str(body.sessionId, 64);
    if (!visitorId || !sessionId) return new NextResponse(null, { status: 204 });

    const sb = createServiceClient();

    if (body.kind === "page_view") {
      const path = str(body.path, 300);
      if (!path) return new NextResponse(null, { status: 204 });
      await sb.from("page_views").insert({
        visitor_id: visitorId,
        session_id: sessionId,
        path,
        referrer: str(body.referrer, 500),
        source: str(body.source, 120) || "Direct",
        medium: str(body.medium, 120),
        campaign: str(body.campaign, 120),
        device: body.device === "mobile" ? "mobile" : "desktop",
        is_entry: body.isEntry === true,
      });
      return new NextResponse(null, { status: 204 });
    }

    if (body.kind === "event") {
      const name = str(body.name, 80);
      if (!name) return new NextResponse(null, { status: 204 });
      await sb.from("analytics_events").insert({
        visitor_id: visitorId,
        session_id: sessionId,
        name,
        path: str(body.path, 300),
        props: body.props && typeof body.props === "object" ? body.props : {},
      });
      return new NextResponse(null, { status: 204 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("[track] ingest failed:", e);
    return new NextResponse(null, { status: 204 });
  }
}
