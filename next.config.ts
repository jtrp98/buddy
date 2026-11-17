import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    const secretPageHeaders = [
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, private" },
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
      { key: "X-Content-Type-Options", value: "nosniff" },
    ];
    return [
      { source: "/buddy", headers: secretPageHeaders },
      { source: "/me/profile", headers: secretPageHeaders },
      { source: "/verify", headers: secretPageHeaders },
    ];
  },
};

export default nextConfig;
