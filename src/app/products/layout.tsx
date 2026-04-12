import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Water Products & 20L Jugs — MiMaji Nairobi",
  description:
    "Shop 20L water jugs, refills, and subscription plans from KEBS-certified suppliers in Nairobi. Purified, verified, and delivered by MiMaji. Order via M-Pesa today.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Water Products & 20L Jugs — MiMaji Nairobi",
    description:
      "Shop 20L water jugs, refills, and subscriptions from KEBS-certified Nairobi suppliers. Delivered to your door. Pay via M-Pesa.",
    url: "/products",
    type: "website",
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
