"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";

export type UserRole = "customer" | "admin" | "vendor";

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<{ error?: string }>;
  signup: (phone: string, password: string, name: string, referralCode?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  login: async () => ({}),
  signup: async (_p, _pw, _n, _r) => ({}),
  logout: async () => {},
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

// ── Mock accounts ──────────────────────────────────────────────────
const MOCK_ACCOUNTS: Record<string, { password: string; user: User }> = {
  "0700000000": {
    password: "admin123",
    user: { id: "mock-admin-001", phone: "254700000000", name: "Admin User", role: "admin" },
  },
  "254700000000": {
    password: "admin123",
    user: { id: "mock-admin-001", phone: "254700000000", name: "Admin User", role: "admin" },
  },
  "0711000000": {
    password: "vendor123",
    user: { id: "mock-vendor-001", phone: "254711000000", name: "AquaPure Kilimani", role: "vendor" },
  },
  "254711000000": {
    password: "vendor123",
    user: { id: "mock-vendor-001", phone: "254711000000", name: "AquaPure Kilimani", role: "vendor" },
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
    const cleaned = phone.replace(/\s/g, "").replace(/^\+/, "");

    // Check built-in accounts first
    const account = MOCK_ACCOUNTS[cleaned];
    if (account) {
      if (account.password !== password) {
        return { error: "Invalid phone number or password" };
      }
      setUser(account.user);
      saveMockSession(account.user);
      return {};
    }

    // Check dynamically signed-up users
    const signups = getSignedUpUsers();
    const signupAccount = signups[cleaned];
    if (signupAccount) {
      if (signupAccount.password !== password) {
        return { error: "Invalid phone number or password" };
      }
      setUser(signupAccount.user);
      saveMockSession(signupAccount.user);
      return {};
    }

    return { error: "Invalid phone number or password" };
  }, [getSignedUpUsers]);

  const signup = useCallback(async (phone: string, password: string, name: string, referralCode?: string): Promise<{ error?: string }> => {
    let cleaned = phone.replace(/\s/g, "").replace(/^\+/, "");
    if (cleaned.startsWith("0")) {
      cleaned = "254" + cleaned.slice(1);
    }

    // Check if phone is already registered
    if (MOCK_ACCOUNTS[cleaned] || getSignedUpUsers()[cleaned]) {
      return { error: "This phone number is already registered. Please log in." };
    }

    // Use deterministic ID based on phone so the same account works across devices
    const newUser: User = {
      id: `mock-user-${cleaned}`,
      phone: cleaned,
      name,
      role: "customer",
    };

    saveSignedUpUser(cleaned, password, newUser);
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

  return (
    <AuthContext.Provider value={{ user, session: null, loading, login, signup, logout }}>
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

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    getSupabase().then((sb) => {
      sb.auth.getSession().then(({ data: { session: sess } }) => {
        setSession(sess);
        setUser(mapUser(sess?.user ?? null));
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });

      const { data: { subscription: sub } } = sb.auth.onAuthStateChange((_event, sess) => {
        setSession(sess);
        setUser(mapUser(sess?.user ?? null));
        setLoading(false);
      });
      subscription = sub;
    }).catch(() => {
      setLoading(false);
    });

    return () => { subscription?.unsubscribe(); };
  }, [getSupabase, mapUser]);

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

  return (
    <AuthContext.Provider value={{ user, session, loading, login, signup, logout }}>
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
