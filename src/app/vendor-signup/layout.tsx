import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a MiMaji Water Vendor — Sell Water in Nairobi",
  description:
    "Deliver water in Nairobi? MiMaji routes orders to vetted vendors by area and stock. No joining fee, no monthly charge, one fixed price list.",
  alternates: { canonical: "/vendor-signup" },
  openGraph: {
    title: "Become a MiMaji Water Vendor — Sell Water in Nairobi",
    description:
      "Deliver water in Nairobi? MiMaji routes orders to vetted vendors by area and stock. No joining fee, no monthly charge, one fixed price list.",
    url: "/vendor-signup",
    type: "website",
  },
};

export default function VendorSignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
