import type { Metadata } from "next";
import ProductDetailsClient from "./ProductDetailsClient";

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
      const data = await res.json();
      const product = data.data;
      
      if (product) {
        return {
          title: `${product.name} | BlackBerry`,
          description: product.description?.slice(0, 160) || `Buy ${product.name} at the best price.`,
          openGraph: {
            title: product.name,
            description: product.description,
            images: [product.image],
          },
        };
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }
  
  return {
    title: "Product Details | BlackBerry",
    description: "View detailed product information, specifications, and reviews.",
  };
}

export default async function ProductDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  return <ProductDetailsClient productId={id} />;
}
