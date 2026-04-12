import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In — MiMaji",
  description: "Log in to your MiMaji account to order water, track deliveries, and manage subscriptions.",
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
