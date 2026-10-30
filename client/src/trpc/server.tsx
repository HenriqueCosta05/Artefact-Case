import "server-only";

import type { AppRouter } from "@artefactai/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";
import superjson from "superjson";
import { makeQueryClient } from "./query-client";

// One QueryClient per request: cache() scopes it to the current server render.
export const getQueryClient = cache(makeQueryClient);

// Server components talk to the tRPC server directly, skipping the browser-facing rewrite.
export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: process.env.TRPC_SERVER_URL ?? "http://localhost:4000/trpc",
        transformer: superjson,
      }),
    ],
  }),
  queryClient: getQueryClient,
});

// Ships everything prefetched during this render to the client components below it.
export const HydrateClient = ({ children }: { children: React.ReactNode }) => (
  <HydrationBoundary state={dehydrate(getQueryClient())}>{children}</HydrationBoundary>
);
