// Structured Data Helpers for SEO
// Generates JSON-LD schema for better search engine understanding

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://engineersgadget.com.bd";

export interface ProductStructuredData {
  name: string;
  description: string;
  image: string | string[];
  price: number;
  originalPrice?: number;
  currency?: string;
  sku?: string;
  brand?: string;
  category?: string;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
  url: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

// Product Schema for individual product pages
export function generateProductSchema(product: ProductStructuredData) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: Array.isArray(product.image) ? product.image : [product.image],
    url: product.url,
    sku: product.sku || product.name.toLowerCase().replace(/\s+/g, "-"),
    brand: {
      "@type": "Brand",
      name: product.brand || "Engineers Gadget",
    },
    offers: {
      "@type": "Offer",
      url: product.url,
      priceCurrency: product.currency || "BDT",
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      availability: product.inStock !== false 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Engineers Gadget",
      },
    },
  };

  // Add category if provided
  if (product.category) {
    schema.category = product.category;
  }

  // Add aggregate rating if reviews exist
  if (product.rating && product.reviewCount && product.reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

// Breadcrumb Schema
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${siteUrl}${item.url}`,
    })),
  };
}

// FAQ Schema for FAQ sections
export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// Collection/Category Page Schema
export function generateCollectionSchema(
  name: string,
  description: string,
  products: { name: string; url: string; image: string; price: number }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: name,
    description: description,
    url: `${siteUrl}/category/${encodeURIComponent(name)}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 10).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.name,
          url: product.url,
          image: product.image,
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "BDT",
          },
        },
      })),
    },
  };
}

// Local Business Schema (more specific than Store)
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineBusiness",
    "@id": `${siteUrl}/#business`,
    name: "Engineers Gadget",
    alternateName: "EngineersGadget",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    image: `${siteUrl}/og-image.jpg`,
    description: "Quality Gadget. Smart Price - Your trusted online gadget and electronics store in Bangladesh",
    telephone: "+880 1621420608",
    email: "engineersgadet25@gmail.com",
    priceRange: "৳৳",
    currenciesAccepted: "BDT",
    paymentAccepted: "Cash on Delivery, bKash, Nagad",
    areaServed: {
      "@type": "Country",
      name: "Bangladesh",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dhaka",
      addressRegion: "Dhaka Division",
      addressCountry: "BD",
    },
    sameAs: [
      "https://facebook.com/engineersgadget",
      "https://instagram.com/engineersgadget",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "25000",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

// Review Schema
export function generateReviewSchema(reviews: {
  author: string;
  rating: number;
  text: string;
  date: string;
}[]) {
  return reviews.map((review) => ({
    "@type": "Review",
    author: {
      "@type": "Person",
      name: review.author,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.text,
    datePublished: review.date,
  }));
}

// Article Schema (for blog posts if added)
export function generateArticleSchema(article: {
  title: string;
  description: string;
  image: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: article.image,
    author: {
      "@type": "Organization",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Engineers Gadget",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url,
    },
  };
}

// Helper to stringify schema for injection
export function stringifySchema(schema: unknown): string {
  return JSON.stringify(schema);
}
