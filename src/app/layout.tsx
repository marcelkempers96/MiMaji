import type { Metadata, Viewport } from "next";
import Script from "next/script";
import Providers from "@/context/Providers";
import AppShell from "@/components/layout/AppShell";
import "./globals.css";

const SITE_URL = "https://www.mimaji.co.ke";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MiMaji — Clean Water Delivery in Nairobi | Order 20L Jugs via M-Pesa",
    template: "%s | MiMaji",
  },
  description:
    "Order KEBS-certified clean water delivered to your door in Nairobi. 20L jugs, transparent pricing, M-Pesa payment, GPS-tracked delivery. Every bottle verified with a Water Passport.",
  keywords: [
    "water delivery Nairobi",
    "clean water Nairobi",
    "20L water jug delivery",
    "M-Pesa water delivery",
    "KEBS certified water",
    "drinking water Nairobi",
    "water vendor Nairobi",
    "MiMaji",
    "water bottle delivery",
    "purified water delivery",
  ],
  authors: [{ name: "MiMaji" }],
  creator: "MiMaji",
  publisher: "MiMaji",
  applicationName: "MiMaji",
  category: "Water Delivery",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: SITE_URL,
    siteName: "MiMaji",
    title: "MiMaji — Clean Water Delivery in Nairobi | Order 20L Jugs via M-Pesa",
    description:
      "Order KEBS-certified clean water delivered to your door in Nairobi. 20L jugs, transparent pricing, M-Pesa payment, GPS-tracked delivery. Every bottle verified.",
    images: [
      {
        url: "/logo1.png",
        width: 1200,
        height: 630,
        alt: "MiMaji — Clean Water Delivery in Nairobi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MiMaji — Clean Water Delivery in Nairobi",
    description:
      "KEBS-certified water delivered to your door. 20L jugs. M-Pesa payment. GPS tracking. Every bottle verified.",
    images: ["/logo1.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  manifest: "/site.webmanifest",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#2979C1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MiMaji" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-background text-text-primary">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
            strategy="lazyOnload"
          />
        )}
      </body>
    </html>
  );
}
