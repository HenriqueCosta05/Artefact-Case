import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query";
import superjson from "superjson";

// Shared by the server (one client per request) and the browser (one per tab).
export const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      // Data prefetched during SSR is fresh on arrival; without this the browser
      // would refetch immediately after hydration.
      queries: { staleTime: 30_000 },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
      hydrate: { deserializeData: superjson.deserialize },
    },
  });
