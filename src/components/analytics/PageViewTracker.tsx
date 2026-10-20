"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

/**
 * Records a page view on first load and on every client-side route change.
 *
 * Next.js navigates without a document load, so without this only the first
 * page of a visit would ever be counted — which is exactly the data needed to
 * see where people drop off.
 */
function Tracker() {
  const pathname = usePathname();
  // Read, but not used directly: it makes the effect re-run when only the
  // query string changes, so a campaign link is attributed before any click.
  useSearchParams();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    // Admin and vendor screens are tools, not pages visitors browse. Counting
    // them would quietly inflate every number on the dashboard.
    if (/^\/(hidden-admin|vendor-portal|vendor-login)/.test(pathname)) return;
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    trackPageView(pathname);
  }, [pathname]);

  return null;
}

/**
 * useSearchParams suspends during prerender, so the tracker is isolated behind
 * its own boundary rather than opting whole pages out of static rendering.
 */
export default function PageViewTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
