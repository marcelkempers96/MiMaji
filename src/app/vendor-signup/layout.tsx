import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a MiMaji Water Vendor — Sell Water in Nairobi",
  description:
    "Join MiMaji as a verified water supplier in Nairobi. Expand your reach, get new customers, and grow your KEBS-certified water business through our delivery platform.",
  alternates: { canonical: "/vendor-signup" },
  openGraph: {
    title: "Become a MiMaji Water Vendor — Sell Water in Nairobi",
    description:
      "Join MiMaji as a verified water supplier in Nairobi. Grow your KEBS-certified water business through our platform.",
    url: "/vendor-signup",
    type: "website",
  },
};

export default function VendorSignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
