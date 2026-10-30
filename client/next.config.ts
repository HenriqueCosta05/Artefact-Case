import path from "node:path";
import type { NextConfig } from "next";

// Where the tRPC server (server/ workspace) listens. Server components call it directly;
// the browser goes through the rewrite below, so the API needs no CORS and no public URL.
const TRPC_SERVER_URL = process.env.TRPC_SERVER_URL ?? "http://localhost:4000/trpc";

const nextConfig: NextConfig = {
  // Pin the workspace root: a stray lockfile higher up the disk would otherwise be picked.
  turbopack: { root: path.join(__dirname, "..") },
  outputFileTracingRoot: path.join(__dirname, ".."),
  async rewrites() {
    return [{ source: "/trpc/:path*", destination: `${TRPC_SERVER_URL}/:path*` }];
  },
};

export default nextConfig;
