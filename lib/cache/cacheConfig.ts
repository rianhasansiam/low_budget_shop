// Cache configuration for different data types
// On-demand revalidation only - no time-based expiration

export const CACHE_KEYS = {
  PRODUCTS: "products",
  CATEGORIES: "categories",
  USERS: "users",
  ORDERS: "orders",
  COUPONS: "coupons",
  COLORS: "colors",
  BADGES: "badges",
  HERO_SLIDES: "hero-slides",
  SETTINGS: "settings",
  REVIEWS: "reviews",
} as const;

export type CacheKey = (typeof CACHE_KEYS)[keyof typeof CACHE_KEYS];

// Cache times - data stays fresh until explicitly invalidated
export const CACHE_TIMES = {
  // On-demand only - never auto-stale, invalidate manually
  ON_DEMAND: {
    staleTime: Infinity, // Never stale until invalidated
    gcTime: 60 * 60 * 1000, // Keep in memory for 1 hour
  },
} as const;

// All cache keys use on-demand revalidation
export const CACHE_CONFIG: Record<CacheKey, typeof CACHE_TIMES.ON_DEMAND> = {
  [CACHE_KEYS.CATEGORIES]: CACHE_TIMES.ON_DEMAND,
  [CACHE_KEYS.COLORS]: CACHE_TIMES.ON_DEMAND,
  [CACHE_KEYS.BADGES]: CACHE_TIMES.ON_DEMAND,
  [CACHE_KEYS.HERO_SLIDES]: CACHE_TIMES.ON_DEMAND,
  [CACHE_KEYS.SETTINGS]: CACHE_TIMES.ON_DEMAND,
  [CACHE_KEYS.PRODUCTS]: CACHE_TIMES.ON_DEMAND,
  [CACHE_KEYS.COUPONS]: CACHE_TIMES.ON_DEMAND,
  [CACHE_KEYS.USERS]: CACHE_TIMES.ON_DEMAND,
  [CACHE_KEYS.ORDERS]: CACHE_TIMES.ON_DEMAND,
  [CACHE_KEYS.REVIEWS]: CACHE_TIMES.ON_DEMAND,
};

// Get cache config for a key
export function getCacheConfig(key: string) {
  return CACHE_CONFIG[key as CacheKey] || CACHE_TIMES.ON_DEMAND;
}
