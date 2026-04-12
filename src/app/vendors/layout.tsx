import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nairobi Water Vendor Map — Find KEBS-Certified Suppliers",
  description:
    "Find verified, KEBS-certified water suppliers across Nairobi on the MiMaji platform. Every vendor's source, lab tests, and licenses are verified before listing.",
  alternates: { canonical: "/vendors" },
  openGraph: {
    title: "Nairobi Water Vendor Map — Find KEBS-Certified Suppliers",
    description:
      "Find verified, KEBS-certified water suppliers across Nairobi. Sources, lab tests & licenses verified before listing.",
    url: "/vendors",
    type: "website",
  },
};

export default function VendorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
