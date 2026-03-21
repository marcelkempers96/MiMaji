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
  "0712345677": {
    pin: "0000",
    user: { id: "c3a1b2d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d", phone: "254712345677", name: "Demo Customer", role: "customer" },
  },
  "254712345677": {
    pin: "0000",
    user: { id: "c3a1b2d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d", phone: "254712345677", name: "Demo Customer", role: "customer" },
  },
};

// Storage key for mock session persistence
const MOCK_SESSION_KEY = "mimaji_mock_user";

function saveMockSession(user: User) {
  try { localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(user)); } catch {}
}
function loadMockSession(): User | null {
  try {
    const raw = localStorage.getItem(MOCK_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function clearMockSession() {
  try { localStorage.removeItem(MOCK_SESSION_KEY); } catch {}
}

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

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    let initialSessionLoaded = false;

    getSupabase().then((sb) => {
      // Use getSession for initial load only
      sb.auth.getSession().then(async ({ data: { session: sess } }) => {
        initialSessionLoaded = true;
        setSession(sess);
        const baseUser = mapUser(sess?.user ?? null);
        if (baseUser) {
          const enriched = await loadProfile(baseUser.id, baseUser);
          setUser(enriched);
        } else {
          setUser(null);
        }
        setLoading(false);
      }).catch(() => {
        initialSessionLoaded = true;
        setLoading(false);
      });

      // onAuthStateChange handles subsequent changes (login, signup, logout)
      // Skip the initial INITIAL_SESSION event to avoid duplicate profile loads
      const { data: { subscription: sub } } = sb.auth.onAuthStateChange(async (event, sess) => {
        if (event === "INITIAL_SESSION") return; // already handled by getSession above
        setSession(sess);
        const baseUser = mapUser(sess?.user ?? null);
        if (baseUser) {
          const enriched = await loadProfile(baseUser.id, baseUser);
          setUser(enriched);
        } else {
          setUser(null);
        }
        if (!initialSessionLoaded) setLoading(false);
      });
      subscription = sub;
    }).catch(() => {
      setLoading(false);
    });

    return () => { subscription?.unsubscribe(); };
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
            setUser(account.user);
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
  }, [getSupabase]);

  const signup = useCallback(async (phone: string, pin: string, name: string, referralCode?: string): Promise<{ error?: string }> => {
    try {
      const sb = await getSupabase();
      const cleaned = normalizePhone(phone);
      const email = formatPhoneEmail(phone);
      const password = padPin(pin);

      console.log("Signup attempt:", { email, passwordLength: password.length });
      const { data: signUpData, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { full_name: name, phone: cleaned } },
      });

      if (error) {
        console.error("Signup error:", { message: error.message, status: error.status, code: (error as unknown as Record<string, unknown>).code });
        if (error.message.includes("already registered")) {
          // Account exists — try to log them in directly
          const { error: loginErr } = await sb.auth.signInWithPassword({ email, password });
          if (!loginErr) return {};
          return { error: "This phone number is already registered. Please log in." };
        }
        if (error.message.toLowerCase().includes("rate limit") || error.status === 429) {
          // Rate-limited — the account may have been created in a prior attempt; try logging in
          const { error: loginErr } = await sb.auth.signInWithPassword({ email, password });
          if (!loginErr) return {};
          return { error: "Too many attempts. Please wait a few minutes and try again." };
        }
        // Handle "Database error saving new user" by retrying profile creation
        if (error.message.includes("Database error")) {
          // Try signing in — the user may have been created but the profile trigger failed
          const { error: loginErr } = await sb.auth.signInWithPassword({ email, password });
          if (!loginErr) {
            // User was created, just profile failed — create profile manually
            const sess = (await sb.auth.getSession()).data.session;
            if (sess?.user) {
              const delivPin = Math.abs([...sess.user.id].reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0) % 10000).toString().padStart(4, "0");
              await sb.from("profiles").upsert({
                id: sess.user.id,
                phone: cleaned,
                full_name: name,
                role: "customer",
                delivery_pin: delivPin,
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
          // If email not confirmed error, the user was created but can't log in
          if (loginErr.message.includes("Email not confirmed")) {
            return { error: "Account created but email confirmation is required. Please disable email confirmation in Supabase Auth settings for phone-based auth." };
          }
          return { error: loginErr.message };
        }
      }

      // Best-effort: store phone in auth.users phone column and name in metadata
      // This may fail if phone provider is not enabled — don't block signup
      try {
        await sb.auth.updateUser({
          phone: cleaned,
          data: { full_name: name, phone: cleaned, display_name: name },
        });
      } catch {
        // Fallback: update only metadata (no top-level phone)
        try {
          await sb.auth.updateUser({
            data: { full_name: name, phone: cleaned, display_name: name },
          });
        } catch {}
      }

      // Initialize rewards and referral relationship in Supabase
      const userId = signUpData?.user?.id || (await sb.auth.getUser()).data.user?.id;
      if (userId) {
        try {
          const { initRewardsAsync } = await import("@/lib/rewards");
          await initRewardsAsync(userId, name, referralCode);
        } catch {}
      }

      return {};
    } catch (err) {
      console.error("Auth signup error:", err);
      return { error: err instanceof Error ? err.message : "Signup failed unexpectedly." };
    }
  }, [getSupabase]);

  const logout = useCallback(async () => {
    // Always clear local state, even if signOut fails
    setUser(null);
    setSession(null);
    try {
      const sb = await getSupabase();
      await sb.auth.signOut();
    } catch (e) {
      console.error("Sign out error (non-fatal):", e);
    }
  }, [getSupabase]);

  const updateProfile = useCallback(async (updates: { name?: string; email?: string; mpesaNumber?: string }): Promise<{ error?: string }> => {
    const sb = await getSupabase();
    const metadata: Record<string, string> = {};
    if (updates.name !== undefined) metadata.full_name = updates.name;
    if (updates.email !== undefined) metadata.email = updates.email;
    if (updates.mpesaNumber !== undefined) metadata.mpesa_number = updates.mpesaNumber;
    const { error } = await sb.auth.updateUser({ data: metadata });
    if (error) return { error: error.message };

    // Also update the profiles table
    if (user) {
      const profileUpdates: Record<string, string> = {};
      if (updates.name !== undefined) profileUpdates.full_name = updates.name;
      if (updates.email !== undefined) profileUpdates.email = updates.email;
      if (updates.mpesaNumber !== undefined) profileUpdates.mpesa_number = updates.mpesaNumber;
      await sb.from("profiles").update(profileUpdates).eq("id", user.id);

      setUser({ ...user, ...(updates.name ? { name: updates.name } : {}) });
    }
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
