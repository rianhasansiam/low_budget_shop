"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, createContext, useContext } from "react";
import { CACHE_TIMES } from "@/lib/cache/cacheConfig";

// Create context to expose queryClient for manual cache operations
const QueryClientContext = createContext<QueryClient | null>(null);

// Hook to access queryClient for manual cache operations
export function useQueryClientInstance() {
  const client = useContext(QueryClientContext);
  if (!client) {
    throw new Error("useQueryClientInstance must be used within QueryProvider");
  }
  return client;
}

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // On-demand revalidation - data stays fresh until manually invalidated
            staleTime: CACHE_TIMES.ON_DEMAND.staleTime,
            gcTime: CACHE_TIMES.ON_DEMAND.gcTime,
            // Don't refetch on window focus - we handle cache invalidation manually
            refetchOnWindowFocus: false,
            // Retry failed requests 2 times
            retry: 2,
            // Don't refetch when component mounts if data is fresh
            refetchOnMount: false,
            // Don't refetch on reconnect if data is fresh
            refetchOnReconnect: false,
          },
          mutations: {
            // Retry mutations once on failure
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientContext.Provider value={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </QueryClientContext.Provider>
  );
}
