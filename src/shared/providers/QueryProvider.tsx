"use client";

import { HydrationBoundary } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { DehydratedState } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

import { getQueryClient } from "@/shared/lib/query-client";

type QueryProviderProps = PropsWithChildren<{
  dehydratedState?: DehydratedState;
}>;

export function QueryProvider(props: QueryProviderProps) {
  const { children, dehydratedState } = props;
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        {children}
      </HydrationBoundary>
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </QueryClientProvider>
  );
}
