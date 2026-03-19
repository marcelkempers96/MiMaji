"use client";

import React from "react";
import { AuthProvider } from "./AuthContext";
import { LocationProvider } from "./LocationContext";
import { CartProvider } from "./CartContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
