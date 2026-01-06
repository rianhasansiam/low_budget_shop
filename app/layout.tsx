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
const siteUrl = ensureProtocol(process.env.NEXT_PUBLIC_SITE_URL || "https://engineersgadget.tech");

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "EngineersGadget | Premium Tech Gadgets & Electronics Store",
    template: "%s | EngineersGadget",
  },
  description:
    "Discover premium tech gadgets, electronics, developer tools, IoT devices, Arduino, Raspberry Pi, and engineering essentials. Best prices, fast shipping, and expert support for engineers and tech enthusiasts.",
  keywords: [
    "tech gadgets",
    "electronics",
    "engineering tools",
    "Arduino",
    "Raspberry Pi",
    "IoT devices",
    "developer tools",
    "microcontrollers",
    "sensors",
    "robotics",
    "3D printing",
    "smart devices",
    "programming accessories",
    "electronic components",
    "EngineersGadget",
    "tech store",
    "online electronics shop",
  ],
  authors: [{ name: "EngineersGadget", url: "https://engineersgadget.tech" }],
  creator: "EngineersGadget",
  publisher: "EngineersGadget",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "EngineersGadget",
    title: "EngineersGadget | Premium Tech Gadgets & Electronics Store",
    description:
      "Discover premium tech gadgets, electronics, and engineering tools. Arduino, Raspberry Pi, IoT devices & more. Fast shipping & expert support.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "EngineersGadget - Your Ultimate Tech & Engineering Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EngineersGadget | Premium Tech Gadgets Store",
    description:
      "Discover premium tech gadgets, electronics, and engineering tools at the best prices.",
    images: ["/og-image.jpg"],
    creator: "@engineersgadget",
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
              name: "EngineersGadget",
              url: siteUrl,
              logo: `${siteUrl}/logo.png`,
              description:
                "Premium tech gadgets, electronics, and engineering tools store for developers and tech enthusiasts",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+880-1234-567890",
                contactType: "customer service",
                availableLanguage: ["English", "Bengali"],
              },
              sameAs: [
                "https://facebook.com/engineersgadget",
                "https://instagram.com/engineersgadget",
                "https://twitter.com/engineersgadget",
                "https://github.com/engineersgadget",
                "https://linkedin.com/company/engineersgadget",
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
              name: "EngineersGadget",
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
              name: "EngineersGadget",
              image: `${siteUrl}/og-image.jpg`,
              url: siteUrl,
              telephone: "+880-1234-567890",
              priceRange: "$$",
              description: "Your one-stop shop for tech gadgets, electronics, and engineering tools",
              address: {
                "@type": "PostalAddress",
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
