/**
 * Single source of truth for every phone number MiMaji shows or routes to.
 *
 * These are deliberately split by ROLE, not by value. Two numbers are in play
 * and they are not interchangeable:
 *
 *   - Support/public  — MiMaji's own line. Customer service, call links,
 *                       footer, legal pages, schema.org. Owned by MiMaji.
 *   - Vendor          — the fulfilment vendor. Receives M-PESA payments and
 *                       the customer's WhatsApp order confirmation.
 *
 * Change a number HERE, never inline in a page. A previous number migration
 * was done as a bulk find-and-replace and silently missed a file, which left
 * order notifications pointing at a retired handset.
 *
 * Note: the server-side CallMeBot owner alert in `src/lib/whatsapp.ts` is a
 * separate channel with its own env-var configuration and is not covered here.
 */

// ── MiMaji support / public contact ──────────────────────────────────────────

/** Local format, as printed on the site. */
export const SUPPORT_PHONE_LOCAL = "0704476338";

/** International format with "+", for `tel:` links and schema.org. */
export const SUPPORT_PHONE_INTL = "+254704476338";

/** International format, no "+", for `wa.me/` links. */
export const SUPPORT_WHATSAPP_NUMBER = "254704476338";

/** Human-readable spacing, for display in body copy. */
export const SUPPORT_PHONE_DISPLAY = "+254 704 476 338";

// ── Fulfilment vendor ────────────────────────────────────────────────────────

/**
 * The vendor's M-PESA number, local format. This is where customers send
 * money — it is NOT a MiMaji account.
 */
export const VENDOR_MPESA_LOCAL = "0111553042";

/**
 * The vendor's WhatsApp, international format without "+", for `wa.me/` links.
 * Customers send their order confirmation here.
 */
export const VENDOR_WHATSAPP_NUMBER = "254111553042";

/** Human-readable spacing, for display in body copy. */
export const VENDOR_PHONE_DISPLAY = "+254 111 553 042";
