"use client";

import { ReactNode } from "react";
import { LangProvider } from "@/lib/LangContext";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return <LangProvider>{children}</LangProvider>;
}
