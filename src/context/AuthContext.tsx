"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";

export type UserRole = "customer" | "admin" | "vendor";

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  /** Persistent 4-digit delivery confirmation PIN for this user */
  deliveryPin?: string;
  /** The vendor record UUID in the vendors table (different from profile id) */
  vendorRecordId?: string;
  /** Vendor login PIN — needed for vendor self-service API calls */
  vendorPin?: string;
}

interface AuthResult {
  error?: string;
  user?: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (phone: string, pin: string) => Promise<AuthResult>;
  signup: (phone: string, pin: string, name: string, referralCode?: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (updates: { name?: string; email?: string; mpesaNumber?: string }) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  login: async () => ({}),
  signup: async (_p, _pw, _n, _r) => ({}),
  logout: async () => {},
  updateProfile: async () => ({}),
});

function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\s/g, "").replace(/^\+/, "");
  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.slice(1);
  } else if (!cleaned.startsWith("254") && cleaned.length <= 9) {
    cleaned = "254" + cleaned;
  }
  return cleaned;
}

function formatPhoneEmail(phone: string): string {
  return `${normalizePhone(phone)}@mimaji.co.ke`;
}

/** Pad a 4-digit PIN to meet Supabase's password minimum (8 chars) */
function padPin(pin: string): string {
  return `MiMaji${pin}`;
}

// ── Session persistence ──
// localStorage cache ensures instant restore on page load/refresh,
// even before Supabase finishes verifying the session token.
const USER_CACHE_KEY = "mimaji_user_cache";
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function saveUserCache(user: User, isServerAuth: boolean) {
  try {
    const payload = { user, isMock: isServerAuth, expiresAt: Date.now() + SESSION_EXPIRY_MS };
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(payload));
  } catch {}
}

function loadUserCache(): { user: User; isMock: boolean } | null {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.expiresAt && Date.now() < parsed.expiresAt && parsed.user) {
        return { user: parsed.user, isMock: !!parsed.isMock };
      }
      localStorage.removeItem(USER_CACHE_KEY);
    }
    return null;
  } catch { return null; }
}

function clearUserCache() {
  try {
    localStorage.removeItem(USER_CACHE_KEY);
    // Clean up legacy keys
    localStorage.removeItem("mimaji_mock_user");
    localStorage.removeItem("mimaji_mock_signups");
  } catch {}
}

