import type { Metadata } from "next";
import ProductDetailsClient from "./ProductDetailsClient";
import { generateProductSchema, generateBreadcrumbSchema, stringifySchema } from "@/lib/seo/structuredData";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://engineersgadget.com.bd";

// Generate dynamic metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const { id } = await params;
  
  try {
    // Fetch product data for metadata
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/products/${id}`, {
      cache: 'force-cache',
    });
    
    if (res.ok) {
      const product = await res.json();
      
      if (product && product.name) {
        const priceFormatted = `৳${product.price?.toLocaleString() || 0}`;
        const description = product.description?.slice(0, 155) || `Buy ${product.name} at Engineers Gadget`;
        
        return {
          title: `${product.name} - Buy at ${priceFormatted} | Engineers Gadget`,
          description: `${description}. Fast delivery across Bangladesh. 100% original products. Shop now!`,
          keywords: [
            product.name?.toLowerCase(),
            `buy ${product.name?.toLowerCase()}`,
            `${product.name?.toLowerCase()} price`,
            `${product.name?.toLowerCase()} Bangladesh`,
            product.category?.toLowerCase(),
            "online shopping Bangladesh",
            "quality gadgets",
          ].filter(Boolean),
          openGraph: {
            title: `${product.name} - ${priceFormatted}`,
            description: description,
            url: `${siteUrl}/productDetails/${id}`,
            siteName: "Engineers Gadget",
            type: "website",
            images: [
              {
                url: product.image || "/og-image.jpg",
                width: 800,
                height: 800,
                alt: product.name,
              },
            ],
          },
          twitter: {
            card: "summary_large_image",
            title: `${product.name} - ${priceFormatted}`,
            description: description,
            images: [product.image || "/og-image.jpg"],
          },
          alternates: {
            canonical: `${siteUrl}/productDetails/${id}`,
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
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }
  
  return {
    title: "Product Details | Engineers Gadget",
    description: "View detailed product information, specifications, and reviews. Shop quality tech gadgets at Engineers Gadget Bangladesh.",
  };
}

// Fetch product for structured data
async function getProduct(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/products/${id}`, {
      cache: 'force-cache',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error('Error fetching product:', error);
  }
  return null;
}

export default async function ProductDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const product = await getProduct(id);

  // Generate structured data for SEO
  const productSchema = product ? generateProductSchema({
    name: product.name || "Product",
    description: product.description || "",
    image: product.images?.length > 0 ? product.images : [product.image],
    price: product.price || 0,
    originalPrice: product.originalPrice,
    currency: "BDT",
    sku: product._id || id,
    brand: product.brand || "Engineers Gadget",
    category: product.category,
    inStock: product.stock > 0,
    rating: product.averageRating,
    reviewCount: product.reviewCount,
    url: `${siteUrl}/productDetails/${id}`,
  }) : null;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    ...(product?.category ? [{ name: product.category, url: `/category/${encodeURIComponent(product.category)}` }] : []),
    { name: product?.name || "Product", url: `/productDetails/${id}` },
  ]);
  
  return (
    <>
      {/* Product Structured Data */}
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: stringifySchema(productSchema) }}
        />
      )}
      
      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifySchema(breadcrumbSchema) }}
      />
      
      <ProductDetailsClient productId={id} />
    </>
  );
}
