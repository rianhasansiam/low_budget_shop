import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://engineersgadget.com.bd";
const siteName = "Engineers Gadget";
const defaultImage = "/og-image.jpg";

// Next.js only supports these OpenGraph types
type OpenGraphType = "website" | "article";

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: OpenGraphType;
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
}

// Generate comprehensive metadata for any page
export function generateSEOMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = defaultImage,
    url = siteUrl,
    type = "website",
    noIndex = false,
    publishedTime,
    modifiedTime,
  } = config;

  const fullUrl = url.startsWith("http") ? url : `${siteUrl}${url}`;
  const imageUrl = image.startsWith("http") ? image : `${siteUrl}${image}`;

  const baseKeywords = [
    "Engineers Gadget",
    "gadget store Bangladesh",
    "electronics Bangladesh",
    "tech gadgets",
    "quality gadgets",
    "online shopping Bangladesh",
  ];

  return {
    title,
    description,
    keywords: [...new Set([...keywords, ...baseKeywords])],
    authors: [{ name: siteName, url: siteUrl }],
    creator: siteName,
    publisher: siteName,
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName,
      type,
      locale: "en_US",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/jpeg",
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      creator: "@engineersgadget",
      site: "@engineersgadget",
    },
    alternates: {
      canonical: fullUrl,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
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
  };
}

// Product page metadata generator
export function generateProductMetadata(product: {
  name: string;
  description: string;
  image: string;
  price: number;
  category?: string;
  id: string;
}): Metadata {
  const priceFormatted = `৳${product.price.toLocaleString()}`;
  
  return generateSEOMetadata({
    title: `${product.name} - Buy at ${priceFormatted} | Engineers Gadget`,
    description: `${product.description.slice(0, 150)}... Buy ${product.name} at the best price in Bangladesh. Fast delivery & 100% original products.`,
    keywords: [
      product.name.toLowerCase(),
      `buy ${product.name.toLowerCase()}`,
      `${product.name.toLowerCase()} price Bangladesh`,
      `${product.name.toLowerCase()} online`,
      product.category?.toLowerCase() || "",
    ].filter(Boolean),
    image: product.image,
    url: `/productDetails/${product.id}`,
    type: "website", // Use website type; product schema is added via JSON-LD
  });
}

// Category page metadata generator
export function generateCategoryMetadata(category: {
  name: string;
  description?: string;
  productCount?: number;
}): Metadata {
  const description =
    category.description ||
    `Shop the best ${category.name} products at Engineers Gadget. ${category.productCount ? `Browse ${category.productCount}+ products` : "Wide selection"} with fast delivery across Bangladesh.`;

  return generateSEOMetadata({
    title: `${category.name} - Shop Best ${category.name} Products | Engineers Gadget`,
    description,
    keywords: [
      category.name.toLowerCase(),
      `${category.name.toLowerCase()} Bangladesh`,
      `buy ${category.name.toLowerCase()}`,
      `${category.name.toLowerCase()} price`,
      `best ${category.name.toLowerCase()}`,
    ],
    url: `/category/${encodeURIComponent(category.name)}`,
  });
}

// Search results metadata
export function generateSearchMetadata(query: string, resultCount: number): Metadata {
  return generateSEOMetadata({
    title: `Search: "${query}" - ${resultCount} Results | Engineers Gadget`,
    description: `Found ${resultCount} products matching "${query}" at Engineers Gadget. Shop quality tech gadgets with fast delivery in Bangladesh.`,
    keywords: [query.toLowerCase(), `${query.toLowerCase()} price`, `buy ${query.toLowerCase()}`],
    url: `/allProducts?search=${encodeURIComponent(query)}`,
    noIndex: true, // Search pages typically shouldn't be indexed
  });
}
