import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — MiMaji",
  description:
    "MiMaji terms of service for water delivery in Nairobi. Read our terms before placing an order through the MiMaji app or website.",
  alternates: { canonical: "/terms" },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
