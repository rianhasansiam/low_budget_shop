import type { Metadata } from "next";
import HeroCarousel from "./components/HeroCarousel";

import FeaturedProducts from "./components/FeaturedProducts";
import AllProductsSection from "./components/AllProductsSection";

import CategoriesSection from "./components/CategoriesSection";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bberrybd.com";

// SEO Metadata
export const metadata: Metadata = {
  title: "BlackBerry | Premium Tech Gadgets & Electronics Store in Bangladesh",
  description:
    "Shop the best tech gadgets, smartphones, laptops, smartwatches, earbuds, power banks, and electronics at unbeatable prices. Free shipping, easy EMI, and 24/7 customer support in Bangladesh.",
  keywords: [
    "tech gadgets Bangladesh",
    "smartphone price BD",
    "laptop deals",
    "smartwatch",
    "earbuds",
    "power bank",
    "electronics store",
    "online gadget shop",
    "best gadget deals",
    "buy electronics online",
    "tech accessories",
    "BlackBerry BD",
  ],
  openGraph: {
    title: "BlackBerry | Premium Tech Gadgets & Electronics Store",
    description:
      "Shop premium tech gadgets and electronics at the best prices. Free shipping & easy EMI available in Bangladesh.",
    type: "website",
    url: siteUrl,
    siteName: "BlackBerry",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BlackBerry - Your Premier Tech Gadget Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BlackBerry | Premium Tech Gadgets Store",
    description:
      "Shop premium tech gadgets and electronics at unbeatable prices.",
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
            name: "BlackBerry - Home",
            description: "Premium Tech Gadgets & Electronics Store in Bangladesh",
            url: siteUrl,
            isPartOf: {
              "@type": "WebSite",
              name: "BlackBerry",
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