// ── Auth Provider (Supabase-only, production-ready) ──────────────────
function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // Track whether current user logged in via server-side auth (e.g. /api/vendor-auth)
  // rather than a Supabase session — needed to skip Supabase profile updates
  const isServerAuthRef = React.useRef(false);

  // Helper to set user authenticated via server-side endpoint (no Supabase session)
  const setServerAuthUser = useCallback((u: User) => {
    isServerAuthRef.current = true;
    setUser(u);
    saveUserCache(u, true);
  }, []);

  const getSupabase = useCallback(async () => {
    const { supabase } = await import("@/lib/supabase");
    return supabase;
  }, []);

  const mapUser = useCallback((supaUser: { id: string; user_metadata?: Record<string, string>; email?: string } | null): User | null => {
    if (!supaUser) return null;
    const meta = supaUser.user_metadata || {};
    return {
      id: supaUser.id,
      phone: meta.phone || supaUser.email?.replace(/@mimaji\.(app|co\.ke)$/, "") || "",
      name: meta.full_name || meta.name || "",
      role: (meta.role as UserRole) || "customer",
    };
  }, []);

  // Load profile data (role, deliveryPin) from profiles table.
  // Returns the enriched user, and also calls setUser+saveUserCache so the
  // context is updated as soon as the data arrives.
  const loadProfile = useCallback(async (userId: string, baseUser: User): Promise<User> => {
    try {
      const sb = await getSupabase();
      const { data } = await sb.from("profiles").select("role, delivery_pin, full_name, phone").eq("id", userId).maybeSingle();
      if (data) {
        const enriched: User = {
          ...baseUser,
          role: (data.role as UserRole) || baseUser.role,
          deliveryPin: data.delivery_pin || undefined,
          name: data.full_name || baseUser.name,
          phone: data.phone || baseUser.phone,
        };
        // For vendors, fetch the actual vendor record ID (different from profile/auth ID)
        if (enriched.role === "vendor") {
          try {
            // Try by profile_id first
            let vendor = null;
            const { data: v1 } = await sb.from("vendors").select("id, pin").eq("profile_id", userId).maybeSingle();
            vendor = v1;

            // Fallback: try by phone number (profile_id may be null if auth user creation failed)
            if (!vendor && enriched.phone) {
              const phone = enriched.phone.replace(/\s/g, "").replace(/^\+/, "");
              const normalized = phone.startsWith("0") ? "254" + phone.slice(1) : phone;
              const { data: v2 } = await sb.from("vendors").select("id, pin").contains("phone_numbers", [normalized]).maybeSingle();
              vendor = v2;
            }

            if (vendor) {
              enriched.vendorRecordId = vendor.id;
              enriched.vendorPin = vendor.pin;
            }
          } catch {}
        }
        return enriched;
      }
      // No profile row found — still try to find vendor record by phone
      // (vendor may exist in vendors table even without a profiles row)
      if (baseUser.phone) {
        try {
          const phone = baseUser.phone.replace(/\s/g, "").replace(/^\+/, "");
          const normalized = phone.startsWith("0") ? "254" + phone.slice(1) : phone;
          const { data: vendor } = await sb.from("vendors").select("id, pin, name").contains("phone_numbers", [normalized]).maybeSingle();
          if (vendor) {
            return {
              ...baseUser,
              role: "vendor" as UserRole,
              name: vendor.name || baseUser.name,
              vendorRecordId: vendor.id,
              vendorPin: vendor.pin,
            };
          }
        } catch {}
      }
    } catch {}
    return baseUser;
  }, [getSupabase]);

  // Set user immediately with base data, then enrich with profile in the background.
  // This prevents the UI from appearing stuck while profile data loads.
  const setUserAndEnrich = useCallback((baseUser: User) => {
    isServerAuthRef.current = false;
    setUser(baseUser);
    saveUserCache(baseUser, false);
    // Enrich in background — updates context when profile data arrives
    loadProfile(baseUser.id, baseUser).then((enriched) => {
      setUser(enriched);
      saveUserCache(enriched, false);
    }).catch(() => {});
  }, [loadProfile]);

  // Step 1: Instantly restore from localStorage cache (before Supabase loads)
  useEffect(() => {
    const cached = loadUserCache();
    if (cached) {
      isServerAuthRef.current = cached.isMock;
      setUser(cached.user);
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Step 2: Verify/update with Supabase session
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    getSupabase().then((sb) => {
      const { data: { subscription: sub } } = sb.auth.onAuthStateChange((event, sess) => {
        setSession(sess);
        const baseUser = mapUser(sess?.user ?? null);
        if (baseUser) {
          // Set user immediately with base data — don't await profile loading
          setUserAndEnrich(baseUser);
        } else if (event === "INITIAL_SESSION") {
          // No Supabase session — keep cached user (could be vendor-auth session)
          const cached = loadUserCache();
          if (cached) {
            isServerAuthRef.current = cached.isMock;
            setUser(cached.user);
          } else {
            setUser(null);
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          clearUserCache();
          isServerAuthRef.current = false;
        }
        setLoading(false);
      });
      subscription = sub;
    }).catch(() => {
      setLoading(false);
    });

    const handleStorage = (e: StorageEvent) => {
      if (e.key === USER_CACHE_KEY) {
        const cached = loadUserCache();
        if (cached) {
          isServerAuthRef.current = cached.isMock;
          setUser(cached.user);
        } else {
          isServerAuthRef.current = false;
          setUser(null);
        }
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      subscription?.unsubscribe();
      window.removeEventListener("storage", handleStorage);
    };
  }, [getSupabase, mapUser, setUserAndEnrich]);

  const login = useCallback(async (phone: string, pin: string): Promise<AuthResult> => {
    try {
      const cleaned = normalizePhone(phone);

      // Step 1: Try vendor auth FIRST — vendors live in public.vendors, not auth.users.
      // This checks phone + PIN against the vendors table directly (server-side, service role).
      // Use AbortController timeout to prevent hanging if the API is slow/unreachable.
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const vendorRes = await fetch("/api/vendor-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: cleaned, pin }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (vendorRes.ok) {
          const vendorData = await vendorRes.json();
          if (vendorData.success && vendorData.vendor) {
            const vendorUser: User = {
              id: vendorData.vendor.vendorRecordId || vendorData.vendor.id,
              phone: vendorData.vendor.phone || cleaned,
              name: vendorData.vendor.name || "",
              role: "vendor",
              vendorRecordId: vendorData.vendor.vendorRecordId || vendorData.vendor.id,
              vendorPin: pin,
            };
            setServerAuthUser(vendorUser);
            setSession(null);
            return { user: vendorUser };
          }
        }
        // vendor-auth returned 401 (wrong PIN) or 404 (not a vendor) — continue to Supabase auth
      } catch (vendorAuthErr) {
        // Abort or network error — continue to Supabase auth silently
        if (vendorAuthErr instanceof DOMException && vendorAuthErr.name === "AbortError") {
          console.warn("Vendor auth timed out, falling back to Supabase auth");
        } else {
          console.error("Vendor auth check failed:", vendorAuthErr);
        }
      }

      // Step 2: Not a vendor — try Supabase auth (for customers, admins)
      const sb = await getSupabase();
      const email = formatPhoneEmail(phone);
      const password = padPin(pin);
      const { data, error } = await sb.auth.signInWithPassword({ email, password });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          return { error: "Invalid phone number or PIN" };
        }
        if (error.message.toLowerCase().includes("rate limit")) {
          return { error: "Too many login attempts. Please wait a few minutes and try again." };
        }
        return { error: error.message };
      }

      const supaUser = data?.user;
      if (supaUser) {
        const baseUser = mapUser(supaUser);
        if (baseUser) {
          // Set user in context immediately so the UI can redirect right away.
          // Profile enrichment (role, deliveryPin) happens in the background.
          setUserAndEnrich(baseUser);
          return { user: baseUser };
        }
      }
      return { error: "Login succeeded but failed to load user data. Please try again." };
    } catch (err) {
      console.error("Auth login error:", err);
      return { error: err instanceof Error ? err.message : "Login failed unexpectedly." };
    }
  }, [getSupabase, setServerAuthUser, mapUser, setUserAndEnrich]);

  // Helper: build a User from a Supabase session after successful signIn fallback
  const buildUserFromSession = useCallback(async (sb: Awaited<ReturnType<typeof getSupabase>>, cleaned: string, name: string): Promise<User | null> => {
    const sess = (await sb.auth.getSession()).data.session;
    if (!sess?.user) return null;
    const delivPin = Math.abs([...sess.user.id].reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0) % 10000).toString().padStart(4, "0");
    return { id: sess.user.id, phone: cleaned, name: name || sess.user.user_metadata?.full_name || "", role: "customer", deliveryPin: delivPin };
  }, []);

  const signup = useCallback(async (phone: string, pin: string, name: string, referralCode?: string): Promise<AuthResult> => {
    try {
      const sb = await getSupabase();
      const cleaned = normalizePhone(phone);
      const email = formatPhoneEmail(phone);
      const password = padPin(pin);

      const { data: signUpData, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { full_name: name, phone: cleaned } },
      });

      if (error) {
        // "already registered" — fall back to login, but always return a user or an error
        if (error.message.includes("already registered")) {
          const { error: loginErr } = await sb.auth.signInWithPassword({ email, password });
          if (!loginErr) {
            const fallbackUser = await buildUserFromSession(sb, cleaned, name);
            if (fallbackUser) { setUserAndEnrich(fallbackUser); return { user: fallbackUser }; }
          }
          return { error: "This phone number is already registered. Please log in." };
        }
        // Rate limit — fall back to login
        if (error.message.toLowerCase().includes("rate limit") || error.status === 429) {
          const { error: loginErr } = await sb.auth.signInWithPassword({ email, password });
          if (!loginErr) {
            const fallbackUser = await buildUserFromSession(sb, cleaned, name);
            if (fallbackUser) { setUserAndEnrich(fallbackUser); return { user: fallbackUser }; }
          }
          return { error: "Too many attempts. Please wait a few minutes and try again." };
        }
        // Database error — fall back to login + ensure profile exists
        if (error.message.includes("Database error")) {
          const { error: loginErr } = await sb.auth.signInWithPassword({ email, password });
          if (!loginErr) {
            const fallbackUser = await buildUserFromSession(sb, cleaned, name);
            if (fallbackUser) {
              try {
                await sb.from("profiles").upsert({
                  id: fallbackUser.id, phone: cleaned, full_name: name, role: "customer", delivery_pin: fallbackUser.deliveryPin,
                }, { onConflict: "id" });
              } catch {}
              setUserAndEnrich(fallbackUser);
              return { user: fallbackUser };
            }
          }
          return { error: "Account creation failed. Please try again." };
        }
        return { error: error.message };
      }

      // Build user from Supabase data
      const supaUserId = signUpData?.user?.id;
      if (!supaUserId) {
        return { error: "Account creation failed. Please try again." };
      }

      let loggedIn = !!signUpData?.session;
      if (!loggedIn) {
        const { error: loginErr } = await sb.auth.signInWithPassword({ email, password });
        if (!loginErr) loggedIn = true;
      }

      // Best-effort metadata update
      if (loggedIn) {
        try {
          await sb.auth.updateUser({ phone: cleaned, data: { full_name: name, phone: cleaned, display_name: name } });
        } catch {
          try { await sb.auth.updateUser({ data: { full_name: name, phone: cleaned, display_name: name } }); } catch {}
        }
      }

      let pinHash = 0;
      for (let i = 0; i < cleaned.length; i++) {
        pinHash = ((pinHash << 5) - pinHash + cleaned.charCodeAt(i)) | 0;
      }
      const deliveryPin = (Math.abs(pinHash) % 10000).toString().padStart(4, "0");

      const resultUser: User = {
        id: supaUserId,
        phone: cleaned,
        name,
        role: "customer",
        deliveryPin,
      };

      // ALWAYS set user in context immediately — whether Supabase session exists or not.
      // This prevents the login page from appearing stuck waiting for onAuthStateChange.
      if (loggedIn) {
        setUserAndEnrich(resultUser);
      } else {
        // No Supabase session (e.g. email confirmation required) — use server-auth path
        setServerAuthUser(resultUser);
      }

      // Initialize rewards in background
      try { const { initRewardsAsync } = await import("@/lib/rewards"); initRewardsAsync(supaUserId, name, referralCode).catch(() => {}); } catch {}

      // Create Supabase profile row (best-effort)
      try {
        await sb.from("profiles").upsert({
          id: supaUserId, phone: cleaned, full_name: name, role: "customer", delivery_pin: deliveryPin,
        }, { onConflict: "id" });
      } catch {}

      return { user: resultUser };
    } catch (err) {
      console.error("Auth signup error:", err);
      return { error: err instanceof Error ? err.message : "Signup failed unexpectedly." };
    }
  }, [getSupabase, setServerAuthUser, setUserAndEnrich, buildUserFromSession]);

  const logout = useCallback(async () => {
    setUser(null);
    setSession(null);
    isServerAuthRef.current = false;
    clearUserCache();
    try {
      const sb = await getSupabase();
      await sb.auth.signOut();
    } catch (e) {
      console.error("Sign out error (non-fatal):", e);
    }
  }, [getSupabase]);

  const updateProfile = useCallback(async (updates: { name?: string; email?: string; mpesaNumber?: string }): Promise<{ error?: string }> => {
    if (!user) return { error: "Not logged in" };

    const updatedUser = { ...user, ...(updates.name ? { name: updates.name } : {}) };
    setUser(updatedUser);

    // Save to localStorage profile settings
    try {
      const profileKey = `mimaji_profile_${user.id}`;
      const existing = JSON.parse(localStorage.getItem(profileKey) || "{}");
      if (updates.email !== undefined) existing.email = updates.email;
      if (updates.mpesaNumber !== undefined) existing.mpesaNumber = updates.mpesaNumber;
      localStorage.setItem(profileKey, JSON.stringify(existing));
    } catch {}

    // For server-auth users (vendor-auth), we can't update Supabase directly
    if (isServerAuthRef.current) {
      saveUserCache(updatedUser, true);
      return {};
    }

    // For Supabase users, update in background
    try {
      const sb = await getSupabase();
      const metadata: Record<string, string> = {};
      if (updates.name !== undefined) metadata.full_name = updates.name;
      if (updates.email !== undefined) metadata.email = updates.email;
      if (updates.mpesaNumber !== undefined) metadata.mpesa_number = updates.mpesaNumber;
      await sb.auth.updateUser({ data: metadata });

      const profileUpdates: Record<string, string> = {};
      if (updates.name !== undefined) profileUpdates.full_name = updates.name;
      if (updates.email !== undefined) profileUpdates.email = updates.email;
      if (updates.mpesaNumber !== undefined) profileUpdates.mpesa_number = updates.mpesaNumber;
      await sb.from("profiles").update(profileUpdates).eq("id", user.id);
    } catch {}

    return {};
  }, [getSupabase, user]);

  return (
    <AuthContext.Provider value={{ user, session, loading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProviderInner>{children}</AuthProviderInner>;
}

export function useAuth() {
  return useContext(AuthContext);
}
