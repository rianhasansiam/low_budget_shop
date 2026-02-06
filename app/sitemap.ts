import { MetadataRoute } from 'next';
import { getCollection } from '@/lib/mongodb';

// Helper function to ensure URL has protocol
function ensureProtocol(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

const siteUrl = ensureProtocol(process.env.NEXT_PUBLIC_SITE_URL || 'https://engineersgadget.com.bd');

// Revalidate sitemap every 24 hours
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();
  
  // Static pages with priority settings
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/allProducts`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/reviews`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  // Dynamic category pages
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categoriesCollection = await getCollection('categories');
    const categories = await categoriesCollection.find({}).toArray();
    
    categoryPages = categories.map((category) => ({
      url: `${siteUrl}/category/${encodeURIComponent(category.name)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
  }

  // Dynamic product pages (when product details page is ready)
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const productsCollection = await getCollection('allProducts');
    const products = await productsCollection
      .find({})
      .project({ _id: 1, updatedAt: 1 })
      .limit(1000)
      .toArray();
    
    productPages = products.map((product) => ({
      url: `${siteUrl}/productDetails/${product._id}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
