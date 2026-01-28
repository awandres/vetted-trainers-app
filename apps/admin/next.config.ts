import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@vt/ui", "@vt/db", "@vt/auth"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
