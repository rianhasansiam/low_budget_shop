import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bberrybd.com";

export const metadata: Metadata = {
  title: "All Products - Shop Tech Gadgets & Electronics",
  description:
    "Browse our complete collection of tech gadgets, smartphones, laptops, smartwatches, earbuds, and electronics. Best prices with free shipping in Bangladesh.",
  keywords: [
    "tech gadgets",
    "smartphones",
    "laptops",
    "smartwatch",
    "earbuds",
    "electronics",
    "buy gadgets online",
    "gadget shop Bangladesh",
    "best gadget price",
  ],
  openGraph: {
    title: "All Products | BlackBerry",
    description:
      "Browse our complete collection of tech gadgets and electronics. Best prices with free shipping.",
    type: "website",
    url: `${siteUrl}/allProducts`,
    siteName: "BlackBerry",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Products | BlackBerry",
    description:
      "Browse our complete collection of tech gadgets and electronics. Best prices with free shipping.",
  },
  alternates: {
    canonical: `${siteUrl}/allProducts`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AllProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
