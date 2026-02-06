import { revalidateTag, revalidatePath } from "next/cache";

// Cache tags for different data types
export const CACHE_TAGS = {
  PRODUCTS: "products",
  CATEGORIES: "categories",
  ORDERS: "orders",
  USERS: "users",
  COUPONS: "coupons",
  COLORS: "colors",
  BADGES: "badges",
  HERO_SLIDES: "hero-slides",
  SETTINGS: "settings",
  REVIEWS: "reviews",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

/**
 * Revalidate a specific cache tag
 * Use this when data of a specific type changes (on-demand only)
 */
export function revalidateCache(tag: CacheTag | CacheTag[]) {
  try {
    if (Array.isArray(tag)) {
      tag.forEach((t) => revalidateTag(t, { expire: 0 }));
    } else {
      revalidateTag(tag, { expire: 0 });
    }
   // console.log(`[Cache] Revalidated tag(s): ${Array.isArray(tag) ? tag.join(", ") : tag}`);
  } catch (error) {
    console.error(`[Cache] Error revalidating tag(s):`, error);
  }
}

/**
 * Revalidate a specific path
 * Use this when a specific page needs to be regenerated
 */
export function revalidatePagePath(path: string) {
  try {
    revalidatePath(path);
    //console.log(`[Cache] Revalidated path: ${path}`);
  } catch (error) {
    console.error(`[Cache] Error revalidating path:`, error);
  }
}

/**
 * Revalidate product-related caches
 */
export function revalidateProducts() {
  revalidateCache(CACHE_TAGS.PRODUCTS);
  revalidatePagePath("/");
  revalidatePagePath("/allProducts");
}

/**
 * Revalidate category-related caches
 */
export function revalidateCategories() {
  revalidateCache(CACHE_TAGS.CATEGORIES);
  revalidatePagePath("/");
  revalidatePagePath("/allProducts");
}

/**
 * Revalidate order-related caches
 */
export function revalidateOrders() {
  revalidateCache(CACHE_TAGS.ORDERS);
  revalidatePagePath("/orders");
}

/**
 * Revalidate hero slides cache
 */
export function revalidateHeroSlides() {
  revalidateCache(CACHE_TAGS.HERO_SLIDES);
  revalidatePagePath("/");
}

/**
 * Revalidate settings cache
 */
export function revalidateSettings() {
  revalidateCache(CACHE_TAGS.SETTINGS);
}

/**
 * Revalidate all caches (use sparingly)
 */
export function revalidateAll() {
  Object.values(CACHE_TAGS).forEach((tag) => {
    try {
      revalidateTag(tag, { expire: 0 });
    } catch (error) {
      console.error(`[Cache] Error revalidating tag ${tag}:`, error);
    }
  });
  revalidatePath("/", "layout");
  //console.log("[Cache] Revalidated all caches");
}
