import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, set staleTime > 0 to avoid refetching immediately
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
        refetchOnWindowFocus: false, // POS terminals — avoid surprise refetches
      },
      mutations: {
        retry: 0, // Never auto-retry mutations — idempotency is explicit
      },
    },
  });
}

// Browser singleton
let browserClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server: always create a new client
    return makeQueryClient();
  }
  // Browser: reuse the same client
  if (!browserClient) browserClient = makeQueryClient();
  return browserClient;
}
