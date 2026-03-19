"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface User {
  phone: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (phone: string, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((phone: string, name: string) => {
    setUser({ phone, name });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
