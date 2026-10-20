import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About MiMaji — Nairobi's Verified Water Delivery Platform",
  description:
    "MiMaji delivers drinking water across 48 Nairobi areas at one fixed price list, from vetted local vendors, with every bottle traceable by QR code.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About MiMaji — Nairobi's Verified Water Delivery Platform",
    description:
      "MiMaji delivers drinking water across 48 Nairobi areas at one fixed price list, from vetted local vendors, with every bottle traceable by QR code.",
    url: "/about",
    type: "website",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
