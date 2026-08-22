import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {},
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Cloudflare R2 public URL — update with your actual domain
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.cloudflarestorage.com",
      },
    ],
  },
  // Expose R2 public URL to the client (non-secret)
  env: {
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL ?? "",
  },
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  clientsClaim: true,
  // Disable PWA in development to avoid service worker caching issues
  disable: process.env.NODE_ENV === "development",
  // Cache pages and assets
  runtimeCaching: [
    {
      // JS/CSS bundles — always revalidate from network first, very short cache
      urlPattern: /\/_next\/static\/.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "next-static",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60, // 1 hour max, always network-first
        },
        networkTimeoutSeconds: 3,
      },
    },
    {
      // Pages / API — network first, short TTL
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "attendsys-cache",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60, // 1 hour (was 24h)
        },
        networkTimeoutSeconds: 5,
      },
    },
  ],
});

export default pwaConfig(nextConfig as any);
