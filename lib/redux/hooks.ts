import { useDispatch, useSelector, useStore } from 'react-redux';
import type { AppDispatch, AppStore, RootState } from './store';
import { useMemo } from 'react';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();

// Custom hook to get all products from Redux
export const useProducts = () => {
  const { items, loading, error, hasFetched } = useAppSelector((state) => state.products);
  return { products: items, loading, error, hasFetched };
};

// Custom hook to get featured products from Redux
export const useFeaturedProducts = () => {
  const { items, loading, error } = useAppSelector((state) => state.products);
  const featuredProducts = useMemo(() => items.filter((p) => p.featured), [items]);
  return { products: featuredProducts, loading, error };
};

// Custom hook to get a single product by ID from Redux
export const useProductById = (id: string) => {
  const { items, loading, error } = useAppSelector((state) => state.products);
  const product = useMemo(() => items.find((p) => p._id === id), [items, id]);
  return { product, loading, error };
};

// Custom hook to get products by category from Redux
export const useProductsByCategory = (category: string) => {
  const { items, loading, error } = useAppSelector((state) => state.products);
  const products = useMemo(
    () => items.filter((p) => p.category.toLowerCase() === category.toLowerCase()),
    [items, category]
  );
  return { products, loading, error };
};

// Custom hook to get all categories from Redux
export const useCategories = () => {
  const { items, loading, error, hasFetched } = useAppSelector((state) => state.categories);
  return { categories: items, loading, error, hasFetched };
};

// Custom hook to get a single category by ID from Redux
export const useCategoryById = (id: string) => {
  const { items, loading, error } = useAppSelector((state) => state.categories);
  const category = useMemo(() => items.find((c) => c._id === id), [items, id]);
  return { category, loading, error };
};

// Custom hook to get colors from Redux (for filters)
export const useColors = () => {
  const { colors, loading, error, hasFetched } = useAppSelector((state) => state.filters);
  return { colors, loading, error, hasFetched };
};

// Custom hook to get badges from Redux (for filters)
export const useBadges = () => {
  const { badges, loading, error, hasFetched } = useAppSelector((state) => state.filters);
  return { badges, loading, error, hasFetched };
};

// Custom hook to get all filter data from Redux
export const useFilters = () => {
  const { colors, badges, loading, error, hasFetched } = useAppSelector((state) => state.filters);
  return { colors, badges, loading, error, hasFetched };
};

// Custom hook to get all orders from Redux
export const useOrders = () => {
  const ordersState = useAppSelector((state) => state.orders);
  return { 
    orders: ordersState?.items || [], 
    loading: ordersState?.loading || false, 
    error: ordersState?.error || null, 
    hasFetched: ordersState?.hasFetched || false, 
    pagination: ordersState?.pagination || null 
  };
};

// Custom hook to get a single order by ID from Redux
export const useOrderById = (id: string) => {
  const ordersState = useAppSelector((state) => state.orders);
  const items = ordersState?.items || [];
  const order = useMemo(() => items.find((o) => o._id === id), [items, id]);
  return { order, loading: ordersState?.loading || false, error: ordersState?.error || null };
};

// Custom hook to get orders by status from Redux
export const useOrdersByStatus = (status: string) => {
  const ordersState = useAppSelector((state) => state.orders);
  const items = ordersState?.items || [];
  const orders = useMemo(
    () => items.filter((o) => o.status === status),
    [items, status]
  );
  return { orders, loading: ordersState?.loading || false, error: ordersState?.error || null };
};

// Custom hook to get selected order from Redux
export const useSelectedOrder = () => {
  const ordersState = useAppSelector((state) => state.orders);
  return { selectedOrder: ordersState?.selectedOrder || null };
};

// Custom hook to get wishlist from Redux
export const useWishlist = () => {
  const { items, totalItems } = useAppSelector((state) => state.wishlist);
  return { items, totalItems };
};

// Custom hook to check if item is in wishlist
export const useIsInWishlist = (id: string) => {
  const { items } = useAppSelector((state) => state.wishlist);
  return useMemo(() => items.some((item) => item.id === id), [items, id]);
};