/**
 * The canonical origin for this site — the one Google is told to index, via
 * metadataBase, the sitemap and robots.txt.
 *
 * It must match a hostname that actually serves the site. It previously read
 * "https://www.mimaji.co.ke" in five separate files while only the apex
 * resolved, so every indexed URL and every sitelink Google showed pointed at a
 * host that did not answer.
 *
 * Keep this as the single definition. If www is ever made to serve the site,
 * change it here and nowhere else.
 */
export const SITE_URL = "https://mimaji.co.ke";
