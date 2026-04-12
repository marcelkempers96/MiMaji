import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Water Delivery in Nairobi — 20L Jugs via M-Pesa",
  description:
    "Order 20L jugs of clean, KEBS-certified water delivered to your door in Nairobi. Fast same-day delivery, transparent pricing, M-Pesa payment. Every bottle verified.",
  alternates: { canonical: "/buy" },
  openGraph: {
    title: "Order Water Delivery in Nairobi — 20L Jugs via M-Pesa",
    description:
      "Order 20L jugs of clean, KEBS-certified water delivered to your door in Nairobi. Fast same-day delivery, transparent pricing, M-Pesa payment.",
    url: "/buy",
    type: "website",
  },
};

export default function BuyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
