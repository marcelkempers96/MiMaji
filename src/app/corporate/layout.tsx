import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Corporate Water Solutions — Offices & Businesses Nairobi",
  description:
    "Scheduled office water delivery in Nairobi: volume pricing from three jugs, monthly invoicing, dispenser-ready 18.9L and 20L jugs, and one named contact.",
  alternates: { canonical: "/corporate" },
  openGraph: {
    title: "Corporate Water Solutions — Offices & Businesses Nairobi",
    description:
      "Scheduled office water delivery in Nairobi: volume pricing from three jugs, monthly invoicing, dispenser-ready 18.9L and 20L jugs, and one named contact.",
    url: "/corporate",
    type: "website",
  },
};

export default function CorporateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
