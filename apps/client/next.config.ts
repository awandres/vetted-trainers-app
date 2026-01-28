import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@vt/ui", "@vt/db", "@vt/auth"],
};

export default nextConfig;
