import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — MiMaji",
  description:
    "MiMaji privacy policy: how we collect, use, and protect your personal data when you order water delivery in Nairobi through our app or website.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
