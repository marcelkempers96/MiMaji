import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Corporate Water Solutions — Offices & Businesses Nairobi",
  description:
    "Bulk water delivery for Nairobi offices, restaurants, schools, and businesses. Scheduled delivery, invoicing, and KEBS-certified water from MiMaji. Get a quote today.",
  alternates: { canonical: "/corporate" },
  openGraph: {
    title: "Corporate Water Solutions — Offices & Businesses Nairobi",
    description:
      "Bulk water delivery for Nairobi offices, restaurants, schools & businesses. Scheduled delivery, invoicing, KEBS-certified water.",
    url: "/corporate",
    type: "website",
  },
};

export default function CorporateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
