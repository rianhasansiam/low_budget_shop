import type { Metadata } from "next";
import HeroCarousel from "./components/HeroCarousel";

import FeaturedProducts from "./components/FeaturedProducts";
import AllProductsSection from "./components/AllProductsSection";

import CategoriesSection from "./components/CategoriesSection";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://engineersgadget.tech";

// SEO Metadata
export const metadata: Metadata = {
  title: "EngineersGadget | Premium Tech Gadgets & Electronics Store",
  description:
    "Discover premium tech gadgets, electronics, Arduino, Raspberry Pi, IoT devices, and engineering tools. Best prices, fast shipping, and expert support for engineers and tech enthusiasts.",
  keywords: [
    "tech gadgets",
    "electronics store",
    "Arduino",
    "Raspberry Pi",
    "IoT devices",
    "engineering tools",
    "microcontrollers",
    "sensors",
    "robotics",
    "developer tools",
    "electronic components",
    "EngineersGadget",
  ],
  openGraph: {
    title: "EngineersGadget | Premium Tech Gadgets & Electronics Store",
    description:
      "Discover premium tech gadgets, electronics, and engineering tools. Arduino, Raspberry Pi, IoT devices & more.",
    type: "website",
    url: siteUrl,
    siteName: "EngineersGadget",
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
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Structured Data for Homepage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "EngineersGadget - Home",
            description: "Premium Tech Gadgets, Electronics & Engineering Tools Store",
            url: siteUrl,
            isPartOf: {
              "@type": "WebSite",
              name: "EngineersGadget",
              url: siteUrl,
            },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: siteUrl,
                },
              ],
            },
          }),
        }}
      />
      <HeroCarousel />
     
      <CategoriesSection />
      <FeaturedProducts />
      <AllProductsSection />

      
    </main>
  );
}
