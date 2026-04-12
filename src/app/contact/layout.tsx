import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact MiMaji — Water Delivery Support Nairobi",
  description:
    "Get in touch with MiMaji. 24/7 WhatsApp, phone, and email support for water delivery orders in Nairobi. Call +254 758 434 076 or order clean water online today.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact MiMaji — Water Delivery Support Nairobi",
    description:
      "24/7 WhatsApp, phone, email support for water delivery orders in Nairobi. Call +254 758 434 076.",
    url: "/contact",
    type: "website",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
