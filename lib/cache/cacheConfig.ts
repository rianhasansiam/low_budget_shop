// Cache configuration for different data types
// Data that changes frequently should have shorter cache times

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
} as const;

export type CacheKey = (typeof CACHE_KEYS)[keyof typeof CACHE_KEYS];

// Cache times in milliseconds
export const CACHE_TIMES = {
  // Static data - rarely changes (categories, colors, badges)
  STATIC: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  },
  // Semi-static data - changes occasionally (products)
  SEMI_STATIC: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },
  // Dynamic data - changes frequently (orders, user data)
  DYNAMIC: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
  // Real-time data - always fresh (cart, current user session)
  REALTIME: {
    staleTime: 0, // Always stale
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
} as const;

// Map cache keys to their cache times
export const CACHE_CONFIG: Record<CacheKey, typeof CACHE_TIMES[keyof typeof CACHE_TIMES]> = {
  [CACHE_KEYS.CATEGORIES]: CACHE_TIMES.STATIC,
  [CACHE_KEYS.COLORS]: CACHE_TIMES.STATIC,
  [CACHE_KEYS.BADGES]: CACHE_TIMES.STATIC,
  [CACHE_KEYS.HERO_SLIDES]: CACHE_TIMES.STATIC,
  [CACHE_KEYS.SETTINGS]: CACHE_TIMES.STATIC,
  [CACHE_KEYS.PRODUCTS]: CACHE_TIMES.SEMI_STATIC,
  [CACHE_KEYS.COUPONS]: CACHE_TIMES.SEMI_STATIC,
  [CACHE_KEYS.USERS]: CACHE_TIMES.DYNAMIC,
  [CACHE_KEYS.ORDERS]: CACHE_TIMES.DYNAMIC,
};

// Get cache config for a key
export function getCacheConfig(key: string) {
  return CACHE_CONFIG[key as CacheKey] || CACHE_TIMES.SEMI_STATIC;
}
