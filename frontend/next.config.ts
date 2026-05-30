import type { NextConfig } from "next";

const backendUrl = process.env.API_BASE_URL ?? "http://localhost:3000";

const config: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
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
