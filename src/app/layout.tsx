import type { Metadata, Viewport } from "next";
import Script from "next/script";
import Providers from "@/context/Providers";
import AppShell from "@/components/layout/AppShell";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import "./globals.css";

const SITE_URL = "https://www.mimaji.co.ke";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Order Water Online in Nairobi | MiMaji — Clean, Cheap & Verified Water on Demand",
    template: "%s | MiMaji — Order Water Online",
  },
  description:
    "Order Water Online in Nairobi with MiMaji. Clean, affordable (cheap) and verifiable water on demand, delivered fast to your door. KEBS-certified 20L jugs, M-Pesa payment, GPS-tracked delivery. Serving all of Africa, starting with Nairobi.",
  keywords: [
    "order water online",
    "order water online Nairobi",
    "order water online Kenya",
    "order water online Africa",
    "cheap water delivery Nairobi",
    "fast water delivery Nairobi",
    "verified water Nairobi",
    "clean water on demand",
    "affordable water delivery",
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
    "water delivery Africa",
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
    title: "Order Water Online in Nairobi | MiMaji — Clean, Cheap & Verified Water on Demand",
    description:
      "Order Water Online in Nairobi. Clean, affordable and verifiable water on demand, delivered fast to your door. Pay with M-Pesa. Serving all of Africa, starting with Nairobi.",
    images: [
      {
        url: "/logo1.png",
        width: 1200,
        height: 630,
        alt: "Order Water Online in Nairobi — MiMaji",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Order Water Online in Nairobi | MiMaji",
    description:
      "Clean, affordable and verifiable water on demand, delivered fast to your door. Pay with M-Pesa. Serving all of Africa, starting with Nairobi.",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${SITE_URL}#organization`,
                  name: "MiMaji",
                  url: SITE_URL,
                  logo: `${SITE_URL}/logo1.png`,
                  description:
                    "Order Water Online in Nairobi. Clean, affordable and verifiable water on demand, delivered fast to your door. Serving all of Africa, starting with Nairobi.",
                  areaServed: [
                    { "@type": "City", name: "Nairobi" },
                    { "@type": "Country", name: "Kenya" },
                    { "@type": "Place", name: "Africa" },
                  ],
                  sameAs: ["https://mimaji.org"],
                },
                {
                  "@type": "WebSite",
                  "@id": `${SITE_URL}#website`,
                  url: SITE_URL,
                  name: "MiMaji",
                  description:
                    "Order Water Online in Nairobi. Clean, affordable and verifiable water on demand, delivered fast to your door.",
                  publisher: { "@id": `${SITE_URL}#organization` },
                  inLanguage: "en-KE",
                },
                {
                  "@type": "LocalBusiness",
                  "@id": `${SITE_URL}#localbusiness`,
                  name: "MiMaji — Order Water Online in Nairobi",
                  image: `${SITE_URL}/logo1.png`,
                  url: SITE_URL,
                  telephone: "+254704476338",
                  priceRange: "KSh",
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Nairobi",
                    addressCountry: "KE",
                  },
                  areaServed: { "@type": "City", name: "Nairobi" },
                  description:
                    "Order Water Online in Nairobi with MiMaji. Clean, affordable and verifiable water on demand, delivered fast. Pay with M-Pesa.",
                },
              ],
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-text-primary">
        <GoogleAnalytics />
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
