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
const siteUrl = ensureProtocol(process.env.NEXT_PUBLIC_SITE_URL || "https://low-budget.vercel.app");

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
    default: "Digicam Market | Best Camera Accessories & Electronics Store in Bangladesh",
    template: "%s | Digicam Market",
  },
  description:
    "Shop premium camera accessories, DSLR, mirrorless cameras, lenses, tripods, and electronics at the best prices in Bangladesh. Free shipping, EMI available, and 24/7 support.",
  keywords: [
    "camera accessories",
    "DSLR camera",
    "mirrorless camera",
    "camera lens",
    "tripod",
    "photography equipment",
    "electronics store",
    "Bangladesh",
    "online shopping",
    "best price",
    "free shipping",
    "EMI available",
  ],
  authors: [{ name: "Digicam Market" }],
  creator: "Digicam Market",
  publisher: "Digicam Market",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Digicam Market",
    title: "Digicam Market | Best Camera Accessories & Electronics Store",
    description:
      "Shop premium camera accessories and electronics at the best prices. Free shipping & EMI available.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Digicam Market - Your Camera Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digicam Market | Best Camera Accessories Store",
    description:
      "Shop premium camera accessories and electronics at the best prices.",
    images: ["/og-image.jpg"],
    creator: "@digicammarket",
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
              name: "Digicam Market",
              url: siteUrl,
              logo: `${siteUrl}/logo.png`,
              description:
                "Premium camera accessories and electronics store in Bangladesh",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+880-1234-567890",
                contactType: "customer service",
                availableLanguage: ["English", "Bengali"],
              },
              sameAs: [
                "https://facebook.com/digicammarket",
                "https://instagram.com/digicammarket",
                "https://twitter.com/digicammarket",
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
              name: "Digicam Market",
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
              name: "Digicam Market",
              image: `${siteUrl}/og-image.jpg`,
              url: siteUrl,
              telephone: "+880-1234-567890",
              priceRange: "৳৳",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Your Street Address",
                addressLocality: "Dhaka",
                addressRegion: "Dhaka",
                postalCode: "1000",
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
