"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Test account - bypass OTP/password for development
const TEST_PHONE = "254758434076";
const TEST_PASSWORD = "mimaji2024";
const TEST_USER = {
  id: "test-user-001",
  fullName: "Marcel Kempers",
  phone: TEST_PHONE,
  role: "customer" as const,
  address: "Kilimani, Nairobi",
  mpesaNumber: TEST_PHONE,
};

export interface AuthUser {
  id: string;
  fullName: string;
  phone: string;
  role: "customer" | "vendor" | "distributor" | "admin";
  address?: string;
  mpesaNumber?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => void;
}

interface SignupData {
  fullName: string;
  phone: string;
  password: string;
  address?: string;
  mpesaNumber?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("mimaji-user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("mimaji-user");
      }
    }
    setIsLoading(false);
  }, []);

  const persistUser = (u: AuthUser) => {
    setUser(u);
    localStorage.setItem("mimaji-user", JSON.stringify(u));
  };

  const login = async (phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const formattedPhone = phone.startsWith("254") ? phone : `254${phone}`;

    // Test account - instant login
    if (formattedPhone === TEST_PHONE && password === TEST_PASSWORD) {
      persistUser(TEST_USER);
      return { success: true };
    }

    // Check localStorage registered users
    const users = JSON.parse(localStorage.getItem("mimaji-users") || "[]");
    const found = users.find((u: { phone: string; password: string }) => u.phone === formattedPhone && u.password === password);
    if (found) {
      persistUser({
        id: found.id,
        fullName: found.fullName,
        phone: found.phone,
        role: found.role || "customer",
        address: found.address,
        mpesaNumber: found.mpesaNumber,
      });
      return { success: true };
    }

    return { success: false, error: "Invalid phone number or password" };
  };

  const signup = async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
    const formattedPhone = data.phone.startsWith("254") ? data.phone : `254${data.phone}`;

    // Check if already registered
    const users = JSON.parse(localStorage.getItem("mimaji-users") || "[]");
    if (users.some((u: { phone: string }) => u.phone === formattedPhone)) {
      return { success: false, error: "Phone number already registered" };
    }

    const newUser = {
      id: `user-${Date.now()}`,
      fullName: data.fullName,
      phone: formattedPhone,
      password: data.password,
      role: "customer",
      address: data.address || "",
      mpesaNumber: data.mpesaNumber || formattedPhone,
    };

    users.push(newUser);
    localStorage.setItem("mimaji-users", JSON.stringify(users));

    persistUser({
      id: newUser.id,
      fullName: newUser.fullName,
      phone: newUser.phone,
      role: "customer",
      address: newUser.address,
      mpesaNumber: newUser.mpesaNumber,
    });

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mimaji-user");
  };

  const updateProfile = (updates: Partial<AuthUser>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    persistUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
