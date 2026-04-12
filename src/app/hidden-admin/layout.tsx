import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  description: "MiMaji admin panel.",
  robots: { index: false, follow: false, nocache: true },
};

export default function HiddenAdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
