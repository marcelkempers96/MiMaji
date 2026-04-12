import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — MiMaji",
  description:
    "Cookie policy for the MiMaji website and app. Learn how we use cookies to deliver clean water and improve your experience on mimaji.co.ke.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
