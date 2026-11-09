import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

/**
 * PWA: Workbox precaches the app shell + static assets; disables SW in dev to avoid stale caches.
 * Registration is injected when `register: true` (client-only — no SSR).
 */
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  scope: "/",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: false,
  fallbacks: {
    document: "/_offline",
  },
  workboxOptions: {
    disableDevLogs: true,
    navigateFallbackDenylist: [/^\/api\//],
  },
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);
