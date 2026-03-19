"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

interface User {
  id: string;
  phone: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<{ error?: string }>;
  signup: (phone: string, password: string, name: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  login: async () => ({}),
  signup: async () => ({}),
  logout: async () => {},
});

function formatPhoneEmail(phone: string): string {
  // Convert phone number to a fake email for Supabase email/password auth
  // Supabase needs email-based auth, so we use phone@mimaji.app
  let cleaned = phone.replace(/\s/g, "").replace(/^\+/, "");
  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.slice(1);
  }
  return `${cleaned}@mimaji.app`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Map a Supabase user to our User type
  const mapUser = useCallback((supaUser: SupabaseUser | null, sess: Session | null): User | null => {
    if (!supaUser) return null;
    const meta = supaUser.user_metadata || {};
    return {
      id: supaUser.id,
      phone: meta.phone || supaUser.email?.replace("@mimaji.app", "") || "",
      name: meta.full_name || meta.name || "",
    };
  }, []);

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(mapUser(sess?.user ?? null, sess));
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(mapUser(sess?.user ?? null, sess));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [mapUser]);

  const login = useCallback(async (phone: string, password: string): Promise<{ error?: string }> => {
    const email = formatPhoneEmail(phone);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        return { error: "Invalid phone number or password" };
      }
      return { error: error.message };
    }
    return {};
  }, []);

  const signup = useCallback(async (phone: string, password: string, name: string): Promise<{ error?: string }> => {
    const email = formatPhoneEmail(phone);
    let cleaned = phone.replace(/\s/g, "").replace(/^\+/, "");
    if (cleaned.startsWith("0")) {
      cleaned = "254" + cleaned.slice(1);
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone: cleaned,
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        return { error: "This phone number is already registered. Please log in." };
      }
      return { error: error.message };
    }
    return {};
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
