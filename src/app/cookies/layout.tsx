import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — MiMaji",
  description:
    "What MiMaji stores on your device and how to stop it. No advertising cookies, no cross-site tracking, and no cookie on this site touches payment details.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
