import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Water Delivery Subscriptions — Weekly & Monthly Plans Nairobi",
  description:
    "Subscribe for scheduled water delivery in Nairobi. Weekly or monthly 20L jug plans with discounts, M-Pesa payment, and KEBS-certified water from MiMaji. Start today.",
  alternates: { canonical: "/subscriptions" },
  openGraph: {
    title: "Water Delivery Subscriptions — Weekly & Monthly Plans Nairobi",
    description:
      "Weekly or monthly 20L water jug subscriptions in Nairobi. Discounts, M-Pesa payment, KEBS-certified water.",
    url: "/subscriptions",
    type: "website",
  },
};

export default function SubscriptionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
