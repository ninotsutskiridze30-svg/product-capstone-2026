import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export let browserQueryClient: QueryClient | undefined;

function getBrowserQueryClient() {
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}

export function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }

  return getBrowserQueryClient();
}
