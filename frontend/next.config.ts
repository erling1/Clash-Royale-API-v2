import type { NextConfig } from "next";

const backendUrl = process.env.API_BASE_URL ?? "http://localhost:3000";

const config: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  images: {
    // Card art URLs are immutable, so optimized copies never need upstream
    // revalidation. 31 days keeps the cache warm across the burst-heavy
    // deck pages instead of re-fetching from the Supercell CDN every 60s.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api-assets.clashroyale.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default config;
