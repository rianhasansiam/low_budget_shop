import type { Metadata } from "next";
import HeroCarousel from "./components/HeroCarousel";
import FeaturedProducts from "./components/FeaturedProducts";
import AllProductsSection from "./components/AllProductsSection";
import CustomerSatisfaction from "./components/CustomerSatisfaction";
import CategoriesSection from "./components/CategoriesSection";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://engineersgadget.com.bd";

// SEO Metadata
export const metadata: Metadata = {
  title: "Engineers Gadget | Quality Gadget. Smart Price - Online Store in Bangladesh",
  description:
    "Engineers Gadget - Your trusted online gadget and electronics store in Bangladesh. 100% original tech gadgets, smart devices, and electronic accessories with fast delivery nationwide. 25,000+ happy customers. 99% recommended reviews.",
  keywords: [
    "Engineers Gadget",
    "gadget store Bangladesh",
    "electronics online Bangladesh",
    "tech gadgets Dhaka",
    "smart devices Bangladesh",
    "mobile accessories",
    "computer accessories",
    "original gadgets",
    "online shopping Bangladesh",
    "quality gadgets",
    "budget-friendly tech",
  ],
  openGraph: {
    title: "Engineers Gadget | Quality Gadget. Smart Price",
    description:
      "Your trusted online gadget store in Bangladesh. 100% original products, fast delivery, 25,000+ happy customers. Shop quality tech gadgets at the best prices.",
    type: "website",
    url: siteUrl,
    siteName: "Engineers Gadget",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Engineers Gadget - Quality Gadget. Smart Price",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Engineers Gadget | Quality Gadget. Smart Price",
    description:
      "Your trusted online gadget store in Bangladesh. 100% original products, fast delivery nationwide.",
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
            name: "Engineers Gadget - Home",
            description: "Quality Gadget. Smart Price - Your trusted online gadget and electronics store in Bangladesh",
            url: siteUrl,
            isPartOf: {
              "@type": "WebSite",
              name: "Engineers Gadget",
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
      <CustomerSatisfaction />
      <AllProductsSection />

      
    </main>
  );
}
