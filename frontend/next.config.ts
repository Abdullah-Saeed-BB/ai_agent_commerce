import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "*.pinggy-free.link", // Catch-all wildcard for future restarts
  ],
};

export default nextConfig;
