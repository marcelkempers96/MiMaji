"use client";

import { ReactNode } from "react";
import { LangProvider } from "@/lib/LangContext";
import { AuthProvider } from "@/lib/AuthContext";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LangProvider>{children}</LangProvider>
    </AuthProvider>
  );
}
