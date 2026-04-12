import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refunds & Cancellation Policy — MiMaji",
  description:
    "MiMaji refund and cancellation policy for water delivery in Nairobi. Quality guarantee: replacement within 24 hours if your delivery does not meet expectations.",
  alternates: { canonical: "/cancellation" },
};

export default function CancellationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
