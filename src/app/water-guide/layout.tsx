import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Water Quality Guide — KEBS & WHO Standards Explained",
  description:
    "Learn what makes water safe to drink: E. coli, TDS, pH, turbidity, lead and more. Understand KEBS and WHO drinking water standards with MiMaji's Nairobi guide.",
  alternates: { canonical: "/water-guide" },
  openGraph: {
    title: "Water Quality Guide — KEBS & WHO Standards Explained",
    description:
      "E. coli, TDS, pH, turbidity, lead. Understand KEBS and WHO drinking water standards with MiMaji's Nairobi water quality guide.",
    url: "/water-guide",
    type: "article",
  },
};

export default function WaterGuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
