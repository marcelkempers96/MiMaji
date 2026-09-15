import { supabase } from "./supabase";

/**
 * Small key/value settings read from the `config` table, which already has an
 * "anyone_read_config" RLS policy — so the vendor portal can read a flag the
 * admin set without any extra auth. Writes go through /api/admin, which holds
 * the service role.
 *
 * localStorage is a mirror for the local/dev path where Supabase is not
 * configured; it is never the source of truth when Supabase is available.
 */

export const REQUIRE_DELIVERY_CODE = "require_delivery_code";

const LOCAL_PREFIX = "mimaji_config_";

const hasSupabaseConfig =
  typeof process !== "undefined" &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

function readLocal(key: string): boolean | null {
  try {
    const raw = localStorage.getItem(LOCAL_PREFIX + key);
    return raw === null ? null : raw === "true";
  } catch {
    return null;
  }
}

export function cacheConfigFlag(key: string, value: boolean): void {
  try {
    localStorage.setItem(LOCAL_PREFIX + key, String(value));
  } catch {
    /* private mode — the Supabase value still applies */
  }
}

/**
 * Read a boolean flag. Falls back to `fallback` when the row does not exist,
 * so a setting that was never toggled keeps the behaviour it shipped with.
 */
export async function fetchConfigFlag(key: string, fallback: boolean): Promise<boolean> {
  if (hasSupabaseConfig) {
    try {
      const { data, error } = await supabase
        .from("config")
        .select("value")
        .eq("key", key)
        .maybeSingle();
      if (!error && data && data.value != null) {
        const value = String(data.value) === "true";
        cacheConfigFlag(key, value);
        return value;
      }
      // Row absent: fall through to the default rather than the stale mirror.
      if (!error) return fallback;
    } catch (e) {
      console.error("[config] read failed, using cached value:", e);
    }
  }

  const local = readLocal(key);
  return local === null ? fallback : local;
}
