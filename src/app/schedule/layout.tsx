import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule Water Delivery in Nairobi — MiMaji",
  description:
    "Book scheduled water delivery with MiMaji. Choose your day and time for recurring or one-off clean water delivery to your door in Nairobi. Pay via M-Pesa. Order now.",
  alternates: { canonical: "/schedule" },
  openGraph: {
    title: "Schedule Water Delivery in Nairobi — MiMaji",
    description:
      "Book scheduled water delivery. Choose your day & time for recurring or one-off clean water delivery in Nairobi.",
    url: "/schedule",
    type: "website",
  },
};

export default function ScheduleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
