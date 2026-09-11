import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@andyyyds/shared", "@andyyyds/person"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2048mb",
    },
    proxyClientMaxBodySize: "2048mb",
  },
};

export default nextConfig;
