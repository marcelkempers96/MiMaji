-- ────────────────────────────────────────────────────────
-- First-party analytics: page views and funnel events
--
-- Google Analytics is already on the site, but its data can only be read
-- back through Google's Data API with a service account. These tables keep
-- the same numbers in the project's own database, where the admin can query
-- them directly.
--
-- Deliberately no IP addresses, no user agents stored raw, and no logged-in
-- user id — visitor_id is a random value minted in the browser. That keeps
-- this inside what the published cookie policy already describes.
--
-- Safe to run more than once.
-- ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT NOT NULL,            -- random, persists in localStorage
  session_id TEXT NOT NULL,            -- random, resets after 30 min idle
  path TEXT NOT NULL,
  referrer TEXT,                       -- full referrer, for debugging
  source TEXT,                         -- 'Google', 'WhatsApp', 'Direct', utm_source…
  medium TEXT,                         -- utm_medium
  campaign TEXT,                       -- utm_campaign
  device TEXT,                         -- 'mobile' | 'desktop'
  is_entry BOOLEAN NOT NULL DEFAULT FALSE,  -- first view of its session
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views (session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_path    ON page_views (path);

-- Named milestones, so the checkout funnel can be measured rather than guessed.
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  name TEXT NOT NULL,                  -- 'add_to_cart', 'begin_checkout', 'order_placed'…
  path TEXT,
  props JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name    ON analytics_events (name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events (session_id);

-- Writes arrive through /api/track and reads through /api/admin, both of which
-- hold the service role. No browser touches these tables directly, so RLS is
-- on with no public policy at all.
ALTER TABLE page_views       ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_manage_page_views" ON page_views;
CREATE POLICY "service_manage_page_views" ON page_views
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "service_manage_analytics_events" ON analytics_events;
CREATE POLICY "service_manage_analytics_events" ON analytics_events
  FOR ALL USING (auth.role() = 'service_role');

SELECT 'page_views' AS table, count(*) FROM page_views
UNION ALL
SELECT 'analytics_events', count(*) FROM analytics_events;
