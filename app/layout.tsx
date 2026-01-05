import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import StoreProvider from "@/lib/redux/StoreProvider";
import QueryProvider from "@/lib/QueryProvider";
import ConditionalLayout from "./components/ConditionalLayout";
import AuthProvider from "@/lib/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Helper function to ensure URL has protocol
function ensureProtocol(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

// Base URL for the site (update this to your production URL)
const siteUrl = ensureProtocol(process.env.NEXT_PUBLIC_SITE_URL || "https://bberrybd.com");

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BlackBerry | Premium Tech Gadgets & Electronics Store in Bangladesh",
    template: "%s | BlackBerry",
  },
  description:
    "Shop premium tech gadgets, smartphones, laptops, smartwatches, earbuds, and electronics at the best prices in Bangladesh. Free shipping, EMI available, and 24/7 support.",
  keywords: [
    "tech gadgets",
    "smartphones",
    "laptops",
    "smartwatch",
    "earbuds",
    "electronics",
    "gadgets Bangladesh",
    "online shopping",
    "best price",
    "free shipping",
    "EMI available",
    "BlackBerry BD",
  ],
  authors: [{ name: "BlackBerry" }],
  creator: "BlackBerry",
  publisher: "BlackBerry",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "BlackBerry",
    title: "BlackBerry | Premium Tech Gadgets & Electronics Store",
    description:
      "Shop premium tech gadgets and electronics at the best prices. Free shipping & EMI available.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BlackBerry - Your Tech Gadget Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BlackBerry | Premium Tech Gadgets Store",
    description:
      "Shop premium tech gadgets and electronics at the best prices.",
    images: ["/og-image.jpg"],
    creator: "@bberrybd",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: siteUrl,
  },
  category: "ecommerce",
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "BlackBerry",
              url: siteUrl,
              logo: `${siteUrl}/logo.png`,
              description:
                "Premium tech gadgets and electronics store in Bangladesh",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+880-1234-567890",
                contactType: "customer service",
                availableLanguage: ["English", "Bengali"],
              },
              sameAs: [
                "https://facebook.com/bberrybd",
                "https://instagram.com/bberrybd",
                "https://twitter.com/bberrybd",
              ],
            }),
          }}
        />
        {/* Structured Data for WebSite (enables sitelinks search box) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "BlackBerry",
              url: siteUrl,
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${siteUrl}/allProducts?search={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* Structured Data for E-commerce Store */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              name: "BlackBerry",
              image: `${siteUrl}/og-image.jpg`,
              url: siteUrl,
              telephone: "+880-1234-567890",
              priceRange: "৳৳",
              address: {
                "@type": "PostalAddress",
                streetAddress: "123 Tech Street",
                addressLocality: "Dhaka",
                addressRegion: "Dhaka",
                postalCode: "1205",
                addressCountry: "BD",
              },
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ],
                opens: "00:00",
                closes: "23:59",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <StoreProvider>
            <QueryProvider>
              <ConditionalLayout>{children}</ConditionalLayout>
            </QueryProvider>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
