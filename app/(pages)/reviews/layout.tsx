import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://engineersgadget.com.bd";

export const metadata: Metadata = {
  title: "Customer Reviews | EngineersGadget - Real Feedback from Real Customers",
  description:
    "See what our customers are saying about EngineersGadget. Browse authentic reviews, photos, and ratings from 25,000+ happy customers across Bangladesh.",
  keywords: [
    "customer reviews",
    "product reviews",
    "EngineersGadget reviews",
    "gadget store reviews",
    "customer feedback Bangladesh",
    "product ratings",
    "authentic reviews",
    "user testimonials",
  ],
  openGraph: {
    title: "Customer Reviews | EngineersGadget",
    description:
      "See what our customers are saying. Browse authentic reviews and photos from 25,000+ happy customers.",
    type: "website",
    url: `${siteUrl}/reviews`,
    siteName: "EngineersGadget",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "EngineersGadget Customer Reviews",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Customer Reviews | EngineersGadget",
    description:
      "See what our customers are saying. Browse authentic reviews from 25,000+ happy customers.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: `${siteUrl}/reviews`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function ReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
