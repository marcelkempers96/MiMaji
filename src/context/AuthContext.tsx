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
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (phone: string, pin: string) => Promise<{ error?: string }>;
  signup: (phone: string, pin: string, name: string, referralCode?: string) => Promise<{ error?: string }>;
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
    // Bare number like 758434076 — prepend Kenya country code
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

// Check if real Supabase credentials are configured
const hasSupabaseConfig =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

// ── Demo accounts (4-digit PIN login) ─────────────────────────────
const MOCK_ACCOUNTS: Record<string, { pin: string; user: User }> = {
  "0758434076": {
    pin: "1234",
    user: { id: "d1a0e4f2-8b3c-4e7a-9f1d-2c5b8a6e3d0f", phone: "254758434076", name: "MiMaji Admin", role: "admin" },
  },
  "254758434076": {
    pin: "1234",
    user: { id: "d1a0e4f2-8b3c-4e7a-9f1d-2c5b8a6e3d0f", phone: "254758434076", name: "MiMaji Admin", role: "admin" },
  },
  "0712345678": {
    pin: "5678",
    user: { id: "v7b2c9d1-3e5f-4a8b-b6d4-1f9e0a7c5b2d", phone: "254712345678", name: "AquaPure Kilimani", role: "vendor" },
  },
  "254712345678": {
    pin: "5678",
    user: { id: "v7b2c9d1-3e5f-4a8b-b6d4-1f9e0a7c5b2d", phone: "254712345678", name: "AquaPure Kilimani", role: "vendor" },
  },
  "0700000001": {
    pin: "1111",
    user: { id: "v8c3d0e2-4f6a-5b9c-c7e5-2a0f1b8d6c3e", phone: "254700000001", name: "MiMaji Vendor", role: "vendor" },
  },
  "254700000001": {
    pin: "1111",
    user: { id: "v8c3d0e2-4f6a-5b9c-c7e5-2a0f1b8d6c3e", phone: "254700000001", name: "MiMaji Vendor", role: "vendor" },
  },
  "0712345677": {
    pin: "0000",
    user: { id: "c3a1b2d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d", phone: "254712345677", name: "Demo Customer", role: "customer" },
  },
  "254712345677": {
    pin: "0000",
    user: { id: "c3a1b2d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d", phone: "254712345677", name: "Demo Customer", role: "customer" },
  },
};

// ── Session persistence (works for BOTH mock and real Supabase users) ──
// This localStorage cache ensures instant restore on page load/refresh,
// even before Supabase finishes verifying the session token.
const USER_CACHE_KEY = "mimaji_user_cache";
const MOCK_SESSION_KEY = "mimaji_mock_user"; // legacy key, still checked
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function saveUserCache(user: User, isMock: boolean) {
  try {
    const payload = { user, isMock, expiresAt: Date.now() + SESSION_EXPIRY_MS };
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(payload));
    // Also save under legacy key for backwards compat
    if (isMock) {
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(payload));
    }
  } catch {}
}

function loadUserCache(): { user: User; isMock: boolean } | null {
  try {
    // Try new unified key first
    const raw = localStorage.getItem(USER_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.expiresAt && Date.now() < parsed.expiresAt && parsed.user) {
        return { user: parsed.user, isMock: !!parsed.isMock };
      }
      // Expired
      localStorage.removeItem(USER_CACHE_KEY);
    }
    // Fall back to legacy mock key
    const legacyRaw = localStorage.getItem(MOCK_SESSION_KEY);
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw);
      // Legacy format: plain user object
      if (parsed && !parsed.expiresAt && parsed.id) return { user: parsed as User, isMock: true };
      // New format with expiry
      if (parsed?.expiresAt && Date.now() < parsed.expiresAt && parsed.user) {
        return { user: parsed.user, isMock: true };
      }
      localStorage.removeItem(MOCK_SESSION_KEY);
    }
    return null;
  } catch { return null; }
}

function clearUserCache() {
  try {
    localStorage.removeItem(USER_CACHE_KEY);
    localStorage.removeItem(MOCK_SESSION_KEY);
  } catch {}
}

// Keep legacy helpers as aliases
function saveMockSession(user: User) { saveUserCache(user, true); }
function loadMockSession(): User | null {
  const cached = loadUserCache();
  return cached?.isMock ? cached.user : null;
}
function clearMockSession() { clearUserCache(); }

