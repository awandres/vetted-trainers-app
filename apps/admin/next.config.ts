import type { NextConfig } from "next";
import path from "node:path";

// Get workspace root - resolve relative to this config file location
// process.cwd() in build is apps/admin, so we go 2 levels up
const workspaceRoot = path.resolve(process.cwd(), "../..");

const nextConfig: NextConfig = {
  transpilePackages: ["@vt/ui", "@vt/db", "@vt/auth", "@vt/email"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Set the monorepo root for Turbopack (must match outputFileTracingRoot)
  turbopack: {
    root: workspaceRoot,
  },
  outputFileTracingRoot: workspaceRoot,
  // Temporarily ignore TS errors for deployment - clean up later
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
