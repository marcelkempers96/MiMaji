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
  login: (phone: string, password: string) => Promise<{ error?: string }>;
  signup: (phone: string, password: string, name: string, referralCode?: string) => Promise<{ error?: string }>;
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

function formatPhoneEmail(phone: string): string {
  let cleaned = phone.replace(/\s/g, "").replace(/^\+/, "");
  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.slice(1);
  }
  return `${cleaned}@mimaji.app`;
}

// Check if real Supabase credentials are configured
const hasSupabaseConfig =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

// ── Demo accounts ──────────────────────────────────────────────────
const MOCK_ACCOUNTS: Record<string, { password: string; user: User }> = {
  "0758434076": {
    password: "admin123",
    user: { id: "d1a0e4f2-8b3c-4e7a-9f1d-2c5b8a6e3d0f", phone: "254758434076", name: "MiMaji Admin", role: "admin" },
  },
  "254758434076": {
    password: "admin123",
    user: { id: "d1a0e4f2-8b3c-4e7a-9f1d-2c5b8a6e3d0f", phone: "254758434076", name: "MiMaji Admin", role: "admin" },
  },
  "0712345678": {
    password: "vendor123",
    user: { id: "v7b2c9d1-3e5f-4a8b-b6d4-1f9e0a7c5b2d", phone: "254712345678", name: "AquaPure Kilimani", role: "vendor" },
  },
  "254712345678": {
    password: "vendor123",
    user: { id: "v7b2c9d1-3e5f-4a8b-b6d4-1f9e0a7c5b2d", phone: "254712345678", name: "AquaPure Kilimani", role: "vendor" },
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
  const getSignedUpUsers = useCallback((): Record<string, { password: string; user: User }> => {
    try {
      const raw = localStorage.getItem("mimaji_mock_signups");
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }, []);

  const saveSignedUpUser = useCallback((phone: string, password: string, mockUser: User) => {
    const existing = getSignedUpUsers();
    existing[phone] = { password, user: mockUser };
    try { localStorage.setItem("mimaji_mock_signups", JSON.stringify(existing)); } catch {}
  }, [getSignedUpUsers]);

  useEffect(() => {
    const saved = loadMockSession();
    if (saved) setUser(saved);
    setLoading(false);
  }, []);

  const login = useCallback(async (phone: string, password: string): Promise<{ error?: string }> => {
    let cleaned = phone.replace(/\s/g, "").replace(/^\+/, "");
    // Normalize leading 0 → 254 (same as signup)
    if (cleaned.startsWith("0")) {
      cleaned = "254" + cleaned.slice(1);
    }

    // Build alternative formats to try
    const phonesToTry = [cleaned];
    // Also try without 254 prefix (with leading 0)
    if (cleaned.startsWith("254")) {
      phonesToTry.push("0" + cleaned.slice(3));
    }

    // Check built-in accounts first
    for (const p of phonesToTry) {
      const account = MOCK_ACCOUNTS[p];
      if (account) {
        if (account.password !== password) {
          return { error: "Invalid phone number or password" };
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
        if (signupAccount.password !== password) {
          return { error: "Invalid phone number or password" };
        }
        setUser(signupAccount.user);
        saveMockSession(signupAccount.user);
        return {};
      }
    }

    return { error: "Invalid phone number or password" };
  }, [getSignedUpUsers]);

  const signup = useCallback(async (phone: string, password: string, name: string, referralCode?: string): Promise<{ error?: string }> => {
    let cleaned = phone.replace(/\s/g, "").replace(/^\+/, "");
    if (cleaned.startsWith("0")) {
      cleaned = "254" + cleaned.slice(1);
    }

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
    saveSignedUpUser(cleaned, password, newUser);
    // Also save under 0-prefix format for robustness
    if (cleaned.startsWith("254")) {
      saveSignedUpUser("0" + cleaned.slice(3), password, newUser);
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
      phone: meta.phone || supaUser.email?.replace("@mimaji.app", "") || "",
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

    getSupabase().then((sb) => {
      sb.auth.getSession().then(async ({ data: { session: sess } }) => {
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
        setLoading(false);
      });

      const { data: { subscription: sub } } = sb.auth.onAuthStateChange(async (_event, sess) => {
        setSession(sess);
        const baseUser = mapUser(sess?.user ?? null);
        if (baseUser) {
          const enriched = await loadProfile(baseUser.id, baseUser);
          setUser(enriched);
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      subscription = sub;
    }).catch(() => {
      setLoading(false);
    });

    return () => { subscription?.unsubscribe(); };
  }, [getSupabase, mapUser, loadProfile]);

  const login = useCallback(async (phone: string, password: string): Promise<{ error?: string }> => {
    const sb = await getSupabase();
    const email = formatPhoneEmail(phone);
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        return { error: "Invalid phone number or password" };
      }
      return { error: error.message };
    }
    return {};
  }, [getSupabase]);

  const signup = useCallback(async (phone: string, password: string, name: string, referralCode?: string): Promise<{ error?: string }> => {
    const sb = await getSupabase();
    const email = formatPhoneEmail(phone);
    let cleaned = phone.replace(/\s/g, "").replace(/^\+/, "");
    if (cleaned.startsWith("0")) {
      cleaned = "254" + cleaned.slice(1);
    }

    const { data: signUpData, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, phone: cleaned } },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        return { error: "This phone number is already registered. Please log in." };
      }
      return { error: error.message };
    }

    // Initialize rewards and referral relationship in Supabase
    if (signUpData?.user?.id) {
      try {
        const { initRewardsAsync } = await import("@/lib/rewards");
        await initRewardsAsync(signUpData.user.id, name, referralCode);
      } catch {}
    }

    return {};
  }, [getSupabase]);

  const logout = useCallback(async () => {
    const sb = await getSupabase();
    await sb.auth.signOut();
    setUser(null);
    setSession(null);
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