// ── Mock Auth Provider ─────────────────────────────────────────────
function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // In-memory store for dynamically signed-up users (persists via localStorage)
  const getSignedUpUsers = useCallback((): Record<string, { pin: string; user: User }> => {
    try {
      const raw = localStorage.getItem("mimaji_mock_signups");
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }, []);

  const saveSignedUpUser = useCallback((phone: string, pin: string, mockUser: User) => {
    const existing = getSignedUpUsers();
    existing[phone] = { pin, user: mockUser };
    try { localStorage.setItem("mimaji_mock_signups", JSON.stringify(existing)); } catch {}
  }, [getSignedUpUsers]);

  useEffect(() => {
    const saved = loadMockSession();
    if (saved) setUser(saved);
    setLoading(false);
  }, []);

  const login = useCallback(async (phone: string, pin: string): Promise<{ error?: string }> => {
    const cleaned = normalizePhone(phone);

    // Build alternative formats to try
    const phonesToTry = [cleaned];
    if (cleaned.startsWith("254")) {
      phonesToTry.push("0" + cleaned.slice(3));
    }

    // Check built-in accounts first
    for (const p of phonesToTry) {
      const account = MOCK_ACCOUNTS[p];
      if (account) {
        if (account.pin !== pin) {
          return { error: "Invalid phone number or PIN" };
        }
        setUser(account.user);
        saveMockSession(account.user);
        return {};
      }
    }

    // Check dynamically signed-up users
    const signups = getSignedUpUsers();
    for (const p of phonesToTry) {
      const signupAccount = signups[p];
      if (signupAccount) {
        if (signupAccount.pin !== pin) {
          return { error: "Invalid phone number or PIN" };
        }
        setUser(signupAccount.user);
        saveMockSession(signupAccount.user);
        return {};
      }
    }

    return { error: "Invalid phone number or PIN" };
  }, [getSignedUpUsers]);

  const signup = useCallback(async (phone: string, pin: string, name: string, referralCode?: string): Promise<{ error?: string }> => {
    const cleaned = normalizePhone(phone);

    // Check if phone is already registered (try both formats)
    const altPhone = cleaned.startsWith("254") ? "0" + cleaned.slice(3) : cleaned;
    const existingSignups = getSignedUpUsers();
    if (MOCK_ACCOUNTS[cleaned] || MOCK_ACCOUNTS[altPhone] || existingSignups[cleaned] || existingSignups[altPhone]) {
      return { error: "This phone number is already registered. Please log in." };
    }

    // Generate a persistent 4-digit delivery PIN for this user
    let pinHash = 0;
    for (let i = 0; i < cleaned.length; i++) {
      pinHash = ((pinHash << 5) - pinHash + cleaned.charCodeAt(i)) | 0;
    }
    const deliveryPin = (Math.abs(pinHash) % 10000).toString().padStart(4, "0");

    // Use deterministic ID based on phone so the same account works across devices
    const newUser: User = {
      id: `mock-user-${cleaned}`,
      phone: cleaned,
      name,
      role: "customer",
      deliveryPin,
    };

    // Save under normalized format
    saveSignedUpUser(cleaned, pin, newUser);
    // Also save under 0-prefix format for robustness
    if (cleaned.startsWith("254")) {
      saveSignedUpUser("0" + cleaned.slice(3), pin, newUser);
    }
    setUser(newUser);
    saveMockSession(newUser);

    // Initialize rewards with referral code (mock mode)
    try {
      const { initRewards, updateReferralFriendName } = await import("@/lib/rewards");
      initRewards(newUser.id, referralCode);
      updateReferralFriendName(newUser.id, name);
    } catch {}

    return {};
  }, [getSignedUpUsers, saveSignedUpUser]);

  const logout = useCallback(async () => {
    setUser(null);
    clearMockSession();
  }, []);

  const updateProfile = useCallback(async (updates: { name?: string; email?: string; mpesaNumber?: string }): Promise<{ error?: string }> => {
    if (!user) return { error: "Not logged in" };
    const updatedUser = { ...user };
    if (updates.name !== undefined) updatedUser.name = updates.name;
    setUser(updatedUser);
    saveMockSession(updatedUser);

    // Update in signups storage too
    try {
      const raw = localStorage.getItem("mimaji_mock_signups");
      const signups = raw ? JSON.parse(raw) : {};
      for (const [phone, entry] of Object.entries(signups)) {
        const e = entry as { password: string; user: User };
        if (e.user.id === user.id) {
          if (updates.name !== undefined) e.user.name = updates.name;
          signups[phone] = e;
        }
      }
      localStorage.setItem("mimaji_mock_signups", JSON.stringify(signups));
    } catch {}

    // Store email and mpesa number in a separate profile settings key
    try {
      const profileKey = `mimaji_profile_${user.id}`;
      const existing = JSON.parse(localStorage.getItem(profileKey) || "{}");
      if (updates.email !== undefined) existing.email = updates.email;
      if (updates.mpesaNumber !== undefined) existing.mpesaNumber = updates.mpesaNumber;
      localStorage.setItem(profileKey, JSON.stringify(existing));
    } catch {}

    return {};
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, session: null, loading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Supabase Auth Provider ─────────────────────────────────────────
function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // Track whether current user is a mock (demo) account
  const isMockUserRef = React.useRef(false);

  // Helper to set user + persist mock session when applicable
  const setMockUser = useCallback((u: User) => {
    isMockUserRef.current = true;
    setUser(u);
    saveMockSession(u);
  }, []);

  // Lazy-import supabase only when credentials exist
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

  // Load profile data (role, deliveryPin) from profiles table
  const loadProfile = useCallback(async (userId: string, baseUser: User): Promise<User> => {
    try {
      const sb = await getSupabase();
      const { data } = await sb.from("profiles").select("role, delivery_pin, full_name, phone").eq("id", userId).single();
      if (data) {
        return {
          ...baseUser,
          role: (data.role as UserRole) || baseUser.role,
          deliveryPin: data.delivery_pin || undefined,
          name: data.full_name || baseUser.name,
          phone: data.phone || baseUser.phone,
        };
      }
    } catch {}
    return baseUser;
  }, [getSupabase]);

  // Step 1: Instantly restore from localStorage cache (before Supabase loads)
  useEffect(() => {
    const cached = loadUserCache();
    if (cached) {
      isMockUserRef.current = cached.isMock;
      setUser(cached.user);
      // Don't set loading=false yet — wait for Supabase to confirm/update
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Step 2: Verify/update with Supabase session
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    let initialSessionLoaded = false;

    getSupabase().then((sb) => {
      sb.auth.getSession().then(async ({ data: { session: sess } }) => {
        initialSessionLoaded = true;
        setSession(sess);
        const baseUser = mapUser(sess?.user ?? null);
        if (baseUser) {
          // Real Supabase session exists — use it (and cache for next page load)
          isMockUserRef.current = false;
          const enriched = await loadProfile(baseUser.id, baseUser);
          setUser(enriched);
          saveUserCache(enriched, false);
        } else {
          // No Supabase session — keep cached user if it was a mock
          const cached = loadUserCache();
          if (cached?.isMock) {
            isMockUserRef.current = true;
            setUser(cached.user);
          } else if (!cached) {
            setUser(null);
          }
          // If cached was a real user but Supabase has no session, it means
          // the session expired — clear the cache
          if (cached && !cached.isMock) {
            clearUserCache();
            setUser(null);
          }
        }
        setLoading(false);
      }).catch(() => {
        // Supabase error — keep cached user (already loaded in step 1)
        initialSessionLoaded = true;
        setLoading(false);
      });

      const { data: { subscription: sub } } = sb.auth.onAuthStateChange(async (event, sess) => {
        if (event === "INITIAL_SESSION") return;
        setSession(sess);
        const baseUser = mapUser(sess?.user ?? null);
        if (baseUser) {
          isMockUserRef.current = false;
          const enriched = await loadProfile(baseUser.id, baseUser);
          setUser(enriched);
          saveUserCache(enriched, false);
        } else if (event === "SIGNED_OUT") {
          // Only clear if explicitly signed out
          setUser(null);
          clearUserCache();
          isMockUserRef.current = false;
        } else if (!isMockUserRef.current) {
          // Token refresh failed etc. — don't clear mock users
          // For real users, keep the cached version (optimistic)
        }
        if (!initialSessionLoaded) setLoading(false);
      });
      subscription = sub;
    }).catch(() => {
      // Supabase init failed — keep cached user from step 1
      setLoading(false);
    });

    // Listen for cross-tab session changes via localStorage
    const handleStorage = (e: StorageEvent) => {
      if (e.key === USER_CACHE_KEY || e.key === MOCK_SESSION_KEY) {
        const cached = loadUserCache();
        if (cached) {
          isMockUserRef.current = cached.isMock;
          setUser(cached.user);
        } else {
          isMockUserRef.current = false;
          setUser(null);
        }
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      subscription?.unsubscribe();
      window.removeEventListener("storage", handleStorage);
    };
  }, [getSupabase, mapUser, loadProfile]);

  const login = useCallback(async (phone: string, pin: string): Promise<{ error?: string }> => {
    try {
      const sb = await getSupabase();
      const email = formatPhoneEmail(phone);
      const password = padPin(pin);
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        // Fall back to built-in demo accounts (vendor, admin, customer)
        const cleaned = normalizePhone(phone);
        const phonesToTry = [cleaned];
        if (cleaned.startsWith("254")) phonesToTry.push("0" + cleaned.slice(3));
        for (const p of phonesToTry) {
          const account = MOCK_ACCOUNTS[p];
          if (account && account.pin === pin) {
            setMockUser(account.user);
            setSession(null);
            return {};
          }
        }

        if (error.message.includes("Invalid login credentials")) {
          return { error: "Invalid phone number or PIN" };
        }
        if (error.message.toLowerCase().includes("rate limit")) {
          return { error: "Too many login attempts. Please wait a few minutes and try again." };
        }
        return { error: error.message };
      }
      return {};
    } catch (err) {
      console.error("Auth login error:", err);
      return { error: err instanceof Error ? err.message : "Login failed unexpectedly." };
    }
  }, [getSupabase, setMockUser]);

  const signup = useCallback(async (phone: string, pin: string, name: string, referralCode?: string): Promise<{ error?: string }> => {
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
        if (error.message.includes("already registered")) {
          const { error: loginErr } = await sb.auth.signInWithPassword({ email, password });
          if (!loginErr) return {};
          return { error: "This phone number is already registered. Please log in." };
        }
        if (error.message.toLowerCase().includes("rate limit") || error.status === 429) {
          const { error: loginErr } = await sb.auth.signInWithPassword({ email, password });
          if (!loginErr) return {};
          return { error: "Too many attempts. Please wait a few minutes and try again." };
        }
        if (error.message.includes("Database error")) {
          const { error: loginErr } = await sb.auth.signInWithPassword({ email, password });
          if (!loginErr) {
            const sess = (await sb.auth.getSession()).data.session;
            if (sess?.user) {
              const delivPin = Math.abs([...sess.user.id].reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0) % 10000).toString().padStart(4, "0");
              await sb.from("profiles").upsert({
                id: sess.user.id, phone: cleaned, full_name: name, role: "customer", delivery_pin: delivPin,
              }, { onConflict: "id" });
            }
            return {};
          }
          return { error: "Account creation failed. Please try again." };
        }
        return { error: error.message };
      }

      // If Supabase didn't auto-login (email confirmation enabled), sign in now
      if (!signUpData?.session) {
        const { error: loginErr } = await sb.auth.signInWithPassword({ email, password });
        if (loginErr) {
          if (loginErr.message.includes("Email not confirmed")) {
            return { error: "Account created but email confirmation is required. Please disable email confirmation in Supabase Auth settings for phone-based auth." };
          }
          return { error: loginErr.message };
        }
      }

      // Best-effort metadata update
      try {
        await sb.auth.updateUser({ phone: cleaned, data: { full_name: name, phone: cleaned, display_name: name } });
      } catch {
        try { await sb.auth.updateUser({ data: { full_name: name, phone: cleaned, display_name: name } }); } catch {}
      }

      // Initialize rewards
      const userId = signUpData?.user?.id || (await sb.auth.getUser()).data.user?.id;
      if (userId) {
        try { const { initRewardsAsync } = await import("@/lib/rewards"); await initRewardsAsync(userId, name, referralCode); } catch {}
      }

      return {};
    } catch (err) {
      console.error("Auth signup error:", err);
      return { error: err instanceof Error ? err.message : "Signup failed unexpectedly." };
    }
  }, [getSupabase]);

  const logout = useCallback(async () => {
    setUser(null);
    setSession(null);
    isMockUserRef.current = false;
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

    // Optimistically update local state immediately
    const updatedUser = { ...user, ...(updates.name ? { name: updates.name } : {}) };
    setUser(updatedUser);
    if (isMockUserRef.current) saveMockSession(updatedUser);

    // Save to localStorage profile settings (works for both mock and Supabase users)
    try {
      const profileKey = `mimaji_profile_${user.id}`;
      const existing = JSON.parse(localStorage.getItem(profileKey) || "{}");
      if (updates.email !== undefined) existing.email = updates.email;
      if (updates.mpesaNumber !== undefined) existing.mpesaNumber = updates.mpesaNumber;
      localStorage.setItem(profileKey, JSON.stringify(existing));
    } catch {}

    // If mock user, we're done (no Supabase to update)
    if (isMockUserRef.current) return {};

    // For real Supabase users, update in background
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

// ── Export the right provider based on config ──────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (hasSupabaseConfig) {
    return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>;
  }
  return <MockAuthProvider>{children}</MockAuthProvider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
