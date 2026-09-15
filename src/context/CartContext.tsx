"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface AppliedVoucher {
  code: string;
  /** Waives the delivery fee entirely. */
  freeDelivery: boolean;
  /** Flat amount off the subtotal, for percentage/fixed vouchers. */
  discountAmount: number;
  description: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  /** The standard fee, before any voucher. UI strikes this through. */
  deliveryFee: number;
  /** What the voucher takes off the delivery fee (0 or the full fee). */
  deliveryDiscount: number;
  /** What the voucher takes off the subtotal. */
  voucherDiscount: number;
  voucher: AppliedVoucher | null;
  applyVoucher: (v: AppliedVoucher) => void;
  clearVoucher: () => void;
  total: number;
}

const DELIVERY_FEE = 100;
const CART_STORAGE_KEY = "mimaji_cart";
const VOUCHER_STORAGE_KEY = "mimaji_cart_voucher";

function loadVoucherFromStorage(): AppliedVoucher | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(VOUCHER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppliedVoucher) : null;
  } catch {
    return null;
  }
}

function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveCartToStorage(items: CartItem[]) {
  try {
    if (items.length === 0) {
      localStorage.removeItem(CART_STORAGE_KEY);
    } else {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  } catch {}
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  subtotal: 0,
  deliveryFee: DELIVERY_FEE,
  deliveryDiscount: 0,
  voucherDiscount: 0,
  voucher: null,
  applyVoucher: () => {},
  clearVoucher: () => {},
  total: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);
  // The code is entered in the cart but consumed at /confirm, so it has to
  // survive the navigation through /delivery.
  const [voucher, setVoucher] = useState<AppliedVoucher | null>(loadVoucherFromStorage);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      );
    }
  }, []);

  const applyVoucher = useCallback((v: AppliedVoucher) => {
    setVoucher(v);
    try { localStorage.setItem(VOUCHER_STORAGE_KEY, JSON.stringify(v)); } catch {}
  }, []);

  const clearVoucher = useCallback(() => {
    setVoucher(null);
    try { localStorage.removeItem(VOUCHER_STORAGE_KEY); } catch {}
  }, []);

  // An emptied cart drops the voucher too, so a code cannot survive into an
  // unrelated later order.
  const clearCart = useCallback(() => {
    setItems([]);
    setVoucher(null);
    try { localStorage.removeItem(VOUCHER_STORAGE_KEY); } catch {}
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;
  const deliveryDiscount = voucher?.freeDelivery ? deliveryFee : 0;
  const voucherDiscount = Math.min(voucher?.discountAmount || 0, subtotal);
  const total = Math.max(subtotal + deliveryFee - deliveryDiscount - voucherDiscount, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        deliveryFee,
        deliveryDiscount,
        voucherDiscount,
        voucher,
        applyVoucher,
        clearVoucher,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
