import type { Metadata } from "next";
import CategoryPageClient from "./CategoryPageClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bberrybd.com";

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = decodeURIComponent(slug);

  return {
    title: `${categoryName} - Shop Best ${categoryName} Products`,
    description: `Browse our collection of ${categoryName}. Find the best deals on ${categoryName} with free shipping and EMI options. Shop now at BlackBerry.`,
    keywords: [
      categoryName.toLowerCase(),
      `${categoryName.toLowerCase()} price`,
      `buy ${categoryName.toLowerCase()}`,
      `${categoryName.toLowerCase()} online`,
      "tech gadgets",
      "best price",
      "Bangladesh",
    ],
    openGraph: {
      title: `${categoryName} | BlackBerry`,
      description: `Shop the best ${categoryName} at BlackBerry. Quality products, great prices.`,
      type: "website",
      url: `${siteUrl}/category/${encodeURIComponent(categoryName)}`,
      siteName: "BlackBerry",
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryName} | BlackBerry`,
      description: `Shop the best ${categoryName} at BlackBerry. Quality products, great prices.`,
    },
    alternates: {
      canonical: `${siteUrl}/category/${encodeURIComponent(categoryName)}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Generate static params for popular categories (optional - improves build performance)
export async function generateStaticParams() {
  // You can fetch categories from API here for static generation
  // For now, return empty array for dynamic generation
  return [];
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categoryName = decodeURIComponent(slug);

  return (
    <>
      {/* Structured Data for Category Page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${categoryName} - BlackBerry`,
            description: `Browse our collection of ${categoryName}`,
            url: `${siteUrl}/category/${encodeURIComponent(categoryName)}`,
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
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Products",
                  item: `${siteUrl}/allProducts`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: categoryName,
                  item: `${siteUrl}/category/${encodeURIComponent(categoryName)}`,
                },
              ],
            },
          }),
        }}
      />
      <CategoryPageClient categoryName={categoryName} />
    </>
  );
}
