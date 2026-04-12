import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help & Support — MiMaji Water Delivery FAQs",
  description:
    "FAQs and customer support for MiMaji water delivery. Find answers about orders, delivery times, M-Pesa payment, refunds, and water quality in Nairobi. Order today.",
  alternates: { canonical: "/support" },
  openGraph: {
    title: "Help & Support — MiMaji Water Delivery FAQs",
    description:
      "FAQs and customer support for MiMaji water delivery. Orders, delivery, M-Pesa, refunds & water quality answered.",
    url: "/support",
    type: "website",
  },
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
